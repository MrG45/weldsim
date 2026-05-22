// WeldSim — Entry point and screen orchestration

// Clear tutorial flags so the improved tutorial runs again for all processes
['weldsim_tutorial_done', 'weldsim_tutorial_done_STICK', 'weldsim_tutorial_done_MIG',
 'weldsim_tutorial_done_FCAW', 'weldsim_tutorial_done_TIG'].forEach(k => localStorage.removeItem(k));

import { TitleScreen }        from './screens/TitleScreen.js';
import { ProcessSelectScreen } from './screens/ProcessSelectScreen.js';
import { TheoryScreen }        from './screens/TheoryScreen.js';
import { PPEQuizScreen }       from './screens/PPEQuizScreen.js';
import { JointSelectScreen }   from './screens/JointSelectScreen.js';
import { WeldingScreen }       from './screens/WeldingScreen.js';
import { ResultsScreen }       from './screens/ResultsScreen.js';

class Game {
  constructor() {
    this._processId = null;
    this._ppePassed = false;
    this._practiceMode = false;
    this._lastSession = null;
    this._weldScreen = null;

    this._title   = new TitleScreen(
      () => this._goProcessSelect(false),
      () => this._goProcessSelect(true),
    );

    this._processSelect = new ProcessSelectScreen(
      id => this._onProcessSelected(id),
      () => this._title.show(),
    );

    this._theory = new TheoryScreen(
      id => this._onTheoryDone(id),
      () => this._processSelect.show(),
    );

    this._ppe = new PPEQuizScreen(
      () => this._onPPEPassed(),
      () => this._processSelect.show(),
    );

    this._jointSelect = new JointSelectScreen(
      joint => this._startWeld(joint),
      () => this._ppe.show(),
    );

    this._results = new ResultsScreen(
      () => this._replay(),
      () => this._goProcessSelect(false),
      () => this._nextLesson(),
    );

    this._weldScreen = new WeldingScreen(sessionData => this._onWeldFinished(sessionData));
  }

  start() {
    this._title.show();
  }

  _goProcessSelect(practiceMode) {
    this._practiceMode = practiceMode;
    this._processSelect.show();
  }

  _onProcessSelected(processId) {
    this._processId = processId;
    if (this._practiceMode || this._ppePassed) {
      // Skip theory and quiz in practice mode, or if already passed
      this._jointSelect.show(processId);
    } else {
      this._theory.show(processId);
    }
  }

  _onTheoryDone(processId) {
    if (this._ppePassed) {
      this._jointSelect.show(processId);
    } else {
      this._ppe.show();
    }
  }

  _onPPEPassed() {
    this._ppePassed = true;
    this._jointSelect.show(this._processId);
  }

  _startWeld(jointType) {
    this._currentJoint = jointType;
    // Clean up previous weld screen if any
    this._weldScreen.destroy?.();
    this._weldScreen = new WeldingScreen(sessionData => this._onWeldFinished(sessionData));
    this._weldScreen.start(this._processId, jointType);
  }

  _onWeldFinished(sessionData) {
    this._lastSession = sessionData;
    this._results.show(sessionData);
  }

  _replay() {
    this._startWeld(this._currentJoint ?? 'BUTT');
  }

  _nextLesson() {
    // Cycle to the next process in learning order
    const order = ['STICK', 'MIG', 'FCAW', 'TIG'];
    const idx = order.indexOf(this._processId);
    const next = order[(idx + 1) % order.length];
    this._processId = next;
    this._theory.show(next);
  }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
