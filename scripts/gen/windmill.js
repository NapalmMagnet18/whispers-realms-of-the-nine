// Lantern's Reach windmill: mossy fieldstone tower (octagonal, tapering), timber-framed plaster upper storey,
// shingle cap, plank door in −Z with stone step, two shuttered windows. Sails are their own object (windmill-sails.js)
// on the axle at [0, 11.2, -3.15] local, facing −Z. origin = ground centre.
import { box, boxR, cyl } from "./shape.js";
const STONE = "cdn/texture-rough-fieldstone-wall-mossy.png", WOOD = "cdn/texture-dark-oak-timber-beam-hand-painted.png",
  PLASTER = "cdn/texture-limewash-plaster-wall-aged.png", SHINGLE = "cdn/texture-weathered-red-clay-roof-shingles.png", PLANK = "cdn/texture-worn-oak-floor-boards.png";
const SEG = 8;
function oct(ctx, y0, y1, r0, r1, hole) { // octagonal shell, outward quads, optional door gap on −Z face (i==6)
  for (let i = 0; i < SEG; i++) {
    if (hole && hole(i)) continue;
    const a0 = (i / SEG) * Math.PI * 2 + Math.PI / 8, a1 = ((i + 1) / SEG) * Math.PI * 2 + Math.PI / 8;
    const p = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    const A = p(a0, r0, y0), B = p(a1, r0, y0), C = p(a1, r1, y1), D = p(a0, r1, y1);
    ctx.quad(...A, ...D, ...C, ...B);
  }
}
export function geometry(ctx) {
  const L = ctx.lod ?? 1;
  ctx.flat();
  // tower
  ctx.albedo(STONE); ctx.color("oklch(0.93 0.02 90)"); ctx.roughness(0.95);
  oct(ctx, -0.4, 7, 3.6, 3.0);
  if (L <= 3) { cyl(ctx, 0, -0.4, 0, 3.85, 3.75, 0.7, SEG, false); cyl(ctx, 0, 6.8, 0, 3.15, 3.25, 0.35, SEG, false); }
  // upper storey
  ctx.albedo(PLASTER); ctx.color("oklch(0.95 0.025 85)"); ctx.roughness(0.9);
  oct(ctx, 7, 10.4, 3.05, 2.7);
  if (L <= 3) {
    ctx.albedo(WOOD); ctx.color("oklch(0.9 0.02 60)");
    for (let i = 0; i < SEG; i++) { const a = (i / SEG) * Math.PI * 2 + Math.PI / 8; boxR(ctx, [Math.cos(a) * 2.95, 8.7, Math.sin(a) * 2.95], [0.22, 3.5, 0.22], { yaw: -a * 57.3, roll: 0 }); }
    cyl(ctx, 0, 7.0, 0, 3.12, 3.1, 0.25, SEG, false); cyl(ctx, 0, 10.2, 0, 2.82, 2.8, 0.25, SEG, false);
    // gallery ring and rail
    ctx.albedo(PLANK); ctx.color("oklch(0.9 0.03 60)"); cyl(ctx, 0, 6.95, 0, 3.9, 3.9, 0.14, SEG, true);
    ctx.albedo(WOOD); for (let i = 0; i < SEG; i++) { const a = (i / SEG) * Math.PI * 2; box(ctx, Math.cos(a) * 3.8 - 0.06, 7.1, Math.sin(a) * 3.8 - 0.06, Math.cos(a) * 3.8 + 0.06, 8.0, Math.sin(a) * 3.8 + 0.06); }
    cyl(ctx, 0, 7.95, 0, 3.86, 3.86, 0.08, SEG, false);
  }
  // cap
  ctx.albedo(SHINGLE); ctx.color("oklch(0.9 0.04 40)"); ctx.roughness(0.85);
  cyl(ctx, 0, 10.4, 0, 3.15, 0.25, 3.2, SEG, true);
  if (L <= 2) { ctx.albedo(WOOD); ctx.color("oklch(0.85 0.02 60)"); cyl(ctx, 0, 13.5, 0, 0.12, 0.05, 0.9, 6); }
  // axle housing toward −Z
  ctx.albedo(WOOD); ctx.color("oklch(0.9 0.02 60)"); boxR(ctx, [0, 11.2, -2.6], [0.7, 0.7, 1.4]);
  if (L <= 3) {
    // door + step + frame
    ctx.albedo(PLANK); ctx.color("oklch(0.75 0.05 55)"); box(ctx, -0.65, 0, -3.62, 0.65, 2.3, -3.5);
    ctx.albedo(WOOD); ctx.color("oklch(0.85 0.02 60)"); box(ctx, -0.85, 0, -3.7, -0.65, 2.5, -3.45); box(ctx, 0.65, 0, -3.7, 0.85, 2.5, -3.45); box(ctx, -0.85, 2.3, -3.7, 0.85, 2.55, -3.45);
    ctx.albedo(STONE); ctx.color("oklch(0.9 0.01 90)"); box(ctx, -1.0, -0.2, -4.3, 1.0, 0.18, -3.5);
    ctx.albedo(null); ctx.color("oklch(0.35 0.04 60)"); ctx.roughness(0.4); cyl(ctx, 0.45, 1.1, -3.66, 0.05, 0.05, 0.06, 6);
    // windows: warm lit panes with shutters
    for (const [a, y] of [[Math.PI * 0.5 + 0.0, 4.0], [-Math.PI * 0.5 + 0.6, 8.6], [Math.PI * 0.9, 8.6]]) {
      const r = y < 7 ? 3.28 : 2.92, x = Math.cos(a) * r, z = Math.sin(a) * r, yaw = -a * 57.3 + 90;
      ctx.albedo(null); ctx.color("oklch(0.85 0.13 75)"); ctx.emissive(2.4, 1.4, 0.5); boxR(ctx, [x, y, z], [0.8, 1.0, 0.1], { yaw }); ctx.emissive(null);
      ctx.albedo(WOOD); ctx.color("oklch(0.6 0.08 140)"); for (const s of [-1, 1]) boxR(ctx, [x + Math.cos(a + Math.PI / 2) * s * 0.65, y, z + Math.sin(a + Math.PI / 2) * s * 0.65], [0.45, 1.05, 0.06], { yaw });
      ctx.color("oklch(0.85 0.02 60)"); boxR(ctx, [x, y - 0.56, z], [1.0, 0.1, 0.2], { yaw });
    }
  }
}
export function collider(ctx) { return { kind: "box", width: 6.6, height: 10.4, depth: 6.6 }; }
