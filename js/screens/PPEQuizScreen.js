import { PPE_QUIZ } from '../data/curriculum.js';
import { AchievementSystem } from '../ui/AchievementSystem.js';

export class PPEQuizScreen {
  constructor(onPass, onBack) {
    this._onPass = onPass;
    this._questions = [...PPE_QUIZ];
    this._currentQ = 0;
    this._score = 0;
    this._answered = false;

    document.getElementById('btn-quiz-continue')?.addEventListener('click', () => onPass());
    document.getElementById('btn-quiz-retry')?.addEventListener('click', () => this._restart());
  }

  show() {
    this._restart();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-ppe')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('screen-ppe')?.classList.add('hidden');
  }

  _restart() {
    this._currentQ = 0;
    this._score = 0;
    this._answered = false;
    document.getElementById('quiz-question-block')?.classList.remove('hidden');
    document.getElementById('quiz-score')?.classList.add('hidden');
    this._renderQuestion();
  }

  _renderQuestion() {
    const q = this._questions[this._currentQ];
    if (!q) { this._showResult(); return; }

    const pct = (this._currentQ / this._questions.length) * 100;
    const bar = document.getElementById('quiz-progress-bar');
    if (bar) bar.style.width = pct + '%';

    document.getElementById('quiz-question').textContent = q.q;

    const optContainer = document.getElementById('quiz-options');
    if (optContainer) {
      optContainer.innerHTML = q.options.map((opt, i) =>
        `<button class="quiz-option" data-idx="${i}">${opt}</button>`
      ).join('');

      optContainer.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => this._answer(parseInt(btn.dataset.idx)));
      });
    }

    const fb = document.getElementById('quiz-feedback');
    if (fb) { fb.classList.add('hidden'); fb.className = 'quiz-feedback hidden'; }
    this._answered = false;
  }

  _answer(idx) {
    if (this._answered) return;
    this._answered = true;

    const q = this._questions[this._currentQ];
    const buttons = document.querySelectorAll('.quiz-option');
    buttons.forEach(btn => btn.disabled = true);

    const correct = idx === q.answer;
    if (correct) this._score++;

    buttons[idx].classList.add(correct ? 'correct' : 'wrong');
    if (!correct) buttons[q.answer].classList.add('correct');

    const fb = document.getElementById('quiz-feedback');
    if (fb) {
      fb.textContent = (correct ? '✓ Correct! — ' : '✗ Not quite — ') + q.explain;
      fb.className = `quiz-feedback ${correct ? 'correct-fb' : 'wrong-fb'}`;
      fb.classList.remove('hidden');
    }

    setTimeout(() => {
      this._currentQ++;
      if (this._currentQ < this._questions.length) {
        this._renderQuestion();
      } else {
        this._showResult();
      }
    }, 2200);
  }

  _showResult() {
    const bar = document.getElementById('quiz-progress-bar');
    if (bar) bar.style.width = '100%';

    document.getElementById('quiz-question-block')?.classList.add('hidden');
    const scoreEl = document.getElementById('quiz-score');
    if (scoreEl) scoreEl.classList.remove('hidden');

    const passed = this._score >= 4;
    const circle = document.getElementById('score-circle');
    const msg = document.getElementById('score-message');

    if (circle) {
      circle.textContent = `${this._score}/5`;
      circle.className = passed ? 'score-circle' : 'score-circle fail';
    }

    if (msg) {
      msg.textContent = passed
        ? '✓ Safety certified! You may enter the booth.'
        : `You need 4/5 to pass. Score: ${this._score}/5. Review and try again.`;
    }

    document.getElementById('btn-quiz-continue')?.classList.toggle('hidden', !passed);
    document.getElementById('btn-quiz-retry')?.classList.toggle('hidden', passed);

    if (passed && this._score === 5) AchievementSystem.unlock('ppe_ace');
  }
}
