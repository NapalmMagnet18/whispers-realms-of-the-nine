// Reedhaven apothecary pieces (2026-10-08). All face -Z. kinds: hut, cauldron, flaskshelf, dryrack
import { quadN, boxR, box, cyl, blob } from './shape.js';
const OAK = 'cdn/texture-dark-oak-timber-beam-hand-painted.png', THATCH = 'cdn/texture-reed-thatch-roof-bundled-dry.png';
const REED = 'cdn/texture-woven-reed-wall-panels-marsh.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png', CLOTH = 'cdn/texture-patched-burlap-sackcloth.png';
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }
const FLASK = [['oklch(0.55 0.2 25)', [2.6, 0.3, 0.25]], ['oklch(0.5 0.17 260)', [0.4, 0.8, 3]], ['oklch(0.7 0.2 140)', [0.8, 2.6, 0.5]], ['oklch(0.8 0.15 90)', [2.4, 1.9, 0.4]], ['oklch(0.55 0.18 310)', [1.6, 0.4, 2.4]]];

function flask(ctx, P, x, y, z, s, i, far) {
  const [c, e] = FLASK[i % FLASK.length];
  P(null, c, 0.15); ctx.emissive(e[0] * 0.5, e[1] * 0.5, e[2] * 0.5);
  if (i % 3 === 0) blob(ctx, x, y + s * 0.6, z, s * 0.6, s * 0.6, s * 0.6, i, 0, 3, far ? 5 : 7); // round-bottom
  else cyl(ctx, x, y, z, s * 0.45, s * 0.5, s * 1.1, far ? 5 : 7, true); // tall vial
  ctx.emissive(null);
  if (!far) { P(null, 'oklch(0.85 0.02 200)', 0.1); cyl(ctx, x, y + s * 1.1, z, s * 0.18, s * 0.18, s * 0.35, 5, true); P(null, 'oklch(0.5 0.07 60)'); cyl(ctx, x, y + s * 1.45, z, s * 0.21, s * 0.21, s * 0.12, 5, true); }
}

function flaskshelf(ctx, P, far, seed) {
  P(OAK, 'oklch(0.55 0.05 55)');
  box(ctx, -0.9, 0, -0.02, -0.82, 1.9, 0.32); box(ctx, 0.82, 0, -0.02, 0.9, 1.9, 0.32); box(ctx, -0.9, 0, 0.28, 0.9, 1.9, 0.32);
  for (let s = 0; s < 4; s++) box(ctx, -0.88, 0.15 + s * 0.48, -0.02, 0.88, 0.19 + s * 0.48, 0.3);
  for (let s = 0; s < 4; s++) for (let i = 0; i < (far ? 3 : 7); i++) {
    const r = h(i + s * 13, seed); if (r < 0.15) continue;
    flask(ctx, P, -0.72 + i * (far ? 0.6 : 0.24) + r * 0.05, 0.19 + s * 0.48, 0.12, 0.09 + r * 0.05, i + s * 2 + seed, far);
  }
  if (!far) { P(null, 'oklch(0.85 0.04 85)'); for (let i = 0; i < 3; i++) boxR(ctx, [-0.5 + i * 0.5, 1.94, 0.1], [0.2, 0.07, 0.15], { yaw: i * 25 }); } // stacked recipe books
}

function cauldron(ctx, P, far) {
  P(IRON, 'oklch(0.35 0.01 60)', 0.55, 0.7);
  blob(ctx, 0, 0.55, 0, 0.6, 0.48, 0.6, 3, 0.03, far ? 4 : 6, far ? 8 : 14);
  cyl(ctx, 0, 0.85, 0, 0.55, 0.6, 0.12, far ? 8 : 14, false);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; boxR(ctx, [Math.cos(a) * 0.45, 0.12, Math.sin(a) * 0.45], [0.08, 0.3, 0.08], { yaw: i * 120 }); }
  P(null, 'oklch(0.72 0.22 140)', 0.1); ctx.emissive(0.7, 2.6, 0.5); cyl(ctx, 0, 0.9, 0, 0.53, 0.53, 0.02, far ? 8 : 14, true); ctx.emissive(null);
  if (!far) {
    P(null, 'oklch(0.3 0.04 50)'); for (let i = 0; i < 6; i++) boxR(ctx, [Math.cos(i) * 0.35, 0.04, Math.sin(i) * 0.35], [0.5, 0.1, 0.1], { yaw: i * 37 }); // firewood
    P(null, 'oklch(0.75 0.17 50)'); ctx.emissive(3, 1.1, 0.2); blob(ctx, 0, 0.08, 0, 0.3, 0.06, 0.3, 9, 0.3, 3, 6); ctx.emissive(null);
    P(OAK, 'oklch(0.5 0.05 55)'); boxR(ctx, [0.15, 1.1, 0.1], [0.05, 1.0, 0.05], { roll: -25, pitch: 10 }); // ladle
  }
}

function dryrack(ctx, P, far, seed) {
  P(OAK, 'oklch(0.55 0.05 55)'); for (const x of [-1, 1]) boxR(ctx, [x, 0.9, 0], [0.08, 1.8, 0.08], {}); box(ctx, -1.1, 1.75, -0.04, 1.1, 1.82, 0.04);
  const herbs = ['oklch(0.55 0.1 140)', 'oklch(0.6 0.08 110)', 'oklch(0.55 0.1 320)', 'oklch(0.7 0.12 85)'];
  for (let i = 0; i < (far ? 4 : 9); i++) {
    const x = -0.85 + i * (far ? 0.55 : 0.21), r = h(i, seed), len = 0.35 + r * 0.25;
    P(null, 'oklch(0.6 0.05 70)'); box(ctx, x - 0.006, 1.6, -0.006, x + 0.006, 1.76, 0.006);
    P(null, herbs[(i + seed) % 4], 0.95); cyl(ctx, x, 1.6 - len, 0, 0.11 + r * 0.04, 0.03, len, far ? 4 : 6, true);
  }
}

function hut(ctx, P, far) {
  // raised reed hut on stilts, 5 x 4 m, deck 0.6 m, open front with counter, conical-hipped thatch
  const W = 2.5, D = 2.0, F = 0.6, H = 3.0;
  P(OAK, 'oklch(0.5 0.05 55)');
  for (const x of [-W, 0, W]) for (const z of [-D - 0.8, 0, D]) box(ctx, x - 0.1, -0.3, z - 0.1, x + 0.1, F, z + 0.1);
  P(OAK, 'oklch(0.62 0.05 60)'); box(ctx, -W - 0.1, F - 0.1, -D - 0.9, W + 0.1, F, D + 0.1); // deck incl. porch
  if (!far) { P(OAK, 'oklch(0.55 0.05 55)'); for (let i = 0; i < 3; i++) box(ctx, -0.6, (F / 3) * i, -D - 1.25 - (2 - i) * 0.3, 0.6, (F / 3) * (i + 1), -D - 0.9 - (2 - i) * 0.3); }
  P(REED, 'oklch(0.75 0.06 85)');
  box(ctx, -W, F, D - 0.12, W, H, D); box(ctx, -W, F, -D, -W + 0.12, H, D); box(ctx, W - 0.12, F, -D, W, H, D);
  box(ctx, -W, H - 0.5, -D, W, H, -D + 0.12); // lintel over the open front
  P(OAK, 'oklch(0.5 0.05 55)'); for (const x of [-W, W]) box(ctx, x - 0.12, F, -D - 0.12, x + 0.12, H + 0.1, -D + 0.12);
  box(ctx, -W + 0.2, F, -D + 0.1, W - 0.2, F + 1.0, -D + 0.6); P(OAK, 'oklch(0.6 0.05 60)'); box(ctx, -W + 0.1, F + 1.0, -D + 0.05, W - 0.1, F + 1.08, -D + 0.7); // counter
  // thatch: hipped, overhanging, slightly shaggy
  P(THATCH, 'oklch(0.72 0.07 85)', 0.95);
  const o = 0.6, eave = H - 0.15, ridge = H + 1.9, ry = 0.9;
  const A = [-W - o, eave, -D - o - 0.4], B = [W + o, eave, -D - o - 0.4], C = [W + o, eave, D + o], Dd = [-W - o, eave, D + o], R0 = [-ry, ridge, 0], R1 = [ry, ridge, 0];
  quadN(ctx, A, B, R1, R0, [0, 0.7, -0.7]); quadN(ctx, C, Dd, R0, R1, [0, 0.7, 0.7]);
  quadN(ctx, B, C, R1, [R1[0] + 0.0001, R1[1], R1[2]], [0.7, 0.7, 0]); quadN(ctx, Dd, A, R0, [R0[0] - 0.0001, R0[1], R0[2]], [-0.7, 0.7, 0]);
  const t = 0.18; quadN(ctx, [A[0], A[1] - t, A[2]], [B[0], B[1] - t, B[2]], [C[0], C[1] - t, C[2]], [Dd[0], Dd[1] - t, Dd[2]], [0, -1, 0]);
  if (!far) {
    // ridge bundle, a smoke hole hood, a hanging lantern and a painted sign
    P(THATCH, 'oklch(0.6 0.07 80)'); boxR(ctx, [0, ridge + 0.05, 0], [2 * ry + 0.4, 0.22, 0.3], {});
    P(IRON, 'oklch(0.3 0.01 60)', 0.5, 0.7); box(ctx, W - 0.4, H - 0.6, -D - 0.6, W - 0.35, H - 0.15, -D - 0.55);
    P(null, 'oklch(0.85 0.12 80)'); ctx.emissive(2.4, 1.6, 0.6); box(ctx, W - 0.5, H - 0.9, -D - 0.7, W - 0.25, H - 0.6, -D - 0.45); ctx.emissive(null);
    P(OAK, 'oklch(0.45 0.05 50)'); box(ctx, -1.2, H - 0.45, -D - 0.02, 1.2, H - 0.05, -D + 0.02);
    P(null, 'oklch(0.7 0.18 140)'); ctx.emissive(0.4, 1.4, 0.3); blob(ctx, 0, H - 0.25, -D - 0.04, 0.12, 0.14, 0.03, 5, 0, 3, 6); ctx.emissive(null); // flask emblem
    // herb bunches hung from the lintel
    const herbs = ['oklch(0.55 0.1 140)', 'oklch(0.55 0.1 320)', 'oklch(0.7 0.12 85)'];
    for (let i = 0; i < 7; i++) { const x = -2 + i * 0.66; P(null, herbs[i % 3], 0.95); cyl(ctx, x, H - 1.0, -D - 0.25, 0.12, 0.03, 0.45, 6, true); }
    // interior: a back shelf of flasks, a mortar on the counter
    for (let i = 0; i < 10; i++) flask(ctx, P, -2 + i * 0.44, F + 1.6, D - 0.35, 0.1, i, false);
    P(OAK, 'oklch(0.55 0.05 55)'); box(ctx, -W + 0.2, F + 1.58, D - 0.5, W - 0.2, F + 1.62, D - 0.12);
    for (let i = 0; i < 8; i++) flask(ctx, P, -1.8 + i * 0.5, F + 0.9, D - 0.35, 0.12, i + 3, false);
    P(OAK, 'oklch(0.55 0.05 55)'); box(ctx, -W + 0.2, F + 0.88, D - 0.5, W - 0.2, F + 0.92, D - 0.12);
    P(null, 'oklch(0.65 0.02 70)'); cyl(ctx, 1.2, F + 1.08, -D + 0.35, 0.12, 0.09, 0.14, 8, true);
  }
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'hut', seed = p.seed || 1;
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'hut') { box(ctx, -2.6, -0.3, -2.9, 2.6, 0.6, 2.1); box(ctx, -2.5, 0.6, 1.88, 2.5, 3, 2); box(ctx, -2.5, 0.6, -2, -2.38, 3, 2); box(ctx, 2.38, 0.6, -2, 2.5, 3, 2); box(ctx, -2.3, 0.6, -1.9, 2.3, 1.68, -1.3); for (let i = 0; i < 3; i++) box(ctx, -0.6, 0.2 * i, -3.25 - (2 - i) * 0.3, 0.6, 0.2 * (i + 1), -2.9 - (2 - i) * 0.3); }
    else if (k === 'cauldron') box(ctx, -0.6, 0, -0.6, 0.6, 1.0, 0.6);
    else if (k === 'flaskshelf') box(ctx, -0.9, 0, -0.02, 0.9, 1.9, 0.32);
    else box(ctx, -1.1, 0, -0.1, 1.1, 1.8, 0.1);
    return;
  }
  if (k === 'hut') hut(ctx, P, far); else if (k === 'cauldron') cauldron(ctx, P, far); else if (k === 'flaskshelf') flaskshelf(ctx, P, far, seed); else dryrack(ctx, P, far, seed);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
