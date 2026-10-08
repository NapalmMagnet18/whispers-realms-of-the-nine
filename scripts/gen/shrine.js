// A forsaken blood shrine off the Starfall road (2026-10-08). One piece: octagonal dais, cracked chained obelisk,
// red runes, an offering bowl, candles, bones, a ring of broken pillars. Faces -Z.
import { quadN, triN, boxR, box, cyl, blob } from './shape.js';
const BASALT = 'cdn/texture-black-basalt-stone-cracked.png', FIELD = 'cdn/texture-mossy-fieldstone-weathered.png';
const IRON = 'cdn/texture-rusted-black-iron-hammered.png';
const D = Math.PI / 180;
function h(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n); }

// a tapered four-sided column segment from y0 (half-width w0) to y1 (half-width w1), twisted by tw degrees
function taper(ctx, y0, y1, w0, w1, tw = 0, cap = true) {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const at = (k, y, w, t) => { const [a, b] = c[k], cs = Math.cos(t * D), sn = Math.sin(t * D); return [(a * cs - b * sn) * w, y, (a * sn + b * cs) * w]; };
  for (let k = 0; k < 4; k++) {
    const n = (k + 1) % 4, p0 = at(k, y0, w0, 0), p1 = at(n, y0, w0, 0), p2 = at(n, y1, w1, tw), p3 = at(k, y1, w1, tw);
    const m = [(p0[0] + p1[0] + p2[0] + p3[0]) / 4, 0, (p0[2] + p1[2] + p2[2] + p3[2]) / 4];
    quadN(ctx, p0, p1, p2, p3, [m[0], 0.1, m[2]]);
  }
  if (cap) quadN(ctx, at(0, y1, w1, tw), at(1, y1, w1, tw), at(2, y1, w1, tw), at(3, y1, w1, tw), [0, 1, 0]);
}

function skull(ctx, P, x, y, z, s, yaw, far) {
  P(null, 'oklch(0.86 0.03 85)', 0.8);
  blob(ctx, x, y + s * 0.55, z, s * 0.5, s * 0.48, s * 0.58, Math.round(x * 10), 0.05, far ? 3 : 5, far ? 5 : 8);
  if (far) return;
  const r = (lx, lz) => [x + lx * Math.cos(yaw * D) + lz * Math.sin(yaw * D), z - lx * Math.sin(yaw * D) + lz * Math.cos(yaw * D)];
  const [jx, jz] = r(0, -s * 0.35); blob(ctx, jx, y + s * 0.18, jz, s * 0.32, s * 0.16, s * 0.3, 3, 0.05, 3, 6);
  P(null, 'oklch(0.12 0.01 30)', 1); for (const sx of [-1, 1]) { const [ex, ez] = r(sx * s * 0.2, -s * 0.5); blob(ctx, ex, y + s * 0.6, ez, s * 0.12, s * 0.13, s * 0.08, 1, 0, 3, 5); }
}

function build(ctx, col) {
  const far = (ctx.lod || 1) >= 5;
  const P = (tex, c, r = 0.9, m = 0) => { if (col) return; ctx.albedo(far ? null : tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
  const glow = (c) => { if (col) return; ctx.albedo(null); ctx.color(c); ctx.emissive(c); ctx.roughness(0.6); ctx.metalness(0); };
  if (col) { cyl(ctx, 0, 0, 0, 3.6, 3.6, 0.5, 8, true); box(ctx, -0.8, 0.5, -0.8, 0.8, 5.5, 0.8); for (let i = 0; i < 5; i++) { const a = (i / 5 * 360 + 20) * D; box(ctx, Math.cos(a) * 6.2 - 0.5, 0, Math.sin(a) * 6.2 - 0.5, Math.cos(a) * 6.2 + 0.5, 1.5, Math.sin(a) * 6.2 + 0.5); } return; }

  // dais: two octagonal steps of mossy fieldstone, a basalt top
  P(FIELD, 'oklch(0.52 0.03 120)'); cyl(ctx, 0, 0, 0, 3.6, 3.5, 0.25, 8, true);
  P(FIELD, 'oklch(0.45 0.02 100)'); cyl(ctx, 0, 0.25, 0, 2.8, 2.7, 0.25, 8, true);
  if (!far) { P(FIELD, 'oklch(0.4 0.02 100)'); for (let i = 0; i < 7; i++) { const a = (i * 51 + 10) * D, r = 3.3 + h(i, 2) * 0.6; boxR(ctx, [Math.cos(a) * r, 0.08, Math.sin(a) * r], [0.5 + h(i, 4) * 0.4, 0.16, 0.35], { yaw: h(i, 5) * 90, roll: (h(i, 6) - 0.5) * 20 }); } } // fallen step stones

  // the obelisk: tapered, twisting slightly, cracked through at 2.8 m with the top shifted and tilted
  P(BASALT, 'oklch(0.22 0.02 290)', 0.6, 0.1);
  ctx.pushTransform?.();
  taper(ctx, 0.5, 2.8, 0.7, 0.58, 4, true);
  const top = (x, y, z) => { const t = -6 * D, c = Math.cos(t), s = Math.sin(t); const yy = y - 2.85; return [x * c - yy * s + 0.12, x * s + yy * c + 2.9, z + 0.05]; };
  { // upper shard: same taper, rotated by roll -6 and shifted
    const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const at = (k, y, w, tw) => { const [a, b] = c[k], cs = Math.cos(tw * D), sn = Math.sin(tw * D); return top((a * cs - b * sn) * w, y, (a * sn + b * cs) * w); };
    for (let k = 0; k < 4; k++) { const n = (k + 1) % 4, p0 = at(k, 2.85, 0.58, 4), p1 = at(n, 2.85, 0.58, 4), p2 = at(n, 5.0, 0.36, 8), p3 = at(k, 5.0, 0.36, 8); quadN(ctx, p0, p1, p2, p3, [(p0[0] + p2[0]) / 2 - 0.12, 0.15, (p0[2] + p2[2]) / 2]); }
    const apex = top(0, 5.7, 0); for (let k = 0; k < 4; k++) { const n = (k + 1) % 4; const a = at(k, 5.0, 0.36, 8), b = at(n, 5.0, 0.36, 8); triN(ctx, a, b, apex, [(a[0] + b[0]) / 2 - apex[0], 0.4, (a[2] + b[2]) / 2 - apex[2]]); }
    quadN(ctx, at(3, 2.85, 0.58, 4), at(2, 2.85, 0.58, 4), at(1, 2.85, 0.58, 4), at(0, 2.85, 0.58, 4), [0, -1, 0]);
  }
  if (!far) {
    // chunks broken off at the crack, lying on the dais
    P(BASALT, 'oklch(0.2 0.02 290)', 0.6); for (let i = 0; i < 4; i++) { const a = (i * 95 + 30) * D; boxR(ctx, [Math.cos(a) * (1.3 + h(i, 1)), 0.6, Math.sin(a) * (1.3 + h(i, 1))], [0.3 + h(i, 3) * 0.25, 0.2, 0.25], { yaw: h(i, 7) * 180, roll: 15 }); }
    // glowing red runes down each face of the lower shaft
    glow('oklch(0.55 0.22 25)');
    for (let f = 0; f < 4; f++) { const yaw = f * 90 + 2; for (let r = 0; r < 4; r++) { const y = 0.9 + r * 0.45, w = 0.66 - (y - 0.5) * 0.05; const kind = (f * 4 + r) % 3; const sz = kind === 0 ? [0.04, 0.28, 0.02] : kind === 1 ? [0.22, 0.04, 0.02] : [0.04, 0.2, 0.02]; const [ox, oz] = [Math.sin(yaw * D) * (w + 0.005), -Math.cos(yaw * D) * (w + 0.005)]; boxR(ctx, [ox, y, oz], sz, { yaw: -yaw, roll: kind === 2 ? 35 : 0 }); if (kind === 1) boxR(ctx, [ox, y + 0.1, oz], [0.04, 0.16, 0.02], { yaw: -yaw }); } }
    // the crack itself glowing faintly
    glow('oklch(0.45 0.2 30)'); box(ctx, -0.6, 2.8, -0.6, 0.6, 2.85, 0.6);
    // chains: iron links spiralling round the shaft, two loose ends trailing to iron stakes
    P(IRON, 'oklch(0.32 0.02 50)', 0.55, 0.85);
    for (let i = 0; i < 46; i++) { const t = i / 46, a = t * 720 * D + 0.4, y = 0.7 + t * 2.0, w = 0.74 - t * 0.12; boxR(ctx, [Math.cos(a) * w, y, Math.sin(a) * w], [0.05, 0.08, 0.16], { yaw: -a / D, pitch: i % 2 ? 0 : 90, roll: 10 }); }
    for (const [sx, sz] of [[2.2, -1.6], [-2.0, 1.9]]) {
      for (let i = 0; i < 12; i++) { const t = (i + 0.5) / 12, x = sx * t + (1 - t) * Math.sign(sx) * 0.7, z = sz * t + (1 - t) * Math.sign(sz) * 0.7, y = 0.55 + Math.sin(t * Math.PI) * 0.15 + (1 - t) * 0.6; boxR(ctx, [x, y, z], [0.05, 0.08, 0.16], { yaw: Math.atan2(sx, sz) / D, roll: i % 2 ? 90 : 0 }); }
      cyl(ctx, sx, 0.4, sz, 0.05, 0.03, 0.45, 6, true); box(ctx, sx - 0.08, 0.8, sz - 0.08, sx + 0.08, 0.84, sz + 0.08);
    }
    // the offering bowl on a squat plinth before the obelisk, dark blood in it
    P(FIELD, 'oklch(0.4 0.02 100)'); cyl(ctx, 0, 0.5, -1.45, 0.3, 0.25, 0.5, 8, true);
    P(IRON, 'oklch(0.3 0.03 40)', 0.5, 0.8); cyl(ctx, 0, 1.0, -1.45, 0.25, 0.42, 0.18, 12, false); cyl(ctx, 0, 1.0, -1.45, 0.26, 0.26, 0.02, 12, true);
    glow('oklch(0.28 0.16 25)'); cyl(ctx, 0, 1.12, -1.45, 0.38, 0.38, 0.02, 12, true);
    // candles: clusters on the steps, melted, a few still lit
    for (let i = 0; i < 16; i++) {
      const a = (i * 23 + h(i, 9) * 18 - 130) * D, r = 1.6 + h(i, 8) * 0.9, x = Math.cos(a) * r, z = Math.sin(a) * r, y = r > 2.6 ? 0.25 : 0.5, ht = 0.1 + h(i, 11) * 0.3;
      P(null, 'oklch(0.88 0.03 90)', 0.5); cyl(ctx, x, y, z, 0.06, 0.05, ht, 6, true); cyl(ctx, x, y, z, 0.1, 0.07, 0.03, 6, true);
      if (i % 3 !== 0) { glow('oklch(0.85 0.16 70)'); blob(ctx, x, y + ht + 0.05, z, 0.02, 0.05, 0.02, i, 0, 3, 4); }
    }
    // bones and skulls among the candles
    for (let i = 0; i < 5; i++) { const a = (i * 70 + 200) * D, r = 1.2 + h(i, 13) * 1.4; skull(ctx, P, Math.cos(a) * r, r > 2.6 ? 0.25 : 0.5, Math.sin(a) * r, 0.18 + h(i, 14) * 0.05, h(i, 15) * 360 - 180, far); }
    P(null, 'oklch(0.82 0.03 85)', 0.8); for (let i = 0; i < 12; i++) { const a = (i * 31 + 5) * D, r = 1.4 + h(i, 16) * 2.2, y = r > 2.7 ? 0.27 : 0.52; boxR(ctx, [Math.cos(a) * r, y, Math.sin(a) * r], [0.05, 0.05, 0.35 + h(i, 17) * 0.2], { yaw: h(i, 18) * 180 }); }
  }
  // a ring of broken pillars, five of them, each snapped at a different height
  for (let i = 0; i < 5; i++) {
    const a = (i / 5 * 360 + 20) * D, x = Math.cos(a) * 6.2, z = Math.sin(a) * 6.2, ht = 0.8 + h(i, 21) * 2.6;
    P(FIELD, 'oklch(0.5 0.02 100)'); cyl(ctx, x, 0, z, 0.6, 0.6, 0.3, 8, true);
    P(BASALT, 'oklch(0.25 0.02 290)', 0.65); cyl(ctx, x, 0.3, z, 0.42, 0.38, ht, far ? 6 : 10, true, far ? null : (k, y) => 1 + (y > ht * 0.85 ? (h(k, i) - 0.5) * 0.3 : 0));
    if (!far) { glow('oklch(0.5 0.2 25)'); boxR(ctx, [x - Math.cos(a) * 0.41, 0.3 + ht * 0.55, z - Math.sin(a) * 0.41], [0.03, 0.3, 0.03], { yaw: -a / D }); P(BASALT, 'oklch(0.22 0.02 290)'); boxR(ctx, [x + Math.cos(a) * 0.9, 0.2, z + Math.sin(a) * 0.9], [0.8, 0.4, 0.4], { yaw: -a / D + 90, roll: 6 }); }
  }
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
