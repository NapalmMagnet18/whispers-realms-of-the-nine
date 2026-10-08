// Lantern's Reach stable: an open-fronted oak barn on stone pads, a boarded back wall and half-walled ends, three
// stalls with straw, stacked bales, a saddle on its rail, buckets, under a red clay gable. Origin = ground centre;
// 10 m along X, 6 m deep along Z, open to −Z. The trough, round bales and the lantern's light are child rows.
import { box, boxR, cyl, quadN, triN, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const STONE = T("rough-fieldstone-wall-mossy"), WOOD = T("dark-oak-timber-beam-hand-painted"), PLANK = T("weathered-grey-fence-wood"), FLOOR = T("worn-oak-floor-boards"), HAY = T("golden-straw-hay-bale"), IRON = T("rusted-black-iron-hammered"), ROOF = T("weathered-red-clay-roof-shingles"), LEATHER = T("patched-burlap-sackcloth");
const paint = (ctx, s, tex, col, r = 0.9, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
const L = 5, Dp = 3, EAVE = 3.0, RIDGE = 5.1, OV = 0.7, XS = [-5, -1.67, 1.67, 5];

function build(ctx, s) {
  const lod = ctx.lod || 1;
  // floor: boards under the stalls, straw thrown over the aisle
  paint(ctx, s, FLOOR, "oklch(0.8 0.04 60)"); box(ctx, -L - 0.1, -0.3, -0.2, L + 0.1, 0.1, Dp + 0.1);
  paint(ctx, s, HAY, "oklch(0.82 0.05 85)", 1); box(ctx, -L - 0.1, -0.3, -Dp - 0.1, L + 0.1, 0.08, -0.2);
  // posts on stone pads, plates, tie beams, knee braces
  for (const x of XS) for (const z of [-Dp, Dp]) {
    paint(ctx, s, STONE, "oklch(0.95 0.015 80)"); box(ctx, x - 0.28, -0.3, z - 0.28, x + 0.28, 0.28, z + 0.28);
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)"); box(ctx, x - 0.14, 0.28, z - 0.14, x + 0.14, EAVE, z + 0.14);
  }
  paint(ctx, s, WOOD, "oklch(0.85 0.03 55)");
  for (const z of [-Dp, Dp]) box(ctx, -L - 0.3, EAVE, z - 0.16, L + 0.3, EAVE + 0.26, z + 0.16);
  if (!s) {
    for (const x of XS) {
      box(ctx, x - 0.12, EAVE + 0.02, -Dp, x + 0.12, EAVE + 0.24, Dp);
      boxR(ctx, [x, (EAVE + RIDGE) / 2, 0], [0.14, RIDGE - EAVE, 0.14]); // king post
      if (lod <= 2) for (const sd of [-1, 1]) boxR(ctx, [x, EAVE - 0.45, sd * (Dp - 0.45)], [0.12, 1.15, 0.12], { pitch: sd * 45 });
    }
    if (lod <= 2) for (let i = 0; i < XS.length - 1; i++) for (const sd of [-1, 1]) { boxR(ctx, [XS[i] + 0.45, EAVE - 0.45, -Dp], [1.15, 0.12, 0.12], { roll: -45 }); boxR(ctx, [XS[i + 1] - 0.45, EAVE - 0.45, -Dp], [1.15, 0.12, 0.12], { roll: 45 }); }
  }
  // the boarded back wall and the half-walled ends
  paint(ctx, s, PLANK, "oklch(0.92 0.03 70)");
  if (s) { box(ctx, -L, 0, Dp - 0.06, L, EAVE, Dp + 0.06); for (const x of [-L, L]) box(ctx, x - 0.06, 0, -Dp, x + 0.06, 1.4, Dp); }
  else {
    for (let x = -L + 0.14; x < L - 0.14; x += 0.3) box(ctx, x, 0.1, Dp - 0.05, Math.min(L - 0.14, x + 0.28), EAVE - (Math.round(x * 7) % 3) * 0.02, Dp + 0.05);
    for (const x of [-L, L]) for (let z = -Dp + 0.14; z < Dp - 0.14; z += 0.3) box(ctx, x - 0.05, 0.1, z, x + 0.05, 1.4 - (Math.round(z * 7) % 2) * 0.03, Math.min(Dp - 0.14, z + 0.28));
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)"); for (const x of [-L, L]) box(ctx, x - 0.09, 1.4, -Dp, x + 0.09, 1.52, Dp);
  }
  // stall partitions with capped rails, an iron ring and a bucket in each stall
  paint(ctx, s, PLANK, "oklch(0.92 0.03 70)");
  for (const x of [-1.67, 1.67]) box(ctx, x - 0.05, 0.1, -0.2, x + 0.05, 1.45, Dp);
  if (!s) {
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)");
    for (const x of [-1.67, 1.67]) { box(ctx, x - 0.08, 1.45, -0.2, x + 0.08, 1.55, Dp); box(ctx, x - 0.1, 0.1, -0.35, x + 0.1, 1.75, -0.15); }
    for (const cx of [-3.33, 0, 3.33]) {
      paint(ctx, s, IRON, "oklch(0.5 0.01 60)", 0.5, 0.85); cyl(ctx, cx, 1.3, Dp - 0.1, 0.1, 0.1, 0.04, 8, false);
      paint(ctx, s, FLOOR, "oklch(0.75 0.05 55)"); cyl(ctx, cx + 0.8, 0.1, Dp - 0.45, 0.2, 0.24, 0.32, 10);
      paint(ctx, s, HAY, "oklch(0.95 0.04 85)", 1); blob(ctx, cx - 0.4, 0.1, 1.6, 1.0, 0.32, 0.8, 7 + cx, 0.3, lod > 2 ? 4 : 6, lod > 2 ? 6 : 9);
    }
    // stacked bales at the west end of the aisle, twine bands on each
    for (const [x, y, z] of [[-4.2, 0.08, -1.3], [-4.2, 0.08, -2.2], [-4.2, 0.58, -1.75], [-3.3, 0.08, -2.2]]) {
      paint(ctx, s, HAY, "oklch(0.96 0.04 85)", 1); box(ctx, x - 0.42, y, z - 0.42, x + 0.42, y + 0.5, z + 0.42);
      ctx.albedo(null); ctx.color("oklch(0.55 0.05 70)"); for (const dx of [-0.2, 0.2]) box(ctx, x + dx - 0.02, y - 0.005, z - 0.43, x + dx + 0.02, y + 0.505, z + 0.43);
    }
    // a saddle on the middle partition, a pitchfork leaning on the east post
    paint(ctx, s, LEATHER, "oklch(0.55 0.08 45)", 0.7); blob(ctx, 1.67, 1.62, 1.2, 0.24, 0.12, 0.38, 3, 0.15, 5, 8);
    box(ctx, 1.4, 1.2, 1.15, 1.43, 1.6, 1.25); box(ctx, 1.91, 1.2, 1.15, 1.94, 1.6, 1.25);
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)"); boxR(ctx, [4.65, 0.95, -2.62], [0.04, 1.9, 0.04], { pitch: 10 });
    paint(ctx, s, IRON, "oklch(0.55 0.01 60)", 0.5, 0.8); for (const dx of [-0.07, 0, 0.07]) box(ctx, 4.65 + dx - 0.01, 1.9, -2.8, 4.65 + dx + 0.01, 2.2, -2.78);
    // a lantern hooked under the middle tie beam
    cyl(ctx, 0, 2.55, -1.2, 0.012, 0.012, 0.5, 4, false); cyl(ctx, 0, 2.45, -1.2, 0.18, 0.02, 0.12, 6);
    box(ctx, -0.15, 2.0, -1.35, 0.15, 2.04, -1.05);
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.85); ctx.emissive(4.5, 2.4, 0.8); box(ctx, -0.11, 2.04, -1.31, 0.11, 2.44, -1.09); ctx.emissive(null);
  }
  // the gable: two slopes with shingle courses, a ridge cap, boarded gable ends
  const run = Dp + OV, drop = 0.42, y0 = EAVE + 0.26 - drop, pitch = (Math.atan2(RIDGE - y0, run) * 180) / Math.PI, len = Math.hypot(RIDGE - y0, run);
  paint(ctx, s, ROOF, "oklch(0.95 0.02 50)", 0.85);
  for (const sd of [-1, 1]) boxR(ctx, [0, (RIDGE + y0) / 2, sd * run / 2], [2 * L + 1.0, 0.12, len], { pitch: sd * pitch });
  if (!s) {
    if (lod <= 2) for (let k = 1; k < 7; k++) for (const sd of [-1, 1]) { const t = k / 7; boxR(ctx, [0, y0 + (RIDGE - y0) * t + 0.07, sd * run * (1 - t)], [2 * L + 1.0, 0.04, 0.32], { pitch: sd * (pitch + 6) }); }
    boxR(ctx, [0, RIDGE + 0.06, 0], [2 * L + 1.1, 0.16, 0.34]);
    paint(ctx, s, PLANK, "oklch(0.9 0.03 70)");
    for (const x of [-L, L]) triN(ctx, [x, EAVE + 0.26, -Dp], [x, EAVE + 0.26, Dp], [x, RIDGE - 0.05, 0], [Math.sign(x), 0, 0]);
  }
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
