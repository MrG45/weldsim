// Web Audio API synthesized sounds — no external files needed

export class AudioEngine {
  constructor() {
    this._ctx       = null;
    this._arcGain   = null;
    this._arcFilter = null;
    this._noiseNode = null;
    this._crackleOsc = null;
    this._ambGain   = null;
    this._ready     = false;
  }

  // Must be called on first user gesture (browser autoplay policy)
  init() {
    if (this._ready) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._buildArcCrackle();
      this._buildAmbient();
      this._ready = true;
    } catch (e) {
      console.warn('AudioEngine: Web Audio not available', e);
    }
  }

  _buildArcCrackle() {
    const ctx = this._ctx;

    // White noise buffer (2 seconds, looping)
    const bufSec  = 2;
    const bufSize = ctx.sampleRate * bufSec;
    const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    this._noiseNode = ctx.createBufferSource();
    this._noiseNode.buffer = buffer;
    this._noiseNode.loop = true;
    this._noiseNode.start();

    // Bandpass for arc crackle character
    this._arcFilter = ctx.createBiquadFilter();
    this._arcFilter.type = 'bandpass';
    this._arcFilter.frequency.value = 3000;
    this._arcFilter.Q.value = 1.5;

    // Low-frequency crackle modulator (makes it sound less uniform)
    this._crackleOsc = ctx.createOscillator();
    this._crackleOsc.frequency.value = 55;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.25;
    this._crackleOsc.start();
    this._crackleOsc.connect(crackleGain);

    // Arc gain node (master on/off)
    this._arcGain = ctx.createGain();
    this._arcGain.gain.value = 0;

    // High-frequency buzz layered in
    const buzzOsc = ctx.createOscillator();
    buzzOsc.frequency.value = 120;
    buzzOsc.type = 'sawtooth';
    const buzzGain = ctx.createGain();
    buzzGain.gain.value = 0.05;
    buzzOsc.start();
    buzzOsc.connect(buzzGain);

    this._noiseNode.connect(this._arcFilter);
    this._arcFilter.connect(this._arcGain);
    crackleGain.connect(this._arcGain);
    buzzGain.connect(this._arcGain);
    this._arcGain.connect(ctx.destination);
  }

  _buildAmbient() {
    const ctx = this._ctx;

    // Very soft shop hum (low-pass noise)
    const bufSize = ctx.sampleRate * 3;
    const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

    const hum = ctx.createBufferSource();
    hum.buffer = buffer;
    hum.loop = true;
    hum.start();

    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.value = 200;

    this._ambGain = ctx.createGain();
    this._ambGain.gain.value = 0.04;

    hum.connect(lpFilter);
    lpFilter.connect(this._ambGain);
    this._ambGain.connect(ctx.destination);
  }

  // Called every frame with current weld parameters
  update(arcLength, arcLengthOptimal, arcOn, quality) {
    if (!this._ready) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    if (!arcOn) {
      this._arcGain.gain.setTargetAtTime(0, now, 0.08);
      return;
    }

    const { min, max } = arcLengthOptimal;
    const center = (min + max) / 2;
    const deviation = Math.abs(arcLength - center) / center;

    // Volume peaks at optimal arc length
    const volume = Math.max(0.05, 0.7 - deviation * 0.3) * (0.9 + quality * 0.1);
    this._arcGain.gain.setTargetAtTime(volume, now, 0.03);

    // Frequency: short arc = high/harsh, long = low/soft
    let freq;
    if (arcLength < min) {
      freq = 4000 + (min - arcLength) * 200; // angry hiss
    } else if (arcLength > max) {
      freq = Math.max(1200, 3000 - (arcLength - max) * 100); // hum
    } else {
      freq = 2500 + quality * 500; // steady crackle, better at quality
    }
    this._arcFilter.frequency.setTargetAtTime(freq, now, 0.1);

    // Crackle rate correlates with spatter/quality
    if (this._crackleOsc) {
      this._crackleOsc.frequency.setTargetAtTime(50 + (1 - quality) * 60, now, 0.1);
    }
  }

  // Fire a short spatter click sound
  spatterClick() {
    if (!this._ready) return;
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = 600 + Math.random() * 400;
    osc.type = 'sine';
    env.gain.setValueAtTime(0.3, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Metallic cooling tick
  coolingTick() {
    if (!this._ready) return;
    const ctx = this._ctx;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = 700 + Math.random() * 300;
    osc.type = 'sine';
    env.gain.setValueAtTime(0.15, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  destroy() {
    if (this._ctx) {
      this._ctx.close();
      this._ctx = null;
      this._ready = false;
    }
  }
}
