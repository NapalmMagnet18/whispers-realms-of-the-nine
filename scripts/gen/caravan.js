// Peddler's caravan on the March road (2026-10-08). Front (mule end) is -Z; the stall side is +X.
// kinds: wagon (with the hitched mule), goods {seed}
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const WOOD = 'cdn/texture-painted-wagon-wood-planks-red-ochre.png', CANVAS = 'cdn/texture-oiled-canvas-cloth-cream.png';
const IRON = 'cdn/texture-rusted-black-iron-hammered.png', OAK = 'cdn/texture-dark-oak-timber-grain.png';
const D = Math.PI / 180;
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

function wheel(ctx, P, x, cy, z, r, far) {
  const n = far ? 8 : 14;
  P(OAK, 'oklch(0.42 0.05 55)');
  for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * 360; boxR(ctx, [x, cy + Math.cos(a * D) * r, z + Math.sin(a * D) * r], [0.09, 0.08, 2 * Math.PI * r / n * 1.05], { pitch: a }); }
  if (far) return;
  P(IRON, 'oklch(0.35 0.02 60)', 0.6, 0.7);
  for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * 360; boxR(ctx, [x, cy + Math.cos(a * D) * (r + 0.045), z + Math.sin(a * D) * (r + 0.045)], [0.1, 0.02, 2 * Math.PI * r / n * 1.05], { pitch: a }); }
  P(OAK, 'oklch(0.42 0.05 55)');
  for (let i = 0; i < 8; i++) { const a = i * 45; boxR(ctx, [x, cy + Math.cos(a * D) * r / 2, z + Math.sin(a * D) * r / 2], [0.05, r, 0.05], { pitch: a }); }
  cyl(ctx, x - 0.07, cy - 0.1, z, 0.1, 0.1, 0.2, 8, true);
}

function mule(ctx, P, far) {
  const z0 = -3.0, coat = 'oklch(0.45 0.04 55)', dark = 'oklch(0.28 0.03 50)';
  P(null, coat, 0.95);
  blob(ctx, 0, 1.05, z0, 0.3, 0.33, 0.68, 7, 0.06, far ? 4 : 6, far ? 6 : 9);
  for (const [lx, lz] of [[-0.16, -0.48], [0.16, -0.48], [-0.16, 0.48], [0.16, 0.5]]) {
    P(null, coat, 0.95); cyl(ctx, lx, 0.12, z0 + lz, 0.07, 0.1, 0.8, 6, false);
    P(null, dark, 0.7); cyl(ctx, lx, 0, z0 + lz, 0.075, 0.07, 0.13, 6, true);
  }
  // tired neck: low and forward, head drooping toward the grass
  P(null, coat, 0.95); boxR(ctx, [0, 1.15, z0 - 0.78], [0.22, 0.3, 0.55], { pitch: 25 });
  blob(ctx, 0, 0.92, z0 - 1.12, 0.13, 0.15, 0.3, 3, 0.05, far ? 4 : 5, far ? 6 : 8);
  if (far) return;
  P(null, 'oklch(0.7 0.02 70)', 0.9); blob(ctx, 0, 0.84, z0 - 1.36, 0.11, 0.1, 0.1, 5, 0.04, 4, 6); // pale muzzle
  P(null, coat, 0.95);
  for (const s of [-1, 1]) boxR(ctx, [s * 0.1, 1.2, z0 - 0.98], [0.06, 0.32, 0.04], { roll: s * -35, pitch: -30 }); // long drooping ears
  P(null, dark, 0.9); boxR(ctx, [0, 1.38, z0 - 0.7], [0.05, 0.08, 0.5], { pitch: 25 }); // mane
  boxR(ctx, [0, 0.85, z0 + 0.78], [0.05, 0.5, 0.05], { pitch: -15 }); blob(ctx, 0, 0.58, z0 + 0.85, 0.06, 0.1, 0.06, 2, 0.1, 3, 5); // tail tuft
  // harness: collar, a strap along the back, a blanket
  P(null, 'oklch(0.3 0.06 40)', 0.6); boxR(ctx, [0, 1.12, z0 - 0.55], [0.4, 0.42, 0.1], { pitch: 25 });
  for (const s of [-1, 1]) box(ctx, s * 0.31 - 0.02, 1.0, z0 - 0.55, s * 0.31 + 0.02, 1.06, z0 + 0.3);
  P(null, 'oklch(0.45 0.14 250)', 0.95); boxR(ctx, [0, 1.36, z0 + 0.05], [0.66, 0.06, 0.6]);
  P(null, 'oklch(0.75 0.12 85)', 0.9); boxR(ctx, [0, 1.385, z0 + 0.05], [0.68, 0.02, 0.08]);
}

function wagon(ctx, P, far) {
  const W = 0.8, L = 1.6, bed = 0.85;
  // bed and painted side boards
  P(WOOD, 'oklch(0.55 0.12 35)'); box(ctx, -W, bed, -L, W, bed + 0.12, L);
  for (const s of [-1, 1]) box(ctx, s * W - 0.04, bed + 0.12, -L, s * W + 0.04, bed + 0.75, L);
  box(ctx, -W, bed + 0.12, L - 0.06, W, bed + 0.6, L);
  P(OAK, 'oklch(0.35 0.04 55)'); box(ctx, -0.15, 0.5, -L, 0.15, bed, L); // undercarriage beam
  for (const z of [-1.0, 1.0]) box(ctx, -W - 0.12, 0.48, z - 0.06, W + 0.12, 0.6, z + 0.06); // axles
  for (const s of [-1, 1]) for (const z of [-1.0, 1.0]) wheel(ctx, P, s * (W + 0.15), 0.55, z, 0.55, far);
  // gold trim along the boards
  if (!far) { P(null, 'oklch(0.75 0.13 85)', 0.5, 0.4); for (const s of [-1, 1]) { box(ctx, s * (W + 0.045) - 0.01, bed + 0.68, -L, s * (W + 0.045) + 0.01, bed + 0.72, L); for (let i = 0; i < 5; i++) { const z = -1.3 + i * 0.65; boxR(ctx, [s * (W + 0.05), bed + 0.42, z], [0.02, 0.22, 0.22], { pitch: 45 }); } } }
  // canvas hood on hoops, the stall side (+X) rolled up
  const top = bed + 0.75, hh = 1.0, n = far ? 4 : 10, ribs = far ? 2 : 5;
  const arc = (t) => [-Math.cos(t * Math.PI) * W, top + Math.sin(t * Math.PI) * hh];
  const tEnd = far ? 1 : 0.62; // canvas stops short on the +X side: the roll
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * tEnd, t1 = ((i + 1) / n) * tEnd, [x0, y0] = arc(t0), [x1, y1] = arc(t1), nx = -(x0 + x1) / 2, ny = (y0 + y1) / 2 - top;
    P(CANVAS, 'oklch(0.86 0.03 85)', 0.95);
    quadN(ctx, [x0, y0, -L - 0.1], [x0, y0, L + 0.1], [x1, y1, L + 0.1], [x1, y1, -L - 0.1], [-nx, ny, 0]);
    quadN(ctx, [x0, y0, -L - 0.1], [x1, y1, -L - 0.1], [x1, y1, L + 0.1], [x0, y0, L + 0.1], [nx, -ny, 0]);
    // the back end closed with canvas, the front open
    triN(ctx, [0, top, L], [x0, y0, L], [x1, y1, L], [0, 0, 1]);
  }
  if (!far) {
    const [rx, ry] = arc(tEnd); P(CANVAS, 'oklch(0.8 0.04 80)', 0.95); boxR(ctx, [rx + 0.06, ry - 0.06, 0], [0.18, 0.18, 2 * L + 0.2]); // the rolled canvas
    P(OAK, 'oklch(0.38 0.04 55)'); for (let r = 0; r < ribs; r++) { const z = -L + 0.05 + r * (2 * L - 0.1) / (ribs - 1); for (let i = 0; i < 8; i++) { const [a0, b0] = arc(i / 8), [a1, b1] = arc((i + 1) / 8); boxR(ctx, [(a0 + a1) / 2, (b0 + b1) / 2, z], [Math.hypot(a1 - a0, b1 - b0), 0.05, 0.05], { roll: Math.atan2(b1 - b0, a1 - a0) / D }); } }
    // a painted stripe on the canvas: deep red band
    P(null, 'oklch(0.45 0.15 25)', 0.95); for (let i = 0; i < n; i++) { const t0 = i / n * tEnd, t1 = (i + 1) / n * tEnd; const [x0, y0] = arc(t0), [x1, y1] = arc(t1); quadN(ctx, [x0 * 1.01, y0 + 0.005, L + 0.11], [x1 * 1.01, y1 + 0.005, L + 0.11], [x1 * 1.01, y1 + 0.005, L - 0.25], [x0 * 1.01, y0 + 0.005, L - 0.25], [-(x0 + x1) / 2, (y0 + y1) / 2 - top, 0]); }
  }
  // drop-down counter on the stall side with wares
  P(OAK, 'oklch(0.48 0.06 55)'); box(ctx, W, bed + 0.68, -1.1, W + 0.5, bed + 0.74, 1.1);
  if (!far) {
    P(IRON, 'oklch(0.35 0.02 60)', 0.6, 0.7); for (const z of [-1.0, 1.0]) boxR(ctx, [W + 0.25, bed + 0.5, z], [0.02, 0.02, 0.6], { roll: 0, pitch: 0, yaw: 90 });
    const jar = ['oklch(0.55 0.15 150 / 0.9)', 'oklch(0.5 0.17 300)', 'oklch(0.6 0.16 60)', 'oklch(0.5 0.15 230)'];
    for (let i = 0; i < 7; i++) { const z = -0.95 + i * 0.3; P(null, jar[i % 4], 0.2, 0.0); cyl(ctx, W + 0.2 + (i % 2) * 0.12, bed + 0.74, z, 0.06, 0.05, 0.16 + h(i, 3) * 0.08, 8, true); P(null, 'oklch(0.45 0.05 60)'); cyl(ctx, W + 0.2 + (i % 2) * 0.12, bed + 0.9 + h(i, 3) * 0.08, z, 0.025, 0.025, 0.04, 6, true); }
    // hanging charms and a string of bells along the hoop edge
    for (let i = 0; i < 6; i++) { const z = -1.3 + i * 0.52, y = top + Math.sin(tEnd * Math.PI) * hh - 0.25; P(null, 'oklch(0.6 0.03 70)'); box(ctx, W - 0.31, y, z - 0.005, W - 0.3, y + 0.25, z + 0.005); P(null, i % 2 ? 'oklch(0.75 0.13 85)' : 'oklch(0.6 0.1 200)', 0.3, 0.8); blob(ctx, W - 0.305, y - 0.05, z, 0.05, 0.06, 0.05, i, 0.1, 3, 6); }
    // driver's bench and shafts to the mule
    P(OAK, 'oklch(0.4 0.05 55)'); box(ctx, -W, bed + 0.75, -L - 0.05, W, bed + 0.85, -L + 0.35);
    for (const s of [-1, 1]) boxR(ctx, [s * 0.36, 0.95, -L - 0.85], [0.07, 0.07, 1.9], { pitch: 8 });
    // a hanging lantern at the back
    P(IRON, 'oklch(0.3 0.02 60)', 0.6, 0.8); box(ctx, -0.02, top + 0.4, L + 0.1, 0.02, top + 0.44, L + 0.4); box(ctx, -0.01, top + 0.18, L + 0.37, 0.01, top + 0.4, L + 0.39);
    box(ctx, -0.11, top - 0.1, L + 0.27, 0.11, top - 0.08, L + 0.49); box(ctx, -0.11, top + 0.16, L + 0.27, 0.11, top + 0.18, L + 0.49);
    ctx.color('oklch(0.85 0.15 75)'); ctx.emissive('oklch(0.85 0.17 70)'); box(ctx, -0.08, top - 0.08, L + 0.3, 0.08, top + 0.16, L + 0.46); ctx.emissive(null);
    // pots and pans tied to the side, a coil of rope
    P(IRON, 'oklch(0.4 0.03 50)', 0.5, 0.8); for (let i = 0; i < 3; i++) cyl(ctx, -W - 0.08, bed + 0.2 + i * 0.03, -0.6 + i * 0.4, 0.14 - i * 0.02, 0.15 - i * 0.02, 0.12, 10, true);
  }
  mule(ctx, P, far);
}

function goods(ctx, P, far, seed) {
  // stacked crates, a barrel, sacks and a rug of laid-out wares
  const crates = [[0, 0, 0, 0.7], [0.75, 0, 0.1, 0.6], [0.3, 0.7, 0.05, 0.55], [-0.2, 0, 0.85, 0.5]];
  for (const [x, y, z, s] of crates) {
    P(OAK, 'oklch(0.55 0.05 65)'); boxR(ctx, [x, y + s / 2, z], [s, s, s], { yaw: h(x * 3, seed) * 20 });
    if (!far) { P(OAK, 'oklch(0.4 0.05 55)'); boxR(ctx, [x, y + s / 2, z], [s + 0.02, 0.08, s + 0.02], { yaw: h(x * 3, seed) * 20 }); boxR(ctx, [x, y + s / 2, z], [0.08, s + 0.02, s + 0.02], { yaw: h(x * 3, seed) * 20 }); }
  }
  P(OAK, 'oklch(0.5 0.06 60)'); cyl(ctx, -0.9, 0, -0.1, 0.3, 0.3, 0.9, 12, true);
  if (far) return;
  P(IRON, 'oklch(0.32 0.02 60)', 0.6, 0.7); for (const y of [0.15, 0.75]) cyl(ctx, -0.9, y, -0.1, 0.31, 0.31, 0.05, 12, false);
  P(null, 'oklch(0.7 0.05 80)', 0.98); blob(ctx, -0.5, 0.25, 0.7, 0.28, 0.25, 0.22, seed, 0.15, 5, 8); blob(ctx, -0.95, 0.22, 0.55, 0.25, 0.22, 0.2, seed + 1, 0.15, 5, 8);
  // the rug and its wares: a sword, a helm, a shield and a couple of books
  P(null, 'oklch(0.42 0.13 25)', 0.98); box(ctx, 1.2, 0, -1.3, 2.4, 0.02, 0.2);
  P(null, 'oklch(0.75 0.12 85)', 0.95); box(ctx, 1.25, 0.021, -1.25, 2.35, 0.025, -1.2); box(ctx, 1.25, 0.021, 0.1, 2.35, 0.025, 0.15);
  P(IRON, 'oklch(0.72 0.01 250)', 0.3, 0.9); boxR(ctx, [1.6, 0.04, -0.6], [0.06, 0.02, 0.85], { yaw: 20 });
  P(null, 'oklch(0.4 0.08 60)'); boxR(ctx, [1.45, 0.05, -0.2], [0.2, 0.04, 0.05], { yaw: 20 });
  P(IRON, 'oklch(0.55 0.02 250)', 0.4, 0.85); blob(ctx, 2.05, 0.12, -0.9, 0.15, 0.13, 0.16, 4, 0.05, 4, 8);
  P(WOOD, 'oklch(0.45 0.1 250)'); cyl(ctx, 2.05, 0.02, -0.3, 0.3, 0.3, 0.06, 12, true);
  P(null, 'oklch(0.75 0.13 85)', 0.4, 0.6); cyl(ctx, 2.05, 0.08, -0.3, 0.08, 0.08, 0.03, 8, true);
  P(null, 'oklch(0.35 0.1 20)'); boxR(ctx, [1.5, 0.06, -1.05], [0.22, 0.08, 0.3], { yaw: -10 }); P(null, 'oklch(0.3 0.08 150)'); boxR(ctx, [1.52, 0.13, -1.03], [0.2, 0.06, 0.28], { yaw: 15 });
  // a little stool and the hand-painted sign on a post
  P(OAK, 'oklch(0.45 0.05 55)'); cyl(ctx, 0.9, 0.42, 1.2, 0.2, 0.2, 0.05, 10, true); for (let i = 0; i < 3; i++) { const a = i * 120 * D; boxR(ctx, [0.9 + Math.cos(a) * 0.12, 0.21, 1.2 + Math.sin(a) * 0.12], [0.04, 0.44, 0.04]); }
  box(ctx, 2.6, 0, 0.6, 2.68, 1.7, 0.68); P(WOOD, 'oklch(0.6 0.1 60)'); box(ctx, 2.3, 1.2, 0.62, 2.98, 1.6, 0.66);
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'wagon';
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'wagon') { box(ctx, -1.05, 0, -1.7, 1.05, 1.7, 1.7); box(ctx, -0.35, 0, -3.8, 0.35, 1.3, -2.3); }
    else { box(ctx, -1.25, 0, -0.45, 1.1, 1.3, 1.15); box(ctx, 2.58, 0, 0.58, 2.7, 1.7, 0.7); }
    return;
  }
  if (k === 'wagon') wagon(ctx, P, far); else goods(ctx, P, far, p.seed || 1);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
