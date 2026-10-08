// Boulders and ore veins: params.ore "copper" | null, params.r size. Origin at the ground.
import { blob } from "./shape.js";
export function geometry(ctx) {
  ctx.flat();
  const { ore = null, r = 1.2, tex = null, tint = null } = ctx.params || {};
  const sd = ctx.random() * 99;
  ctx.albedo(tex || "cdn/texture-granite-boulder-rough-lichen.png"); ctx.color(tint || "oklch(0.92 0.01 70)"); ctx.roughness(0.95);
  blob(ctx, 0, r * 0.35, 0, r, r * 0.75, r * 0.9, sd, 0.28, 6, 9);
  blob(ctx, r * 0.6, r * 0.2, r * 0.3, r * 0.55, r * 0.45, r * 0.5, sd + 3, 0.3, 5, 7);
  if (ore) {
    ctx.albedo(null); ctx.color(ore === "copper" ? "oklch(0.62 0.13 50)" : "oklch(0.7 0.02 250)"); ctx.metalness(0.85); ctx.roughness(0.35);
    ctx.emissive(ore === "copper" ? "oklch(0.35 0.1 50)" : null);
    for (let i = 0; i < 9; i++) { const a = i * 1.9 + sd, b = (i % 3) * 0.5 + 0.3; blob(ctx, Math.cos(a) * r * 0.85 * Math.sin(b + 0.6), r * 0.35 + Math.cos(b + 0.6) * r * 0.62, Math.sin(a) * r * 0.78 * Math.sin(b + 0.6), r * 0.16, r * 0.13, r * 0.16, i + sd, 0.35, 3, 5); }
    ctx.emissive(null); ctx.metalness(0);
  }
}
export function collider(ctx) { const r = ctx.params?.r ?? 1.2; return { kind: "sphere", radius: r * 0.8 }; }
