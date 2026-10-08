// The fallen giant across the Starfall road (2026-10-08). Local Z runs along the road; the spine lies at -X,
// each rib arches over the road and its tip rests at +X. kinds: rib {s, seed}, skull, sword, bones {seed}
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const BONE = 'cdn/texture-weathered-bone-surface-cracked.png', IRON = 'cdn/texture-rusted-black-iron-hammered.png';
const LEATHER = 'cdn/texture-patched-animal-hide-leather-stitched.png';
const D = Math.PI / 180;
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

// a tapering tube along points (each [x,y,z]) with radii, sides around
function tube(ctx, pts, rad, sides, capEnd = true) {
  const rings = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
    let t = [q[0] - o[0], q[1] - o[1], q[2] - o[2]]; const tl = Math.hypot(...t) || 1; t = t.map((v) => v / tl);
    let a = Math.abs(t[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    let n = [t[1] * a[2] - t[2] * a[1], t[2] * a[0] - t[0] * a[2], t[0] * a[1] - t[1] * a[0]]; const nl = Math.hypot(...n); n = n.map((v) => v / nl);
    const b = [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
    const ring = [];
    for (let k = 0; k < sides; k++) { const ang = k / sides * 2 * Math.PI, c = Math.cos(ang), s = Math.sin(ang), r = rad[i]; const d = [n[0] * c + b[0] * s, n[1] * c + b[1] * s, n[2] * c + b[2] * s]; ring.push({ p: [p[0] + d[0] * r, p[1] + d[1] * r, p[2] + d[2] * r], d }); }
    rings.push(ring);
  }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < sides; k++) {
    const k1 = (k + 1) % sides, A = rings[i][k], B = rings[i][k1], C = rings[i + 1][k1], E = rings[i + 1][k];
    quadN(ctx, A.p, B.p, C.p, E.p, [(A.d[0] + B.d[0]) / 2, (A.d[1] + B.d[1]) / 2, (A.d[2] + B.d[2]) / 2]);
  }
  if (capEnd) { const e = pts[pts.length - 1], r = rings[rings.length - 1], pr = pts[pts.length - 2]; const t = [e[0] - pr[0], e[1] - pr[1], e[2] - pr[2]]; for (let k = 0; k < sides; k++) triN(ctx, r[k].p, r[(k + 1) % sides].p, e, t); }
}

function rib(ctx, P, far, s, seed) {
  const sides = far ? 4 : 8, n = far ? 7 : 16, W = 6.2 * s, Ht = 7.5 * s;
  const pts = [], rad = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = Math.PI * (1 - t);
    const bend = Math.sin(t * Math.PI) * 0.6 * s; // a slight sweep along the road, like a real rib
    pts.push([Math.cos(a) * W, 0.5 + Math.sin(a) * Ht * (1 - 0.08 * t), bend + (h(i, seed) - 0.5) * 0.08]);
    rad.push((0.5 - 0.32 * t) * s * (1 + (h(i + 9, seed) - 0.5) * 0.15));
  }
  P(BONE, 'oklch(0.84 0.03 85)', 0.75); tube(ctx, pts, rad, sides);
  // vertebra at the spine end: a fat disc with spinous process and wing knobs
  P(BONE, 'oklch(0.8 0.03 80)', 0.75);
  cyl(ctx, -W - 0.4 * s, 0, -0.7 * s, 0.85 * s, 0.85 * s, 1.0 * s, far ? 6 : 10, true);
  if (far) return;
  boxR(ctx, [-W - 1.2 * s, 0.9 * s, -0.2 * s], [0.25 * s, 1.6 * s, 0.6 * s], { roll: 55 });
  blob(ctx, -W - 0.4 * s, 0.6 * s, 0.4 * s, 0.4 * s, 0.4 * s, 0.4 * s, seed, 0.15, 4, 7);
  // cracks and old moss on the lower curve, a chip missing
  P(null, 'oklch(0.45 0.08 130)', 1); for (let i = 0; i < 3; i++) { const p = pts[i + 1]; blob(ctx, p[0] + 0.1, p[1] - 0.25 * s, p[2], 0.35 * s, 0.15 * s, 0.35 * s, i + seed, 0.3, 3, 6); }
  P(null, 'oklch(0.35 0.03 60)', 1); for (let i = 0; i < 4; i++) { const p = pts[4 + i * 2]; boxR(ctx, [p[0], p[1] + rad[4 + i * 2] * 0.98, p[2]], [0.03, 0.02, 0.4 * s], { yaw: 20 + i * 30 }); }
}

function skull(ctx, P, far) {
  // a vast horned skull, sunk to its cheekbones, jaw fallen open beside it; faces -Z (toward the ribs)
  P(BONE, 'oklch(0.82 0.03 85)', 0.75);
  blob(ctx, 0, 1.6, 0.6, 2.8, 2.6, 3.0, 4, 0.06, far ? 5 : 9, far ? 8 : 14); // cranium
  blob(ctx, 0, 0.9, -2.0, 1.9, 1.5, 1.7, 5, 0.08, far ? 4 : 7, far ? 6 : 12); // snout / maxilla
  if (far) return;
  boxR(ctx, [0, 2.6, -1.4], [4.2, 0.7, 1.0], { pitch: 15 }); // brow ridge
  P(null, 'oklch(0.1 0.01 30)', 1);
  for (const s of [-1, 1]) blob(ctx, s * 1.15, 2.0, -1.55, 0.75, 0.65, 0.5, s + 3, 0.1, 5, 8); // sockets
  blob(ctx, 0, 1.1, -3.55, 0.45, 0.35, 0.3, 2, 0.1, 4, 6); // nasal pit
  // a faint ember still deep in one socket
  ctx.albedo(null); ctx.color('oklch(0.6 0.2 30)'); ctx.emissive('oklch(0.55 0.2 30)'); blob(ctx, 1.15, 2.0, -1.4, 0.18, 0.18, 0.18, 1, 0, 3, 6); ctx.emissive(null);
  // upper teeth
  P(BONE, 'oklch(0.88 0.03 85)', 0.6);
  for (let i = 0; i < 9; i++) { const a = (-60 + i * 15) * D, x = Math.sin(a) * 1.6, z = -2.0 - Math.cos(a) * 1.5, hgt = i === 1 || i === 7 ? 1.3 : 0.55; triN(ctx, [x - 0.18, 0.45, z], [x + 0.18, 0.45, z], [x, 0.45 - hgt, z - 0.05], [0, 0, -1]); triN(ctx, [x + 0.18, 0.45, z], [x - 0.18, 0.45, z], [x, 0.45 - hgt, z - 0.05], [0, 0, 1]); }
  // curling horns: tubes sweeping back and down
  P(BONE, 'oklch(0.6 0.04 70)', 0.6);
  for (const s of [-1, 1]) { const pts = [], rad = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = t * 260 * D; pts.push([s * (2.2 + t * 1.4 + Math.sin(a) * 0.3), 3.0 + Math.sin(a) * 2.0 * (1 - t * 0.4), 0.2 + Math.cos(a) * -2.0 * (1 - t * 0.3) + t * 1.0]); rad.push(0.55 * (1 - t * 0.85)); } tube(ctx, pts, rad, 8); }
  // the fallen jaw, open, lying to one side
  P(BONE, 'oklch(0.8 0.03 85)', 0.75);
  const jx = 3.6; boxR(ctx, [jx, 0.25, -2.4], [0.6, 0.5, 3.6], { yaw: -25 }); boxR(ctx, [jx - 1.3, 0.25, -3.6], [2.6, 0.5, 0.6], { yaw: -25 });
  for (let i = 0; i < 6; i++) { const z = -1.2 - i * 0.45; const x = jx + Math.sin(-25 * D) * (z + 2.4); triN(ctx, [x - 0.15, 0.5, z], [x + 0.15, 0.5, z], [x, 1.0, z], [0, 0, -1]); triN(ctx, [x + 0.15, 0.5, z], [x - 0.15, 0.5, z], [x, 1.0, z], [0, 0, 1]); }
}

function sword(ctx, P, far) {
  // a giant's blade driven slantwise into the earth, rust-black, its grip wrapped in rotted leather
  const tilt = { roll: 12, pitch: -8 };
  P(IRON, 'oklch(0.38 0.04 45)', 0.65, 0.7);
  boxR(ctx, [0, 3.0, 0], [0.9, 6.0, 0.14], tilt);
  if (!far) { triN(ctx, [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 1, 0]); }
  boxR(ctx, [Math.sin(-12 * D) * -6.1, 6.1, Math.sin(8 * D) * 6.1 * 0], [2.6, 0.35, 0.4], tilt); // crossguard
  if (far) return;
  P(LEATHER, 'oklch(0.3 0.04 45)', 0.95); boxR(ctx, [-Math.sin(12 * D) * 7.1, 7.1 * Math.cos(12 * D), Math.sin(8 * D) * 7.1], [0.32, 1.7, 0.32], tilt);
  P(IRON, 'oklch(0.36 0.04 45)', 0.6, 0.7); blob(ctx, -Math.sin(12 * D) * 8.1, 8.05 * Math.cos(12 * D), Math.sin(8 * D) * 8.1, 0.35, 0.35, 0.35, 2, 0.1, 4, 7);
  // nicks along the edge and a dark fuller
  P(null, 'oklch(0.2 0.02 40)', 0.9); boxR(ctx, [0.0, 3.4, -0.075], [0.18, 5.0, 0.01], tilt); boxR(ctx, [0.0, 3.4, 0.075], [0.18, 5.0, 0.01], tilt);
}

function bones(ctx, P, far, seed) {
  // scattered finger bones and a long arm bone half in the grass
  P(BONE, 'oklch(0.82 0.03 85)', 0.75);
  const arm = []; const ar = []; for (let i = 0; i <= 8; i++) { const t = i / 8; arm.push([-3 + t * 6, 0.35 + Math.sin(t * Math.PI) * 0.15, (h(i, seed) - 0.5) * 0.1]); ar.push(0.35 + (Math.abs(t - 0.5) * 2) ** 3 * 0.35); }
  tube(ctx, arm, ar, far ? 4 : 8);
  if (far) return;
  blob(ctx, -3.1, 0.45, 0, 0.6, 0.55, 0.55, seed, 0.1, 4, 7); blob(ctx, 3.1, 0.45, 0, 0.55, 0.5, 0.6, seed + 1, 0.1, 4, 7);
  for (let f = 0; f < 4; f++) { const z0 = 1.6 + f * 0.6, pts = [], rad = []; for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push([4.0 + t * 2.2, 0.2 + Math.sin(t * 2.2) * 0.4, z0 + t * (f - 1.5) * 0.3]); rad.push(0.2 - t * 0.12); } tube(ctx, pts, rad, 6); }
}

function build(ctx, col) {
  const p = ctx.params || {}, far = (ctx.lod || 1) >= 5, k = p.kind || 'rib', s = p.s || 1;
  const P = (tex, c, r = 0.85, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  if (col) {
    if (k === 'rib') { box(ctx, -6.2 * s - 1.3 * s, 0, -1.2 * s, -6.2 * s + 0.5 * s, 2.0 * s, 0.6 * s); box(ctx, 6.2 * s - 0.5, 0, -0.4, 6.2 * s + 0.3, 1.0, 0.4); }
    else if (k === 'skull') { box(ctx, -2.8, 0, -3.8, 2.8, 4.2, 3.4); box(ctx, 2.6, 0, -4.5, 4.4, 0.5, -0.5); }
    else if (k === 'sword') boxR(ctx, [0, 3.0, 0], [0.9, 6.0, 0.3], { roll: 12, pitch: -8 });
    else box(ctx, -3.6, 0, -0.6, 3.6, 0.8, 0.6);
    return;
  }
  if (k === 'rib') rib(ctx, P, far, s, p.seed || 1);
  else if (k === 'skull') skull(ctx, P, far);
  else if (k === 'sword') sword(ctx, P, far);
  else bones(ctx, P, far, p.seed || 1);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
