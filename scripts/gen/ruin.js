// Burned-ruin dressing by params.kind: lamppost (bend°, snapped), wax, parchment, rubble, candles. Origin at ground.
import { box, boxR, cyl, blob } from "./shape.js";
const IRON = "rusted-black-iron-hammered", STONE = "rough-fieldstone-wall-mossy", CHAR = "charred-burnt-wood-planks";
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex ? "cdn/texture-" + tex + ".png" : null); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
const WAX = "oklch(0.9 0.025 95)";
function head(ctx, x, y, z, roll) { // a snuffed lantern cage, sooted glass, no flame
  P(ctx, IRON, "oklch(0.55 0.01 60)", 0.6, 0.6);
  boxR(ctx, [x, y, z], [0.34, 0.06, 0.34], { roll }); boxR(ctx, [x, y - 0.5, z], [0.3, 0.06, 0.3], { roll });
  P(ctx, null, "oklch(0.2 0.01 60)", 0.3); boxR(ctx, [x, y - 0.25, z], [0.24, 0.42, 0.24], { roll });
  P(ctx, null, WAX, 0.35); blob(ctx, x, y - 0.62, z, 0.07, 0.12, 0.07, 3, 0.3, 4, 6); // wax drip off the cage
}
function build(ctx, p, s) {
  const k = p.kind;
  if (k === "lamppost") {
    P(ctx, IRON, "oklch(0.7 0.01 60)", 0.6, 0.6);
    if (p.snapped) {
      cyl(ctx, 0, 0, 0, 0.12, 0.09, 1.25, 8); if (s) { box(ctx, -1.9, 0, 0.3, -0.1, 0.16, 0.5); return; }
      cyl(ctx, 0, 0, 0, 0.2, 0.14, 0.35, 8);
      for (let i = 0; i < 4; i++) boxR(ctx, [Math.cos(i * 1.6) * 0.06, 1.3, Math.sin(i * 1.6) * 0.06], [0.04, 0.16 + i * 0.03, 0.04], { roll: i * 9 - 12 });
      boxR(ctx, [-1.0, 0.08, 0.4], [1.75, 0.13, 0.13], { yaw: 8 }); // the fallen upper post
      head(ctx, -2.0, 0.5, 0.45, 70); return;
    }
    const b = p.bend ?? 30, L = 1.7, r = b * Math.PI / 180, tx = -Math.sin(r) * L, ty = 1.7 + Math.cos(r) * L;
    cyl(ctx, 0, 0, 0, 0.12, 0.09, 1.75, 8);
    boxR(ctx, [tx / 2, 1.7 + Math.cos(r) * L / 2, 0], [0.11, L, 0.11], { roll: b });
    if (s) return;
    cyl(ctx, 0, 0, 0, 0.2, 0.14, 0.35, 8);
    blob(ctx, 0, 1.72, 0, 0.13, 0.1, 0.13, 7, 0.2, 4, 6); // the kinked knuckle
    boxR(ctx, [tx + 0.3, ty - 0.03, 0], [0.7, 0.06, 0.06], { roll: b * 0.6 });
    head(ctx, tx + 0.6, ty - 0.1, 0, b * 0.3); return;
  }
  if (k === "wax") { // pale puddles, the Reeve's skin
    P(ctx, null, WAX, 0.28); const n = p.n ?? 5;
    for (let i = 0; i < n; i++) { const a = i * 2.4, d = 0.15 + (i % 3) * 0.35; blob(ctx, Math.cos(a) * d, 0, Math.sin(a) * d, 0.35 - (i % 3) * 0.08, 0.035, 0.28 - (i % 2) * 0.07, i + 1, 0.35, 3, 8); }
    for (let i = 0; i < 3; i++) blob(ctx, -0.2 + i * 0.25, 0.03, 0.1 - i * 0.12, 0.06, 0.1, 0.06, i + 20, 0.3, 4, 6); return;
  }
  if (k === "parchment") {
    P(ctx, "aged-parchment-paper", "oklch(0.88 0.05 85)", 0.95); const n = p.n ?? 7;
    for (let i = 0; i < n; i++) { const a = i * 2.1, d = 0.2 + (i % 4) * 0.3; boxR(ctx, [Math.cos(a) * d, 0.01 + i * 0.004, Math.sin(a) * d], [0.28, 0.008, 0.36], { yaw: i * 47, roll: (i % 3) * 4 - 4 }); }
    P(ctx, null, "oklch(0.18 0.01 50)", 0.95); boxR(ctx, [0.15, 0.05, -0.1], [0.24, 0.008, 0.3], { yaw: 20, roll: 6 }); return; // one sheet burned black
  }
  if (k === "rubble") {
    P(ctx, STONE, "oklch(0.75 0.02 70)"); const n = p.n ?? 8;
    for (let i = 0; i < n; i++) { const a = i * 2.7, d = (i % 4) * 0.35; blob(ctx, Math.cos(a) * d, 0.1, Math.sin(a) * d, 0.28 - (i % 3) * 0.06, 0.2, 0.24, i + 5, 0.35, 4, 7); }
    if (s) return;
    P(ctx, CHAR, "oklch(0.35 0.02 50)", 0.95);
    boxR(ctx, [0.2, 0.35, 0.1], [2.2, 0.18, 0.2], { yaw: 25, roll: 14 }); boxR(ctx, [-0.3, 0.2, -0.4], [1.6, 0.14, 0.16], { yaw: -40, roll: -6 });
    P(ctx, "red-clay-roof-shingles", "oklch(0.7 0.06 35)"); for (let i = 0; i < 6; i++) boxR(ctx, [0.6 - i * 0.22, 0.03, 0.5 - (i % 2) * 0.3], [0.22, 0.03, 0.3], { yaw: i * 33, roll: (i % 3) * 8 }); return;
  }
  if (k === "candles") {
    P(ctx, null, WAX, 0.35); const n = p.n ?? 7;
    blob(ctx, 0, 0, 0, 0.45, 0.04, 0.38, 2, 0.3, 3, 8);
    for (let i = 0; i < n; i++) { const a = i * 2.3, d = 0.08 + (i % 3) * 0.14, h = 0.12 + ((i * 7) % 5) * 0.06; cyl(ctx, Math.cos(a) * d, 0, Math.sin(a) * d, 0.035, 0.03, h, 6);
      if (i % 2 === 0) { ctx.color("oklch(0.85 0.04 220)", 0.9); ctx.emissive(1.4, 1.7, 2.0); blob(ctx, Math.cos(a) * d, h + 0.02, Math.sin(a) * d, 0.012, 0.035, 0.012, i, 0.1, 3, 5); ctx.emissive(null); ctx.color(WAX); }
      else { ctx.color("oklch(0.12 0 0)"); box(ctx, Math.cos(a) * d - 0.004, h, Math.sin(a) * d - 0.004, Math.cos(a) * d + 0.004, h + 0.025, Math.sin(a) * d + 0.004); ctx.color(WAX); } }
    return;
  }
}
export function geometry(ctx) { ctx.flat(); build(ctx, ctx.params || {}, false); }
export function collider(ctx) { build(ctx, ctx.params || {}, true); }
