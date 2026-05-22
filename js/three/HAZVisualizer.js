import * as THREE from 'three';

// Heat-Affected Zone visualizer using a DataTexture on the workpiece emissiveMap
// Texture space: U = X position (-200 to +200mm), V = Z position (-120 to +120mm)

export class HAZVisualizer {
  constructor(workpieceGroup) {
    this._tex     = workpieceGroup.hazTex;
    this._data    = workpieceGroup.hazData;
    this._size    = workpieceGroup.hazTexSize;
    this._changed = false;

    // World bounds for UV mapping
    this._xMin = -200; this._xMax = 200;
    this._zMin = -120; this._zMax = 120;
  }

  applyHeat(position, heatInput) {
    if (heatInput <= 0) return;
    const u = (position.x - this._xMin) / (this._xMax - this._xMin);
    const v = (position.z - this._zMin) / (this._zMax - this._zMin);
    const px = Math.floor(u * this._size);
    const py = Math.floor(v * this._size);

    const sigma = 8 + heatInput * 20; // spread in pixels
    const radius = Math.ceil(sigma * 3);
    const intensity = Math.min(1.0, heatInput * 2);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = px + dx, ty = py + dy;
        if (tx < 0 || tx >= this._size || ty < 0 || ty >= this._size) continue;
        const distSq = dx * dx + dy * dy;
        const heat = intensity * Math.exp(-distSq / (2 * sigma * sigma));
        if (heat < 0.005) continue;
        const idx = (ty * this._size + tx) * 4;
        this._data[idx]     = Math.min(255, this._data[idx]     + heat * 255 * 1.5);
        this._data[idx + 1] = Math.min(255, this._data[idx + 1] + heat * 100);
        this._data[idx + 2] = Math.min(255, this._data[idx + 2] + heat * 20);
        this._data[idx + 3] = 255;
      }
    }
    this._changed = true;
  }

  cool(dt) {
    // Decay all pixels toward zero each frame
    const decayRate = 1 - dt * 0.8; // adjustable cooling speed
    let anyHeat = false;
    for (let i = 0; i < this._data.length; i += 4) {
      if (this._data[i] > 1 || this._data[i + 1] > 1) {
        this._data[i]     = Math.max(0, this._data[i]     * decayRate);
        this._data[i + 1] = Math.max(0, this._data[i + 1] * decayRate);
        this._data[i + 2] = Math.max(0, this._data[i + 2] * decayRate);
        anyHeat = true;
      }
    }
    if (anyHeat) this._changed = true;
  }

  flush() {
    if (this._changed) {
      this._tex.needsUpdate = true;
      this._changed = false;
    }
  }
}
