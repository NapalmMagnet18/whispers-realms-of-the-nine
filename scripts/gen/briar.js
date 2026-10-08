// Briarwild discoveries: one generator, kind picks the piece. Origin at ground, front −Z.
// kinds: shrine, lectern, waystone, crag, chest, lid, log, jetty, reeds, lily, glowring, litter
import { quadN, triN, rot, boxR, cyl, blob } from "./shape.js";
const MOSS = "/cdn/rocks-diffuse-u03avi37y.webp", PATH = "/cdn/pathrocks-diffuse-u9boyqv2g.webp", BARK = "/cdn/bark-twistedtree-u3vvl00p9.webp";
const FIELD = "cdn/texture-rough-fieldstone-wall-mossy.png", OAK = "cdn/texture-dark-oak-timber-beam-hand-painted.png";
const IRON = "cdn/texture-hammered-iron-dark-forged.png", PLANK = "cdn/texture-weathered-wood-planks-grey.png";
const hash = (i, s) => { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); };

// paint helper that does nothing while building the collider
function P(ctx, s, { tex, col, rough = 0.9, metal = 0, em = null }) {
  if (s) return;
  ctx.albedo(tex || null); ctx.color(col || "oklch(0.95 0 0)"); ctx.roughness(rough); ctx.metalness(metal);
  if (em) ctx.emissive(...em); else ctx.emissive(null);
}
// a ctx whose quads/tris are rotated (degrees) then offset
function xf(ctx, r, o) {
  const T = (a, i) => { const p = rot([a[i], a[i + 1], a[i + 2]], r); return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; };
  return {
    quad: (...a) => ctx.quad(...T(a, 0), ...T(a, 3), ...T(a, 6), ...T(a, 9)),
    tri: (...a) => ctx.tri(...T(a, 0), ...T(a, 3), ...T(a, 6)),
    albedo: (v) => ctx.albedo(v), color: (...v) => ctx.color(...v), emissive: (...v) => ctx.emissive(...v),
    roughness: (v) => ctx.roughness(v), metalness: (v) => ctx.metalness(v), lod: ctx.lod,
  };
}
function jpoly(cx, cz, rx, rz, n, seed, j = 0.15) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = 1 + (hash(i, seed) - 0.5) * 2 * j; out.push([cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k]); }
  return out;
}
// closed rock/slab prism: sides, a bevel lip, a top fan (topPaint switches paint for it), optional bottom
function prism(ctx, s, poly, y0, y1, bev = 0, topPaint = null, bottom = false) {
  const n = poly.length; let cx = 0, cz = 0;
  for (const p of poly) { cx += p[0] / n; cz += p[1] / n; }
  const b = s ? 0 : bev;
  const ins = poly.map(([x, z]) => { const dx = x - cx, dz = z - cz, l = Math.hypot(dx, dz) || 1; return [x - (dx / l) * b, z - (dz / l) * b]; });
  const yb = y1 - b;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, A = poly[i], B = poly[j], nx = (A[0] + B[0]) / 2 - cx, nz = (A[1] + B[1]) / 2 - cz;
    quadN(ctx, [A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], yb, B[1]], [A[0], yb, A[1]], [nx, 0, nz]);
    if (b > 0) quadN(ctx, [A[0], yb, A[1]], [B[0], yb, B[1]], [ins[j][0], y1, ins[j][1]], [ins[i][0], y1, ins[i][1]], [nx, 1, nz]);
  }
  if (topPaint && !s) topPaint();
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; triN(ctx, [cx, y1, cz], [ins[i][0], y1, ins[i][1]], [ins[j][0], y1, ins[j][1]], [0, 1, 0]); }
  if (bottom || s) for (let i = 0; i < n; i++) { const j = (i + 1) % n; triN(ctx, [cx, y0, cz], [poly[i][0], y0, poly[i][1]], [poly[j][0], y0, poly[j][1]], [0, -1, 0]); }
}
const cen = (R) => R.reduce((a, p) => [a[0] + p[0] / R.length, a[1] + p[1] / R.length, a[2] + p[2] / R.length], [0, 0, 0]);
function loft(ctx, rings, capTop = true, capBot = false) {
  for (let k = 0; k < rings.length - 1; k++) {
    const A = rings[k], B = rings[k + 1], n = A.length, c = cen([...A, ...B]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, m = [0, 1, 2].map((q) => (A[i][q] + A[j][q] + B[i][q] + B[j][q]) / 4);
      quadN(ctx, A[i], A[j], B[j], B[i], [m[0] - c[0], m[1] - c[1], m[2] - c[2]]);
    }
  }
  const cap = (T, P2) => { const c = cen(T), d = cen(P2), nn = [c[0] - d[0], c[1] - d[1], c[2] - d[2]]; for (let i = 0; i < T.length; i++) triN(ctx, c, T[i], T[(i + 1) % T.length], nn); };
  if (capTop) cap(rings[rings.length - 1], rings[rings.length - 2]);
  if (capBot) cap(rings[0], rings[1]);
}
// tapered tube between two points
function tube(ctx, a, b, r0, r1, seg = 6) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d) || 1, u = d.map((v) => v / L);
  const t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let p = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]]; const pl = Math.hypot(...p); p = p.map((v) => v / pl);
  const q = [u[1] * p[2] - u[2] * p[1], u[2] * p[0] - u[0] * p[2], u[0] * p[1] - u[1] * p[0]];
  const ring = (c, r) => Array.from({ length: seg }, (_, i) => { const an = (i / seg) * Math.PI * 2, cs = Math.cos(an) * r, sn = Math.sin(an) * r; return [c[0] + p[0] * cs + q[0] * sn, c[1] + p[1] * cs + q[1] * sn, c[2] + p[2] * cs + q[2] * sn]; });
  loft(ctx, [ring(a, r0), ring(b, r1)], true, false);
}

// a standing stone, slightly tapered, broken top, rune marks on its face
function stone(ctx, s, { h = 2.2, w = 0.75, t = 0.42, broken = 0.35, seed = 1, runes = 5, sigil = false }) {
  const lod = ctx.lod || 1;
  P(ctx, s, { tex: MOSS, col: "oklch(0.93 0.02 120)", rough: 0.95 });
  const K = lod >= 4 ? 1 : 4, rings = [];
  for (let k = 0; k <= K; k++) {
    const f = k / K, y = f * h, tp = 1 - 0.2 * f, ww = (w * tp) / 2, tt = (t * tp) / 2, c = Math.min(ww, tt) * 0.35;
    const pts = [[-ww + c, -tt], [ww - c, -tt], [ww, -tt + c], [ww, tt - c], [ww - c, tt], [-ww + c, tt], [-ww, tt - c], [-ww, -tt + c]];
    rings.push(pts.map(([x, z], i) => {
      const j = k === 0 ? 1 : 1 + (hash(i + k * 8, seed) - 0.5) * 0.1;
      let yy = y;
      if (k === K) yy = h - broken * h * 0.3 * (0.5 + 0.5 * Math.sin(x * 9 + seed * 3)) - (x > 0 ? broken * 0.35 : 0);
      return [x * j, yy, z * j];
    }));
  }
  loft(ctx, rings, true, !!s);
  if (s || lod >= 3) return;
  // runes cut proud of the front face, a dim cyan
  P(ctx, s, { col: "oklch(0.5 0.07 200)", rough: 0.6, em: [0.08, 0.42, 0.5] });
  const fz = (y) => -(t * (1 - 0.2 * (y / h))) / 2 - 0.006;
  for (let g = 0; g < runes; g++) {
    const y = h * 0.25 + g * h * 0.11, x = (hash(g, seed + 5) - 0.5) * w * 0.25;
    if (y > h * 0.75) break;
    boxR(ctx, [x, y, fz(y)], [0.025, 0.14, 0.02]);
    boxR(ctx, [x + 0.035, y + 0.03, fz(y)], [0.02, 0.07, 0.02], { roll: hash(g, seed) > 0.5 ? 40 : -40 });
  }
  if (sigil) { // the Nine: nine flames in a ring, the ninth gone dark
    const y0 = h * 0.72, R = Math.min(w, h) * 0.26;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI / 2 + (i / 9) * Math.PI * 2, x = Math.cos(a) * R, y = y0 + Math.sin(a) * R;
      if (i === 8) P(ctx, s, { col: "oklch(0.25 0.02 240)", rough: 0.9 });
      else P(ctx, s, { col: "oklch(0.6 0.08 200)", rough: 0.5, em: [0.15, 0.75, 0.9] });
      boxR(ctx, [x, y, fz(y) - 0.005], [0.07, 0.1, 0.03], { roll: 45 });
    }
  }
  // moss on the shoulder and around the foot
  P(ctx, s, { col: "oklch(0.48 0.1 135)", rough: 1 });
  blob(ctx, -w * 0.15, h * 0.82, 0, w * 0.32, 0.07, t * 0.55, seed, 0.3, 4, 7);
  blob(ctx, 0, 0.03, 0, w * 0.75, 0.1, t * 1.1, seed + 2, 0.35, 4, 8);
  P(ctx, s, { tex: MOSS, col: "oklch(0.88 0.02 120)", rough: 0.95 });
  blob(ctx, w * 0.75, 0.08, -t * 0.4, 0.16, 0.11, 0.13, seed + 7, 0.4, 4, 6);
}
function S(ctx, s, r, o, opts) { stone(xf(ctx, r, o), s, opts); }

function shrine(ctx, s) {
  const lod = ctx.lod || 1;
  P(ctx, s, { tex: FIELD, col: "oklch(0.93 0.02 100)" });
  prism(ctx, s, jpoly(0, 0, 2.95, 2.95, 14, 3, 0.05), -0.6, 0.18, 0.06, () => P(ctx, s, { tex: PATH, col: "oklch(0.9 0.03 110)" }));
  P(ctx, s, { tex: FIELD, col: "oklch(0.93 0.02 100)" });
  prism(ctx, s, jpoly(0, 0.2, 2.2, 2.2, 12, 5, 0.04), -0.2, 0.38, 0.05, () => P(ctx, s, { tex: PATH, col: "oklch(0.92 0.02 100)" }));
  // the monolith with the Nine's sigil, facing −Z
  S(ctx, s, {}, [0, 0.38, 1.2], { h: 3.1, w: 1.15, t: 0.55, broken: 0.1, seed: 9, runes: 4, sigil: true });
  // nine ring stones, a gap at the front for the way in; two have fallen
  for (let i = 0; i < 9; i++) {
    const a = ((-60 + i * 37.5) * Math.PI) / 180, x = Math.cos(a) * 2.6, z = Math.sin(a) * 2.6, yaw = 90 - (a * 180) / Math.PI;
    if (i === 2 || i === 6) S(ctx, s, { yaw, pitch: 82 }, [x, 0.3, z], { h: 0.75, w: 0.4, t: 0.28, broken: 0.6, seed: 20 + i, runes: lod > 1 ? 0 : 2 });
    else S(ctx, s, { yaw, roll: (hash(i, 4) - 0.5) * 10 }, [x, 0.1, z], { h: 0.55 + hash(i, 2) * 0.4, w: 0.4, t: 0.28, broken: 0.5, seed: 20 + i, runes: lod > 1 ? 0 : 2 });
  }
  if (s || lod >= 3) return;
  // offering candles at the monolith foot, a bowl, moss on the flags
  P(ctx, s, { tex: MOSS, col: "oklch(0.8 0.02 100)" });
  cyl(ctx, 0.75, 0.38, 0.75, 0.22, 0.26, 0.12, 10);
  for (let i = 0; i < 5; i++) {
    const x = -0.75 + hash(i, 1) * 0.35 - (i % 2) * 0.2, z = 0.7 + hash(i, 3) * 0.3, hh = 0.08 + hash(i, 6) * 0.14;
    P(ctx, s, { col: "oklch(0.93 0.03 90)", rough: 0.6 });
    cyl(ctx, x, 0.38, z, 0.03, 0.03, hh, 6);
    P(ctx, s, { col: "oklch(0.9 0.12 75)", em: [3.2, 1.8, 0.5] });
    blob(ctx, x, 0.38 + hh + 0.025, z, 0.012, 0.028, 0.012, i, 0.1, 3, 5);
  }
  P(ctx, s, { col: "oklch(0.48 0.1 135)", rough: 1 });
  for (let i = 0; i < 7; i++) { const a = hash(i, 11) * 6.28, r = 1.2 + hash(i, 12) * 1.5; blob(ctx, Math.cos(a) * r, r > 2.1 ? 0.18 : 0.38, Math.sin(a) * r, 0.3 + hash(i, 13) * 0.3, 0.03, 0.25, i, 0.4, 3, 7); }
}

function lectern(ctx, s) {
  P(ctx, s, { tex: MOSS, col: "oklch(0.9 0.02 110)" });
  prism(ctx, s, jpoly(0, 0, 0.36, 0.32, 8, 2, 0.03), -0.1, 0.14, 0.03);
  cyl(ctx, 0, 0.14, 0, 0.19, 0.15, 0.85, 8, true);
  boxR(ctx, [0, 1.03, 0], [0.5, 0.08, 0.4]);
  boxR(ctx, [0, 1.13, 0], [0.72, 0.09, 0.52], { pitch: -20 });
  if (s) return;
  // the stone book open on it, its lines faintly gold
  const B = xf(ctx, { pitch: -20 }, [0, 1.18, 0]);
  P(B, false, { col: "oklch(0.88 0.03 85)", rough: 0.8 });
  boxR(B, [-0.15, 0.02, 0], [0.28, 0.05, 0.38], { roll: 4 });
  boxR(B, [0.15, 0.02, 0], [0.28, 0.05, 0.38], { roll: -4 });
  if ((ctx.lod || 1) > 2) return;
  P(B, false, { col: "oklch(0.75 0.12 80)", em: [0.9, 0.6, 0.18] });
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) boxR(B, [sx * (0.15 + (hash(i, sx + 3) - 0.5) * 0.02), 0.05 + 0.006, -0.13 + i * 0.05], [0.16 + hash(i, sx) * 0.06, 0.004, 0.01]);
  P(ctx, false, { col: "oklch(0.48 0.1 135)", rough: 1 });
  blob(ctx, 0.05, 0.15, 0.05, 0.3, 0.05, 0.25, 3, 0.4, 3, 7);
}

// the scramble: stepped boulder tiers up to a shelf with a backing cliff
const TIERS = [
  [1.7, 2.3, 1.5, 1.2, 0.62], [1.9, 0.5, 1.3, 1.3, 1.25], [0.6, -0.9, 1.4, 1.2, 1.9], [-0.9, -2.1, 1.9, 1.6, 2.55],
  [-1.2, -4.4, 3.3, 1.7, 4.6], [-3.5, -1.0, 1.5, 2.3, 3.5], [1.6, -3.4, 1.3, 1.4, 3.2], [-1.6, -4.6, 2.2, 1.2, 5.6],
];
function crag(ctx, s) {
  TIERS.forEach(([x, z, rx, rz, top], i) => {
    P(ctx, s, { tex: MOSS, col: "oklch(0.9 0.02 110)" });
    prism(ctx, s, jpoly(x, z, rx, rz, 11, 30 + i, 0.18), -1, top, 0.14, () => P(ctx, s, { tex: MOSS, col: "oklch(0.88 0.06 130)" }));
  });
  if (s || (ctx.lod || 1) >= 3) return;
  P(ctx, s, { col: "oklch(0.47 0.1 135)", rough: 1 });
  TIERS.slice(0, 4).forEach(([x, z, rx, rz, top], i) => blob(ctx, x + rx * 0.3, top, z + rz * 0.2, rx * 0.5, 0.04, rz * 0.45, i, 0.4, 3, 7));
  P(ctx, s, { tex: MOSS, col: "oklch(0.85 0.02 110)" });
  for (let i = 0; i < 8; i++) { const a = hash(i, 40) * 6.28, r = 2.6 + hash(i, 41) * 2; blob(ctx, 0.5 + Math.cos(a) * r, 0.05, -0.5 + Math.sin(a) * r, 0.15 + hash(i, 42) * 0.25, 0.12 + hash(i, 43) * 0.15, 0.18 + hash(i, 44) * 0.2, i, 0.35, 4, 6); }
}

const CW = 0.9, CD = 0.58, CH = 0.46;
function chest(ctx, s) {
  P(ctx, s, { tex: OAK, col: "oklch(0.9 0.03 70)", rough: 0.85 });
  if (s) { boxR(ctx, [0, CH / 2, 0], [CW, CH, CD]); return; }
  const t = 0.05;
  boxR(ctx, [0, t / 2, 0], [CW, t, CD]);
  boxR(ctx, [0, CH / 2, -CD / 2 + t / 2], [CW, CH, t]); boxR(ctx, [0, CH / 2, CD / 2 - t / 2], [CW, CH, t]);
  boxR(ctx, [-CW / 2 + t / 2, CH / 2, 0], [t, CH, CD - 2 * t]); boxR(ctx, [CW / 2 - t / 2, CH / 2, 0], [t, CH, CD - 2 * t]);
  P(ctx, s, { tex: IRON, col: "oklch(0.75 0.01 60)", rough: 0.5, metal: 0.8 });
  for (const x of [-0.3, 0.3]) boxR(ctx, [x, CH / 2, 0], [0.06, CH + 0.01, CD + 0.02]);
  for (const x of [-1, 1]) for (const z of [-1, 1]) boxR(ctx, [x * (CW / 2 - 0.02), CH / 2, z * (CD / 2 - 0.02)], [0.06, CH + 0.02, 0.06]);
  // the hoard inside
  P(ctx, s, { col: "oklch(0.8 0.14 85)", rough: 0.3, metal: 1, em: [0.25, 0.16, 0.03] });
  blob(ctx, 0, 0.3, 0, CW * 0.4, 0.12, CD * 0.38, 5, 0.25, 4, 8);
  for (let i = 0; i < 6; i++) cyl(ctx, -0.3 + hash(i, 1) * 0.6, 0.38 + hash(i, 2) * 0.05, -0.15 + hash(i, 3) * 0.3, 0.035, 0.035, 0.01, 8);
}
function lid(ctx, s) { // origin at the back hinge, lid reaching to −Z
  if (s) return;
  const r = CD / 2, seg = 8, arc = (a, rr, x) => [x, Math.sin(a) * rr * 0.6, -r + Math.cos(a) * rr];
  P(ctx, s, { tex: OAK, col: "oklch(0.88 0.03 70)", rough: 0.85 });
  for (let i = 0; i < seg; i++) { const a0 = (i / seg) * Math.PI, a1 = ((i + 1) / seg) * Math.PI, m = (a0 + a1) / 2; quadN(ctx, arc(a0, r, -CW / 2), arc(a1, r, -CW / 2), arc(a1, r, CW / 2), arc(a0, r, CW / 2), [0, Math.sin(m), Math.cos(m)]); }
  for (const x of [-CW / 2, CW / 2]) for (let i = 0; i < seg; i++) triN(ctx, [x, 0, -r], arc((i / seg) * Math.PI, r, x), arc(((i + 1) / seg) * Math.PI, r, x), [x, 0, 0]);
  P(ctx, s, { tex: IRON, col: "oklch(0.75 0.01 60)", rough: 0.5, metal: 0.8 });
  for (const x0 of [-0.3, 0.3]) for (let i = 0; i < seg; i++) { const a0 = (i / seg) * Math.PI, a1 = ((i + 1) / seg) * Math.PI, m = (a0 + a1) / 2; quadN(ctx, arc(a0, r + 0.012, x0 - 0.03), arc(a1, r + 0.012, x0 - 0.03), arc(a1, r + 0.012, x0 + 0.03), arc(a0, r + 0.012, x0 + 0.03), [0, Math.sin(m), Math.cos(m)]); }
  P(ctx, s, { col: "oklch(0.72 0.12 80)", rough: 0.35, metal: 1 });
  boxR(ctx, [0, -0.05, -CD - 0.012], [0.12, 0.14, 0.02]);
}

function log(ctx, s) {
  const { L = 13, r = 0.85 } = ctx.params, lod = ctx.lod || 1, N = lod >= 4 ? 4 : 13, seg = lod >= 4 ? 7 : 12, cy = r * 0.9;
  if (s) { boxR(ctx, [0, cy, 0], [L, 2 * r * 0.95, 2 * r * 0.9]); boxR(ctx, [L / 2 + 0.1, cy, 0], [0.5, 4, 4]); return; }
  P(ctx, s, { tex: BARK, col: "oklch(0.9 0.03 70)", rough: 0.95 });
  const rings = [];
  for (let k = 0; k <= N; k++) {
    const f = k / N, x = -L / 2 + f * L, rr = r * (0.8 + 0.28 * f), zc = Math.sin(f * 3) * 0.25, yc = cy + Math.sin(f * Math.PI) * 0.12;
    rings.push(Array.from({ length: seg }, (_, i) => { const a = (i / seg) * Math.PI * 2, j = (i % 2 ? 0.95 : 1.04) * (1 + (hash(i + k * 13, 2) - 0.5) * 0.08); return [x - (k === 0 ? hash(i, 9) * 0.7 : 0), yc + Math.sin(a) * rr * j, zc + Math.cos(a) * rr * j]; }));
  }
  loft(ctx, rings, false, false);
  // the snapped end: pale splintered heartwood
  P(ctx, s, { col: "oklch(0.72 0.06 75)", rough: 0.9 });
  const R0 = rings[0], c0 = cen(R0);
  for (let i = 0; i < seg; i++) triN(ctx, [c0[0] - 0.2, c0[1], c0[2]], R0[i], R0[(i + 1) % seg], [-1, 0, 0]);
  // root plate standing on edge, earth caught in it
  P(ctx, s, { tex: MOSS, col: "oklch(0.62 0.05 60)", rough: 1 });
  prism(xf(ctx, { roll: 90 }, [L / 2 + 0.35, 0, 0]), false, jpoly(cy, 0, 2.0, 2.1, 12, 7, 0.2), -0.25, 0.25, 0.08);
  if (lod >= 3) return;
  P(ctx, s, { tex: BARK, col: "oklch(0.8 0.03 60)", rough: 0.95 });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3, y = cy + Math.sin(a) * 1.6, z = Math.cos(a) * 1.7; tube(ctx, [L / 2 + 0.3, y, z], [L / 2 + 0.9 + hash(i, 3) * 0.6, y + Math.sin(a) * 0.7, z + Math.cos(a) * 0.8], 0.14, 0.03, 5); }
  tube(ctx, [-2, cy + r * 0.6, 0.3], [-2.6, cy + 1.9, 0.9], 0.2, 0.1, 6);
  tube(ctx, [2.5, cy + r * 0.3, -0.75], [3.4, cy + 0.9, -2.1], 0.22, 0.1, 6);
  P(ctx, s, { col: "oklch(0.47 0.1 135)", rough: 1 });
  for (let i = 0; i < 7; i++) { const x = -L / 2 + 1 + i * (L - 2) / 6, f = (x + L / 2) / L; blob(ctx, x, cy + Math.sin(f * Math.PI) * 0.12 + r * (0.8 + 0.28 * f) * 0.92, Math.sin(f * 3) * 0.25, 0.5 + hash(i, 5) * 0.4, 0.07, 0.35, i, 0.4, 3, 7); }
}

function jetty(ctx, s) {
  const { len = 3.8, w = 1.15, deck = 0.6 } = ctx.params, lod = ctx.lod || 1;
  if (s) { boxR(ctx, [0, deck - 0.05, -len / 2], [w, 0.1, len]); boxR(ctx, [-0.45, deck + 0.5, -len + 0.1], [0.2, 1.2, 0.2]); return; }
  P(ctx, s, { tex: OAK, col: "oklch(0.85 0.03 70)", rough: 0.9 });
  for (const [x, z, top] of [[0.45, -0.3, 0.05], [-0.45, -0.3, 0.05], [0.45, -1.9, 0.05], [-0.45, -1.9, 0.05], [0.45, -len + 0.1, 0.1], [-0.45, -len + 0.1, 1.1]]) cyl(ctx, x, -2, z, 0.09, 0.085, deck + top + 2, 8);
  for (const x of [-0.42, 0.42]) boxR(ctx, [x, deck - 0.11, -len / 2], [0.1, 0.1, len]);
  P(ctx, s, { tex: PLANK, col: "oklch(0.9 0.02 70)", rough: 0.9 });
  const n = Math.floor(len / 0.3);
  for (let i = 0; i < n; i++) { if (i === n - 3) continue; boxR(ctx, [(hash(i, 1) - 0.5) * 0.06, deck - 0.03, -0.15 - i * 0.3], [w + (hash(i, 2) - 0.5) * 0.12, 0.06, 0.26], { yaw: (hash(i, 3) - 0.5) * 4 }); }
  boxR(ctx, [0.2, deck - 0.09, -0.15 - (n - 3) * 0.3], [w * 0.6, 0.05, 0.25], { roll: 8, yaw: 6 }); // the sprung plank
  if (lod >= 3) return;
  // rope on the mooring post
  P(ctx, s, { col: "oklch(0.72 0.06 80)", rough: 1 });
  for (let i = 0; i < 3; i++) cyl(ctx, -0.45, deck + 0.55 + i * 0.045, -len + 0.1, 0.105, 0.105, 0.04, 8);
  // the rod leaning on the post, line down to a bobber
  const base = [0.05, deck, -len + 0.55], tip = [-0.75, deck + 2.3, -len - 0.6];
  P(ctx, s, { col: "oklch(0.55 0.08 60)", rough: 0.6 });
  tube(ctx, base, [0.0, deck + 0.35, -len + 0.48], 0.022, 0.02, 6);
  P(ctx, s, { col: "oklch(0.4 0.05 50)", rough: 0.5 });
  tube(ctx, [0.0, deck + 0.35, -len + 0.48], tip, 0.016, 0.005, 5);
  P(ctx, s, { tex: IRON, col: "oklch(0.7 0.01 60)", metal: 0.8, rough: 0.4 });
  cyl(ctx, 0.05, deck + 0.22, -len + 0.5, 0.045, 0.045, 0.03, 8);
  P(ctx, s, { col: "oklch(0.9 0.01 90)", rough: 0.3 });
  tube(ctx, tip, [-0.95, -0.02, -len - 1.1], 0.003, 0.003, 3);
  P(ctx, s, { col: "oklch(0.6 0.2 28)", rough: 0.4 });
  blob(ctx, -0.95, 0.0, -len - 1.1, 0.04, 0.045, 0.04, 1, 0.05, 4, 6);
  // a wicker creel and a small lantern hung on the post
  P(ctx, s, { col: "oklch(0.62 0.08 75)", rough: 1 });
  boxR(ctx, [0.3, deck + 0.13, -0.9], [0.36, 0.26, 0.26], { yaw: 12 });
  P(ctx, s, { tex: IRON, col: "oklch(0.55 0.01 60)", metal: 0.8, rough: 0.5 });
  boxR(ctx, [-0.45, deck + 0.98, -len - 0.06], [0.04, 0.04, 0.2]);
  boxR(ctx, [-0.45, deck + 0.86, -len - 0.18], [0.16, 0.03, 0.16]);
  boxR(ctx, [-0.45, deck + 0.6, -len - 0.18], [0.16, 0.03, 0.16]);
  P(ctx, s, { col: "oklch(0.9 0.12 75)", em: [2.6, 1.5, 0.45], rough: 0.3 });
  boxR(ctx, [-0.45, deck + 0.73, -len - 0.18], [0.12, 0.23, 0.12]);
}

function reeds(ctx, s) {
  if (s) return;
  const { n = 26, r = 0.7, h = 1.5 } = ctx.params, lod = ctx.lod || 1, cnt = lod >= 3 ? Math.ceil(n / 3) : n;
  for (let i = 0; i < cnt; i++) {
    const a = hash(i, 1) * 6.28, d = Math.sqrt(hash(i, 2)) * r, x = Math.cos(a) * d, z = Math.sin(a) * d, hh = h * (0.6 + hash(i, 3) * 0.5);
    const la = hash(i, 4) * 6.28, lean = 0.12 + hash(i, 5) * 0.3, wd = 0.035, side = [Math.cos(la + 1.57) * wd, Math.sin(la + 1.57) * wd];
    P(ctx, s, { col: `oklch(${0.45 + hash(i, 6) * 0.15} ${0.08 + hash(i, 7) * 0.04} ${115 + hash(i, 8) * 25})`, rough: 0.9 });
    let px = x, pz = z, py = 0, wf = 1;
    for (let k = 1; k <= 3; k++) {
      const f = k / 3, nx = x + Math.cos(la) * lean * f * f * hh, nz = z + Math.sin(la) * lean * f * f * hh, ny = hh * f, nw = 1 - f * 0.85;
      quadN(ctx, [px - side[0] * wf, py, pz - side[1] * wf], [px + side[0] * wf, py, pz + side[1] * wf], [nx + side[0] * nw, ny, nz + side[1] * nw], [nx - side[0] * nw, ny, nz - side[1] * nw], [Math.cos(la), 0.2, Math.sin(la)]);
      px = nx; pz = nz; py = ny; wf = nw;
    }
    if (lod <= 2 && hash(i, 9) < 0.3) { P(ctx, s, { col: "oklch(0.36 0.06 50)", rough: 1 }); const cx = x + Math.cos(la) * lean * 0.5 * hh, cz = z + Math.sin(la) * lean * 0.5 * hh; cyl(ctx, cx, hh * 0.7, cz, 0.03, 0.03, 0.16, 6); }
  }
}
function lily(ctx, s) {
  if (s) return;
  const { n = 6, r = 1.0 } = ctx.params;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1) * 6.28, d = Math.sqrt(hash(i, 2)) * r, x = Math.cos(a) * d, z = Math.sin(a) * d, pr = 0.2 + hash(i, 3) * 0.22, rot0 = hash(i, 4) * 6.28;
    P(ctx, s, { col: `oklch(${0.42 + hash(i, 5) * 0.1} 0.1 ${135 + hash(i, 6) * 15})`, rough: 0.5 });
    for (let k = 1; k < 12; k++) { const a0 = rot0 + (k / 12) * 6.28, a1 = rot0 + ((k + 1) / 12) * 6.28; triN(ctx, [x, 0.012, z], [x + Math.cos(a0) * pr, 0.02, z + Math.sin(a0) * pr], [x + Math.cos(a1) * pr, 0.02, z + Math.sin(a1) * pr], [0, 1, 0]); }
    if (i % 3 === 0 && (ctx.lod || 1) <= 2) {
      P(ctx, s, { col: "oklch(0.93 0.04 350)", rough: 0.5, em: [0.15, 0.12, 0.13] });
      for (let k = 0; k < 8; k++) { const b = (k / 8) * 6.28, ln = 0.09; triN(ctx, [x + Math.cos(b - 0.25) * 0.025, 0.03, z + Math.sin(b - 0.25) * 0.025], [x + Math.cos(b + 0.25) * 0.025, 0.03, z + Math.sin(b + 0.25) * 0.025], [x + Math.cos(b) * ln, 0.1, z + Math.sin(b) * ln], [Math.cos(b), 0.5, Math.sin(b)]); }
      P(ctx, s, { col: "oklch(0.85 0.15 90)", em: [0.6, 0.45, 0.05] });
      blob(ctx, x, 0.045, z, 0.025, 0.02, 0.025, i, 0.1, 3, 5);
    }
  }
}
function glowring(ctx, s) {
  if (s) return;
  const { n = 16, r = 1.3 } = ctx.params, lod = ctx.lod || 1;
  if (lod >= 4) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.28 + hash(i, 1) * 0.3, d = i % 4 === 3 ? hash(i, 2) * r * 0.6 : r * (0.85 + hash(i, 3) * 0.3), x = Math.cos(a) * d, z = Math.sin(a) * d, hh = 0.04 + hash(i, 4) * 0.1;
    P(ctx, s, { col: "oklch(0.88 0.03 200)", rough: 0.7 });
    cyl(ctx, x, 0, z, 0.012, 0.009, hh, 5, false);
    P(ctx, s, { col: "oklch(0.75 0.1 200)", rough: 0.4, em: [0.12, 0.65, 0.8] });
    blob(ctx, x, hh, z, 0.03 + hash(i, 5) * 0.03, 0.018, 0.03 + hash(i, 5) * 0.03, i, 0.15, 3, 6);
  }
}
function litter(ctx, s) {
  if (s) return;
  const { r = 2.5, n = 40 } = ctx.params, lod = ctx.lod || 1;
  if (lod >= 3) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1) * 6.28, d = Math.sqrt(hash(i, 2)) * r, x = Math.cos(a) * d, z = Math.sin(a) * d, k = hash(i, 3);
    if (k < 0.35) { P(ctx, s, { col: "oklch(0.4 0.04 60)", rough: 1 }); boxR(ctx, [x, 0.015, z], [0.02, 0.02, 0.25 + hash(i, 4) * 0.4], { yaw: hash(i, 5) * 180 }); }
    else if (k < 0.85) { P(ctx, s, { col: `oklch(${0.5 + hash(i, 6) * 0.15} ${0.08 + hash(i, 7) * 0.06} ${45 + hash(i, 8) * 60})`, rough: 0.9 }); const yaw = hash(i, 9) * 180; boxR(ctx, [x, 0.01, z], [0.07, 0.004, 0.11], { yaw, roll: (hash(i, 10) - 0.5) * 20 }); }
    else { P(ctx, s, { tex: MOSS, col: "oklch(0.85 0.02 110)" }); blob(ctx, x, 0.02, z, 0.05 + hash(i, 11) * 0.05, 0.04, 0.06, i, 0.3, 3, 5); }
  }
}

const KINDS = { shrine, lectern, waystone: (c, s) => stone(c, s, c.params || {}), crag, chest, lid, log, jetty, reeds, lily, glowring, litter };
function build(ctx, s) { (KINDS[(ctx.params || {}).kind] || shrine)(ctx, s); }
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) {
  const k = (ctx.params || {}).kind;
  if (k === "reeds" || k === "lily" || k === "glowring" || k === "litter" || k === "lid") return null;
  build(ctx, true);
}
