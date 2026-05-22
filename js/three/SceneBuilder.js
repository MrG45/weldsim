import * as THREE from 'three';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }        from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }   from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }        from 'three/addons/postprocessing/OutputPass.js';

// 1 Three.js unit = 1 mm
// Workpiece surface at Y = 0
// Weld joint runs along X axis from -150 to +150
// Camera looks from positive Z/Y toward origin

export class SceneBuilder {
  static build(jointType = 'BUTT') {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101722);
    scene.fog = new THREE.Fog(0x101722, 1800, 5600);

    SceneBuilder._addLighting(scene);
    SceneBuilder._addBooth(scene);
    SceneBuilder._addTable(scene);
    const workpieceGroup = SceneBuilder._addWorkpiece(scene, jointType);

    return { scene, workpieceGroup };
  }

  static createCamera() {
    const cam = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 1, 10000);
    cam.position.set(0, 340, 650);
    cam.lookAt(0, 8, 0);
    return cam;
  }

  static createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    return renderer;
  }

  static createComposer(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);

    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,   // strength — warm but not overdone
      0.40,   // radius
      0.62,   // threshold — only emissive/arc elements bloom, not general lit surfaces
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    return composer;
  }

  static _addLighting(scene) {
    // Ambient fills the shadows so the scene isn't a black void
    const ambient = new THREE.AmbientLight(0x7892b0, 1.45);
    scene.add(ambient);

    // Main overhead warm light — the primary scene illumination
    const mainLight = new THREE.DirectionalLight(0xf1f7ff, 2.25);
    mainLight.position.set(120, 520, 240);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 2000;
    mainLight.shadow.camera.left = -500;
    mainLight.shadow.camera.right = 500;
    mainLight.shadow.camera.top = 500;
    mainLight.shadow.camera.bottom = -500;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    // Cool fill from camera-left — brings out the metal reflections
    const fillLight = new THREE.DirectionalLight(0x8ab9ff, 1.35);
    fillLight.position.set(-300, 330, 420);
    scene.add(fillLight);

    const cameraFill = new THREE.DirectionalLight(0xc8dcff, 1.15);
    cameraFill.position.set(0, 260, 680);
    scene.add(cameraFill);

    // Tight spot over the weld table — focused on the work area
    const workSpot = new THREE.SpotLight(0xfff5e0, 3.4, 1050, Math.PI / 5, 0.52, 1.45);
    workSpot.position.set(0, 560, 130);
    workSpot.target.position.set(0, 0, 0);
    workSpot.castShadow = false;
    scene.add(workSpot);
    scene.add(workSpot.target);

    // Hemisphere — warm sky / dark ground for subtle color variation
    const hemi = new THREE.HemisphereLight(0x8aa9dd, 0x17202c, 0.78);
    scene.add(hemi);

    SceneBuilder._addCeilingFixtures(scene);
  }

  static _addCeilingFixtures(scene) {
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0cc,
      emissiveIntensity: 4.0,  // high so bloom makes them glow
      roughness: 1.0,
      metalness: 0.0,
    });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });

    [-110, 110].forEach(z => {
      // Glowing tube
      const tube = new THREE.Mesh(new THREE.BoxGeometry(560, 8, 22), tubeMat);
      tube.position.set(0, 758, z);
      scene.add(tube);
      // Metal housing around the tube
      const housing = new THREE.Mesh(new THREE.BoxGeometry(580, 22, 38), housingMat);
      housing.position.set(0, 769, z);
      scene.add(housing);
    });
  }

  static _addBooth(scene) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x26313d,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(2000, 1200), wallMat);
    backWall.position.set(0, 400, -600);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), wallMat);
    leftWall.position.set(-700, 400, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), wallMat);
    rightWall.position.set(700, 400, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Floor — concrete with subtle grid texture
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshStandardMaterial({
        map: SceneBuilder._makeFloorTexture(),
        roughness: 0.95,
        metalness: 0.0,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -910;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 1 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 800;
    scene.add(ceiling);

    SceneBuilder._addCurtains(scene);
  }

  static _makeFloorTexture() {
    const S = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = S;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0e0e12';
    ctx.fillRect(0, 0, S, S);
    // Expansion joint grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const v = i * (S / 4);
      ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(S, v); ctx.stroke();
    }
    // Concrete grain
    const img = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * 14;
      img.data[i] = Math.min(255, img.data[i] + n);
      img.data[i+1] = Math.min(255, img.data[i+1] + n);
      img.data[i+2] = Math.min(255, img.data[i+2] + n);
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }

  static _makeSteelTexture() {
    const W = 512, H = 256;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Industrial steel — medium dark gray with blue-steel tint, clearly visible under lighting
    ctx.fillStyle = '#626b78';
    ctx.fillRect(0, 0, W, H);

    // Mill-scale variation — slightly lighter patches for texture
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 8 + Math.random() * 50;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(130, 92, 48, ${0.07 + Math.random() * 0.13})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Horizontal grinding/brushed marks — light streaks to show surface finish
    for (let i = 0; i < 120; i++) {
      const y = Math.random() * H;
      const b = 116 + Math.floor(Math.random() * 44);
      ctx.strokeStyle = `rgba(${b},${b + 2},${b + 6},${0.10 + Math.random() * 0.15})`;
      ctx.lineWidth = 0.4 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + (Math.random() - 0.5) * 3);
      ctx.stroke();
    }

    // Scratch lines
    for (let i = 0; i < 12; i++) {
      const y1 = Math.random() * H;
      ctx.strokeStyle = `rgba(150,158,170,${0.20 + Math.random() * 0.22})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(W, y1 + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }

    // Pixel grain
    const img = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      img.data[i]   = Math.max(0, Math.min(255, img.data[i]   + n));
      img.data[i+1] = Math.max(0, Math.min(255, img.data[i+1] + n));
      img.data[i+2] = Math.max(0, Math.min(255, img.data[i+2] + n));
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }

  static _addCurtains(scene) {
    const curtainMat = new THREE.MeshLambertMaterial({ color: 0x0b2418, transparent: true, opacity: 0.28 });
    [-860, 860].forEach(x => {
      const curtain = new THREE.Mesh(new THREE.PlaneGeometry(180, 760), curtainMat);
      curtain.position.set(x, 200, -520);
      scene.add(curtain);
    });
  }

  static _addTable(scene) {
    // Table top
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(1040, 24, 650),
      new THREE.MeshStandardMaterial({ color: 0x76808c, roughness: 0.62, metalness: 0.62 })
    );
    tableTop.position.set(0, -120, 0);  // surface at Y = -110
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    scene.add(tableTop);

    // Table legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0.4 });
    [[-460, -300], [460, -300], [-460, 300], [460, 300]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(30, 700, 30), legMat);
      leg.position.set(x, -475, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Welding machine (off to the right)
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x3f4a5c, roughness: 0.7, metalness: 0.5 });
    const machine = new THREE.Mesh(new THREE.BoxGeometry(200, 400, 150), machineMat);
    machine.position.set(650, 80, -150);
    machine.castShadow = true;
    scene.add(machine);

    // Machine panel detail
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5 });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(150, 100, 5), panelMat);
    panel.position.set(650, 180, -74);
    scene.add(panel);

    // Ground clamp cable
    const cableMat = new THREE.MeshLambertMaterial({ color: 0x1a1a00 });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 400, 6), cableMat);
    cable.position.set(430, -60, -20);
    cable.rotation.z = 0.3;
    scene.add(cable);
  }

  static _addWorkpiece(scene, jointType) {
    const group = new THREE.Group();
    scene.add(group);

    const steelTex = SceneBuilder._makeSteelTexture();
    const metalMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      roughness: 0.56,
      metalness: 0.72,
    });

    // Create HAZ texture (applied to top face)
    const hazTexSize = 256;
    const hazData = new Uint8Array(hazTexSize * hazTexSize * 4);
    const hazTex = new THREE.DataTexture(hazData, hazTexSize, hazTexSize, THREE.RGBAFormat);
    hazTex.colorSpace = THREE.LinearSRGBColorSpace;
    hazTex.needsUpdate = true;

    const topMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      roughness: 0.58,
      metalness: 0.76,
      emissiveMap: hazTex,
      emissive: new THREE.Color(1, 1, 1),
      emissiveIntensity: 0.75,
    });

    switch (jointType) {
      case 'T':     SceneBuilder._buildTJoint(group, metalMat, topMat); break;
      case 'LAP':   SceneBuilder._buildLapJoint(group, metalMat, topMat); break;
      case 'CORNER':SceneBuilder._buildCornerJoint(group, metalMat, topMat); break;
      default:      SceneBuilder._buildButtJoint(group, metalMat, topMat); break;
    }

    // Invisible raycaster plane at Y = 0 (torch positioning)
    const rayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(760, 500),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    rayPlane.rotation.x = -Math.PI / 2;
    rayPlane.name = 'rayPlane';
    group.add(rayPlane);

    group.hazTex = hazTex;
    group.hazData = hazData;
    group.hazTexSize = hazTexSize;
    group.jointType = jointType;

    return group;
  }

  static _buildButtJoint(group, metalMat, topMat) {
    const plateGeo = new THREE.BoxGeometry(640, 8, 142);
    const frontPlate = new THREE.Mesh(plateGeo, [metalMat, metalMat, topMat, metalMat, metalMat, metalMat]);
    const backPlate  = new THREE.Mesh(plateGeo, [metalMat, metalMat, topMat, metalMat, metalMat, metalMat]);
    frontPlate.position.set(0, 0, 76);
    backPlate.position.set(0, 0, -76);
    frontPlate.castShadow = backPlate.castShadow = true;
    frontPlate.receiveShadow = backPlate.receiveShadow = true;
    group.add(frontPlate, backPlate);

    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(640, 9, 10),
      new THREE.MeshStandardMaterial({
        color: 0xcc5500,
        emissive: 0xff6600,
        emissiveIntensity: 0.75,
        roughness: 0.9,
      })
    );
    groove.position.set(0, 0, 0);
    group.add(groove);

    SceneBuilder._addJointMarkers(group, 0, 5, 280);

    group.weldAxis = new THREE.Vector3(1, 0, 0);
    group.weldZmin = -180; group.weldZmax = 180;
    group.weldXrange = { min: -260, max: 260 };
    group.weldZ = 0;
    group.surfaceY = 5;
  }

  static _buildTJoint(group, metalMat, topMat) {
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(640, 8, 170),
      [metalMat, metalMat, topMat, metalMat, metalMat, metalMat]
    );
    basePlate.position.set(0, 0, 0);
    basePlate.castShadow = basePlate.receiveShadow = true;
    group.add(basePlate);

    const vertPlate = new THREE.Mesh(new THREE.BoxGeometry(640, 54, 8), metalMat);
    vertPlate.position.set(0, 31, -42);
    vertPlate.castShadow = vertPlate.receiveShadow = true;
    group.add(vertPlate);

    // Fillet zone highlight along the base of the vertical plate
    const filletLine = new THREE.Mesh(
      new THREE.BoxGeometry(640, 4, 5),
      new THREE.MeshStandardMaterial({ color: 0xcc5500, emissive: 0xff6600, emissiveIntensity: 0.75, roughness: 0.9 })
    );
    filletLine.position.set(0, 3, -37);
    group.add(filletLine);

    SceneBuilder._addJointMarkers(group, -37, 5, 280);
    group.weldAxis = new THREE.Vector3(1, 0, 0);
    group.weldXrange = { min: -260, max: 260 };
    group.weldZ = -37;
    group.surfaceY = 5;
  }

  static _buildLapJoint(group, metalMat, topMat) {
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(640, 8, 150), metalMat);
    bottom.position.set(0, 0, 30);
    bottom.castShadow = bottom.receiveShadow = true;
    group.add(bottom);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(640, 8, 150),
      [metalMat, metalMat, topMat, metalMat, metalMat, metalMat]
    );
    top.position.set(0, 6, -30);
    top.castShadow = top.receiveShadow = true;
    group.add(top);

    // Edge of the top plate = weld location
    const edgeLine = new THREE.Mesh(
      new THREE.BoxGeometry(640, 8, 5),
      new THREE.MeshStandardMaterial({ color: 0xcc5500, emissive: 0xff6600, emissiveIntensity: 0.75, roughness: 0.9 })
    );
    edgeLine.position.set(0, 6, 30);
    group.add(edgeLine);

    SceneBuilder._addJointMarkers(group, 30, 9, 280);
    group.weldAxis = new THREE.Vector3(1, 0, 0);
    group.weldXrange = { min: -260, max: 260 };
    group.weldZ = 30;
    group.surfaceY = 9;
  }

  static _buildCornerJoint(group, metalMat, topMat) {
    const hPlate = new THREE.Mesh(
      new THREE.BoxGeometry(640, 8, 95),
      [metalMat, metalMat, topMat, metalMat, metalMat, metalMat]
    );
    hPlate.position.set(0, 0, 30);
    hPlate.castShadow = hPlate.receiveShadow = true;
    group.add(hPlate);

    const vPlate = new THREE.Mesh(new THREE.BoxGeometry(640, 54, 8), metalMat);
    vPlate.position.set(0, 31, -13);
    vPlate.castShadow = vPlate.receiveShadow = true;
    group.add(vPlate);

    // Corner joint line
    const cornerLine = new THREE.Mesh(
      new THREE.BoxGeometry(640, 4, 5),
      new THREE.MeshStandardMaterial({ color: 0xcc5500, emissive: 0xff6600, emissiveIntensity: 0.75, roughness: 0.9 })
    );
    cornerLine.position.set(0, 3, 30);
    group.add(cornerLine);

    SceneBuilder._addJointMarkers(group, 30, 5, 280);
    group.weldAxis = new THREE.Vector3(1, 0, 0);
    group.weldXrange = { min: -260, max: 260 };
    group.weldZ = 30;
    group.surfaceY = 5;
  }

  // Subtle joint guide — line + dot markers + clean label near the joint surface
  static _addJointMarkers(group, jointZ, surfaceY, halfLength = 148) {
    // Glowing line along the joint
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfLength, surfaceY + 1, jointZ),
      new THREE.Vector3(halfLength,  surfaceY + 1, jointZ),
    ]);
    group.add(new THREE.Line(lineGeo,
      new THREE.LineBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0.65 })
    ));

    // Small sphere dots at intervals
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x22ff88 });
    [-240, -120, 0, 120, 240].forEach(x => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), dotMat);
      dot.position.set(x, surfaceY + 2, jointZ);
      group.add(dot);
    });

    // "◄ WELD JOINT ►" label — flat, close to the surface, tilted toward camera
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 56;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 56);
    ctx.fillStyle = 'rgba(34,255,136,0.88)';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◄   WELD JOINT   ►', 256, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(195, 22),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    label.rotation.x = -1.05;
    label.position.set(0, surfaceY + 5, jointZ + 48);
    group.add(label);
  }

  // Creates the torch mesh (moves each frame)
  static createTorchMesh(processId) {
    const group = new THREE.Group();

    const isSTICK = processId === 'STICK';
    const isTIG   = processId === 'TIG';

    // ── Materials ──────────────────────────────────────────────
    const bodyMat   = new THREE.MeshStandardMaterial({ color: 0x2a2c38, roughness: 0.78, metalness: 0.15 });
    const metalMat  = new THREE.MeshStandardMaterial({ color: 0x4a4e5e, roughness: 0.25, metalness: 0.90 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0x8c5528, roughness: 0.22, metalness: 0.88 });
    const brassMat  = new THREE.MeshStandardMaterial({ color: 0xb88a38, roughness: 0.18, metalness: 0.95 });

    // ── Nozzle / Cup (bottom) ──────────────────────────────────
    const nozzleMat = isSTICK ? metalMat : isTIG ? metalMat : copperMat;
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(7, 9.5, 48, 12), nozzleMat);
    nozzle.position.y = 24;
    group.add(nozzle);

    // Nozzle tip ring
    const tipRing = new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 6, 12), brassMat);
    tipRing.position.y = 1;
    group.add(tipRing);

    // ── Gas diffuser (connects nozzle to swan neck) ────────────
    const diffuser = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 8, 22, 12), metalMat);
    diffuser.position.y = 60;
    group.add(diffuser);

    // ── Swan neck (slight curve approximated with tilted cylinders) ──
    const neck1 = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 55, 10), metalMat);
    neck1.position.set(-2, 100, 0);
    neck1.rotation.z = 0.08;
    group.add(neck1);

    const neck2 = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 40, 10), metalMat);
    neck2.position.set(-7, 148, 0);
    neck2.rotation.z = 0.18;
    group.add(neck2);

    // ── Body / handle ──────────────────────────────────────────
    const body = new THREE.Mesh(new THREE.CylinderGeometry(13, 14.5, 115, 10), bodyMat);
    body.position.set(-18, 215, 0);
    body.rotation.z = 0.32;
    group.add(body);

    // Grip ridges for realism
    for (let i = 0; i < 5; i++) {
      const ridge = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 4, 10),
        new THREE.MeshStandardMaterial({ color: 0x1e2030, roughness: 0.95 })
      );
      ridge.position.set(-13 - i * 2, 178 + i * 18, 0);
      ridge.rotation.z = 0.32;
      group.add(ridge);
    }

    // Trigger bump
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(10, 22, 16), bodyMat);
    trigger.position.set(-30, 200, 0);
    trigger.rotation.z = 0.32;
    group.add(trigger);

    // Cable connector at top
    const connector = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 18, 8), metalMat);
    connector.position.set(-30, 272, 0);
    connector.rotation.z = 0.32;
    group.add(connector);

    // ── STICK electrode ────────────────────────────────────────
    if (isSTICK) {
      const electrode = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 300, 6),
        new THREE.MeshStandardMaterial({ color: 0xccaa44, roughness: 0.5 })
      );
      electrode.position.y = -150;
      electrode.name = 'electrode';
      group.add(electrode);
    }

    // ── MIG wire guide stub ────────────────────────────────────
    if (!isSTICK && !isTIG) {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 28, 6),
        new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.25, metalness: 0.95 })
      );
      wire.position.y = -10;
      group.add(wire);
    }

    // ── Glow disc / core (billboards, arc visual) ──────────────
    const glowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(22, 16),
      new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    glowDisc.name = 'glowDisc';
    glowDisc.position.y = -2;
    group.add(glowDisc);

    const glowCore = new THREE.Mesh(
      new THREE.CircleGeometry(6, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    glowCore.name = 'glowCore';
    glowCore.position.y = -2;
    group.add(glowCore);

    const arcLight = new THREE.PointLight(0x88aaff, 0, 800, 1.5);
    arcLight.name = 'arcLight';
    arcLight.castShadow = false;
    group.add(arcLight);

    return group;
  }
}
