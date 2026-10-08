// Ashen Close: the graveyard and yard around the ruined cathedral. params.kind:
// fence | gate | tomb | mausoleum | deadtree | brazier | statue | bones | candles | lantern | lamppost | yard
// Every piece: origin at its feet on the ground, front -Z. LOD 1-2 carries trim, moss and rust; 3 the big forms; 4 boxes; 5 a hull.
import { box, boxR, cyl, blob, quadN, triN, rot } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const GRAVE = T("weathered-grey-gravestone"), FIELD = T("mossy-fieldstone"), IRONT = T("rusted-wrought-iron"), BARK = T("dead-tree-bark-grey");
const STONE = "oklch(0.9 0.012 75)", PALE = "oklch(0.95 0.02 85)", SOOT = "oklch(0.86 0.008 60)", IRONC = "oklch(0.87 0.02 45)", BARKC = "oklch(0.88 0.01 70)";
const MOSS = "oklch(0.43 0.06 140)", MOSS2 = "oklch(0.52 0.08 128)", RUST = "oklch(0.4 0.075 45)", DIRT = "oklch(0.33 0.035 60)", BONE = "oklch(0.86 0.035 85)", CLOTH = "oklch(0.36 0.11 30)", VOID = "oklch(0.15 0.01 60)", WAX = "oklch(0.93 0.03 90)", GOLD = "oklch(0.82 0.14 75)";
const D = Math.PI / 180;
const P = (c, tex, col, r = 0.9, m = 0) => { c.albedo(tex); c.color(col); c.roughness(r); c.metalness(m); c.emissive(null); };
const flat = (c, col, r = 1) => P(c, null, col, r);
const glow = (c, col, e) => { c.albedo(null); c.color(col); c.roughness(0.6); c.metalness(0); c.emissive(...e); };
const iron = (c) => P(c, IRONT, IRONC, 0.62, 0.55);
const stone = (c, tex = GRAVE, col = STONE) => P(c, tex, col, 0.92, 0);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// a transformed view of ctx: everything emitted through it is rotated then moved (rigid, so winding holds)
function X(c, f) {
  const m = (a) => { const o = []; for (let i = 0; i < a.length; i += 3) o.push(...f([a[i], a[i + 1], a[i + 2]])); return o; };
  return { tri: (...a) => c.tri(...m(a)), quad: (...a) => c.quad(...m(a)), albedo: (t) => c.albedo(t), color: (...a) => c.color(...a), emissive: (...a) => c.emissive(...a), roughness: (v) => c.roughness(v), metalness: (v) => c.metalness(v), random: () => c.random(), lod: c.lod, params: c.params };
}
const RT = (o, r) => (p) => { const q = rot(p, r); return [q[0] + o[0], q[1] + o[1], q[2] + o[2]]; };
function tube(c, a, b, r0, r1, n = 6, cap = true) {
  const d = nrm(sub(b, a)); let u = crs(d, [0, 1, 0]); if (Math.hypot(...u) < 0.2) u = crs(d, [1, 0, 0]); u = nrm(u); const v = crs(d, u);
  const ring = (p, r) => { const o = []; for (let i = 0; i < n; i++) { const t = (i / n) * 6.2832; o.push(add(p, add(mul(u, Math.cos(t) * r), mul(v, Math.sin(t) * r)))); } return o; };
  const A = ring(a, r0), B = ring(b, r1);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, t = ((i + 0.5) / n) * 6.2832; quadN(c, A[i], A[j], B[j], B[i], add(mul(u, Math.cos(t)), mul(v, Math.sin(t)))); }
  if (cap && r1 > 0.004) for (let i = 0; i < n; i++) triN(c, b, B[i], B[(i + 1) % n], d);
}
const path = (c, pts, r, n = 5) => { for (let i = 0; i < pts.length - 1; i++) tube(c, pts[i], pts[i + 1], r, r, n, false); };
function lathe(c, cx, cz, prof, n = 10, fold = 0) {
  const R = prof.map(([r, y], k) => { const o = []; for (let i = 0; i < n; i++) { const t = (i / n) * 6.2832, rr = r * (1 + fold * Math.cos(t * 5 + k * 1.7)); o.push([cx + Math.cos(t) * rr, y, cz + Math.sin(t) * rr]); } return o; });
  for (let k = 0; k < R.length - 1; k++) for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, t = ((i + 0.5) / n) * 6.2832, dr = prof[k][0] - prof[k + 1][0], dy = prof[k + 1][1] - prof[k][1];
    quadN(c, R[k][i], R[k][j], R[k + 1][j], R[k + 1][i], [Math.cos(t) * dy, dr, Math.sin(t) * dy]);
  }
  const top = prof[prof.length - 1], bot = prof[0], RT1 = R[R.length - 1];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n;
    if (top[0] > 0.004) triN(c, [cx, top[1], cz], RT1[i], RT1[j], [0, 1, 0]);
    if (bot[0] > 0.004) triN(c, [cx, bot[1], cz], R[0][j], R[0][i], [0, -1, 0]); }
}
function frustum(c, cx, cz, y0, y1, w0, w1, d0 = w0, d1 = w1, caps = true) {
  const A = [[-1, -1], [1, -1], [1, 1], [-1, 1]], p = (k, y, w, d) => [cx + (A[k][0] * w) / 2, y, cz + (A[k][1] * d) / 2];
  for (let k = 0; k < 4; k++) { const j = (k + 1) % 4; quadN(c, p(k, y0, w0, d0), p(j, y0, w0, d0), p(j, y1, w1, d1), p(k, y1, w1, d1), [A[k][0] + A[j][0], 0, A[k][1] + A[j][1]]); }
  if (caps) { if (w1 > 0.004) quadN(c, p(0, y1, w1, d1), p(1, y1, w1, d1), p(2, y1, w1, d1), p(3, y1, w1, d1), [0, 1, 0]); quadN(c, p(0, y0, w0, d0), p(1, y0, w0, d0), p(2, y0, w0, d0), p(3, y0, w0, d0), [0, -1, 0]); }
}
const spear = (c, x, y, z, w = 0.07, h = 0.2) => { frustum(c, x, z, y, y + h * 0.3, w * 0.4, w, w * 0.4, w); frustum(c, x, z, y + h * 0.3, y + h, w, 0, w, 0, false); };
// an extruded XY profile from z0 to z1, star-shaped about (cx, cy)
function prism(c, pts, z0, z1, cx, cy) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy; let nx = b[1] - a[1], ny = a[0] - b[0];
    if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
    quadN(c, [a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], [nx, ny, 0]);
    triN(c, [cx, cy, z0], [a[0], a[1], z0], [b[0], b[1], z0], [0, 0, -1]); triN(c, [cx, cy, z1], [a[0], a[1], z1], [b[0], b[1], z1], [0, 0, 1]);
  }
}
const arcTop = (w, y0, top, seg) => { const r = w / 2, pts = [[-r, y0], [r, y0]]; for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI; pts.push([Math.cos(a) * r, top - r + Math.sin(a) * r]); } return pts; };
const moss = (c, x, y, z, rx, rz, s) => { flat(c, s % 2 ? MOSS : MOSS2); blob(c, x, y, z, rx, Math.min(rx, rz) * 0.22, rz, s, 0.35, 3, 7); };

// a headstone slab: profile with a raised face panel and a carved ring
function headstone(c, L, w, y0, top, t, seg) {
  stone(c); prism(c, arcTop(w, y0, top, seg), -t / 2, t / 2, 0, (y0 + top) / 2);
  if (L > 2) return;
  const k = (w - 0.12) / w, mid = (y0 + top) / 2;
  prism(c, arcTop(w - 0.12, y0 + 0.06, top - 0.06, seg).map(([x, y]) => [x, y]), -t / 2 - 0.014, t / 2 + 0.014, 0, mid);
  flat(c, VOID, 1); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.2832; boxR(c, [Math.cos(a) * 0.09, top - 0.28 + Math.sin(a) * 0.09, -t / 2 - 0.016], [0.06, 0.018, 0.006], { roll: a / D + 90 }); }
  box(c, -0.18, mid - 0.12, -t / 2 - 0.02, 0.18, mid - 0.1, -t / 2 - 0.012); box(c, -0.13, mid - 0.2, -t / 2 - 0.02, 0.13, mid - 0.18, -t / 2 - 0.012);
  void k;
}
const plinth = (c, L, w, d, h = 0.18) => { stone(c); box(c, -w / 2, 0, -d / 2, w / 2, h, d / 2); if (L <= 3) frustum(c, 0, 0, h, h + 0.04, w - 0.02, w - 0.1, d - 0.02, d - 0.1); };
const mound = (c, L, s) => { flat(c, DIRT); blob(c, 0, -0.05, 1.15, 0.5, 0.2, 0.95, s, 0.15, L <= 2 ? 4 : 3, L <= 2 ? 8 : 6); if (L <= 2) { moss(c, 0.2, 0.1, 1.4, 0.18, 0.25, s + 1); moss(c, -0.25, 0.08, 0.7, 0.14, 0.12, s + 2); } };

const K = {
  fence(c, L, q) { // one 4 m run: stone curb, pier at its start (and end when told), rails, spear-tipped bars
    const len = c.params.len ?? 4, end = !!c.params.endPier;
    stone(c); box(c, 0, 0, -0.16, len, 0.2, 0.16); if (L <= 3) frustum(c, len / 2, 0, 0.2, 0.24, len, len - 0.04, 0.32, 0.24);
    const pier = (x) => {
      stone(c, FIELD); box(c, x - 0.31, 0, -0.31, x + 0.31, 0.3, 0.31); box(c, x - 0.25, 0.3, -0.25, x + 0.25, 1.78, 0.25);
      stone(c); box(c, x - 0.33, 1.78, -0.33, x + 0.33, 1.92, 0.33); if (L <= 3) { frustum(c, x, 0, 1.92, 1.98, 0.6, 0.46); frustum(c, x, 0, 1.98, 2.24, 0.46, 0.04); }
      if (L <= 2) { moss(c, x + 0.08, 1.93, 0.06, 0.24, 0.2, 3 + Math.floor(q() * 5)); flat(c, RUST); box(c, x + 0.25, 0.3, -0.04, x + 0.255, 1.36, 0.02); }
    };
    pier(0); if (end) pier(len);
    iron(c);
    const x0 = 0.25, x1 = end ? len - 0.25 : len - 0.04;
    box(c, x0, 0.3, -0.03, x1, 0.36, 0.03); box(c, x0, 1.36, -0.03, x1, 1.42, 0.03);
    if (L <= 3) box(c, x0, 1.5, -0.022, x1, 1.55, 0.022);
    const step = L <= 2 ? 0.14 : L <= 3 ? 0.21 : 0.42, bent = Math.floor(q() * 22), gone = Math.floor(q() * 26);
    let k = 0;
    for (let x = x0 + step * 0.5; x < x1; x += step, k++) {
      if (k === gone && L <= 3) continue;
      const r = k === bent ? 9 + q() * 10 : 0;
      if (r) { boxR(c, [x + 0.08, 0.98, 0], [0.028, 1.32, 0.028], { roll: r }); continue; }
      box(c, x - 0.014, 0.22, -0.014, x + 0.014, 1.64, 0.014);
      if (L <= 3) spear(c, x, 1.64, 0, 0.07, 0.2);
      if (L <= 2 && k % 3 === 1) { const cy = 1.455; for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832; boxR(c, [x + 0.07 + Math.cos(a) * 0.035, cy + Math.sin(a) * 0.035, 0], [0.012, 0.035, 0.014], { roll: a / D }); } }
    }
    if (L <= 2) { flat(c, RUST); for (let i = 0; i < 4; i++) { const x = 0.6 + q() * (len - 1); box(c, x, 0.2, -0.165, x + 0.05 + q() * 0.08, 0.21, 0.165); }
      moss(c, 0.9 + q() * 2, 0.2, 0.12, 0.35, 0.12, 7); moss(c, 0.5 + q() * 2.5, 0.19, -0.12, 0.25, 0.1, 8); }
  },
  gate(c, L, q) { // two stone piers, a pointed iron arch, the leaves swung open outward
    const pier = (x) => {
      stone(c, FIELD); box(c, x - 0.5, 0, -0.5, x + 0.5, 0.4, 0.5); stone(c); if (L <= 3) frustum(c, x, 0, 0.4, 0.5, 1.0, 0.86);
      stone(c, FIELD); box(c, x - 0.4, 0.5, -0.4, x + 0.4, 2.9, 0.4);
      stone(c); box(c, x - 0.48, 2.9, -0.48, x + 0.48, 3.08, 0.48); box(c, x - 0.42, 3.08, -0.42, x + 0.42, 3.16, 0.42);
      if (L <= 3) frustum(c, x, 0, 3.16, 3.95, 0.5, 0.02);
      if (L <= 2) {
        flat(c, VOID); box(c, x - 0.24, 1.0, -0.415, x + 0.24, 2.4, -0.4); stone(c); frustum(c, x, -0.41, 2.4, 2.62, 0.48, 0.02, 0.02, 0.02);
        P(c, null, BONE, 0.85); blob(c, x, 2.05, -0.43, 0.13, 0.12, 0.08, 4, 0.1, 4, 7); flat(c, VOID); box(c, x - 0.08, 2.06, -0.52, x - 0.02, 2.11, -0.49); box(c, x + 0.02, 2.06, -0.52, x + 0.08, 2.11, -0.49);
        moss(c, x + 0.1, 3.09, 0.1, 0.32, 0.3, 5); moss(c, x - 0.3, 0.42, -0.3, 0.3, 0.2, 6); flat(c, RUST); box(c, x - (x < 0 ? -0.4 : 0.4) - 0.003, 1.4, -0.06, x - (x < 0 ? -0.4 : 0.4) + 0.003, 2.55, 0.05);
      }
    };
    pier(-2.35); pier(2.35);
    iron(c);
    const ys = 2.5, c0 = 0.4, seg = L <= 2 ? 9 : 5;
    const arc = (R) => { const L1 = [], A0 = Math.acos(-c0 / R); for (let i = 0; i <= seg; i++) { const a = Math.PI + (A0 - Math.PI) * (i / seg); L1.push([c0 + R * Math.cos(a), ys + R * Math.sin(a), 0]); } return L1; };
    const outer = arc(2.35), inner = arc(2.13), mir = (p) => [-p[0], p[1], p[2]];
    path(c, outer, 0.045, L <= 2 ? 6 : 4); path(c, outer.map(mir), 0.045, L <= 2 ? 6 : 4); path(c, inner, 0.035, 4); path(c, inner.map(mir), 0.035, 4);
    for (let i = 1; i < seg; i += 2) for (const m of [1, -1]) tube(c, [outer[i][0] * m, outer[i][1], 0], [inner[i][0] * m, inner[i][1], 0], 0.022, 0.022, 4, false);
    const apex = outer[seg][1]; spear(c, 0, apex, 0, 0.12, 0.45);
    if (L <= 2) { for (const m of [1, -1]) { const p = inner[Math.floor(seg / 2)]; const cx = p[0] * m * 0.9, cy = p[1] + 0.32; for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.2832, b = ((i + 1) / 7) * 6.2832; tube(c, [cx + Math.cos(a) * 0.13, cy + Math.sin(a) * 0.13, 0], [cx + Math.cos(b) * 0.13, cy + Math.sin(b) * 0.13, 0], 0.016, 0.016, 4, false); } } }
    box(c, -0.02, inner[seg][1] - 0.04, -0.02, 0.02, apex, 0.02); // the lantern's hook
    // the leaves, swung open
    const leaf = (hx, s, yaw) => {
      const g = X(c, RT([hx, 0, 0], { yaw })); iron(g);
      box(g, 0, 0.15, -0.03, s * 1.8, 0.2, 0.03); box(g, Math.min(0, s * 1.8), 1.55, -0.03, Math.max(0, s * 1.8), 1.6, 0.03); box(g, Math.min(0, s * 1.8), 1.3, -0.025, Math.max(0, s * 1.8), 1.34, 0.025);
      const xs = [0, 0.06]; box(g, Math.min(xs[0], s * xs[1]), 0.1, -0.04, Math.max(xs[0], s * xs[1]), 1.75, 0.04);
      for (let x = 0.15; x < 1.8; x += L <= 2 ? 0.15 : 0.3) { const xx = s * x, top = 1.72 + Math.sin((x / 1.8) * Math.PI) * 0.2; box(g, xx - 0.013, 0.15, -0.013, xx + 0.013, top, 0.013); if (L <= 3) spear(g, xx, top, 0, 0.06, 0.16); }
      if (L <= 3) { const a = [0.05 * s, 0.2, 0], b = [1.75 * s, 1.3, 0]; tube(g, a, b, 0.02, 0.02, 4, false); }
    };
    leaf(-1.95, 1, 82 + q() * 6); leaf(1.95, -1, -96 - q() * 8);
  },
  lantern(c, L) { // origin at the glass; chain runs up to the hook
    const ch = c.params.chain ?? 0.3;
    iron(c); box(c, -0.14, -0.25, -0.14, 0.14, -0.2, 0.14); frustum(c, 0, 0, -0.32, -0.25, 0.04, 0.2);
    for (const x of [-0.12, 0.12]) for (const z of [-0.12, 0.12]) box(c, x - 0.016, -0.2, z - 0.016, x + 0.016, 0.2, z + 0.016);
    box(c, -0.16, 0.2, -0.16, 0.16, 0.24, 0.16); frustum(c, 0, 0, 0.24, 0.34, 0.3, 0.06);
    tube(c, [0, 0.34, 0], [0, 0.4, 0], 0.03, 0.03, 4);
    for (let y = 0.4, i = 0; y < 0.34 + ch; y += 0.085, i++) boxR(c, [0, y + 0.04, 0], [0.05, 0.1, 0.012], { yaw: i % 2 ? 90 : 0 });
    if (L <= 2) { for (let i = 0; i < 4; i++) { const a = i * 90; const p = rot([0, 0, -0.125], { yaw: a }); boxR(c, [p[0], 0, p[2]], [0.012, 0.4, 0.012], { yaw: a }); boxR(c, [p[0], 0, p[2]], [0.24, 0.012, 0.012], { yaw: a }); } }
    glow(c, GOLD, [2.6, 1.5, 0.45]); box(c, -0.105, -0.2, -0.105, 0.105, 0.2, 0.105);
  },
  lamppost(c, L, q) { // stone foot, iron post, bracket arm over the road; the lantern hangs as its own child
    stone(c, FIELD); box(c, -0.36, 0, -0.36, 0.36, 0.42, 0.36); stone(c); if (L <= 3) frustum(c, 0, 0, 0.42, 0.56, 0.72, 0.44);
    iron(c);
    if (L <= 2) for (let i = 0; i < 6; i++) boxR(c, [0, 0.56 + i * 0.52 + 0.26, 0], [0.11, 0.52, 0.11], { yaw: i * 15 }); else box(c, -0.055, 0.56, -0.055, 0.055, 3.68, 0.055);
    for (const y of [0.7, 2.1, 3.25]) box(c, -0.09, y, -0.09, 0.09, y + 0.07, 0.09);
    spear(c, 0, 3.68, 0, 0.12, 0.34);
    box(c, -0.03, 3.28, -0.95, 0.03, 3.34, 0.05); tube(c, [0, 2.65, -0.04], [0, 3.28, -0.72], 0.022, 0.022, 4, false);
    if (L <= 2) { for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.2832, b = ((i + 1) / 9) * 6.2832; tube(c, [0, 3.06 + Math.sin(a) * 0.13, -0.32 + Math.cos(a) * 0.13], [0, 3.06 + Math.sin(b) * 0.13, -0.32 + Math.cos(b) * 0.13], 0.015, 0.015, 4, false); }
      spear(c, 0, 3.34, -0.95, 0.06, 0.14); moss(c, 0.1, 0.42, 0.1, 0.25, 0.22, 2); flat(c, RUST); box(c, 0.055, 1.2, -0.02, 0.06, 2.1, 0.02); }
    box(c, -0.01, 2.98, -0.86, 0.01, 3.3, -0.84);
  },
  tomb(c, L, q) {
    const st = c.params.style ?? "rounded", seg = L <= 2 ? 9 : 5, s = Math.floor(q() * 100);
    const w = 0.62 + q() * 0.2, top = 0.95 + q() * 0.35;
    if (st !== "chest") mound(c, L, s);
    if (st === "rounded") { plinth(c, L, w + 0.3, 0.42); headstone(c, L, w, 0.2, top, 0.15, seg); if (L <= 2) { moss(c, 0.1, top - 0.02, 0, 0.2, 0.09, s); moss(c, -w / 2, 0.2, -0.1, 0.18, 0.15, s + 3); } }
    else if (st === "sunk") { const g = X(c, RT([0, -0.32, 0], { pitch: 12 + q() * 8, roll: (q() - 0.5) * 14 })); plinth(g, L, w + 0.3, 0.42); headstone(g, L, w, 0.2, top, 0.15, seg); if (L <= 2) moss(g, 0, top - 0.03, 0, 0.26, 0.1, s); }
    else if (st === "cracked") {
      plinth(c, L, w + 0.3, 0.42);
      const r = w / 2, brk = [[r, 0.55], [0.2, 0.63], [0.05, 0.5], [-0.12, 0.67], [-r, 0.58]];
      const low = [[-r, 0.2], [r, 0.2], ...brk];
      const g = X(c, RT([0, 0, 0], { pitch: 7, roll: (q() - 0.5) * 6 })); stone(g); prism(g, low, -0.075, 0.075, 0, 0.4);
      const up = [...brk.slice().reverse()]; for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI; up.push([Math.cos(Math.PI - a) * -r * -1 * (i === 0 ? 1 : 1), 0]); }
      const shard = [[-r, 0.58], [-0.12, 0.67], [0.05, 0.5], [0.2, 0.63], [r, 0.55]]; for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI; shard.push([Math.cos(a) * r, top - r + Math.sin(a) * r]); }
      const sh = X(c, RT([0.25, 0.09, -0.15], { pitch: -84, yaw: 18 + q() * 20 })); stone(sh); prism(sh, shard, -0.075, 0.075, 0, (0.6 + top) / 2);
      void up;
      if (L <= 2) { stone(c, FIELD); blob(c, -0.45, 0.04, -0.5, 0.08, 0.05, 0.07, s, 0.4, 3, 5); blob(c, 0.55, 0.03, -0.25, 0.06, 0.04, 0.06, s + 1, 0.4, 3, 5); moss(sh, 0, 0.9, 0.08, 0.2, 0.05, s); }
    }
    else if (st === "cross") {
      plinth(c, L, 0.8, 0.6, 0.2); stone(c); box(c, -0.28, 0.24, -0.2, 0.28, 0.42, 0.2);
      const h = 1.5 + q() * 0.3, cy = h - 0.35; box(c, -0.09, 0.42, -0.07, 0.09, h, 0.07); box(c, -0.36, cy - 0.08, -0.07, 0.36, cy + 0.08, 0.07);
      if (L <= 3) { for (let i = 0; i < (L <= 2 ? 12 : 8); i++) { const a = (i / (L <= 2 ? 12 : 8)) * 6.2832, n = L <= 2 ? 12 : 8; boxR(c, [Math.cos(a + Math.PI / n) * 0.22, cy + Math.sin(a + Math.PI / n) * 0.22, 0], [0.04, 2 * 0.22 * Math.sin(Math.PI / n) + 0.02, 0.07], { roll: (a + Math.PI / n) / D }); } }
      if (L <= 2) { frustum(c, 0, 0, h, h + 0.05, 0.18, 0.12, 0.14, 0.09); flat(c, CLOTH, 0.95); boxR(c, [0.16, cy - 0.25, -0.075], [0.09, 0.45, 0.01], { roll: 6 }); boxR(c, [0.22, cy - 0.12, -0.075], [0.07, 0.25, 0.01], { roll: -8 }); moss(c, 0, 0.42, 0, 0.3, 0.22, s); }
    }
    else if (st === "obelisk") {
      stone(c); box(c, -0.5, 0, -0.5, 0.5, 0.25, 0.5); if (L <= 3) frustum(c, 0, 0, 0.25, 0.3, 0.98, 0.84); box(c, -0.38, 0.3, -0.38, 0.38, 0.75, 0.38);
      if (L <= 3) frustum(c, 0, 0, 0.75, 0.82, 0.86, 0.6); const h = 2.3 + q() * 0.5; frustum(c, 0, 0, 0.82, h, 0.42, 0.26); frustum(c, 0, 0, h, h + 0.3, 0.3, 0.0);
      if (L <= 2) { flat(c, VOID); box(c, -0.22, 0.42, -0.385, 0.22, 0.64, -0.375); P(c, null, GOLD, 0.4, 0.8); box(c, -0.05, 1.4, -0.215, 0.05, 1.6, -0.2); box(c, -0.1, 1.48, -0.215, 0.1, 1.52, -0.2);
        moss(c, 0.15, 0.75, 0.15, 0.3, 0.25, s); moss(c, -0.3, 0.26, -0.3, 0.22, 0.2, s + 1); flat(c, MOSS); box(c, 0.13, 0.85, -0.215, 0.17, 1.3, -0.2); }
    }
    else { // chest tomb with its lid knocked askew
      stone(c, FIELD); box(c, -0.6, 0, -1.1, 0.6, 0.18, 1.1); stone(c); box(c, -0.48, 0.18, -0.95, 0.48, 0.82, 0.95);
      if (L <= 3) for (const x of [-0.5, 0.5]) for (const z of [-0.97, 0.97]) box(c, x - 0.06, 0.18, z - 0.06, x + 0.06, 0.82, z + 0.06);
      const g = X(c, RT([0.12, 0.82, 0.18], { yaw: 9 + q() * 6, roll: 2 })); stone(g); box(g, -0.56, 0, -1.04, 0.56, 0.12, 1.04); if (L <= 3) frustum(g, 0, 0, 0.12, 0.17, 1.08, 0.9, 2.04, 1.86);
      if (L <= 2) { flat(c, VOID); box(c, -0.45, 0.78, -0.92, 0.45, 0.83, 0.92); for (const z of [-0.5, 0, 0.5]) { flat(c, VOID); box(c, -0.485, 0.35, z - 0.18, -0.48, 0.65, z + 0.18); box(c, 0.48, 0.35, z - 0.18, 0.485, 0.65, z + 0.18); }
        moss(g, -0.2, 0.15, 0.5, 0.35, 0.4, s); moss(c, 0.5, 0.18, -1.0, 0.2, 0.18, s + 2); P(c, null, BONE, 0.85); tube(c, [-0.3, 0.84, -0.7], [-0.05, 0.85, -0.55], 0.025, 0.02, 5); }
    }
  },
  mausoleum(c, L, q) { // 5 x 6 m family crypt, door in -Z, two urns
    stone(c, FIELD); box(c, -2.8, -0.2, -3.3, 2.8, 0.35, 3.3);
    stone(c); box(c, -1.4, 0, -4.0, 1.4, 0.13, -3.3); box(c, -1.4, 0.13, -3.66, 1.4, 0.25, -3.3);
    stone(c, FIELD); box(c, -2.5, 0.35, -3, 2.5, 3.4, 3);
    stone(c);
    for (const x of [-2.5, 2.5]) for (const z of [-3, 3]) box(c, x - 0.3, 0.35, z - 0.3, x + 0.3, 3.4, z + 0.3);
    if (L <= 3) for (const x of [-1.25, 1.25]) box(c, x - 0.22, 0.35, -3.12, x + 0.22, 3.4, -2.95);
    box(c, -2.7, 3.35, -3.2, 2.7, 3.62, 3.2); if (L <= 3) frustum(c, 0, 0, 3.25, 3.35, 5.3, 5.4, 6.3, 6.4, false);
    prism(c, [[-2.7, 3.62], [2.7, 3.62], [0, 5.35]], -3.15, 3.15, 0, 4.2);
    const run = 2.7, rise = 1.73, sl = Math.hypot(run, rise), ang = Math.atan2(rise, run) / D;
    stone(c, GRAVE, SOOT);
    for (const s of [-1, 1]) {
      const u = [s * run / sl, -rise / sl], n = [s * rise / sl, run / sl], wdt = sl + 0.4;
      const cx = u[0] * (wdt / 2 - 0.05) + n[0] * 0.11, cy = 5.35 + u[1] * (wdt / 2 - 0.05) + n[1] * 0.11;
      boxR(c, [cx, cy, 0], [wdt, 0.2, 6.9], { roll: -s * ang });
      if (L <= 2) for (let k = 0; k < 6; k++) { const t = 0.35 + k * 0.52; boxR(c, [u[0] * t + n[0] * 0.24, 5.35 + u[1] * t + n[1] * 0.24, 0], [0.56, 0.07, 6.9], { roll: -s * (ang + 4) }); }
      if (L <= 2) { flat(c, MOSS); boxR(c, [u[0] * (wdt - 0.15) + n[0] * 0.2, 5.35 + u[1] * (wdt - 0.15) + n[1] * 0.2, 0.4], [0.45, 0.08, 5.6], { roll: -s * ang }); stone(c, GRAVE, SOOT); }
    }
    boxR(c, [0, 5.42, 0], [0.32, 0.32, 7.0], { roll: 45 });
    stone(c); box(c, -0.06, 5.35, -3.24, 0.06, 6.25, -3.12); box(c, -0.3, 5.82, -3.24, 0.3, 5.94, -3.12);
    if (L <= 2) { flat(c, VOID); for (let i = 0; i < 4; i++) { const a = i * 90 + 45; boxR(c, [Math.cos(a * D) * 0.17, 4.35 + Math.sin(a * D) * 0.17, -3.16], [0.2, 0.2, 0.02], { roll: a }); } box(c, -0.08, 4.27, -3.17, 0.08, 4.43, -3.15); }
    // the door: stone jambs, pointed head, iron leaf with bands, studs and a ring
    stone(c); box(c, -1.02, 0.35, -3.18, -0.78, 2.95, -2.95); box(c, 0.78, 0.35, -3.18, 1.02, 2.95, -2.95);
    boxR(c, [-0.46, 3.12, -3.06], [1.15, 0.24, 0.24], { roll: 26 }); boxR(c, [0.46, 3.12, -3.06], [1.15, 0.24, 0.24], { roll: -26 });
    flat(c, VOID); prism(c, [[-0.78, 2.9], [0.78, 2.9], [0, 3.25]], -3.03, -2.98, 0, 3.0);
    iron(c); box(c, -0.78, 0.35, -3.06, 0.78, 2.9, -3.0);
    for (const y of [0.75, 1.65, 2.5]) box(c, -0.8, y, -3.1, 0.8, y + 0.1, -3.05);
    box(c, -0.03, 0.35, -3.08, 0.03, 2.9, -3.05);
    if (L <= 2) { for (const y of [0.8, 1.7, 2.55]) for (let x = -0.65; x <= 0.66; x += 0.26) box(c, x - 0.022, y, -3.125, x + 0.022, y + 0.045, -3.1);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.2832, b = ((i + 1) / 10) * 6.2832; tube(c, [0.35 + Math.cos(a) * 0.09, 1.4 + Math.sin(a) * 0.09, -3.13], [0.35 + Math.cos(b) * 0.09, 1.4 + Math.sin(b) * 0.09, -3.13], 0.014, 0.014, 4, false); }
      flat(c, RUST); for (const x of [-0.5, 0.1, 0.55]) box(c, x, 0.36, -3.075, x + 0.05, 0.75, -3.06); box(c, -0.6, 0.25, -3.4, 0.6, 0.255, -3.06);
      flat(c, VOID); for (const s of [-1, 1]) { box(c, s * 2.51 - 0.02, 1.4, -0.9, s * 2.51 + 0.02, 2.8, 0.9); } iron(c); for (const s of [-1, 1]) for (const z of [-0.5, 0, 0.5]) box(c, s * 2.53 - 0.02, 1.4, z - 0.02, s * 2.53 + 0.02, 2.8, z + 0.02);
      for (const [x, z, a, b] of [[-2.6, -3.1, 0.6, 0.5], [2.4, 3.2, 0.7, 0.4], [2.6, -2.2, 0.4, 0.6], [-2.6, 1.5, 0.5, 0.7]]) moss(c, x, 0.36, z, a, b, Math.floor(q() * 9));
      flat(c, MOSS); box(c, -2.82, 0.35, -2.4, -2.79, 2.2, -2.0); box(c, 2.79, 0.35, 1.0, 2.82, 1.6, 1.3); }
    // urns on their pedestals
    for (const s of [-1, 1]) {
      const x = s * 1.85; stone(c); box(c, x - 0.3, 0, -3.95, x + 0.3, 0.75, -3.35); if (L <= 3) box(c, x - 0.34, 0.75, -3.99, x + 0.34, 0.83, -3.31);
      stone(c, GRAVE, PALE); lathe(c, x, -3.65, [[0.1, 0.83], [0.16, 0.88], [0.25, 1.05], [0.27, 1.2], [0.2, 1.38], [0.12, 1.45], [0.16, 1.5], [0.15, 1.53]], L <= 2 ? 12 : 7);
      if (L <= 2) { flat(c, DIRT); cyl(c, x, 1.5, -3.65, 0.13, 0.13, 0.04, 8); P(c, BARK, BARKC, 0.95); for (let i = 0; i < 4; i++) { const a = i * 1.7 + s; tube(c, [x, 1.52, -3.65], [x + Math.cos(a) * 0.22, 1.85 + q() * 0.15, -3.65 + Math.sin(a) * 0.22], 0.012, 0.004, 4); } moss(c, x + 0.1, 0.83, -3.5, 0.15, 0.12, 2 + s); }
    }
  },
  deadtree(c, L, q) { // bare, twisted, roots gripping the dirt
    const h = c.params.h ?? 6, maxD = L <= 1 ? 4 : L <= 2 ? 3 : L <= 3 ? 2 : 1, sides = L <= 2 ? 7 : 5;
    P(c, BARK, BARKC, 0.95);
    for (let i = 0; i < 5; i++) { const a = i * 1.257 + q() * 0.6, r = 0.9 + q() * 0.7; if (L <= 3) tube(c, [0, 0.6, 0], [Math.cos(a) * r, -0.12, Math.sin(a) * r], 0.2, 0.035, sides); }
    const grow = (p, d, len, r, depth) => {
      let x = p, dir = d;
      for (let s = 0; s < 3; s++) {
        dir = nrm(add(dir, [(q() - 0.5) * 0.6, (q() - 0.5) * 0.2 + 0.03, (q() - 0.5) * 0.6]));
        const n = add(x, mul(dir, len / 3)), ra = r * (1 - s * 0.16), rb = r * (1 - (s + 1) * 0.16);
        if (depth <= maxD) tube(c, x, n, ra, depth === maxD && s === 2 ? 0.006 : rb, sides, true);
        x = n;
      }
      const kn = q(); if (depth === 1 && L <= 2 && kn < 0.6) blob(c, ...x, r * 1.3, r * 1.2, r * 1.3, Math.floor(kn * 50), 0.3, 3, 6);
      const kids = depth === 0 ? 3 : q() < 0.45 ? 3 : 2, ch = [];
      for (let k = 0; k < kids; k++) ch.push([nrm(add(mul(dir, 0.65), [(q() - 0.5) * 1.9, 0.12 + q() * 0.6, (q() - 0.5) * 1.9])), 0.55 + q() * 0.25, 0.75 + q() * 0.3]);
      if (depth < 4) for (const [nd, f, g] of ch) grow(x, nd, len * f, r * 0.55 * g, depth + 1);
    };
    grow([0, -0.1, 0], nrm([(q() - 0.5) * 0.35, 1, (q() - 0.5) * 0.35]), h * 0.42, 0.34, 0);
    if (L <= 2) { moss(c, 0.25, 0.3, 0.1, 0.3, 0.25, 4); moss(c, -0.6, 0.02, 0.5, 0.4, 0.3, 5); }
  },
  brazier(c, L, q) { // iron tripod, a spiked bowl of live coals; the fire is the object's fx
    iron(c); const sides = L <= 2 ? 6 : 4, knees = [];
    for (let k = 0; k < 3; k++) { const a = k * 2.0944 + 0.5, top = [Math.cos(a) * 0.24, 0.95, Math.sin(a) * 0.24], knee = [Math.cos(a) * 0.42, 0.5, Math.sin(a) * 0.42], foot = [Math.cos(a) * 0.58, 0.03, Math.sin(a) * 0.58];
      tube(c, top, knee, 0.035, 0.035, sides, false); tube(c, knee, foot, 0.035, 0.028, sides); knees.push(knee);
      if (L <= 3) frustum(c, foot[0], foot[2], 0, 0.04, 0.14, 0.08); }
    for (let k = 0; k < 3; k++) tube(c, knees[k], knees[(k + 1) % 3], 0.02, 0.02, 4, false);
    lathe(c, 0, 0, [[0.1, 0.86], [0.3, 0.94], [0.44, 1.08], [0.48, 1.18]], L <= 2 ? 12 : 8);
    lathe(c, 0, 0, [[0.5, 1.13], [0.51, 1.2]], L <= 2 ? 12 : 8);
    if (L <= 3) for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832; spear(c, Math.cos(a) * 0.47, 1.18, Math.sin(a) * 0.47, 0.06, 0.2); }
    if (L <= 2) { flat(c, RUST); for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832 + 0.3; box(c, Math.cos(a) * 0.44 - 0.02, 0.92, Math.sin(a) * 0.44 - 0.02, Math.cos(a) * 0.44 + 0.02, 1.12, Math.sin(a) * 0.44 + 0.02); } }
    flat(c, "oklch(0.3 0.01 60)"); blob(c, 0, 1.16, 0, 0.4, 0.07, 0.4, 3, 0.3, 3, 8);
    if (L <= 3) { glow(c, "oklch(0.55 0.18 40)", [2.4, 0.7, 0.14]); for (let i = 0; i < (L <= 2 ? 9 : 4); i++) { const a = q() * 6.28, r = q() * 0.28; blob(c, Math.cos(a) * r, 1.2, Math.sin(a) * r, 0.08 + q() * 0.05, 0.05, 0.07 + q() * 0.05, i, 0.35, 3, 5); } }
  },
  statue(c, L, q) { // a winged warden on its plinth, hooded, hands on a grounded sword; one wing snapped and lying at the foot
    stone(c, FIELD); box(c, -1.0, 0, -1.0, 1.0, 0.3, 1.0); stone(c); if (L <= 3) frustum(c, 0, 0, 0.3, 0.38, 1.94, 1.6);
    box(c, -0.75, 0.38, -0.75, 0.75, 1.7, 0.75); box(c, -0.86, 1.7, -0.86, 0.86, 1.86, 0.86); if (L <= 3) frustum(c, 0, 0, 1.86, 1.95, 1.7, 1.5);
    if (L <= 2) { flat(c, VOID); box(c, -0.5, 0.6, -0.76, 0.5, 1.45, -0.75); stone(c); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.2832; boxR(c, [Math.cos(a) * 0.2, 1.03 + Math.sin(a) * 0.2, -0.77], [0.12, 0.05, 0.03], { roll: a / D + 90 }); } blob(c, 0, 1.03, -0.77, 0.07, 0.07, 0.03, 2, 0.1, 3, 6);
      flat(c, MOSS); box(c, 0.55, 1.86, -0.86, 0.87, 1.9, 0.2); box(c, 0.74, 0.5, -0.4, 0.76, 1.7, -0.1); moss(c, -0.6, 0.3, 0.6, 0.4, 0.35, 3); moss(c, 0.7, 0.3, -0.7, 0.3, 0.3, 4);
      stone(c, FIELD); box(c, 0.6, 1.62, -0.88, 0.88, 1.86, -0.6); }
    const F = 1.95, seg = L <= 2 ? 12 : 8;
    stone(c, GRAVE, PALE);
    lathe(c, 0, 0, [[0.52, F], [0.49, F + 0.3], [0.41, F + 0.9], [0.35, F + 1.25], [0.45, F + 1.45], [0.3, F + 1.6], [0.12, F + 1.66]], seg, L <= 2 ? 0.07 : 0);
    lathe(c, 0, 0.04, [[0.21, F + 1.52], [0.26, F + 1.72], [0.23, F + 1.94], [0.13, F + 2.08], [0.0, F + 2.14]], seg);
    flat(c, VOID); box(c, -0.11, F + 1.66, -0.255, 0.11, F + 1.9, -0.2);
    stone(c, GRAVE, PALE);
    for (const s of [-1, 1]) { blob(c, s * 0.38, F + 1.44, 0, 0.18, 0.13, 0.2, 2 + s, 0.15, 4, 7);
      tube(c, [s * 0.4, F + 1.38, -0.02], [s * 0.36, F + 1.05, -0.25], 0.1, 0.09, 6); tube(c, [s * 0.36, F + 1.05, -0.25], [s * 0.1, F + 1.25, -0.56], 0.09, 0.075, 6);
      blob(c, s * 0.08, F + 1.27, -0.58, 0.08, 0.07, 0.08, 5, 0.1, 3, 6); }
    box(c, -0.05, F + 0.03, -0.6, 0.05, F + 1.12, -0.575); box(c, -0.27, F + 1.12, -0.63, 0.27, F + 1.18, -0.55); box(c, -0.03, F + 1.18, -0.61, 0.03, F + 1.33, -0.57); blob(c, 0, F + 1.37, -0.59, 0.05, 0.05, 0.05, 1, 0.1, 3, 6);
    const wing = (g, s) => {
      const bone = [[0, 0, 0], [s * 0.55, 0.5, 0.18], [s * 1.2, 0.85, 0.3], [s * 1.7, 0.55, 0.38]];
      for (let i = 0; i < 3; i++) tube(g, bone[i], bone[i + 1], 0.1 - i * 0.025, 0.08 - i * 0.025, 6);
      const N = L <= 2 ? 10 : 5, at = (t) => { const f = Math.min(2.999, t * 3), i = Math.floor(f), u = f - i; return add(bone[i], mul(sub(bone[i + 1], bone[i]), u)); };
      for (let k = 0; k < N; k++) { const t = k / (N - 1), p = at(t), len = 0.55 + t * 0.8, a = s * (6 + t * 30);
        boxR(g, [p[0] + (Math.sin(a * D) * len) / 2, p[1] - (Math.cos(a * D) * len) / 2, p[2] + 0.02], [0.2, len, 0.05], { roll: a });
        if (L <= 2) { const l2 = len * 0.55; boxR(g, [p[0] + (Math.sin(a * D) * l2) / 2, p[1] - (Math.cos(a * D) * l2) / 2, p[2] - 0.04], [0.18, l2, 0.04], { roll: a + s * 4 }); } }
    };
    const lw = X(c, RT([-0.2, F + 1.42, 0.28], { yaw: 22, roll: -8 })); stone(lw, GRAVE, PALE); wing(lw, -1);
    stone(c, GRAVE, PALE); tube(c, [0.2, F + 1.42, 0.28], [0.48, F + 1.72, 0.4], 0.1, 0.085, 6); if (L <= 2) { blob(c, 0.5, F + 1.74, 0.41, 0.1, 0.07, 0.09, 7, 0.45, 3, 5); }
    const fw = X(c, RT([1.35, 0.09, 0.55], { pitch: -85, yaw: 68 })); stone(fw, GRAVE, PALE); wing(fw, 1);
    if (L <= 2) { stone(c, GRAVE, PALE); for (let i = 0; i < 5; i++) blob(c, 1.15 + q() * 0.8, 0.05, -0.6 + q() * 1.6, 0.08 + q() * 0.07, 0.06, 0.08 + q() * 0.06, i, 0.4, 3, 5); moss(fw, 0.9, 0.2, 0.02, 0.4, 0.04, 6); }
  },
  bones(c, L, q) { // a heap of the unburied: long bones, two skulls, a scrap of red cloth
    const bp = (a, b, r) => { tube(c, a, b, r, r * 0.85, L <= 2 ? 6 : 4); if (L <= 3) { blob(c, ...a, r * 1.9, r * 1.6, r * 1.9, 1, 0.25, 3, 5); blob(c, ...b, r * 1.8, r * 1.5, r * 1.8, 2, 0.25, 3, 5); } };
    if (L <= 2) { flat(c, DIRT); blob(c, 0, -0.04, 0, 0.75, 0.12, 0.6, 3, 0.2, 3, 8); }
    P(c, null, BONE, 0.85);
    for (let i = 0; i < (L <= 2 ? 11 : 5); i++) { const a = q() * 6.28, r = q() * 0.45, y = 0.04 + q() * 0.14 * (1 - r), l = 0.25 + q() * 0.25, b = q() * 6.28;
      const m = [Math.cos(a) * r, y, Math.sin(a) * r * 0.8]; bp(add(m, [Math.cos(b) * l, (q() - 0.5) * 0.08, Math.sin(b) * l]), sub(m, [Math.cos(b) * l, (q() - 0.5) * 0.08, Math.sin(b) * l]), 0.022 + q() * 0.012); }
    const skull = (p, yaw, pitch) => { const g = X(c, RT(p, { yaw, pitch })); P(g, null, BONE, 0.8); blob(g, 0, 0.1, 0, 0.105, 0.095, 0.125, 3, 0.07, L <= 2 ? 5 : 3, L <= 2 ? 9 : 6); box(g, -0.06, 0, -0.13, 0.06, 0.05, -0.04);
      flat(g, VOID); box(g, -0.07, 0.09, -0.123, -0.02, 0.135, -0.1); box(g, 0.02, 0.09, -0.123, 0.07, 0.135, -0.1); box(g, -0.012, 0.06, -0.128, 0.012, 0.085, -0.11); };
    skull([0.12, 0.16, -0.05], 20 + q() * 30, -10); skull([-0.38, 0.0, 0.25], -60, 15);
    if (L <= 2) { flat(c, CLOTH, 0.95); boxR(c, [-0.25, 0.1, -0.2], [0.35, 0.012, 0.28], { yaw: 25, roll: 10 }); boxR(c, [-0.42, 0.06, -0.3], [0.18, 0.01, 0.2], { yaw: -15, roll: -12 });
      P(c, null, BONE, 0.85); for (let i = 0; i < 4; i++) { const a = 0.3 + i * 0.22; tube(c, [0.3 + Math.cos(a) * 0.05, 0.05, 0.25 + i * 0.07], [0.3 + Math.cos(a) * 0.22, 0.14, 0.25 + i * 0.07], 0.012, 0.01, 4); } }
  },
  candles(c, L, q) { // a cluster of grave candles on a slab, wax pooled and run, flames lit
    stone(c, GRAVE, SOOT); frustum(c, 0, 0, 0, 0.06, 0.8, 0.72, 0.55, 0.48);
    flat(c, WAX, 0.5); blob(c, 0, 0.06, 0, 0.32, 0.02, 0.2, 2, 0.3, 3, 8);
    const n = L <= 2 ? 8 : 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + q() * 0.6, r = i === 0 ? 0 : 0.12 + q() * 0.17, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.75, h = 0.1 + q() * 0.32, rr = 0.025 + q() * 0.025, y = 0.06;
      flat(c, i % 3 === 2 ? "oklch(0.86 0.05 80)" : WAX, 0.5); cyl(c, x, y, z, rr * 1.15, rr, h, L <= 2 ? 8 : 5);
      if (L <= 2) for (let k = 0; k < 2; k++) { const b = q() * 6.28, dl = 0.03 + q() * h * 0.6; box(c, x + Math.cos(b) * rr - 0.008, y + h - dl, z + Math.sin(b) * rr - 0.008, x + Math.cos(b) * rr + 0.008, y + h, z + Math.sin(b) * rr + 0.008); }
      flat(c, VOID); box(c, x - 0.004, y + h, z - 0.004, x + 0.004, y + h + 0.025, z + 0.004);
      glow(c, GOLD, [4, 2.3, 0.7]); frustum(c, x, z, y + h + 0.02, y + h + 0.05, 0.012, 0.032); frustum(c, x, z, y + h + 0.05, y + h + 0.13, 0.032, 0.0, 0.032, 0.0, false);
    }
    if (L <= 2) { P(c, null, BONE, 0.8); blob(c, 0.3, 0.14, 0.12, 0.09, 0.08, 0.1, 5, 0.06, 4, 7); flat(c, VOID); box(c, 0.24, 0.14, 0.02, 0.28, 0.17, 0.03); box(c, 0.31, 0.14, 0.02, 0.35, 0.17, 0.03); }
  },
  yard(c, L, q) { // the flagstone walk from the gate to the cathedral door, local to the yard centre
    const x0 = -34.4, x1 = -16.2, z0 = -2.6, z1 = 0.6;
    if (L >= 3) { stone(c, GRAVE, SOOT); box(c, x0, -0.02, z0, x1, 0.04, z1); return; }
    let x = x0;
    while (x < x1) {
      const lx = Math.min(0.65 + q() * 0.45, x1 - x), n = q() < 0.5 ? 2 : 3; let z = z0;
      for (let k = 0; k < n; k++) {
        const zz = k === n - 1 ? z1 : z + (z1 - z0) / n * (0.75 + q() * 0.5), gone = q() < 0.07, hgt = 0.025 + q() * 0.04, i = 0.035 + q() * 0.03, tint = q();
        if (!gone) { stone(c, GRAVE, tint < 0.5 ? SOOT : STONE); box(c, x + i, -0.04, z + i, x + lx - i, hgt, zz - i); frustum(c, x + lx / 2, (z + zz) / 2, hgt, hgt + 0.015, lx - 2 * i, lx - 2 * i - 0.06, zz - z - 2 * i, zz - z - 2 * i - 0.06); if (tint > 0.82) moss(c, x + lx / 2, hgt, (z + zz) / 2, lx * 0.3, (zz - z) * 0.3, k); }
        else { flat(c, DIRT); box(c, x + 0.05, -0.04, z + 0.05, x + lx - 0.05, 0.005, zz - 0.05); }
        z = zz;
      }
      x += lx;
    }
  },
};
// LOD 5: one closed hull per piece
const HULL = {
  fence: (c) => { const l = c.params.len ?? 4; stone(c); box(c, -0.3, 0, -0.3, 0.3, 2.1, 0.3); iron(c); box(c, 0.3, 0, -0.03, l, 1.7, 0.03); },
  gate: (c) => { stone(c); box(c, -2.75, 0, -0.45, -1.95, 3.6, 0.45); box(c, 1.95, 0, -0.45, 2.75, 3.6, 0.45); },
  tomb: (c) => { stone(c); const s = c.params.style; if (s === "obelisk") frustum(c, 0, 0, 0, 2.7, 0.8, 0.2); else if (s === "chest") box(c, -0.6, 0, -1.05, 0.6, 1.0, 1.05); else box(c, -0.4, 0, -0.08, 0.4, s === "cross" ? 1.6 : 1.1, 0.08); },
  mausoleum: (c) => { stone(c, FIELD); box(c, -2.8, 0, -3.3, 2.8, 3.6, 3.3); prism(c, [[-2.9, 3.6], [2.9, 3.6], [0, 5.4]], -3.4, 3.4, 0, 4.2); },
  deadtree: (c) => { P(c, BARK, BARKC); frustum(c, 0, 0, 0, (c.params.h ?? 6) * 0.6, 0.6, 0.15); },
  brazier: (c) => { iron(c); frustum(c, 0, 0, 0, 1.2, 0.9, 0.9); },
  statue: (c) => { stone(c); box(c, -1, 0, -1, 1, 1.95, 1); frustum(c, 0, 0, 1.95, 4.1, 0.9, 0.4); },
  lamppost: (c) => { iron(c); box(c, -0.3, 0, -0.3, 0.3, 3.9, 0.3); },
  lantern: (c) => { glow(c, GOLD, [2.6, 1.5, 0.45]); box(c, -0.14, -0.3, -0.14, 0.14, 0.3, 0.14); },
};
export function geometry(ctx) {
  const k = ctx.params.kind ?? "tomb", L = ctx.lod || 1, q = () => ctx.random();
  if (L >= 5 && HULL[k]) return HULL[k](ctx);
  if (L >= 5 && k === "yard") { stone(ctx, GRAVE, SOOT); box(ctx, -34.4, -0.02, -2.6, -16.2, 0.04, 0.6); return; }
  if (L >= 5 && k === "bones") { P(ctx, null, BONE, 0.85); frustum(ctx, 0, 0, 0, 0.25, 0.9, 0.3, 0.7, 0.2); return; }
  if (L >= 5 && k === "candles") { stone(ctx, GRAVE, SOOT); frustum(ctx, 0, 0, 0, 0.3, 0.8, 0.4, 0.55, 0.3); return; }
  (K[k] ?? K.tomb)(ctx, L, q);
}
export function collider(ctx) {
  const p = ctx.params, k = p.kind;
  if (k === "fence") { box(ctx, 0, 0, -0.17, p.len ?? 4, 1.85, 0.17); box(ctx, -0.33, 0, -0.33, 0.33, 2.2, 0.33); if (p.endPier) box(ctx, (p.len ?? 4) - 0.33, 0, -0.33, (p.len ?? 4) + 0.33, 2.2, 0.33); return; }
  if (k === "gate") { box(ctx, -2.85, 0, -0.5, -1.95, 3.9, 0.5); box(ctx, 1.95, 0, -0.5, 2.85, 3.9, 0.5); return; }
  if (k === "tomb") { const s = p.style; if (s === "obelisk") box(ctx, -0.5, 0, -0.5, 0.5, 2.8, 0.5); else if (s === "chest") box(ctx, -0.6, 0, -1.1, 0.6, 1.0, 1.1); else box(ctx, -0.45, 0, -0.25, 0.45, s === "cross" ? 1.6 : 1.1, 0.25); return; }
  if (k === "mausoleum") { box(ctx, -2.8, -0.2, -3.3, 2.8, 3.62, 3.3); box(ctx, -1.4, 0, -4.0, 1.4, 0.25, -3.3); box(ctx, -2.2, 0, -4.0, -1.5, 0.83, -3.3); box(ctx, 1.5, 0, -4.0, 2.2, 0.83, -3.3); prism(ctx, [[-2.9, 3.6], [2.9, 3.6], [0, 5.4]], -3.4, 3.4, 0, 4.2); return; }
  if (k === "deadtree") { box(ctx, -0.32, 0, -0.32, 0.32, 3, 0.32); return; }
  if (k === "brazier") { box(ctx, -0.45, 0, -0.45, 0.45, 1.25, 0.45); return; }
  if (k === "statue") { box(ctx, -1, 0, -1, 1, 1.95, 1); box(ctx, -0.5, 1.95, -0.6, 0.5, 4.1, 0.5); return; }
  if (k === "lamppost") { box(ctx, -0.36, 0, -0.36, 0.36, 3.7, 0.36); return; }
  return null;
}
