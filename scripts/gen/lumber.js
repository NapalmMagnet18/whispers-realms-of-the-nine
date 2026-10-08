// Thornwood lumber camp (2026-10-08). kinds: sawpit, logpile {seed}, stump {seed, axe}, cart, shed
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const BARK = 'cdn/texture-rough-pine-log-bark.png', OAK = 'cdn/texture-dark-oak-timber-grain.png';
const END = 'cdn/texture-sawn-log-end-grain-rings.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png';
const SHINGLE = 'cdn/texture-mossy-wooden-shingle-roof.png';
const D = Math.PI / 180;
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

// a log lying along X, centred at (x,y,z), with bark sides and ringed ends
function log(ctx, P, far, x, y, z, r, L, yaw = 0) {
  const seg = far ? 6 : 10, c = Math.cos(yaw * D), s = Math.sin(yaw * D);
  const pt = (u, a) => { const lx = u, ly = Math.sin(a) * r, lz = Math.cos(a) * r; return [x + lx * c + lz * s, y + r + ly, z - lx * s + lz * c]; };
  P(BARK, 'oklch(0.42 0.04 55)');
  for (let k = 0; k < seg; k++) { const a0 = k / seg * 2 * Math.PI, a1 = (k + 1) / seg * 2 * Math.PI, am = (a0 + a1) / 2; const n = [Math.cos(am) * s, Math.sin(am), Math.cos(am) * c]; quadN(ctx, pt(-L / 2, a0), pt(-L / 2, a1), pt(L / 2, a1), pt(L / 2, a0), n); }
  P(END, 'oklch(0.78 0.07 75)');
  for (const e of [-1, 1]) for (let k = 0; k < seg; k++) { const a0 = k / seg * 2 * Math.PI, a1 = (k + 1) / seg * 2 * Math.PI; const ctr = [x + e * L / 2 * c, y + r, z - e * L / 2 * s]; if (e > 0) triN(ctx, pt(L / 2, a1), pt(L / 2, a0), ctr, [c, 0, -s]); else triN(ctx, pt(-L / 2, a0), pt(-L / 2, a1), ctr, [-c, 0, s]); }
}

function sawpit(ctx, P, far) {
  // a trestle frame holding a log over a shallow pit, a two-man saw half through it, sawdust drifts
  P(null, 'oklch(0.3 0.03 60)', 1); box(ctx, -2.2, -0.02, -0.7, 2.2, 0.01, 0.7); // the pit floor, dark
  P(OAK, 'oklch(0.5 0.05 60)');
  for (const x of [-1.6, 1.6]) { boxR(ctx, [x, 0.75, -0.55], [0.14, 1.7, 0.14], { pitch: 12 }); boxR(ctx, [x, 0.75, 0.55], [0.14, 1.7, 0.14], { pitch: -12 }); box(ctx, x - 0.08, 1.45, -0.6, x + 0.08, 1.6, 0.6); }
  log(ctx, P, far, 0, 1.6, 0, 0.35, 4.6);
  if (far) return;
  // a half-sawn plank peeling off the top and planks stacked by the pit
  P(OAK, 'oklch(0.7 0.07 75)'); boxR(ctx, [0.9, 2.2, 0.0], [2.4, 0.06, 0.55], { roll: 4 });
  for (let i = 0; i < 5; i++) box(ctx, -1.9, i * 0.07, 1.1 + (i % 2) * 0.04, 1.9, i * 0.07 + 0.06, 1.6 + (i % 2) * 0.04);
  // the saw: a long thin blade standing through the log with two cross handles
  P(IRON, 'oklch(0.6 0.01 250)', 0.4, 0.85); box(ctx, -0.6, 0.6, -0.01, -0.3, 3.0, 0.01);
  P(OAK, 'oklch(0.45 0.05 55)'); for (const y of [0.55, 3.05]) box(ctx, -0.65, y - 0.03, -0.18, -0.25, y + 0.03, 0.18);
  // sawdust drifts
  P(null, 'oklch(0.85 0.07 85)', 1); for (let i = 0; i < 4; i++) blob(ctx, -0.6 + i * 0.4, 0, -0.2 + h(i, 2) * 0.4, 0.4, 0.08, 0.3, i, 0.3, 3, 6);
}

function logpile(ctx, P, far, seed) {
  // a pyramid stack chocked by stakes, one log rolled away
  const r = 0.32, L = 4.2; let n = 0;
  for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) { if (far && row > 2) continue; log(ctx, P, far, (h(n++, seed) - 0.5) * 0.4, row * r * 1.72, (i - (3 - row) / 2) * r * 2.02, r * (0.9 + h(n, seed) * 0.2), L + (h(n, seed + 3) - 0.5) * 0.5); }
  P(BARK, 'oklch(0.4 0.04 55)'); for (const z of [-1.5, 1.5]) for (const x of [-1.4, 1.4]) cyl(ctx, x, 0, z, 0.07, 0.06, 1.3, 5, true);
  if (!far) log(ctx, P, far, 0.6, 0, 2.4, 0.3, 3.4, 15);
}

function stump(ctx, P, far, seed, axe) {
  P(BARK, 'oklch(0.4 0.04 55)'); cyl(ctx, 0, 0, 0, 0.5, 0.42, 0.55, far ? 6 : 10, false);
  P(END, 'oklch(0.75 0.07 75)'); cyl(ctx, 0, 0.55, 0, 0.42, 0.42, 0.001, far ? 6 : 10, true);
  if (far) return;
  P(BARK, 'oklch(0.38 0.04 55)'); for (let i = 0; i < 4; i++) { const a = (i * 90 + h(i, seed) * 40) * D; boxR(ctx, [Math.cos(a) * 0.6, 0.08, Math.sin(a) * 0.6], [0.5, 0.14, 0.16], { yaw: -a / D }); } // roots
  if (axe) { P(OAK, 'oklch(0.5 0.06 60)'); boxR(ctx, [0.15, 0.95, 0], [0.05, 0.85, 0.05], { roll: -25 }); P(IRON, 'oklch(0.55 0.01 250)', 0.4, 0.85); boxR(ctx, [0.03, 0.6, 0], [0.24, 0.16, 0.03], { roll: -25 }); }
  P(OAK, 'oklch(0.72 0.07 75)'); for (let i = 0; i < 6; i++) { const a = h(i, seed + 5) * 6.28, d = 0.7 + h(i, seed + 6) * 0.6; boxR(ctx, [Math.cos(a) * d, 0.04, Math.sin(a) * d], [0.12, 0.05, 0.3], { yaw: h(i, 7) * 180 }); } // wood chips
}

function cart(ctx, P, far) {
  // a long log sledge-cart, two big wheels, logs chained aboard
  P(OAK, 'oklch(0.48 0.05 60)'); box(ctx, -2.0, 0.65, -0.55, 2.0, 0.8, 0.55);
  for (const z of [-0.55, 0.55]) box(ctx, -2.0, 0.8, z - 0.04, 2.0, 1.0, z + 0.04);
  boxR(ctx, [-2.9, 0.55, 0], [1.9, 0.08, 0.08], { roll: 10 }); // tongue
  P(OAK, 'oklch(0.4 0.05 55)'); for (const z of [-0.72, 0.72]) { cyl(ctx, 0.4, 0.0, z, 0.0, 0.0, 0.0, 3, false); }
  for (const z of [-0.72, 0.72]) { const seg = far ? 8 : 14; for (let k = 0; k < seg; k++) { const a0 = k / seg * 6.283, a1 = (k + 1) / seg * 6.283, R = 0.65; quadN(ctx, [0.4 + Math.cos(a0) * R, 0.65 + Math.sin(a0) * R, z - 0.06], [0.4 + Math.cos(a1) * R, 0.65 + Math.sin(a1) * R, z - 0.06], [0.4 + Math.cos(a1) * R, 0.65 + Math.sin(a1) * R, z + 0.06], [0.4 + Math.cos(a0) * R, 0.65 + Math.sin(a0) * R, z + 0.06], [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 0]); } if (!far) for (let s = 0; s < 6; s++) boxR(ctx, [0.4, 0.65, z], [1.25, 0.06, 0.05], { roll: s * 30 }); }
  for (let i = 0; i < 3; i++) log(ctx, P, far, 0, 0.8, (i - 1) * 0.34, 0.17, 4.6);
  if (!far) log(ctx, P, far, 0, 1.08, -0.17, 0.16, 4.4), log(ctx, P, far, 0, 1.08, 0.17, 0.16, 4.4);
  if (!far) { P(IRON, 'oklch(0.3 0.02 50)', 0.6, 0.8); for (const x of [-1.2, 1.2]) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI; boxR(ctx, [x, 0.95 + Math.sin(a) * 0.55, Math.cos(a) * 0.6], [0.05, 0.05, 0.22], { pitch: -a / D + 90 }); } }
}

function shed(ctx, P, far) {
  // an open-fronted tool shed, shingled lean-to roof, tools racked on the back wall
  P(BARK, 'oklch(0.42 0.04 55)'); for (const [x, z, ht] of [[-1.8, -1.1, 2.6], [1.8, -1.1, 2.6], [-1.8, 1.1, 2.0], [1.8, 1.1, 2.0]]) cyl(ctx, x, 0, z, 0.1, 0.09, ht, far ? 5 : 7, true);
  P(OAK, 'oklch(0.45 0.05 55)'); for (let i = 0; i < (far ? 3 : 9); i++) box(ctx, -1.8, i * 0.22, 1.05, 1.8, i * 0.22 + 0.2, 1.13); // back wall boards
  for (const x of [-1.85, 1.85]) for (let i = 0; i < (far ? 2 : 7); i++) box(ctx, x - 0.04, i * 0.28, -1.0, x + 0.04, i * 0.28 + 0.24, 1.1);
  P(SHINGLE, 'oklch(0.48 0.05 50)'); const a = [-2.1, 2.75, -1.5], b = [2.1, 2.75, -1.5], c = [2.1, 2.1, 1.4], d = [-2.1, 2.1, 1.4]; quadN(ctx, a, b, c, d, [0, 1, -0.22]); quadN(ctx, a, d, c, b, [0, -1, 0.22]);
  if (far) return;
  // racked tools: two axes, a crosscut saw, a mallet, a coil of rope
  for (let i = 0; i < 2; i++) { P(OAK, 'oklch(0.55 0.06 60)'); box(ctx, -1.3 + i * 0.4, 0.5, 0.95, -1.25 + i * 0.4, 1.6, 1.0); P(IRON, 'oklch(0.55 0.01 250)', 0.4, 0.85); box(ctx, -1.42 + i * 0.4, 1.4, 0.96, -1.25 + i * 0.4, 1.62, 0.99); }
  P(IRON, 'oklch(0.6 0.01 250)', 0.4, 0.85); box(ctx, -0.3, 1.3, 0.97, 1.1, 1.5, 0.99); P(OAK, 'oklch(0.45 0.05 55)'); for (const x of [-0.4, 1.2]) box(ctx, x - 0.04, 1.2, 0.95, x + 0.04, 1.6, 1.0);
  P(null, 'oklch(0.7 0.06 85)', 1); cyl(ctx, 1.3, 0, 0.5, 0.35, 0.35, 0.2, 10, true); cyl(ctx, 1.3, 0.2, 0.5, 0.15, 0.15, 0.001, 8, true);
  // a workbench with a grindstone
  P(OAK, 'oklch(0.52 0.05 60)'); box(ctx, -1.5, 0.8, 0.2, 0.2, 0.9, 0.8); for (const x of [-1.4, 0.1]) for (const z of [0.25, 0.75]) box(ctx, x - 0.04, 0, z - 0.04, x + 0.04, 0.8, z + 0.04);
  P(null, 'oklch(0.6 0.02 90)', 0.9); { const seg = 12, R = 0.3, cx = -0.6, cy = 1.25, z0 = 0.4, z1 = 0.55; for (let k = 0; k < seg; k++) { const a0 = k / seg * 6.283, a1 = (k + 1) / seg * 6.283; quadN(ctx, [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z0], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z0], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z1], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z1], [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 0]); triN(ctx, [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z0], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z0], [cx, cy, z0], [0, 0, -1]); triN(ctx, [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z1], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z1], [cx, cy, z1], [0, 0, 1]); } }
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'stump';
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'sawpit') box(ctx, -2.3, 0, -0.7, 2.3, 2.0, 0.7);
    else if (k === 'logpile') box(ctx, -2.2, 0, -1.4, 2.2, 2.2, 1.4);
    else if (k === 'cart') box(ctx, -2.1, 0, -0.8, 2.1, 1.4, 0.8);
    else if (k === 'shed') { box(ctx, -1.9, 0, 1.0, 1.9, 2.1, 1.2); for (const x of [-1.85, 1.85]) box(ctx, x - 0.06, 0, -1.15, x + 0.06, 2.5, 1.15); }
    else box(ctx, -0.5, 0, -0.5, 0.5, 0.55, 0.5);
    return;
  }
  if (k === 'sawpit') sawpit(ctx, P, far);
  else if (k === 'logpile') logpile(ctx, P, far, p.seed || 1);
  else if (k === 'cart') cart(ctx, P, far);
  else if (k === 'shed') shed(ctx, P, far);
  else stump(ctx, P, far, p.seed || 1, !!p.axe);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
