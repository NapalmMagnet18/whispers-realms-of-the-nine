// The far cathedral spire on the northern ridge: a gothic tower, buttressed, a needle roof, a lit belfry.
import { box, boxR, cyl } from "./shape.js";
export function geometry(ctx) {
  ctx.flat();
  ctx.albedo("cdn/texture-grey-ashlar-stone-blocks-weathered.png"); ctx.color("oklch(0.88 0.01 260)"); ctx.roughness(0.95);
  box(ctx, -9, -4, -9, 9, 26, 9);
  for (const [x, z] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) { box(ctx, x - 1.5, -4, z - 1.5, x + 1.5, 40, z + 1.5); cyl(ctx, x, 40, z, 1.6, 0, 7, 4); }
  box(ctx, -6.5, 26, -6.5, 6.5, 52, 6.5);
  ctx.color("oklch(0.55 0.03 260)"); ctx.albedo("cdn/texture-dark-grey-slate-roof-tiles.png");
  cyl(ctx, 0, 52, 0, 7.2, 0.2, 48, 8);
  if ((ctx.lod || 1) < 4) { ctx.albedo(null); ctx.color("oklch(0.85 0.1 75)"); ctx.emissive(3, 1.8, 0.6);
    for (const [x, z, w, d] of [[0, -6.6, 3, 0.2], [0, 6.6, 3, 0.2], [-6.6, 0, 0.2, 3], [6.6, 0, 0.2, 3]]) box(ctx, x - w / 2, 40, z - d / 2, x + w / 2, 47, z + d / 2);
    ctx.emissive(null); }
}
