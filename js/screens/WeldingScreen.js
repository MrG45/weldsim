import * as THREE from 'three';
import { PROCESSES } from '../data/processes.js';
import { SceneBuilder } from '../three/SceneBuilder.js';
import { TorchController } from '../three/TorchController.js';
import { WeldRenderer } from '../three/WeldRenderer.js';
import { HAZVisualizer } from '../three/HAZVisualizer.js';
import { ParticleSystem } from '../three/ParticleSystem.js';
import { ArcLight } from '../three/ArcLight.js';
import { HUDController } from '../ui/HUDController.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { TutorialOverlay } from '../ui/TutorialOverlay.js';
import { AchievementSystem } from '../ui/AchievementSystem.js';
import { scoreAll, computeHeatInput } from '../sim/WeldPhysics.js';
import { detectDefects } from '../sim/DefectDetector.js';
import { ProcessBehavior } from '../sim/ProcessBehavior.js';

export class WeldingScreen {
  constructor(onFinish) {
    this._onFinish = onFinish;
    this._canvas   = document.getElementById('weld-canvas');
    this._running  = false;
    this._raf      = null;
  }

  start(processId, jointType = 'BUTT') {
    this._processId  = processId;
    this._processConfig = PROCESSES[processId];
    this._jointType  = jointType;

    // Build Three.js scene
    const { scene, workpieceGroup } = SceneBuilder.build(jointType);
    this._scene          = scene;
    this._workpieceGroup = workpieceGroup;
    this._weldZ          = workpieceGroup.weldZ ?? 0;
    this._weldRange      = workpieceGroup.weldXrange ?? { min: -260, max: 260 };
    this._camera         = SceneBuilder.createCamera();
    this._renderer       = SceneBuilder.createRenderer(this._canvas);
    this._composer       = SceneBuilder.createComposer(this._renderer, this._scene, this._camera);

    // Create torch mesh
    this._torchMesh = SceneBuilder.createTorchMesh(processId);
    this._torchMesh.scale.setScalar(1.35);
    scene.add(this._torchMesh);

    // Systems
    this._torch   = new TorchController(this._camera, scene, processId);
    this._weld    = new WeldRenderer(scene);
    this._haz     = new HAZVisualizer(workpieceGroup);
    this._sparks  = new ParticleSystem(scene);
    this._arcLight= new ArcLight(this._torchMesh);
    this._audio   = new AudioEngine();
    this._hud     = new HUDController();
    this._behavior= new ProcessBehavior(this._processConfig);
    this._tutorial= new TutorialOverlay(processId, this._hud);

    this._hud.setProcess(processId);

    // Session state
    this._defectLog   = [];
    this._scoreAccum  = { arc: 0, speed: 0, heat: 0, work: 0, travel: 0, quality: 0 };
    this._scoreFrames = 0;
    this._heatAccum   = 0;
    this._clock       = new THREE.Clock();

    // Show UI
    this._hud.show();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));

    // Handle window resize
    this._onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      this._camera.aspect = w / h;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(w, h);
      this._composer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);

    // Wire up finish button — use onclick to replace any previous listener
    const finishBtn = document.getElementById('btn-finish-weld');
    if (finishBtn) finishBtn.onclick = () => this._finish();

    this._running = true;
    this._loop();
    this._tutorial.show();
    AchievementSystem.unlock('first_arc');
  }

  _loop() {
    if (!this._running) return;
    this._raf = requestAnimationFrame(() => this._loop());

    const dt = Math.min(this._clock.getDelta(), 0.05); // cap at 50ms

    // 1. Read raw torch state
    let torchState = this._torch.update(dt);

    // 2. Apply process-specific behavior modifications
    const amps  = this._hud.amps;
    const volts = this._hud.volts;
    const rawParams = {
      ...torchState,
      amps,
      volts,
      materialThickness: 6,
      windFactor: 0,
      position: torchState.position,
    };
    const params = this._behavior.update(rawParams, dt, this._hud);
    params.position.z = this._weldZ;
    const surfaceY = this._workpieceGroup.surfaceY ?? 0;
    params.position.y += surfaceY;
    const puddlePosition = params.position.clone();
    puddlePosition.y = surfaceY + 0.45;

    // 3. Position the torch mesh
    this._torchMesh.position.copy(params.position);
    this._torchMesh.position.y += 2; // offset so glow/core sit at the live arc
    this._torchMesh.rotation.set(
      THREE.MathUtils.degToRad(params.travelAngle),
      0,
      THREE.MathUtils.degToRad(-params.workAngle),
    );

    // Make glow disc face camera
    const glowDisc = this._torchMesh.getObjectByName('glowDisc');
    const glowCore = this._torchMesh.getObjectByName('glowCore');
    if (glowDisc) glowDisc.lookAt(this._camera.position);
    if (glowCore) glowCore.lookAt(this._camera.position);

    // Update electrode visual (Stick burn-down)
    if (this._processConfig.electrodeConsumption) {
      const electrode = this._torchMesh.getObjectByName('electrode');
      if (electrode) {
        const lenFraction = this._behavior.electrodeRemaining / 350;
        electrode.scale.y = Math.max(0.02, lenFraction);
        electrode.position.y = -150 * lenFraction;
      }
    }

    if (params.arcOn) {
      // Init audio on first arc (browser autoplay)
      this._audio.init();

      // 4. Compute scores
      const effectiveAmps = params.amps * (params.pedalFactor ?? 1.0);
      const heatInput = computeHeatInput(effectiveAmps, params.volts, Math.max(1, params.travelSpeed));
      params.effectiveAmps = effectiveAmps;
      params.heatInput = heatInput;
      const scores  = scoreAll(params, this._processConfig);

      // Accumulate for session average
      this._scoreAccum.arc     += scores.arc;
      this._scoreAccum.speed   += scores.speed;
      this._scoreAccum.heat    += scores.heat;
      this._scoreAccum.work    += scores.work;
      this._scoreAccum.travel  += scores.travel;
      this._scoreAccum.quality += scores.quality;
      this._scoreFrames++;
      this._heatAccum += heatInput;

      // 5. Visual systems
      this._weld.addSample(puddlePosition, scores.quality, heatInput, this._processConfig);
      this._sparks.emit(params.position, scores.quality, heatInput, params.arcLength, this._processConfig.arcLengthOptimal);
      this._arcLight.update(params, this._camera, scores.quality);
      this._haz.applyHeat(puddlePosition, heatInput);

      // 6. Audio
      this._audio.update(params.arcLength, this._processConfig.arcLengthOptimal, true, scores.quality);

      // 7. HUD
      this._hud.update(params, scores, heatInput, this._processConfig, dt);

      // 8. Defect detection (sample every 200ms worth of motion)
      const defects = detectDefects({ ...params, position: puddlePosition, heatInput }, this._processConfig);
      this._defectLog.push(...defects);

      // Spatter sound
      if (defects.some(d => d.type === 'SPATTER')) {
        if (Math.random() < 0.05) this._audio.spatterClick();
      }

    } else {
      // Arc off
      this._arcLight.update({ arcOn: false }, this._camera, 0);
      this._audio.update(0, this._processConfig.arcLengthOptimal, false, 0);
      this._hud.update(params, { arc: 0, speed: 0, work: 0, travel: 0, quality: 0 }, 0, this._processConfig, dt);

      // Cooling ticks on fresh bead
      if (this._weld.getSamples().length > 0 && Math.random() < 0.01) {
        this._audio.coolingTick();
      }
    }

    // 9. Always: cool down, update particles, HAZ flush, render
    this._weld.update();
    this._sparks.update(dt);
    this._haz.cool(dt);
    this._haz.flush();
    this._tutorial.update(torchState, dt);

    this._composer.render();
  }

  _finish() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);

    const frames = Math.max(1, this._scoreFrames);
    const avgScores = {
      arc:     this._scoreAccum.arc     / frames,
      speed:   this._scoreAccum.speed   / frames,
      heat:    this._scoreAccum.heat    / frames,
      work:    this._scoreAccum.work    / frames,
      travel:  this._scoreAccum.travel  / frames,
      quality: this._scoreAccum.quality / frames,
    };
    const coverage = this._computeCoverage();
    avgScores.quality = Math.max(0, Math.min(1, avgScores.quality * (0.55 + coverage * 0.45)));

    const avgAmps   = this._hud.amps;
    const avgVolts  = this._hud.volts;
    const avgHeatInput = this._scoreFrames > 0
      ? this._heatAccum / frames
      : computeHeatInput(avgAmps, avgVolts, 225);

    this._hud.hide();
    this._tutorial.hide();

    window.removeEventListener('resize', this._onResize);

    this._onFinish({
      processId:  this._processId,
      jointType:  this._jointType,
      scores:     avgScores,
      heatInput:  avgHeatInput,
      coverage,
      defectLog:  this._defectLog,
    });
  }

  _computeCoverage() {
    const samples = this._weld?.getSamples?.() ?? [];
    if (samples.length < 2) return 0;

    const minX = this._weldRange.min;
    const maxX = this._weldRange.max;
    const span = Math.max(1, maxX - minX);
    const bucketCount = 36;
    const buckets = new Set();

    for (const sample of samples) {
      const t = (sample.position.x - minX) / span;
      if (t < 0 || t > 1) continue;
      buckets.add(Math.min(bucketCount - 1, Math.floor(t * bucketCount)));
    }

    return buckets.size / bucketCount;
  }

  destroy() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._audio?.destroy();
    this._composer?.dispose();
    this._renderer?.dispose();
    window.removeEventListener('resize', this._onResize);
  }
}
