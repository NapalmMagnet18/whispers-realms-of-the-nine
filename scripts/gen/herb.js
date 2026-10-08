// Herb nodes for Herblore (scripts/lib/data/trades.yml nodes): params.kind "sunleaf" | "briarroot" | "gravebloom".
// A clump of two-sided leaf cards around a crown, a faint glow on what you pick so it reads in the grass. Feet at y = 0.
import { blob, cyl } from "./shape.js";
function leaf(ctx, a, len, wid, lift, y0) {
  const c = Math.cos(a), s = Math.sin(a), px = -s * wid, pz = c * wid;
  const bx = c * 0.03, bz = s * 0.03;
  const mx = c * len * 0.55, mz = s * len * 0.55, my = y0 + lift * 0.8;
  const tx = c * len, tz = s * len, ty = y0 + lift * 0.55;
  const q = (A, B, C, D) => { ctx.quad(...A, ...B, ...C, ...D); ctx.quad(...D, ...C, ...B, ...A); };
  q([bx - px * 0.3, y0, bz - pz * 0.3], [bx + px * 0.3, y0, bz + pz * 0.3], [mx + px, my, mz + pz], [mx - px, my, mz - pz]);
  q([mx - px, my, mz - pz], [mx + px, my, mz + pz], [tx + px * 0.1, ty, tz + pz * 0.1], [tx - px * 0.1, ty, tz - pz * 0.1]);
}
export function geometry(ctx) {
  const kind = ctx.params?.kind || "sunleaf";
  const sd = ctx.random() * 50, far = (ctx.lod ?? 1) >= 3;
  ctx.roughness(0.8);
  if (kind === "sunleaf") {
    ctx.color("oklch(0.62 0.13 120)");
    const n = far ? 6 : 11;
    for (let i = 0; i < n; i++) leaf(ctx, i * 2.39 + sd, 0.32 + (i % 3) * 0.07, 0.07, 0.34 + (i % 4) * 0.06, 0);
    ctx.color("oklch(0.86 0.15 95)"); ctx.emissive("oklch(0.45 0.12 90)");
    for (let i = 0; i < (far ? 3 : 7); i++) { const a = i * 1.7 + sd, r = 0.08 + (i % 3) * 0.05; blob(ctx, Math.cos(a) * r, 0.36 + (i % 3) * 0.06, Math.sin(a) * r, 0.035, 0.05, 0.035, i + sd, 0.2, 3, 5); }
  } else if (kind === "briarroot") {
    ctx.color("oklch(0.36 0.1 25)");
    const n = far ? 4 : 7;
    for (let i = 0; i < n; i++) { const a = i * 2.1 + sd; cyl(ctx, Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12, 0.035, 0.012, 0.45 + (i % 3) * 0.12, 5, false); }
    ctx.color("oklch(0.42 0.09 145)");
    for (let i = 0; i < (far ? 3 : 6); i++) leaf(ctx, i * 1.9 + sd, 0.22, 0.05, 0.18, 0.08);
    ctx.color("oklch(0.45 0.14 265)"); ctx.emissive("oklch(0.3 0.12 265)"); ctx.metalness(0.1); ctx.roughness(0.3);
    for (let i = 0; i < (far ? 4 : 10); i++) { const a = i * 2.6 + sd, r = 0.1 + (i % 3) * 0.05; blob(ctx, Math.cos(a) * r, 0.3 + (i % 4) * 0.07, Math.sin(a) * r, 0.03, 0.03, 0.03, i, 0.1, 3, 5); }
  } else {
    ctx.color("oklch(0.5 0.05 150)");
    for (let i = 0; i < (far ? 3 : 6); i++) leaf(ctx, i * 1.05 + sd, 0.26, 0.04, 0.12, 0);
    const stems = far ? 2 : 3;
    for (let k = 0; k < stems; k++) {
      const a = k * 2.1 + sd, ox = Math.cos(a) * 0.1, oz = Math.sin(a) * 0.1, h = 0.45 + k * 0.08;
      ctx.color("oklch(0.55 0.06 150)"); ctx.emissive(null);
      cyl(ctx, ox, 0, oz, 0.012, 0.01, h, 5, false);
      ctx.color("oklch(0.93 0.02 300)"); ctx.emissive("oklch(0.3 0.05 300)");
      for (let p = 0; p < 5; p++) { const pa = p * 1.2566 + a; ctx.quad(ox, h, oz, ox + Math.cos(pa) * 0.11, h + 0.07, oz + Math.sin(pa) * 0.11, ox + Math.cos(pa + 0.5) * 0.13, h + 0.12, oz + Math.sin(pa + 0.5) * 0.13, ox + Math.cos(pa + 0.9) * 0.05, h + 0.04, oz + Math.sin(pa + 0.9) * 0.05); ctx.quad(ox + Math.cos(pa + 0.9) * 0.05, h + 0.04, oz + Math.sin(pa + 0.9) * 0.05, ox + Math.cos(pa + 0.5) * 0.13, h + 0.12, oz + Math.sin(pa + 0.5) * 0.13, ox + Math.cos(pa) * 0.11, h + 0.07, oz + Math.sin(pa) * 0.11, ox, h, oz); }
      ctx.color("oklch(0.7 0.2 305)"); ctx.emissive("oklch(0.6 0.22 305)");
      blob(ctx, ox, h + 0.03, oz, 0.025, 0.04, 0.025, k, 0.1, 3, 5);
    }
  }
  ctx.emissive(null); ctx.metalness(0);
}
