// A war banner: iron-shod oak pole, crossbar, a long swallow-tailed cloth in the team colour with a pale lantern sigil,
// a gilded finial. params.color = cloth, params.stand = true adds the stone plinth the banner rests in at its base.
// Origin = foot of the pole (or of the plinth).
import { box, boxR, cyl, quadN, triN } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const paint = (ctx, s, tex, col, r = 0.9, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
function build(ctx, s) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  if (p.stand) {
    paint(ctx, s, T("grey-ashlar-stone-blocks-weathered"), "oklch(0.88 0.02 70)");
    cyl(ctx, 0, 0, 0, 1.9, 1.7, 0.35, 12); cyl(ctx, 0, 0.35, 0, 1.2, 1.0, 0.45, 10);
    if (s) return;
    paint(ctx, s, T("rusted-black-iron-plate"), "oklch(0.55 0.03 60)", 0.5, 0.8);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; box(ctx, Math.cos(a) * 1.75 - 0.08, 0.34, Math.sin(a) * 1.75 - 0.08, Math.cos(a) * 1.75 + 0.08, 0.42, Math.sin(a) * 1.75 + 0.08); }
    return;
  }
  paint(ctx, s, T("dark-oak-timber-beam-hand-painted"), "oklch(0.85 0.04 55)");
  cyl(ctx, 0, 0, 0, 0.07, 0.06, 4.2, 8);
  if (s) return;
  boxR(ctx, [0.6, 3.85, 0], [1.4, 0.07, 0.07]);
  paint(ctx, s, T("rusted-black-iron-plate"), "oklch(0.8 0.1 85)", 0.35, 0.9);
  cyl(ctx, 0, 4.2, 0, 0.11, 0.02, 0.4, 8); cyl(ctx, 0, 0, 0, 0.09, 0.09, 0.25, 8);
  ctx.albedo(null); ctx.color(p.color || "#f2b04a"); ctx.roughness(0.95); ctx.metalness(0); ctx.doubleSided?.(true);
  const N = lod <= 2 ? 6 : 2, x0 = 0.08, x1 = 1.3, top = 3.82, bot = 1.6;
  for (let i = 0; i < N; i++) { // the cloth, gently rippled
    const ya = top - (top - bot) * i / N, yb = top - (top - bot) * (i + 1) / N, za = Math.sin(i * 0.9) * 0.06, zb = Math.sin((i + 1) * 0.9) * 0.06;
    quadN(ctx, [x0, yb, zb], [x1, yb, zb], [x1, ya, za], [x0, ya, za], [0, 0, 1]);
    quadN(ctx, [x1, yb, zb + 0.01], [x0, yb, zb + 0.01], [x0, ya, za + 0.01], [x1, ya, za + 0.01], [0, 0, -1]);
  }
  const zt = Math.sin(N * 0.9) * 0.06; // the swallow tail
  triN(ctx, [x0, bot, zt], [x0 + 0.5, bot, zt], [x0, bot - 0.5, zt], [0, 0, 1]); triN(ctx, [x0 + 0.5, bot, zt], [x0, bot - 0.5, zt], [x0, bot, zt], [0, 0, -1]);
  triN(ctx, [x1 - 0.5, bot, zt], [x1, bot, zt], [x1, bot - 0.5, zt], [0, 0, 1]); triN(ctx, [x1, bot, zt], [x1 - 0.5, bot, zt], [x1, bot - 0.5, zt], [0, 0, -1]);
  ctx.color("#e8d9b5"); // the lantern sigil
  const cx = 0.69, cy = 2.85, z = 0.08;
  quadN(ctx, [cx - 0.18, cy - 0.28, z], [cx + 0.18, cy - 0.28, z], [cx + 0.14, cy + 0.2, z], [cx - 0.14, cy + 0.2, z], [0, 0, 1]);
  triN(ctx, [cx - 0.2, cy + 0.2, z], [cx + 0.2, cy + 0.2, z], [cx, cy + 0.45, z], [0, 0, 1]);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
