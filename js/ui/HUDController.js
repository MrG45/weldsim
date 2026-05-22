import { PROCESSES } from '../data/processes.js';
import { gradeFromScore } from '../sim/WeldPhysics.js';

export class HUDController {
  constructor() {
    // Left gauges
    this._arcNeedle    = document.getElementById('needle-arc');
    this._valArc       = document.getElementById('val-arc');
    this._barSpeed     = document.getElementById('bar-speed');
    this._valSpeed     = document.getElementById('val-speed');
    this._needleWork   = document.getElementById('needle-work');
    this._valWork      = document.getElementById('val-work-angle');
    this._needleTravel = document.getElementById('needle-travel');
    this._valTravel    = document.getElementById('val-travel-angle');

    // Status bar elements
    this._sbProcessName = document.getElementById('sb-process-name');
    this._sbValHeat     = document.getElementById('sb-val-heat');
    this._sbHeatRange   = document.getElementById('sb-heat-range');
    this._sbHeatBar     = document.getElementById('sb-heat-bar');
    this._sbValQuality  = document.getElementById('sb-val-quality');
    this._sbQualityBar  = document.getElementById('sb-quality-bar');
    this._sbValWire     = document.getElementById('sb-val-wire');
    this._sbValGas      = document.getElementById('sb-val-gas');
    this._sbWireSection = document.getElementById('sb-wire-section');
    this._sbWireSep     = document.getElementById('sb-wire-sep');
    this._sbGasSep      = document.getElementById('sb-gas-sep');
    this._sbGasSection  = document.getElementById('sb-gas-section');
    this._sbValAmps     = document.getElementById('sb-val-amps');
    this._sbValVolts    = document.getElementById('sb-val-volts');

    // Pass progress
    this._passTorchDot  = document.getElementById('pass-torch-dot');

    // Warning banner
    this._warning = document.getElementById('warning-banner');

    // Sliders (now in status bar)
    this._ctrlAmps        = document.getElementById('ctrl-amps');
    this._ctrlVolts       = document.getElementById('ctrl-volts');
    this._ctrlSensitivity = document.getElementById('ctrl-sensitivity');
    this._valSensitivity  = document.getElementById('val-sensitivity');

    // Ideal heat range (updated per process)
    this._heatIdealMin = 0.8;
    this._heatIdealMax = 1.5;
    this._weldRange = { min: -260, max: 260 };

    this._warningTimer = 0;
    this._lastWarning  = '';

    // Slider input events
    if (this._ctrlAmps) {
      this._ctrlAmps.addEventListener('input', () => {
        if (this._sbValAmps) this._sbValAmps.textContent = this._ctrlAmps.value + ' A';
        this._updateDerivedValues();
      });
    }
    if (this._ctrlVolts) {
      this._ctrlVolts.addEventListener('input', () => {
        if (this._sbValVolts) this._sbValVolts.textContent = this._ctrlVolts.value + ' V';
      });
    }
    if (this._ctrlSensitivity) {
      this._ctrlSensitivity.addEventListener('input', () => {
        if (this._valSensitivity) this._valSensitivity.textContent = this._ctrlSensitivity.value;
        localStorage.setItem('weldsim_sensitivity', this._ctrlSensitivity.value);
      });
    }

    // Restore saved sensitivity
    const saved = localStorage.getItem('weldsim_sensitivity');
    if (saved && this._ctrlSensitivity) {
      this._ctrlSensitivity.value = saved;
      if (this._valSensitivity) this._valSensitivity.textContent = saved;
    }

    // Settings modal wiring
    const btnSettings     = document.getElementById('btn-settings');
    const settingsModal   = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnSettings && settingsModal) {
      btnSettings.addEventListener('click', () => settingsModal.classList.toggle('hidden'));
      btnCloseSettings?.addEventListener('click', () => settingsModal.classList.add('hidden'));
      settingsModal.addEventListener('click', e => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
      });
    }
  }

  setProcess(processId) {
    if (this._sbProcessName) this._sbProcessName.textContent = processId;

    // Set default amps/volts from process config
    const p = PROCESSES[processId];
    if (p && this._ctrlAmps) {
      this._ctrlAmps.value  = p.amperageDefault;
      this._ctrlVolts.value = p.voltageDefault;
      if (this._sbValAmps)  this._sbValAmps.textContent  = p.amperageDefault + ' A';
      if (this._sbValVolts) this._sbValVolts.textContent = p.voltageDefault  + ' V';
    }

    // Set ideal heat range sublabel
    this._setHeatIdealRange(processId, p);
    this._updateDerivedValues();

    // Wire speed: MIG and FCAW only
    const hasWire = processId === 'MIG' || processId === 'FCAW';
    if (this._sbWireSection) this._sbWireSection.style.display = hasWire ? 'flex' : 'none';
    if (this._sbWireSep)     this._sbWireSep.style.display     = hasWire ? 'block' : 'none';

    // Gas flow: MIG and TIG only
    const hasGas = processId === 'MIG' || processId === 'TIG';
    if (this._sbGasSection) this._sbGasSection.style.display = hasGas ? 'flex' : 'none';
    if (this._sbGasSep)     this._sbGasSep.style.display     = hasGas ? 'block' : 'none';
    if (this._sbValGas && hasGas) this._sbValGas.textContent = '15 L/min';

    // Show/hide shielding gas dropdown in weld-controls
    const selGas = document.getElementById('sel-gas');
    if (selGas) selGas.style.display = hasGas ? '' : 'none';

    // Show/hide TIG-specific control hints
    const isTIG = processId === 'TIG';
    const tigFiller  = document.getElementById('ctrl-hint-tig');
    const tigScroll  = document.getElementById('ctrl-hint-scroll-tig');
    const baseScroll = document.getElementById('ctrl-hint-scroll-base');
    if (tigFiller)  tigFiller.style.display  = isTIG ? 'flex' : 'none';
    if (tigScroll)  tigScroll.style.display  = isTIG ? 'flex' : 'none';
    if (baseScroll) baseScroll.style.display = isTIG ? 'none' : 'flex';
  }

  _setHeatIdealRange(processId, processConfig) {
    const ranges = {
      STICK: { min: 0.9, max: 1.8 },
      MIG:   { min: 0.8, max: 1.5 },
      FCAW:  { min: 1.0, max: 2.0 },
      TIG:   { min: 0.3, max: 0.8 },
    };
    const r = processConfig?.heatInputOptimal ?? ranges[processId] ?? { min: 0.8, max: 1.5 };
    this._heatIdealMin = r.min;
    this._heatIdealMax = r.max;
    if (this._sbHeatRange)
      this._sbHeatRange.textContent = `IDEAL RANGE ${r.min.toFixed(1)} - ${r.max.toFixed(1)} kJ/mm`;
  }

  _updateDerivedValues() {
    // Wire speed derived from amps (rough approx for 1.0mm wire)
    if (this._sbValWire)
      this._sbValWire.textContent = (this.amps / 26).toFixed(1) + ' m/min';
  }

  get amps()  { return this._ctrlAmps  ? parseInt(this._ctrlAmps.value)  : 130; }
  get volts() { return this._ctrlVolts ? parseInt(this._ctrlVolts.value) : 22;  }

  update(torchState, scores, heatInput, processConfig, dt) {
    this._updateArcGauge(torchState.arcLength, processConfig);
    this._updateSpeedGauge(torchState.travelSpeed, processConfig);
    this._updateAngleDisplay(this._needleWork, this._valWork, torchState.workAngle, processConfig.workAngleOptimal);
    this._updateAngleDisplay(this._needleTravel, this._valTravel, torchState.travelAngle, processConfig.travelAngleOptimal);

    // Heat input
    if (this._sbValHeat) {
      this._sbValHeat.textContent = heatInput.toFixed(2) + ' kJ/mm';
    }
    if (this._sbHeatBar) {
      const pct = Math.min(100, heatInput / (this._heatIdealMax * 1.5) * 100);
      this._sbHeatBar.style.width = pct + '%';
      const inRange = heatInput >= this._heatIdealMin && heatInput <= this._heatIdealMax;
      this._sbHeatBar.style.background = inRange
        ? 'var(--color-ok)'
        : heatInput < this._heatIdealMin ? 'var(--color-info)' : 'var(--color-danger)';
    }

    // Quality
    if (this._sbValQuality && torchState.arcOn) {
      const pct = Math.round(scores.quality * 100);
      const col = pct >= 80 ? 'var(--color-ok)' : pct >= 55 ? 'var(--color-warn)' : 'var(--color-danger)';
      this._sbValQuality.textContent = pct + '%';
      this._sbValQuality.style.color = col;
      if (this._sbQualityBar) {
        this._sbQualityBar.style.width      = pct + '%';
        this._sbQualityBar.style.background = col;
      }
    } else if (this._sbValQuality && !torchState.arcOn) {
      this._sbValQuality.textContent = '—';
      this._sbValQuality.style.color = '';
    }

    // Pass progress dot
    if (this._passTorchDot) {
      const span = this._weldRange.max - this._weldRange.min;
      const pct = Math.max(0, Math.min(100, (torchState.position.x - this._weldRange.min) / span * 100));
      this._passTorchDot.style.left = pct + '%';
    }

    this._updateWarning(torchState, scores, processConfig, dt);
  }

  _updateArcGauge(arcLength, processConfig) {
    if (!this._arcNeedle) return;
    const { min, max } = processConfig.arcLengthOptimal;
    const full = max * 2.5;
    const pct = Math.max(0, Math.min(1, arcLength / full));
    this._arcNeedle.style.left = (5 + pct * 90) + '%';
    if (this._valArc) this._valArc.textContent = arcLength.toFixed(1) + ' mm';
  }

  _updateSpeedGauge(speed, processConfig) {
    if (!this._barSpeed) return;
    const { min, max } = processConfig.travelSpeedOptimal;
    const full = max * 1.5;
    const pct = Math.min(1, speed / full) * 100;
    this._barSpeed.style.width = pct + '%';

    if (speed < min * 0.7 || speed > max * 1.3) {
      this._barSpeed.className = 'bar-fill bad';
    } else if (speed >= min && speed <= max) {
      this._barSpeed.className = 'bar-fill ok';
    } else {
      this._barSpeed.className = 'bar-fill warn';
    }

    // Display in cm/min for readability
    if (this._valSpeed) this._valSpeed.textContent = (speed / 10).toFixed(1) + ' cm/min';
  }

  _updateAngleDisplay(needle, label, angle, optimal) {
    if (!needle) return;
    const center   = (optimal.min + optimal.max) / 2;
    const rotation = (angle - center) * 1.5;
    needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    if (label) label.textContent = Math.round(angle) + '°';
    const inRange = angle >= optimal.min && angle <= optimal.max;
    needle.style.background = inRange ? 'var(--color-ok)' : 'var(--color-danger)';
  }

  _updateWarning(torchState, scores, processConfig, dt) {
    if (!this._warning) return;
    this._warningTimer = Math.max(0, this._warningTimer - dt);

    if (!torchState.arcOn) {
      this._warning.classList.add('hidden');
      return;
    }

    let msg = '';
    const arcLen = torchState.arcLength;
    const { arcLengthOptimal: arcOpt, travelSpeedOptimal: speedOpt } = processConfig;

    if (torchState.arcLost) {
      msg = 'ARC LOST - lower torch back into range';
    } else if (arcLen < arcOpt.min * 0.5) {
      msg = 'ARC TOO SHORT - spatter and contamination';
    } else if (arcLen < arcOpt.min) {
      msg = 'Arc a bit short - raise torch slightly';
    } else if (arcLen > arcOpt.max * 2) {
      msg = 'ARC TOO LONG - incomplete fusion';
    } else if (arcLen > arcOpt.max) {
      msg = 'Arc getting long - lower torch';
    } else if (torchState.travelSpeed > speedOpt.max * 1.3) {
      msg = 'TOO FAST - risk of undercut';
    } else if (torchState.travelSpeed > speedOpt.max) {
      msg = 'Slow down - bead getting narrow';
    } else if (torchState.travelSpeed > 5 && torchState.travelSpeed < speedOpt.min * 0.6) {
      msg = 'TOO SLOW - risk of overlap or burn-through';
    }

    if (processConfig.id === 'FCAW' && torchState.travelAngle < 0) {
      msg = 'FCAW needs drag technique - tilt back';
    }

    if (msg) {
      this._warning.textContent = msg;
      this._warning.classList.remove('hidden');
    } else {
      this._warning.classList.add('hidden');
    }
  }

  highlightGauge(id) {
    document.querySelectorAll('.gauge-group').forEach(g => g.classList.remove('tutorial-highlight'));
    if (!id) return;
    const map = {
      arc:    document.getElementById('gauge-arc')?.closest('.gauge-group'),
      speed:  document.getElementById('gauge-speed')?.closest('.gauge-group'),
      work:   document.getElementById('display-work-angle')?.closest('.gauge-group'),
      travel: document.getElementById('display-travel-angle')?.closest('.gauge-group'),
    };
    map[id]?.classList.add('tutorial-highlight');
  }

  show() {
    document.getElementById('hud-overlay')?.classList.remove('hidden');
    document.getElementById('hud-status-bar')?.classList.remove('hidden');
    document.getElementById('weld-controls')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('hud-overlay')?.classList.add('hidden');
    document.getElementById('hud-status-bar')?.classList.add('hidden');
    document.getElementById('weld-controls')?.classList.add('hidden');
    this.highlightGauge(null);
  }
}
