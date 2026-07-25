/* notfound.js — the 404 mascot: a googly-eyed clay blob (Monster world energy)
   that bobs, follows the cursor with its pupils, and wobbles when poked.
   Reuses the shared clay kit; degrades to the plain icon without WebGL. */

import * as THREE from 'three';
import { readPalette, studioLights, shadowPuddle, ThemeBinder } from './clay.js';
import { buildBlob } from './models.js';

const stage = document.getElementById('nf-stage');
if (stage) {
  let ok = false;
  try {
    const c = document.createElement('canvas');
    ok = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { /* no webgl */ }
  if (!ok) stage.classList.add('no3d');
  else init(stage);
}

function init(stage) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = stage.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 0.2, 8);

  let palette = readPalette();
  const binder = new ThemeBinder();
  const rig = studioLights(scene);

  const blob = buildBlob(palette, binder, 'accent', 1.4);
  scene.add(blob.group);

  const shadow = shadowPuddle(5, 1.6);
  shadow.position.y = -2.4;
  shadow.material.opacity = parseFloat(palette['world-shadow-opacity']);
  scene.add(shadow);

  window.addEventListener('macon:theme', () => {
    palette = readPalette();
    binder.apply(palette, rig, shadow);
    if (reduce) renderer.render(scene, camera);
  });

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    look.tx = (e.clientX / innerWidth - 0.5) * 2;
    look.ty = (e.clientY / innerHeight - 0.5) * 2;
  });

  let wobble = -1;
  canvas.addEventListener('pointerdown', () => { wobble = 0; });

  if (reduce) { renderer.render(scene, camera); return; }

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    blob.group.position.y = Math.sin(t * 1.3) * 0.18;
    blob.group.rotation.y = Math.sin(t * 0.6) * 0.12;

    look.x += (look.tx - look.x) * 0.08;
    look.y += (look.ty - look.y) * 0.08;
    blob.eyes.forEach(({ pupil }) => {
      pupil.position.x = look.x * 0.2;
      pupil.position.y = -look.y * 0.14;
    });

    if (wobble >= 0) {
      wobble += dt;
      const decay = Math.exp(-wobble * 4);
      blob.group.scale.setScalar(1 + Math.sin(wobble * 18) * 0.14 * decay);
      if (decay < 0.02) { blob.group.scale.setScalar(1); wobble = -1; }
    }

    renderer.render(scene, camera);
  })();
}
