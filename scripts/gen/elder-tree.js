// The Elderveil great tree: one hero tree at true size (no scale), origin at the root flare.
// A fluted, flared trunk ~6 m across, eight writhing limbs, and a crown of faceted leaf clumps in
// crimson and old gold, darker underneath and inside. Solid geometry, vertex colour only: no cards to fail at range.
import { cyl, blob, quadN } from "./shape.js";

const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function geometry(ctx) {
  ctx.flat();
  const r = () => ctx.random();
  const lod = ctx.lod || 1;
  const seg = lod > 2 ? 7 : 12;

  // a limb: tapered tube along a curve of points
  const limb = (pts, r0, r1, s) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[k], p1 = pts[k + 1];
      const ra = r0 + (r1 - r0) * (k / (pts.length - 1)), rb = r0 + (r1 - r0) * ((k + 1) / (pts.length - 1));
      const D = norm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
      const A = norm(crs(Math.abs(D[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], D)), B = crs(D, A);
      for (let i = 0; i < s; i++) {
        const a0 = (i / s) * 6.2832, a1 = ((i + 1) / s) * 6.2832;
        const o = (a, rr) => add(add([0, 0, 0], A, Math.cos(a) * rr), B, Math.sin(a) * rr);
        const am = (a0 + a1) / 2;
        quadN(ctx, add(p0, o(a0, ra)), add(p0, o(a1, ra)), add(p1, o(a1, rb)), add(p1, o(a0, rb)), o(am, 1));
      }
    }
  };

  // trunk: flared root plate, fluted bole, darker at the foot
  ctx.color("oklch(0.30 0.03 45)");
  const flute = (i, k) => 1 + (i % 3 === 0 ? 0.14 : 0) - (k ? 0.04 : 0);
  cyl(ctx, 0, -1.5, 0, 6.2, 3.6, 4.5, seg, false, flute);
  ctx.color("oklch(0.36 0.035 50)");
  cyl(ctx, 0, 3, 0, 3.6, 2.9, 10, seg, false, flute);
  ctx.color("oklch(0.40 0.04 55)");
  cyl(ctx, 0, 13, 0, 2.9, 2.0, 9, seg, true, flute);
  // buttress roots
  ctx.color("oklch(0.32 0.03 45)");
  const nRoots = lod > 2 ? 5 : 8;
  for (let i = 0; i < nRoots; i++) {
    const a = (i / nRoots) * 6.2832 + r() * 0.4, c = Math.cos(a), s = Math.sin(a);
    limb([[c * 3, 3.5, s * 3], [c * 6, 0.8, s * 6], [c * 10 + r() * 2, -0.6, s * 10 + r() * 2]], 1.3, 0.35, lod > 2 ? 4 : 6);
  }

  // limbs from the top of the bole, writhing out and up; each ends in a clump cluster
  const ends = [];
  const nLimbs = 8;
  ctx.color("oklch(0.38 0.04 52)");
  for (let i = 0; i < nLimbs; i++) {
    const a = (i / nLimbs) * 6.2832 + r() * 0.5, c = Math.cos(a), s = Math.sin(a);
    const y0 = 15 + r() * 6, reach = 11 + r() * 7;
    const p0 = [c * 1.6, y0, s * 1.6];
    const p1 = [c * reach * 0.35 + (r() - 0.5) * 2, y0 + 4 + r() * 2, s * reach * 0.35 + (r() - 0.5) * 2];
    const p2 = [c * reach * 0.7, y0 + 6 + r() * 3, s * reach * 0.7];
    const p3 = [c * reach, y0 + 7 + r() * 4, s * reach];
    limb([p0, p1, p2, p3], 1.25, 0.3, lod > 2 ? 5 : 7);
    ends.push(p3, p2);
  }
  // the leader, straight up the middle
  limb([[0, 21, 0], [0.8, 26, -0.5], [-0.4, 31, 0.6]], 1.6, 0.4, lod > 2 ? 5 : 7);
  ends.push([-0.4, 32, 0.6], [0, 27, 0]);

  // crown: clumps around every limb end plus a dome over the middle
  const pal = ["oklch(0.42 0.13 30)", "oklch(0.48 0.15 35)", "oklch(0.55 0.14 50)", "oklch(0.64 0.13 70)", "oklch(0.36 0.11 28)"];
  const clump = (c, rad) => {
    const k = Math.max(0, Math.min(1, (c[1] - 18) / 18));
    const idx = Math.min(pal.length - 2, Math.floor(k * 3.2 + r() * 1.3));
    ctx.color(r() < 0.12 ? pal[4] : pal[idx]);
    const lat = lod > 2 ? 4 : 5, lon = lod > 2 ? 6 : 8;
    blob(ctx, c[0], c[1], c[2], rad, rad * 0.72, rad, Math.floor(r() * 999), 0.28, lat, lon);
  };
  const per = lod === 1 ? 4 : lod === 2 ? 3 : 2;
  for (const e of ends) {
    clump(e, 5 + r() * 2);
    for (let j = 0; j < per; j++) clump([e[0] + (r() - 0.5) * 8, e[1] + (r() - 0.3) * 4, e[2] + (r() - 0.5) * 8], 3 + r() * 2.5);
  }
  const dome = lod === 1 ? 16 : lod === 2 ? 11 : 7;
  for (let i = 0; i < dome; i++) {
    const th = i * 2.39996, yy = 1 - (i + 0.5) / dome, rr = Math.sqrt(1 - yy * yy);
    clump([Math.cos(th) * rr * 13, 28 + yy * 9, Math.sin(th) * rr * 13], 5 + r() * 2.5);
  }
  return {};
}

export function collider(ctx) {
  cyl(ctx, 0, -1.5, 0, 4.5, 3, 24, 8);
}
