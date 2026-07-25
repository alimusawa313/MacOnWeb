/* hero.js — the landing hero: a live clay world where the Mac builds and the
   phone watches. Composition, the build state machine, drag-to-spin, pointer
   parallax, click wobble, theme re-tinting, and responsive layout.

   Progressive enhancement: no WebGL (or reduced motion) degrades gracefully —
   the .stage gets .no3d and the CSS fallback shows instead. */

import * as THREE from 'three';
import { readPalette, studioLights, shadowPuddle, ThemeBinder } from './clay.js';
import { buildMac, buildPhone, buildGear, buildSeal, buildOrb, buildRing, buildString } from './models.js';

const stage = document.getElementById('hero-stage');
if (stage) init(stage);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function init(stage) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!webglOK()) { stage.classList.add('no3d'); return; }

  const canvas = stage.querySelector('canvas');
  const hint = stage.querySelector('.stage-hint');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  let running = false, visible = true; // render-loop state (used by renderOnce during setup)

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.3, 16);

  let palette = readPalette();
  const binder = new ThemeBinder();
  const rig = studioLights(scene);

  // ----- The world (everything that spins together) -----
  const world = new THREE.Group();
  scene.add(world);

  const mac = buildMac(palette, binder);
  const phone = buildPhone(palette, binder);
  const gear = buildGear(palette, binder);
  const seal = buildSeal(palette, binder);
  world.add(mac.group, phone.group, gear.group, seal.group);

  const garnish = [
    { mesh: buildOrb(palette, binder, 'bad', 0.42), speed: 0.7 },
    { mesh: buildOrb(palette, binder, 'good', 0.3), speed: 1.1 },
    { mesh: buildRing(palette, binder, 'warm', 0.5), speed: 0.9 },
    { mesh: buildOrb(palette, binder, 'accent', 0.24), speed: 1.4 },
  ];
  garnish.forEach((g) => world.add(g.mesh));

  const shadow = shadowPuddle(12, 3.2);
  shadow.material.opacity = parseFloat(palette['world-shadow-opacity']);
  scene.add(shadow);

  let string = null;
  function restring(from, to) {
    if (string) { world.remove(string.group); }
    string = buildString(from, to, palette, binder);
    world.add(string.group);
  }

  // ----- Responsive layout: wide / squarish / portrait -----
  const LAYOUTS = {
    wide: {
      cameraZ: 15.5,
      mac: { pos: [-3.3, 0.4, 0], rotY: 0.34, scale: 1 },
      phone: { pos: [3.8, 0.2, 0.6], rot: [-0.04, -0.34, -0.06], scale: 1 },
      gear: { pos: [0.3, 3.1, -2.6], scale: 0.8 },
      seal: { pos: [-6.4, -2.4, 1.6], scale: 0.7 },
      garnish: [[6.9, 3.2, -2], [-6.6, 2.6, -1], [6.6, -2.6, 0.4], [0.6, -3.4, 1.6]],
      string: [[-0.9, -1.1, 0.8], [2.2, -0.6, 0.8]],
      shadowY: -4.9,
    },
    squarish: {
      cameraZ: 18,
      mac: { pos: [-2.5, 1.1, 0], rotY: 0.3, scale: 0.88 },
      phone: { pos: [2.7, -1.5, 0.6], rot: [-0.04, -0.32, -0.06], scale: 0.92 },
      gear: { pos: [3.4, 3.2, -2.6], scale: 0.72 },
      seal: { pos: [-4.9, -3, 1.2], scale: 0.62 },
      garnish: [[5.2, 1.2, -2], [-5, 3, -1], [4.9, 0.6, 0.2], [-1.2, -4, 1.2]],
      string: [[-0.4, -1.4, 0.8], [1.4, -1.6, 0.8]],
      shadowY: -5.2,
    },
    portrait: {
      cameraZ: 20,
      mac: { pos: [0, 2.4, 0], rotY: 0.12, scale: 0.76 },
      phone: { pos: [1.7, -2.9, 0.6], rot: [-0.04, -0.3, -0.06], scale: 0.85 },
      gear: { pos: [-3.3, -1.4, -2.2], scale: 0.62 },
      seal: { pos: [3.4, 1.4, -1.6], scale: 0.52 },
      garnish: [[3.4, 4.6, -2], [-3.4, 3.6, -1], [-2.6, -4.6, 0.4], [-1.4, -1.2, 1.4]],
      string: [[1.4, 0.6, 0.8], [0.9, -1.2, 0.8]],
      shadowY: -6,
    },
  };

  let currentLayout = null;
  function applyLayout(name) {
    if (currentLayout === name) return;
    currentLayout = name;
    const L = LAYOUTS[name];
    camera.position.z = L.cameraZ;
    mac.group.position.set(...L.mac.pos);
    mac.group.rotation.set(-0.04, L.mac.rotY, 0.02);
    mac.group.scale.setScalar(L.mac.scale);
    phone.group.position.set(...L.phone.pos);
    phone.group.rotation.set(...L.phone.rot);
    phone.group.scale.setScalar(L.phone.scale);
    gear.group.position.set(...L.gear.pos);
    gear.group.scale.setScalar(L.gear.scale);
    seal.group.position.set(...L.seal.pos);
    seal.group.scale.setScalar(L.seal.scale);
    garnish.forEach((g, i) => g.mesh.position.set(...L.garnish[i]));
    shadow.position.y = L.shadowY;
    restring(new THREE.Vector3(...L.string[0]), new THREE.Vector3(...L.string[1]));
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyLayout(camera.aspect > 1.5 ? 'wide' : camera.aspect > 0.95 ? 'squarish' : 'portrait');
    renderOnce();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // ----- Theme reactivity -----
  function applyTheme() {
    palette = readPalette();
    binder.apply(palette, rig, shadow);
    setStatusColors();
    renderOnce();
  }
  window.addEventListener('macon:theme', applyTheme);

  // ----- The build state machine: running → passed → repeat -----
  const status = { phase: 'running', t: 0, RUN: 4.2, PASS: 2.8 };
  function setStatusColors() {
    const runToken = status.phase === 'running' ? 'warm' : 'good';
    mac.lamp.material.color.set(palette[runToken]);
    phone.band.material.color.set(palette[runToken]);
    mac.fill.children[0].material.color.set(palette[status.phase === 'running' ? 'accent' : 'good']);
  }

  function tickStatus(dt) {
    status.t += dt;
    if (status.phase === 'running') {
      const p = Math.min(status.t / status.RUN, 1);
      mac.fill.scale.x = Math.max(0.001, p * p * (3 - 2 * p)); // smoothstep fill
      const breathe = 1 + Math.sin(status.t * 5) * 0.16;
      mac.lamp.scale.setScalar(breathe);
      if (p >= 1) { status.phase = 'passed'; status.t = 0; setStatusColors(); }
    } else {
      mac.fill.scale.x = 1;
      mac.lamp.scale.setScalar(1);
      // Seal celebration: pop in, hold, ease out.
      const p = status.t / status.PASS;
      const pop = p < 0.25 ? p / 0.25 : p > 0.8 ? (1 - p) / 0.2 : 1;
      const base = currentLayout ? LAYOUTS[currentLayout].seal.scale : 0.7;
      seal.group.scale.setScalar(base * (0.65 + 0.5 * Math.min(Math.max(pop, 0), 1)));
      if (p >= 1) {
        status.phase = 'running'; status.t = 0;
        mac.fill.scale.x = 0.001;
        setStatusColors();
      }
    }
  }
  setStatusColors();

  // ----- Interaction: parallax, drag-to-spin, click wobble -----
  const spin = { yaw: 0, vel: 0, dragging: false, lastX: 0, moved: 0 };
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  const wobbles = new Map(); // group -> spring state
  const ray = new THREE.Raycaster();
  const clickables = [
    { root: mac.group }, { root: phone.group }, { root: gear.group }, { root: seal.group },
  ];

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    parallax.tx = (e.clientX - r.left) / r.width - 0.5;
    parallax.ty = (e.clientY - r.top) / r.height - 0.5;
    if (spin.dragging) {
      const dx = e.clientX - spin.lastX;
      spin.lastX = e.clientX;
      spin.moved += Math.abs(dx);
      spin.yaw += dx * 0.006;
      spin.vel = dx * 0.006;
    }
  });
  stage.addEventListener('pointerleave', () => { parallax.tx = 0; parallax.ty = 0; });
  canvas.addEventListener('pointerdown', (e) => {
    spin.dragging = true; spin.lastX = e.clientX; spin.moved = 0;
    canvas.classList.add('dragging');
    canvas.setPointerCapture(e.pointerId);
    if (hint) hint.classList.add('fade');
  });
  canvas.addEventListener('pointerup', (e) => {
    spin.dragging = false;
    canvas.classList.remove('dragging');
    if (spin.moved < 6) tapAt(e); // a tap, not a drag
  });
  canvas.addEventListener('pointercancel', () => { spin.dragging = false; canvas.classList.remove('dragging'); });

  function tapAt(e) {
    const r = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    ray.setFromCamera(ndc, camera);
    for (const c of clickables) {
      if (ray.intersectObject(c.root, true).length) {
        wobbles.set(c.root, { t: 0 });
        break;
      }
    }
  }

  function tickWobbles(dt) {
    for (const [root, w] of wobbles) {
      w.t += dt;
      const decay = Math.exp(-w.t * 4);
      const s = 1 + Math.sin(w.t * 18) * 0.12 * decay;
      root.scale.setScalar((currentLayout ? layoutScaleOf(root) : 1) * s);
      if (decay < 0.02) {
        root.scale.setScalar(layoutScaleOf(root));
        wobbles.delete(root);
      }
    }
  }
  function layoutScaleOf(root) {
    const L = LAYOUTS[currentLayout];
    if (root === mac.group) return L.mac.scale;
    if (root === phone.group) return L.phone.scale;
    if (root === gear.group) return L.gear.scale;
    if (root === seal.group) return L.seal.scale;
    return 1;
  }

  // ----- Render loop -----
  const clock = new THREE.Clock();

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Idle float + sway, phased per object (WorldScene rhythm: 2.2–5s beats).
    mac.group.position.y = LAYOUTS[currentLayout].mac.pos[1] + Math.sin(t * (Math.PI * 2 / 5.2)) * 0.22;
    mac.group.rotation.y = LAYOUTS[currentLayout].mac.rotY + Math.sin(t * (Math.PI * 2 / 5)) * 0.06;
    phone.group.position.y = LAYOUTS[currentLayout].phone.pos[1] + Math.sin(t * (Math.PI * 2 / 4.2) + 1.3) * 0.26;
    phone.group.rotation.z = LAYOUTS[currentLayout].phone.rot[2] + Math.sin(t * (Math.PI * 2 / 6) + 0.7) * 0.04;
    gear.group.rotation.z -= dt * (status.phase === 'running' ? 1.4 : 0.35);
    gear.group.position.y = LAYOUTS[currentLayout].gear.pos[1] + Math.sin(t * (Math.PI * 2 / 3.4) + 2.1) * 0.18;
    seal.group.rotation.z += dt * 0.7;
    garnish.forEach((g, i) => {
      g.mesh.position.y = LAYOUTS[currentLayout].garnish[i][1] + Math.sin(t * g.speed + i * 1.7) * 0.3;
      g.mesh.rotation.x += dt * 0.2 * g.speed;
      g.mesh.rotation.y += dt * 0.26 * g.speed;
    });

    // The bead rides the string, over and over.
    if (string) {
      const cycle = (t % 3.0) / 2.2;
      const bt = Math.min(Math.max(cycle, 0), 1);
      string.bead.position.copy(string.curve.getPoint(bt * bt * (3 - 2 * bt)));
    }

    tickStatus(dt);
    tickWobbles(dt);

    // Spin physics: inertia + soft spring home, plus pointer parallax.
    if (!spin.dragging) {
      spin.yaw += spin.vel;
      spin.vel *= 0.94;
      spin.yaw += (0 - spin.yaw) * 0.03;
    }
    parallax.x += (parallax.tx - parallax.x) * 0.06;
    parallax.y += (parallax.ty - parallax.y) * 0.06;
    world.rotation.y = spin.yaw + parallax.x * 0.14;
    world.rotation.x = parallax.y * 0.07;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function renderOnce() { if (!running) renderer.render(scene, camera); }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { clock.getDelta(); requestAnimationFrame(frame); }
  }

  if (reduce) {
    // Static but complete: show the passed state, render once.
    mac.fill.scale.x = 1;
    status.phase = 'passed';
    setStatusColors();
    if (hint) hint.classList.add('fade');
    renderOnce();
  } else {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      setRunning(visible && !document.hidden);
    }, { threshold: 0.05 }).observe(stage);
    document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
    setRunning(true);
  }
}
