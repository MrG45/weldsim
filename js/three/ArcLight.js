import * as THREE from 'three';

export class ArcLight {
  constructor(torchMesh) {
    this.torchMesh = torchMesh;
    this._light    = torchMesh.getObjectByName('arcLight');
    this._glow     = torchMesh.getObjectByName('glowDisc');
    this._core     = torchMesh.getObjectByName('glowCore');
    this._isOn = false;
    this._t = 0;
  }

  update(torchState, camera, quality) {
    this._t += 0.08;

    if (!torchState.arcOn) {
      this._fadeOut();
      return;
    }

    const arcLen = torchState.arcLength;
    const optLow  = 3;  // generic safe short threshold
    const optHigh = 15; // generic safe long threshold

    // Intensity flicker: stronger at shorter arc (kept low to avoid ACES overexposure)
    const flicker = Math.sin(this._t * 3.7) * 0.15 + Math.sin(this._t * 7.3) * 0.1;
    const baseIntensity = 3 + (1 - Math.min(1, arcLen / 20)) * 3;
    this._light.intensity = Math.max(0, baseIntensity * (1 + flicker));

    // Color: blue-white for correct arc, orange-yellow for too long
    const longness = Math.max(0, (arcLen - optHigh) / 20);
    const r = 0.53 + longness * 0.4;
    const g = 0.67 + longness * 0.1;
    const b = 1.0  - longness * 0.7;
    this._light.color.setRGB(r, g, b);
    this._light.distance = 600 + arcLen * 10;

    // Glow disc faces camera
    const glowPos = this.torchMesh.localToWorld(new THREE.Vector3(0, 0, 0));
    this._glow.lookAt(camera.position);
    this._core.lookAt(camera.position);

    // Glow opacity: max at optimal arc, less when too long or too short
    const arcDev = Math.abs(arcLen - ((optLow + optHigh) / 2)) / optHigh;
    const glowAlpha = Math.max(0.1, 0.9 - arcDev * 0.7) * (0.85 + flicker * 0.15);
    this._glow.material.opacity = glowAlpha;
    this._glow.material.color.setRGB(r * 0.6, g * 0.7, b);
    this._core.material.opacity = Math.min(1, glowAlpha * 1.5);

    // Scale glow with arc length (longer arc = bigger diffuse glow)
    const glowScale = 1 + arcLen * 0.05;
    this._glow.scale.setScalar(glowScale);
    this._isOn = true;
  }

  _fadeOut() {
    this._light.intensity *= 0.7;
    if (this._light.intensity < 0.05) this._light.intensity = 0;
    this._glow.material.opacity *= 0.6;
    this._core.material.opacity *= 0.6;
    this._isOn = false;
  }

  get isOn() { return this._isOn; }
}
