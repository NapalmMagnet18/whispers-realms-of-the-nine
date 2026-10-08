// The Ashen graveyard's ground cover in one mesh: dry grass tufts, nettles thick at the fence, bones, skulls,
// toppled marker stones. Origin = yard centre; params { r: radius, n: tufts, holeW, holeD: the cathedral footprint kept clear }.
// Seated with ctx.groundY so every tuft stands on the ground. No collider.
import { boxR, triN, blob, cyl } from "./shape.js";
function blade(ctx, x, y, z, a, h, w, lean, col) {
  const dx = Math.cos(a), dz = Math.sin(a), px = -dz * w, pz = dx * w;
  const tip = [x + dx * lean, y + h, z + dz * lean], mx = x + dx * lean * 0.35, my = y + h * 0.55, mz = z + dz * lean * 0.35;
  ctx.color(col);
  const n = [dz, 0.3, -dx];
  triN(ctx, [x - px, y, z - pz], [x + px, y, z + pz], [mx + px * 0.6, my, mz + pz * 0.6], n);
  triN(ctx, [x - px, y, z - pz], [mx + px * 0.6, my, mz + pz * 0.6], [mx - px * 0.6, my, mz - pz * 0.6], n);
  triN(ctx, [mx - px * 0.6, my, mz - pz * 0.6], [mx + px * 0.6, my, mz + pz * 0.6], tip, n);
}
export function geometry(ctx) {
  const { r = 34, n = 700, holeW = 38, holeD = 18, holeX = 2 } = ctx.params || {};
  const lod = ctx.lod, R = () => ctx.random();
  ctx.albedo(null); ctx.roughness(0.95); ctx.metalness(0);
  const inHole = (x, z) => Math.abs(x - holeX) < holeW / 2 && Math.abs(z) < holeD / 2;
  const pick = (minR = 0) => { for (let t = 0; t < 8; t++) { const a = R() * Math.PI * 2, d = Math.sqrt(minR * minR / (r * r) + R() * (1 - minR * minR / (r * r))) * r, x = Math.cos(a) * d, z = Math.sin(a) * d; if (!inHole(x, z)) return [x, z]; } return null; };
  const cols = ["oklch(0.62 0.07 85)", "oklch(0.55 0.06 95)", "oklch(0.48 0.05 110)", "oklch(0.68 0.06 80)"];
  const tufts = lod >= 4 ? 40 : lod >= 3 ? n / 3 : n;
  for (let i = 0; i < tufts; i++) {
    const p = pick(); if (!p) continue; const [x, z] = p, y = ctx.groundY(x, z) - 0.02, s = 0.7 + R() * 0.8;
    const k = lod >= 4 ? 2 : lod >= 3 ? 4 : 8;
    for (let j = 0; j < k; j++) blade(ctx, x + (R() - 0.5) * 0.1, y, z + (R() - 0.5) * 0.1, j * 2.4 + R(), (0.28 + R() * 0.32) * s, 0.025, (0.1 + R() * 0.2) * s, cols[(i + j) % 4]);
  }
  if (lod >= 3) return;
  // nettles: thick near the fence ring
  for (let i = 0; i < 260; i++) {
    const p = pick(r * 0.62); if (!p) continue; const [x, z] = p, y = ctx.groundY(x, z), s = 0.8 + R() * 0.9;
    ctx.color("oklch(0.35 0.06 140)"); cyl(ctx, x, y, z, 0.012, 0.008, 0.55 * s, 4, false);
    for (let j = 0; j < 6; j++) {
      const a = j * 2.2 + i, yy = y + (0.1 + j * 0.065) * s, L = (0.16 - j * 0.012) * s, dx = Math.cos(a), dz = Math.sin(a);
      ctx.color(j % 2 ? "oklch(0.3 0.07 145)" : "oklch(0.38 0.08 135)");
      triN(ctx, [x, yy, z], [x + dx * L - dz * 0.05, yy + 0.04, z + dz * L + dx * 0.05], [x + dx * L * 1.5, yy + 0.02, z + dz * L * 1.5], [0, 1, 0]);
      triN(ctx, [x, yy, z], [x + dx * L * 1.5, yy + 0.02, z + dz * L * 1.5], [x + dx * L + dz * 0.05, yy + 0.04, z + dz * L - dx * 0.05], [0, 1, 0]);
    }
  }
  // bones and skulls
  ctx.roughness(0.7);
  for (let i = 0; i < 60; i++) {
    const p = pick(); if (!p) continue; const [x, z] = p, y = ctx.groundY(x, z), yaw = R() * 180;
    ctx.color("oklch(0.85 0.03 85)");
    if (i % 4 === 0) {
      blob(ctx, x, y + 0.05, z, 0.1, 0.09, 0.12, i, 0.05, 5, 8);
      ctx.color("oklch(0.12 0 0)");
      const fx = -Math.sin(yaw * Math.PI / 180), fz = -Math.cos(yaw * Math.PI / 180);
      for (const sd of [-1, 1]) boxR(ctx, [x + fx * 0.11 + fz * sd * 0.035, y + 0.07, z + fz * 0.11 - fx * sd * 0.035], [0.04, 0.035, 0.02], { yaw });
    } else {
      boxR(ctx, [x, y + 0.025, z], [0.42, 0.04, 0.045], { yaw });
      const c = Math.cos(yaw * Math.PI / 180), s = Math.sin(yaw * Math.PI / 180);
      for (const e of [-0.22, 0.22]) blob(ctx, x + c * e, y + 0.035, z - s * e, 0.035, 0.03, 0.04, i + e, 0.1, 3, 5);
    }
  }
  // toppled marker fragments, moss on top
  for (let i = 0; i < 30; i++) {
    const p = pick(); if (!p) continue; const [x, z] = p, y = ctx.groundY(x, z), yaw = R() * 180;
    ctx.albedo("cdn/texture-weathered-grey-gravestone.png"); ctx.color("oklch(0.9 0.01 100)"); ctx.roughness(0.9);
    boxR(ctx, [x, y + 0.05, z], [0.5 + R() * 0.3, 0.14, 0.35], { yaw, roll: R() * 8 - 4 });
    ctx.albedo("cdn/texture-thick-green-forest-moss.png"); ctx.color("oklch(0.92 0.03 130)");
    boxR(ctx, [x, y + 0.125, z], [0.3, 0.015, 0.22], { yaw });
    ctx.albedo(null);
  }
}
export function collider() { return null; }
