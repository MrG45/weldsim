export class TitleScreen {
  constructor(onStart, onPractice) {
    document.getElementById('btn-start')?.addEventListener('click', onStart);
    document.getElementById('btn-practice')?.addEventListener('click', onPractice);
  }

  show() { switchTo('screen-title'); }
  hide() { document.getElementById('screen-title')?.classList.add('hidden'); }
}

function switchTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}
