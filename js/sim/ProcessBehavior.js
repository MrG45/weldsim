// Per-process behaviors that modify base simulation parameters each frame

export class ProcessBehavior {
  constructor(processConfig) {
    this.config = processConfig;

    // Stick electrode burn-down
    this.stickoutOffset = 0;    // extra mm added to measured arc length
    this.electrodeLength = 350; // mm remaining
    this.isElectrodeSpent = false;

    // TIG filler
    this.fillerAccum = 0;

    // Cooling tick timer
    this._coolTickTimer = 0;

    // Arc strike state (Stick)
    this.arcStruck = false;
  }

  // Called every frame while arc is ON, returns modified params object
  update(rawParams, dt, hud) {
    const params = { ...rawParams };

    switch (this.config.id) {
      case 'STICK': this._updateStick(params, dt, hud); break;
      case 'TIG':   this._updateTIG(params, dt, hud);   break;
      case 'MIG':   this._updateMIG(params, dt, hud);   break;
      case 'FCAW':  this._updateFCAW(params, dt, hud);  break;
    }

    this._applyArcStability(params);

    // Effective amperage (TIG uses pedal factor)
    params.effectiveAmps = params.amps * (params.pedalFactor ?? 1.0);

    return params;
  }

  _updateStick(params, dt, hud) {
    // Check arc strike (must be close enough to base metal)
    if (!this.arcStruck) {
      if (params.arcLength <= this.config.strikeDistance) {
        this.arcStruck = true;
      } else {
        // Arc not struck yet - cancel arc
        params.arcOn = false;
        params.arcStrikeAttempted = true;
        return;
      }
    }

    // Electrode burns down at burnRate mm/min
    if (params.arcOn) {
      const burnMM = (this.config.burnRate / 60) * dt;
      this.electrodeLength = Math.max(0, this.electrodeLength - burnMM);
      this.stickoutOffset += burnMM; // effective arc length grows if user doesn't compensate

      // Apply offset to arc length (user must lower torch)
      params.arcLength = params.arcLength + this.stickoutOffset;

      if (this.electrodeLength <= 50 && !this._warnedElectrode) {
        this._warnedElectrode = true;
        this._flashWarning('Replace electrode soon (~50mm left)');
      }

      if (this.electrodeLength <= 5) {
        this.isElectrodeSpent = true;
        params.arcOn = false;
      }
    }

    // User lowering torch compensates for burn-down
    // (stickoutOffset decremented if raw arc length is reducing)
    const rawArc = params.arcLength - this.stickoutOffset;
    if (rawArc < params.arcLength - 1) {
      this.stickoutOffset = Math.max(0, this.stickoutOffset - (params.arcLength - rawArc - 1));
    }
  }

  _updateTIG(params, dt, hud) {
    // Scroll wheel controls pedal factor (already in params.pedalFactor from TorchController)
    // Filler rod: each press of Q adds fillerFeedRate mm
    this.fillerAccum = params.fillerAmount;

    // If no filler is being fed, bead will be narrower/thinner
    // This is signaled via params.fillerRate
    params.fillerRate = this.fillerAccum > 0 ? Math.min(1, this.fillerAccum / 50) : 0;
    if (params.fillerRate === 0) {
      params.beadWidthMult = 0.5;  // thin autogenous bead
    }
  }

  _updateMIG(params, dt, hud) {
    // Voltage trims true arc length: more voltage lengthens the arc, too little crowds it.
    const voltageTrim = (params.volts - this.config.voltageDefault) * 0.16;
    params.arcLength = Math.max(0.4, params.arcLength + voltageTrim);
  }

  _updateFCAW(params, dt, hud) {
    // FCAW must use drag technique; warning is handled in HUDController
    // Wind doesn't affect FCAW (self-shielded), so windFactor is always low
    params.windFactor = 0.0;
    const voltageTrim = (params.volts - this.config.voltageDefault) * 0.14;
    params.arcLength = Math.max(0.5, params.arcLength + voltageTrim);
  }

  _applyArcStability(params) {
    if (!params.arcOn) return;

    const startDistance = this.config.arcStartDistance ?? this.config.strikeDistance ?? this.config.maxLiveArcLength;
    const maxLive = this.config.maxLiveArcLength ?? startDistance * 1.5;

    if (params.arcLength > maxLive || params.arcLength > startDistance * 1.6) {
      params.arcOn = false;
      params.arcLost = true;
      if (this.config.id === 'STICK') this.arcStruck = false;
    }

    if (params.arcLength < 0.7) {
      params.contact = true;
      if (this.config.id === 'TIG') params.tungstenDipped = true;
    }
  }

  // Reset for a new weld
  reset() {
    this.stickoutOffset = 0;
    this.electrodeLength = 350;
    this.isElectrodeSpent = false;
    this.arcStruck = (this.config.id !== 'STICK'); // TIG/MIG/FCAW auto-strike
    this.fillerAccum = 0;
    this._warnedElectrode = false;
  }

  _flashWarning(msg) {
    const el = document.getElementById('warning-banner');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
  }

  // Electrode length remaining (for visual update)
  get electrodeRemaining() { return this.electrodeLength; }
}
