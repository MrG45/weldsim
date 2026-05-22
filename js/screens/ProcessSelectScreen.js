export class ProcessSelectScreen {
  constructor(onSelect, onBack) {
    this._onSelect = onSelect;

    document.getElementById('btn-back-process')?.addEventListener('click', onBack);

    document.querySelectorAll('.process-card').forEach(card => {
      card.querySelector('.btn-process')?.addEventListener('click', () => {
        onSelect(card.dataset.process);
      });
      // Also clicking the card itself
      card.addEventListener('click', e => {
        if (!e.target.classList.contains('btn-process')) {
          onSelect(card.dataset.process);
        }
      });
    });
  }

  show() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-process')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('screen-process')?.classList.add('hidden');
  }
}
