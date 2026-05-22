export const PROCESSES = {
  STICK: {
    id: 'STICK',
    name: 'Stick Welding',
    abbr: 'SMAW',
    technique: 'drag',
    arcLengthOptimal:    { min: 2.5, max: 5.0 },  // mm, roughly electrode diameter
    workAngleOptimal:    { min: -8,  max: 8   },  // degrees off perpendicular
    travelAngleOptimal:  { min: 10,  max: 25   },  // drag angle degrees
    travelSpeedOptimal:  { min: 140, max: 300  },  // mm/min
    heatInputOptimal:    { min: 0.6, max: 1.3 },  // kJ/mm
    amperageDefault: 130,
    voltageDefault:  24,
    electrodeConsumption: true,
    burnRate: 90,           // mm/min electrode consumed at 130A
    slagRemoval: true,
    strikeArc: true,        // must be within 3mm to strike
    strikeDistance: 3.5,    // mm
    maxLiveArcLength: 9,    // mm before the arc breaks
    gasRequired: false,
    beadProfile: { widthFactor: 1.0, crownFactor: 0.6 },
    color: '#f59e0b',
  },
  MIG: {
    id: 'MIG',
    name: 'MIG Welding',
    abbr: 'GMAW',
    technique: 'push',
    arcLengthOptimal:    { min: 2.0, max: 4.0 },
    workAngleOptimal:    { min: -6,  max: 6   },
    travelAngleOptimal:  { min: 10,  max: 20  },
    travelSpeedOptimal:  { min: 240, max: 420 },
    heatInputOptimal:    { min: 0.45, max: 0.95 },
    amperageDefault: 160,
    voltageDefault:  21,
    electrodeConsumption: false,
    wireStickoutOptimal: 13,   // mm wire extension from nozzle
    arcStartDistance: 7,       // mm before voltage can sustain an arc
    maxLiveArcLength: 8,
    gasRequired: true,
    beadProfile: { widthFactor: 1.2, crownFactor: 0.4 },
    color: '#3b82f6',
  },
  FCAW: {
    id: 'FCAW',
    name: 'Flux-Core',
    abbr: 'FCAW',
    technique: 'drag',
    arcLengthOptimal:    { min: 3.0, max: 6.0 },
    workAngleOptimal:    { min: -8,  max: 8   },
    travelAngleOptimal:  { min: 15,  max: 30  },   // more drag than MIG
    travelSpeedOptimal:  { min: 180, max: 380 },
    heatInputOptimal:    { min: 0.7, max: 1.5 },
    amperageDefault: 200,
    voltageDefault:  26,
    electrodeConsumption: false,
    gasRequired: false,
    fluxRemoval: true,
    windSensitivity: 0.2,   // low - self-shielded
    arcStartDistance: 9,
    maxLiveArcLength: 11,
    outdoorCapable: true,
    beadProfile: { widthFactor: 1.3, crownFactor: 0.5 },
    color: '#8b5cf6',
  },
  TIG: {
    id: 'TIG',
    name: 'TIG Welding',
    abbr: 'GTAW',
    technique: 'push',
    arcLengthOptimal:    { min: 1.0, max: 3.0 },   // very short, critical
    workAngleOptimal:    { min: -5,  max: 8   },
    travelAngleOptimal:  { min: 10,  max: 20  },
    travelSpeedOptimal:  { min: 70,  max: 180 },
    heatInputOptimal:    { min: 0.25, max: 0.65 },
    amperageDefault: 90,
    voltageDefault:  14,
    electrodeConsumption: false,
    gasRequired: true,
    footPedal: true,       // scroll = pedal
    fillerRodRequired: true,
    arcStartDistance: 5,
    maxLiveArcLength: 6,
    fillerFeedRate: 2,     // mm per key press
    beadProfile: { widthFactor: 0.8, crownFactor: 0.3 },
    color: '#22c55e',
  },
};

// Weights for composite quality score
export const QUALITY_WEIGHTS = {
  arcLength:    0.26,
  travelSpeed:  0.24,
  heatInput:    0.22,
  workAngle:    0.16,
  travelAngle:  0.12,
};

export const JOINT_TYPES = ['BUTT', 'T', 'LAP', 'CORNER'];
