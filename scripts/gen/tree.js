// Forest trees: params.kind "pine" | "oak" | "dead", seeded shape. Origin at the root flare.
import { cyl, blob, boxR } from "./shape.js";
export function geometry(ctx) {
  ctx.flat();
  const { kind = "pine", s = 1 } = ctx.params || {};
  const r = () => ctx.random();
  const lod = ctx.lod || 1;
  // the creator's hand-painted bark: warm ridged for living trees, charcoal cracked for dead ones
  ctx.albedo(kind === "dead" ? "/cdn/bark-deadtree-u2s9hxqea.webp" : "/cdn/bark-normaltree-u9xpx2wlu.webp"); ctx.color(kind === "dead" ? "oklch(0.95 0 0)" : kind === "pine" ? "oklch(0.62 0.02 50)" : "oklch(0.7 0.015 60)"); ctx.roughness(0.95);
  if (kind === "pine") {
    const H = 9 + r() * 4;
    cyl(ctx, 0, -0.3, 0, 0.42, 0.08, H, lod > 2 ? 6 : 9);
    ctx.albedo("cdn/texture-dense-pine-needles-foliage.png"); ctx.color("oklch(0.75 0.06 150)");
    const tiers = lod > 2 ? 3 : 6;
    for (let i = 0; i < tiers; i++) {
      const y = 2.2 + (i * (H - 2.6)) / tiers, rad = 2.9 * (1 - i / (tiers + 0.6)) + r() * 0.3;
      cyl(ctx, 0, y, 0, rad, 0.05, 2.6 - i * 0.18, lod > 2 ? 6 : 9, true, (j, k) => (k === 0 ? 0.85 + ((j * 7 + i * 3) % 5) * 0.07 : 1));
    }
    return;
  }
  if (kind === "dead") {
    const H = 6 + r() * 2;
    cyl(ctx, 0, -0.3, 0, 0.35, 0.1, H, 7);
    for (let i = 0; i < 4; i++) { const y = 2.5 + i * 1.0, a = r() * 360; boxR(ctx, [Math.cos(a / 57.3) * 0.8, y + 0.4, Math.sin(a / 57.3) * 0.8], [1.8, 0.1, 0.1], { yaw: -a, roll: 30 }); }
    return;
  }
  // oak: thick trunk, three limbs, lumpy crown
  const H = 4.5 + r() * 1.5;
  cyl(ctx, 0, -0.3, 0, 0.7, 0.42, H, 10);
  const limbs = [];
  for (let i = 0; i < 3; i++) { const a = (i / 3) * 6.28 + r(), l = 2.2; limbs.push([Math.cos(a) * l, H + 1.4, Math.sin(a) * l]); boxR(ctx, [Math.cos(a) * l * 0.5, H + 0.7, Math.sin(a) * l * 0.5], [l * 1.2, 0.35, 0.35], { yaw: -a * 57.3, roll: 35 }); }
  ctx.albedo("cdn/texture-lush-oak-leaves-foliage-hand-painted.png"); ctx.color("oklch(0.8 0.08 135)");
  const n = lod > 2 ? 3 : 7;
  blob(ctx, 0, H + 2.4, 0, 3.2, 2.4, 3.2, 1 + r() * 9, 0.18, 6, 9);
  if (lod <= 2) for (let i = 0; i < n; i++) { const a = r() * 6.28, d = 2 + r(); blob(ctx, Math.cos(a) * d, H + 1.6 + r() * 1.8, Math.sin(a) * d, 1.6, 1.3, 1.6, i + r(), 0.22, 5, 7); }
}
export function collider(ctx) { cyl(ctx, 0, -0.3, 0, (ctx.params?.kind === "oak") ? 0.65 : 0.4, 0.3, 5, 6); }
