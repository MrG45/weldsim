import * as THREE from 'three';

const POOL_SIZE   = 3000;
const SPARK_RATE  = 90;   // per second (normal)
const SPARK_RATE_SHORT = 200; // when arc is very short

// Simple pooled particle system using THREE.Points
export class ParticleSystem {
  constructor(scene) {
    this._positions  = new Float32Array(POOL_SIZE * 3);
    this._velocities = new Float32Array(POOL_SIZE * 3); // vx, vy, vz
    this._lifetimes  = new Float32Array(POOL_SIZE);     // current life
    this._maxLife    = new Float32Array(POOL_SIZE);     // max life
    this._types      = new Uint8Array(POOL_SIZE);       // 0=spark, 1=spatter, 2=smoke
    this._sizes      = new Float32Array(POOL_SIZE);
    this._colors     = new Float32Array(POOL_SIZE * 3);
    this._active     = new Uint8Array(POOL_SIZE);

    this._nextSlot  = 0;
    this._emitAccum = { spark: 0, smoke: 0, spatter: 0 };

    // Main particles geometry
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this._positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(this._colors,    3));
    const sizeArr = new Float32Array(POOL_SIZE).fill(0);
    geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));

    // Circular glow sprite — radial gradient from white core to transparent edge
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteCanvas.height = 64;
    const sc = spriteCanvas.getContext('2d');
    const g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,220,120,0.9)');
    g.addColorStop(0.6,  'rgba(255,100,20,0.4)');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    sc.fillStyle = g;
    sc.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(spriteCanvas);

    const mat = new THREE.PointsMaterial({
      size: 10,
      map: spriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      alphaTest: 0.005,
    });

    this._points = new THREE.Points(geo, mat);
    this._geo = geo;
    scene.add(this._points);
  }

  emit(position, quality, heatInput, arcLength, arcLengthOptimal) {
    const tooShort = arcLength < (arcLengthOptimal?.min ?? 4) * 0.6;

    const sparkRate = tooShort ? SPARK_RATE_SHORT : SPARK_RATE;
    this._emitAccum.spark   += sparkRate * 0.016;
    this._emitAccum.smoke   += 5 * 0.016;
    this._emitAccum.spatter += (1 - quality) * 20 * 0.016;

    while (this._emitAccum.spark >= 1) {
      this._emitAccum.spark--;
      this._spawn(position, 0); // spark
    }
    while (this._emitAccum.smoke >= 1) {
      this._emitAccum.smoke--;
      this._spawn(position, 2); // smoke
    }
    while (this._emitAccum.spatter >= 1) {
      this._emitAccum.spatter--;
      this._spawn(position, 1); // spatter
    }
  }

  _spawn(origin, type) {
    const i = this._findSlot();
    if (i < 0) return;

    this._active[i] = 1;
    this._types[i]  = type;

    const pi = i * 3;
    this._positions[pi]     = origin.x;
    this._positions[pi + 1] = origin.y;
    this._positions[pi + 2] = origin.z;

    const vi = i * 3;
    if (type === 0) { // spark
      const speed = 180 + Math.random() * 420;
      const theta = Math.random() * Math.PI * 2;
      // Wide hemisphere — sparks radiate outward in all directions from the arc
      const phi   = Math.random() * Math.PI * 0.75;
      this._velocities[vi]     = Math.cos(theta) * Math.sin(phi) * speed;
      this._velocities[vi + 1] = Math.cos(phi) * speed + 120;  // less upward bias → wider spread
      this._velocities[vi + 2] = Math.sin(theta) * Math.sin(phi) * speed;
      this._maxLife[i]  = 0.3 + Math.random() * 0.6;
      this._sizes[i]    = 3.5 + Math.random() * 5;
      const ci = i * 3;
      // Vary spark color: white-hot core to orange/amber
      const bright = 0.85 + Math.random() * 0.15;
      this._colors[ci]     = bright;
      this._colors[ci + 1] = (0.55 + Math.random() * 0.35) * bright;
      this._colors[ci + 2] = Math.random() * 0.15 * bright;

    } else if (type === 1) { // spatter
      const speed = 80 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.5;
      this._velocities[vi]     = Math.cos(theta) * Math.sin(phi) * speed;
      this._velocities[vi + 1] = Math.cos(phi) * speed * 0.7 + 50;
      this._velocities[vi + 2] = Math.sin(theta) * Math.sin(phi) * speed;
      this._maxLife[i]  = 0.2 + Math.random() * 0.3;
      this._sizes[i]    = 3 + Math.random() * 3;
      const ci = i * 3;
      this._colors[ci] = 1; this._colors[ci + 1] = 0.27; this._colors[ci + 2] = 0;

    } else { // smoke
      this._velocities[vi]     = (Math.random() - 0.5) * 15;
      this._velocities[vi + 1] = 40 + Math.random() * 60;
      this._velocities[vi + 2] = (Math.random() - 0.5) * 15;
      this._maxLife[i]  = 1.5 + Math.random() * 2.5;
      this._sizes[i]    = 8 + Math.random() * 20;
      const ci = i * 3;
      this._colors[ci] = 0.4; this._colors[ci + 1] = 0.4; this._colors[ci + 2] = 0.45;
    }

    this._lifetimes[i] = 0;
  }

  _findSlot() {
    for (let tries = 0; tries < POOL_SIZE; tries++) {
      const i = (this._nextSlot++) % POOL_SIZE;
      if (!this._active[i]) return i;
    }
    // All active — steal oldest
    return this._nextSlot % POOL_SIZE;
  }

  update(dt) {
    const g = -980; // gravity mm/s²
    const sizes = this._geo.attributes.size?.array;

    for (let i = 0; i < POOL_SIZE; i++) {
      if (!this._active[i]) continue;

      this._lifetimes[i] += dt;
      if (this._lifetimes[i] >= this._maxLife[i]) {
        this._active[i] = 0;
        const pi = i * 3;
        this._positions[pi + 1] = -99999; // move off-screen
        continue;
      }

      const t   = this._lifetimes[i] / this._maxLife[i]; // 0–1
      const pi  = i * 3;
      const vi  = i * 3;
      const ci  = i * 3;
      const typ = this._types[i];

      if (typ !== 2) { // sparks and spatter have gravity
        this._velocities[vi + 1] += g * dt;
      }

      this._positions[pi]     += this._velocities[vi]     * dt;
      this._positions[pi + 1] += this._velocities[vi + 1] * dt;
      this._positions[pi + 2] += this._velocities[vi + 2] * dt;

      // Bounce sparks off floor (Y ≈ -120 = table surface)
      if (typ === 0 && this._positions[pi + 1] < -110) {
        this._positions[pi + 1] = -110;
        this._velocities[vi + 1] = Math.abs(this._velocities[vi + 1]) * 0.2;
      }

      // Fade colors over time
      if (typ === 0) { // spark fades orange → dark
        const fade = 1 - t;
        this._colors[ci]     = fade;
        this._colors[ci + 1] = 0.4 * fade;
        this._colors[ci + 2] = 0.1 * fade;
      } else if (typ === 2) { // smoke fades in then out
        const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
        this._colors[ci]     = 0.3 * alpha;
        this._colors[ci + 1] = 0.3 * alpha;
        this._colors[ci + 2] = 0.35 * alpha;
      }
    }

    this._geo.attributes.position.needsUpdate = true;
    this._geo.attributes.color.needsUpdate    = true;
  }
}
