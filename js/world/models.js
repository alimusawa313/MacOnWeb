/* models.js, clay model builders for the MacOn world.
   Dimensions and proportions mirror the apps' SceneKit machines
   (WorldScene.swift): the monitor Mac, the companion phone, the gear,
   the status seal, and the floating garnish. Every builder returns the
   group plus handles to the parts the animation loop needs. */

import * as THREE from 'three';
import { RoundedBoxGeometry } from './../vendor/RoundedBoxGeometry.js';
import { clay, flat } from './clay.js';

function box(w, h, d, r, material) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), material);
}

/* ---------- The Mac, a clay monitor with a live screen ---------- */

export function buildMac(palette, binder) {
  const g = new THREE.Group();

  const body = box(6.8, 4.3, 0.8, 0.45, binder.bind(clay(palette.soft), 'soft'));
  g.add(body);

  const screen = box(5.9, 3.4, 0.18, 0.2, binder.bind(flat(palette.cloud), 'cloud'));
  screen.position.set(0, 0, 0.42);
  g.add(screen);

  // Traffic lights.
  const dotGeo = new THREE.SphereGeometry(0.17, 24, 16);
  [['bad', -2.3], ['warm', -1.78], ['good', -1.26]].forEach(([token, x]) => {
    const dot = new THREE.Mesh(dotGeo, binder.bind(clay(palette[token]), token));
    dot.position.set(x, 1.2, 0.58);
    g.add(dot);
  });

  // Status lamp (breathes while a build runs).
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), clay(palette.good));
  lamp.position.set(2.4, 1.2, 0.58);
  g.add(lamp);

  // Pipeline bars on the screen, the fill bar animates with the build.
  const bars = [];
  const rows = [
    { y: 0.45, w: 4.6, token: 'soft-shade' },
    { y: -0.25, w: 3.4, token: 'soft-shade' },
  ];
  for (const row of rows) {
    const bar = box(row.w, 0.42, 0.1, 0.2, binder.bind(clay(palette[row.token]), row.token));
    bar.position.set((row.w - 4.6) / 2 - 0, row.y, 0.56);
    g.add(bar);
    bars.push(bar);
  }
  // The progress bar: anchored left via a pivot so scaling grows rightward.
  const fillPivot = new THREE.Group();
  fillPivot.position.set(-2.3, -0.95, 0.58);
  const fill = box(4.6, 0.42, 0.12, 0.2, clay(palette.accent));
  fill.position.x = 2.3;
  fillPivot.add(fill);
  fillPivot.scale.x = 0.001;
  g.add(fillPivot);

  // Neck + base.
  const neck = box(1.1, 1.1, 0.5, 0.18, binder.bind(clay(palette.accent), 'accent'));
  neck.position.set(0, -2.6, -0.1);
  g.add(neck);
  const base = box(2.7, 0.36, 1.7, 0.17, binder.bind(clay(palette.accent), 'accent'));
  base.position.set(0, -3.2, 0);
  g.add(base);

  return { group: g, lamp, fill: fillPivot, screen };
}

/* ---------- The phone, the companion, mid-air ---------- */

export function buildPhone(palette, binder) {
  const g = new THREE.Group();

  const body = box(3.1, 6.1, 0.6, 0.55, binder.bind(clay(palette.accent), 'accent'));
  g.add(body);

  const screen = box(2.55, 5.45, 0.18, 0.35, binder.bind(flat(palette.cloud), 'cloud'));
  screen.position.z = 0.28;
  g.add(screen);

  // Status banner, mirrors the Mac's build state.
  const band = box(2.1, 0.9, 0.1, 0.28, clay(palette.good));
  band.position.set(0, 1.85, 0.42);
  g.add(band);

  // Timeline rows.
  [0.7, -0.1, -0.9].forEach((y, i) => {
    const w = [1.9, 1.5, 1.7][i];
    const row = box(w, 0.34, 0.08, 0.16, binder.bind(clay(palette['soft-shade']), 'soft-shade'));
    row.position.set((w - 2.1) / 2, y, 0.42);
    g.add(row);
  });

  // Home pill.
  const pill = box(1.1, 0.16, 0.08, 0.08, binder.bind(clay(palette['soft-shade']), 'soft-shade'));
  pill.position.set(0, -2.45, 0.42);
  g.add(pill);

  // Camera chip on the back-top, like the app's model.
  const chip = box(0.72, 0.72, 0.16, 0.16, binder.bind(clay(palette.warm), 'warm'));
  chip.position.set(-0.85, 2.3, -0.35);
  g.add(chip);

  return { group: g, band };
}

/* ---------- Gear, spins while the world builds ---------- */

export function buildGear(palette, binder) {
  const g = new THREE.Group();
  const mat = binder.bind(clay(palette.warm), 'warm');

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.55, 32), mat);
  hub.rotation.x = Math.PI / 2;
  g.add(hub);

  const toothGeo = new RoundedBoxGeometry(0.42, 0.38, 0.55, 3, 0.1);
  for (let i = 0; i < 8; i++) {
    const tooth = new THREE.Mesh(toothGeo, mat);
    const a = (i / 8) * Math.PI * 2;
    tooth.position.set(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0);
    tooth.rotation.z = a;
    g.add(tooth);
  }

  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 24),
    binder.bind(clay(palette['warm-deep']), 'warm-deep'));
  hole.rotation.x = Math.PI / 2;
  g.add(hole);

  return { group: g };
}

/* ---------- Seal, the starburst "build passed" badge ---------- */

export function buildSeal(palette, binder) {
  const g = new THREE.Group();

  const shape = new THREE.Shape();
  const points = 12, outer = 1.0, inner = 0.8;
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
  geo.center();
  const star = new THREE.Mesh(geo, binder.bind(clay(palette.good), 'good'));
  g.add(star);

  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 24),
    binder.bind(clay(palette.cloud), 'cloud'));
  dot.rotation.x = Math.PI / 2;
  g.add(dot);

  return { group: g };
}

/* ---------- Garnish, orbs, blobs, rings ---------- */

export function buildOrb(palette, binder, token, radius = 0.5) {
  const orb = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24),
    binder.bind(clay(palette[token]), token));
  return orb;
}

export function buildRing(palette, binder, token, radius = 0.62) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.3, 18, 40),
    binder.bind(clay(palette[token]), token));
  return ring;
}

/** A googly-eyed clay blob, the 404 mascot (Monster world energy). */
export function buildBlob(palette, binder, token = 'accent', radius = 1.4) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 30),
    binder.bind(clay(palette[token]), token));
  body.scale.set(1, 0.92, 0.96);
  g.add(body);

  const eyes = [];
  [-0.42, 0.42].forEach((x) => {
    const eye = new THREE.Group();
    const white = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.3, 24, 18),
      binder.bind(clay(palette.cloud), 'cloud'));
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.13, 18, 14),
      binder.bind(clay(palette.slate), 'slate'));
    pupil.position.z = radius * 0.24;
    eye.add(white, pupil);
    eye.position.set(x * radius, radius * 0.25, radius * 0.82);
    g.add(eye);
    eyes.push({ eye, pupil });
  });
  return { group: g, eyes };
}

/* ---------- The data string, Mac → phone, with a traveling bead ---------- */

export function buildString(from, to, palette, binder) {
  const g = new THREE.Group();

  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.y = Math.min(from.y, to.y) - 1.6; // sag, like the app's verlet ropes at rest
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);

  const knotGeo = new THREE.SphereGeometry(0.09, 14, 10);
  const knotMat = binder.bind(clay(palette.slate), 'slate');
  curve.getPoints(22).forEach((p, i) => {
    if (i % 2 !== 0) return;
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.copy(p);
    g.add(knot);
  });

  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16),
    binder.bind(clay(palette.cloud), 'cloud'));
  bead.position.copy(from);
  g.add(bead);

  return { group: g, curve, bead };
}
