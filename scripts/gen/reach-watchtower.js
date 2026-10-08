// Lantern's Reach watchtower: a tapered fieldstone base with quoins and arrow slits, corbelled to an oak lookout
// with board railings and braces under a red clay pyramid roof, a hanging lantern at the top, a ladder up the +Z
// face through a hatch in the floor. Origin = ground centre. The lantern's light rides as a child of the placement.
import { box, boxR, cyl, quadN, triN } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const STONE = T("rough-fieldstone-wall-mossy"), ASHLAR = T("grey-ashlar-stone-blocks-weathered"), WOOD = T("dark-oak-timber-beam-hand-painted"), PLANK = T("worn-oak-floor-boards"), IRON = T("rusted-black-iron-hammered"), ROOF = T("weathered-red-clay-roof-shingles");
const paint = (ctx, s, tex, col, r = 0.9, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
const B0 = 2.35, B1 = 2.05, H = 6.4, FL = 6.7, PH = 10.5, E = 3.05, APEX = 13.5;
const half = (y) => B0 + (B1 - B0) * (y / H);

function frustum(ctx, y0, y1, h0, h1) {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < 4; i++) {
    const a = c[i], b = c[(i + 1) % 4], n = [a[0] + b[0], 0, a[1] + b[1]];
    quadN(ctx, [a[0] * h0, y0, a[1] * h0], [b[0] * h0, y0, b[1] * h0], [b[0] * h1, y1, b[1] * h1], [a[0] * h1, y1, a[1] * h1], n);
  }
  quadN(ctx, [-h1, y1, -h1], [h1, y1, -h1], [h1, y1, h1], [-h1, y1, h1], [0, 1, 0]);
}
function build(ctx, s) {
  const lod = ctx.lod || 1;
  paint(ctx, s, ASHLAR, "oklch(0.9 0.02 70)");
  box(ctx, -2.65, -2, -2.65, 2.65, 0.35, 2.65);
  paint(ctx, s, STONE, "oklch(0.95 0.015 80)");
  frustum(ctx, 0.35, H, half(0.35), B1);
  if (!s) {
    if (lod <= 2) { // quoins, alternating long and short, on every corner
      paint(ctx, s, ASHLAR, "oklch(0.93 0.02 75)");
      for (let y = 0.4, k = 0; y < H - 0.3; y += 0.55, k++) {
        const h = half(y + 0.25) + 0.03, l = k % 2 ? 0.7 : 0.45, m = k % 2 ? 0.45 : 0.7;
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx > 0 ? h - l : -h, y, sz > 0 ? h - m : -h, sx > 0 ? h : -h + l, y + 0.5, sz > 0 ? h : -h + m);
      }
    }
    // a corbelled string course under the lookout
    paint(ctx, s, ASHLAR, "oklch(0.92 0.02 75)");
    box(ctx, -2.3, H - 0.25, -2.3, 2.3, H + 0.05, 2.3);
    for (let i = -2; i <= 2; i++) for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t = i * 0.9; const cx = ax ? ax * 2.3 : t, cz = az ? az * 2.3 : t;
      box(ctx, cx - (ax ? 0.12 : 0.18), H - 0.6, cz - (az ? 0.12 : 0.18), cx + (ax ? 0.12 : 0.18), H - 0.25, cz + (az ? 0.12 : 0.18));
    }
    ctx.albedo(null); ctx.color("oklch(0.17 0.02 50)"); ctx.roughness(1); // arrow slits
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, -1]]) for (const y of [2.0, 4.3]) {
      const h = half(y + 0.5) + 0.01;
      if (nx) box(ctx, nx * h - 0.02, y, -0.08, nx * h + 0.02, y + 1.0, 0.08); else box(ctx, -0.08, y, nz * h - 0.02, 0.08, y + 1.0, nz * h + 0.02);
    }
    // an iron-bound door at the foot, barred
    paint(ctx, s, PLANK, "oklch(0.82 0.04 55)"); box(ctx, -0.55, 0.35, -half(0.4) - 0.08, 0.55, 2.3, -half(0.4) + 0.02);
    paint(ctx, s, IRON, "oklch(0.5 0.01 60)", 0.55, 0.8); for (const y of [0.8, 1.9]) box(ctx, -0.58, y, -half(0.4) - 0.12, 0.58, y + 0.08, -half(0.4) - 0.07);
    paint(ctx, s, ASHLAR, "oklch(0.92 0.02 75)"); box(ctx, -0.8, 2.3, -half(2.3) - 0.12, 0.8, 2.6, -half(2.3) + 0.05);
  }
  // the lookout floor, a hatch left open over the ladder
  paint(ctx, s, PLANK, "oklch(0.9 0.04 60)");
  box(ctx, -2.6, H, -2.6, 2.6, FL, 1.95); box(ctx, -2.6, H, 1.95, -0.5, FL, 2.6); box(ctx, 0.5, H, 1.95, 2.6, FL, 2.6);
  paint(ctx, s, WOOD, "oklch(0.85 0.03 55)");
  for (const x of [-2.4, 2.4]) for (const z of [-2.4, 2.4]) box(ctx, x - 0.13, FL, z - 0.13, x + 0.13, PH, z + 0.13);
  if (!s) {
    for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { // rails, braces, the head beam
      const along = (a0, a1, y0, y1, th) => ax ? box(ctx, ax * 2.4 - th, y0, a0, ax * 2.4 + th, y1, a1) : box(ctx, a0, y0, az * 2.4 - th, a1, y1, az * 2.4 + th);
      along(-2.4, 2.4, PH - 0.3, PH, 0.13);
      along(-2.4, 2.4, FL + 1.0, FL + 1.12, 0.09);
      if (lod <= 2) { const r = ax ? { yaw: 90, roll: 35 } : { roll: -35 }; const r2 = ax ? { yaw: 90, roll: -35 } : { roll: 35 };
        boxR(ctx, [ax * 2.4, PH - 0.95, az * 2.4 + (ax ? 1.55 : 0) * 0 + (ax ? 0 : 0)].map((v, i) => i === 0 && !ax ? -1.55 : i === 2 && ax ? -1.55 : v), [1.3, 0.12, 0.1], r);
        boxR(ctx, [ax * 2.4, PH - 0.95, az * 2.4].map((v, i) => i === 0 && !ax ? 1.55 : i === 2 && ax ? 1.55 : v), [1.3, 0.12, 0.1], r2); }
    }
    paint(ctx, s, PLANK, "oklch(0.86 0.04 55)"); // board half-walls, the gap at the ladder
    for (let i = 0; i < 4; i++) {
      const ax = [1, -1, 0, 0][i], az = [0, 0, 1, -1][i];
      const spans = az === 1 ? [[-2.3, -0.55], [0.55, 2.3]] : [[-2.3, 2.3]];
      for (const [a0, a1] of spans) for (let p = a0; p < a1 - 0.01; p += 0.33) {
        const p1 = Math.min(a1, p + 0.31);
        if (ax) box(ctx, ax * 2.4 - 0.04, FL, p, ax * 2.4 + 0.04, FL + 1.0 - (Math.round(p * 3) % 2) * 0.04, p1);
        else box(ctx, p, FL, az * 2.4 - 0.04, p1, FL + 1.0 - (Math.round(p * 3) % 2) * 0.04, az * 2.4 + 0.04);
      }
    }
  } else { for (const [a, b] of [[[2.35, -2.4], [2.45, 2.4]], [[-2.45, -2.4], [-2.35, 2.4]], [[-2.4, -2.45], [2.4, -2.35]], [[-2.4, 2.35], [-0.55, 2.45]], [[0.55, 2.35], [2.4, 2.45]]]) box(ctx, a[0], FL, a[1], b[0], FL + 1.1, b[1]); }
  // pyramid roof of red clay, fascia, a crown and an iron finial
  paint(ctx, s, ROOF, "oklch(0.95 0.02 50)", 0.85);
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; triN(ctx, [a[0] * E, PH, a[1] * E], [b[0] * E, PH, b[1] * E], [0, APEX, 0], [a[0] + b[0], 0.9, a[1] + b[1]]); }
  if (!s) {
    for (let k = 1; k < (lod <= 2 ? 7 : 1); k++) { // shingle courses: proud steps across each slope
      const t = k / 7, y = PH + (APEX - PH) * t, h = E * (1 - t) + 0.02;
      for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], n = [a[0] + b[0], 0.9, a[1] + b[1]], o = 0.05;
        quadN(ctx, [a[0] * (h + o), y - 0.18, a[1] * (h + o)], [b[0] * (h + o), y - 0.18, b[1] * (h + o)], [b[0] * h, y, b[1] * h], [a[0] * h, y, a[1] * h], n); }
    }
    paint(ctx, s, WOOD, "oklch(0.8 0.03 55)"); frustum(ctx, PH - 0.22, PH, E + 0.02, E + 0.02);
    paint(ctx, s, IRON, "oklch(0.5 0.01 60)", 0.5, 0.85); cyl(ctx, 0, APEX - 0.15, 0, 0.18, 0.02, 0.9, 8); cyl(ctx, 0, APEX + 0.3, 0, 0.09, 0.09, 0.05, 8);
    // the lantern at the top, hung from a cross-beam under the roof
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)"); box(ctx, -2.4, PH - 0.25, -0.1, 2.4, PH - 0.05, 0.1);
    paint(ctx, s, IRON, "oklch(0.6 0.01 60)", 0.5, 0.8);
    cyl(ctx, 0, 9.55, 0, 0.015, 0.015, 0.7, 4, false); cyl(ctx, 0, 9.4, 0, 0.32, 0.03, 0.22, 8);
    box(ctx, -0.26, 8.65, -0.26, 0.26, 8.72, 0.26);
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(ctx, dx * 0.24 - 0.025, 8.72, dz * 0.24 - 0.025, dx * 0.24 + 0.025, 9.4, dz * 0.24 + 0.025);
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.85); ctx.emissive(5, 2.6, 0.9); box(ctx, -0.2, 8.72, -0.2, 0.2, 9.38, 0.2); ctx.emissive(null);
    // the ladder, leaning on the +Z face, through the hatch
    paint(ctx, s, WOOD, "oklch(0.85 0.03 55)");
    const zb = 3.05, zt = 2.15, yb = -1.2, yt = FL + 1.0, tilt = (Math.atan2(zb - zt, yt - yb) * 180) / Math.PI, len = Math.hypot(zb - zt, yt - yb);
    for (const x of [-0.32, 0.32]) boxR(ctx, [x, (yb + yt) / 2, (zb + zt) / 2], [0.09, len, 0.09], { pitch: -tilt });
    for (let y = yb + 0.3; y < yt - 0.2; y += 0.32) { const z = zb + (zt - zb) * ((y - yb) / (yt - yb)); box(ctx, -0.3, y - 0.025, z - 0.03, 0.3, y + 0.025, z + 0.03); }
  }
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
