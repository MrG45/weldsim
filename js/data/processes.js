export const PROCESSES = {
  STICK: {
    id: 'STICK',
    name: 'Stick Welding',
    abbr: 'SMAW',
    technique: 'drag',
    arcLengthOptimal:    { min: 3,   max: 8   },  // mm (~electrode diameter)
    workAngleOptimal:    { min: 80,  max: 100  },  // degrees from workpiece surface
    travelAngleOptimal:  { min: 10,  max: 25   },  // drag angle degrees
    travelSpeedOptimal:  { min: 100, max: 300  },  // mm/min
    amperageDefault: 130,
    voltageDefault:  24,
    electrodeConsumption: true,
    burnRate: 90,           // mm/min electrode consumed at 130A
    slagRemoval: true,
    strikeArc: true,        // must be within 3mm to strike
    strikeDistance: 3,      // mm
    gasRequired: false,
    beadProfile: { widthFactor: 1.0, crownFactor: 0.6 },
    color: '#f59e0b',
  },
  MIG: {
    id: 'MIG',
    name: 'MIG Welding',
    abbr: 'GMAW',
    technique: 'push',
    arcLengthOptimal:    { min: 6,   max: 12  },
    workAngleOptimal:    { min: 85,  max: 95  },
    travelAngleOptimal:  { min: 10,  max: 20  },
    travelSpeedOptimal:  { min: 150, max: 350 },
    amperageDefault: 160,
    voltageDefault:  21,
    electrodeConsumption: false,
    wireStickoutOptimal: 13,   // mm wire extension from nozzle
    gasRequired: true,
    beadProfile: { widthFactor: 1.2, crownFactor: 0.4 },
    color: '#3b82f6',
  },
  FCAW: {
    id: 'FCAW',
    name: 'Flux-Core',
    abbr: 'FCAW',
    technique: 'drag',
    arcLengthOptimal:    { min: 6,   max: 12  },
    workAngleOptimal:    { min: 80,  max: 100 },
    travelAngleOptimal:  { min: 15,  max: 30  },   // more drag than MIG
    travelSpeedOptimal:  { min: 150, max: 400 },
    amperageDefault: 200,
    voltageDefault:  26,
    electrodeConsumption: false,
    gasRequired: false,
    fluxRemoval: true,
    windSensitivity: 0.2,   // low — self-shielded
    outdoorCapable: true,
    beadProfile: { widthFactor: 1.3, crownFactor: 0.5 },
    color: '#8b5cf6',
  },
  TIG: {
    id: 'TIG',
    name: 'TIG Welding',
    abbr: 'GTAW',
    technique: 'push',
    arcLengthOptimal:    { min: 2,   max: 5   },   // very short, critical
    workAngleOptimal:    { min: 75,  max: 90  },
    travelAngleOptimal:  { min: 10,  max: 20  },
    travelSpeedOptimal:  { min: 75,  max: 200 },
    amperageDefault: 90,
    voltageDefault:  14,
    electrodeConsumption: false,
    gasRequired: true,
    footPedal: true,       // scroll = pedal
    fillerRodRequired: true,
    fillerFeedRate: 2,     // mm per key press
    beadProfile: { widthFactor: 0.8, crownFactor: 0.3 },
    color: '#22c55e',
  },
};

// Weights for composite quality score
export const QUALITY_WEIGHTS = {
  arcLength:    0.30,
  travelSpeed:  0.30,
  workAngle:    0.25,
  travelAngle:  0.15,
};

export const JOINT_TYPES = ['BUTT', 'T', 'LAP', 'CORNER'];
