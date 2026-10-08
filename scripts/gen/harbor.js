// Gullrest fish market pieces (2026-10-08). All face -Z. kinds: fishstall {stripe, seed}, pots {seed}, anchor
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const DRIFT = 'cdn/texture-driftwood-planks-weathered-grey.png', CANVAS = 'cdn/texture-striped-sailcloth-canvas-faded.png';
const IRON = 'cdn/texture-rusted-black-iron-hammered.png', ROPE = 'cdn/texture-coiled-hemp-rope-braided.png';
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }
const FISH = ['oklch(0.72 0.03 230)', 'oklch(0.65 0.08 40)', 'oklch(0.6 0.05 160)', 'oklch(0.78 0.02 90)', 'oklch(0.55 0.1 20)'];

// a fish lying along +X (nose at +len/2), or hanging nose-down when hang = true
function fish(ctx, P, x, y, z, len, i, hang, far) {
  P(null, FISH[i % FISH.length], 0.3, 0.2);
  if (hang) {
    blob(ctx, x, y - len * 0.45, z, len * 0.13, len * 0.4, len * 0.08, i, 0.05, 3, far ? 5 : 7);
    if (!far) { triN(ctx, [x, y - len * 0.05, z], [x - len * 0.16, y + len * 0.12, z], [x + len * 0.16, y + len * 0.12, z], [0, 0, -1]); triN(ctx, [x, y - len * 0.05, z], [x + len * 0.16, y + len * 0.12, z], [x - len * 0.16, y + len * 0.12, z], [0, 0, 1]); }
  } else {
    blob(ctx, x, y + len * 0.1, z, len * 0.4, len * 0.1, len * 0.13, i, 0.05, 3, far ? 5 : 7);
    if (!far) { triN(ctx, [x - len * 0.38, y + len * 0.1, z], [x - len * 0.58, y + len * 0.1, z - len * 0.16], [x - len * 0.58, y + len * 0.1, z + len * 0.16], [0, 1, 0]); }
  }
}

function fishstall(ctx, P, far, p) {
  const seed = p.seed || 1, stripe = p.stripe || 'oklch(0.55 0.12 240)';
  P(DRIFT, 'oklch(0.7 0.02 70)');
  for (const x of [-1.2, 1.2]) for (const z of [-0.6, 0.6]) box(ctx, x - 0.07, 0, z - 0.07, x + 0.07, z < 0 ? 2.3 : 2.6, z + 0.07);
  box(ctx, -1.25, 0.85, -0.65, 1.25, 0.95, 0.65); // counter top
  box(ctx, -1.25, 0, -0.62, 1.25, 0.85, -0.58); // front skirt
  // awning: slanted canvas in stripes, scalloped valance
  const n = far ? 3 : 7;
  for (let i = 0; i < n; i++) {
    const x0 = -1.45 + (2.9 / n) * i, x1 = x0 + 2.9 / n;
    P(CANVAS, i % 2 ? 'oklch(0.92 0.02 90)' : stripe, 0.9);
    quadN(ctx, [x0, 2.25, -1.0], [x1, 2.25, -1.0], [x1, 2.7, 0.75], [x0, 2.7, 0.75], [0, 0.97, -0.25]);
    quadN(ctx, [x0, 2.25, -1.0], [x0, 2.7, 0.75], [x1, 2.7, 0.75], [x1, 2.25, -1.0], [0, -0.97, 0.25]);
    if (!far) { triN(ctx, [x0, 2.25, -1.0], [x1, 2.25, -1.0], [(x0 + x1) / 2, 2.05, -1.0], [0, 0, -1]); triN(ctx, [x0, 2.25, -1.0], [(x0 + x1) / 2, 2.05, -1.0], [x1, 2.25, -1.0], [0, 0, 1]); }
  }
  if (far) return;
  // ice crates on the counter, fish laid in them
  for (let c = 0; c < 3; c++) {
    const cx = -0.8 + c * 0.8;
    P(DRIFT, 'oklch(0.6 0.03 60)'); box(ctx, cx - 0.35, 0.95, -0.5, cx + 0.35, 1.0, 0.0); for (const zz of [-0.5, -0.05]) box(ctx, cx - 0.35, 0.95, zz, cx + 0.35, 1.1, zz + 0.05);
    P(null, 'oklch(0.95 0.02 220)', 0.1); box(ctx, cx - 0.32, 1.0, -0.45, cx + 0.32, 1.06, -0.05);
    for (let f = 0; f < 3; f++) fish(ctx, P, cx + (h(f + c * 5, seed) - 0.5) * 0.1, 1.05, -0.38 + f * 0.13, 0.4 + h(f, c + seed) * 0.15, f + c * 2 + seed, false, false);
  }
  // a line of fish hung under the awning's front edge
  P(ROPE, 'oklch(0.7 0.05 80)'); box(ctx, -1.2, 2.18, -0.63, 1.2, 2.2, -0.61);
  for (let i = 0; i < 6; i++) { const x = -1.0 + i * 0.4; P(null, 'oklch(0.6 0.04 80)'); box(ctx, x - 0.005, 1.95, -0.625, x + 0.005, 2.18, -0.615); fish(ctx, P, x, 1.95, -0.62, 0.42 + h(i, seed + 3) * 0.2, i + seed, true, false); }
  // a hanging scale and a cleaver on a block
  P(IRON, 'oklch(0.5 0.03 70)', 0.4, 0.8); box(ctx, 1.0, 1.55, 0.25, 1.02, 2.3, 0.27); cyl(ctx, 1.01, 1.5, 0.26, 0.15, 0.15, 0.03, 10, true);
  P(DRIFT, 'oklch(0.55 0.04 50)'); cyl(ctx, -1.6, 0, -0.2, 0.25, 0.27, 0.7, 10, true);
  P(IRON, 'oklch(0.75 0.01 250)', 0.3, 0.9); boxR(ctx, [-1.6, 0.8, -0.2], [0.02, 0.14, 0.25], { roll: 15 });
  // a bucket and a basket of shellfish beside it
  P(DRIFT, 'oklch(0.55 0.04 60)'); cyl(ctx, 1.65, 0, -0.3, 0.2, 0.24, 0.4, 10, true);
  P(null, 'oklch(0.35 0.05 260)', 0.3); for (let i = 0; i < 6; i++) blob(ctx, 1.65 + (h(i, 9) - 0.5) * 0.2, 0.42, -0.3 + (h(i, 11) - 0.5) * 0.2, 0.05, 0.03, 0.04, i, 0.2, 3, 5);
}

function pots(ctx, P, far, seed) {
  // stacked lobster pots: half-barrel frames of slats with netting, plus coiled rope and a buoy
  const spots = [[0, 0, 0], [0.75, 0, 0.1], [0.38, 0.55, 0.05], [-0.7, 0, -0.15]];
  for (const [x, y, z] of spots) {
    P(DRIFT, 'oklch(0.62 0.03 60)'); box(ctx, x - 0.35, y, z - 0.25, x + 0.35, y + 0.04, z + 0.25);
    const ns = far ? 3 : 6;
    for (let i = 0; i <= ns; i++) { const a = Math.PI * (i / ns), cy = y + Math.sin(a) * 0.45, cz = z + Math.cos(a) * 0.25; box(ctx, x - 0.35, cy - 0.02, cz - 0.02, x + 0.35, cy + 0.02, cz + 0.02); }
    if (!far) { P(ROPE, 'oklch(0.5 0.04 80)', 0.95); for (const xx of [-0.33, 0, 0.33]) for (let i = 0; i < 5; i++) { const a0 = Math.PI * i / 5, a1 = Math.PI * (i + 1) / 5; boxR(ctx, [x + xx, y + (Math.sin(a0) + Math.sin(a1)) * 0.225, z + (Math.cos(a0) + Math.cos(a1)) * 0.125], [0.015, 0.015, 0.16], { pitch: -(a0 + a1) / 2 * 57.3 + 90 }); } }
  }
  if (far) return;
  P(ROPE, 'oklch(0.68 0.06 80)'); for (let i = 0; i < 4; i++) cyl(ctx, 1.4, i * 0.06, 0.4, 0.32 - i * 0.03, 0.32 - i * 0.03, 0.06, 12, false);
  P(null, 'oklch(0.6 0.2 30)', 0.5); blob(ctx, -0.2, 0.15, 0.55, 0.16, 0.16, 0.16, 4, 0, 4, 8); P(null, 'oklch(0.95 0.01 90)'); cyl(ctx, -0.2, 0.12, 0.55, 0.165, 0.165, 0.07, 8, false);
}

function anchor(ctx, P, far) {
  // a great old anchor half sunk in sand, leaning on its stock, chain trailing
  P(IRON, 'oklch(0.42 0.04 45)', 0.7, 0.6);
  boxR(ctx, [0, 1.2, 0], [0.18, 2.6, 0.18], { roll: 18 });
  boxR(ctx, [0.4, 2.35, 0], [1.6, 0.14, 0.14], { roll: 18 }); // stock
  P(null, 'oklch(0.42 0.04 45)', 0.7, 0.6); cyl(ctx, -0.44, 2.45, 0, 0.18, 0.18, 0.08, 10, false); // ring (approximate)
  const n = far ? 4 : 8;
  for (let i = 0; i < n; i++) { const a0 = Math.PI * (0.15 + 0.7 * i / n), a1 = Math.PI * (0.15 + 0.7 * (i + 1) / n), r = 0.9; boxR(ctx, [Math.cos((a0 + a1) / 2) * r, 0.25 - Math.sin((a0 + a1) / 2) * r * 0.35 + 0.15, 0], [r * 0.4, 0.16, 0.16], { roll: 90 - ((a0 + a1) / 2) * 57.3 }); }
  for (const s of [-1, 1]) { triN(ctx, [s * 0.75, 0.05, 0], [s * 1.05, 0.55, 0.0], [s * 0.85, 0.5, 0.12], [s, 0.5, 0.5]); triN(ctx, [s * 0.75, 0.05, 0], [s * 0.85, 0.5, -0.12], [s * 1.05, 0.55, 0], [s, 0.5, -0.5]); }
  if (!far) { P(IRON, 'oklch(0.35 0.04 45)', 0.7, 0.6); for (let i = 0; i < 9; i++) boxR(ctx, [-0.6 - i * 0.18, 0.05, 0.2 + Math.sin(i) * 0.2], [0.16, 0.05, 0.09], { yaw: i % 2 ? 90 : 0 }); }
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'fishstall';
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'fishstall') box(ctx, -1.3, 0, -0.65, 1.3, 1.1, 0.65);
    else if (k === 'pots') box(ctx, -1.05, 0, -0.4, 1.75, 1.0, 0.75);
    else box(ctx, -1.1, 0, -0.3, 1.1, 1.0, 0.3);
    return;
  }
  if (k === 'fishstall') fishstall(ctx, P, far, p); else if (k === 'pots') pots(ctx, P, far, p.seed || 1); else anchor(ctx, P, far);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
