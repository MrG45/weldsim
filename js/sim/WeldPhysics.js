// Pure physics functions — no DOM, no Three.js dependencies

export function computeHeatInput(amps, volts, travelSpeedMMperMin) {
  if (travelSpeedMMperMin < 1) return 0;
  return (amps * volts * 60) / (travelSpeedMMperMin * 1000); // kJ/mm
}

// Score 0–1 for a measured value vs an optimal range
export function rangeScore(measured, optimal) {
  const center = (optimal.min + optimal.max) / 2;
  const halfRange = (optimal.max - optimal.min) / 2;
  const deviation = Math.abs(measured - center);
  return Math.max(0, 1 - deviation / (halfRange * 2.5));
}

// Arc length score with extra penalty for very short arcs (spatter)
export function arcLengthScore(measured, optimal) {
  if (measured < 0) return 0;
  const base = rangeScore(measured, optimal);
  if (measured < optimal.min * 0.5) return base * 0.3; // heavy penalty
  if (measured > optimal.max * 2.5) return 0;
  return base;
}

export function travelSpeedScore(measured, optimal) {
  if (measured < 1) return 0; // not moving
  return rangeScore(measured, optimal);
}

export function workAngleScore(measured, optimal) {
  return rangeScore(measured, optimal);
}

export function travelAngleScore(measured, optimal) {
  return rangeScore(Math.abs(measured), optimal);
}

export function heatInputScore(measured, optimal) {
  if (!optimal || measured <= 0) return 0;
  return rangeScore(measured, optimal);
}

// Weighted composite quality (0–1)
export function computeQuality(scores) {
  return (
    scores.arc    * 0.26 +
    scores.speed  * 0.24 +
    scores.heat   * 0.22 +
    scores.work   * 0.16 +
    scores.travel * 0.12
  );
}

// All scores in one call
export function scoreAll(params, processConfig) {
  const arc    = arcLengthScore(params.arcLength, processConfig.arcLengthOptimal);
  const speed  = travelSpeedScore(params.travelSpeed, processConfig.travelSpeedOptimal);
  const work   = workAngleScore(params.workAngle, processConfig.workAngleOptimal);
  const travel = travelAngleScore(params.travelAngle, processConfig.travelAngleOptimal);
  const heatInput = params.heatInput ?? computeHeatInput(
    params.effectiveAmps ?? params.amps,
    params.volts,
    Math.max(1, params.travelSpeed),
  );
  const heat = heatInputScore(heatInput, processConfig.heatInputOptimal);
  const quality = computeQuality({ arc, speed, heat, work, travel });
  return { arc, speed, heat, work, travel, quality };
}

// Bead width in mm based on heat input and process
export function beadWidth(heatInput, process) {
  const base = 4.5 + heatInput * 4.5 * process.beadProfile.widthFactor;
  return Math.max(2.5, Math.min(base, 18));
}

// Bead crown height in mm
export function beadCrown(heatInput, quality, process) {
  const base = 0.7 + heatInput * 1.8 * process.beadProfile.crownFactor;
  const qualFactor = 0.5 + quality * 0.5;
  return Math.max(0.5, base * qualFactor);
}

// Penetration depth in mm
export function penetrationDepth(heatInput, quality) {
  return Math.max(0, heatInput * 3.5 * quality);
}

// Grade letter from 0–1 score
export function gradeFromScore(score) {
  if (score >= 0.90) return 'A';
  if (score >= 0.80) return 'B';
  if (score >= 0.65) return 'C';
  if (score >= 0.50) return 'D';
  return 'F';
}
