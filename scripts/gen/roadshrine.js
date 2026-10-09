// A wayside shrine for the March roads: fieldstone plinth, a carved niche stone, two oak posts under a
// small red-clay shingle roof, a row of lit candles and wildflowers left as offerings. Feet at y = 0, faces -Z.
import { cyl, blob, boxR } from "./shape.js";

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function geometry(ctx) {
  const far = (ctx.lod ?? 1) >= 3, r = rng((ctx.seed ?? 3) * 131 + 9);
  const mat = (c, rough = 0.9, metal = 0) => { ctx.albedo(null); ctx.color(c); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null); };

  mat("oklch(0.55 0.02 110)", 0.95);
  boxR(ctx, [0, 0.15, 0], [1.9, 0.3, 1.5], { yaw: (r() - 0.5) * 3 });
  boxR(ctx, [0, 0.42, 0.05], [1.4, 0.25, 1.1], { yaw: (r() - 0.5) * 4 });
  if (!far) for (let i = 0; i < 7; i++) { const a = r() * 6.28; mat(i % 2 ? "oklch(0.5 0.02 120)" : "oklch(0.6 0.02 100)", 0.95); blob(ctx, Math.cos(a) * 1.1, 0.08, Math.sin(a) * 0.9, 0.18 + r() * 0.1, 0.12, 0.16 + r() * 0.1, i + 2, 0.35, 3, 5); }
  mat("oklch(0.48 0.1 135)", 0.95);
  for (let i = 0; i < (far ? 2 : 5); i++) blob(ctx, (r() - 0.5) * 1.6, 0.3, (r() - 0.5) * 1.2, 0.22, 0.05, 0.18, i + 30, 0.4, 2, 6);

  mat("oklch(0.66 0.02 90)", 0.92);
  boxR(ctx, [0, 1.15, 0.2], [0.75, 1.2, 0.35]);
  cyl(ctx, 0, 1.75, 0.2, 0.375, 0.2, 0.25, far ? 5 : 8, true);
  mat("oklch(0.3 0.02 80)", 0.95);
  boxR(ctx, [0, 1.2, 0.02], [0.4, 0.55, 0.04]);
  if (!far) { mat("oklch(0.78 0.12 85)", 0.35, 0.8); boxR(ctx, [0, 1.12, -0.01], [0.16, 0.16, 0.02], { roll: 45 }); boxR(ctx, [0, 1.32, -0.01], [0.03, 0.22, 0.02]); }

  mat("oklch(0.34 0.04 50)", 0.92);
  for (const x of [-0.75, 0.75]) cyl(ctx, x, 0.55, -0.05, 0.08, 0.07, 1.75, far ? 5 : 7, true);
  boxR(ctx, [0, 2.3, -0.05], [1.8, 0.1, 0.12]);
  mat("oklch(0.45 0.12 35)", 0.85);
  const pitch = 32;
  boxR(ctx, [0, 2.55, -0.38], [2.0, 0.07, 0.8], { pitch: -pitch });
  boxR(ctx, [0, 2.55, 0.28], [2.0, 0.07, 0.8], { pitch: pitch });
  if (!far) { mat("oklch(0.38 0.11 35)", 0.85); for (let i = 0; i < 3; i++) { const t = 0.15 + i * 0.25, y = 2.33 + (1 - t) * 0.42, d = t * 0.62; boxR(ctx, [0, y, -0.05 - d], [2.02, 0.03, 0.06], { pitch: -pitch }); boxR(ctx, [0, y, -0.05 + d], [2.02, 0.03, 0.06], { pitch: pitch }); } }
  mat("oklch(0.3 0.04 45)", 0.9); boxR(ctx, [0, 2.78, -0.05], [2.05, 0.08, 0.08]);

  const candles = far ? 3 : 7;
  for (let i = 0; i < candles; i++) {
    const x = -0.5 + (i / (candles - 1)) * 1.0 + (r() - 0.5) * 0.06, z = -0.3 + (r() - 0.5) * 0.18, h = 0.1 + r() * 0.16;
    mat("oklch(0.93 0.03 90)", 0.6); cyl(ctx, x, 0.545, z, 0.035, 0.032, h, 6, true);
    ctx.color("oklch(0.92 0.14 80)"); ctx.emissive(4.5, 2.6, 0.7); blob(ctx, x, 0.545 + h + 0.035, z, 0.018, 0.04, 0.018, i, 0.05, 3, 4); ctx.emissive(null);
  }
  if (!far) for (let i = 0; i < 6; i++) { mat(["oklch(0.7 0.15 350)", "oklch(0.86 0.15 95)", "oklch(0.68 0.15 295)"][i % 3], 0.7); blob(ctx, -0.6 + r() * 1.2, 0.33, -0.55 - r() * 0.15, 0.05, 0.04, 0.05, i + 50, 0.3, 3, 5); }
}
