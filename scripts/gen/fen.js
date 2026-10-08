// Sorrowfen: the boardwalk village at Mourner Pool and the marsh around it. Params.kind picks the piece.
// boardwalk: a deck from local (0,h0,0) to (0,h1,-len), 2.2 wide, on stilts sunk into the mud (feet at world y 0).
import { box, boxR, cyl, quadN } from "./shape.js";
const WOOD = "oklch(0.45 0.04 60)", WET = "oklch(0.36 0.035 70)", REED = "oklch(0.62 0.07 95)", ROPE = "oklch(0.7 0.05 80)";
const PLANK = "cdn/texture-weathered-oak-deck-planks.png";
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function deck(ctx, len, h0, h1, w, lod, seed) {
  const n = Math.max(2, Math.round(len / 0.32)), step = len / n;
  ctx.albedo(PLANK); ctx.color(WOOD); ctx.roughness(0.9);
  for (let i = 0; i < n; i++) {
    if (lod <= 2 && rnd(seed + i) < 0.035) continue; // a missing plank
    const z0 = -i * step, z1 = z0 - step + 0.03, t = (i + 0.5) / n, y = h0 + (h1 - h0) * t, sag = lod <= 2 ? (rnd(seed * 3 + i) - 0.5) * 0.03 : 0;
    const pitch = Math.atan2(h1 - h0, len) * 180 / Math.PI;
    boxR(ctx, [(rnd(seed + i * 7) - 0.5) * 0.06, y - 0.04 + sag, (z0 + z1) / 2], [w + (rnd(i + seed) - 0.5) * 0.12, 0.08, step - 0.03], { pitch });
  }
  ctx.albedo(null);
  // runners under the planks
  ctx.color(WET);
  for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) boxR(ctx, [x, (h0 + h1) / 2 - 0.15, -len / 2], [0.14, 0.14, len], { pitch: Math.atan2(h1 - h0, len) * 180 / Math.PI });
  // stilts every ~2.4 m, both sides, down into the mud, some leaning
  const k = Math.max(1, Math.round(len / 2.4));
  for (let i = 0; i <= k; i++) {
    const z = -(i / k) * len, y = h0 + (h1 - h0) * (i / k);
    for (const s of [-1, 1]) {
      const x = s * (w / 2 - 0.05), lean = lod <= 2 ? (rnd(seed + i * 5 + s) - 0.5) * 6 : 0;
      boxR(ctx, [x, (y - 0.6) / 2 - 0.05, z], [0.16, y + 0.6, 0.16], { roll: lean });
      if (lod <= 2 && i % 2 === 0) { ctx.color(ROPE); boxR(ctx, [x, y + 0.45, z], [0.1, 0.9, 0.1]); ctx.color(WET); } // a rail post above the deck
    }
  }
  if (lod <= 2) { // the rope rail between posts, sagging
    ctx.color(ROPE);
    for (let i = 0; i + 2 <= k; i += 2) for (const s of [-1, 1]) {
      const za = -(i / k) * len, zb = -((i + 2) / k) * len, ya = h0 + (h1 - h0) * (i / k) + 0.85, yb = h0 + (h1 - h0) * ((i + 2) / k) + 0.85, x = s * (w / 2 - 0.05);
      const zm = (za + zb) / 2, ym = (ya + yb) / 2 - 0.12;
      for (const [p, q] of [[[x, ya, za], [x, ym, zm]], [[x, ym, zm], [x, yb, zb]]]) {
        const L = Math.hypot(q[1] - p[1], q[2] - p[2]);
        boxR(ctx, [x, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], [0.035, 0.035, L], { pitch: -Math.atan2(q[1] - p[1], -(q[2] - p[2])) * 180 / Math.PI });
      }
    }
  }
}
function reedClump(ctx, cx, cz, n, h, seed) {
  ctx.color(REED); ctx.roughness(1);
  for (let i = 0; i < n; i++) {
    const a = rnd(seed + i) * 6.283, r = rnd(seed * 2 + i) * 0.5, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const hh = h * (0.6 + rnd(seed + i * 3) * 0.6), lean = (rnd(seed + i * 9) - 0.5) * 18;
    boxR(ctx, [x, hh / 2, z], [0.03, hh, 0.03], { roll: lean, yaw: a * 57 });
    if (i % 3 === 0) { ctx.color("oklch(0.38 0.06 50)"); boxR(ctx, [x + Math.sin(lean / 57) * -hh * 0.45, hh * 0.92, z], [0.06, 0.22, 0.06], { roll: lean }); ctx.color(REED); } // a cattail head
  }
}
function hut(ctx, lod, seed) { // a reed-thatched stilt hut 4x3.6 standing on a deck at y 0, its door facing -Z
  ctx.albedo(PLANK); ctx.color(WOOD); ctx.roughness(0.9);
  box(ctx, -2, 0, -1.8, -1.85, 2.3, 1.8); box(ctx, 1.85, 0, -1.8, 2, 2.3, 1.8); box(ctx, -2, 0, 1.65, 2, 2.3, 1.8);
  box(ctx, -2, 0, -1.8, -0.55, 2.3, -1.65); box(ctx, 0.55, 0, -1.8, 2, 2.3, -1.65); box(ctx, -0.55, 2.0, -1.8, 0.55, 2.3, -1.65);
  ctx.albedo(null); ctx.color(WET);
  for (const [x, z] of [[-2, -1.8], [2, -1.8], [-2, 1.8], [2, 1.8]]) box(ctx, x - 0.1, 0, z - 0.1, x + 0.1, 2.45, z + 0.1);
  // thatch: two sloped slabs and gable fill
  ctx.color("oklch(0.6 0.06 85)"); ctx.roughness(1);
  boxR(ctx, [-1.2, 2.95, 0], [2.9, 0.22, 4.4], { roll: 38 });
  boxR(ctx, [1.2, 2.95, 0], [2.9, 0.22, 4.4], { roll: -38 });
  ctx.color(WOOD);
  for (const z of [-1.78, 1.78]) quadN(ctx, [-2, 2.3, z], [2, 2.3, z], [0.05, 3.85, z], [-0.05, 3.85, z], [0, 0, z]);
  if (lod <= 2) {
    // a warm doorway glow and a hanging net
    ctx.color("oklch(0.85 0.12 75)"); ctx.emissive("oklch(0.55 0.13 70)"); box(ctx, -0.5, 0.02, 1.6, 0.5, 1.9, 1.64); ctx.emissive(null);
    ctx.color(ROPE); for (let i = 0; i < 5; i++) boxR(ctx, [2.05, 1.2, -1 + i * 0.25], [0.02, 1.4, 0.02], { pitch: (i - 2) * 4 });
    reedClump(ctx, -2.6, 2.2, 10, 1.6, seed);
  }
}
export function geometry(ctx) {
  const p = ctx.params || {}, k = p.kind, lod = ctx.lod || 1, seed = p.seed || 1;
  ctx.flat();
  if (k === "boardwalk") { deck(ctx, p.len || 10, p.h0 ?? 1.3, p.h1 ?? 1.3, p.w || 2.2, lod, seed); return { uvProjection: "triplanar" }; }
  if (k === "platform") { // a square deck w x d at height h, stilts under it
    const w = p.w || 12, d = p.d || 12, h = p.h ?? 1.3;
    ctx.albedo(PLANK); ctx.color(WOOD); ctx.roughness(0.9);
    const n = Math.round(w / 0.34);
    for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * (w / n); if (lod <= 2 && rnd(seed + i) < 0.02) continue; box(ctx, x - w / n / 2 + 0.015, h - 0.08, -d / 2 + (rnd(i) - 0.5) * 0.1, x + w / n / 2 - 0.015, h, d / 2 + (rnd(i + 3) - 0.5) * 0.1); }
    ctx.albedo(null); ctx.color(WET);
    for (let x = -w / 2 + 0.2; x <= w / 2 - 0.1; x += lod <= 2 ? 2.4 : 4.8) for (let z = -d / 2 + 0.2; z <= d / 2 - 0.1; z += lod <= 2 ? 2.4 : 4.8) box(ctx, x - 0.09, -0.6, z - 0.09, x + 0.09, h - 0.08, z + 0.09);
    for (const z of [-d / 2 + 0.2, d / 2 - 0.2]) box(ctx, -w / 2, h - 0.24, z - 0.07, w / 2, h - 0.08, z + 0.07);
    return { uvProjection: "triplanar" };
  }
  if (k === "hut") { hut(ctx, lod, seed); return { uvProjection: "triplanar" }; }
  if (k === "lantern") { // a ward lantern on a tall post: an iron cage, a glass, a wick with a name stitched in
    ctx.color(WET); ctx.roughness(0.9);
    box(ctx, -0.08, 0, -0.08, 0.08, 2.6, 0.08); box(ctx, -0.08, 2.45, -0.08, 0.6, 2.55, 0.08);
    ctx.color("oklch(0.3 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.5);
    box(ctx, 0.42, 1.7, -0.18, 0.78, 1.74, 0.18); box(ctx, 0.42, 2.2, -0.18, 0.78, 2.24, 0.18);
    for (const [x, z] of [[0.42, -0.18], [0.78, -0.18], [0.42, 0.18], [0.78, 0.18]]) box(ctx, x - 0.015, 1.74, z - 0.015, x + 0.015, 2.2, z + 0.015);
    box(ctx, 0.59, 2.24, -0.01, 0.61, 2.45, 0.01);
    ctx.metalness(0);
    if (p.lit) { ctx.color("oklch(0.95 0.08 80)"); ctx.emissive("oklch(0.75 0.14 75)"); } else ctx.color("oklch(0.55 0.03 220)");
    box(ctx, 0.47, 1.75, -0.13, 0.73, 2.19, 0.13); ctx.emissive(null);
    if (lod <= 2) reedClump(ctx, 0, 0, 6, 1.1, seed);
    return;
  }
  if (k === "pole") { // an evacuation marker: a stake with a pale rag tied on
    ctx.color(WET); ctx.roughness(0.9); boxR(ctx, [0, 1.0, 0], [0.12, 2.4, 0.12], { roll: 3 });
    ctx.color("oklch(0.88 0.03 90)"); box(ctx, 0.06, 1.7, -0.02, 0.5, 2.05, 0.02);
    ctx.color("oklch(0.6 0.15 40)"); box(ctx, -0.07, 1.95, -0.07, 0.07, 2.02, 0.07);
    return;
  }
  if (k === "boat") { // a sunken flat-bottomed boat half in the water, stern up
    ctx.albedo(PLANK); ctx.color(WET); ctx.roughness(0.95);
    const r = { pitch: -9, roll: 7 };
    boxR(ctx, [0, 0.1, 0], [1.5, 0.08, 5], r);
    boxR(ctx, [-0.75, 0.35, 0], [0.08, 0.55, 5], r); boxR(ctx, [0.75, 0.35, 0], [0.08, 0.55, 5], r);
    boxR(ctx, [0, 0.55, 2.4], [1.5, 0.6, 0.08], r);
    if (lod <= 2) { ctx.albedo(null); ctx.color(ROPE); boxR(ctx, [0, 0.5, -0.4], [1.4, 0.06, 0.25], r); boxR(ctx, [0.3, 0.6, 1.2], [0.06, 0.06, 2.6], { yaw: 20, pitch: -5 }); }
    return { uvProjection: "triplanar" };
  }
  if (k === "shrine") { // an island shrine: a ring of leaning stones round a low basin altar
    ctx.albedo("cdn/texture-mossy-fieldstone-wall.png"); ctx.color("oklch(0.78 0.02 140)"); ctx.roughness(0.95);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283 + 0.3, r = 4.2, h = 1.6 + rnd(i + seed) * 1.4; boxR(ctx, [Math.cos(a) * r, h / 2 - 0.2, Math.sin(a) * r], [0.7, h, 0.5], { yaw: -a * 57.3 + 90, roll: (rnd(i * 3) - 0.5) * 14 }); }
    cyl(ctx, 0, 0, 0, 1.3, 1.1, 0.5, lod <= 2 ? 14 : 8); cyl(ctx, 0, 0.5, 0, 0.7, 0.9, 0.45, lod <= 2 ? 14 : 8);
    ctx.albedo(null); ctx.color("oklch(0.3 0.04 230)"); ctx.roughness(0.15); cyl(ctx, 0, 0.94, 0, 0.78, 0.78, 0.02, 14, true);
    return { uvProjection: "triplanar" };
  }
  if (k === "chime") { // a bellglass chime half sunk, mouth up, glowing faint blue
    ctx.color("oklch(0.85 0.06 220 / 0.85)"); ctx.roughness(0.1); ctx.emissive("oklch(0.45 0.1 220)");
    const r = { pitch: 25, roll: -10 }, S = [[0.0, 0.18], [0.15, 0.24], [0.4, 0.27], [0.6, 0.34]];
    for (let i = 0; i + 1 < S.length; i++) { const [y0, r0] = S[i], [y1, r1] = S[i + 1]; for (let j = 0; j < 10; j++) { const a0 = j / 10 * 6.283, a1 = (j + 1) / 10 * 6.283;
      const P = (y, rr, a) => { const v = [Math.cos(a) * rr, y, Math.sin(a) * rr]; const c = Math.cos(r.pitch / 57.3), s = Math.sin(r.pitch / 57.3); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
      quadN(ctx, P(y0, r0, a0), P(y0, r0, a1), P(y1, r1, a1), P(y1, r1, a0), [Math.cos((a0 + a1) / 2), 0, Math.sin((a0 + a1) / 2)]); } }
    ctx.emissive(null);
    return;
  }
  if (k === "reeds") { reedClump(ctx, 0, 0, lod <= 2 ? 22 : 8, p.h || 1.8, seed); return; }
  if (k === "stump") { ctx.color(WET); ctx.roughness(1); cyl(ctx, 0, -0.3, 0, 0.45, 0.32, 1.1 + rnd(seed) * 0.8, 8); return; }
}
export function collider(ctx) {
  const p = ctx.params || {}, k = p.kind;
  if (k === "boardwalk") { const len = p.len || 10, h0 = p.h0 ?? 1.3, h1 = p.h1 ?? 1.3, w = (p.w || 2.2) / 2;
    quadN(ctx, [-w, h0, 0], [w, h0, 0], [w, h1, -len], [-w, h1, -len], [0, 1, 0]); quadN(ctx, [-w, h0 - 0.3, 0], [w, h0 - 0.3, 0], [w, h1 - 0.3, -len], [-w, h1 - 0.3, -len], [0, -1, 0]); return; }
  if (k === "platform") { const w = p.w || 12, d = p.d || 12, h = p.h ?? 1.3; box(ctx, -w / 2, h - 0.3, -d / 2, w / 2, h, d / 2); return; }
  if (k === "hut") { box(ctx, -2, 0, -1.8, -1.85, 2.3, 1.8); box(ctx, 1.85, 0, -1.8, 2, 2.3, 1.8); box(ctx, -2, 0, 1.65, 2, 2.3, 1.8); box(ctx, -2, 0, -1.8, -0.55, 2.3, -1.65); box(ctx, 0.55, 0, -1.8, 2, 2.3, -1.65); box(ctx, -2, 2.3, -1.8, 2, 2.5, 1.8); return; }
  if (k === "lantern" || k === "pole") { box(ctx, -0.1, 0, -0.1, 0.1, 2.4, 0.1); return; }
  if (k === "shrine") { for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283 + 0.3; box(ctx, Math.cos(a) * 4.2 - 0.35, 0, Math.sin(a) * 4.2 - 0.35, Math.cos(a) * 4.2 + 0.35, 2.2, Math.sin(a) * 4.2 + 0.35); } box(ctx, -1.1, 0, -1.1, 1.1, 0.95, 1.1); return; }
  if (k === "stump") { box(ctx, -0.35, 0, -0.35, 0.35, 1.2, 0.35); return; }
  return null;
}
