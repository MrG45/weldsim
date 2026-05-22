export class JointSelectScreen {
  constructor(onStart, onBack) {
    this._selectedJoint = 'BUTT';

    document.getElementById('btn-back-joint')?.addEventListener('click', onBack);
    document.getElementById('btn-start-weld')?.addEventListener('click', () => onStart(this._selectedJoint));

    document.querySelectorAll('.joint-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.joint-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this._selectedJoint = card.dataset.joint;
      });
    });
  }

  show(processId) {
    this._processId = processId;
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-joint')?.classList.remove('hidden');
  }

  hide() {
    document.getElementById('screen-joint')?.classList.add('hidden');
  }
}
