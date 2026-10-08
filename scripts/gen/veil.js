// Veilgate Aerie, the last outpost of the Ninth Veil, by params.kind. Origin at the ground; doors in −Z.
// crystal {h tint s}: violet prism cluster · arch {w h}: the ruined Veilgate, rift hanging in it, passage along Z
// tower {h}: gothic watch tower 5×5, spiral stair to a lit lantern room · hall: warden's hall 12×8, buttressed, benches
// obelisk: rune pillar · floatrock {r s}: inverted-cone sky rock, no collider · brazier: stone pedestal + iron bowl
import { box, boxR, cyl, blob, quadN, triN } from "./shape.js";
const ASH = "cdn/texture-grey-ashlar-stone-blocks-weathered.png", SLATE = "cdn/texture-dark-slate-roof-tiles-weathered.png";
const WOOD = "cdn/texture-dark-oak-timber-beam-hand-painted.png", PLANK = "cdn/texture-worn-oak-floor-boards.png";
const IRON = "cdn/texture-rusted-black-iron-hammered.png", FLAG = "cdn/texture-weathered-grey-ashlar-stone.png";
const ROCK = "/cdn/rocks-diffuse-u03avi37y.webp", VGROUND = "cdn/texture-terrain-violet-crystal-frost-rock-realistic-albedo.png";
const CLOTH = "cdn/texture-rust-red-woven-wool-cloth.png";
const R = Math.PI / 180;
const FACES = [[1, 3, 7, 5], [0, 4, 6, 2], [2, 6, 7, 3], [0, 1, 5, 4], [4, 5, 7, 6], [0, 2, 3, 1]];
// any convex 8-corner solid, corners in bit order (bit0, bit1, bit2); each face wound off the solid's centre
function hexa(ctx, P) {
  const C = [0, 0, 0]; for (const p of P) for (let j = 0; j < 3; j++) C[j] += p[j] / 8;
  for (const f of FACES) { const m = [0, 0, 0]; for (const i of f) for (let j = 0; j < 3; j++) m[j] += P[i][j] / 4; quadN(ctx, P[f[0]], P[f[1]], P[f[2]], P[f[3]], [m[0] - C[0], m[1] - C[1], m[2] - C[2]]); }
}
// a triangular prism: tri a,b,c and the same pushed by off
function prism3(ctx, a, b, c, off) {
  const A = [a, b, c], B = A.map((p) => [p[0] + off[0], p[1] + off[1], p[2] + off[2]]);
  const C = [0, 0, 0]; for (const p of [...A, ...B]) for (let j = 0; j < 3; j++) C[j] += p[j] / 6;
  const n = (ps) => { const m = [0, 0, 0]; for (const p of ps) for (let j = 0; j < 3; j++) m[j] += p[j] / ps.length; return [m[0] - C[0], m[1] - C[1], m[2] - C[2]]; };
  triN(ctx, A[0], A[1], A[2], n(A)); triN(ctx, B[0], B[1], B[2], n(B));
  for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; quadN(ctx, A[i], A[j], B[j], B[i], n([A[i], A[j], B[j], B[i]])); }
}
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rng = (seed) => { let h = (seed * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
// a faceted crystal: hex prism from base along dir, shoulder at 78 %, pointed tip
function crystal1(ctx, base, dir, r, len, sides, tipGlow) {
  const d = norm(dir), u = norm(crs(d, Math.abs(d[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0])), v = crs(d, u);
  const ring = (t, rr, tw) => { const o = []; for (let k = 0; k < sides; k++) { const a = (k / sides) * Math.PI * 2 + tw, c = Math.cos(a) * rr, s = Math.sin(a) * rr; o.push([base[0] + d[0] * t + u[0] * c + v[0] * s, base[1] + d[1] * t + u[1] * c + v[1] * s, base[2] + d[2] * t + u[2] * c + v[2] * s]); } return o; };
  const A = ring(0, r * 0.82, 0), B = ring(len * 0.78, r, 0), T = [base[0] + d[0] * len, base[1] + d[1] * len, base[2] + d[2] * len];
  for (let k = 0; k < sides; k++) {
    const j = (k + 1) % sides, a = ((k + 0.5) / sides) * Math.PI * 2, out = [u[0] * Math.cos(a) + v[0] * Math.sin(a), u[1] * Math.cos(a) + v[1] * Math.sin(a), u[2] * Math.cos(a) + v[2] * Math.sin(a)];
    quadN(ctx, A[k], A[j], B[j], B[k], out);
    triN(ctx, A[k], A[j], base, [-d[0], -d[1], -d[2]]);
  }
  if (tipGlow) tipGlow();
  for (let k = 0; k < sides; k++) { const j = (k + 1) % sides, a = ((k + 0.5) / sides) * Math.PI * 2; triN(ctx, B[k], B[j], T, [u[0] * Math.cos(a) + v[0] * Math.sin(a) + d[0] * 0.6, u[1] * Math.cos(a) + v[1] * Math.sin(a) + d[1] * 0.6, u[2] * Math.cos(a) + v[2] * Math.sin(a) + d[2] * 0.6]); }
}
// a rune: three strokes in the face plane, yaw turns it onto an X face
function rune(ctx, c, k, yaw = 0, sc = 1) {
  const r = rng(k * 7 + 3);
  boxR(ctx, c, [0.06 * sc, 0.42 * sc, 0.04], { yaw });
  const off = (dx, dy) => { const a = yaw * R; return [c[0] + dx * Math.cos(a), c[1] + dy, c[2] - dx * Math.sin(a)]; };
  boxR(ctx, off(0.1 * sc, (r() - 0.5) * 0.2 * sc), [0.05 * sc, 0.26 * sc, 0.04], { roll: r() > 0.5 ? 38 : -38, yaw });
  if (r() > 0.4) boxR(ctx, off(-0.09 * sc, (r() - 0.5) * 0.25 * sc), [0.16 * sc, 0.05 * sc, 0.04], { yaw });
  else boxR(ctx, off(0, 0.24 * sc), [0.2 * sc, 0.05 * sc, 0.04], { roll: 20, yaw });
}
// a wall face as boxes around its openings. axis "z": u runs along X at z=c; axis "x": u runs along Z at x=c
function wall(ctx, axis, c, t, u0, u1, v0, v1, holes = []) {
  const B = (a0, a1, b0, b1) => { if (a1 - a0 < 1e-3 || b1 - b0 < 1e-3) return; if (axis === "z") box(ctx, a0, b0, c - t / 2, a1, b1, c + t / 2); else box(ctx, c - t / 2, b0, a0, c + t / 2, b1, a1); };
  let u = u0;
  for (const h of [...holes].sort((a, b) => a.u - b.u)) { const h0 = h.u - h.w / 2, h1 = h.u + h.w / 2; B(u, h0, v0, v1); B(h0, h1, v0, v0 + h.sill); B(h0, h1, v0 + h.sill + h.h, v1); u = h1; }
  B(u, u1, v0, v1);
}
// map wall-plane (u, v, d = offset along the outward normal) to the model frame
const mapper = (axis, c, out) => (u, v, d) => (axis === "z" ? [u, v, c + out * d] : [c + out * d, v, u]);
// pointed head inside a rectangular opening + hood moulding + glass, for an opening on a wall face
function lancet(ctx, axis, c, t, out, h, v0, P, glass, trim) {
  const M = mapper(axis, c, out), top = v0 + h.sill + h.h, hh = h.w * 0.6, half = t / 2;
  P(ASH, "oklch(0.86 0.01 280)", 0.9);
  for (const sd of [-1, 1]) prism3(ctx, M(h.u + sd * h.w / 2, top - hh, half), M(h.u + sd * h.w / 2, top, half), M(h.u, top, half), axis === "z" ? [0, 0, -out * t] : [-out * t, 0, 0]);
  if (!trim) return;
  for (const sd of [-1, 1]) { // hood moulding: two leaning stones meeting over the point
    const a = M(h.u + sd * (h.w / 2 + 0.12), top - hh, half + 0.06), b = M(h.u, top + 0.16, half + 0.06), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), ang = Math.atan2(hh + 0.16, h.w / 2 + 0.12) / R;
    boxR(ctx, m, axis === "z" ? [len, 0.16, 0.14] : [0.14, 0.16, len], axis === "z" ? { roll: -sd * ang } : { pitch: sd * ang });
  }
  const sill = M(h.u, v0 + h.sill - 0.06, half + 0.08); boxR(ctx, sill, axis === "z" ? [h.w + 0.3, 0.12, 0.2] : [0.2, 0.12, h.w + 0.3]);
  if (!glass) return;
  ctx.albedo(null); ctx.color("oklch(0.82 0.11 75)", 0.72); ctx.roughness(0.2); ctx.emissive(2.6, 1.5, 0.55);
  const g0 = M(h.u - h.w / 2, v0 + h.sill, -0.05), g1 = M(h.u + h.w / 2, top - 0.02, 0.05);
  box(ctx, Math.min(g0[0], g1[0]), g0[1], Math.min(g0[2], g1[2]), Math.max(g0[0], g1[0]), g1[1], Math.max(g0[2], g1[2]));
  ctx.emissive(null); ctx.color("oklch(0.22 0.01 60)"); ctx.roughness(0.6);
  boxR(ctx, M(h.u, v0 + h.sill + h.h / 2, 0.07), axis === "z" ? [0.05, h.h, 0.04] : [0.04, h.h, 0.05]);
  boxR(ctx, M(h.u, v0 + h.sill + h.h * 0.45, 0.07), axis === "z" ? [h.w, 0.05, 0.04] : [0.04, 0.05, h.w]);
}
const K = {
  crystal(ctx, p, far, col, P, G) {
    const h = p.h ?? 5, hue = p.tint ?? 300, r = rng((p.s ?? 1) * 31 + Math.round(h * 10));
    const n = 3 + Math.floor(r() * 5), list = [{ base: [0, -0.3, 0], dir: [(r() - 0.5) * 0.2, 1, (r() - 0.5) * 0.2], rad: h * 0.12, len: h }];
    const a0 = r() * Math.PI * 2;
    for (let i = 1; i < n; i++) {
      const a = a0 + (i / (n - 1)) * Math.PI * 2 + (r() - 0.5) * 0.7, lean = Math.tan((22 + r() * 30) * R), off = h * 0.06 + r() * h * 0.06;
      const len = h * (0.3 + r() * 0.45);
      list.push({ base: [Math.cos(a) * off, -0.2, Math.sin(a) * off], dir: [Math.cos(a) * lean, 1, Math.sin(a) * lean], rad: len * 0.13, len });
    }
    if (col) { const c = list[0]; crystal1(ctx, c.base, c.dir, c.rad, c.len, 6); return; }
    P(ROCK, "oklch(0.55 0.03 290)", 0.95);
    blob(ctx, 0, -0.15, 0, h * 0.22, h * 0.07, h * 0.2, p.s ?? 1, 0.3, far ? 3 : 5, far ? 6 : 9);
    const use = far ? list.slice(0, 3) : list;
    use.forEach((c, i) => {
      P(null, `oklch(${0.7 + (i % 2) * 0.06} 0.15 ${hue + (i % 3) * 8})`, 0.12, 0.1); G(`oklch(0.5 0.24 ${hue})`);
      crystal1(ctx, c.base, c.dir, c.rad, c.len, 6, () => G(`oklch(0.8 0.2 ${hue + 10})`));
    });
    if (!far) for (let i = 0; i < 6; i++) { // shards strewn at the foot
      const a = r() * Math.PI * 2, d = h * (0.2 + r() * 0.15), l = h * (0.08 + r() * 0.08);
      P(null, `oklch(0.74 0.14 ${hue})`, 0.12, 0.1); G(`oklch(0.55 0.22 ${hue})`);
      crystal1(ctx, [Math.cos(a) * d, -0.05, Math.sin(a) * d], [Math.cos(a) * 0.8, 1, Math.sin(a) * 0.8], l * 0.18, l, 5);
    }
    G(null);
  },
  arch(ctx, p, far, col, P, G) {
    const w = p.w ?? 10, h = p.h ?? 14, D = 2.4, t = 1.3, pw = 1.8, rho = 0.8 * w, cx = rho - w / 2, rise = Math.sqrt(rho * rho - cx * cx);
    const hs = h - t - 0.3 - rise, thSpring = Math.PI, thApex = Math.PI - Math.acos(cx / rho), segs = far ? 4 : 9;
    const pt = (sd, th, r, z) => [sd * (cx + r * Math.cos(th)), hs + r * Math.sin(th), z];
    P(ASH, "oklch(0.84 0.012 285)", 0.92);
    for (const sd of [-1, 1]) {
      box(ctx, ...(sd < 0 ? [-w / 2 - pw - 2.0, -1.5, -D / 2 - 0.7, -w / 2 + 0.25, 0.35, D / 2 + 0.7] : [w / 2 - 0.25, -1.5, -D / 2 - 0.7, w / 2 + pw + 2.0, 0.35, D / 2 + 0.7])); // plinth sunk in the slope
      const x0 = sd < 0 ? -w / 2 - pw : w / 2, x1 = sd < 0 ? -w / 2 : w / 2 + pw;
      box(ctx, x0, 0.35, -D / 2, x1, hs, D / 2); // pier
      const bx0 = sd < 0 ? -w / 2 - pw - 1.1 : w / 2 + pw - 0.2, bx1 = sd < 0 ? -w / 2 - pw + 0.2 : w / 2 + pw + 1.1;
      const btop = sd < 0 ? hs + 6.2 : hs + 2.2;
      box(ctx, bx0, 0.35, -D / 2 - 0.25, bx1, btop, D / 2 + 0.25); // buttress tower
      if (sd < 0 && !far) { cyl(ctx, (bx0 + bx1) / 2, btop, 0, 1.05, 0.0, 3.6, 4, true); box(ctx, bx0 - 0.15, btop - 0.35, -D / 2 - 0.4, bx1 + 0.15, btop, D / 2 + 0.4); }
      if (sd > 0 && !col) for (let i = 0; i < 4; i++) boxR(ctx, [(bx0 + bx1) / 2 + (i - 1.5) * 0.35, btop + 0.2 + (i % 2) * 0.25, (i - 1.5) * 0.5], [0.6, 0.55, 0.9], { roll: (i - 1.5) * 9, yaw: i * 14 }); // broken crown
      if (!far && !col) { // base course + impost
        box(ctx, x0 - 0.15, 0.35, -D / 2 - 0.15, x1 + 0.15, 1.1, D / 2 + 0.15);
        box(ctx, x0 - 0.18, hs - 0.4, -D / 2 - 0.18, x1 + 0.18, hs, D / 2 + 0.18);
        for (const z of [-D / 2 - 0.2, D / 2 + 0.2]) cyl(ctx, sd * (w / 2 + 0.05), 1.1, z * 0.6, 0.22, 0.22, hs - 1.5, 8, false); // engaged shafts
      }
      // voussoirs: the left ring meets the apex, the right is broken after four stones
      const n = sd < 0 ? segs : Math.max(2, Math.round(segs * 0.45));
      for (let k = 0; k < n; k++) {
        const a = thSpring - (k / segs) * (thSpring - thApex), b = thSpring - ((k + 1) / segs) * (thSpring - thApex), cr = sd > 0 && k === n - 1 ? 0.88 : 1;
        const th = (q) => (sd < 0 ? q : Math.PI - q);
        const P8 = [];
        for (let i = 0; i < 8; i++) { const q = i & 1 ? b : a, r = i & 2 ? rho + t * cr : rho, z = i & 4 ? D / 2 : -D / 2; const v = [cx + r * Math.cos(q), hs + r * Math.sin(q), z]; P8.push([sd < 0 ? v[0] : -v[0], v[1], v[2]]); }
        if (sd > 0 && k === n - 1 && !col) for (const i of [1, 3, 5, 7]) P8[i][1] -= 0.35; // a sheared last stone
        hexa(ctx, P8);
      }
    }
    if (!far && !col) {
      box(ctx, -w / 2, -0.4, -D / 2 - 0.4, w / 2, 0.06, D / 2 + 0.4); // threshold flags
      boxR(ctx, [0.05, h - 0.75, 0], [0.9, 1.5, D + 0.3]); // keystone, proud
      for (let i = 0; i < 6; i++) { const q = rng(i + 5); boxR(ctx, [w / 2 + 1.2 + q() * 3.5, 0.25 + q() * 0.2, -D / 2 - 1.5 - q() * 4], [1.1, 0.6, 0.7 + q() * 0.4], { yaw: q() * 90, roll: (q() - 0.5) * 30, pitch: (q() - 0.5) * 20 }); } // fallen voussoirs
      P(null, "oklch(0.7 0.14 300)", 0.3); G([1.6, 0.5, 2.8]); // a rune on every stone of the whole side
      for (let k = 0; k < segs; k++) { const q = Math.PI - ((k + 0.5) / segs) * (Math.PI - thApex), v = [cx + (rho + t / 2) * Math.cos(q), hs + (rho + t / 2) * Math.sin(q)]; rune(ctx, [-v[0], v[1], -D / 2 - 0.02], k, 0, 0.9); rune(ctx, [-v[0], v[1], D / 2 + 0.02], k + 20, 0, 0.9); }
      for (let i = 0; i < 4; i++) rune(ctx, [-w / 2 - pw / 2, 2.2 + i * 0.9, -D / 2 - 0.02], i + 40);
      G(null);
    }
    if (col) return;
    // the rift: the opening's own outline, three layers brightening to a core
    const out = [], inset = 0.15, N = far ? 5 : 12;
    for (let k = 0; k <= N; k++) { const q = Math.PI - (k / N) * (Math.PI - thApex); out.push([cx + (rho - inset) * Math.cos(q), hs + (rho - inset) * Math.sin(q)]); }
    for (let k = N; k >= 0; k--) { const q = Math.PI - (k / N) * (Math.PI - thApex); out.push([-(cx + (rho - inset) * Math.cos(q)), hs + (rho - inset) * Math.sin(q)]); }
    out.push([w / 2 - inset, 0.08], [-w / 2 + inset, 0.08]);
    const layer = (s, z, cy) => { for (let i = 0; i < out.length; i++) { const a = out[i], b = out[(i + 1) % out.length]; triN(ctx, [0, cy, z], [a[0] * s, cy + (a[1] - cy) * s, z], [b[0] * s, cy + (b[1] - cy) * s, z], [0, 0, -1]); } };
    ctx.albedo(null); ctx.roughness(0.1);
    ctx.color("oklch(0.55 0.2 300)", 0.42); G([1.0, 0.3, 2.1]); layer(1, 0, hs * 0.95);
    if (!far) { ctx.color("oklch(0.7 0.2 305)", 0.38); G([2.0, 0.9, 3.4]); layer(0.62, -0.12, hs * 1.05); layer(0.55, 0.12, hs * 1.05);
      ctx.color("oklch(0.9 0.08 310)", 0.6); G([3.6, 2.6, 4.4]); layer(0.22, 0, hs * 1.12); }
    G(null);
  },
  tower(ctx, p, far, col, P, G) {
    const h = p.h ?? 18, S = 2.5, T = 0.5, y0 = 0.3, N = 54, rs = 0.2, Y1 = y0 + N * rs, L = Y1 + 3.2;
    P(ASH, "oklch(0.86 0.012 285)", 0.92);
    box(ctx, -S - 0.4, -1.5, -S - 0.4, S + 0.4, y0, S + 0.4); // plinth
    box(ctx, -0.9, -0.6, -S - 1.0, 0.9, 0.15, -S - 0.4); // door step
    if (far) { box(ctx, -S, y0, -S, S, Y1, S); box(ctx, -S, Y1, -S, S, L, S); }
    else {
      const door = { u: 0, sill: 0, w: 1.2, h: 2.4 };
      wall(ctx, "z", -S + T / 2, T, -S, S, y0, Y1, [door]);
      wall(ctx, "z", S - T / 2, T, -S, S, y0, Y1);
      wall(ctx, "x", -S + T / 2, T, -S + T, S - T, y0, Y1);
      wall(ctx, "x", S - T / 2, T, -S + T, S - T, y0, Y1);
      if (!col) lancet(ctx, "z", -S + T / 2, T, -1, door, y0, P, false, true);
      P(ASH, "oklch(0.86 0.012 285)", 0.92);
      // lantern room: parapet, corner piers, lintel band
      for (const [a, b] of [[-1, 1]]) for (const sd of [a, b]) { box(ctx, -S, Y1, sd * S - (sd > 0 ? 0.4 : 0), S, Y1 + 1.0, sd * S + (sd < 0 ? 0.4 : 0)); box(ctx, sd * S - (sd > 0 ? 0.4 : 0), Y1, -S + 0.4, sd * S + (sd < 0 ? 0.4 : 0), Y1 + 1.0, S - 0.4); }
      for (const x of [-1, 1]) for (const z of [-1, 1]) box(ctx, x * S - (x > 0 ? 0.75 : 0), Y1, z * S - (z > 0 ? 0.75 : 0), x * S + (x < 0 ? 0.75 : 0), L, z * S + (z < 0 ? 0.75 : 0));
      if (!col) { for (const sd of [-1, 1]) { box(ctx, -S, L - 0.7, sd * S - (sd > 0 ? 0.35 : 0), S, L, sd * S + (sd < 0 ? 0.35 : 0)); box(ctx, sd * S - (sd > 0 ? 0.35 : 0), L - 0.7, -S, sd * S + (sd < 0 ? 0.35 : 0), L, S); }
        for (const sd of [-1, 1]) for (const ax of ["z", "x"]) { const c = sd * (S - 0.2); for (const u of [0]) { // pointed heads in the four arcades
          const M = (uu, v) => (ax === "z" ? [uu, v, c] : [c, v, uu]); for (const s2 of [-1, 1]) prism3(ctx, M(u + s2 * 1.75, L - 1.6), M(u + s2 * 1.75, L - 0.7), M(u, L - 0.7), ax === "z" ? [0, 0, -sd * 0.35] : [-sd * 0.35, 0, 0]); } } }
    }
    if (!col) {
      if (!far) { // pilasters, string courses, glowing slits
        for (const x of [-1, 1]) for (const z of [-1, 1]) { box(ctx, x * S - (x > 0 ? 0.3 : -0.3) - 0.35, y0, z * (S + 0.3) - 0.35, x * S - (x > 0 ? 0.3 : -0.3) + 0.35, Y1 - 1.5, z * (S + 0.3) + 0.35); boxR(ctx, [x * (S + 0.05), Y1 - 1.2, z * (S + 0.05)], [0.85, 0.6, 0.85], { yaw: 45 }); }
        for (const y of [4.2, 8.2, Y1]) box(ctx, -S - 0.12, y - 0.12, -S - 0.12, S + 0.12, y + 0.12, S + 0.12);
        box(ctx, -S - 0.3, L, -S - 0.3, S + 0.3, L + 0.35, S + 0.3); // cornice
        ctx.albedo(null); ctx.color("oklch(0.3 0.04 60)"); G([1.8, 0.9, 0.3]);
        for (const y of [5.6, 9.2]) { box(ctx, -0.08, y, S - 0.02, 0.08, y + 0.9, S + 0.02); box(ctx, S - 0.02, y, -0.08, S + 0.02, y + 0.9, 0.08); box(ctx, -S - 0.02, y, -0.08, -S + 0.02, y + 0.9, 0.08); }
        G(null);
      }
      // spire
      P(SLATE, "oklch(0.7 0.03 285)", 0.85);
      const b = S + 0.45, yb = L + 0.35, apex = Math.max(h, yb + 3.5);
      const C = [[-b, -b], [b, -b], [b, b], [-b, b]];
      for (let i = 0; i < 4; i++) { const a = C[i], c = C[(i + 1) % 4]; triN(ctx, [a[0], yb, a[1]], [c[0], yb, c[1]], [0, apex, 0], [(a[0] + c[0]) / 2, 0.6, (a[1] + c[1]) / 2]); triN(ctx, [a[0], yb, a[1]], [c[0], yb, c[1]], [0, yb, 0], [0, -1, 0]); }
      if (!far) { P(IRON, "oklch(0.75 0.05 80)", 0.4, 0.8); cyl(ctx, 0, apex - 0.2, 0, 0.05, 0.03, 1.6, 6); boxR(ctx, [0, apex + 0.9, 0], [0.7, 0.06, 0.06]); }
    }
    if (far) return;
    // floor, spiral stair round a newel, half deck, rail
    P(FLAG, "oklch(0.8 0.01 280)", 0.9); box(ctx, -S + T, 0.1, -S + T, S - T, y0 + 0.02, S - T);
    cyl(ctx, 0, y0, 0, 0.26, 0.26, N * rs, col ? 6 : 10, true);
    P(WOOD, "oklch(0.8 0.03 60)", 0.85);
    const phN = 288, ri = 0.24, ro = S - T - 0.04;
    for (let i = 1; i <= N; i++) {
      const ph = (phN - (N - i) * 18) * R, a = ph - 9.6 * R, b2 = ph + 9.6 * R, top = y0 + i * rs, bot = top - (col ? rs : 0.12);
      const P8 = []; for (let k = 0; k < 8; k++) { const q = k & 1 ? b2 : a, r = k & 4 ? ro : ri, y = k & 2 ? top : bot; P8.push([Math.cos(q) * r, y, Math.sin(q) * r]); }
      hexa(ctx, P8);
    }
    // the deck: a fan over the 144° the stair does not climb through (297° → 441°)
    const sq = (q) => (S - T) / Math.max(Math.abs(Math.cos(q)), Math.abs(Math.sin(q)));
    const steps = []; for (let d = 297; d <= 441.01; d += 8) steps.push(Math.min(d, 441) * R); if (steps[steps.length - 1] < 441 * R - 1e-4) steps.push(441 * R);
    for (const corner of [315, 405]) steps.push(corner * R); steps.sort((x, y) => x - y);
    P(PLANK, "oklch(0.88 0.03 60)", 0.85);
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i], c = steps[i + 1], A = [Math.cos(a) * sq(a), 0, Math.sin(a) * sq(a)], B = [Math.cos(c) * sq(c), 0, Math.sin(c) * sq(c)];
      triN(ctx, [0, Y1, 0], [A[0], Y1, A[2]], [B[0], Y1, B[2]], [0, 1, 0]); triN(ctx, [0, Y1 - 0.25, 0], [A[0], Y1 - 0.25, A[2]], [B[0], Y1 - 0.25, B[2]], [0, -1, 0]);
    }
    for (const q of [297 * R, 441 * R]) { const E = [Math.cos(q) * sq(q), Math.sin(q) * sq(q)]; quadN(ctx, [0, Y1 - 0.25, 0], [E[0], Y1 - 0.25, E[1]], [E[0], Y1, E[1]], [0, Y1, 0], [Math.cos(q + (q < 6 ? -1 : 1) * Math.PI / 2), 0, Math.sin(q + (q < 6 ? -1 : 1) * Math.PI / 2)]); }
    P(IRON, "oklch(0.6 0.02 60)", 0.5, 0.7);
    { const q = 81 * R, r0 = 0.3, r1 = sq(q), m = (r0 + r1) / 2; boxR(ctx, [Math.cos(q) * m, Y1 + 0.5, Math.sin(q) * m], [r1 - r0, col ? 1.0 : 0.06, 0.08], { yaw: -81 }); if (!col) for (const r of [0.4, 1.0, 1.6]) box(ctx, Math.cos(q) * r - 0.03, Y1, Math.sin(q) * r - 0.03, Math.cos(q) * r + 0.03, Y1 + 1.0, Math.sin(q) * r + 0.03); boxR(ctx, [Math.cos(q) * m, Y1 + 1.0, Math.sin(q) * m], [r1 - r0, 0.07, 0.1], { yaw: -81 }); }
    if (col) return;
    // the beacon on the newel head
    P(IRON, "oklch(0.55 0.02 60)", 0.5, 0.7); cyl(ctx, 0, Y1, 0, 0.32, 0.36, 0.25, 8); cyl(ctx, 0, Y1 + 1.15, 0, 0.42, 0.05, 0.4, 8);
    for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2 + Math.PI / 4; box(ctx, Math.cos(q) * 0.3 - 0.03, Y1 + 0.25, Math.sin(q) * 0.3 - 0.03, Math.cos(q) * 0.3 + 0.03, Y1 + 1.15, Math.sin(q) * 0.3 + 0.03); }
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.8); G([5, 2.8, 0.9]); box(ctx, -0.24, Y1 + 0.3, -0.24, 0.24, Y1 + 1.1, 0.24); G(null);
  },
  hall(ctx, p, far, col, P, G) {
    const W = 6, Dz = 4, T = 0.6, y0 = 0.3, H = 5.5, top = y0 + H, rise = 4.2, Rt = top + rise, ov = 0.6;
    P(ASH, "oklch(0.86 0.012 285)", 0.92);
    box(ctx, -W - 0.45, -1.5, -Dz - 0.45, W + 0.45, y0, Dz + 0.45);
    box(ctx, -1.3, -0.7, -Dz - 1.25, 1.3, 0.15, -Dz - 0.45);
    const door = { u: 0, sill: 0, w: 1.6, h: 3.0 }, wF = [door, { u: -3.6, sill: 1.4, w: 1.0, h: 2.4 }, { u: 3.6, sill: 1.4, w: 1.0, h: 2.4 }];
    const wB = [-3.6, 0, 3.6].map((u) => ({ u, sill: 1.4, w: 1.0, h: 2.4 })), wE = [{ u: 0, sill: 1.5, w: 1.2, h: 2.9 }];
    if (far) { box(ctx, -W, y0, -Dz, W, top, Dz); }
    else {
      wall(ctx, "z", -Dz + T / 2, T, -W, W, y0, top, col ? [door] : wF);
      wall(ctx, "z", Dz - T / 2, T, -W, W, y0, top, col ? [] : wB);
      for (const sd of [-1, 1]) wall(ctx, "x", sd * (W - T / 2), T, -Dz + T, Dz - T, y0, top, col ? [] : wE);
      if (!col) {
        for (const h of wF) lancet(ctx, "z", -Dz + T / 2, T, -1, h, y0, P, h !== door, true);
        for (const h of wB) lancet(ctx, "z", Dz - T / 2, T, 1, h, y0, P, true, true);
        for (const sd of [-1, 1]) lancet(ctx, "x", sd * (W - T / 2), T, sd, wE[0], y0, P, true, true);
      }
    }
    // gables + roof
    P(ASH, "oklch(0.86 0.012 285)", 0.92);
    for (const sd of [-1, 1]) prism3(ctx, [sd * W, top, -Dz], [sd * W, top, Dz], [sd * W, Rt, 0], [-sd * T, 0, 0]);
    P(SLATE, "oklch(0.68 0.03 285)", 0.85);
    const ey = top - ov * (rise / Dz), th = 0.28;
    for (const sd of [-1, 1]) {
      const P8 = []; for (let i = 0; i < 8; i++) { const x = i & 1 ? W + 0.5 : -W - 0.5, onEave = i & 4, z = onEave ? sd * (Dz + ov) : 0, y = (onEave ? ey : Rt) + (i & 2 ? th : 0); P8.push([x, y, z]); }
      hexa(ctx, P8);
      if (!far && !col) for (let k = 1; k < 9; k++) { const f = k / 9, z = sd * (Dz + ov) * f, y = Rt + (ey - Rt) * f + th; boxR(ctx, [0, y + 0.03, z], [2 * W + 1.0, 0.06, 0.32], { pitch: sd * Math.atan2(rise, Dz) / R }); }
    }
    if (!col) { P(IRON, "oklch(0.6 0.02 285)", 0.5, 0.6); boxR(ctx, [0, Rt + 0.32, 0], [2 * W + 1.1, 0.22, 0.4]); }
    if (far) return;
    // buttresses: two tiers stepping back, sloped caps
    P(ASH, "oklch(0.82 0.012 285)", 0.92);
    for (const sd of [-1, 1]) for (const x of [-W + 0.35, -2.2, 2.2, W - 0.35]) {
      const z0 = sd * Dz; box(ctx, x - 0.38, y0, Math.min(z0, z0 + sd * 1.15), x + 0.38, 3.2, Math.max(z0, z0 + sd * 1.15)); box(ctx, x - 0.32, 3.2, Math.min(z0, z0 + sd * 0.7), x + 0.32, top - 0.4, Math.max(z0, z0 + sd * 0.7));
      if (!col) { prism3(ctx, [x - 0.38, 3.2, z0 + sd * 1.15], [x - 0.38, 3.2, z0 + sd * 0.7], [x - 0.38, 3.75, z0 + sd * 0.7], [0.76, 0, 0]); prism3(ctx, [x - 0.32, top - 0.4, z0 + sd * 0.7], [x - 0.32, top - 0.4, z0], [x - 0.32, top + 0.5, z0], [0.64, 0, 0]); }
    }
    // floor, benches, table
    P(PLANK, "oklch(0.9 0.03 60)", 0.85); box(ctx, -W + T, 0.1, -Dz + T, W - T, y0 + 0.05, Dz - T);
    P(WOOD, "oklch(0.85 0.03 60)", 0.85);
    for (const z of [-1.25, 1.25]) { box(ctx, -3.6, y0 + 0.42, z - 0.2, 2.6, y0 + 0.5, z + 0.2); if (!col) for (const x of [-3.3, -0.5, 2.3]) box(ctx, x - 0.06, y0, z - 0.16, x + 0.06, y0 + 0.42, z + 0.16); }
    box(ctx, -3.6, y0 + 0.72, -0.5, 2.6, y0 + 0.8, 0.5); if (!col) for (const x of [-3.2, 2.2]) box(ctx, x - 0.08, y0, -0.3, x + 0.08, y0 + 0.72, 0.3);
    if (col) return;
    // tie beams, king posts, a sarking of boards under the slates
    for (const x of [-4, -1.3, 1.3, 4]) { box(ctx, x - 0.14, top - 0.3, -Dz + T, x + 0.14, top, Dz - T); box(ctx, x - 0.1, top, -0.1, x + 0.1, Rt - 0.3, 0.1); for (const sd of [-1, 1]) boxR(ctx, [x, top + rise * 0.45, sd * Dz * 0.45], [0.16, 0.16, Math.hypot(Dz * 0.9, rise * 0.9)], { pitch: sd * Math.atan2(rise, Dz) / R }); }
    P(PLANK, "oklch(0.7 0.03 60)", 0.9);
    for (const sd of [-1, 1]) quadN(ctx, [-W + T, top - 0.02, sd * (Dz - T) ], [W - T, top - 0.02, sd * (Dz - T)], [W - T, Rt - 0.05, 0], [-W + T, Rt - 0.05, 0], [0, -1, -sd * 0.5]);
    // warden's banners at the door and on the far wall, a candle wheel
    P(CLOTH, "oklch(0.55 0.1 300)", 0.95);
    for (const x of [-1.45, 1.45]) quadN(ctx, [x - 0.4, 2.0, -Dz - 0.05], [x + 0.4, 2.0, -Dz - 0.05], [x + 0.4, 4.6, -Dz - 0.05], [x - 0.4, 4.6, -Dz - 0.05], [0, 0, -1]);
    for (const x of [-1.8, 1.8]) quadN(ctx, [x - 0.5, 1.6, Dz - T - 0.03], [x + 0.5, 1.6, Dz - T - 0.03], [x + 0.5, 4.6, Dz - T - 0.03], [x - 0.5, 4.6, Dz - T - 0.03], [0, 0, -1]);
    P(null, "oklch(0.8 0.12 85)", 0.4, 0.8); G([1.5, 0.5, 2.6]); for (const x of [-1.45, 1.45]) rune(ctx, [x, 3.6, -Dz - 0.08], 9 + x * 3, 0, 1.2); G(null);
    P(IRON, "oklch(0.55 0.02 60)", 0.5, 0.7); cyl(ctx, -0.5, 3.9, 0, 1.0, 1.0, 0.08, 12, false); cyl(ctx, -0.5, 3.9, 0, 0.92, 0.92, 0.08, 12, false); cyl(ctx, -0.5, 3.98, 0, 0.02, 0.02, top - 3.98, 4, false);
    ctx.albedo(null); ctx.color("oklch(0.95 0.05 85)"); G([4, 2.4, 0.9]); for (let i = 0; i < 8; i++) { const q = i * Math.PI / 4; box(ctx, -0.5 + Math.cos(q) * 0.96 - 0.03, 3.98, Math.sin(q) * 0.96 - 0.03, -0.5 + Math.cos(q) * 0.96 + 0.03, 4.16, Math.sin(q) * 0.96 + 0.03); } G(null);
  },
  obelisk(ctx, p, far, col, P, G) {
    const y0 = 0.6, y1 = 6.0, b0 = 0.45, b1 = 0.3, half = (y) => b0 + (b1 - b0) * (y - y0) / (y1 - y0);
    P(ASH, "oklch(0.78 0.015 285)", 0.92);
    box(ctx, -0.85, -1.2, -0.85, 0.85, 0.3, 0.85); box(ctx, -0.62, 0.3, -0.62, 0.62, y0, 0.62);
    const P8 = []; for (let i = 0; i < 8; i++) { const y = i & 2 ? y1 : y0, hh = half(y); P8.push([i & 1 ? hh : -hh, y, i & 4 ? hh : -hh]); } hexa(ctx, P8);
    if (col) return;
    for (const [a, c] of [[[-b1, -b1], [b1, -b1]], [[b1, -b1], [b1, b1]], [[b1, b1], [-b1, b1]], [[-b1, b1], [-b1, -b1]]]) triN(ctx, [a[0], y1, a[1]], [c[0], y1, c[1]], [0, y1 + 0.85, 0], [(a[0] + c[0]) / 2, 0.4, (a[1] + c[1]) / 2]);
    if (far) return;
    box(ctx, -0.5, y1 - 0.1, -0.5, 0.5, y1, 0.5);
    P(null, "oklch(0.72 0.15 300)", 0.25); G([1.8, 0.55, 3.0]);
    for (let f = 0; f < 4; f++) for (let i = 0; i < 5; i++) { const y = 1.5 + i * 0.85, d = half(y) + 0.015, yaw = f * 90, a = yaw * R; rune(ctx, [-Math.sin(a) * d, y, -Math.cos(a) * d], f * 10 + i, yaw, 0.85); }
    G([3, 1.6, 4]); P(null, "oklch(0.85 0.12 305)", 0.1);
    crystal1(ctx, [0, y1 + 1.15, 0], [0, 1, 0], 0.16, 0.55, 4); crystal1(ctx, [0, y1 + 1.15, 0], [0, -1, 0], 0.16, 0.3, 4); G(null);
  },
  floatrock(ctx, p, far, col, P, G) {
    if (col) return;
    const r = p.r ?? 3, q = rng((p.s ?? 1) * 17 + 5), seg = far ? 7 : 12;
    const rings = [[0.12, 1.0], [-0.45, 0.82], [-1.1, 0.5], [-1.7, 0.24]].map(([y, rr], k) => { const o = []; for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2, j = 0.78 + q() * 0.4; o.push([Math.cos(a) * r * rr * j, y * r + (q() - 0.5) * 0.25 * r * (k ? 1 : 0.4), Math.sin(a) * r * rr * j]); } return o; });
    const tip = [(q() - 0.5) * r * 0.3, -2.4 * r, (q() - 0.5) * r * 0.3], cap = [0, 0.3 * r, 0];
    P(VGROUND, "oklch(0.86 0.04 300)", 0.95);
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; triN(ctx, cap, rings[0][i], rings[0][j], [0, 1, 0]); }
    P(ROCK, "oklch(0.62 0.03 290)", 0.95);
    for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < seg; i++) { const j = (i + 1) % seg, A = rings[k][i], B = rings[k][j], C = rings[k + 1][j], Dd = rings[k + 1][i]; quadN(ctx, A, B, C, Dd, [(A[0] + C[0]) / 2, -0.2, (A[2] + C[2]) / 2]); }
    const L = rings[rings.length - 1]; for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; triN(ctx, L[i], L[j], tip, [(L[i][0] + L[j][0]) / 2, -0.5, (L[i][2] + L[j][2]) / 2]); }
    if (far) return;
    const n = 2 + Math.floor(q() * 3);
    for (let i = 0; i < n; i++) { const a = q() * Math.PI * 2, d = q() * r * 0.55, l = r * (0.25 + q() * 0.35); P(null, "oklch(0.74 0.15 300)", 0.12, 0.1); G("oklch(0.55 0.23 300)"); crystal1(ctx, [Math.cos(a) * d, 0.15 * r, Math.sin(a) * d], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4], l * 0.16, l, 6); }
    P(null, "oklch(0.74 0.15 300)", 0.12, 0.1); G("oklch(0.6 0.23 300)"); crystal1(ctx, [tip[0], tip[1] + 0.3 * r, tip[2]], [0.1, -1, 0.05], r * 0.09, r * 0.7, 6); G(null);
  },
  brazier(ctx, p, far, col, P, G) {
    P(ASH, "oklch(0.8 0.012 285)", 0.92);
    box(ctx, -0.5, -0.8, -0.5, 0.5, 0.2, 0.5); cyl(ctx, 0, 0.2, 0, 0.32, 0.26, 0.75, col || far ? 6 : 10);
    P(IRON, "oklch(0.6 0.02 60)", 0.5, 0.7); cyl(ctx, 0, 0.92, 0, 0.22, 0.52, 0.34, col || far ? 6 : 12, true);
    if (col || far) return;
    cyl(ctx, 0, 1.24, 0, 0.55, 0.55, 0.05, 12, false);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; boxR(ctx, [Math.cos(a) * 0.5, 1.33, Math.sin(a) * 0.5], [0.05, 0.22, 0.05], { yaw: -a / R }); }
    ctx.albedo(null); ctx.color("oklch(0.45 0.08 40)"); G([3.2, 1.1, 0.25]); for (let i = 0; i < 7; i++) blob(ctx, Math.cos(i * 2.4) * 0.25, 1.2, Math.sin(i * 2.4) * 0.25, 0.13, 0.07, 0.12, i, 0.3, 3, 5); G(null);
  },
};
function build(ctx, far, col) {
  const p = ctx.params || {}, k = K[p.kind] || K.crystal;
  const P = (tex, c, r = 0.9, m = 0) => { if (col) return; ctx.albedo(tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); };
  const G = (e) => { if (col) return; if (e == null) ctx.emissive(null); else if (Array.isArray(e)) ctx.emissive(...e); else ctx.emissive(e); };
  k(ctx, p, far, col, P, G);
}
export function geometry(ctx) { ctx.flat(); build(ctx, (ctx.lod || 1) >= 4, false); }
export function collider(ctx) { if ((ctx.params || {}).kind === "floatrock") return null; build(ctx, false, true); }
