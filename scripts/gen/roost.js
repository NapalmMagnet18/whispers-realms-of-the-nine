// A gryphon roost: fieldstone footing, a timber deck, the perch post with its crossbar and nest,
// a banner pole and a hanging lantern. Origin at the deck's centre on the ground; deck 7 m across.
const STONE = "cdn/texture-mossy-fieldstone-wall.png";
const OAK = "cdn/texture-dark-oak-timber-beam.png";
const PLANK = "cdn/texture-weathered-oak-deck-planks.png";
const IRON = "cdn/texture-hammered-black-iron.png";
const CLOTH = "cdn/texture-deep-red-woven-wool-cloth.png";
function box(ctx, cx, cy, cz, w, h, d) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy, y1 = cy + h, z0 = cz - d / 2, z1 = cz + d / 2;
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0); // top
  ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1); // bottom
  ctx.quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1); // +z
  ctx.quad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0); // -z
  ctx.quad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1); // +x
  ctx.quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0); // -x
}
function prism(ctx, cx, cz, r0, r1, y0, y1, n, cap = true) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    const p = (r, t, y) => [cx + Math.cos(t) * r, y, cz + Math.sin(t) * r];
    const A = p(r0, a, y0), B = p(r0, b, y0), C = p(r1, b, y1), D = p(r1, a, y1);
    ctx.quad(...A, ...D, ...C, ...B);
    if (cap) ctx.tri(cx, y1, cz, ...C, ...D);
  }
}
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod || 1;
  // footing: an octagon of fieldstone, slightly battered
  ctx.albedo(STONE); ctx.color("oklch(0.95 0.02 90)"); ctx.roughness(0.95);
  prism(ctx, 0, 0, 3.9, 3.6, -0.6, 0.55, 8);
  if (lod <= 2) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.39; box(ctx, Math.cos(a) * 3.55, 0.5, Math.sin(a) * 3.55, 0.5, 0.18, 0.5); }
  // the deck
  ctx.albedo(PLANK); ctx.color("oklch(0.92 0.03 70)"); ctx.roughness(0.85);
  prism(ctx, 0, 0, 3.5, 3.5, 0.55, 0.7, 8);
  // perch post, crossbar, braces
  ctx.albedo(OAK); ctx.color("oklch(0.9 0.03 60)");
  box(ctx, 0, 0.7, 1.6, 0.42, 4.6, 0.42);
  box(ctx, 0, 4.7, 1.6, 3.4, 0.32, 0.36);
  if (lod <= 3) { box(ctx, -0.9, 3.9, 1.6, 0.18, 0.18, 0.9); box(ctx, 0.9, 3.9, 1.6, 0.18, 0.18, 0.9); }
  // the nest on the crossbar: a ring of twigs
  if (lod <= 2) { ctx.color("oklch(0.7 0.05 70)"); prism(ctx, 0, 1.6, 0.9, 1.1, 5.0, 5.35, 10, false); }
  // banner pole and its cloth
  ctx.color("oklch(0.9 0.03 60)");
  box(ctx, -3.0, 0.7, -2.2, 0.16, 5.2, 0.16);
  ctx.albedo(CLOTH); ctx.color("oklch(0.95 0.02 30)");
  box(ctx, -2.62, 3.6, -2.2, 0.7, 2.1, 0.04);
  // lantern on an iron bracket
  ctx.albedo(IRON); ctx.color("oklch(0.9 0 0)"); ctx.metalness(0.6); ctx.roughness(0.5);
  box(ctx, 2.6, 0.7, -2.4, 0.12, 3.0, 0.12);
  box(ctx, 2.6, 3.6, -2.4, 0.08, 0.08, 0.8);
  box(ctx, 2.6, 2.95, -2.0, 0.32, 0.5, 0.32);
  ctx.albedo(null); ctx.metalness(0); ctx.emissive("oklch(0.85 0.17 70)");
  box(ctx, 2.6, 3.0, -2.0, 0.22, 0.38, 0.22);
  ctx.emissive(null);
  // feed trough and a crate by the steps
  if (lod <= 2) {
    ctx.albedo(OAK); ctx.color("oklch(0.85 0.04 60)");
    box(ctx, 1.9, 0.7, 2.2, 1.4, 0.35, 0.5);
    box(ctx, -1.8, 0.7, 2.3, 0.7, 0.7, 0.7);
  }
}
export function collider(ctx) {
  // the deck you walk onto, the post you bump into
  box(ctx, 0, -0.6, 0, 7.0, 1.3, 7.0);
  box(ctx, 0, 0.7, 1.6, 0.42, 4.6, 0.42);
}
