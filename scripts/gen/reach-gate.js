// Lantern's Reach east gate: two fieldstone piers, a round voussoir arch, a crenellated walk, oak doors swung open
// toward town, two iron lanterns on the quarry face. Origin = ground centre; width along X (10 m), the road runs
// along Z (4 m deep); −Z is the quarry face. The lights ride as children of the placement.
import { box, boxR, cyl, quadN } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const STONE = T("rough-fieldstone-wall-mossy"), ASHLAR = T("grey-ashlar-stone-blocks-weathered"), WOOD = T("dark-oak-timber-beam-hand-painted"), PLANK = T("worn-oak-floor-boards"), IRON = T("rusted-black-iron-hammered");
const HW = 2, SPRING = 4, R = 2, TOP = 7.2, D = 2, PI = Math.PI;
const paint = (ctx, s, tex, col, r = 0.9, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };

function leaf(ctx, s, side) {
  // hinge at the inner pier edge, town side; the leaf swung ~105° open, lying back toward the town face
  const hx = side * HW, hz = D - 0.35, dir = [side * 0.26, 0.966];
  const yaw = (Math.atan2(-dir[1], dir[0]) * 180) / PI, c = Math.cos((yaw * PI) / 180), sn = Math.sin((yaw * PI) / 180);
  const at = (u, v, w) => [hx + u * c + w * sn, v, hz - u * sn + w * c];
  if (s) { boxR(ctx, at(1, 2.2, 0), [2, 4.4, 0.14], { yaw }); return; }
  paint(ctx, s, PLANK, "oklch(0.86 0.04 55)", 0.85);
  for (let k = 0; k < 5; k++) boxR(ctx, at(0.2 + 0.4 * k, 2.2, 0), [0.38, 4.4 - (k % 2) * 0.06, 0.12], { yaw });
  paint(ctx, s, WOOD, "oklch(0.8 0.03 55)");
  for (const v of [0.7, 3.6]) boxR(ctx, at(1, v, -0.09), [1.9, 0.22, 0.06], { yaw });
  boxR(ctx, at(1, 2.15, -0.09), [2.5, 0.2, 0.06], { yaw, roll: 52 });
  paint(ctx, s, IRON, "oklch(0.55 0.01 60)", 0.55, 0.8);
  for (const v of [0.7, 2.2, 3.6]) for (const w of [-0.075, 0.075]) boxR(ctx, at(0.75, v, w), [1.4, 0.09, 0.025], { yaw });
  for (const v of [0.7, 2.2, 3.6]) cyl(ctx, ...at(0, v - 0.18, 0).map((q, i) => (i === 1 ? q : q)), 0.06, 0.06, 0.36, 6);
  cyl(ctx, ...at(1.75, 1.9, 0.1), 0.09, 0.09, 0.05, 8);
}
function lantern(ctx, s, x) {
  if (s) return;
  const z = -D;
  paint(ctx, s, IRON, "oklch(0.6 0.01 60)", 0.5, 0.8);
  box(ctx, x - 0.15, 5.35, z - 0.04, x + 0.15, 5.75, z);            // wall plate
  box(ctx, x - 0.04, 5.5, z - 0.85, x + 0.04, 5.58, z);             // arm
  boxR(ctx, [x, 5.25, z - 0.35], [0.05, 0.6, 0.05], { pitch: -55 }); // strut
  cyl(ctx, x, 5.0, z - 0.8, 0.012, 0.012, 0.5, 4, false);           // hanger
  cyl(ctx, x, 4.92, z - 0.8, 0.24, 0.02, 0.18, 6);                  // cap
  box(ctx, x - 0.2, 4.4, z - 1.0, x + 0.2, 4.46, z - 0.6);
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(ctx, x + dx - 0.02, 4.46, z - 0.8 + dz - 0.02, x + dx + 0.02, 4.92, z - 0.8 + dz + 0.02);
  ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.85); ctx.emissive(4.5, 2.4, 0.8);
  box(ctx, x - 0.15, 4.46, z - 0.95, x + 0.15, 4.9, z - 0.65); ctx.emissive(null);
}
function build(ctx, s) {
  const lod = ctx.lod || 1;
  // buried ashlar footings, a plinth course showing on the downhill side
  paint(ctx, s, ASHLAR, "oklch(0.9 0.02 70)");
  for (const sd of [-1, 1]) box(ctx, sd < 0 ? -5.4 : 1.8, -1.6, -D - 0.35, sd < 0 ? -1.8 : 5.4, 0.55, D + 0.35);
  paint(ctx, s, STONE, "oklch(0.95 0.015 80)");
  box(ctx, -5, 0.5, -D, -HW, TOP, D); box(ctx, HW, 0.5, -D, 5, TOP, D);
  if (s) { box(ctx, -HW, 5.8, -D, HW, TOP + 0.3, D); }
  else {
    const N = lod > 2 ? 6 : 16; // the arch infill: front/back faces between the curve and the walk, and the intrados
    for (let i = 0; i < N; i++) {
      const a0 = (PI * i) / N, a1 = (PI * (i + 1)) / N;
      const p0 = [-Math.cos(a0) * R, SPRING + Math.sin(a0) * R], p1 = [-Math.cos(a1) * R, SPRING + Math.sin(a1) * R];
      for (const z of [-D, D]) quadN(ctx, [p0[0], p0[1], z], [p1[0], p1[1], z], [p1[0], TOP, z], [p0[0], TOP, z], [0, 0, Math.sign(z)]);
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      quadN(ctx, [p0[0], p0[1], -D], [p1[0], p1[1], -D], [p1[0], p1[1], D], [p0[0], p0[1], D], [-mx, SPRING - my, 0]);
    }
    // voussoirs proud of both faces, a keystone at the crown
    paint(ctx, s, ASHLAR, "oklch(0.93 0.02 75)");
    const V = lod > 2 ? 5 : 11;
    for (let i = 0; i < V; i++) {
      const a = (PI * (i + 0.5)) / V, key = i === (V - 1) / 2, rr = R + 0.32;
      for (const z of [-D - 0.07, D + 0.07]) boxR(ctx, [-Math.cos(a) * rr, SPRING + Math.sin(a) * rr, z], [key ? 0.8 : 0.62, key ? 0.62 : 0.5, 0.16], { roll: 180 - (a * 180) / PI });
    }
    // impost course at the springing, string course under the walk
    for (const sd of [-1, 1]) {
      box(ctx, sd < 0 ? -5.1 : HW - 0.1, SPRING - 0.28, -D - 0.12, sd < 0 ? -HW + 0.1 : 5.1, SPRING, D + 0.12);
      // buttresses on the quarry face
      box(ctx, sd < 0 ? -5.3 : 4.3, 0.5, -D - 0.5, sd < 0 ? -4.3 : 5.3, 3.2, -D);
      boxR(ctx, [sd * 4.8, 3.45, -D - 0.25], [1.0, 0.18, 0.62], { pitch: -28 });
    }
    // arrow slits
    ctx.albedo(null); ctx.color("oklch(0.18 0.02 50)"); ctx.roughness(1);
    for (const x of [-3.5, 3.5]) for (const z of [-D - 0.01, D + 0.01]) box(ctx, x - 0.08, 5.0, z - 0.01, x + 0.08, 6.3, z + 0.01);
    // banners of the Reach: oxblood with a gold lantern band
    for (const x of [-3.5, 3.5]) {
      ctx.color("oklch(0.42 0.12 28)"); ctx.roughness(0.95);
      box(ctx, x - 0.45, 3.1, D + 0.02, x + 0.45, 4.6, D + 0.06);
      ctx.color("oklch(0.78 0.13 80)"); box(ctx, x - 0.45, 3.85, D + 0.06, x + 0.45, 4.0, D + 0.08);
      ctx.color("oklch(0.42 0.12 28)"); quadN(ctx, [x - 0.45, 3.1, D + 0.04], [x + 0.45, 3.1, D + 0.04], [x, 2.75, D + 0.04], [x - 0.45, 3.1, D + 0.04], [0, 0, 1]);
      paint(ctx, s, WOOD, "oklch(0.8 0.03 55)"); box(ctx, x - 0.55, 4.6, D, x + 0.55, 4.7, D + 0.12);
    }
  }
  // the wall walk and its crenellations
  paint(ctx, s, ASHLAR, "oklch(0.92 0.02 75)");
  box(ctx, -5.25, TOP, -D - 0.22, 5.25, TOP + 0.3, D + 0.22);
  paint(ctx, s, STONE, "oklch(0.95 0.015 80)");
  for (const z of [-1, 1]) {
    const z0 = z < 0 ? -D - 0.1 : D - 0.35, z1 = z < 0 ? -D + 0.35 : D + 0.1;
    box(ctx, -5.1, TOP + 0.3, z0, 5.1, TOP + 0.75, z1);
    if (!s || true) for (let x = -4.7; x <= 4.8; x += 1.35) box(ctx, x - 0.35, TOP + 0.75, z0, x + 0.35, TOP + 1.65, z1);
  }
  for (const sd of [-1, 1]) box(ctx, sd * 5.1 - (sd < 0 ? 0 : 0.35), TOP + 0.3, -D + 0.35, sd * 5.1 + (sd < 0 ? 0.35 : 0), TOP + 0.75, D - 0.35);
  leaf(ctx, s, -1); leaf(ctx, s, 1);
  lantern(ctx, s, -2.9); lantern(ctx, s, 2.9);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
