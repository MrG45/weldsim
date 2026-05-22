import { DEFECT_INFO } from '../data/defects.js';
import { gradeFromScore } from '../sim/WeldPhysics.js';
import { AchievementSystem } from '../ui/AchievementSystem.js';
import { summarizeDefects } from '../sim/DefectDetector.js';

export class ResultsScreen {
  constructor(onReplay, onChangeProcess, onNextLesson) {
    document.getElementById('btn-replay')?.addEventListener('click', onReplay);
    document.getElementById('btn-change-process')?.addEventListener('click', onChangeProcess);
    document.getElementById('btn-next-lesson')?.addEventListener('click', onNextLesson);
  }

  show(sessionData) {
    // sessionData: { processId, scores: {arc, speed, work, travel, quality}, heatInput, defectLog, jointType }
    const { processId, scores, heatInput, coverage = 0, defectLog } = sessionData;

    this._updateGrade(scores.quality, processId);
    this._updateBreakdown(scores, heatInput, coverage);
    this._updateDefects(defectLog);
    this._checkAchievements(processId, scores);

    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-results')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('screen-results')?.classList.add('hidden');
  }

  _updateGrade(quality, processId) {
    const pct = Math.round(quality * 100);
    const letter = gradeFromScore(quality);
    const gradeEl = document.getElementById('results-grade');
    const scoreText = document.getElementById('results-score-text');

    if (gradeEl) {
      gradeEl.textContent = letter;
      gradeEl.className = `grade-circle grade-${letter.toLowerCase()}`;
    }
    if (scoreText) scoreText.textContent = `Score: ${pct}%`;
  }

  _updateBreakdown(scores, heatInput, coverage) {
    const container = document.getElementById('results-breakdown');
    if (!container) return;

    const items = [
      { label: 'Arc Length',    value: scores.arc,    pct: Math.round(scores.arc * 100)    },
      { label: 'Travel Speed',  value: scores.speed,  pct: Math.round(scores.speed * 100)  },
      { label: 'Heat Input',    value: scores.heat ?? 0, pct: Math.round((scores.heat ?? 0) * 100) },
      { label: 'Work Angle',    value: scores.work,   pct: Math.round(scores.work * 100)   },
      { label: 'Travel Angle',  value: scores.travel, pct: Math.round(scores.travel * 100) },
      { label: 'Pass Coverage', value: coverage,       pct: Math.round(coverage * 100)      },
    ];

    container.innerHTML = items.map(item => {
      const color = item.value >= 0.8 ? '#22c55e' : item.value >= 0.55 ? '#f59e0b' : '#ef4444';
      const icon  = item.value >= 0.8 ? '✓' : item.value >= 0.55 ? '~' : '✗';
      return `
        <div class="breakdown-item">
          <span class="bi-label">${item.label}</span>
          <span class="bi-value" style="color:${color}">${icon} ${item.pct}%</span>
          <div class="bi-bar" style="width:${item.pct}%; background:${color}; height:4px; border-radius:2px; margin-top:4px;"></div>
        </div>
      `;
    }).join('') + `
      <div class="breakdown-item breakdown-wide">
        <span class="bi-label">Average Heat Input</span>
        <span class="bi-value">${heatInput.toFixed(2)} kJ/mm</span>
      </div>
    `;
  }

  _updateDefects(defectLog) {
    const container = document.getElementById('results-defects');
    if (!container) return;

    const summary = summarizeDefects(defectLog);
    const types = Object.keys(summary);

    if (types.length === 0) {
      container.innerHTML = '<div style="color:var(--color-ok);text-align:center;padding:16px;">✓ No significant defects detected — excellent technique!</div>';
      return;
    }

    container.innerHTML = '<div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">Defects Found</div>' +
      types.map(type => {
        const info = DEFECT_INFO[type] ?? { name: type, description: '', causes: [], fixes: [], icon: '⚠' };
        const sev = summary[type];
        const sevPct = Math.round(sev.maxSeverity * 100);
        return `
          <div class="defect-card">
            <h4>${info.icon} ${info.name} — ${sev.count}× detected (max severity: ${sevPct}%)</h4>
            <p>${info.description}</p>
            <p><strong>Main cause:</strong> ${info.causes[0] ?? ''}</p>
            <p class="defect-fix">✓ Fix: ${info.fixes[0] ?? ''}</p>
          </div>
        `;
      }).join('');
  }

  _checkAchievements(processId, scores) {
    AchievementSystem.unlock('first_arc');
    if (scores.quality >= 0.9) AchievementSystem.unlock('clean_bead');
    if (scores.quality >= 0.8) {
      AchievementSystem.unlock(`master_${processId.toLowerCase()}`);
      // Check all four
      const allCert = ['master_stick', 'master_mig', 'master_fcaw', 'master_tig']
        .every(id => AchievementSystem.isUnlocked(id));
      if (allCert) AchievementSystem.unlock('all_four');
    }
  }
}
