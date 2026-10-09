// A rose-and-blossom arch gate over a road: two weathered oak posts, a curved timber crown,
// climbing roses and blossom clumps, an iron lantern hanging at the keystone. Feet at y = 0, road runs along Z.
// params: span (inner width, m), height (post height, m), palette ("thorn" default).
import { quadN, cyl, blob, boxR } from "./shape.js";

const PAL = {
  thorn: ["oklch(0.6 0.18 330)", "oklch(0.7 0.15 350)", "oklch(0.55 0.19 20)", "oklch(0.86 0.08 350)", "oklch(0.66 0.16 300)"],
  ember: ["oklch(0.7 0.19 40)", "oklch(0.82 0.16 75)", "oklch(0.6 0.2 25)", "oklch(0.88 0.12 95)"],
  tide: ["oklch(0.95 0.02 230)", "oklch(0.72 0.12 240)", "oklch(0.82 0.08 200)", "oklch(0.9 0.05 330)"],
  fen: ["oklch(0.68 0.14 295)", "oklch(0.86 0.12 100)", "oklch(0.75 0.1 160)", "oklch(0.93 0.03 90)"],
  star: ["oklch(0.96 0.02 260)", "oklch(0.7 0.13 270)", "oklch(0.8 0.09 230)", "oklch(0.9 0.05 300)"],
};
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function geometry(ctx) {
  const far = (ctx.lod ?? 1) >= 3;
  const span = ctx.params?.span ?? 5.2, H = ctx.params?.height ?? 3.4, R = span / 2 + 0.2;
  const pal = PAL[ctx.params?.palette] ?? PAL.thorn;
  const r = rng((ctx.seed ?? 7) * 977 + 3);
  const oak = (c = "oklch(0.34 0.04 50)") => { ctx.albedo(null); ctx.color(c); ctx.roughness(0.92); ctx.metalness(0); ctx.emissive(null); };

  // fieldstone footings
  ctx.albedo(null); ctx.color("oklch(0.52 0.02 120)"); ctx.roughness(0.95); ctx.metalness(0); ctx.emissive(null);
  for (const s of [-1, 1]) blob(ctx, s * (span / 2 + 0.2), 0.12, 0, 0.55, 0.3, 0.55, s + 5, 0.3, far ? 3 : 4, far ? 5 : 7);

  // posts, a little lean and taper, a crossbar near the top
  oak();
  for (const s of [-1, 1]) {
    const x = s * (span / 2 + 0.2);
    cyl(ctx, x, 0, 0, 0.2, 0.16, H, far ? 6 : 8, true);
    boxR(ctx, [x, H - 0.35, 0], [0.5, 0.12, 0.5], { yaw: 45 });
  }
  // the curved crown: two parallel ribs joined by slats
  const seg = far ? 8 : 14, rise = 1.3;
  const arc = (i) => { const t = Math.PI * (i / seg); return [-Math.cos(t) * R, H + Math.sin(t) * rise]; };
  oak("oklch(0.3 0.04 45)");
  for (const z of [-0.28, 0.28]) for (let i = 0; i < seg; i++) {
    const a = arc(i), b = arc(i + 1);
    const off = (p) => [p[0], p[1], 0];
    const A = off(a), B = off(b);
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, h = 0.09;
    const P = (p, s, zz) => [p[0] + nx * s * h, p[1] + ny * s * h, z + zz * h];
    const Q = [[P(A, -1, -1), P(A, 1, -1), P(B, 1, -1), P(B, -1, -1), [0, 0, -1]], [P(A, 1, -1), P(A, 1, 1), P(B, 1, 1), P(B, 1, -1), [nx, ny, 0]],
      [P(A, 1, 1), P(A, -1, 1), P(B, -1, 1), P(B, 1, 1), [0, 0, 1]], [P(A, -1, 1), P(A, -1, -1), P(B, -1, -1), P(B, -1, 1), [-nx, -ny, 0]]];
    for (const q of Q) quadN(ctx, q[0], q[1], q[2], q[3], q[4]);
  }
  if (!far) for (let i = 1; i < seg; i += 2) { const p = arc(i); boxR(ctx, [p[0], p[1], 0], [0.08, 0.06, 0.74], {}); }

  // climbing vine and leaves up both posts and over the crown
  ctx.albedo(null); ctx.roughness(0.8); ctx.emissive(null);
  const leafAt = (x, y, z, s, k) => { ctx.color(k % 3 ? "oklch(0.45 0.11 140)" : "oklch(0.38 0.09 150)"); blob(ctx, x, y, z, s, s * 0.7, s, k, 0.4, far ? 3 : 4, far ? 4 : 6); };
  const roseAt = (x, y, z, s, k) => { ctx.color(pal[k % pal.length]); blob(ctx, x, y, z, s, s * 0.8, s, k + 40, 0.25, far ? 2 : 3, far ? 4 : 6); };
  const clumps = far ? 10 : 26;
  for (let k = 0; k < clumps; k++) {
    const side = k % 2 ? 1 : -1, y = 0.3 + r() * (H - 0.4), x = side * (span / 2 + 0.2) + (r() - 0.5) * 0.45, z = (r() - 0.5) * 0.55;
    leafAt(x, y, z, 0.22 + r() * 0.16, k);
    if (r() < 0.6) roseAt(x + (r() - 0.5) * 0.3, y + 0.1, z + (r() > 0.5 ? 0.25 : -0.25), 0.09 + r() * 0.05, k);
  }
  const crown = far ? 12 : 30;
  for (let k = 0; k < crown; k++) {
    const p = arc(r() * seg), z = (r() - 0.5) * 0.8;
    leafAt(p[0] + (r() - 0.5) * 0.3, p[1] + 0.1 + r() * 0.2, z, 0.26 + r() * 0.2, k + 100);
    roseAt(p[0] + (r() - 0.5) * 0.4, p[1] + 0.2 + r() * 0.2, z + (r() - 0.5) * 0.3, 0.1 + r() * 0.07, k + 7);
    if (!far && r() < 0.5) { // a hanging trail of blossom
      const len = 0.3 + r() * 0.7;
      for (let j = 0; j < 3; j++) roseAt(p[0] + (r() - 0.5) * 0.2, p[1] - len * (j + 1) / 3, z, 0.06, k + j * 3);
    }
  }

  // the iron lantern at the keystone: chain, cage, a warm glowing core
  const top = H + rise;
  ctx.albedo(null); ctx.color("oklch(0.25 0.01 60)"); ctx.roughness(0.6); ctx.metalness(0.7); ctx.emissive(null);
  cyl(ctx, 0, top - 0.75, 0, 0.015, 0.015, 0.7, 4, false);
  cyl(ctx, 0, top - 1.15, 0, 0.16, 0.06, 0.12, 6, true);
  cyl(ctx, 0, top - 1.62, 0, 0.12, 0.16, 0.06, 6, true);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; boxR(ctx, [Math.cos(a) * 0.13, top - 1.37, Math.sin(a) * 0.13], [0.025, 0.42, 0.025], {}); }
  ctx.color("oklch(0.9 0.12 75)"); ctx.metalness(0); ctx.roughness(0.4); ctx.emissive(3.2, 1.9, 0.6);
  blob(ctx, 0, top - 1.37, 0, 0.09, 0.15, 0.09, 3, 0.05, 4, 6);
  ctx.emissive(null);
}
