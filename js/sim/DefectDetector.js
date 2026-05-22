// Detects weld defects in real-time based on current parameters
// Returns array of {type, severity, position} objects

export const DEFECT_TYPES = {
  POROSITY:          'POROSITY',
  UNDERCUT:          'UNDERCUT',
  OVERLAP:           'OVERLAP',
  BURN_THROUGH:      'BURN_THROUGH',
  INCOMPLETE_FUSION: 'INCOMPLETE_FUSION',
  SPATTER:           'SPATTER',
  COLD_LAP:          'COLD_LAP',
  WRONG_TECHNIQUE:   'WRONG_TECHNIQUE',
};

export function detectDefects(params, processConfig) {
  const defects = [];
  const { arcLengthOptimal: arcOpt, travelSpeedOptimal: speedOpt } = processConfig;

  // ── Arc length defects ──
  if (params.arcLength < arcOpt.min * 0.5) {
    defects.push({
      type: DEFECT_TYPES.SPATTER,
      severity: 0.9,
      position: params.position.clone(),
      note: 'Arc too short causes excessive spatter and electrode sticking',
    });
  }

  if (params.arcLength > arcOpt.max * 2.0) {
    defects.push({
      type: DEFECT_TYPES.INCOMPLETE_FUSION,
      severity: Math.min(1, (params.arcLength - arcOpt.max * 2) / arcOpt.max),
      position: params.position.clone(),
      note: 'Arc too long reduces penetration and causes porosity',
    });
  }

  // ── Travel speed defects ──
  if (params.travelSpeed > speedOpt.max * 1.35) {
    const excess = (params.travelSpeed - speedOpt.max) / speedOpt.max;
    defects.push({
      type: DEFECT_TYPES.UNDERCUT,
      severity: Math.min(1, excess * 1.2),
      position: params.position.clone(),
      note: 'Moving too fast leaves undercut grooves at bead edges',
    });
  }

  if (params.travelSpeed > 5 && params.travelSpeed < speedOpt.min * 0.55) {
    defects.push({
      type: DEFECT_TYPES.OVERLAP,
      severity: 0.7,
      position: params.position.clone(),
      note: 'Moving too slow causes overlap — bead rolls over base metal without fusing',
    });
  }

  // ── Heat input defects ──
  if (params.heatInput > 2.5 && params.materialThickness < 5) {
    defects.push({
      type: DEFECT_TYPES.BURN_THROUGH,
      severity: Math.min(1, (params.heatInput - 2.5) / 2),
      position: params.position.clone(),
      note: 'Too much heat on thin material causes burn-through',
    });
  }

  if (params.heatInput < 0.2 && params.travelSpeed > 20) {
    defects.push({
      type: DEFECT_TYPES.COLD_LAP,
      severity: 0.6,
      position: params.position.clone(),
      note: 'Insufficient heat input causes cold lap — bead sits on top without fusing',
    });
  }

  // ── Gas coverage (MIG, TIG) ──
  if (processConfig.gasRequired && params.windFactor > 0.4) {
    defects.push({
      type: DEFECT_TYPES.POROSITY,
      severity: params.windFactor,
      position: params.position.clone(),
      note: 'Gas coverage disrupted — porosity from atmospheric contamination',
    });
  }

  // ── Work angle issues ──
  const workOpt = processConfig.workAngleOptimal;
  if (params.workAngle < workOpt.min - 15 || params.workAngle > workOpt.max + 15) {
    defects.push({
      type: DEFECT_TYPES.INCOMPLETE_FUSION,
      severity: 0.5,
      position: params.position.clone(),
      note: 'Poor work angle reduces sidewall fusion and penetration',
    });
  }

  // ── Process-specific ──
  if (processConfig.technique === 'drag' && params.travelAngle < -5) {
    defects.push({
      type: DEFECT_TYPES.WRONG_TECHNIQUE,
      severity: 0.6,
      position: params.position.clone(),
      note: `${processConfig.id} requires drag (push-back) technique — never push`,
    });
  }

  return defects;
}

// Summarize an array of defect events into counts and max severity per type
export function summarizeDefects(defectLog) {
  const summary = {};
  for (const d of defectLog) {
    if (!summary[d.type]) {
      summary[d.type] = { count: 0, maxSeverity: 0, note: d.note, positions: [] };
    }
    summary[d.type].count++;
    summary[d.type].maxSeverity = Math.max(summary[d.type].maxSeverity, d.severity);
    summary[d.type].positions.push(d.position);
  }
  return summary;
}
