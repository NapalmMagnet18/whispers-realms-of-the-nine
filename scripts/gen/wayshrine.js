// THE WAYSHRINE: the backdrop behind character select / create (place character-creation-land).
// One generator, parts by params.part: ground | dais | apse | lantern | banner | candles | pines.
// Frame: θ is measured from +X toward +Z (the camera looks +X; +Z is screen right).
import { quadN, triN, box, boxR, cyl, blob } from "./shape.js";
const D = Math.PI / 180;
const STONE = "cdn/texture-mossy-fieldstone-wall.png";
const FLAGS = "cdn/texture-mossy-fieldstone-flagstones.png";
const FLOOR = "cdn/texture-dark-mossy-forest-floor.png";
const OAK = "cdn/texture-dark-oak-timber-beam.png";
const IRON = "cdn/texture-hammered-black-iron.png";
const CLOTH = "cdn/texture-deep-red-woven-wool-cloth.png";
const hash = (i, s = 0) => { const n = Math.sin(i * 127.1 + s * 311.7 + 17.3) * 43758.5453; return n - Math.floor(n); };

export function geometry(ctx) {
  ctx.flat();
  const p = ctx.params || {};
  const f = PARTS[p.part];
  if (f) f(ctx, p);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.part === "ground") { quadN(ctx, [-130, 0, -130], [130, 0, -130], [130, 0, 130], [-130, 0, 130], [0, 1, 0]); return; }
  if (p.part === "dais") return daisCollider(ctx);
  return null;
}

// ---------- helpers ----------
// a closed annular block between radii r0..r1, angles a0..a1 (rad), heights y0..y1; bevel on the top edges
function sector(ctx, r0, r1, a0, a1, y0, y1, o = {}) {
  const b = o.bevel || 0, seg = o.seg || Math.max(1, Math.ceil((a1 - a0) / (6 * D)));
  const P = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
  const hasIn = r0 > 0.001, yb = y1 - b, ri = hasIn ? r0 + b : 0;
  for (let i = 0; i < seg; i++) {
    const p0 = a0 + ((a1 - a0) * i) / seg, p1 = a0 + ((a1 - a0) * (i + 1)) / seg, m = (p0 + p1) / 2, n = [Math.cos(m), 0, Math.sin(m)];
    quadN(ctx, P(r1, p0, y0), P(r1, p1, y0), P(r1, p1, yb), P(r1, p0, yb), n);
    if (b > 0) quadN(ctx, P(r1, p0, yb), P(r1, p1, yb), P(r1 - b, p1, y1), P(r1 - b, p0, y1), [n[0], 1, n[2]]);
    if (hasIn) {
      quadN(ctx, P(r0, p0, y0), P(r0, p1, y0), P(r0, p1, yb), P(r0, p0, yb), [-n[0], 0, -n[2]]);
      if (b > 0) quadN(ctx, P(r0, p0, yb), P(r0, p1, yb), P(ri, p1, y1), P(ri, p0, y1), [-n[0], 1, -n[2]]);
      quadN(ctx, P(ri, p0, y1), P(r1 - b, p0, y1), P(r1 - b, p1, y1), P(ri, p1, y1), [0, 1, 0]);
    } else triN(ctx, [0, y1, 0], P(r1 - b, p0, y1), P(r1 - b, p1, y1), [0, 1, 0]);
  }
  if (hasIn && !o.noEnds) for (const [a, s] of [[a0, -1], [a1, 1]]) {
    const n = [-Math.sin(a) * s, 0, Math.cos(a) * s];
    quadN(ctx, P(r0, a, y0), P(r1, a, y0), P(r1, a, yb), P(r0, a, yb), n);
    if (b > 0) quadN(ctx, P(r0, a, yb), P(r1, a, yb), P(r1 - b, a, y1), P(ri, a, y1), n);
  }
}
// a ring of separate stones with gaps, top jitter
function stoneRing(ctx, r0, r1, y0, y1, count, o = {}) {
  const gap = (o.gap || 0.025) / ((r0 + r1) / 2), off = o.off || 0;
  for (let k = 0; k < count; k++) {
    if (o.drop && hash(k, o.seed || 1) < o.drop) continue;
    const j = (hash(k, (o.seed || 1) + 5) - 0.5) * 0.25;
    const a0 = off + ((k + j * 0.5) / count) * 2 * Math.PI + gap / 2, a1 = off + ((k + 1 + (k === count - 1 ? 0 : j * 0.5)) / count) * 2 * Math.PI - gap / 2;
    const top = y1 + (o.jit ? (hash(k, (o.seed || 1) + 9) - 0.5) * o.jit : 0);
    sector(ctx, r0, r1, a0, a1, y0, top, { bevel: o.bevel ?? 0.02 });
  }
}
// a beam from a to b, square section w × w2
function beam(ctx, a, b, w, w2 = w) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
  const roll = Math.asin(d[1] / L) / D, yaw = Math.atan2(-d[2], d[0]) / D;
  boxR(ctx, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [L, w, w2], { roll, yaw });
}
// square frustum: half-width b at y0, t at y0+h
function frustum(ctx, x, y0, z, b, t, h) {
  const B = [[-b, -b], [b, -b], [b, b], [-b, b]], T = [[-t, -t], [t, -t], [t, t], [-t, t]];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, n = [(B[i][0] + B[j][0]) / 2, 0.3, (B[i][1] + B[j][1]) / 2];
    quadN(ctx, [x + B[i][0], y0, z + B[i][1]], [x + B[j][0], y0, z + B[j][1]], [x + T[j][0], y0 + h, z + T[j][1]], [x + T[i][0], y0 + h, z + T[i][1]], n);
  }
  if (t > 0.001) quadN(ctx, [x - t, y0 + h, z - t], [x + t, y0 + h, z - t], [x + t, y0 + h, z + t], [x - t, y0 + h, z + t], [0, 1, 0]);
}
// a lathe: profile [[r, y], …] around (x, y0, z)
function lathe(ctx, x, y0, z, prof, seg = 6) {
  for (let k = 0; k < prof.length - 1; k++) for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * 2 * Math.PI, a1 = ((i + 1) / seg) * 2 * Math.PI, am = (a0 + a1) / 2;
    const [r0, h0] = prof[k], [r1, h1] = prof[k + 1];
    const P = (r, h, a) => [x + Math.cos(a) * r, y0 + h, z + Math.sin(a) * r];
    const n = [Math.cos(am), (r0 - r1) * 0.5, Math.sin(am)];
    if (r0 < 1e-4) triN(ctx, P(0, h0, 0), P(r1, h1, a0), P(r1, h1, a1), n);
    else if (r1 < 1e-4) triN(ctx, P(r0, h0, a0), P(r0, h0, a1), P(0, h1, 0), n);
    else quadN(ctx, P(r0, h0, a0), P(r0, h0, a1), P(r1, h1, a1), P(r1, h1, a0), n);
  }
}
function moss(ctx, x, y, z, s, seed) {
  const t = hash(seed, 3);
  ctx.color(`oklch(${(0.4 + t * 0.12).toFixed(3)} ${(0.08 + t * 0.04).toFixed(3)} ${(128 + t * 16).toFixed(1)})`);
  blob(ctx, x, y, z, s, s * 0.22, s * (0.7 + hash(seed, 4) * 0.5), seed, 0.35, 4, 7);
}
function gold(ctx, bright = 1) {
  ctx.albedo(null); ctx.color("oklch(0.82 0.13 82)"); ctx.metalness(0.85); ctx.roughness(0.32);
  ctx.emissive(0.32 * bright, 0.2 * bright, 0.05 * bright);
}

// ---------- parts ----------
const PARTS = {
  // the court: a flagstone ring around the dais on a mossy forest floor
  ground(ctx, p) {
    const L = ctx.lod || 1;
    ctx.albedo(FLOOR); ctx.color("oklch(0.9 0.03 120)"); ctx.roughness(1);
    quadN(ctx, [-130, -0.01, -130], [130, -0.01, -130], [130, -0.01, 130], [-130, -0.01, 130], [0, 1, 0]);
    ctx.albedo(null); ctx.color("oklch(0.25 0.025 70)");
    cyl(ctx, 0, -0.012, 0, 7.4, 7.4, 0.012, 40, true);
    if (L > 3) return;
    ctx.albedo(FLAGS); ctx.color("oklch(0.93 0.02 95)"); ctx.roughness(0.95);
    const R = [2.65, 3.5, 4.4, 5.35, 6.35, 7.35];
    for (let i = 0; i < R.length - 1; i++) {
      const rm = (R[i] + R[i + 1]) / 2, count = Math.round((2 * Math.PI * rm) / 0.95);
      stoneRing(ctx, R[i] + 0.03, R[i + 1] - 0.03, -0.01, 0.035, count, { seed: 20 + i, jit: 0.025, off: i * 0.21, gap: 0.05, drop: i >= 3 ? 0.18 + i * 0.05 : 0.03, bevel: L > 1 ? 0 : 0.015 });
    }
    if (L > 2) return;
    for (let k = 0; k < 40; k++) { const a = hash(k, 40) * 2 * Math.PI, r = 2.8 + hash(k, 41) * 4.5; moss(ctx, Math.cos(a) * r, 0.03, Math.sin(a) * r, 0.18 + hash(k, 42) * 0.35, k + 100); }
  },

  // the dais: three tiers of mossy fieldstone, the top exactly at y 1.14, nine gold runes inlaid
  dais(ctx, p) {
    const L = ctx.lod || 1, TOP = 1.14;
    ctx.albedo(null); ctx.color("oklch(0.24 0.02 60)"); ctx.roughness(1);
    cyl(ctx, 0, 0, 0, 2.72, 2.72, 0.36, 32); cyl(ctx, 0, 0, 0, 2.36, 2.36, 0.74, 32); cyl(ctx, 0, 0, 0, 1.97, 1.97, TOP - 0.012, 32);
    ctx.albedo(STONE); ctx.color("oklch(0.93 0.02 90)"); ctx.roughness(0.95);
    const bv = L > 1 ? 0 : 0.025;
    stoneRing(ctx, 2.34, 2.76, 0, 0.38, L > 2 ? 10 : 20, { seed: 3, jit: 0.03, bevel: bv });
    stoneRing(ctx, 1.95, 2.40, 0.3, 0.76, L > 2 ? 8 : 16, { seed: 4, jit: 0.025, off: 0.15, bevel: bv });
    ctx.albedo(FLAGS); ctx.color("oklch(0.95 0.02 95)");
    stoneRing(ctx, 1.3, 2.0, TOP - 0.14, TOP, L > 2 ? 7 : 14, { seed: 5, bevel: bv, off: 0.1 });
    stoneRing(ctx, 0.62, 1.28, TOP - 0.14, TOP, L > 2 ? 5 : 9, { seed: 6, bevel: bv, off: 0.3 });
    sector(ctx, 0, 0.6, 0, 2 * Math.PI, TOP - 0.14, TOP, { bevel: bv, seg: 16 });
    if (L > 3) return;
    // two hammered-gold inlay bands and the nine runes between them
    gold(ctx, 1);
    for (const r of [1.6, 1.86]) sector(ctx, r, r + 0.03, 0, 2 * Math.PI, TOP, TOP + 0.004, { seg: 48, noEnds: true });
    const G = [
      [[0, -1, 0, 1], [0, 0.2, 0.6, 0.8], [0, -0.2, -0.6, -0.8]], [[-0.6, -1, -0.6, 1], [-0.6, 1, 0.6, 0.3], [0.6, 0.3, -0.6, -0.2]],
      [[0, -1, 0, 1], [-0.6, 0.5, 0.6, 0.5], [-0.5, -0.5, 0.5, -0.5]], [[-0.6, 1, 0.6, -1], [0.6, 1, -0.6, -1], [0, -1, 0, -0.2]],
      [[0, -1, 0, 1], [0, 1, 0.6, 0.5], [0, 1, -0.6, 0.5]], [[-0.6, -1, -0.6, 1], [0.6, -1, 0.6, 1], [-0.6, 0.6, 0.6, -0.6]],
      [[0, 1, 0.7, 0], [0.7, 0, 0, -1], [0, -1, -0.7, 0], [-0.7, 0, 0, 1]], [[0, -1, 0, 1], [-0.6, 1, 0.6, 1], [-0.4, -0.2, 0.4, 0.2]],
      [[-0.6, -1, 0, 1], [0, 1, 0.6, -1], [-0.35, -0.1, 0.35, -0.1]],
    ];
    for (let i = 0; i < 9; i++) {
      const a = (20 + i * 40) * D, r = 1.73, c = [Math.cos(a) * r, TOP, Math.sin(a) * r];
      const T = [-Math.sin(a), 0, Math.cos(a)], V = [Math.cos(a), 0, Math.sin(a)];
      const at = (u, v, y) => [c[0] + T[0] * u + V[0] * v, y, c[2] + T[2] * u + V[2] * v];
      // the dark iron seat of the rune
      ctx.albedo(IRON); ctx.color("oklch(0.75 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.5); ctx.emissive(null);
      for (let k = 0; k < 8; k++) { const b0 = (k / 8) * 2 * Math.PI, b1 = ((k + 1) / 8) * 2 * Math.PI; triN(ctx, at(0, 0, TOP + 0.003), at(Math.cos(b0) * 0.1, Math.sin(b0) * 0.1, TOP + 0.003), at(Math.cos(b1) * 0.1, Math.sin(b1) * 0.1, TOP + 0.003), [0, 1, 0]); }
      // the glyph burns gold
      ctx.albedo(null); ctx.color("oklch(0.9 0.12 80)"); ctx.metalness(0); ctx.roughness(0.4); ctx.emissive(3.4, 2.0, 0.6);
      const s = 0.062, wd = 0.011;
      for (const [u0, v0, u1, v1] of G[i]) {
        const du = (u1 - u0) * s, dv = (v1 - v0) * s, l = Math.hypot(du, dv) || 1, nu = (-dv / l) * wd, nv = (du / l) * wd;
        quadN(ctx, at(u0 * s + nu, v0 * s + nv, TOP + 0.006), at(u1 * s + nu, v1 * s + nv, TOP + 0.006), at(u1 * s - nu, v1 * s - nv, TOP + 0.006), at(u0 * s - nu, v0 * s - nv, TOP + 0.006), [0, 1, 0]);
      }
      ctx.emissive(null);
    }
    if (L > 2) return;
    ctx.albedo(null); ctx.metalness(0); ctx.roughness(1);
    for (let k = 0; k < 26; k++) {
      const a = hash(k, 60) * 2 * Math.PI, onLow = k % 2 === 0, r = onLow ? 2.42 + hash(k, 61) * 0.28 : 2.02 + hash(k, 61) * 0.3;
      moss(ctx, Math.cos(a) * r, onLow ? 0.38 : 0.76, Math.sin(a) * r, 0.1 + hash(k, 62) * 0.16, k + 300);
    }
  },

  // the ruined apse: a half-ring wall open toward −X, lancet windows, a broken half-dome, dark oak ribs, ivy
  apse(ctx, p) {
    const L = ctx.lod || 1, R0 = 4.7, R1 = 5.35, SPR = 5.25, STEP = L > 2 ? 2.5 : 1.25;
    const WIN = [{ t: 0, w: 1.5, sill: 1.65, spr: 3.5, apex: 4.6 }, { t: 46, w: 1.3, sill: 1.75, spr: 3.45, apex: 4.4 }];
    const PIER = -70;
    const top = (t, i) => {
      if (t > -32.5) return SPR;
      let h;
      if (t > -41) h = 5.2 - (-32.5 - t) * 0.2;
      else if (t > -63) h = 2.0 + hash(i, 7) * 1.1;
      else if (t > -77) h = 3.6 + hash(i, 8) * 0.9;
      else h = 1.2 + hash(i, 9) * 1.2;
      return Math.round(h / 0.3) * 0.3 + 0.05;
    };
    const N = Math.round(200 / STEP), tops = [];
    ctx.albedo(STONE); ctx.color("oklch(0.92 0.02 85)"); ctx.roughness(0.95);
    for (let i = 0; i < N; i++) {
      const t0 = -100 + i * STEP, t1 = t0 + STEP, tm = t0 + STEP / 2, h = top(tm, Math.floor(tm / 2.5));
      tops.push(h);
      if (Math.abs(tm - PIER) < 6) continue;
      let hole = null;
      for (const W of WIN) {
        const s = (tm - W.t) * D * ((R0 + R1) / 2), hw = W.w / 2;
        if (Math.abs(s) < hw) { const x = Math.abs(s), arch = Math.sqrt(Math.max(0, 4 * hw * hw - (x + hw) * (x + hw))) / (Math.sqrt(3) * hw); hole = [W.sill, W.spr + (W.apex - W.spr) * arch]; }
      }
      const a0 = t0 * D, a1 = t1 * D;
      if (!hole) sector(ctx, R0, R1, a0, a1, 0.5, h, { seg: 1 });
      else { sector(ctx, R0, R1, a0, a1, 0.5, hole[0], { seg: 1 }); if (hole[1] < h) sector(ctx, R0, R1, a0, a1, hole[1], h, { seg: 1 }); }
    }
    // plinth, the sill course and the cornice run where the wall still stands
    sector(ctx, R0 - 0.18, R1 + 0.12, -100 * D, 100 * D, 0, 0.55, { bevel: 0.04, seg: 40 });
    const runs = (min) => { const out = []; let s = -1; for (let i = 0; i <= N; i++) { const ok = i < N && tops[i] >= min && Math.abs(-100 + (i + 0.5) * STEP - PIER) >= 6; if (ok && s < 0) s = i; if (!ok && s >= 0) { out.push([-100 + s * STEP, -100 + i * STEP]); s = -1; } } return out; };
    for (const [t0, t1] of runs(1.8)) sector(ctx, R0 - 0.1, R0 + 0.02, t0 * D, t1 * D, 1.42, 1.6, { bevel: L > 1 ? 0 : 0.03 });
    for (const [t0, t1] of runs(SPR)) sector(ctx, R0 - 0.2, R0 + 0.02, t0 * D, t1 * D, 4.95, SPR, { bevel: L > 1 ? 0 : 0.04 });
    for (const W of WIN) {
      const hw = (W.w / 2 + 0.1) / R0;
      sector(ctx, R0 - 0.12, R1 + 0.05, W.t * D - hw, W.t * D + hw, W.sill - 0.08, W.sill, { bevel: 0.02 });
      const mw = 0.065 / R0;
      sector(ctx, R0 + 0.12, R1 - 0.12, W.t * D - mw, W.t * D + mw, W.sill, W.spr + 0.25, {});
    }
    // engaged columns on the standing wall
    for (const t of [-30, 23, 70]) {
      const x = Math.cos(t * D) * (R0 - 0.12), z = Math.sin(t * D) * (R0 - 0.12);
      cyl(ctx, x, 0.55, z, 0.3, 0.27, 0.22, 10); cyl(ctx, x, 0.77, z, 0.2, 0.18, 4.0, 12); boxR(ctx, [x, 4.86, z], [0.5, 0.18, 0.5], { yaw: -t });
    }
    // the surviving free pier on the ruined side, carrying banner one on an oak bracket
    { const t = PIER, c = (r) => [Math.cos(t * D) * r, 0, Math.sin(t * D) * r];
      const q = c(5.0); boxR(ctx, [q[0], 2.3, q[2]], [1.0, 4.6, 1.0], { yaw: -t }); boxR(ctx, [q[0] + 0.05, 5.35, q[2]], [0.84, 1.5, 0.82], { yaw: -t + 4 });
      boxR(ctx, [q[0], 4.68, q[2]], [1.12, 0.16, 1.12], { yaw: -t }); }
    // the broken half-dome over the standing wall
    const PH = L > 2 ? 15 : 7.5;
    for (let t = -32.5; t < 100; t += 5) {
      const k = Math.round(t / 5), fm = t < -20 ? 8 + hash(k, 11) * 10 : t < 42 ? 18 + hash(k, 12) * 32 : 8 + hash(k, 13) * 16;
      for (let f = 0; f + PH <= fm + 0.01; f += PH) {
        const S = (r, tt, ff) => [Math.cos(ff * D) * Math.cos(tt * D) * r, SPR + Math.sin(ff * D) * r, Math.cos(ff * D) * Math.sin(tt * D) * r];
        const ri = R0, ro = R1 - 0.12, tA = t, tB = t + 5, fA = f, fB = f + PH, tm = (tA + tB) / 2, fmid = (fA + fB) / 2;
        const U = [Math.cos(fmid * D) * Math.cos(tm * D), Math.sin(fmid * D), Math.cos(fmid * D) * Math.sin(tm * D)];
        quadN(ctx, S(ro, tA, fA), S(ro, tB, fA), S(ro, tB, fB), S(ro, tA, fB), U);
        quadN(ctx, S(ri, tA, fA), S(ri, tB, fA), S(ri, tB, fB), S(ri, tA, fB), [-U[0], -U[1], -U[2]]);
        const up = [-Math.sin(fB * D) * Math.cos(tm * D), Math.cos(fB * D), -Math.sin(fB * D) * Math.sin(tm * D)];
        quadN(ctx, S(ri, tA, fB), S(ro, tA, fB), S(ro, tB, fB), S(ri, tB, fB), up);
        quadN(ctx, S(ri, tA, fA), S(ro, tA, fA), S(ro, tA, fB), S(ri, tA, fB), [Math.sin(tA * D), 0, -Math.cos(tA * D)]);
        quadN(ctx, S(ri, tB, fA), S(ro, tB, fA), S(ro, tB, fB), S(ri, tB, fB), [-Math.sin(tB * D), 0, Math.cos(tB * D)]);
      }
    }
    // rubble from the fallen wall
    if (L < 4) for (let k = 0; k < 16; k++) {
      const t = -95 + hash(k, 20) * 58, r = 3.7 + hash(k, 21) * 3.2, s = 0.18 + hash(k, 22) * 0.32;
      blob(ctx, Math.cos(t * D) * r, s * 0.35, Math.sin(t * D) * r, s, s * 0.6, s * 0.85, k + 50, 0.3, 4, 6);
    }
    // dark oak: the ring beam on the cornice, the ribs of the dome, one fallen rafter
    ctx.albedo(OAK); ctx.color("oklch(0.9 0.02 60)"); ctx.roughness(0.85);
    sector(ctx, R0 - 0.34, R0 - 0.02, -32.5 * D, 100 * D, SPR, SPR + 0.24, { seg: 24 });
    for (const [t, fe] of [[-30, 90], [23, 82], [70, 36], [46, 20]]) {
      const T = [-Math.sin(t * D), 0, Math.cos(t * D)], hw = 0.12, rin = R0 - 0.44, rout = R0 - 0.06;
      const st = (f, r, s) => { const U = [Math.cos(f * D) * Math.cos(t * D), Math.sin(f * D), Math.cos(f * D) * Math.sin(t * D)]; return [U[0] * r + T[0] * hw * s, SPR + U[1] * r, U[2] * r + T[2] * hw * s]; };
      const steps = Math.max(2, Math.round(fe / (L > 2 ? 15 : 6)));
      for (let j = 0; j < steps; j++) {
        const f0 = (fe * j) / steps, f1 = (fe * (j + 1)) / steps, fm = (f0 + f1) / 2;
        const U = [Math.cos(fm * D) * Math.cos(t * D), Math.sin(fm * D), Math.cos(fm * D) * Math.sin(t * D)];
        quadN(ctx, st(f0, rin, -1), st(f0, rin, 1), st(f1, rin, 1), st(f1, rin, -1), [-U[0], -U[1], -U[2]]);
        quadN(ctx, st(f0, rout, -1), st(f0, rout, 1), st(f1, rout, 1), st(f1, rout, -1), U);
        quadN(ctx, st(f0, rin, 1), st(f0, rout, 1), st(f1, rout, 1), st(f1, rin, 1), T);
        quadN(ctx, st(f0, rin, -1), st(f0, rout, -1), st(f1, rout, -1), st(f1, rin, -1), [-T[0], 0, -T[2]]);
      }
      const ue = [-Math.sin(fe * D) * Math.cos(t * D), Math.cos(fe * D), -Math.sin(fe * D) * Math.sin(t * D)];
      quadN(ctx, st(fe, rin, -1), st(fe, rin, 1), st(fe, rout, 1), st(fe, rout, -1), ue);
    }
    { const a = -36 * D, b = -53 * D; beam(ctx, [Math.cos(a) * 4.45, 4.5, Math.sin(a) * 4.45], [Math.cos(b) * 3.0, 0.14, Math.sin(b) * 3.0], 0.24, 0.2);
      beam(ctx, [Math.cos(-46 * D) * 3.9, 0.12, Math.sin(-46 * D) * 3.9], [Math.cos(-62 * D) * 4.2, 0.12, Math.sin(-62 * D) * 4.2], 0.2, 0.2); }
    // the banner bracket on the pier
    { const t = PIER * D; beam(ctx, [Math.cos(t) * 4.52, 5.55, Math.sin(t) * 4.52], [Math.cos(t) * 3.95, 5.55, Math.sin(t) * 3.95], 0.14);
      beam(ctx, [Math.cos(t) * 4.52, 5.0, Math.sin(t) * 4.52], [Math.cos(t) * 4.05, 5.5, Math.sin(t) * 4.05], 0.08); }
    if (L > 2) return;
    // ivy: strands draping down the inner face of the standing wall, and creeping over the broken tops
    ctx.albedo(null); ctx.metalness(0); ctx.roughness(0.8);
    const leaf = (c, n, s, k) => {
      const tt = hash(k, 31); ctx.color(`oklch(${(0.38 + tt * 0.15).toFixed(3)} ${(0.09 + tt * 0.05).toFixed(3)} ${(128 + tt * 20).toFixed(1)})`);
      const ang = hash(k, 32) * Math.PI * 2, e1 = Math.abs(n[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      const a = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]], la = Math.hypot(...a);
      const A = a.map((v) => v / la), B = [n[1] * A[2] - n[2] * A[1], n[2] * A[0] - n[0] * A[2], n[0] * A[1] - n[1] * A[0]];
      const u = A.map((v, i) => (v * Math.cos(ang) + B[i] * Math.sin(ang)) * s), w = A.map((v, i) => (-v * Math.sin(ang) + B[i] * Math.cos(ang)) * s * 0.62);
      const tip = n.map((v) => v * s * 0.35);
      quadN(ctx, [c[0] + u[0] + tip[0], c[1] + u[1] + tip[1], c[2] + u[2] + tip[2]], [c[0] + w[0], c[1] + w[1], c[2] + w[2]], [c[0] - u[0], c[1] - u[1], c[2] - u[2]], [c[0] - w[0], c[1] - w[1], c[2] - w[2]], n);
    };
    let k = 0;
    for (let sIdx = 0; sIdx < 24; sIdx++) {
      let t = -29 + hash(sIdx, 33) * 128;
      if (Math.abs(t) < 10 || Math.abs(t - 46) < 9) continue;
      let y = SPR - 0.05; const len = 1.0 + hash(sIdx, 34) * 2.8;
      while (y > SPR - len) {
        for (let q = 0; q < 2; q++) {
          const tq = t + (hash(k, 35) - 0.5) * 2.4, r = R0 - 0.21 - hash(k, 36) * 0.05;
          const yy = y > 4.9 ? y : y;
          const rr = yy > 4.95 ? R0 - 0.23 : R0 - 0.02 - hash(k, 36) * 0.04;
          leaf([Math.cos(tq * D) * rr, yy, Math.sin(tq * D) * rr], [-Math.cos(tq * D), 0.15, -Math.sin(tq * D)], 0.07 + hash(k, 37) * 0.06, k++);
          void r;
        }
        y -= 0.09; t += (hash(k, 38) - 0.5) * 1.2;
      }
    }
    for (let i = 0; i < N; i++) {
      const tm = -100 + (i + 0.5) * STEP;
      if (tm > -32.5 || Math.abs(tm - PIER) < 6 || hash(i, 39) < 0.45) continue;
      for (let q = 0; q < 4; q++) { const tq = tm + (hash(k, 40) - 0.5) * STEP, r = R0 + hash(k, 41) * (R1 - R0); leaf([Math.cos(tq * D) * r, tops[i] + 0.02, Math.sin(tq * D) * r], [0, 1, 0], 0.08 + hash(k, 42) * 0.05, k++); }
    }
  },

  // a tall hammered-iron lantern stand, its glass glowing
  lantern(ctx, p) {
    const L = ctx.lod || 1;
    ctx.albedo(IRON); ctx.color("oklch(0.9 0.01 60)"); ctx.metalness(0.65); ctx.roughness(0.5);
    box(ctx, -0.3, 0, -0.3, 0.3, 0.07, 0.3); box(ctx, -0.22, 0.07, -0.22, 0.22, 0.15, 0.22);
    frustum(ctx, 0, 0.15, 0, 0.15, 0.055, 0.5);
    box(ctx, -0.035, 0.65, -0.035, 0.035, 2.82, 0.035);
    for (const y of [0.65, 1.5, 2.3, 2.74]) box(ctx, -0.06, y, -0.06, 0.06, y + 0.05, 0.06);
    if (L < 3) for (let k = 0; k < 6; k++) boxR(ctx, [0, 1.9 + k * 0.05, 0], [0.085, 0.04, 0.085], { yaw: k * 15 });
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) beam(ctx, [0, 2.45, 0], [sx * 0.15, 2.8, sz * 0.15], 0.025);
    box(ctx, -0.2, 2.8, -0.2, 0.2, 2.85, 0.2);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) box(ctx, sx * 0.165 - 0.02, 2.85, sz * 0.165 - 0.02, sx * 0.165 + 0.02, 3.38, sz * 0.165 + 0.02);
    box(ctx, -0.22, 3.38, -0.22, 0.22, 3.42, 0.22);
    frustum(ctx, 0, 3.42, 0, 0.25, 0.03, 0.26);
    cyl(ctx, 0, 3.68, 0, 0.03, 0.03, 0.05, 6); blob(ctx, 0, 3.76, 0, 0.04, 0.045, 0.04, 3, 0.1, 4, 6);
    for (let k = 0; k < 10; k++) { const a0 = (k / 10) * 2 * Math.PI, a1 = ((k + 1) / 10) * 2 * Math.PI; beam(ctx, [Math.cos(a0) * 0.06, 3.88 + Math.sin(a0) * 0.06, 0], [Math.cos(a1) * 0.06, 3.88 + Math.sin(a1) * 0.06, 0], 0.016); }
    // the cross bars over each pane
    for (const s of [-1, 1]) { box(ctx, -0.16, 3.1, s * 0.155 - 0.008, 0.16, 3.125, s * 0.155 + 0.008); box(ctx, s * 0.155 - 0.008, 3.1, -0.16, s * 0.155 + 0.008, 3.125, 0.16); }
    ctx.albedo(null); ctx.metalness(0); ctx.roughness(0.3); ctx.color("oklch(0.92 0.08 75)"); ctx.emissive(2.6, 1.55, 0.5);
    box(ctx, -0.148, 2.86, -0.148, 0.148, 3.37, 0.148);
    ctx.emissive(null);
  },

  // a deep-red banner with a gold lantern sigil; origin at its top centre, front faces −Z
  banner(ctx, p) {
    const L = ctx.lod || 1, w = p.w || 1, h = p.h || 2.6, notch = p.notch ?? 0.38, nx = L > 2 ? 4 : 8, ny = L > 2 ? 6 : 16, ph = p.phase || 0;
    const len = (u) => h - notch * (1 - Math.abs(2 * u - 1));
    const wave = (u, v) => 0.04 * Math.sin(u * 5.6 + v * 2.4 + ph) * (0.3 + v);
    const pt = (u, v, dz = 0) => [-w / 2 + u * w, -v * len(u), wave(u, v) + dz];
    ctx.albedo(CLOTH); ctx.color("oklch(0.93 0.03 30)"); ctx.roughness(0.92); ctx.metalness(0);
    ctx.smooth();
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) quadN(ctx, pt(i / nx, j / ny), pt((i + 1) / nx, j / ny), pt((i + 1) / nx, (j + 1) / ny), pt(i / nx, (j + 1) / ny), [0, 0, -1]);
    ctx.flat();
    gold(ctx, 0.8);
    const patch = (u0, u1, v0, v1, n = 4) => { for (let i = 0; i < n; i++) { const a = u0 + ((u1 - u0) * i) / n, b = u0 + ((u1 - u0) * (i + 1)) / n; quadN(ctx, pt(a, v0, -0.006), pt(b, v0, -0.006), pt(b, v1, -0.006), pt(a, v1, -0.006), [0, 0, -1]); } };
    const vstrip = (u0, u1) => { for (let j = 0; j < 8; j++) patch(u0, u1, 0.03 + (j * 0.93) / 8, 0.03 + ((j + 1) * 0.93) / 8, 1); };
    patch(0.02, 0.98, 0.03, 0.05, 6); vstrip(0.03, 0.06); vstrip(0.94, 0.97); patch(0.03, 0.97, 0.93, 0.96, 10);
    // the sigil: a lantern with a burning heart, rays of old light around it
    const P = (x, y) => { const u = (x + w / 2) / w; return pt(u, -y / len(u), -0.008); };
    const s = w * 0.56, cy = -h * 0.38;
    const S = (x, y) => P(x * s, cy + y * s);
    const seg = (x0, y0, x1, y1, wd) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx2 = (-dy / l) * wd / 2, ny2 = (dx / l) * wd / 2; quadN(ctx, S(x0 + nx2, y0 + ny2), S(x1 + nx2, y1 + ny2), S(x1 - nx2, y1 - ny2), S(x0 - nx2, y0 - ny2), [0, 0, -1]); };
    const fill = (pts) => { for (let i = 1; i < pts.length - 1; i++) triN(ctx, S(...pts[0]), S(...pts[i]), S(...pts[i + 1]), [0, 0, -1]); };
    for (let k = 0; k < 10; k++) { const a0 = (k / 10) * 2 * Math.PI, a1 = ((k + 1) / 10) * 2 * Math.PI; seg(Math.cos(a0) * 0.07, 0.43 + Math.sin(a0) * 0.07, Math.cos(a1) * 0.07, 0.43 + Math.sin(a1) * 0.07, 0.03); }
    fill([[-0.2, 0.25], [0.2, 0.25], [0.07, 0.36], [-0.07, 0.36]]);
    seg(-0.17, 0.25, 0.17, 0.25, 0.04); seg(-0.17, -0.25, 0.17, -0.25, 0.04); seg(-0.17, -0.27, -0.17, 0.27, 0.04); seg(0.17, -0.27, 0.17, 0.27, 0.04);
    fill([[-0.22, -0.25], [0.22, -0.25], [0.15, -0.34], [-0.15, -0.34]]);
    for (let k = 0; k < 8; k++) { if (k === 2) continue; const a = (k / 8) * 2 * Math.PI; seg(Math.cos(a) * 0.36, Math.sin(a) * 0.36 * 1.1, Math.cos(a) * 0.48, Math.sin(a) * 0.48 * 1.1, 0.025); }
    gold(ctx, 4);
    fill([[0, 0.16], [0.085, -0.02], [0, -0.18], [-0.085, -0.02]]);
    // tassels at the tails, the oak pole with iron finials, the cord
    gold(ctx, 0.8);
    for (const u of [0.02, 0.98]) { const b = pt(u, 1); lathe(ctx, b[0], b[1] - 0.14, b[2], [[0, 0], [0.03, 0.03], [0.022, 0.11], [0, 0.14]], 6); }
    ctx.emissive(null);
    ctx.albedo(OAK); ctx.color("oklch(0.9 0.02 60)"); ctx.roughness(0.85); ctx.metalness(0);
    boxR(ctx, [0, 0.03, 0], [w + 0.26, 0.055, 0.055]);
    ctx.albedo(IRON); ctx.color("oklch(0.85 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.5);
    for (const sx of [-1, 1]) blob(ctx, sx * (w / 2 + 0.15), 0.03, 0, 0.045, 0.045, 0.045, 5, 0.1, 4, 6);
    if (p.cord) { beam(ctx, [-w / 2 + 0.05, 0.05, 0], [0, p.cord, 0], 0.012); beam(ctx, [w / 2 - 0.05, 0.05, 0], [0, p.cord, 0], 0.012); }
  },

  // a cluster of beeswax candles, flames that burn in the bloom
  candles(ctx, p) {
    const n = p.n || 5, sp = p.spread || 0.24;
    for (let k = 0; k < n; k++) {
      const a = hash(k, 70 + (p.seed || 0)) * 2 * Math.PI, rr = k === 0 ? 0 : 0.06 + hash(k, 71 + (p.seed || 0)) * sp;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr, cr = 0.022 + hash(k, 72) * 0.022, ch = 0.08 + hash(k, 73 + (p.seed || 0)) * 0.26;
      ctx.albedo(null); ctx.color("oklch(0.9 0.035 85)"); ctx.roughness(0.55); ctx.metalness(0); ctx.emissive(null);
      cyl(ctx, x, 0, z, cr * 1.7, cr * 1.4, 0.008, 10); cyl(ctx, x, 0, z, cr, cr * 0.97, ch, 10); cyl(ctx, x, ch - 0.03, z, cr * 1.1, cr * 1.03, 0.025, 10);
      ctx.color("oklch(0.2 0.01 60)"); box(ctx, x - 0.003, ch, z - 0.003, x + 0.003, ch + 0.016, z + 0.003);
      ctx.color("oklch(0.95 0.08 80)"); ctx.emissive(5, 2.7, 0.8);
      lathe(ctx, x, ch + 0.01, z, [[0, 0], [0.011, 0.012], [0.013, 0.026], [0.009, 0.042], [0, 0.064]], 6);
      ctx.emissive(null);
    }
  },

  // the far woods: a band of pine silhouettes, a hill for the far castle spire
  pines(ctx, p) {
    const L = ctx.lod || 1, n = p.count || 70, R0 = p.inner || 26, R1 = p.outer || 72, a0 = p.a0 ?? -80, a1 = p.a1 ?? 80, gap = p.gap ?? -26;
    if (p.hill) { ctx.albedo(FLOOR); ctx.color("oklch(0.85 0.03 130)"); ctx.roughness(1); blob(ctx, p.hill[0], -8, p.hill[1], 48, 17, 36, 7, 0.1, 6, 12); }
    for (let k = 0; k < n; k++) {
      const a = (a0 + hash(k, 80) * (a1 - a0)) * D, rr = R0 + hash(k, 81) * (R1 - R0), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      const H = Math.abs(a / D - gap) < 8 ? 5 + hash(k, 82) * 3 : 10 + hash(k, 82) * 11, tiers = L > 2 ? 2 : 4;
      ctx.albedo("/cdn/bark-normaltree-u9xpx2wlu.webp"); ctx.color("oklch(0.62 0.02 50)"); ctx.roughness(0.95);
      cyl(ctx, x, -0.3, z, 0.03 * H, 0.05, H, 6, false);
      ctx.albedo("cdn/texture-dense-pine-needles-foliage.png"); ctx.color("oklch(0.7 0.05 150)");
      for (let i = 0; i < tiers; i++) {
        const y = H * 0.2 + (i * H * 0.66) / tiers, rad = H * 0.25 * (1 - i / (tiers + 0.4)) * (0.9 + hash(k * 7 + i, 83) * 0.2);
        cyl(ctx, x, y, z, rad, 0.05, H * 0.34, 7, true, (j, kk) => (kk === 0 ? 0.85 + ((j * 7 + i * 3 + k) % 5) * 0.07 : 1));
      }
    }
  },
};

// the dais as a body stands on it: tier tops and risers as sheets
function daisCollider(ctx) {
  const tiers = [[2.76, 0, 0.38], [2.4, 0.38, 0.76], [2.0, 0.76, 1.14]], seg = 24;
  for (const [r, y0, y1] of tiers) for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * 2 * Math.PI, a1 = ((i + 1) / seg) * 2 * Math.PI, am = (a0 + a1) / 2;
    const P = (a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    quadN(ctx, P(a0, y0), P(a1, y0), P(a1, y1), P(a0, y1), [Math.cos(am), 0, Math.sin(am)]);
    triN(ctx, [0, y1, 0], P(a0, y1), P(a1, y1), [0, 1, 0]);
  }
}
