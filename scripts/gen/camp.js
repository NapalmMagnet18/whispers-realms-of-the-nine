// Bandit camp off the Deepgrove road (2026-10-08). Front (the open side, the road) is -Z.
// kinds: palisade {radius}, tent {seed, hide}, lookout, cookfire, loot {seed}
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const HIDE = 'cdn/texture-patched-animal-hide-leather-stitched.png', LOG = 'cdn/texture-rough-pine-log-bark.png';
const OAK = 'cdn/texture-dark-oak-timber-grain.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png', FIELD = 'cdn/texture-mossy-fieldstone-weathered.png';
const D = Math.PI / 180;
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

function stake(ctx, P, x, z, ht, lean, yaw, far) {
  P(LOG, 'oklch(0.45 0.04 60)');
  const r = 0.13, tip = ht + 0.4;
  const ox = Math.sin(yaw * D) * lean, oz = Math.cos(yaw * D) * lean; // lean outward
  cyl(ctx, x, -0.2, z, r, r * 0.95, ht + 0.2, far ? 5 : 7, false);
  if (!far) { P(OAK, 'oklch(0.62 0.05 70)'); const n = 6; for (let i = 0; i < n; i++) { const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI; triN(ctx, [x + Math.cos(a0) * r, ht, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, ht, z + Math.sin(a1) * r], [x + ox * 0.2, tip, z + oz * 0.2], [Math.cos((a0 + a1) / 2), 0.4, Math.sin((a0 + a1) / 2)]); } }
}

function palisade(ctx, P, far, R) {
  const n = far ? 18 : 40;
  for (let i = 0; i < n; i++) {
    const a = (12 + 156 * i / (n - 1)) * D, x = Math.cos(a) * R, z = Math.sin(a) * R;
    stake(ctx, P, x, z, 2.2 + h(i, 3) * 0.6, 0.1, 90 - a / D, far);
  }
  if (far) return;
  // two cross-rails lashed with rope along the inside
  P(LOG, 'oklch(0.4 0.04 60)');
  for (const y of [0.7, 1.7]) for (let i = 0; i < 10; i++) { const a0 = (12 + 15.6 * i) * D, a1 = (12 + 15.6 * (i + 1)) * D, r = R - 0.2; const mx = (Math.cos(a0) + Math.cos(a1)) / 2 * r, mz = (Math.sin(a0) + Math.sin(a1)) / 2 * r; boxR(ctx, [mx, y, mz], [0.12, 0.12, 2 * r * Math.sin((a1 - a0) / 2) + 0.2], { yaw: -((a0 + a1) / 2) / D }); }
  // skulls on two gate stakes either side of the opening
  for (const a of [12, 168]) { const x = Math.cos(a * D) * R, z = Math.sin(a * D) * R; P(null, 'oklch(0.85 0.03 85)', 0.8); blob(ctx, x, 2.95, z, 0.13, 0.13, 0.15, a, 0.05, 4, 6); P(null, 'oklch(0.1 0.01 30)'); for (const s of [-1, 1]) blob(ctx, x + s * 0.05, 2.97, z - 0.13, 0.03, 0.035, 0.02, 1, 0, 3, 4); }
}

function tent(ctx, P, far, seed, hide) {
  // A-frame hide tent, ridge along X, open front flap at -Z, patches in other tones
  const L = 2.6, W = 1.4, Ht = 1.7;
  P(LOG, 'oklch(0.42 0.04 60)'); for (const x of [-L / 2 - 0.1, L / 2 + 0.1]) { boxR(ctx, [x, Ht / 2, -0.35], [0.07, Ht * 1.25, 0.07], { pitch: 24 }); boxR(ctx, [x, Ht / 2, 0.35], [0.07, Ht * 1.25, 0.07], { pitch: -24 }); }
  box(ctx, -L / 2 - 0.3, Ht - 0.04, -0.04, L / 2 + 0.3, Ht + 0.04, 0.04);
  P(HIDE, hide, 0.95);
  for (const s of [-1, 1]) { const a = [-L / 2, 0, s * W], b = [L / 2, 0, s * W], c = [L / 2, Ht, 0], d = [-L / 2, Ht, 0]; quadN(ctx, a, b, c, d, [0, W, s * Ht]); quadN(ctx, a, d, c, b, [0, -W, -s * Ht]); }
  triN(ctx, [L / 2, 0, -W], [L / 2, 0, W], [L / 2, Ht, 0], [1, 0, 0]); triN(ctx, [L / 2, 0, W], [L / 2, 0, -W], [L / 2, Ht, 0], [-1, 0, 0]); // closed back end (+X)
  // front end (-X) with one flap thrown open
  triN(ctx, [-L / 2, 0, W], [-L / 2, Ht, 0], [-L / 2, 0, W * 0.15], [-1, 0, 0]); triN(ctx, [-L / 2, 0, W], [-L / 2, 0, W * 0.15], [-L / 2, Ht, 0], [1, 0, 0]);
  triN(ctx, [-L / 2, Ht, 0], [-L / 2 - 0.6, 0.1, -W * 0.9], [-L / 2, 0, -W * 0.15], [-0.6, 0.3, -1]); triN(ctx, [-L / 2, Ht, 0], [-L / 2, 0, -W * 0.15], [-L / 2 - 0.6, 0.1, -W * 0.9], [0.6, -0.3, 1]);
  if (far) return;
  const tones = ['oklch(0.35 0.04 50)', 'oklch(0.55 0.06 70)', 'oklch(0.42 0.08 30)'];
  for (let i = 0; i < 5; i++) { const s = h(i, seed) > 0.5 ? 1 : -1, u = (h(i, seed + 1) - 0.5) * (L - 0.6), v = 0.2 + h(i, seed + 2) * 0.6; const y = v * Ht, z = s * W * (1 - v); P(HIDE, tones[i % 3], 0.95); boxR(ctx, [u, y, z + s * 0.012], [0.35 + h(i, 4) * 0.3, 0.32, 0.01], { pitch: s * -(90 - Math.atan2(Ht, W) / D) + 90 * 0 }); }
  // guy ropes to pegs and a bedroll peeking out of the door
  P(null, 'oklch(0.6 0.05 80)'); for (const x of [-L / 2 - 0.1, L / 2 + 0.1]) boxR(ctx, [x * 1.25, Ht * 0.55, 0], [0.02, 0.02, 1.0], { pitch: 0, roll: 0, yaw: 0 });
  P(null, 'oklch(0.45 0.12 30)', 0.95); cyl(ctx, -L / 2 + 0.3, 0, -0.3, 0.18, 0.18, 0.05, 8, true); boxR(ctx, [-L / 2 + 0.6, 0.12, -0.3], [0.8, 0.12, 0.5]);
}

function lookout(ctx, P, far) {
  const H = 3.4, S = 1.1;
  P(LOG, 'oklch(0.42 0.04 60)');
  for (const x of [-S, S]) for (const z of [-S, S]) cyl(ctx, x, 0, z, 0.12, 0.1, H + 1.1, far ? 5 : 7, true);
  if (!far) { for (const s of [-1, 1]) { boxR(ctx, [s * S, H * 0.45, 0], [0.08, 0.08, Math.hypot(2 * S, H * 0.7)], { pitch: Math.atan2(H * 0.7, 2 * S) / D }); boxR(ctx, [0, H * 0.45, s * S], [Math.hypot(2 * S, H * 0.7), 0.08, 0.08], { roll: Math.atan2(H * 0.7, 2 * S) / D }); } }
  P(OAK, 'oklch(0.5 0.05 60)'); box(ctx, -S - 0.2, H, -S - 0.2, S + 0.2, H + 0.12, S + 0.2);
  P(LOG, 'oklch(0.42 0.04 60)'); for (const s of [-1, 1]) { box(ctx, -S - 0.2, H + 0.9, s * (S + 0.15) - 0.05, S + 0.2, H + 1.0, s * (S + 0.15) + 0.05); box(ctx, s * (S + 0.15) - 0.05, H + 0.9, -S - 0.2, s * (S + 0.15) + 0.05, H + 1.0, S + 0.2); }
  // hide awning on top and a ladder up the front
  P(HIDE, 'oklch(0.4 0.05 50)', 0.95); quadN(ctx, [-S - 0.3, H + 1.9, -S - 0.3], [S + 0.3, H + 1.9, -S - 0.3], [S + 0.3, H + 1.6, S + 0.3], [-S - 0.3, H + 1.6, S + 0.3], [0, 1, -0.2]); quadN(ctx, [-S - 0.3, H + 1.9, -S - 0.3], [-S - 0.3, H + 1.6, S + 0.3], [S + 0.3, H + 1.6, S + 0.3], [S + 0.3, H + 1.9, -S - 0.3], [0, -1, 0.2]);
  P(LOG, 'oklch(0.42 0.04 60)'); for (const x of [-S - 0.15, S + 0.15]) cyl(ctx, x, H + 1.0, -S - 0.15, 0.06, 0.06, 0.9, 5, true);
  for (const x of [-0.3, 0.3]) boxR(ctx, [x, H / 2, -S - 0.55], [0.07, H + 0.3, 0.07], { pitch: -10 });
  if (!far) for (let i = 0; i < 9; i++) { const y = 0.3 + i * 0.38; box(ctx, -0.32, y, -S - 0.55 - (H / 2 - y) * 0.176 - 0.03, 0.32, y + 0.05, -S - 0.55 - (H / 2 - y) * 0.176 + 0.03); }
  if (!far) { P(null, 'oklch(0.4 0.14 25)', 0.95); boxR(ctx, [S + 0.15, H + 2.2, S + 0.15], [0.02, 0.5, 0.7], { yaw: 45 }); } // a red rag flag
}

function cookfire(ctx, P, far) {
  P(FIELD, 'oklch(0.45 0.02 90)'); for (let i = 0; i < (far ? 6 : 11); i++) { const a = i / (far ? 6 : 11) * 2 * Math.PI; blob(ctx, Math.cos(a) * 0.65, 0.08, Math.sin(a) * 0.65, 0.17, 0.13, 0.15, i, 0.25, 3, 5); }
  P(LOG, 'oklch(0.25 0.02 40)'); for (let i = 0; i < 5; i++) boxR(ctx, [0, 0.15, 0], [0.12, 0.12, 0.8], { yaw: i * 36, pitch: 15 });
  if (!far) { ctx.albedo(null); ctx.color('oklch(0.6 0.2 40)'); ctx.emissive('oklch(0.6 0.2 40)'); blob(ctx, 0, 0.06, 0, 0.35, 0.06, 0.35, 1, 0.2, 3, 7); ctx.emissive(null); }
  // spit: two forked uprights, a pole, a roasting carcass
  P(LOG, 'oklch(0.42 0.04 60)'); for (const x of [-0.95, 0.95]) { cyl(ctx, x, 0, 0, 0.05, 0.05, 1.0, 5, true); boxR(ctx, [x, 1.05, -0.06], [0.04, 0.2, 0.04], { pitch: -25 }); boxR(ctx, [x, 1.05, 0.06], [0.04, 0.2, 0.04], { pitch: 25 }); }
  box(ctx, -1.15, 0.97, -0.03, 1.15, 1.03, 0.03);
  if (!far) { P(null, 'oklch(0.45 0.1 45)', 0.6); blob(ctx, 0, 0.92, 0, 0.42, 0.22, 0.24, 9, 0.08, 5, 8); blob(ctx, 0.43, 0.94, 0, 0.14, 0.13, 0.12, 2, 0.05, 4, 6); for (const [lx, lz] of [[-0.2, -0.15], [-0.2, 0.15], [0.2, -0.15], [0.2, 0.15]]) boxR(ctx, [lx, 0.78, lz], [0.06, 0.25, 0.06], { roll: lx > 0 ? -30 : 30 }); }
  // log seats round the fire, a pot, a crude table
  P(LOG, 'oklch(0.45 0.04 60)'); for (const [a, l] of [[200, 1.8], [320, 1.6], [80, 1.7]]) { const r = 1.8, x = Math.cos(a * D) * r, z = Math.sin(a * D) * r; boxR(ctx, [x, 0.22, z], [0.4, 0.4, l], { yaw: -a + 90 }); }
  if (!far) { P(IRON, 'oklch(0.3 0.02 50)', 0.5, 0.8); cyl(ctx, 1.0, 0, -0.9, 0.22, 0.26, 0.35, 10, false); P(null, 'oklch(0.35 0.06 60)'); cyl(ctx, 1.0, 0.3, -0.9, 0.21, 0.21, 0.01, 10, true); }
}

function loot(ctx, P, far, seed) {
  // an open iron-bound chest spilling coin, sacks, a pile of stolen arms, a captured banner on a pole
  P(OAK, 'oklch(0.4 0.06 50)'); box(ctx, -0.5, 0, -0.32, 0.5, 0.5, 0.32);
  boxR(ctx, [0, 0.82, 0.42], [1.0, 0.62, 0.08], { pitch: -18 }); // lid flung back
  P(IRON, 'oklch(0.32 0.02 60)', 0.5, 0.8); for (const x of [-0.38, 0.38]) box(ctx, x - 0.04, -0.01, -0.33, x + 0.04, 0.51, 0.33); box(ctx, -0.06, 0.3, -0.34, 0.06, 0.45, -0.32);
  ctx.albedo(null); ctx.color('oklch(0.82 0.15 85)'); ctx.metalness(0.9); ctx.roughness(0.3); ctx.emissive('oklch(0.35 0.08 85)');
  blob(ctx, 0, 0.5, 0, 0.45, 0.12, 0.28, seed, 0.15, 3, 7);
  if (!far) for (let i = 0; i < 14; i++) { const a = h(i, seed) * 2 * Math.PI, r = 0.55 + h(i, seed + 1) * 0.6; cyl(ctx, Math.cos(a) * r, 0, -0.2 + Math.sin(a) * r * 0.6, 0.05, 0.05, 0.015, 6, true); }
  ctx.emissive(null); ctx.metalness(0);
  if (far) return;
  P(null, 'oklch(0.6 0.05 80)', 0.98); blob(ctx, 0.95, 0.3, 0.1, 0.3, 0.3, 0.26, seed, 0.15, 5, 8); blob(ctx, 1.3, 0.25, -0.35, 0.26, 0.25, 0.22, seed + 1, 0.15, 5, 8);
  P(IRON, 'oklch(0.7 0.01 250)', 0.35, 0.9); for (let i = 0; i < 4; i++) boxR(ctx, [-1.1 + i * 0.05, 0.45, 0.2], [0.05, 1.0, 0.02], { roll: -20 + i * 13, yaw: i * 15 });
  P(null, 'oklch(0.35 0.06 50)'); for (let i = 0; i < 4; i++) boxR(ctx, [-1.1 + i * 0.05 - Math.sin((-20 + i * 13) * D) * 0.55, 0.45 + Math.cos((-20 + i * 13) * D) * 0.55, 0.2], [0.18, 0.04, 0.04], { roll: -20 + i * 13, yaw: i * 15 });
  P(OAK, 'oklch(0.45 0.08 250)'); cyl(ctx, -1.35, 0.3, -0.35, 0.32, 0.32, 0.06, 12, true); // a blue shield leaning
  // the stolen banner: lantern gold on blue, torn
  P(LOG, 'oklch(0.4 0.04 60)'); cyl(ctx, 0.2, 0, 0.9, 0.04, 0.04, 2.6, 6, true);
  P(null, 'oklch(0.42 0.12 255)', 0.95); quadN(ctx, [0.24, 2.5, 0.9], [0.95, 2.45, 0.9], [0.9, 1.6, 0.9], [0.24, 1.7, 0.9], [0, 0, -1]); quadN(ctx, [0.24, 2.5, 0.9], [0.24, 1.7, 0.9], [0.9, 1.6, 0.9], [0.95, 2.45, 0.9], [0, 0, 1]);
  P(null, 'oklch(0.75 0.14 85)'); blob(ctx, 0.6, 2.1, 0.9, 0.12, 0.15, 0.015, 1, 0, 3, 6);
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'tent';
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'palisade') { const R = p.radius || 8; for (let i = 0; i < 12; i++) { const a0 = (12 + 13 * i) * D, a1 = (12 + 13 * (i + 1)) * D, mx = (Math.cos(a0) + Math.cos(a1)) / 2 * R, mz = (Math.sin(a0) + Math.sin(a1)) / 2 * R; boxR(ctx, [mx, 1.3, mz], [0.35, 2.6, 2 * R * Math.sin((a1 - a0) / 2) + 0.2], { yaw: -((a0 + a1) / 2) / D }); } }
    else if (k === 'tent') box(ctx, -1.4, 0, -1.4, 1.4, 1.7, 1.4);
    else if (k === 'lookout') { for (const x of [-1.1, 1.1]) for (const z of [-1.1, 1.1]) box(ctx, x - 0.13, 0, z - 0.13, x + 0.13, 4.5, z + 0.13); box(ctx, -1.3, 3.4, -1.3, 1.3, 3.52, 1.3); }
    else if (k === 'cookfire') { for (const [a, l] of [[200, 1.8], [320, 1.6], [80, 1.7]]) { const x = Math.cos(a * D) * 1.8, z = Math.sin(a * D) * 1.8; boxR(ctx, [x, 0.22, z], [0.4, 0.44, l], { yaw: -a + 90 }); } }
    else box(ctx, -0.55, 0, -0.35, 0.55, 0.55, 0.35);
    return;
  }
  if (k === 'palisade') palisade(ctx, P, far, p.radius || 8);
  else if (k === 'tent') tent(ctx, P, far, p.seed || 1, p.hide || 'oklch(0.5 0.05 60)');
  else if (k === 'lookout') lookout(ctx, P, far);
  else if (k === 'cookfire') cookfire(ctx, P, far);
  else loot(ctx, P, far, p.seed || 1);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
