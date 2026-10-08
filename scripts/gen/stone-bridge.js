// An old stone bridge spanning X (−L/2..L/2), one round arch over the water, parapets, worn deck.
// Deck top at y = 0 at both ends, rising to `rise` mid-span. Mossy fieldstone.
import { box, boxR, quadN } from "./shape.js";
function build(ctx, s) {
  const { L = 22, W = 4.2, rise = 1.4, arch = 7, depth = 3.5 } = ctx.params || {};
  const deckY = (x) => rise * (1 - (x / (L / 2)) ** 2);
  const N = s ? 8 : 16;
  if (!s) { ctx.albedo("cdn/texture-worn-cobblestone-bridge-deck.png"); ctx.color("oklch(0.9 0.01 80)"); ctx.roughness(0.95); }
  for (let i = 0; i < N; i++) {
    const x0 = -L / 2 + (L * i) / N, x1 = x0 + L / N, xm = (x0 + x1) / 2;
    const y = deckY(xm), dy = (-2 * rise * xm) / ((L / 2) ** 2);
    boxR(ctx, [xm, y - 0.2, 0], [L / N + 0.06, 0.4, W], { roll: Math.atan(dy) * 57.3 });
  }
  if (!s) { ctx.albedo("cdn/texture-rough-fieldstone-wall-mossy.png"); ctx.color("oklch(0.93 0.01 90)"); }
  // spandrel walls: stone between deck and arch, both faces, as vertical strips
  const M = s ? 10 : 22, R = arch / 2;
  for (let i = 0; i < M; i++) {
    const x0 = -L / 2 + (L * i) / M, x1 = x0 + L / M, xm = (x0 + x1) / 2;
    const archY = Math.abs(xm) < R ? Math.sqrt(R * R - xm * xm) - depth + 0.6 : -depth;
    const top = deckY(xm) - 0.4;
    if (top > archY) box(ctx, x0, archY, -W / 2, x1, top, W / 2);
  }
  // piers and abutments
  for (const sx of [-1, 1]) { box(ctx, sx > 0 ? R : -L / 2 - 1.2, -depth - 1, -W / 2 - 0.3, sx > 0 ? L / 2 + 1.2 : -R, -depth + 0.6, W / 2 + 0.3); box(ctx, sx > 0 ? L / 2 - 0.3 : -L / 2 - 1.5, -depth, -W / 2 - 0.4, sx > 0 ? L / 2 + 1.5 : -L / 2 + 0.3, 0.1, W / 2 + 0.4); }
  if (s) { for (const z of [-W / 2, W / 2]) for (let i = 0; i < 8; i++) { const x0 = -L / 2 + (L * i) / 8, x1 = x0 + L / 8; box(ctx, x0, deckY((x0 + x1) / 2), z - 0.25, x1, deckY((x0 + x1) / 2) + 1.0, z + 0.25); } return; }
  // arch ring (voussoirs) proud of the face
  const K = 15;
  for (let k = 0; k < K; k++) {
    const a = Math.PI * (k + 0.5) / K, c = Math.cos(a), sn = Math.sin(a);
    const rr = R + 0.35;
    for (const z of [-W / 2 - 0.06, W / 2 + 0.06]) boxR(ctx, [c * rr, sn * rr - depth + 0.6, z], [0.5, 0.78, 0.18], { roll: (a * 57.3) - 90 });
  }
  // parapets: blocks along each edge with caps
  for (const z of [-W / 2 + 0.22, W / 2 - 0.22]) {
    for (let i = 0; i < M; i++) {
      const x0 = -L / 2 + (L * i) / M, x1 = x0 + L / M, xm = (x0 + x1) / 2, y = deckY(xm), dy = (-2 * rise * xm) / ((L / 2) ** 2);
      boxR(ctx, [xm, y + 0.45, z], [L / M + 0.04, 0.9, 0.44], { roll: Math.atan(dy) * 57.3 });
      boxR(ctx, [xm, y + 0.97, z], [L / M + 0.06, 0.14, 0.56], { roll: Math.atan(dy) * 57.3 });
    }
  }
  // end posts
  for (const sx of [-1, 1]) for (const z of [-W / 2 + 0.22, W / 2 - 0.22]) box(ctx, sx * L / 2 - 0.4, 0, z - 0.4, sx * L / 2 + 0.4, 1.5, z + 0.4);
}
export function geometry(ctx) {
  ctx.flat();
  if ((ctx.lod ?? 1) >= 4) { ctx.albedo("cdn/texture-rough-fieldstone-wall-mossy.png"); ctx.color("oklch(0.9 0.01 80)"); build(ctx, true); return; } // far: the collider's masses only
  build(ctx, false);
}
export function collider(ctx) { build(ctx, true); }
