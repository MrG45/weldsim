// Each step has: text, why, keyHint, gauge (which HUD element to highlight), check, successMsg
const STEPS = {
  STICK: [
    {
      text:       'Move your mouse DOWN toward the metal plates.',
      why:        'The electrode must be almost touching the metal to strike an arc — closer than any other process.',
      keyHint:    'Mouse DOWN = Lower torch toward metal',
      gauge:      null,
      check:      s => s.arcLength < 12,
      successMsg: 'Good position!',
    },
    {
      text:       'Hold LEFT MOUSE BUTTON to strike the arc.',
      why:        'Striking the arc starts the welding process. You must be within ~3mm of the metal.',
      keyHint:    'LMB = Arc On/Off',
      gauge:      null,
      check:      s => s.arcOn,
      successMsg: 'Arc struck! Great start!',
    },
    {
      text:       'Watch the ARC LENGTH gauge — keep the needle in the GREEN zone.',
      why:        'Arc length is the most critical variable in Stick welding. Too short = spatter and sticking. Too long = porosity and cold bead.',
      keyHint:    'Mouse height = Arc length',
      gauge:      'arc',
      check:      (s, t) => t >= 4,
      duration:   4,
      successMsg: 'Arc control improving!',
    },
    {
      text:       'Now move the mouse slowly from LEFT to RIGHT along the joint.',
      why:        'Travel speed controls bead width and heat input. Too fast = thin/undercut. Too slow = overflow.',
      keyHint:    'Move mouse LEFT → RIGHT along the green line',
      gauge:      'speed',
      check:      s => s.travelSpeed > 40,
      successMsg: 'Moving! Watch your speed gauge.',
    },
    {
      text:       'The electrode is burning down — LOWER your mouse to keep the arc green.',
      why:        'As Stick electrodes melt, the gap grows. You must constantly lower your hand to compensate or the arc gets too long.',
      keyHint:    'Mouse down = Shorter arc',
      gauge:      'arc',
      check:      (s, t) => t >= 6,
      duration:   6,
      successMsg: 'Good compensation!',
    },
    {
      text:       'Release LMB to stop the arc. Let the bead cool for a moment.',
      why:        'Ending cleanly prevents a crater crack at the finish. In real welding you\'d fill the crater before lifting.',
      keyHint:    'Release LMB = Arc Off',
      gauge:      null,
      check:      s => !s.arcOn,
      successMsg: 'Clean stop!',
    },
    {
      text:       'Click FINISH WELD to see your results and defect analysis.',
      why:        'In a real shop you\'d now chip the slag and wire-brush the bead before inspection.',
      keyHint:    'Finish Weld button →',
      gauge:      null,
      check:      () => false,
      successMsg: '',
    },
  ],

  MIG: [
    {
      text:       'Position your true arc around 2-4mm above the metal (watch the arc gauge).',
      why:        'Wire stickout is longer, but the live arc itself is short. Voltage and stickout together control heat and arc stability.',
      keyHint:    'Mouse DOWN = torch closer   Mouse UP = torch farther',
      gauge:      'arc',
      check:      s => s.arcLength >= 6 && s.arcLength <= 14,
      successMsg: 'Perfect stickout!',
    },
    {
      text:       'Hold LMB to start the arc. Tilt slightly forward — this is the PUSH technique.',
      why:        'MIG uses a push (forehand) angle. This gives better gas coverage and a flatter, wider bead.',
      keyHint:    'LMB = Arc   W/S = Travel angle',
      gauge:      null,
      check:      s => s.arcOn,
      successMsg: 'Wire is feeding!',
    },
    {
      text:       'Move LEFT to RIGHT at a steady pace. Listen for a crispy frying sound.',
      why:        'That sound means the arc is stable. Loud popping = too short. Hissing = too long.',
      keyHint:    'Move mouse LEFT → RIGHT at a steady pace',
      gauge:      'speed',
      check:      s => s.travelSpeed > 50,
      successMsg: 'Good movement!',
    },
    {
      text:       'Use the SCROLL WHEEL to fine-tune arc length. Keep the gauge green.',
      why:        'Voltage determines arc length in MIG. Too short = spatter. Too long = poor penetration.',
      keyHint:    'Scroll = Arc length fine adjust',
      gauge:      'arc',
      check:      (s, t) => t >= 4,
      duration:   4,
      successMsg: 'Arc length controlled!',
    },
    {
      text:       'Watch your WORK ANGLE gauge - aim near 0° off perpendicular on a flat butt joint.',
      why:        'Work angle directs the arc into the joint. Off-angle = one side doesn\'t fuse properly.',
      keyHint:    'A / D = Work angle',
      gauge:      'work',
      check:      (s, t) => t >= 4,
      duration:   4,
      successMsg: 'Angle looks good!',
    },
    {
      text:       'Click FINISH WELD to see your quality score and any defects.',
      why:        'Review the defect analysis carefully — it tells you exactly what to improve next run.',
      keyHint:    'Finish Weld button →',
      gauge:      null,
      check:      () => false,
      successMsg: '',
    },
  ],

  FCAW: [
    {
      text:       'Position the true arc about 3-6mm above the metal. FCAW tolerates a little more length than MIG.',
      why:        'Longer stickout pre-heats the wire and helps the flux gases do their shielding job.',
      keyHint:    'Mouse DOWN = closer to metal',
      gauge:      'arc',
      check:      s => s.arcLength >= 8 && s.arcLength <= 18,
      successMsg: 'Good stickout!',
    },
    {
      text:       'Press S to tilt the torch BACKWARD before striking. FCAW always drags — NEVER pushes.',
      why:        'Pushing buries the flux gases into the puddle causing massive porosity. Always drag.',
      keyHint:    'S = Tilt back (drag angle)   LMB = Arc',
      gauge:      'travel',
      check:      s => s.arcOn,
      successMsg: 'Arc on with drag angle!',
    },
    {
      text:       'Move LEFT to RIGHT — dragging the gun AWAY from the puddle.',
      why:        'Dragging keeps the flux gases ahead of the solidifying weld, protecting it from atmosphere.',
      keyHint:    'Move mouse LEFT → RIGHT while dragging',
      gauge:      'speed',
      check:      s => s.travelSpeed > 40,
      successMsg: 'Dragging correctly!',
    },
    {
      text:       'Keep watching the TRAVEL ANGLE gauge — stay in the drag zone.',
      why:        'FCAW is unforgiving about technique angle. A momentary push ruins the entire section.',
      keyHint:    'S = More drag   W = Less (careful!)',
      gauge:      'travel',
      check:      (s, t) => t >= 5,
      duration:   5,
      successMsg: 'Technique solid!',
    },
    {
      text:       'Release LMB. In a real weld you\'d now chip the flux slag before the next pass.',
      why:        'FCAW slag must be completely removed between passes or it becomes a trapped inclusion.',
      keyHint:    'Release LMB = Arc Off',
      gauge:      null,
      check:      s => !s.arcOn,
      successMsg: 'Clean stop!',
    },
    {
      text:       'Click FINISH WELD to inspect your bead.',
      why:        'Check if any porosity or technique warnings appeared — these are the most common FCAW mistakes.',
      keyHint:    'Finish Weld button →',
      gauge:      null,
      check:      () => false,
      successMsg: '',
    },
  ],

  TIG: [
    {
      text:       'TIG needs a VERY SHORT arc - about 1-3mm. Move the mouse close to the metal.',
      why:        'A long TIG arc wanders, contaminates the tungsten, and produces poor penetration. Keep it tight.',
      keyHint:    'Mouse DOWN = shorter arc  (keep very close!)',
      gauge:      'arc',
      check:      s => s.arcLength <= 6,
      successMsg: 'Close enough!',
    },
    {
      text:       'Hold LMB to start the high-frequency arc. Wait for the puddle to form.',
      why:        'Establishing the puddle first before adding filler is critical — rushing causes cold lap.',
      keyHint:    'LMB = Arc On   Wait 1–2 seconds before moving',
      gauge:      null,
      check:      s => s.arcOn,
      successMsg: 'Arc established!',
    },
    {
      text:       'Press Q to dip the FILLER ROD into the front edge of the puddle.',
      why:        'Dip at the leading edge, never into the arc. Touching the rod to the tungsten contaminates both.',
      keyHint:    'Q = Filler rod dip',
      gauge:      null,
      check:      s => s.fillerAmount > 0,
      successMsg: 'Filler in the puddle!',
    },
    {
      text:       'Build a rhythm: MOVE forward, DIP filler, MOVE, DIP. Keep the arc green.',
      why:        'TIG rhythm creates the "stack of dimes" look. Each dip should add the same amount of metal.',
      keyHint:    'Move → Q → Move → Q …',
      gauge:      'arc',
      check:      s => s.travelSpeed > 20,
      successMsg: 'Rhythm forming!',
    },
    {
      text:       'Use SCROLL WHEEL as the foot pedal — reduce amperage as you near the end of the joint.',
      why:        'The metal gets hotter as you weld. Reducing amperage at the finish prevents burn-through and end craters.',
      keyHint:    'Scroll Down = Less amps (foot pedal)',
      gauge:      null,
      check:      (s, t) => t >= 5,
      duration:   5,
      successMsg: 'Pedal control!',
    },
    {
      text:       'Release LMB. DO NOT pull away quickly — let the gas post-flow protect the tungsten.',
      why:        'TIG machines have post-flow gas that keeps shielding the hot tungsten after the arc stops.',
      keyHint:    'Release LMB slowly',
      gauge:      null,
      check:      s => !s.arcOn,
      successMsg: 'Clean finish!',
    },
    {
      text:       'Click FINISH WELD. TIG results show the quality of your puddle control.',
      why:        'TIG quality lives or dies on consistency — every dip should be identical.',
      keyHint:    'Finish Weld button →',
      gauge:      null,
      check:      () => false,
      successMsg: '',
    },
  ],
};

export class TutorialOverlay {
  constructor(processId, hud) {
    this._processId = processId;
    this._hud       = hud;
    this._steps     = STEPS[processId] ?? [];
    this._step      = 0;
    this._timer     = 0;   // wall-clock since step started (for pulsing, min-wait)
    this._arcTimer  = 0;   // seconds arc has been ON this step (for duration checks)
    this._done      = false;
    this._waiting   = false; // true while showing success flash
    this._el        = null;
  }

  show() {
    const key = `weldsim_tutorial_done_${this._processId}`;
    if (localStorage.getItem(key)) { this._done = true; return; }

    this._buildUI();
    this._render();
  }

  _buildUI() {
    this._el = document.createElement('div');
    this._el.id = 'tutorial-overlay';
    this._el.style.cssText = `
      position: fixed;
      bottom: calc(var(--controlbar-h) + var(--statusbar-h) + 40px);
      left: 16px;
      width: 320px;
      background: rgba(8,12,10,0.93);
      border: 1px solid #22c55e;
      border-radius: 12px;
      padding: 0;
      z-index: 50;
      pointer-events: all;
      box-shadow: 0 0 24px rgba(34,197,94,0.2);
      font-family: 'Courier New', monospace;
      overflow: hidden;
    `;

    // Progress bar at top
    this._progressBar = document.createElement('div');
    this._progressBar.style.cssText = `
      height: 3px;
      background: #22c55e;
      transition: width 0.4s ease;
      width: 0%;
    `;
    this._el.appendChild(this._progressBar);

    // Content area
    this._content = document.createElement('div');
    this._content.style.cssText = 'padding: 14px 16px 10px;';
    this._el.appendChild(this._content);

    // Skip button
    const skip = document.createElement('button');
    skip.textContent = 'Skip Tutorial';
    skip.style.cssText = `
      display: block;
      width: 100%;
      padding: 7px;
      background: none;
      border: none;
      border-top: 1px solid rgba(34,197,94,0.2);
      color: #445544;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      cursor: pointer;
      letter-spacing: .05em;
    `;
    skip.addEventListener('mouseenter', () => { skip.style.color = '#22c55e'; });
    skip.addEventListener('mouseleave', () => { skip.style.color = '#445544'; });
    skip.addEventListener('click', () => this._finish(true));
    this._el.appendChild(skip);

    document.body.appendChild(this._el);
  }

  update(torchState, dt) {
    if (this._done || !this._el || this._step >= this._steps.length) return;

    this._timer += dt;
    // Only count time when the arc is actively on (used by duration-based steps)
    if (torchState.arcOn) this._arcTimer += dt;

    // Don't advance while showing success flash
    if (this._waiting) return;

    // Require at least 0.5s on each step before it can advance — prevents instant
    // completion when a step loads in a state that already satisfies the check
    if (this._timer < 0.5) return;

    const step = this._steps[this._step];
    // Duration steps use arc-active time so the player must actually be welding
    const timeOk  = step.duration > 0 ? this._arcTimer >= step.duration : true;
    const stateOk = step.check(torchState, this._arcTimer);

    if (timeOk && stateOk) {
      if (step.successMsg) {
        this._waiting = true;
        this._showSuccess(step.successMsg);
        setTimeout(() => {
          this._waiting = false;
          this._advanceStep();
        }, 1100);
      } else {
        this._advanceStep();
      }
    }
  }

  _advanceStep() {
    this._step++;
    this._timer = 0;
    this._arcTimer = 0;
    if (this._step >= this._steps.length) {
      this._finish(false);
    } else {
      this._render();
    }
  }

  _render() {
    if (!this._content || this._step >= this._steps.length) return;
    const step = this._steps[this._step];
    const stepNum = this._step + 1;
    const total   = this._steps.length;

    // Update progress bar
    const pct = ((stepNum - 1) / total) * 100;
    if (this._progressBar) this._progressBar.style.width = pct + '%';

    this._content.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="color:#22c55e;font-size:10px;letter-spacing:.12em;">STEP ${stepNum} / ${total}</span>
        <span style="color:#333;font-size:10px;">${this._processId}</span>
      </div>
      <div style="color:#e8e8f0;font-size:13px;font-weight:bold;line-height:1.45;margin-bottom:8px;">
        ${step.text}
      </div>
      <div style="color:#6b8a6b;font-size:11px;line-height:1.5;margin-bottom:10px;">
        ${step.why}
      </div>
      <div style="background:#0d1a0d;border:1px solid #1a3a1a;border-radius:4px;padding:5px 9px;font-size:11px;color:#44aa44;letter-spacing:.04em;">
        ${step.keyHint}
      </div>
    `;

    // Highlight relevant gauge
    if (this._hud) this._hud.highlightGauge(step.gauge ?? null);
  }

  _showSuccess(msg) {
    if (!this._content) return;
    this._content.innerHTML = `
      <div style="text-align:center;padding:12px 0;">
        <div style="font-size:2rem;margin-bottom:6px;">✓</div>
        <div style="color:#22c55e;font-size:14px;font-weight:bold;">${msg}</div>
      </div>
    `;
    if (this._progressBar) {
      const pct = ((this._step + 1) / this._steps.length) * 100;
      this._progressBar.style.width = pct + '%';
    }
  }

  _finish(skipped) {
    const key = `weldsim_tutorial_done_${this._processId}`;
    localStorage.setItem(key, '1');
    this._done = true;

    // Clear gauge highlight
    if (this._hud) this._hud.highlightGauge(null);

    if (this._el) {
      this._el.style.transition = 'opacity 0.5s';
      this._el.style.opacity = '0';
      setTimeout(() => { this._el?.remove(); this._el = null; }, 600);
    }
  }

  hide() {
    this._finish(true);
  }
}
