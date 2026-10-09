// Petalfall Hollow, a hidden glade in the thornwood west of Lantern's Reach. params.kind:
//  "stone"     a leaning standing stone, moss on its back, a carved spiral that glows soft rose
//  "basin"     a low fieldstone ring round a spring (the water is a separate disc at y 0.32), lilies on it
//  "mushrooms" a fairy ring of pale caps with glowing gills, params.r = ring radius
// Feet at y = 0. ctx.lod >= 3 drops the small stuff.
import { cyl, blob, boxR } from "./shape.js";

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function mat(ctx, c, rough = 0.9) { ctx.albedo(null); ctx.color(c); ctx.roughness(rough); ctx.metalness(0); ctx.emissive(null); }

function stone(ctx, r, far) {
  const h = 2.2 + r() * 1.3, lean = (r() - 0.5) * 8;
  mat(ctx, "oklch(0.58 0.015 100)", 0.95);
  boxR(ctx, [0, h / 2 - 0.15, 0], [0.75 + r() * 0.2, h, 0.42 + r() * 0.12], { roll: lean, yaw: (r() - 0.5) * 10 });
  mat(ctx, "oklch(0.62 0.015 95)", 0.95);
  boxR(ctx, [0.02, h - 0.12, 0], [0.62, 0.3, 0.36], { roll: lean + 6 });
  if (far) return;
  mat(ctx, "oklch(0.5 0.1 135)", 1);
  for (let i = 0; i < 5; i++) blob(ctx, (r() - 0.5) * 0.5, 0.3 + r() * h * 0.7, 0.2, 0.22, 0.28, 0.08, i + 3, 0.4, 3, 5);
  for (let i = 0; i < 6; i++) { const a = r() * 6.28; blob(ctx, Math.cos(a) * 0.55, 0.04, Math.sin(a) * 0.4, 0.2, 0.08, 0.18, i + 20, 0.4, 3, 5); }
  ctx.color("oklch(0.85 0.1 330)"); ctx.emissive(1.6, 0.8, 1.3);
  for (let i = 0; i < 9; i++) { const t = i / 8, a = t * 9, rr = 0.04 + t * 0.2; boxR(ctx, [Math.cos(a) * rr, h * 0.55 + Math.sin(a) * rr, -0.23], [0.045, 0.045, 0.02], { roll: a * 57 }); }
  ctx.emissive(null);
}

function basin(ctx, r, far) {
  const n = far ? 10 : 18, R = 2.6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + r() * 0.1;
    mat(ctx, i % 3 ? "oklch(0.6 0.015 95)" : "oklch(0.52 0.02 110)", 0.95);
    blob(ctx, Math.cos(a) * R, 0.2, Math.sin(a) * R, 0.55, 0.32 + r() * 0.1, 0.4, i + 1, 0.3, far ? 3 : 5, far ? 5 : 7);
  }
  // the basin's floor, dark under the water
  mat(ctx, "oklch(0.3 0.03 160)", 1); cyl(ctx, 0, -0.05, 0, R, R, 0.3, far ? 10 : 18, true);
  if (far) return;
  mat(ctx, "oklch(0.48 0.11 135)", 1);
  for (let i = 0; i < 10; i++) { const a = r() * 6.28; blob(ctx, Math.cos(a) * (R + 0.1), 0.45, Math.sin(a) * (R + 0.1), 0.25, 0.08, 0.2, i + 40, 0.4, 3, 5); }
  for (let i = 0; i < 7; i++) {
    const a = r() * 6.28, d = 0.5 + r() * 1.5;
    mat(ctx, "oklch(0.55 0.12 140)", 0.8);
    cyl(ctx, Math.cos(a) * d, 0.33, Math.sin(a) * d, 0.22, 0.22, 0.02, 8, true);
    if (i % 2 === 0) { ctx.color("oklch(0.95 0.03 340)"); ctx.emissive(0.4, 0.3, 0.35); blob(ctx, Math.cos(a) * d, 0.4, Math.sin(a) * d, 0.08, 0.06, 0.08, i, 0.2, 3, 5); ctx.emissive(null); }
  }
}

function mushrooms(ctx, r, far, R) {
  const n = far ? 8 : 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + (r() - 0.5) * 0.2, d = R + (r() - 0.5) * 0.5, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const h = 0.12 + r() * 0.22, cap = 0.08 + r() * 0.1;
    mat(ctx, "oklch(0.9 0.02 90)", 0.7); cyl(ctx, x, 0, z, 0.03, 0.025, h, 5, false);
    ctx.color("oklch(0.88 0.06 320)"); ctx.emissive(0.9, 0.5, 1.2);
    blob(ctx, x, h, z, cap, cap * 0.55, cap, i, 0.15, 3, 6);
    ctx.emissive(null);
  }
}

export function geometry(ctx) {
  const p = ctx.params || {}, far = (ctx.lod ?? 1) >= 3, r = rng((ctx.seed ?? 5) * 977 + 13);
  if (p.kind === "basin") return basin(ctx, r, far);
  if (p.kind === "mushrooms") return mushrooms(ctx, r, far, p.r ?? 5);
  return stone(ctx, r, far);
}
