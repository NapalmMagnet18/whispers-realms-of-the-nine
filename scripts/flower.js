// A flower on a stem: a plant file (heightmap-terrain skill, decorations). The `flower` layer in
// places/main/config.yaml scatters it on the grass beside the blades, sizes each one by the item's
// `scale`, turns it by `randomRotation`, bends it in the wind by the item's `wind`, and colours it by
// the item's `params` (petal, heart, stem). Feet at y = 0, +Y up: two crossed stem quads, five petal
// quads cupped in a ring at the top and a heart quad over them. Every number here is yours to move;
// delete the layer and the flowers are gone.
// params.frame 0..4 picks one painted flower from the creator's sheet (/cdn/flowers-u3nrtlyel.webp, worn through
// scripts/flower-look.js): its head is then one cut-out card tipped toward the sky instead of the five petal quads.
const FRAMES = [[0.010, 0.001, 0.452, 0.446], [0.559, 0.017, 0.425, 0.430], [0.340, 0.336, 0.356, 0.354], [0.000, 0.568, 0.436, 0.428], [0.647, 0.589, 0.353, 0.411]];
export function geometry(ctx) {
  const F = typeof ctx.params.frame === 'number' ? FRAMES[ctx.params.frame % 5] : null;
  const uvs = [];
  const { petal = '#ffffff', heart = '#f2c14e', stem = 'oklch(0.52 0.12 140)' } = ctx.params;
  const h = 0.42;
  const w = 0.012;
  ctx.color(stem);
  for (let p = 0; p < 2; p++) {
    const v = (x, y, z) => (p === 0 ? [x, y, z] : [z, y, -x]);
    const a = v(-w, 0, 0);
    const b = v(w, 0, 0);
    const c = v(w * 0.6, h, 0);
    const d = v(-w * 0.6, h, 0);
    ctx.quad(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    uvs.push(0, 0, 0, 0, 0, 0, 0, 0);
  }
  // The head rides the stem's tip whole, so a gust never tears petals off the stalk.
  ctx.sway(1);
  if (F) {
    const s = ctx.params.size ?? 0.09, tilt = 0.35, ys = Math.sin(tilt) * s, zs = Math.cos(tilt) * s;
    ctx.color('#ffffff');
    ctx.quad(-s, h - ys, -zs, s, h - ys, -zs, s, h + ys, zs, -s, h + ys, zs);
    const [x, y, w, hh] = F;
    uvs.push(10 + x, 1 - y, 10 + x + w, 1 - y, 10 + x + w, 1 - y - hh, 10 + x, 1 - y - hh);
    return { uvs };
  }
  ctx.color(petal);
  const r = 0.06;
  const inner = 0.012;
  for (let i = 0; i < 5; i++) {
    const t0 = (i / 5) * Math.PI * 2;
    const t1 = ((i + 1) / 5) * Math.PI * 2;
    ctx.quad(
      Math.cos(t0) * inner, h, Math.sin(t0) * inner,
      Math.cos(t1) * inner, h, Math.sin(t1) * inner,
      Math.cos(t1) * r, h + 0.015, Math.sin(t1) * r,
      Math.cos(t0) * r, h + 0.015, Math.sin(t0) * r,
    );
  }
  ctx.color(heart);
  ctx.quad(-inner, h + 0.004, -inner, -inner, h + 0.004, inner, inner, h + 0.004, inner, inner, h + 0.004, -inner);
}
