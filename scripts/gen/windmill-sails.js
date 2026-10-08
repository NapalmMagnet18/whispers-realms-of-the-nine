// Four lattice sails with canvas, hub at origin, spinning about Z (faces −Z).
import { box, boxR, cyl } from "./shape.js";
export function geometry(ctx) {
  const L = ctx.lod ?? 1; ctx.flat();
  ctx.albedo("cdn/texture-dark-oak-timber-beam-hand-painted.png"); ctx.color("oklch(0.88 0.02 60)"); ctx.roughness(0.85);
  boxR(ctx, [0, 0, 0], [0.9, 0.9, 0.5]);
  for (let k = 0; k < 4; k++) {
    const a = k * 90, rad = a * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
    boxR(ctx, [c * 4.4, s * 4.4, -0.1], [8.6, 0.22, 0.18], { roll: a });
    if (L <= 3) for (let i = 1; i <= 7; i++) { const d = 1.1 + i * 0.95; boxR(ctx, [c * d - s * 0.75, s * d + c * 0.75, -0.18], [0.07, 1.6, 0.07].map((v, j) => v), { roll: a }); }
    ctx.albedo("cdn/texture-weathered-sailcloth-canvas.png"); ctx.color("oklch(0.93 0.03 85)");
    boxR(ctx, [c * 5.1 - s * 0.75, s * 5.1 + c * 0.75, -0.24], [6.6, 1.4, 0.03], { roll: a });
    ctx.albedo("cdn/texture-dark-oak-timber-beam-hand-painted.png"); ctx.color("oklch(0.88 0.02 60)");
  }
}
export function collider() { return null; }
