import { THEORY } from '../data/curriculum.js';

export class TheoryScreen {
  constructor(onFinish, onBack) {
    this._onFinish = onFinish;
    this._slides = [];
    this._current = 0;

    document.getElementById('btn-back-theory')?.addEventListener('click', onBack);
    document.getElementById('btn-theory-prev')?.addEventListener('click', () => this._go(-1));
    document.getElementById('btn-theory-next')?.addEventListener('click', () => {
      if (this._current < this._slides.length - 1) {
        this._go(1);
      } else {
        onFinish(this._processId);
      }
    });
  }

  show(processId) {
    this._processId = processId;
    this._slides = THEORY[processId] ?? [];
    this._current = 0;

    document.getElementById('theory-title').textContent = `${processId} Theory`;
    document.getElementById('slide-total').textContent = this._slides.length;
    this._render();

    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-theory')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('screen-theory')?.classList.add('hidden');
  }

  _go(delta) {
    this._current = Math.max(0, Math.min(this._slides.length - 1, this._current + delta));
    this._render();
  }

  _render() {
    const slide = this._slides[this._current];
    if (!slide) return;

    document.getElementById('theory-content').innerHTML = slide.html;
    document.getElementById('slide-current').textContent = this._current + 1;

    // Prev button
    const prev = document.getElementById('btn-theory-prev');
    if (prev) prev.disabled = this._current === 0;

    // Next button
    const next = document.getElementById('btn-theory-next');
    if (next) {
      next.textContent = this._current === this._slides.length - 1 ? 'Done — Safety Quiz →' : 'Next →';
    }

    // Slide dots
    const dotsEl = document.getElementById('slide-dots');
    if (dotsEl) {
      dotsEl.innerHTML = this._slides.map((_, i) =>
        `<div class="slide-dot${i === this._current ? ' active' : ''}"></div>`
      ).join('');

      dotsEl.querySelectorAll('.slide-dot').forEach((dot, i) => {
        dot.addEventListener('click', () => {
          this._current = i;
          this._render();
        });
      });
    }
  }
}
