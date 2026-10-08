// Graveyard ground cover by params.kind, feet at y=0. No collider (decoration).
// tuft: a clump of dry, bent grass blades · nettle: dark serrated leaves on a stalk · bone: a long bone and a scatter of chips
// skull: a half-buried skull · stone: a toppled grave-marker fragment
import { boxR, triN, blob, cyl } from "./shape.js";
const D = Math.PI / 180;
function blade(ctx, a, h, w, lean, col) {
  const dx = Math.cos(a), dz = Math.sin(a), px = -dz * w, pz = dx * w;
  const tip = [dx * lean, h, dz * lean], mid = [dx * lean * 0.35, h * 0.55, dz * lean * 0.35];
  ctx.color(col);
  const n = [dz, 0.3, -dx];
  triN(ctx, [-px, 0, -pz], [px, 0, pz], [mid[0] + px * 0.6, mid[1], mid[2] + pz * 0.6], n);
  triN(ctx, [-px, 0, -pz], [mid[0] + px * 0.6, mid[1], mid[2] + pz * 0.6], [mid[0] - px * 0.6, mid[1], mid[2] - pz * 0.6], n);
  triN(ctx, [mid[0] - px * 0.6, mid[1], mid[2] - pz * 0.6], [mid[0] + px * 0.6, mid[1], mid[2] + pz * 0.6], tip, n);
}
export function geometry(ctx) {
  const k = ctx.params?.kind || "tuft";
  ctx.albedo(null); ctx.roughness(0.95); ctx.metalness(0);
  if (k === "tuft") {
    const cols = ["oklch(0.62 0.07 85)", "oklch(0.55 0.06 95)", "oklch(0.48 0.05 110)", "oklch(0.68 0.06 80)"];
    const n = ctx.lod > 2 ? 5 : 11;
    for (let i = 0; i < n; i++) blade(ctx, i * 2.4 + ctx.random(), 0.3 + ctx.random() * 0.35, 0.025, 0.12 + ctx.random() * 0.2, cols[i % 4]);
  } else if (k === "nettle") {
    ctx.color("oklch(0.35 0.06 140)");
    cyl(ctx, 0, 0, 0, 0.012, 0.008, 0.55, 4, false);
    for (let i = 0; i < (ctx.lod > 2 ? 3 : 7); i++) {
      const a = i * 2.2, y = 0.1 + i * 0.065, L = 0.16 - i * 0.012, dx = Math.cos(a), dz = Math.sin(a);
      ctx.color(i % 2 ? "oklch(0.3 0.07 145)" : "oklch(0.38 0.08 135)");
      triN(ctx, [0, y, 0], [dx * L - dz * 0.05, y + 0.04, dz * L + dx * 0.05], [dx * L * 1.5, y + 0.02, dz * L * 1.5], [0, 1, 0]);
      triN(ctx, [0, y, 0], [dx * L * 1.5, y + 0.02, dz * L * 1.5], [dx * L + dz * 0.05, y + 0.04, dz * L - dx * 0.05], [0, 1, 0]);
    }
  } else if (k === "bone") {
    ctx.color("oklch(0.85 0.03 85)"); ctx.roughness(0.7);
    boxR(ctx, [0, 0.025, 0], [0.42, 0.04, 0.045], { yaw: 0 });
    for (const x of [-0.22, 0.22]) for (const z of [-0.025, 0.025]) blob(ctx, x, 0.035, z, 0.035, 0.03, 0.032, x * 9 + z, 0.1, 3, 5);
    if (ctx.lod <= 2) for (let i = 0; i < 4; i++) boxR(ctx, [0.1 + ctx.random() * 0.3, 0.012, 0.12 + ctx.random() * 0.15], [0.06, 0.02, 0.025], { yaw: ctx.random() * 180 });
  } else if (k === "skull") {
    ctx.color("oklch(0.84 0.03 85)"); ctx.roughness(0.7);
    blob(ctx, 0, 0.06, 0, 0.1, 0.09, 0.12, 3, 0.05, 5, 8);
    boxR(ctx, [0, 0.02, -0.08], [0.11, 0.06, 0.06]);
    ctx.color("oklch(0.12 0 0)");
    for (const x of [-0.035, 0.035]) boxR(ctx, [x, 0.08, -0.115], [0.04, 0.035, 0.02]);
  } else if (k === "stone") {
    ctx.albedo("cdn/texture-weathered-grey-gravestone.png"); ctx.color("oklch(0.9 0.01 100)");
    boxR(ctx, [0, 0.06, 0], [0.55, 0.12, 0.35], { roll: 4, yaw: 0 });
    ctx.albedo("cdn/texture-thick-green-forest-moss.png"); ctx.color("oklch(0.92 0.03 130)");
    if (ctx.lod <= 2) boxR(ctx, [0.12, 0.125, 0.05], [0.25, 0.015, 0.2]);
  }
}
export function collider() { return null; }
