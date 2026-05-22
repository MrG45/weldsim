import * as THREE from 'three';

// Converts mouse/keyboard input into 3D torch state
// Emits a state object consumed by WeldingScreen each frame

const ARC_HEIGHT_MIN = 0.5;   // mm min above surface
const ARC_HEIGHT_MAX = 30;    // mm max arc length
const ARC_HEIGHT_DEFAULT = 25; // start far away — player must lower mouse to strike arc

// Simplified controls:
//   Mouse LEFT / RIGHT  → position along the weld joint (world X)
//   Mouse UP   / DOWN   → arc height (how close the torch is to the metal)
//   LMB held            → arc on
//   Scroll wheel        → fine arc height (or TIG foot pedal)
//   A / D               → work angle  |  W / S → travel angle  |  Q → TIG filler

export class TorchController {
  constructor(camera, scene, processId) {
    this.camera = camera;
    this.processId = processId;

    // Current state
    this.position = new THREE.Vector3(0, ARC_HEIGHT_DEFAULT, 0);
    this.arcOn = false;
    this.workAngle = 90;   // degrees
    this.travelAngle = 15; // degrees (push/drag)
    this.arcHeight = ARC_HEIGHT_DEFAULT;
    this.fillerAmount = 0;

    // Foot pedal (TIG scroll)
    this.pedalFactor = 1.0; // 0.3–1.5×

    // Delta-based mouse movement
    this._torchX = 0;
    this._pendingDX       = 0;
    this._pendingDY       = 0;
    this._torchXSmooth    = 0;
    this._arcHeightSmooth = ARC_HEIGHT_DEFAULT;

    // Movement tracking for travel speed
    this._lastPosition = new THREE.Vector3();
    this._travelSpeed = 0;
    this._speedBuffer = [];

    // Key states
    this._keys = {};

    this._bindEvents();
  }

  _bindEvents() {
    const canvas = document.getElementById('weld-canvas');

    canvas.addEventListener('mousemove', e => {
      // Cap per-event delta to avoid jump when cursor re-enters window
      this._pendingDX += Math.max(-80, Math.min(80, e.movementX));
      this._pendingDY += Math.max(-80, Math.min(80, e.movementY));
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.arcOn = true;
        canvas.requestPointerLock();
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) {
        this.arcOn = false;
        if (document.pointerLockElement === canvas) document.exitPointerLock();
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (document.pointerLockElement !== canvas) this.arcOn = false;
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== canvas) this.arcOn = false;
    });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (this.processId === 'TIG') {
        // Scroll = foot pedal for TIG
        this.pedalFactor = Math.max(0.3, Math.min(1.5, this.pedalFactor - e.deltaY * 0.001));
      } else {
        // Scroll = fine arc length control
        this.arcHeight = Math.max(ARC_HEIGHT_MIN, Math.min(ARC_HEIGHT_MAX,
          this.arcHeight + e.deltaY * 0.05));
      }
    }, { passive: false });

    window.addEventListener('keydown', e => { this._keys[e.code] = true; });
    window.addEventListener('keyup',   e => { this._keys[e.code] = false; });
  }

  update(dt) {
    // Key-based angle control
    if (this._keys['KeyA']) this.workAngle = Math.max(60, this.workAngle - 40 * dt);
    if (this._keys['KeyD']) this.workAngle = Math.min(120, this.workAngle + 40 * dt);
    if (this._keys['KeyW']) this.travelAngle = Math.min(45, this.travelAngle + 30 * dt);
    if (this._keys['KeyS']) this.travelAngle = Math.max(-10, this.travelAngle - 30 * dt);

    // TIG filler rod
    if (this.processId === 'TIG') {
      if (this._keys['KeyQ']) this.fillerAmount += 4 * dt;
    }

    // Sensitivity: exponential scale so every step feels different
    // sens 1 = 0.15 mm/px, sens 10 = 1.5 mm/px (10× range)
    const sens = parseInt(document.getElementById('ctrl-sensitivity')?.value ?? 5);
    const mmPerPx = 0.15 * Math.pow(10, (sens - 1) / 9);

    this._torchX = Math.max(-210, Math.min(210,
      this._torchX + this._pendingDX * mmPerPx));
    this.arcHeight = Math.max(ARC_HEIGHT_MIN, Math.min(ARC_HEIGHT_MAX,
      this.arcHeight - this._pendingDY * mmPerPx * 0.5));

    this._pendingDX = 0;
    this._pendingDY = 0;

    // Fast lerp for smooth visuals (independent of sensitivity)
    const lerpT = Math.min(1, 20 * dt);
    this._torchXSmooth    += (this._torchX    - this._torchXSmooth)    * lerpT;
    this._arcHeightSmooth += (this.arcHeight  - this._arcHeightSmooth) * lerpT;

    // Build torch position: smoothed X, smoothed arc height, Z locked to joint line
    const target = new THREE.Vector3(
      Math.max(-180, Math.min(180, this._torchXSmooth)),
      this._arcHeightSmooth,
      0   // always on the weld joint centre line
    );

    // Compute travel speed (mm/min)
    const dist = this._lastPosition.distanceTo(target);
    const rawSpeed = (dist / dt) * 60;

    this._speedBuffer.push(rawSpeed);
    if (this._speedBuffer.length > 8) this._speedBuffer.shift();
    this._travelSpeed = this._speedBuffer.reduce((a, b) => a + b, 0) / this._speedBuffer.length;

    this._lastPosition.copy(target);
    this.position.copy(target);

    return this._buildState();
  }

  _buildState() {
    return {
      position:     this.position.clone(),
      arcOn:        this.arcOn,
      arcLength:    this._arcHeightSmooth, // use smoothed value so HUD/scoring match visuals
      workAngle:    this.workAngle,
      travelAngle:  this.travelAngle,
      travelSpeed:  this._travelSpeed,
      pedalFactor:  this.pedalFactor,
      fillerAmount: this.fillerAmount,
    };
  }

  // Called by WeldingScreen to apply electrode burn-down offset (Stick)
  applyElectrodeOffset(mm) {
    this.arcHeight = Math.min(ARC_HEIGHT_MAX, this.arcHeight + mm);
  }

  destroy() {
    // Event listeners attached to canvas/window are cleaned up by WeldingScreen
    // when it replaces the canvas
  }
}
