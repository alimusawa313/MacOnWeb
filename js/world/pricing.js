/* pricing.js, the pricing hero: the house you're free in on the left, the globe
   you pay to reach on the right, and a run of clay beads travelling between
   them. Says the page's headline before anyone reads a price.

   Same shape as notfound.js: shared clay kit, theme-bound materials, a `no3d`
   fallback when WebGL is missing, and a still frame under reduced motion. */

import * as THREE from 'three';
import { readPalette, studioLights, shadowPuddle, ThemeBinder, clay } from './clay.js';
import { buildHouse, buildGlobe } from './models.js';

const stage = document.getElementById('pricing-stage');
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
  const camera = new THREE.PerspectiveCamera(32, 2.1, 0.1, 60);
  camera.position.set(0, 0.4, 15);

  let palette = readPalette();
  const binder = new ThemeBinder();
  const rig = studioLights(scene);

  const house = buildHouse(palette, binder);
  house.group.position.set(-4.1, -0.2, 0);
  house.group.rotation.y = 0.32;
  scene.add(house.group);

  const globe = buildGlobe(palette, binder);
  globe.group.position.set(4.3, 0.3, 0);
  scene.add(globe.group);

  // The hop between them: beads that light in sequence, house → globe, the way
  // the apps draw a hand-off.
  const beads = [];
  const beadMat = binder.bind(clay(palette.warm), 'warm');
  const from = new THREE.Vector3(-2.2, 0.5, 0.8);
  const to = new THREE.Vector3(2.2, 0.9, 0.8);
  const arc = new THREE.QuadraticBezierCurve3(
    from, new THREE.Vector3(0, 2.9, 0.8), to);
  arc.getPoints(6).forEach((p) => {
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), beadMat.clone());
    bead.position.copy(p);
    bead.material.transparent = true;
    bead.material.opacity = 0.25;
    scene.add(bead);
    beads.push(bead);
  });

  const shadow = shadowPuddle(13, 3.4);
  shadow.position.y = -2.6;
  shadow.material.opacity = parseFloat(palette['world-shadow-opacity']);
  scene.add(shadow);

  window.addEventListener('macon:theme', () => {
    palette = readPalette();
    binder.apply(palette, rig, shadow);
    // Bead materials are clones, so the binder doesn't reach them.
    beads.forEach((b) => b.material.color.set(palette.warm));
    house.windows.forEach((w) => w.material.color.set(palette.warm));
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

  // A poke flares the house's windows and kicks the globe into a faster spin.
  let flare = -1, spin = 1;
  canvas.addEventListener('pointerdown', () => { flare = 0; spin = 5.5; });

  if (reduce) { renderer.render(scene, camera); return; }

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    house.group.position.y = -0.2 + Math.sin(t * 1.15) * 0.13;
    globe.group.position.y = 0.3 + Math.sin(t * 0.95 + 1.1) * 0.16;
    globe.group.rotation.y += dt * 0.28 * spin;
    globe.orbit.rotation.z += dt * 0.55 * spin;
    spin += (1 - spin) * dt * 2.2;   // ease back to the idle rate

    // Beads light one after another, so the run reads as direction of travel.
    beads.forEach((bead, i) => {
      const phase = (t * 0.9 - i * 0.16) % 2;
      bead.material.opacity = 0.25 + Math.max(0, 1 - Math.abs(phase - 0.5) * 4) * 0.7;
    });

    if (flare >= 0) {
      flare += dt;
      const decay = Math.exp(-flare * 3);
      house.windows.forEach((w) => w.scale.setScalar(1 + Math.sin(flare * 16) * 0.18 * decay));
      if (decay < 0.02) { house.windows.forEach((w) => w.scale.setScalar(1)); flare = -1; }
    }

    renderer.render(scene, camera);
  })();
}
