import { ACHIEVEMENTS } from '../data/curriculum.js';

export class AchievementSystem {
  static _get() {
    try {
      return JSON.parse(localStorage.getItem('weldsim_achievements') ?? '{}');
    } catch { return {}; }
  }

  static _save(data) {
    try { localStorage.setItem('weldsim_achievements', JSON.stringify(data)); } catch {}
  }

  static unlock(id) {
    const data = AchievementSystem._get();
    if (data[id]) return false; // already unlocked
    data[id] = { unlockedAt: Date.now() };
    AchievementSystem._save(data);
    AchievementSystem._toast(id);
    return true;
  }

  static isUnlocked(id) {
    return !!AchievementSystem._get()[id];
  }

  static getAll() {
    const unlocked = AchievementSystem._get();
    return ACHIEVEMENTS.map(a => ({ ...a, unlocked: !!unlocked[a.id] }));
  }

  static _toast(id) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 80px; right: 20px; z-index: 100;
      background: #1c2a1c; border: 1px solid #22c55e; border-radius: 8px;
      padding: 12px 20px; color: #22c55e; font-family: 'Courier New', monospace;
      font-size: 13px; animation: slide-in 0.3s ease; pointer-events: none;
      box-shadow: 0 0 20px rgba(34,197,94,0.3);
    `;
    toast.innerHTML = `${ach.icon} <strong>Achievement Unlocked!</strong><br>${ach.name} — ${ach.desc}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}
