/* clay.js, the shared clay kit for the Three.js world.
   Reads the palette from the CSS design tokens (tokens.css) so the 3D scene
   re-tints itself with the site theme, builds the soft "studio" light rig and
   the matte clay materials that match the apps' SceneKit look
   (Blinn, specular 0.85, low shininess, see WorldScene.swift). */

import * as THREE from 'three';

const TOKENS = [
  'accent', 'accent-deep', 'soft', 'soft-shade', 'warm', 'warm-deep',
  'good', 'good-deep', 'bad', 'bad-deep', 'slate', 'cloud', 'card',
  'world-paper', 'world-ambient', 'world-shadow-opacity'
];

/** Read the current palette straight from the CSS custom properties. */
export function readPalette() {
  const style = getComputedStyle(document.documentElement);
  const p = {};
  for (const name of TOKENS) {
    p[name] = style.getPropertyValue('--' + name).trim();
  }
  return p;
}

/** Matte clay, the default material for everything in the world. */
export function clay(color) {
  return new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    specular: new THREE.Color(0x8a8a96),
    shininess: 18
  });
}

/** Constant-lit surface (screens, indicator content), unaffected by lights. */
export function flat(color) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
}

/**
 * The three-light studio rig from the apps:
 * key (front-left), rim (back-right), and a generous ambient wash.
 * Returns handles so the theme can re-tune the ambient.
 */
export function studioLights(scene) {
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-4, 6, 9);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(7, 3, -7);
  scene.add(rim);

  const ambient = new THREE.AmbientLight(0xffffff, 1.55);
  scene.add(ambient);

  return { key, rim, ambient, baseAmbient: 1.55 };
}

/** Soft radial-gradient "shadow puddle" texture (fake contact shadow). */
export function shadowPuddle(width = 11, depth = 3.6) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 100;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 50, 4, 128, 50, 120);
  g.addColorStop(0, 'rgba(64, 66, 97, 0.55)');
  g.addColorStop(1, 'rgba(64, 66, 97, 0)');
  ctx.scale(1, 100 / 256);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/**
 * Re-tint a scene after a theme change: walks the material registry
 * created with trackMaterial() and refreshes light levels + shadow.
 */
export class ThemeBinder {
  constructor() { this.bindings = []; }

  /** Bind a material's color to a palette token. */
  bind(material, token) {
    this.bindings.push({ material, token });
    return material;
  }

  apply(palette, rig, shadow) {
    for (const { material, token } of this.bindings) {
      material.color.set(palette[token]);
    }
    if (rig) rig.ambient.intensity = rig.baseAmbient * parseFloat(palette['world-ambient'] || 1);
    if (shadow) shadow.material.opacity = parseFloat(palette['world-shadow-opacity'] || 0.3);
  }
}
