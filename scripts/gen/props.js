// Town props by params.kind: well, lamppost, table, bench, barrel, crate, anvil, forge, counter, stall, trough, signpost, cart, chest
import { box, boxR, cyl, blob, quadN } from "./shape.js";
const P = (ctx, s, tex, col, r = 0.85, m = 0) => { if (s) return; ctx.albedo(tex ? "cdn/texture-" + tex + ".png" : null); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
const WOOD = "dark-oak-timber-beam-hand-painted", PLANK = "worn-oak-floor-boards", STONE = "rough-fieldstone-wall-mossy", IRON = "rusted-black-iron-hammered";
function build(ctx, p, s) {
  const k = p.kind;
  if (k === "well") {
    P(ctx, s, STONE, "oklch(0.95 0.01 90)");
    cyl(ctx, 0, 0, 0, 1.25, 1.2, 0.9, 14, false); cyl(ctx, 0, 0, 0, 0.95, 0.95, 0.9, 14, false);
    if (!s) { cyl(ctx, 0, 0.88, 0, 1.3, 1.3, 0.12, 14, true); P(ctx, s, null, "oklch(0.25 0.04 230)", 0.05); cyl(ctx, 0, 0.3, 0, 0.94, 0.94, 0.02, 14, true); }
    P(ctx, s, WOOD, "oklch(0.92 0.02 60)");
    for (const x of [-1.05, 1.05]) box(ctx, x - 0.1, 0.9, -0.1, x + 0.1, 2.6, 0.1);
    if (!s) {
      boxR(ctx, [0, 2.2, 0], [2.3, 0.12, 0.12]);
      for (const sd of [-1, 1]) boxR(ctx, [0, 2.75, sd * 0.55], [2.6, 0.06, 1.25], { pitch: sd * -28 });
      P(ctx, s, null, "oklch(0.5 0.06 60)"); cyl(ctx, 0, 1.3, 0, 0.18, 0.2, 0.32, 8); P(ctx, s, null, "oklch(0.7 0.03 80)"); cyl(ctx, 0, 1.62, 0, 0.012, 0.012, 0.58, 4, false);
    }
    return;
  }
  if (k === "lamppost") {
    P(ctx, s, IRON, "oklch(0.8 0.01 60)", 0.6, 0.6);
    cyl(ctx, 0, 0, 0, 0.12, 0.07, 3.0, 8); if (s) return;
    cyl(ctx, 0, 0, 0, 0.2, 0.14, 0.35, 8);
    boxR(ctx, [0.3, 2.95, 0], [0.7, 0.06, 0.06]);
    box(ctx, 0.43, 2.2, -0.2, 0.83, 2.26, 0.2); box(ctx, 0.45, 2.75, -0.18, 0.81, 2.82, 0.18);
    for (const [x, z] of [[0.45, -0.18], [0.81, -0.18], [0.45, 0.18], [0.81, 0.18]]) box(ctx, x - 0.02, 2.26, z - 0.02, x + 0.02, 2.75, z + 0.02);
    cyl(ctx, 0.63, 2.82, 0, 0.24, 0.0, 0.22, 8);
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.8); ctx.emissive(4, 2.2, 0.8);
    box(ctx, 0.5, 2.3, -0.13, 0.76, 2.7, 0.13); ctx.emissive(null);
    return;
  }
  if (k === "table") { P(ctx, s, PLANK, "oklch(0.92 0.03 60)"); box(ctx, -0.9, 0.72, -0.5, 0.9, 0.8, 0.5); for (const x of [-0.75, 0.75]) for (const z of [-0.38, 0.38]) box(ctx, x - 0.05, 0, z - 0.05, x + 0.05, 0.72, z + 0.05);
    if (!s) { P(ctx, s, null, "oklch(0.6 0.08 60)", 0.5); cyl(ctx, -0.4, 0.8, 0.1, 0.06, 0.07, 0.16, 8); cyl(ctx, 0.3, 0.8, -0.15, 0.06, 0.07, 0.16, 8); } return; }
  if (k === "bench") { P(ctx, s, PLANK, "oklch(0.92 0.03 60)"); box(ctx, -0.9, 0.42, -0.18, 0.9, 0.48, 0.18); for (const x of [-0.75, 0.75]) box(ctx, x - 0.05, 0, -0.15, x + 0.05, 0.42, 0.15); return; }
  if (k === "barrel") { P(ctx, s, "oak-barrel-staves", "oklch(0.92 0.03 60)"); cyl(ctx, 0, 0, 0, 0.36, 0.36, 0.5, 12, false, (i, kk) => 1); cyl(ctx, 0, 0.5, 0, 0.36, 0.33, 0.45, 12, true);
    if (!s) { cyl(ctx, 0, 0, 0, 0.36, 0.42, 0.5, 12, true); P(ctx, s, IRON, "oklch(0.7 0.01 60)", 0.6, 0.5); cyl(ctx, 0, 0.12, 0, 0.385, 0.395, 0.06, 12, false); cyl(ctx, 0, 0.78, 0, 0.385, 0.37, 0.06, 12, false); } return; }
  if (k === "crate") { P(ctx, s, PLANK, "oklch(0.9 0.04 70)"); box(ctx, -0.4, 0, -0.4, 0.4, 0.8, 0.4); if (!s) { P(ctx, s, WOOD, "oklch(0.9 0.02 60)"); for (const z of [-0.41, 0.39]) { box(ctx, -0.42, 0, z, -0.32, 0.8, z + 0.02); box(ctx, 0.32, 0, z, 0.42, 0.8, z + 0.02); boxR(ctx, [0, 0.4, z + 0.01], [1.0, 0.08, 0.02], { roll: 45 }); } } return; }
  if (k === "anvil") { P(ctx, s, STONE, "oklch(0.9 0.02 60)"); cyl(ctx, 0, 0, 0, 0.4, 0.36, 0.5, 8); P(ctx, s, IRON, "oklch(0.45 0.01 60)", 0.35, 0.9); box(ctx, -0.18, 0.5, -0.14, 0.18, 0.7, 0.14); box(ctx, -0.42, 0.7, -0.2, 0.38, 0.92, 0.2); if (!s) boxR(ctx, [0.55, 0.84, 0], [0.38, 0.1, 0.18], { roll: -12 }); return; }
  if (k === "forge") {
    P(ctx, s, STONE, "oklch(0.85 0.03 40)");
    box(ctx, -1.1, 0, -0.8, 1.1, 0.9, 0.8); box(ctx, -0.7, 0.9, 0.2, 0.7, 2.1, 0.8); box(ctx, -0.45, 2.1, 0.3, 0.45, 4.6, 0.75);
    if (s) return;
    ctx.albedo(null); ctx.color("oklch(0.18 0.01 40)"); box(ctx, -0.8, 0.9, -0.6, 0.8, 0.95, 0.2);
    ctx.color("oklch(0.75 0.2 45)"); ctx.emissive(6, 1.8, 0.25);
    for (let i = 0; i < 18; i++) { const x = -0.65 + ((i * 37) % 13) / 10, z = -0.45 + ((i * 53) % 6) / 10; blob(ctx, x, 0.98, z, 0.09, 0.06, 0.09, i, 0.3, 3, 5); }
    ctx.emissive(null);
    P(ctx, s, "brown-leather-bellows", "oklch(0.8 0.04 50)"); boxR(ctx, [1.55, 0.95, 0], [0.9, 0.3, 0.6], { roll: 8 });
    return;
  }
  if (k === "counter") { P(ctx, s, PLANK, "oklch(0.88 0.04 60)"); box(ctx, -2, 0, -0.35, 2, 1.0, 0.35); if (!s) { P(ctx, s, WOOD, "oklch(0.9 0.02 60)"); box(ctx, -2.1, 1.0, -0.45, 2.1, 1.1, 0.45); } return; }
  if (k === "stall") {
    P(ctx, s, PLANK, "oklch(0.9 0.04 60)"); box(ctx, -1.6, 0, -0.5, 1.6, 0.9, 0.5);
    P(ctx, s, WOOD, "oklch(0.9 0.02 60)"); for (const x of [-1.6, 1.6]) for (const z of [-0.5, 0.6]) box(ctx, x - 0.07, 0, z - 0.07, x + 0.07, z < 0 ? 2.3 : 2.6, z + 0.07);
    if (s) return;
    P(ctx, s, "red-and-cream-striped-canvas-awning", "oklch(0.95 0.02 30)", 0.95);
    boxR(ctx, [0, 2.5, 0.05], [3.6, 0.04, 1.6], { pitch: 10 });
    P(ctx, s, null, "oklch(0.62 0.17 35)"); for (let i = 0; i < 6; i++) blob(ctx, -1.2 + i * 0.25, 0.98, -0.2 + (i % 2) * 0.15, 0.09, 0.08, 0.09, i, 0.1, 4, 6);
    P(ctx, s, null, "oklch(0.72 0.15 120)"); for (let i = 0; i < 5; i++) blob(ctx, 0.3 + i * 0.22, 0.98, -0.1 + (i % 2) * 0.2, 0.08, 0.08, 0.08, i + 9, 0.1, 4, 6);
    P(ctx, s, "woven-wicker-basket", "oklch(0.9 0.04 70)"); cyl(ctx, 1.1, 0.9, 0.1, 0.25, 0.3, 0.25, 10, true);
    return;
  }
  if (k === "trough") { P(ctx, s, PLANK, "oklch(0.85 0.03 60)"); box(ctx, -1.1, 0, -0.35, 1.1, 0.12, 0.35); box(ctx, -1.1, 0, -0.35, 1.1, 0.6, -0.27); box(ctx, -1.1, 0, 0.27, 1.1, 0.6, 0.35); box(ctx, -1.1, 0, -0.35, -1.02, 0.6, 0.35); box(ctx, 1.02, 0, -0.35, 1.1, 0.6, 0.35); if (!s) { ctx.albedo(null); ctx.color("oklch(0.32 0.05 220)"); ctx.roughness(0.05); box(ctx, -1.02, 0.12, -0.27, 1.02, 0.48, 0.27); } return; }
  if (k === "signpost") { P(ctx, s, WOOD, "oklch(0.9 0.02 60)"); box(ctx, -0.08, 0, -0.08, 0.08, 2.6, 0.08); if (!s) { box(ctx, -0.04, 1.95, -0.1, 1.3, 2.25, 0.1); box(ctx, -1.3, 1.5, -0.1, 0.04, 1.8, 0.1); } return; }
  if (k === "cart") { P(ctx, s, PLANK, "oklch(0.9 0.04 60)"); box(ctx, -1.1, 0.6, -0.7, 1.1, 0.7, 0.7); for (const z of [-0.7, 0.66]) box(ctx, -1.1, 0.7, z, 1.1, 1.1, z + 0.04); box(ctx, 1.06, 0.7, -0.7, 1.1, 1.1, 0.7);
    if (!s) { P(ctx, s, WOOD, "oklch(0.85 0.02 60)"); for (const z of [-0.8, 0.72]) { for (let i = 0; i < 6; i++) boxR(ctx, [0, 0.45, z + 0.04], [0.9, 0.06, 0.05], { roll: i * 30 }); cyl(ctx, 0, 0.45, z, 0.45, 0.45, 0.08, 14, false); } boxR(ctx, [-1.9, 0.55, -0.3], [1.8, 0.07, 0.07], { roll: 8 }); boxR(ctx, [-1.9, 0.55, 0.3], [1.8, 0.07, 0.07], { roll: 8 });
      P(ctx, s, "rough-split-firewood-logs", "oklch(0.9 0.04 60)"); for (let i = 0; i < 5; i++) boxR(ctx, [-0.5 + i * 0.25, 0.85, 0], [0.18, 0.18, 1.2], { yaw: (i % 2) * 6 }); } return; }
  if (k === "bridge") {
    // a timber footbridge spanning X from -9 to 9, gently arched, deck at y=0 at the ends
    const N = 12, L = 18, arc = 1.1, wd = 3.4;
    P(ctx, s, PLANK, "oklch(0.92 0.03 60)");
    for (let i = 0; i < N; i++) {
      const x0 = -L / 2 + (L * i) / N, x1 = x0 + L / N, xm = (x0 + x1) / 2;
      const y = arc * (1 - (xm / (L / 2)) ** 2), dy = (-2 * arc * xm) / ((L / 2) ** 2);
      boxR(ctx, [xm, y - 0.1, 0], [L / N + 0.05, 0.2, wd], { roll: Math.atan(dy) * 57.3 });
    }
    if (s) return;
    P(ctx, s, WOOD, "oklch(0.88 0.02 60)");
    for (let i = 0; i <= 6; i++) { const x = -L / 2 + (L * i) / 6, y = arc * (1 - (x / (L / 2)) ** 2); for (const z of [-wd / 2, wd / 2]) box(ctx, x - 0.08, y - 0.2, z - 0.08, x + 0.08, y + 1.05, z + 0.08); }
    for (let i = 0; i < N; i++) { const x0 = -L / 2 + (L * i) / N, x1 = x0 + L / N, xm = (x0 + x1) / 2, y = arc * (1 - (xm / (L / 2)) ** 2), dy = (-2 * arc * xm) / ((L / 2) ** 2);
      for (const z of [-wd / 2, wd / 2]) boxR(ctx, [xm, y + 1.0, z], [L / N + 0.05, 0.1, 0.12], { roll: Math.atan(dy) * 57.3 }); }
    P(ctx, s, STONE, "oklch(0.9 0.01 80)");
    for (const x of [-L / 2, L / 2]) box(ctx, x - 0.8, -2.5, -wd / 2 - 0.3, x + 0.8, 0.0, wd / 2 + 0.3);
    return;
  }
  if (k === "questboard") {
    P(ctx, s, WOOD, "oklch(0.9 0.02 60)");
    for (const x of [-1.1, 1.1]) box(ctx, x - 0.1, 0, -0.1, x + 0.1, 2.7, 0.1);
    if (s) return;
    P(ctx, s, PLANK, "oklch(0.85 0.04 60)"); box(ctx, -1.2, 1.0, -0.06, 1.2, 2.3, 0.04);
    P(ctx, s, "red-clay-roof-shingles", "oklch(0.9 0.03 40)"); boxR(ctx, [0, 2.75, -0.2], [2.8, 0.06, 0.8], { pitch: -18 });
    ctx.albedo(null); ctx.color("oklch(0.9 0.04 85)"); ctx.roughness(0.9);
    const notes = [[-0.8, 1.9, 0.5, 0.6], [-0.15, 2.0, 0.45, 0.5], [0.5, 1.85, 0.55, 0.65], [-0.6, 1.25, 0.6, 0.45], [0.35, 1.2, 0.4, 0.5]];
    notes.forEach(([x, y, w, h], i) => boxR(ctx, [x, y, -0.08], [w, h, 0.01], { roll: (i % 2 ? 4 : -3) }));
    return;
  }
  if (k === "chest") { P(ctx, s, "dark-oak-timber-beam-hand-painted", "oklch(0.85 0.05 50)"); box(ctx, -0.5, 0, -0.32, 0.5, 0.55, 0.32); if (!s) { P(ctx, s, IRON, "oklch(0.75 0.06 80)", 0.4, 0.8); for (const x of [-0.35, 0.35]) box(ctx, x - 0.04, 0, -0.34, x + 0.04, 0.57, 0.34); box(ctx, -0.07, 0.3, -0.35, 0.07, 0.45, -0.32); } return; }
}
export function geometry(ctx) {
  ctx.flat();
  if ((ctx.lod ?? 1) >= 4) { P(ctx, false, WOOD, "oklch(0.85 0.03 60)"); build(ctx, ctx.params || {}, true); return; } // far: the collider's masses only
  build(ctx, ctx.params || {}, false);
}
export function collider(ctx) { build(ctx, ctx.params || {}, true); }
