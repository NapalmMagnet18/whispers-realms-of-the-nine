// Dungeon and raid interiors (places drowned-bell, root-archive, pale-choir, emberheart, ninth-assembly), by params.layout.
// Floor y = 0. Rooms chain toward -Z from the entry gate at z = 0, joined by 4 m corridors. kind "halls" = the whole shell
// (one mesh, its collider); kind "pillar" | "brazier" | "dais" | "bell" | "organ" | "seat" | "rootcol" = furnishings themed by layout.
export const LAYOUTS = {
  "drowned-bell":   { rooms: [[14, 14, 6], [18, 22, 8], [26, 28, 12]], corr: 8, wall: "cdn/texture-wet-mossy-sea-stone-blocks.png", floor: "cdn/texture-worn-crypt-flagstone-floor.png", stone: "oklch(0.78 0.03 200)", trim: "oklch(0.55 0.04 200)", glow: "oklch(0.75 0.13 195)" },
  "root-archive":   { rooms: [[14, 14, 7], [20, 24, 9], [28, 28, 13]], corr: 8, wall: "cdn/texture-living-root-bark-wall-woven.png", floor: "cdn/texture-packed-earth-moss-roots-floor.png", stone: "oklch(0.72 0.05 90)", trim: "oklch(0.42 0.06 70)", glow: "oklch(0.8 0.15 110)" },
  "pale-choir":     { rooms: [[16, 16, 9], [22, 36, 14], [26, 26, 14], [34, 32, 18]], corr: 10, wall: "cdn/texture-pale-cathedral-limestone-blocks.png", floor: "cdn/texture-worn-crypt-flagstone-floor.png", stone: "oklch(0.9 0.015 80)", trim: "oklch(0.6 0.02 60)", glow: "oklch(0.85 0.12 80)" },
  emberheart:       { rooms: [[16, 16, 9], [24, 34, 14], [28, 28, 15], [36, 34, 20]], corr: 10, wall: "cdn/texture-volcanic-basalt-blocks-cracked.png", floor: "cdn/texture-cracked-basalt-floor-ember-veins.png", stone: "oklch(0.62 0.03 40)", trim: "oklch(0.35 0.03 30)", glow: "oklch(0.75 0.19 45)" },
  "ninth-assembly": { rooms: [[16, 16, 10], [24, 30, 14], [30, 30, 16], [38, 38, 22]], corr: 10, wall: "cdn/texture-violet-veined-marble-blocks.png", floor: "cdn/texture-polished-dark-marble-floor-gold-inlay.png", stone: "oklch(0.82 0.03 300)", trim: "oklch(0.7 0.1 85)", glow: "oklch(0.72 0.17 300)" },
};
// the rooms as boxes: [{ x0, x1, z0, z1, h, cz }], corridors between; also used by the scene builder (same arithmetic)
export function roomsOf(L) {
  const out = []; let z = 0;
  L.rooms.forEach(([w, d, h], i) => {
    if (i > 0) { out.push({ x0: -2, x1: 2, z0: z - L.corr, z1: z, h: 5, corr: true }); z -= L.corr; }
    out.push({ x0: -w / 2, x1: w / 2, z0: z - d, z1: z, h, cz: z - d / 2, last: i === L.rooms.length - 1 });
    z -= d;
  });
  return out;
}
function B(ctx, x0, y0, z0, x1, y1, z1) {
  const q = (a, b, c, d) => ctx.quad(...a, ...b, ...c, ...d);
  q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
  q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]); q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
  q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
}
function cyl(ctx, cx, y, cz, r0, r1, h, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2, P = (t, r, yy) => [cx + Math.cos(t) * r, yy, cz + Math.sin(t) * r];
    ctx.quad(...P(b, r0, y), ...P(a, r0, y), ...P(a, r1, y + h), ...P(b, r1, y + h)); ctx.tri(...P(a, r1, y + h), ...P(b, r1, y + h), cx, y + h, cz);
  }
}
function ring(ctx, cx, y, cz, r0, r1, n) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2, P = (t, r) => [cx + Math.cos(t) * r, y, cz + Math.sin(t) * r]; ctx.quad(...P(b, r0), ...P(a, r0), ...P(a, r1), ...P(b, r1)); }
}
function wallX(ctx, z, x0, x1, h, t, gap) {
  if (!gap) return B(ctx, x0 - t, 0, z - t / 2, x1 + t, h, z + t / 2);
  B(ctx, x0 - t, 0, z - t / 2, -gap[0], h, z + t / 2); B(ctx, gap[0], 0, z - t / 2, x1 + t, h, z + t / 2);
  if (gap[1] < h) B(ctx, -gap[0], gap[1], z - t / 2, gap[0], h, z + t / 2);
}
function halls(ctx, L, lod) {
  const R = roomsOf(L), T = 0.8;
  ctx.albedo(L.wall); ctx.color(L.stone); ctx.roughness(0.92);
  R.forEach((r, i) => {
    B(ctx, r.x0 - T, -0.6, r.z0 - T / 2, r.x1 + T, 0, r.z1 + T / 2);
    B(ctx, r.x0 - T, r.h, r.z0 - T / 2, r.x1 + T, r.h + 0.6, r.z1 + T / 2);
    const gate = [2, 4], gs = i === 0 ? [1.9, 3.8] : gate;
    if (!r.corr) { wallX(ctx, r.z1, r.x0, r.x1, r.h, T, gs); wallX(ctx, r.z0, r.x0, r.x1, r.h, T, r.last ? null : gate); }
    if (r.corr) { B(ctx, r.x0 - T, 0, r.z0, r.x0, r.h, r.z1); B(ctx, r.x1, 0, r.z0, r.x1 + T, r.h, r.z1); return; }
    B(ctx, r.x0 - T, 0, r.z0, r.x0, r.h, r.z1); B(ctx, r.x1, 0, r.z0, r.x1 + T, r.h, r.z1);
  });
  // corridors have no end walls (rooms' gaps open into them); trim
  ctx.color(L.trim);
  for (const r of R) {
    B(ctx, r.x0, 0, r.z0, r.x0 + 0.22, 0.5, r.z1); B(ctx, r.x1 - 0.22, 0, r.z0, r.x1, 0.5, r.z1);
    if (r.corr) { for (let z = r.z1 - 1.5; z > r.z0 + 0.5; z -= 3) { B(ctx, r.x0, 0, z - 0.3, r.x0 + 0.35, r.h, z + 0.3); B(ctx, r.x1 - 0.35, 0, z - 0.3, r.x1, r.h, z + 0.3); B(ctx, r.x0, r.h - 0.5, z - 0.3, r.x1, r.h, z + 0.3); } continue; }
    if (lod <= 2) { B(ctx, r.x0, r.h - 0.45, r.z0, r.x0 + 0.3, r.h - 0.1, r.z1); B(ctx, r.x1 - 0.3, r.h - 0.45, r.z0, r.x1, r.h - 0.1, r.z1); }
    ctx.color(L.stone);
    for (let z = r.z1 - 3.5; z > r.z0 + 1.5; z -= 5) {
      B(ctx, r.x0, 0, z - 0.5, r.x0 + 0.55, r.h, z + 0.5); B(ctx, r.x1 - 0.55, 0, z - 0.5, r.x1, r.h, z + 0.5);
      if (lod <= 3) { const n = 7, half = (r.x1 - r.x0) / 2, rise = Math.min(3, r.h * 0.28);
        for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, y0 = r.h - rise + Math.sin(t0 * Math.PI / 2) * rise, y1 = r.h - rise + Math.sin(t1 * Math.PI / 2) * rise;
          for (const s of [-1, 1]) { const xa = s * half * (1 - t0), xb = s * half * (1 - t1); B(ctx, Math.min(xa, xb), Math.min(y0, y1) - 0.35, z - 0.35, Math.max(xa, xb), Math.max(y0, y1), z + 0.35); } } }
    }
    ctx.color(L.trim);
  }
  // floors
  ctx.albedo(L.floor); ctx.color(L.stone);
  for (const r of R) ctx.quad(r.x0, 0.01, r.z1, r.x1, 0.01, r.z1, r.x1, 0.01, r.z0, r.x0, 0.01, r.z0);
  // a glowing sigil ring in every chamber after the first: the arena
  ctx.albedo(null);
  for (const r of R) { if (r.corr || r.z1 === 0) continue; const rr = Math.min(r.x1, (r.z1 - r.z0) / 2) - 2.5;
    ctx.color(L.trim); ring(ctx, 0, 0.02, r.cz, rr, rr + 0.6, lod <= 2 ? 48 : 20);
    ctx.color(L.glow); ctx.emissive(lod <= 3 ? L.glow : null); ring(ctx, 0, 0.03, r.cz, rr - 0.25, rr - 0.1, lod <= 2 ? 48 : 20); ctx.emissive(null); }
}
export function geometry(ctx) {
  const L = LAYOUTS[ctx.params.layout] || LAYOUTS["drowned-bell"], k = ctx.params.kind || "halls", lod = ctx.lod || 1;
  ctx.flat();
  if (k === "halls") { halls(ctx, L, lod); return { uvProjection: "triplanar" }; }
  if (k === "pillar") { const h = ctx.params.h || 10; ctx.albedo(L.wall); ctx.color(L.stone); ctx.roughness(0.92);
    B(ctx, -0.9, 0, -0.9, 0.9, 0.6, 0.9); cyl(ctx, 0, 0.6, 0, 0.6, 0.52, h - 1.3, lod <= 2 ? 16 : 8); B(ctx, -0.85, h - 0.7, -0.85, 0.85, h, 0.85);
    if (lod <= 2) { ctx.albedo(null); ctx.color(L.trim); for (const y of [1.4, h - 1.4]) cyl(ctx, 0, y, 0, 0.62, 0.62, 0.18, 16); } return; }
  if (k === "rootcol") { const h = ctx.params.h || 10; ctx.albedo(L.wall); ctx.color("oklch(0.5 0.05 60)"); ctx.roughness(0.95);
    for (let s = 0; s < 4; s++) { const a = s * 1.7, ox = Math.cos(a) * 0.35, oz = Math.sin(a) * 0.35; const n = 8;
      for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, w = Math.sin(t0 * 6 + s) * 0.3; cyl(ctx, ox + w, t0 * h, oz - w, 0.42 - t0 * 0.12, 0.42 - t1 * 0.12, h / n, 7); } }
    ctx.albedo(null); ctx.color(L.glow); ctx.emissive(L.glow); if (lod <= 2) for (let i = 0; i < 6; i++) B(ctx, Math.cos(i) * 0.7 - 0.06, 1 + i * 1.3, Math.sin(i) * 0.7 - 0.06, Math.cos(i) * 0.7 + 0.06, 1.12 + i * 1.3, Math.sin(i) * 0.7 + 0.06); ctx.emissive(null); return; }
  if (k === "brazier") { ctx.color("oklch(0.28 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.45);
    cyl(ctx, 0, 0, 0, 0.45, 0.2, 0.25, 10); cyl(ctx, 0, 0.25, 0, 0.09, 0.09, 1.0, 8); cyl(ctx, 0, 1.25, 0, 0.18, 0.55, 0.35, 12);
    ctx.metalness(0); ctx.color(L.glow); ctx.emissive(L.glow); cyl(ctx, 0, 1.45, 0, 0.45, 0.3, 0.12, 12); ctx.emissive(null); return; }
  if (k === "dais") { const r = ctx.params.r || 5; ctx.albedo(L.wall); ctx.color(L.stone); ctx.roughness(0.9);
    cyl(ctx, 0, 0, 0, r, r - 0.3, 0.3, lod <= 2 ? 32 : 14); cyl(ctx, 0, 0.3, 0, r - 1.2, r - 1.4, 0.3, lod <= 2 ? 32 : 14); return; }
  if (k === "bell") { // the drowned bell, cracked, hung from a beam: a lathe of rings
    ctx.color("oklch(0.55 0.08 165)"); ctx.metalness(0.7); ctx.roughness(0.5);
    const prof = [[0.2, 4.2], [1.1, 4.0], [1.5, 3.2], [1.7, 1.6], [2.3, 0.4], [2.5, 0]]; const n = lod <= 2 ? 28 : 12;
    for (let j = 0; j < prof.length - 1; j++) { const [r0, y0] = prof[j], [r1, y1] = prof[j + 1]; cyl(ctx, 0, y1, 0, r1, r0, y0 - y1, n); }
    ctx.metalness(0); ctx.color("oklch(0.3 0.03 60)"); B(ctx, -0.15, 4.2, -0.15, 0.15, 8, 0.15);
    ctx.color(L.glow); ctx.emissive(L.glow); B(ctx, 1.0, 0.6, -2.0, 1.15, 3.2, -1.85); ctx.emissive(null); return; }
  if (k === "organ") { ctx.color("oklch(0.88 0.03 85)"); ctx.roughness(0.6);
    for (let i = -7; i <= 7; i++) { const h = 6 + (7 - Math.abs(i)) * 0.9; cyl(ctx, i * 0.75, 1.2, 0, 0.3, 0.28, h, lod <= 2 ? 10 : 6); }
    ctx.color("oklch(0.3 0.04 40)"); B(ctx, -6, 0, -1.2, 6, 1.2, 1); B(ctx, -3, 1.2, -1.6, 3, 1.4, -0.8); return; }
  if (k === "seat") { ctx.albedo(L.wall); ctx.color(L.stone); B(ctx, -1, 0, -1, 1, 0.5, 1); B(ctx, -0.8, 0.5, -0.2, 0.8, 1.1, 0.8); B(ctx, -0.8, 1.1, 0.55, 0.8, 3.2, 0.8);
    ctx.albedo(null); ctx.color(L.trim); B(ctx, -0.9, 3.2, 0.5, 0.9, 3.5, 0.85); ctx.color(L.glow); ctx.emissive(L.glow); B(ctx, -0.18, 2.4, 0.5, 0.18, 2.8, 0.54); ctx.emissive(null); return; }
}
