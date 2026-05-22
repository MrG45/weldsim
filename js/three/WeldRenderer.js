import * as THREE from 'three';
import { beadCrossSection, beadColor } from '../sim/BeadGeometry.js';

const PROFILE_VERTS = 9;       // vertices per cross-section (N+1 where N=8)
const SAMPLE_INTERVAL = 60;    // ms between samples
const MIN_MOVE_DIST = 1;       // mm minimum movement to add sample

export class WeldRenderer {
  constructor(scene) {
    this.scene = scene;
    this.samples = [];
    this._lastSampleTime = 0;
    this._lastSamplePos = null;

    // Pre-build geometry (grows dynamically)
    this._geo = new THREE.BufferGeometry();
    this._mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.35,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });
    this._mesh = new THREE.Mesh(this._geo, this._mat);
    this._mesh.castShadow = true;
    this._mesh.receiveShadow = true;
    this._mesh.name = 'weldBead';
    scene.add(this._mesh);
  }

  addSample(position, quality, heatInput, processConfig) {
    const now = performance.now();
    if (now - this._lastSampleTime < SAMPLE_INTERVAL) return;
    if (this._lastSamplePos && this._lastSamplePos.distanceTo(position) < MIN_MOVE_DIST) return;

    const crossSection = beadCrossSection(quality, heatInput, processConfig);
    this.samples.push({
      position: position.clone(),
      crossSection,
      quality,
      time: Date.now(),
    });

    this._lastSampleTime = now;
    this._lastSamplePos = position.clone();

    if (this.samples.length >= 2) {
      this._rebuild();
    }
  }

  update() {
    // Refresh vertex colors for cooling effect
    if (this.samples.length < 2) return;
    const colors = this._geo.attributes.color;
    if (!colors) return;

    const now = Date.now();
    let idx = 0;
    for (const sample of this.samples) {
      const age = (now - sample.time) / 1000;
      const col = beadColor(age);
      for (let p = 0; p < PROFILE_VERTS; p++) {
        colors.setXYZ(idx++, col.r, col.g, col.b);
      }
    }
    colors.needsUpdate = true;
  }

  _rebuild() {
    const s = this.samples;
    const numSamples = s.length;
    const numVerts = numSamples * PROFILE_VERTS;
    const numQuads = (numSamples - 1) * (PROFILE_VERTS - 1);
    const numIndices = numQuads * 6;

    const positions = new Float32Array(numVerts * 3);
    const colors    = new Float32Array(numVerts * 3);
    const normals   = new Float32Array(numVerts * 3);
    const indices   = new Uint32Array(numIndices);

    const up = new THREE.Vector3(0, 1, 0);
    const _tangent   = new THREE.Vector3();
    const _binormal  = new THREE.Vector3();
    const _beadNorm  = new THREE.Vector3();

    const now = Date.now();

    for (let si = 0; si < numSamples; si++) {
      const sample = s[si];
      const age = (now - sample.time) / 1000;
      const col = beadColor(age);

      // Compute local frame at this sample
      if (si < numSamples - 1) {
        _tangent.subVectors(s[si + 1].position, sample.position).normalize();
      } else {
        _tangent.subVectors(sample.position, s[si - 1].position).normalize();
      }

      _binormal.crossVectors(_tangent, up).normalize();
      if (_binormal.lengthSq() < 0.001) {
        _binormal.set(1, 0, 0); // fallback if tangent == up
      }
      _beadNorm.crossVectors(_binormal, _tangent).normalize();

      for (let pi = 0; pi < PROFILE_VERTS; pi++) {
        const pt = sample.crossSection[pi];
        const vi = (si * PROFILE_VERTS + pi) * 3;

        // World position: base + lateral offset + normal offset
        const wx = sample.position.x + _binormal.x * pt.x + _beadNorm.x * pt.y;
        const wy = sample.position.y + _binormal.y * pt.x + _beadNorm.y * pt.y;
        const wz = sample.position.z + _binormal.z * pt.x + _beadNorm.z * pt.y;

        positions[vi]     = wx;
        positions[vi + 1] = wy;
        positions[vi + 2] = wz;

        colors[vi]     = col.r;
        colors[vi + 1] = col.g;
        colors[vi + 2] = col.b;

        normals[vi]     = _beadNorm.x;
        normals[vi + 1] = _beadNorm.y;
        normals[vi + 2] = _beadNorm.z;
      }
    }

    // Build quad indices
    let ii = 0;
    for (let si = 0; si < numSamples - 1; si++) {
      for (let pi = 0; pi < PROFILE_VERTS - 1; pi++) {
        const a = si * PROFILE_VERTS + pi;
        const b = si * PROFILE_VERTS + pi + 1;
        const c = (si + 1) * PROFILE_VERTS + pi;
        const d = (si + 1) * PROFILE_VERTS + pi + 1;
        indices[ii++] = a; indices[ii++] = c; indices[ii++] = b;
        indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
      }
    }

    this._geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    this._geo.setAttribute('normal',   new THREE.BufferAttribute(normals,   3));
    this._geo.setIndex(new THREE.BufferAttribute(indices, 1));
    this._geo.computeVertexNormals();
    this._geo.attributes.position.needsUpdate = true;
    this._geo.attributes.color.needsUpdate    = true;
  }

  clear() {
    this.samples = [];
    this._geo.dispose();
    this._geo = new THREE.BufferGeometry();
    this._mesh.geometry = this._geo;
    this._lastSamplePos = null;
  }

  getSamples() { return this.samples; }
}
