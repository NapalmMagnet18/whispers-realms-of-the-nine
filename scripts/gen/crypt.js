// The Hollowcrypt (place "hollowcrypt"), by params.kind. Floor y = 0, the run of halls goes toward -Z from the entry gate at z = 0.
// halls: vestibule → corridor → archive → corridor → the Warden's chamber, one mesh, walls/floor/ceiling its collider.
// shelf, pillar, tomb, candelabra, sigil, altar, lectern: furnishings. portico: the mausoleum front over the stair in Hollowcrypt Vale.
const STONE = "oklch(0.93 0.01 70)", WAX = "oklch(0.92 0.04 90)", IRON = "oklch(0.3 0.01 60)", INK = "oklch(0.25 0.03 280)";
const ROOMS = [
  { x0: -7, x1: 7, z0: -14, z1: 0, h: 6, open: { n: [-2, 2, 3.6] } },
  { x0: -2, x1: 2, z0: -24, z1: -14, h: 4, open: { n: [-2, 2, 4], s: [-2, 2, 4] } },
  { x0: -10, x1: 10, z0: -46, z1: -24, h: 8, open: { n: [-2, 2, 3.8], s: [-2, 2, 3.8] } },
  { x0: -2, x1: 2, z0: -54, z1: -46, h: 4, open: { n: [-2, 2, 4], s: [-2, 2, 4] } },
  { x0: -13, x1: 13, z0: -80, z1: -54, h: 10, open: { s: [-2, 2, 3.8] } },
];
export const HALLS = ROOMS;

function B(ctx, x0, y0, z0, x1, y1, z1) {
  const q = (a, b, c, d) => ctx.quad(...a, ...b, ...c, ...d);
  q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
  q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
  q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
  q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
  q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]);
  q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
}
function cyl(ctx, cx, y, cz, r0, r1, h, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    const P = (t, r, yy) => [cx + Math.cos(t) * r, yy, cz + Math.sin(t) * r];
    ctx.quad(...P(b, r0, y), ...P(a, r0, y), ...P(a, r1, y + h), ...P(b, r1, y + h));
    ctx.tri(...P(a, r1, y + h), ...P(b, r1, y + h), cx, y + h, cz);
  }
}
// a wall along X at z (thickness t outward by side s=+1 north… we just centre it), with one gap [g0,g1] up to gh
function wallX(ctx, z, x0, x1, h, t, gap) {
  if (!gap) return B(ctx, x0 - t, 0, z - t / 2, x1 + t, h, z + t / 2);
  const [g0, g1, gh] = gap;
  B(ctx, x0 - t, 0, z - t / 2, g0, h, z + t / 2);
  B(ctx, g1, 0, z - t / 2, x1 + t, h, z + t / 2);
  if (gh < h) B(ctx, g0, gh, z - t / 2, g1, h, z + t / 2);
}
function shell(ctx, detail) {
  const T = 0.7;
  for (const r of ROOMS) {
    // floor slab and ceiling slab
    B(ctx, r.x0 - T, -0.5, r.z0 - T / 2, r.x1 + T, 0, r.z1 + T / 2);
    B(ctx, r.x0 - T, r.h, r.z0 - T / 2, r.x1 + T, r.h + 0.5, r.z1 + T / 2);
    wallX(ctx, r.z1, r.x0, r.x1, r.h, T, r.open.s);
    wallX(ctx, r.z0, r.x0, r.x1, r.h, T, r.open.n);
    B(ctx, r.x0 - T, 0, r.z0, r.x0, r.h, r.z1);
    B(ctx, r.x1, 0, r.z0, r.x1 + T, r.h, r.z1);
  }
}
function trim(ctx, lod) {
  for (const r of ROOMS) {
    const big = r.x1 - r.x0 > 6;
    // plinth along the long walls and a cornice under the ceiling
    ctx.color("oklch(0.8 0.01 60)");
    B(ctx, r.x0, 0, r.z0, r.x0 + 0.18, 0.45, r.z1); B(ctx, r.x1 - 0.18, 0, r.z0, r.x1, 0.45, r.z1);
    if (lod <= 2) { B(ctx, r.x0, r.h - 0.35, r.z0, r.x0 + 0.25, r.h - 0.1, r.z1); B(ctx, r.x1 - 0.25, r.h - 0.35, r.z0, r.x1, r.h - 0.1, r.z1); }
    if (!big) { // corridor: ribs every 2.5 m
      for (let z = r.z1 - 1.2; z > r.z0 + 0.6; z -= 2.5) { B(ctx, r.x0, 0, z - 0.25, r.x0 + 0.3, r.h, z + 0.25); B(ctx, r.x1 - 0.3, 0, z - 0.25, r.x1, r.h, z + 0.25); B(ctx, r.x0, r.h - 0.4, z - 0.25, r.x1, r.h, z + 0.25); }
      continue;
    }
    // pilasters and transverse ribs across the ceiling
    ctx.color(STONE);
    for (let z = r.z1 - 3.5; z > r.z0 + 1.5; z -= 4.5) {
      B(ctx, r.x0, 0, z - 0.4, r.x0 + 0.45, r.h, z + 0.4); B(ctx, r.x1 - 0.45, 0, z - 0.4, r.x1, r.h, z + 0.4);
      if (lod <= 3) {
        // a pointed rib: two beams rising to the centre
        const n = 6, half = (r.x1 - r.x0) / 2, cx = (r.x0 + r.x1) / 2, rise = Math.min(2.2, r.h * 0.25);
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, y0 = r.h - rise + Math.sin(t0 * Math.PI / 2) * rise, y1 = r.h - rise + Math.sin(t1 * Math.PI / 2) * rise;
          for (const s of [-1, 1]) { const xa = cx + s * half * (1 - t0), xb = cx + s * half * (1 - t1); B(ctx, Math.min(xa, xb), Math.min(y0, y1) - 0.3, z - 0.3, Math.max(xa, xb), Math.max(y0, y1), z + 0.3); }
        }
      }
    }
    if (lod <= 2) { // burial niches between pilasters, dark recesses
      ctx.color("oklch(0.35 0.01 60)");
      for (let z = r.z1 - 5.75; z > r.z0 + 2; z -= 4.5) { B(ctx, r.x0 - 0.01, 1.2, z - 0.9, r.x0 + 0.02, 2.2, z + 0.9); B(ctx, r.x1 - 0.02, 1.2, z - 0.9, r.x1 + 0.01, 2.2, z + 0.9); }
      ctx.color(STONE);
    }
  }
  // the Warden's floor: a sunken ring of darker flags with a violet sigil inlay
  ctx.color("oklch(0.55 0.02 290)"); ctx.albedo(null);
  const n = lod <= 2 ? 40 : 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    const P = (t, r) => [Math.cos(t) * r, 0.02, -67 + Math.sin(t) * r];
    ctx.quad(...P(b, 6.6), ...P(a, 6.6), ...P(a, 7.2), ...P(b, 7.2));
  }
  ctx.color("oklch(0.7 0.16 300)"); ctx.emissive(lod <= 3 ? "oklch(0.4 0.18 300)" : null);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    const P = (t, r) => [Math.cos(t) * r, 0.025, -67 + Math.sin(t) * r];
    ctx.quad(...P(b, 6.3), ...P(a, 6.3), ...P(a, 6.45), ...P(b, 6.45));
  }
  ctx.emissive(null);
}

function books(ctx, x0, x1, y, z, d, seed) {
  let x = x0, i = 0;
  while (x < x1 - 0.05) {
    const w = 0.05 + ((Math.sin(seed * 7.1 + i * 3.7) + 1) / 2) * 0.07, h = 0.24 + ((Math.sin(seed * 2.3 + i * 5.1) + 1) / 2) * 0.12;
    const hue = [30, 50, 280, 20, 150][i % 5], L = 0.3 + ((i * 37) % 10) / 40;
    ctx.color(`oklch(${L} 0.07 ${hue})`);
    if (i % 9 === 4) B(ctx, x, y, z - d / 2, x + h, y + w, z + d / 2 - 0.02); // one lying flat
    else B(ctx, x, y, z - d / 2 + 0.02, Math.min(x + w, x1), y + h, z + d / 2 - 0.02);
    x += (i % 9 === 4 ? h : w) + 0.005; i++;
  }
}

export function geometry(ctx) {
  const k = ctx.params.kind || "halls", lod = ctx.lod || 1;
  ctx.flat();
  if (k === "halls") {
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color(STONE); ctx.roughness(0.95);
    shell(ctx, true);
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png");
    trim(ctx, lod);
    // floor flags drawn over the slab tops
    ctx.albedo("cdn/texture-worn-crypt-flagstone-floor.png"); ctx.color(STONE);
    for (const r of ROOMS) ctx.quad(r.x0, 0.01, r.z1, r.x1, 0.01, r.z1, r.x1, 0.01, r.z0, r.x0, 0.01, r.z0);
    return { uvProjection: "triplanar" };
  }
  if (k === "shelf") { // an archive press 3 m wide, 3.2 tall, its books facing -Z
    ctx.color("oklch(0.32 0.04 50)"); ctx.roughness(0.85);
    B(ctx, -1.5, 0, -0.3, -1.42, 3.2, 0.3); B(ctx, 1.42, 0, -0.3, 1.5, 3.2, 0.3); B(ctx, -1.5, 0, 0.24, 1.5, 3.2, 0.3);
    B(ctx, -1.55, 3.2, -0.34, 1.55, 3.34, 0.34);
    for (let s = 0; s < 5; s++) { const y = 0.1 + s * 0.62; B(ctx, -1.42, y, -0.3, 1.42, y + 0.05, 0.24); if (lod <= 2) books(ctx, -1.4, 1.4, y + 0.05, -0.04, 0.4, s + (ctx.params.seed || 0)); }
    if (lod <= 2) { ctx.color(INK); ctx.emissive(null); B(ctx, -0.6, 0.0, -0.9, 0.5, 0.012, -0.35); } // an ink pool at its foot
    return;
  }
  if (k === "pillar") {
    const h = ctx.params.h || 10;
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color(STONE); ctx.roughness(0.95);
    B(ctx, -0.75, 0, -0.75, 0.75, 0.5, 0.75);
    cyl(ctx, 0, 0.5, 0, 0.5, 0.44, h - 1.1, lod <= 2 ? 16 : 8);
    B(ctx, -0.7, h - 0.6, -0.7, 0.7, h, 0.7);
    return;
  }
  if (k === "tomb") {
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color("oklch(0.85 0.01 70)"); ctx.roughness(0.95);
    B(ctx, -1.1, 0, -0.55, 1.1, 0.2, 0.55); B(ctx, -1, 0.2, -0.45, 1, 0.85, 0.45); B(ctx, -1.08, 0.85, -0.52, 1.08, 1.0, 0.52);
    if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.75 0.01 70)"); B(ctx, -0.7, 1.0, -0.22, 0.6, 1.12, 0.22); B(ctx, 0.6, 1.0, -0.15, 0.85, 1.18, 0.15); } // the carved sleeper
    return;
  }
  if (k === "candelabra") {
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.5);
    cyl(ctx, 0, 0, 0, 0.28, 0.06, 0.18, 8); cyl(ctx, 0, 0.18, 0, 0.035, 0.035, 1.2, 6);
    B(ctx, -0.42, 1.36, -0.03, 0.42, 1.4, 0.03); B(ctx, -0.03, 1.36, -0.42, 0.03, 1.4, 0.42);
    ctx.metalness(0); ctx.color(WAX); ctx.roughness(0.6);
    const tips = [[0, 0], [0.4, 0], [-0.4, 0], [0, 0.4], [0, -0.4]];
    for (const [x, z] of tips) cyl(ctx, x, 1.4, z, 0.04, 0.035, 0.12 + Math.abs(x + z) * 0.25, 6);
    if (ctx.params.lit !== false && lod <= 3) { ctx.emissive("oklch(0.85 0.17 75)"); ctx.color("oklch(0.95 0.1 80)"); for (const [x, z] of tips) { const t = 1.52 + Math.abs(x + z) * 0.25; B(ctx, x - 0.012, t, z - 0.012, x + 0.012, t + 0.06, z + 0.012); } ctx.emissive(null); }
    if (lod <= 2) { ctx.color(WAX); for (const [x, z] of tips) B(ctx, x - 0.05, 1.38, z - 0.05, x + 0.05, 1.4, z + 0.05); } // wax drips on the arms
    return;
  }
  if (k === "candle") { // an unclaimed candle: a fat stub on a stone block, unlit
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color(STONE); ctx.roughness(0.95);
    B(ctx, -0.3, 0, -0.3, 0.3, 0.9, 0.3); ctx.albedo(null);
    ctx.color(WAX); ctx.roughness(0.6); cyl(ctx, 0, 0.9, 0, 0.13, 0.12, 0.36, 10);
    if (lod <= 2) { for (let i = 0; i < 6; i++) { const a = i; B(ctx, Math.cos(a) * 0.12 - 0.02, 0.92, Math.sin(a) * 0.12 - 0.02, Math.cos(a) * 0.12 + 0.02, 1.0 + (i % 3) * 0.06, Math.sin(a) * 0.12 + 0.02); } ctx.color("oklch(0.2 0.01 60)"); B(ctx, -0.008, 1.26, -0.008, 0.008, 1.32, 0.008); }
    return;
  }
  if (k === "sigil") { // a waist-high ring-stone with a violet rune on its face
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color("oklch(0.7 0.02 290)"); ctx.roughness(0.95);
    cyl(ctx, 0, 0, 0, 0.55, 0.45, 0.3, 8); cyl(ctx, 0, 0.3, 0, 0.32, 0.22, 1.6, 6);
    ctx.albedo(null); ctx.color("oklch(0.75 0.17 300)"); ctx.emissive("oklch(0.5 0.22 300)");
    B(ctx, -0.12, 0.9, -0.3, 0.12, 1.4, -0.27); B(ctx, -0.2, 1.1, -0.3, 0.2, 1.16, -0.27);
    ctx.emissive(null);
    return;
  }
  if (k === "altar") { // the Warden's command stone: a stepped plinth with an open stone index on it
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color(STONE); ctx.roughness(0.95);
    B(ctx, -1.6, 0, -1.1, 1.6, 0.25, 1.1); B(ctx, -1.2, 0.25, -0.8, 1.2, 1.0, 0.8); B(ctx, -1.35, 1.0, -0.9, 1.35, 1.12, 0.9);
    ctx.albedo(null); ctx.color("oklch(0.88 0.03 85)");
    ctx.quad(-0.6, 1.13, 0.3, 0, 1.2, 0.35, 0, 1.25, -0.35, -0.6, 1.16, -0.3); ctx.quad(0, 1.2, 0.35, 0.6, 1.13, 0.3, 0.6, 1.16, -0.3, 0, 1.25, -0.35);
    return;
  }
  if (k === "lectern") {
    ctx.color("oklch(0.32 0.04 50)"); ctx.roughness(0.85);
    B(ctx, -0.3, 0, -0.3, 0.3, 0.08, 0.3); B(ctx, -0.07, 0.08, -0.07, 0.07, 1.05, 0.07);
    ctx.quad(-0.35, 1.0, -0.25, 0.35, 1.0, -0.25, 0.35, 1.22, 0.2, -0.35, 1.22, 0.2);
    ctx.color("oklch(0.9 0.03 85)"); ctx.quad(-0.3, 1.02, -0.2, 0.3, 1.02, -0.2, 0.3, 1.21, 0.15, -0.3, 1.21, 0.15);
    return;
  }
  if (k === "portico") {
    // a mausoleum front over a stair going down; the doorway (2.6 x 3.4) at z = 0 facing -Z, the body behind it to +Z.
    ctx.albedo("cdn/texture-dark-crypt-stone-blocks.png"); ctx.color("oklch(0.88 0.02 290)"); ctx.roughness(0.95);
    B(ctx, -4, 0, -1.8, 4, 0.3, 6); // platform
    B(ctx, -3.2, 0.3, 0, -1.3, 4.0, 6); B(ctx, 1.3, 0.3, 0, 3.2, 4.0, 6); // side walls
    B(ctx, -1.3, 3.7, 0, 1.3, 4.0, 6); // over the door
    B(ctx, -3.2, 0.3, 5.4, 3.2, 4.0, 6); // back
    B(ctx, -3.6, 4.0, -0.6, 3.6, 4.4, 6.4); // cornice slab
    // pediment
    for (let i = 0; i < (lod <= 2 ? 6 : 3); i++) { const w = 3.6 - i * (3.6 / (lod <= 2 ? 6 : 3)); B(ctx, -w, 4.4 + i * 0.28, -0.5, w, 4.68 + i * 0.28, 6.3); }
    // columns in front
    for (const x of [-2.6, 2.6]) { B(ctx, x - 0.45, 0.3, -1.5, x + 0.45, 0.6, -0.6); cyl(ctx, x, 0.6, -1.05, 0.32, 0.28, 3.4, lod <= 2 ? 12 : 6); }
    // the stair going down into the dark
    ctx.albedo(null); ctx.color("oklch(0.25 0.01 290)");
    for (let i = 0; i < 6; i++) B(ctx, -1.3, 0.3 - i * 0.18, 0.2 + i * 0.6, 1.3, 0.32 - i * 0.18, 0.8 + i * 0.6);
    ctx.color("oklch(0.06 0.01 290)"); ctx.quad(1.3, 0.3, 5.3, -1.3, 0.3, 5.3, -1.3, 3.7, 5.3, 1.3, 3.7, 5.3);
    if (lod <= 3) { ctx.color("oklch(0.72 0.16 300)"); ctx.emissive("oklch(0.45 0.2 300)"); B(ctx, -0.5, 3.78, -0.03, 0.5, 3.9, 0.0); ctx.emissive(null); }
    return;
  }
}
export function collider(ctx) {
  const k = ctx.params.kind || "halls";
  if (k === "halls") { shell(ctx, false); return; }
  if (k === "shelf") return { kind: "box", width: 3, height: 3.3, depth: 0.6 };
  if (k === "pillar") { B(ctx, -0.6, 0, -0.6, 0.6, ctx.params.h || 10, 0.6); return; }
  if (k === "tomb") return { kind: "box", width: 2.2, height: 1.0, depth: 1.1 };
  if (k === "candle") return { kind: "box", width: 0.6, height: 0.9, depth: 0.6 };
  if (k === "sigil") return { kind: "box", width: 1.0, height: 1.9, depth: 1.0 };
  if (k === "altar") return { kind: "box", width: 3.2, height: 1.1, depth: 2.2 };
  if (k === "candelabra" || k === "lectern") return null;
  if (k === "portico") { B(ctx, -4, 0, -1.8, 4, 0.3, 6); B(ctx, -3.2, 0.3, 0, -1.3, 4.0, 6); B(ctx, 1.3, 0.3, 0, 3.2, 4.0, 6); B(ctx, -3.2, 0.3, 5.4, 3.2, 4.0, 6); B(ctx, -3.6, 4.0, -0.6, 3.6, 4.4, 6.4); for (const x of [-2.6, 2.6]) B(ctx, x - 0.4, 0.3, -1.4, x + 0.4, 4.0, -0.7); return; }
}
