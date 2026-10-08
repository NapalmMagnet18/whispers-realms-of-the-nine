// Emberstone Quarry pieces by params.kind: crane, load, track, minecart, cave, tent, campfire, toolrack, lanternpost, journal, overlook.
// Frame: origin at the ground, −Z forward (the crane's jib, the cave's depth, the tent's door, the bench's view).
import { box, boxR, cyl, blob, quadN, triN } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const WOOD = T("dark-oak-timber-beam-hand-painted"), PLANK = T("worn-oak-floor-boards"), STONE = T("rough-fieldstone-wall-mossy"), IRON = T("rusted-black-iron-hammered");
const ROCK = "/cdn/rocks-desert-diffuse-u6937xdf7.webp", CANVAS = T("weathered-canvas-tent-fabric"), ASHLAR = T("chiselled-red-sandstone-ashlar-block"), LEATHER = T("worn-brown-leather-book-cover");
const P = (ctx, s, tex, col, r = 0.85, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const hash = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7 + 17.3) * 43758.5453; return n - Math.floor(n); };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nz = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function frame(a, b) { const d = nz(sub(b, a)); let u = cr(d, [0, 1, 0]); if (Math.hypot(...u) < 0.01) u = cr(d, [1, 0, 0]); u = nz(u); return [d, u, nz(cr(u, d))]; }
// a squared timber from a to b
function beam(ctx, a, b, t, t2 = t) {
  const [, u, v] = frame(a, b), C = [];
  for (const e of [a, b]) for (const su of [-1, 1]) for (const sv of [-1, 1]) C.push([0, 1, 2].map((j) => e[j] + u[j] * su * t / 2 + v[j] * sv * t2 / 2));
  const m = [0, 1, 2].map((j) => (a[j] + b[j]) / 2);
  for (const f of [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]]) {
    const c = [0, 1, 2].map((j) => f.reduce((s, i) => s + C[i][j] / 4, 0));
    quadN(ctx, C[f[0]], C[f[1]], C[f[2]], C[f[3]], sub(c, m));
  }
}
// a round rod (rope, axle, handle, log) from a to b
function rod(ctx, a, b, r, seg = 8, caps = true, r2 = r) {
  const [d, u, v] = frame(a, b);
  const dir = (t) => [0, 1, 2].map((j) => u[j] * Math.cos(t) + v[j] * Math.sin(t));
  const ring = (e, rr) => { const o = []; for (let i = 0; i < seg; i++) { const n = dir((i / seg) * Math.PI * 2); o.push([0, 1, 2].map((j) => e[j] + n[j] * rr)); } return o; };
  const A = ring(a, r), B = ring(b, r2);
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    quadN(ctx, A[i], A[j], B[j], B[i], dir(((i + 0.5) / seg) * Math.PI * 2));
    if (caps) { triN(ctx, a, A[j], A[i], [-d[0], -d[1], -d[2]]); triN(ctx, b, B[i], B[j], d); }
  }
}
const lantern = (ctx, x, y, z, s) => { // an iron cage lantern hanging with its top at (x,y,z)
  if (s) return;
  P(ctx, s, IRON, "oklch(0.75 0.01 60)", 0.6, 0.7);
  box(ctx, x - 0.15, y - 0.06, z - 0.15, x + 0.15, y, z + 0.15); box(ctx, x - 0.14, y - 0.5, z - 0.14, x + 0.14, y - 0.45, z + 0.14);
  for (const dx of [-0.13, 0.13]) for (const dz of [-0.13, 0.13]) box(ctx, x + dx - 0.015, y - 0.46, z + dz - 0.015, x + dx + 0.015, y - 0.05, z + dz + 0.015);
  boxR(ctx, [x, y + 0.06, z], [0.18, 0.12, 0.18], { yaw: 45 }); rod(ctx, [x, y + 0.12, z], [x, y + 0.2, z], 0.04, 6);
  ctx.albedo(null); ctx.color("oklch(0.92 0.08 80)"); ctx.emissive(3.4, 1.9, 0.6); box(ctx, x - 0.1, y - 0.44, z - 0.1, x + 0.1, y - 0.08, z + 0.1); ctx.emissive(null);
};

function crane(ctx, s, p) {
  const H = p.mast ?? 11.5, R = p.reach ?? 9.5, TY = p.tipY ?? 10.8, D = !s && (ctx.lod ?? 1) <= 2;
  P(ctx, s, STONE, "oklch(0.93 0.02 60)");
  for (const x of [-2.3, 2.3]) for (const z of [-2.3, 2.3]) box(ctx, x - 0.45, -2.6, z - 0.45, x + 0.45, 0.45, z + 0.45);
  box(ctx, -0.65, -2.6, -0.65, 0.65, 0.5, 0.65);
  P(ctx, s, WOOD, "oklch(0.9 0.03 60)");
  for (const z of [-2.3, 2.3]) box(ctx, -2.75, 0.45, z - 0.2, 2.75, 0.8, z + 0.2);
  for (const x of [-2.3, 2.3]) box(ctx, x - 0.2, 0.45, -2.75, x + 0.2, 0.8, 2.75);
  box(ctx, -2.3, 0.5, -0.18, 2.3, 0.82, 0.18); box(ctx, -0.18, 0.5, -2.3, 0.18, 0.82, 2.3);
  box(ctx, -0.26, 0.8, -0.26, 0.26, H, 0.26); // mast
  for (const x of [-2.3, 2.3]) beam(ctx, [0, H - 0.5, 0.15], [x, 0.8, 2.3], 0.3); // stiff legs
  for (const [x, z] of [[-2.1, 0], [2.1, 0], [0, -2.1]]) beam(ctx, [x * 0.12, 3.0, z * 0.12], [x, 0.8, z], 0.2); // knee braces
  for (const x of [-0.3, 0.3]) beam(ctx, [x, 1.5, -0.4], [x * 0.45, TY, -R], 0.24, 0.3); // the jib's twin arms
  // windlass and counterweight
  for (const x of [-0.95, 0.95]) { beam(ctx, [x, 0.8, 0.9], [x, 1.9, 1.3], 0.16); beam(ctx, [x, 0.8, 1.7], [x, 1.9, 1.3], 0.16); }
  rod(ctx, [-0.88, 1.65, 1.3], [0.88, 1.65, 1.3], 0.28, 10);
  P(ctx, s, STONE, "oklch(0.88 0.02 50)"); box(ctx, -1.5, 0.8, 1.85, 1.5, 1.55, 2.65);
  if (!D) return;
  P(ctx, s, WOOD, "oklch(0.88 0.03 60)");
  for (let i = 1; i < 6; i++) { const t = i / 6, z = -0.4 + (-R + 0.4) * t, y = 1.5 + (TY - 1.5) * t, w = 0.3 * (1 - t * 0.55); box(ctx, -w - 0.1, y - 0.08, z - 0.08, w + 0.1, y + 0.08, z + 0.08); }
  for (const sd of [-1, 1]) { const x = sd * 0.95; rod(ctx, [x, 1.65, 1.3], [x + sd * 0.12, 1.65, 1.3], 0.04, 6); }
  P(ctx, s, IRON, "oklch(0.72 0.01 60)", 0.55, 0.75);
  for (let y = 1.6; y < H; y += 2.1) box(ctx, -0.29, y, -0.29, 0.29, y + 0.12, 0.29);
  box(ctx, -0.32, H - 0.1, -0.32, 0.32, H + 0.15, 0.32);
  rod(ctx, [-0.25, TY + 0.05, -R], [0.25, TY + 0.05, -R], 0.3, 12); // tip sheave
  rod(ctx, [-0.2, H + 0.3, 0], [0.2, H + 0.3, 0], 0.22, 10);
  for (const sd of [-1, 1]) { rod(ctx, [sd * 1.0, 1.65, 1.3], [sd * 1.05, 1.65, 1.75], 0.025, 5); rod(ctx, [sd * 1.05, 1.65, 1.75], [sd * 1.3, 1.65, 1.75], 0.035, 5); }
  P(ctx, s, null, "oklch(0.62 0.06 75)", 0.95);
  rod(ctx, [0, H + 0.5, 0], [0, TY + 0.3, -R], 0.04, 5); // jib stay
  rod(ctx, [0, 1.92, 1.3], [0, H + 0.1, 0.18], 0.035, 5); // hoist rope to the mast head
  rod(ctx, [0, H + 0.3, -0.2], [0, TY + 0.35, -R + 0.1], 0.035, 5); // hoist rope along the jib
  for (let k = 0; k < 7; k++) rod(ctx, [-0.88 + k * 0.25, 1.65, 1.3], [-0.76 + k * 0.25, 1.65, 1.3], 0.3, 10, true); // rope wound on the drum
}
function load(ctx, s, p) { // hangs from its origin (the tip sheave) straight down
  const L = p.L ?? 10;
  P(ctx, s, null, "oklch(0.62 0.06 75)", 0.95); rod(ctx, [0, 0, 0], [0, -L, 0], 0.035, 5);
  P(ctx, s, IRON, "oklch(0.7 0.01 60)", 0.5, 0.8);
  box(ctx, -0.12, -L - 0.35, -0.07, 0.12, -L, 0.07); rod(ctx, [0, -L - 0.35, 0], [0, -L - 0.6, 0.12], 0.04, 6); rod(ctx, [0, -L - 0.6, 0.12], [0, -L - 0.5, 0.25], 0.04, 6);
  for (const x of [-0.55, 0.55]) for (const z of [-0.38, 0.38]) rod(ctx, [0, -L - 0.55, 0.05], [x, -L - 1.35, z], 0.025, 4);
  box(ctx, -0.75, -L - 1.42, -0.05, 0.75, -L - 1.3, 0.05);
  P(ctx, s, ASHLAR, "oklch(0.93 0.05 40)", 0.92);
  box(ctx, -0.7, -L - 2.4, -0.48, 0.7, -L - 1.4, 0.48);
  P(ctx, s, IRON, "oklch(0.7 0.01 60)", 0.5, 0.8);
  for (const x of [-0.72, 0.72]) box(ctx, x - 0.04, -L - 1.75, -0.08, x + 0.04, -L - 1.3, 0.08);
}
function track(ctx, s, p) {
  const len = p.len ?? 12;
  P(ctx, s, WOOD, "oklch(0.82 0.03 60)");
  for (let z = -0.2, i = 0; z > -len; z -= 0.72, i++) boxR(ctx, [(hash(i, 2) - 0.5) * 0.08, 0.06, z], [1.55, 0.12, 0.2], { yaw: (hash(i, 5) - 0.5) * 6 });
  box(ctx, -0.8, 0, 0.0, 0.8, 0.45, 0.25); for (const x of [-0.6, 0.6]) box(ctx, x - 0.08, 0, 0.25, x + 0.08, 0.45, 0.4); // the buffer stop
  P(ctx, s, IRON, "oklch(0.7 0.015 60)", 0.45, 0.85);
  for (const x of [-0.5, 0.5]) { box(ctx, x - 0.035, 0.12, -len, x + 0.035, 0.24, 0); box(ctx, x - 0.07, 0.12, -len, x + 0.07, 0.15, 0); }
}
function minecart(ctx, s, p) {
  const D = !s;
  P(ctx, s, PLANK, "oklch(0.86 0.04 55)");
  if (s) { box(ctx, -0.7, 0.2, -0.95, 0.7, 1.2, 0.95); return; }
  const b0 = 0.48, b1 = 1.2, xb = 0.55, xt = 0.68, zb = 0.78, zt = 0.92, th = 0.06;
  const C = (x, y, z) => [x, y, z];
  for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const pb = sx ? [[sx * xb, b0, -zb], [sx * xb, b0, zb]] : [[-xb, b0, sz * zb], [xb, b0, sz * zb]];
    const pt = sx ? [[sx * xt, b1, -zt], [sx * xt, b1, zt]] : [[-xt, b1, sz * zt], [xt, b1, sz * zt]];
    quadN(ctx, pb[0], pb[1], pt[1], pt[0], [sx, 0.15, sz]);
    const ib = pb.map((q) => [q[0] - sx * th, q[1] + th, q[2] - sz * th]), it = pt.map((q) => [q[0] - sx * th, q[1], q[2] - sz * th]);
    quadN(ctx, ib[0], ib[1], it[1], it[0], [-sx, 0.1, -sz]);
    quadN(ctx, pt[0], pt[1], it[1], it[0], [0, 1, 0]);
  }
  box(ctx, -xb, b0 - 0.05, -zb, xb, b0 + th, zb);
  P(ctx, s, IRON, "oklch(0.68 0.015 60)", 0.5, 0.8);
  for (const t of [0.25, 0.8]) { const y = b0 + (b1 - b0) * t, x = xb + (xt - xb) * t + 0.01, z = zb + (zt - zb) * t + 0.01; box(ctx, -x, y - 0.04, -z, x, y + 0.04, -z + 0.02); box(ctx, -x, y - 0.04, z - 0.02, x, y + 0.04, z); box(ctx, -x, y - 0.04, -z, -x + 0.02, y + 0.04, z); box(ctx, x - 0.02, y - 0.04, -z, x, y + 0.04, z); }
  for (const z of [-0.5, 0.5]) { rod(ctx, [-0.62, 0.42, z], [0.62, 0.42, z], 0.04, 6); for (const x of [-0.5, 0.5]) { rod(ctx, [x - 0.05, 0.42, z], [x + 0.05, 0.42, z], 0.2, 12); rod(ctx, [x + (x > 0 ? -0.06 : 0.06), 0.42, z], [x + (x > 0 ? -0.075 : 0.075), 0.42, z], 0.24, 12); } }
  rod(ctx, [-0.4, 1.0, 1.0], [-0.4, 1.0, 1.25], 0.03, 5); rod(ctx, [0.4, 1.0, 1.0], [0.4, 1.0, 1.25], 0.03, 5); rod(ctx, [-0.45, 1.0, 1.25], [0.45, 1.0, 1.25], 0.035, 6);
  // the load: red rock heaped, copper glinting through it
  ctx.albedo(ROCK); ctx.color("oklch(0.85 0.06 40)"); ctx.metalness(0); ctx.roughness(0.95);
  for (let i = 0; i < 9; i++) blob(ctx, (hash(i, 1) - 0.5) * 0.8, 1.05 + hash(i, 2) * 0.2, (hash(i, 3) - 0.5) * 1.3, 0.26, 0.2, 0.24, i * 3.1, 0.3, 4, 6);
  ctx.albedo(null); ctx.color("oklch(0.62 0.13 50)"); ctx.metalness(0.85); ctx.roughness(0.35); ctx.emissive("oklch(0.35 0.1 50)");
  for (let i = 0; i < 6; i++) blob(ctx, (hash(i, 7) - 0.5) * 0.7, 1.22 + hash(i, 8) * 0.12, (hash(i, 9) - 0.5) * 1.2, 0.12, 0.1, 0.12, i * 5.3, 0.35, 3, 5);
  ctx.emissive(null); ctx.metalness(0);
}
// the cave: a spur of red rock jutting from the pit wall, a timbered tunnel bored 8 m into it, a lantern-lit chamber at its end
const IN = [[0, 3.6, 3.3, 2.3], [-1.6, 3.4, 3.2, 2.3], [-3.2, 3.5, 3.3, 2.35], [-4.8, 3.4, 3.2, 2.3], [-6.4, 3.5, 3.3, 2.35], [-8, 3.6, 3.4, 2.4], [-9, 5.2, 4.0, 2.6], [-10.3, 6.4, 4.6, 2.8], [-12, 6.6, 4.7, 2.8], [-13.2, 5.6, 4.2, 2.6], [-14, 4.2, 3.4, 2.2]];
const OUT = [[0.4, 9, 5.6], [-2, 9.6, 6.4], [-5, 10.4, 7.4], [-8, 12, 8.6], [-11, 13.4, 9.6], [-14, 13.6, 10.2], [-16.5, 12, 9.4]];
function innerProf(k) {
  const [z, w, h, hw] = IN[k], pts = [[-w / 2, 0], [-w / 2, hw / 2], [-w / 2, hw]];
  for (let j = 1; j < 6; j++) { const a = Math.PI - (Math.PI * j) / 6; pts.push([(Math.cos(a) * w) / 2, hw + Math.sin(a) * (h - hw)]); }
  pts.push([w / 2, hw], [w / 2, hw / 2], [w / 2, 0]);
  return pts.map(([x, y], i) => [x + (hash(k, i) - 0.5) * (k ? 0.22 : 0.1), y + (i && i < 10 ? (hash(i, k + 9) - 0.5) * 0.2 : 0), z]);
}
function outerProf(k) {
  const [z, W, H] = OUT[k], pts = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1 - i / 10), j = 1 + (hash(k + 20, i) - 0.5) * 0.28;
    pts.push([(Math.cos(a) * W * j) / 2, i === 0 || i === 10 ? -2.5 : Math.sin(a) * H * j, z + (hash(i, k + 40) - 0.5) * 0.6]);
  }
  return pts;
}
function cave(ctx, s) {
  const D = !s && (ctx.lod ?? 1) <= 2;
  const I = IN.map((_, k) => innerProf(k)), O = OUT.map((_, k) => outerProf(k));
  P(ctx, s, ROCK, "oklch(0.92 0.06 38)", 0.95);
  for (let k = 0; k + 1 < O.length; k++) for (let i = 0; i < 10; i++) {
    const a = O[k][i], b = O[k][i + 1], c = O[k + 1][i + 1], d = O[k + 1][i], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + 1, 0];
    quadN(ctx, a, b, c, d, m);
  }
  const ob = O[O.length - 1]; for (let i = 0; i < 10; i++) triN(ctx, [0, 2, ob[0][2]], ob[i], ob[i + 1], [0, 0, -1]);
  triN(ctx, [0, 2, ob[0][2]], ob[10], ob[0], [0, 0, -1]);
  for (let i = 0; i < 10; i++) quadN(ctx, I[0][i], I[0][i + 1], O[0][i + 1], O[0][i], [0, 0, 1]); // the face around the mouth
  P(ctx, s, ROCK, "oklch(0.8 0.06 38)", 0.95);
  for (let k = 0; k + 1 < I.length; k++) for (let i = 0; i < 10; i++) {
    const a = I[k][i], b = I[k][i + 1], c = I[k + 1][i + 1], d = I[k + 1][i], m = [-(a[0] + c[0]) / 2, 1.2 - (a[1] + c[1]) / 2, 0];
    quadN(ctx, a, b, c, d, m);
  }
  const ib = I[I.length - 1], ec = [0, 1.3, ib[0][2]]; for (let i = 0; i < 10; i++) triN(ctx, ec, ib[i], ib[i + 1], [0, 0, 1]);
  triN(ctx, ec, ib[10], ib[0], [0, 0, 1]);
  P(ctx, s, T("packed-dirt-gravel-mine-floor"), "oklch(0.9 0.04 50)", 0.97);
  for (let k = 0; k + 1 < I.length; k++) { const a = I[k][0], b = I[k][10], c = I[k + 1][10], d = I[k + 1][0]; quadN(ctx, [a[0], 0.03, a[2]], [b[0], 0.03, b[2]], [c[0], 0.03, c[2]], [d[0], 0.03, d[2]], [0, 1, 0]); }
  // timber sets every 1.8 m, the mouth set heavier
  P(ctx, s, WOOD, "oklch(0.88 0.03 60)");
  for (const [z, t] of [[-0.3, 0.34], [-2.1, 0.24], [-3.9, 0.24], [-5.7, 0.24], [-7.5, 0.26]]) {
    for (const x of [-1.42, 1.42]) box(ctx, x - t / 2, 0, z - t / 2, x + t / 2, 2.3, z + t / 2);
    box(ctx, z > -1 ? -2.05 : -1.78, 2.3, z - t / 2 - 0.02, z > -1 ? 2.05 : 1.78, 2.3 + t, z + t / 2 + 0.02);
  }
  for (const x of [-2.7, 2.7]) box(ctx, x - 0.15, 0, -11.15, x + 0.15, 3.0, -10.85);
  box(ctx, -3.1, 3.0, -11.17, 3.1, 3.28, -10.83);
  if (!D) return;
  for (const z of [-2.1, -3.9, -5.7, -7.5]) for (const sd of [-1, 1]) beam(ctx, [sd * 1.42, 1.75, z], [sd * 0.95, 2.3, z], 0.12);
  for (const x of [-1.15, -0.4, 0.4, 1.15]) box(ctx, x - 0.12, 2.3 + 0.24, -7.6, x + 0.12, 2.3 + 0.32, -0.15); // lagging boards on the caps
  P(ctx, s, PLANK, "oklch(0.8 0.04 55)"); box(ctx, -0.9, 2.7, -0.18, 0.9, 3.2, -0.1); // the board over the mouth
  lantern(ctx, 1.75, 2.15, 0.12, s); P(ctx, s, IRON, "oklch(0.72 0.01 60)", 0.55, 0.75); box(ctx, 1.55, 2.2, 0.08, 1.8, 2.25, 0.16);
  P(ctx, s, null, "oklch(0.6 0.06 75)", 0.95); rod(ctx, [0, 3.28, -11], [0, 2.85, -11], 0.02, 4); lantern(ctx, 0, 2.85, -11, s);
  // rubble at the wall feet, copper winking from the chamber walls
  ctx.albedo(ROCK); ctx.color("oklch(0.85 0.06 40)"); ctx.metalness(0);
  for (let i = 0; i < 10; i++) { const sd = i % 2 ? 1 : -1, z = -1 - i * 1.25; blob(ctx, sd * (1.55 + hash(i, 4) * 0.2), 0.08, z, 0.18 + hash(i, 3) * 0.14, 0.12, 0.2, i * 2.7, 0.35, 4, 6); }
  ctx.albedo(null); ctx.color("oklch(0.62 0.13 50)"); ctx.metalness(0.85); ctx.roughness(0.35); ctx.emissive("oklch(0.45 0.13 50)");
  for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1, z = -9.4 - hash(i, 11) * 3.6, y = 0.8 + hash(i, 12) * 2.6; blob(ctx, sd * (2.85 + 0.25 * (1 - y / 4)) , y, z, 0.1, 0.08, 0.1, i * 4.1, 0.4, 3, 5); }
  ctx.emissive(null); ctx.metalness(0);
}
function tent(ctx, s) {
  const W = 1.7, R = 2.1, L = 1.6;
  P(ctx, s, CANVAS, "oklch(0.93 0.035 80)", 0.95);
  const N = 4;
  for (const sd of [-1, 1]) for (let i = 0; i < N; i++) { // each side in four panels, sagging between the poles
    const z0 = -L - 0.15 + (i * (2 * L + 0.15)) / N, z1 = -L - 0.15 + ((i + 1) * (2 * L + 0.15)) / N, sg = (z) => 0.08 * Math.sin(((z + L + 0.15) / (2 * L + 0.15)) * Math.PI);
    quadN(ctx, [0, R - sg(z0), z0], [0, R - sg(z1), z1], [sd * W, 0.05, z1], [sd * W, 0.05, z0], [sd, 0.85, 0]);
  }
  triN(ctx, [-W, 0.05, L], [W, 0.05, L], [0, R, L], [0, 0, 1]);
  if (s) return;
  for (const sd of [-1, 1]) triN(ctx, [sd * W, 0.05, -L - 0.15], [sd * W * 0.5, R * 0.5, -L - 0.15], [sd * (W + 0.35), 0.55, -L - 0.7], [0, 0, -1]); // flaps tied back
  P(ctx, s, PLANK, "oklch(0.75 0.03 70)"); box(ctx, -W + 0.15, 0.0, -L, W - 0.15, 0.04, L);
  P(ctx, s, WOOD, "oklch(0.88 0.03 60)");
  for (const z of [-L - 0.2, L + 0.05]) rod(ctx, [0, 0, z], [0, R + 0.1, z], 0.05, 6);
  rod(ctx, [0, R + 0.02, -L - 0.35], [0, R + 0.02, L + 0.2], 0.045, 6);
  for (const [x, z] of [[0, -L - 1.4], [0, L + 1.3], [-W - 0.6, -L + 0.3], [W + 0.6, -L + 0.3], [-W - 0.6, L - 0.3], [W + 0.6, L - 0.3]]) box(ctx, x - 0.03, 0, z - 0.03, x + 0.03, 0.22, z + 0.03);
  P(ctx, s, null, "oklch(0.7 0.05 80)", 0.95);
  rod(ctx, [0, R + 0.08, -L - 0.3], [0, 0.18, -L - 1.4], 0.012, 4); rod(ctx, [0, R + 0.08, L + 0.15], [0, 0.18, L + 1.3], 0.012, 4);
  for (const sd of [-1, 1]) for (const z of [-L + 0.3, L - 0.3]) rod(ctx, [sd * W * 0.55, R * 0.45, z], [sd * (W + 0.6), 0.18, z], 0.012, 4);
  P(ctx, s, T("coarse-red-wool-blanket"), "oklch(0.9 0.05 30)", 0.95); boxR(ctx, [0.55, 0.12, 0.3], [0.75, 0.16, 1.9], { yaw: 4 });
  P(ctx, s, CANVAS, "oklch(0.85 0.04 70)"); blob(ctx, 0.55, 0.2, 1.2, 0.32, 0.12, 0.2, 3, 0.15, 4, 6); blob(ctx, -0.8, 0.3, 0.9, 0.28, 0.3, 0.25, 7, 0.15, 5, 7);
}
function campfire(ctx, s) {
  if (s) { box(ctx, -0.75, 0, -0.75, 0.75, 0.3, 0.75); for (const z of [-1.7, 1.7]) box(ctx, -0.9, 0, z - 0.2, 0.9, 0.42, z + 0.2); return; }
  P(ctx, s, STONE, "oklch(0.85 0.02 60)");
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; blob(ctx, Math.cos(a) * 0.62, 0.1, Math.sin(a) * 0.62, 0.17, 0.13, 0.15, i * 3, 0.3, 4, 6); }
  P(ctx, s, null, "oklch(0.25 0.01 60)", 1); cyl(ctx, 0, 0, 0, 0.5, 0.5, 0.03, 12, true);
  P(ctx, s, T("rough-split-firewood-logs"), "oklch(0.7 0.03 50)");
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; rod(ctx, [Math.cos(a) * 0.45, 0.04, Math.sin(a) * 0.45], [Math.cos(a) * 0.05, 0.55, Math.sin(a) * 0.05], 0.06, 6); }
  ctx.albedo(null); ctx.color("oklch(0.4 0.1 40)"); ctx.emissive(2.6, 0.7, 0.12);
  for (let i = 0; i < 7; i++) blob(ctx, (hash(i, 1) - 0.5) * 0.5, 0.04, (hash(i, 2) - 0.5) * 0.5, 0.08, 0.04, 0.07, i, 0.4, 3, 5);
  ctx.emissive(null);
  P(ctx, s, T("rough-oak-log-bark"), "oklch(0.88 0.03 60)");
  for (const z of [-1.7, 1.7]) rod(ctx, [-0.9, 0.22, z], [0.9, 0.22, z + 0.1], 0.2, 10);
  P(ctx, s, IRON, "oklch(0.65 0.01 60)", 0.5, 0.8);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5; rod(ctx, [0, 1.45, 0], [Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85], 0.025, 5); }
  rod(ctx, [0, 1.45, 0], [0, 0.95, 0], 0.01, 4); cyl(ctx, 0, 0.72, 0, 0.17, 0.2, 0.24, 10, true);
}
function toolrack(ctx, s) {
  P(ctx, s, WOOD, "oklch(0.88 0.03 60)");
  for (const x of [-1.1, 1.1]) box(ctx, x - 0.07, 0, -0.07, x + 0.07, 1.85, 0.07);
  box(ctx, -1.25, 1.55, -0.06, 1.25, 1.65, 0.06); box(ctx, -1.2, 0.45, -0.05, 1.2, 0.53, 0.05);
  if (s) return;
  box(ctx, -1.3, 1.85, -0.25, 1.3, 1.9, 0.2);
  const tool = (x, kind) => {
    P(ctx, s, WOOD, "oklch(0.92 0.04 70)"); rod(ctx, [x, 0.02, -0.35], [x, 1.62, -0.07], 0.03, 6);
    P(ctx, s, IRON, "oklch(0.72 0.01 60)", 0.45, 0.85);
    if (kind === "pick") { beam(ctx, [x - 0.36, 1.58, -0.02], [x, 1.7, -0.06], 0.05); beam(ctx, [x, 1.7, -0.06], [x + 0.36, 1.58, -0.02], 0.05); }
    if (kind === "shovel") boxR(ctx, [x, 0.12, -0.36], [0.24, 0.3, 0.03], { pitch: 10 });
    if (kind === "sledge") box(ctx, x - 0.15, 1.6, -0.14, x + 0.15, 1.75, 0.02);
  };
  tool(-0.75, "pick"); tool(-0.25, "shovel"); tool(0.25, "pick"); tool(0.75, "sledge");
  P(ctx, s, null, "oklch(0.65 0.06 75)", 0.95); for (let i = 0; i < 4; i++) rod(ctx, [1.12, 1.2 - i * 0.04, 0.08], [1.12, 1.2 - i * 0.04, 0.09], 0.13, 10, false);
}
function lanternpost(ctx, s) {
  P(ctx, s, STONE, "oklch(0.9 0.02 60)"); box(ctx, -0.25, 0, -0.25, 0.25, 0.3, 0.25);
  P(ctx, s, WOOD, "oklch(0.88 0.03 60)"); box(ctx, -0.08, 0.3, -0.08, 0.08, 2.65, 0.08);
  if (s) return;
  box(ctx, -0.06, 2.42, -0.05, 0.8, 2.52, 0.05); beam(ctx, [0, 2.0, 0], [0.45, 2.45, 0], 0.07);
  P(ctx, s, null, "oklch(0.6 0.02 60)", 0.6, 0.6); rod(ctx, [0.72, 2.42, 0], [0.72, 2.32, 0], 0.012, 4);
  lantern(ctx, 0.72, 2.12, 0, s);
}
function journal(ctx, s) {
  P(ctx, s, PLANK, "oklch(0.9 0.04 70)"); box(ctx, -0.4, 0, -0.4, 0.4, 0.8, 0.4);
  if (s) return;
  P(ctx, s, WOOD, "oklch(0.9 0.02 60)");
  for (const z of [-0.41, 0.39]) { box(ctx, -0.42, 0, z, -0.32, 0.8, z + 0.02); box(ctx, 0.32, 0, z, 0.42, 0.8, z + 0.02); boxR(ctx, [0, 0.4, z + 0.01], [1.0, 0.08, 0.02], { roll: 45 }); }
  P(ctx, s, LEATHER, "oklch(0.75 0.06 40)", 0.8); boxR(ctx, [-0.02, 0.81, 0.02], [0.5, 0.02, 0.36], { yaw: -12 });
  P(ctx, s, T("aged-parchment-paper-handwriting"), "oklch(0.97 0.03 85)", 0.95);
  for (const sd of [-1, 1]) boxR(ctx, [-0.02 + sd * 0.115 * 0.98, 0.835 + 0.012, 0.02 - sd * 0.115 * 0.2], [0.22, 0.025, 0.32], { yaw: -12, roll: sd * -5 });
  P(ctx, s, null, "oklch(0.2 0.02 260)", 0.2); cyl(ctx, 0.27, 0.8, -0.22, 0.04, 0.035, 0.07, 8, true);
  P(ctx, s, null, "oklch(0.95 0.01 90)", 0.9); rod(ctx, [0.27, 0.86, -0.22], [0.12, 1.02, -0.32], 0.008, 4);
  P(ctx, s, null, "oklch(0.93 0.03 90)", 0.7); cyl(ctx, -0.28, 0.8, -0.24, 0.035, 0.035, 0.09, 8, true);
  ctx.color("oklch(0.9 0.1 80)"); ctx.emissive(4, 2.2, 0.6); blob(ctx, -0.28, 0.915, -0.24, 0.015, 0.03, 0.015, 1, 0.1, 3, 5); ctx.emissive(null);
}
function overlook(ctx, s) {
  P(ctx, s, STONE, "oklch(0.92 0.02 70)");
  box(ctx, -1.5, -1.8, -0.95, 1.5, 0.2, 0.95);
  P(ctx, s, WOOD, "oklch(0.9 0.035 60)");
  box(ctx, -1.05, 0.62, -0.2, 1.05, 0.68, 0.25); // seat
  for (const x of [-0.85, 0.85]) { box(ctx, x - 0.06, 0.2, -0.15, x + 0.06, 0.62, -0.03); box(ctx, x - 0.06, 0.2, 0.15, x + 0.06, 0.62, 0.27); }
  for (const x of [-0.85, 0.85]) beam(ctx, [x, 0.62, 0.24], [x, 1.25, 0.38], 0.08);
  boxR(ctx, [0, 1.08, 0.335], [2.05, 0.16, 0.05], { pitch: -12 }); if (!s) boxR(ctx, [0, 0.86, 0.29], [2.05, 0.12, 0.05], { pitch: -12 });
  if (s) return;
  P(ctx, s, STONE, "oklch(0.95 0.02 70)"); box(ctx, -1.6, 0.18, -1.05, 1.6, 0.26, 1.05); // cap slab
  for (let i = 0; i < 4; i++) blob(ctx, 1.25, 0.32 + i * 0.16, -0.7, 0.2 - i * 0.04, 0.09, 0.18 - i * 0.03, i * 9, 0.3, 4, 6); // a little cairn on the slab
  P(ctx, s, PLANK, "oklch(0.86 0.04 60)"); for (let k = 0; k < 4; k++) box(ctx, -1.03 + k * 0.52, 0.68, -0.18, -0.55 + k * 0.52, 0.7, 0.23);
}
const KINDS = { crane, load, track, minecart, cave, tent, campfire, toolrack, lanternpost, journal, overlook };
export function geometry(ctx) { ctx.flat(); const p = ctx.params || {}; KINDS[p.kind]?.(ctx, false, p); }
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === "track" || p.kind === "load") return null;
  KINDS[p.kind]?.(ctx, true, p);
}
