import * as THREE from 'three';
import { beadWidth, beadCrown } from './WeldPhysics.js';

// Returns array of THREE.Vector2 cross-section points for a weld bead
export function beadCrossSection(quality, heatInput, processConfig) {
  const w = beadWidth(heatInput, processConfig) / 2;      // half-width
  const h = beadCrown(heatInput, quality, processConfig); // crown height
  const undercut = quality < 0.5 ? (0.5 - quality) * 1.5 : 0; // dip at edges

  const pts = [];
  const N = 8; // segments (9 vertices)
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 - 1;          // -1 to +1
    const tSq = t * t;
    const yEdge = -undercut * (1 - tSq); // undercut depression at edges
    const yCrown = h * (1 - tSq);        // parabolic crown
    pts.push(new THREE.Vector2(t * w, yEdge + yCrown));
  }
  return pts;
}

// Compute the "hot" color for a fresh bead (0=just welded, 1=cool)
export function beadColor(ageSec) {
  const coolTime = 25; // seconds to full cool
  const t = Math.min(1, ageSec / coolTime);

  // Hot: bright orange (#ff6b00) → warm gold (#c0a060) → cooled dark (#6b5030)
  if (t < 0.3) {
    const s = t / 0.3;
    return new THREE.Color(1.0, 0.42 + s * 0.21, 0.0);       // orange → gold-orange
  } else if (t < 0.7) {
    const s = (t - 0.3) / 0.4;
    return new THREE.Color(0.75 - s * 0.33, 0.63 - s * 0.22, s * 0.19); // gold → bronze
  } else {
    const s = (t - 0.7) / 0.3;
    return new THREE.Color(0.42 - s * 0.1, 0.41 - s * 0.1, 0.19 - s * 0.02); // bronze → dark
  }
}
