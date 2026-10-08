// Briarwild Deepgrove pieces: params.kind = gate | spiral | shrine | archive | nodule | snare | pollen | lectern | waystone | memorial | fiber | hollow | firepit | leanto
// Origin at the ground, -Z the face a player meets. Built from scripts/gen/shape.js emitters; levels drop trim past lod 2.
import { quadN, triN, boxR, box, cyl, blob } from "./shape.js";

const BARK = "cdn/texture-ancient-mossy-oak-bark-deep-furrows.png";
const STONE = "cdn/texture-mossy-fieldstone-weathered.png";
const PLANK = "cdn/texture-weathered-oak-planks.png";
const BARKC = "oklch(0.93 0.02 70)", MOSS = "oklch(0.52 0.1 135)", STONEC = "oklch(0.95 0.01 90)";
const AMBER = [3.2, 1.9, 0.6], VIOLET = [1.6, 0.4, 2.4], CYAN = [0.6, 2.2, 2.6], GREEN = [0.9, 2.6, 0.9];

// a tube bent along a vertical arc in the XY plane (z fixed): an arch of root
function arcTube(ctx, cx, cy, cz, R, r0, r1, a0, a1, segs, sides) {
  const ring = (t) => {
    const a = a0 + (a1 - a0) * t, r = r0 + (r1 - r0) * Math.abs(t * 2 - 1) * 0 + (r1 - r0) * Math.sin(t * Math.PI);
    const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, nx = Math.cos(a), ny = Math.sin(a);
    const out = [];
    for (let i = 0; i < sides; i++) {
      const b = (i / sides) * Math.PI * 2, wob = 1 + 0.12 * Math.sin(i * 2.3 + t * 9);
      out.push([px + nx * Math.cos(b) * r * wob, py + ny * Math.cos(b) * r * wob, cz + Math.sin(b) * r * wob]);
    }
    return { out, c: [px, py, cz] };
  };
  let prev = ring(0);
  for (let s = 1; s <= segs; s++) {
    const cur = ring(s / segs);
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides, m = [(prev.out[i][0] + cur.out[j][0]) / 2 - (prev.c[0] + cur.c[0]) / 2, (prev.out[i][1] + cur.out[j][1]) / 2 - (prev.c[1] + cur.c[1]) / 2, (prev.out[i][2] + cur.out[j][2]) / 2 - prev.c[2]];
      quadN(ctx, prev.out[i], prev.out[j], cur.out[j], cur.out[i], m);
    }
    prev = cur;
  }
}
// a crooked root: tapered cylinder from a to b
function root(ctx, a, b, r0, r1, sides = 6) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d) || 1, u = d.map((v) => v / L);
  let t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const p = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], pl = Math.hypot(...p);
  const e1 = p.map((v) => v / pl), e2 = [u[1] * e1[2] - u[2] * e1[1], u[2] * e1[0] - u[0] * e1[2], u[0] * e1[1] - u[1] * e1[0]];
  const R = (c, r) => Array.from({ length: sides }, (_, i) => { const q = (i / sides) * Math.PI * 2; return [0, 1, 2].map((k) => c[k] + (e1[k] * Math.cos(q) + e2[k] * Math.sin(q)) * r); });
  const A = R(a, r0), B = R(b, r1);
  for (let i = 0; i < sides; i++) { const j = (i + 1) % sides, q = ((i + 0.5) / sides) * Math.PI * 2; quadN(ctx, A[i], A[j], B[j], B[i], [0, 1, 2].map((k) => e1[k] * Math.cos(q) + e2[k] * Math.sin(q))); }
  if (r1 > 0.01) for (let i = 0; i < sides; i++) triN(ctx, b, B[i], B[(i + 1) % sides], u);
}
const flare = (ctx, x, z, r, n, h, seed) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + seed; root(ctx, [x + Math.cos(a) * r * 0.6, h, z + Math.sin(a) * r * 0.6], [x + Math.cos(a) * r * 1.9, -0.25, z + Math.sin(a) * r * 1.9], r * 0.32, r * 0.08); } };
const glow = (ctx, c) => { ctx.albedo(null); ctx.color("oklch(0.9 0.05 80)"); ctx.emissive(...c); };
const noglow = (ctx) => ctx.emissive(null);

export function geometry(ctx) {
  const p = ctx.params || {}, k = p.kind || "pollen", lod = ctx.lod || 1, s = p.seed || 1;
  ctx.roughness(0.92);
  if (k === "gate") { // the Quiet Trunk: two ancient boles grown into one arch, roots spilling, a curtain of vine across the passage
    ctx.albedo(BARK); ctx.color(BARKC);
    arcTube(ctx, 0, 0.4, 0, 3.4, 1.15, 1.6, Math.PI * 1.02, Math.PI * -0.02, lod > 2 ? 6 : 14, lod > 2 ? 6 : 10);
    arcTube(ctx, 0, 0.2, 0.9, 3.1, 0.6, 0.85, Math.PI * 0.96, Math.PI * 0.1, lod > 2 ? 4 : 10, 7);
    if (lod < 4) { flare(ctx, -3.4, 0, 1.3, 5, 1.6, 0.4); flare(ctx, 3.4, 0, 1.3, 5, 1.6, 2.1); }
    ctx.albedo(null); ctx.color(MOSS);
    if (lod < 3) for (let i = 0; i < 7; i++) { const a = Math.PI * (0.12 + i * 0.12); blob(ctx, Math.cos(a) * 3.4, 0.4 + Math.sin(a) * 3.4 + 1.1, 0, 0.9, 0.35, 1.0, s + i, 0.3, 4, 7); }
    if (lod < 3) { ctx.color("oklch(0.45 0.09 140)"); for (let i = 0; i < 9; i++) { const x = -2.3 + i * 0.58, L = 1.4 + ((i * 37) % 7) * 0.25; box(ctx, x - 0.03, 4.2 - L, -0.3, x + 0.03, 4.2, -0.26); } }
    return;
  }
  if (k === "spiral") { // the Listening Tree: a vast bole climbed by a ramp of grown roots and planks to a lookout
    const H = 14, turns = 2, ri = 2.55, ro = 4.5, seg = lod > 2 ? 24 : 72;
    ctx.albedo(BARK); ctx.color(BARKC);
    cyl(ctx, 0, -0.5, 0, 3.0, 2.0, 22, lod > 2 ? 10 : 16, false, (i, kk) => 1 + 0.08 * Math.sin(i * 1.7 + kk * 3));
    if (lod < 4) flare(ctx, 0, 0, 2.6, 7, 2.4, 0.9);
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4, y = 17 + (i % 3) * 1.5; root(ctx, [Math.cos(a) * 1.8, y, Math.sin(a) * 1.8], [Math.cos(a) * 7.5, y + 3.5, Math.sin(a) * 7.5], 0.7, 0.25); }
    ctx.albedo(null); ctx.color("oklch(0.42 0.1 140)");
    blob(ctx, 0, 25, 0, 9, 5, 9, s, 0.28, lod > 2 ? 5 : 8, lod > 2 ? 8 : 14);
    if (lod < 4) for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4; blob(ctx, Math.cos(a) * 7.5, 21.5, Math.sin(a) * 7.5, 4, 2.8, 4, s + i, 0.3, 5, 9); }
    ctx.albedo(PLANK); ctx.color("oklch(0.88 0.03 70)");
    const at = (t) => { const a = t * turns * Math.PI * 2, y = 0.25 + t * H; return { a, y }; };
    for (let i = 0; i < seg; i++) { // the ramp, a thick board band
      const A = at(i / seg), B = at((i + 1) / seg), P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
      quadN(ctx, P(A.a, ri, A.y), P(A.a, ro, A.y), P(B.a, ro, B.y), P(B.a, ri, B.y), [0, 1, 0]);
      quadN(ctx, P(A.a, ri, A.y - 0.22), P(A.a, ro, A.y - 0.22), P(B.a, ro, B.y - 0.22), P(B.a, ri, B.y - 0.22), [0, -1, 0]);
      const m = (A.a + B.a) / 2; quadN(ctx, P(A.a, ro, A.y), P(B.a, ro, B.y), P(B.a, ro, B.y - 0.22), P(A.a, ro, A.y - 0.22), [Math.cos(m), 0, Math.sin(m)]);
    }
    ctx.albedo(BARK); ctx.color("oklch(0.8 0.03 60)");
    const posts = lod > 2 ? 12 : 30;
    for (let i = 0; i <= posts; i++) { const T = at(i / posts), x = Math.cos(T.a) * (ro - 0.1), z = Math.sin(T.a) * (ro - 0.1); box(ctx, x - 0.07, T.y, z - 0.07, x + 0.07, T.y + 1.05, z + 0.07); if (lod < 3 && i % 3 === 0) root(ctx, [Math.cos(T.a) * ri, T.y - 0.2, Math.sin(T.a) * ri], [x * 0.98, T.y - 1.6, z * 0.98], 0.18, 0.08, 5); }
    if (lod < 3) for (let i = 0; i < posts; i++) { const A = at(i / posts), B = at((i + 1) / posts); root(ctx, [Math.cos(A.a) * (ro - 0.1), A.y + 1, Math.sin(A.a) * (ro - 0.1)], [Math.cos(B.a) * (ro - 0.1), B.y + 1, Math.sin(B.a) * (ro - 0.1)], 0.05, 0.05, 4); }
    ctx.albedo(PLANK); ctx.color("oklch(0.88 0.03 70)"); // the lookout deck, a ring round the bole at the ramp's head
    const dk = lod > 2 ? 12 : 28, Y = H + 0.25;
    for (let i = 0; i < dk; i++) { const a0 = (i / dk) * Math.PI * 2, a1 = ((i + 1) / dk) * Math.PI * 2, P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r]; quadN(ctx, P(a0, 2.4, Y), P(a0, 6.2, Y), P(a1, 6.2, Y), P(a1, 2.4, Y), [0, 1, 0]); quadN(ctx, P(a0, 2.4, Y - 0.3), P(a0, 6.2, Y - 0.3), P(a1, 6.2, Y - 0.3), P(a1, 2.4, Y - 0.3), [0, -1, 0]); const m = (a0 + a1) / 2; quadN(ctx, P(a0, 6.2, Y), P(a1, 6.2, Y), P(a1, 6.2, Y - 0.3), P(a0, 6.2, Y - 0.3), [Math.cos(m), 0, Math.sin(m)]); if (i % 2 === 0 && Math.abs(Math.sin(a0 / 2)) > 0.08) { const x = Math.cos(a0) * 6.05, z = Math.sin(a0) * 6.05; box(ctx, x - 0.08, Y, z - 0.08, x + 0.08, Y + 1.1, z + 0.08); } }
    glow(ctx, AMBER); for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.8; blob(ctx, Math.cos(a) * 5.8, Y + 1.25, Math.sin(a) * 5.8, 0.16, 0.22, 0.16, i, 0.05, 4, 6); } noglow(ctx);
    return;
  }
  if (k === "shrine") { // the root shrine: a mossy offering stone gripped by roots, an amber rune in its face
    ctx.albedo(STONE); ctx.color(STONEC);
    boxR(ctx, [0, 0.55, 0], [1.6, 1.1, 0.9], { yaw: 4 }); boxR(ctx, [0, 1.2, 0], [1.9, 0.2, 1.1], { yaw: -3 });
    boxR(ctx, [0, 1.9, 0.25], [0.9, 1.3, 0.3], { yaw: 2, pitch: -6 });
    ctx.albedo(BARK); ctx.color(BARKC);
    if (lod < 4) for (let i = 0; i < 5; i++) { const a = i * 1.25 + 0.3; root(ctx, [Math.cos(a) * 0.4, 2.3, 0.25 + Math.sin(a) * 0.2], [Math.cos(a) * 1.6, -0.2, Math.sin(a) * 1.2], 0.14, 0.06, 5); }
    glow(ctx, AMBER); box(ctx, -0.18, 1.7, 0.08, 0.18, 2.2, 0.1); box(ctx, -0.32, 1.86, 0.08, 0.32, 1.94, 0.1); noglow(ctx);
    ctx.albedo(null); ctx.color("oklch(0.85 0.06 60)"); if (lod < 3) for (let i = 0; i < 3; i++) cyl(ctx, -0.5 + i * 0.5, 1.3, -0.25, 0.05, 0.05, 0.18, 6); // three stubs of candle
    return;
  }
  if (k === "archive") { // the Root Archive's door: a stone arch swallowed by a root-bound mound, a round door of living wood
    ctx.albedo(null); ctx.color(MOSS); blob(ctx, 0, 0, 3.5, 7, 4.6, 5.5, s, 0.18, lod > 2 ? 5 : 8, lod > 2 ? 9 : 16);
    ctx.albedo(STONE); ctx.color(STONEC);
    boxR(ctx, [-1.9, 1.6, -1.2], [0.8, 3.2, 1.0]); boxR(ctx, [1.9, 1.6, -1.2], [0.8, 3.2, 1.0]);
    arcTube(ctx, 0, 3.0, -1.2, 1.9, 0.42, 0.42, Math.PI, 0, lod > 2 ? 4 : 9, 5);
    ctx.albedo(PLANK); ctx.color("oklch(0.8 0.04 70)"); cyl(ctx, 0, 0, -0.8, 1.55, 1.55, 0.25, lod > 2 ? 10 : 20, true); // the round door, face on
    ctx.albedo(BARK); ctx.color(BARKC); if (lod < 4) for (let i = 0; i < 6; i++) { const a = i * 1.05; root(ctx, [Math.cos(a) * 2.3, 3.6 + Math.sin(a) * 0.5, -0.4], [Math.cos(a) * 3.8, -0.3, -1.6 + Math.sin(a)], 0.3, 0.1, 6); }
    glow(ctx, GREEN); if (lod < 3) for (let i = 0; i < 7; i++) { const a = Math.PI * (0.1 + i * 0.13); blob(ctx, Math.cos(a) * 1.9, 3.0 + Math.sin(a) * 1.9, -1.75, 0.1, 0.1, 0.06, i, 0.1, 3, 5); } noglow(ctx);
    return;
  }
  if (k === "nodule") { // blight on a root: a swollen violet-black growth, cracks lit from within
    ctx.albedo(BARK); ctx.color(BARKC); root(ctx, [-1.6, -0.2, 0], [1.6, -0.1, 0.3], 0.35, 0.25, 7);
    ctx.albedo(null); ctx.color("oklch(0.25 0.05 320)"); ctx.roughness(0.4); blob(ctx, 0, 0.35, 0, 0.6, 0.5, 0.55, s, 0.35, 6, 9);
    glow(ctx, VIOLET); for (let i = 0; i < 5; i++) { const a = i * 1.26 + s; blob(ctx, Math.cos(a) * 0.5, 0.45 + Math.sin(i) * 0.15, Math.sin(a) * 0.48, 0.12, 0.05, 0.12, i, 0.2, 3, 5); } noglow(ctx);
    return;
  }
  if (k === "snare") { // a bellglass snare: an iron tripod hung with a pale glass bell that hums
    ctx.albedo(null); ctx.color("oklch(0.3 0.01 60)"); ctx.metalness(0.7); ctx.roughness(0.5);
    for (let i = 0; i < 3; i++) { const a = i * 2.094; root(ctx, [Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0], [0, 2.4, 0], 0.05, 0.04, 5); }
    cyl(ctx, 0, 1.35, 0, 0.02, 0.02, 1.0, 4);
    ctx.metalness(0); ctx.roughness(0.1); ctx.color("oklch(0.85 0.06 200)", 0.7); cyl(ctx, 0, 0.75, 0, 0.42, 0.12, 0.6, lod > 2 ? 8 : 14, true);
    glow(ctx, CYAN); blob(ctx, 0, 0.7, 0, 0.08, 0.08, 0.08, 1, 0, 3, 5); noglow(ctx);
    ctx.color("oklch(0.6 0.03 80)"); for (let i = 0; i < 4; i++) { const a = i * 1.57; root(ctx, [Math.cos(a) * 0.3, 1.0, Math.sin(a) * 0.3], [Math.cos(a) * 2.2, 0.05, Math.sin(a) * 2.2], 0.01, 0.01, 3); } // trip threads
    return;
  }
  if (k === "pollen") { // memory pollen: a knot of pale lilies whose hearts glow gold
    ctx.albedo(null); ctx.color("oklch(0.5 0.1 140)");
    const n = lod > 2 ? 4 : 9;
    for (let i = 0; i < n; i++) { const a = i * 2.4 + s, r = 0.15 + (i % 3) * 0.2, h = 0.5 + (i % 4) * 0.18, x = Math.cos(a) * r, z = Math.sin(a) * r; root(ctx, [x, 0, z], [x * 1.3, h, z * 1.3], 0.025, 0.015, 4); ctx.color("oklch(0.93 0.03 90)"); blob(ctx, x * 1.3, h + 0.06, z * 1.3, 0.11, 0.07, 0.11, i, 0.4, 3, 6); ctx.color("oklch(0.5 0.1 140)"); }
    glow(ctx, AMBER); for (let i = 0; i < n; i++) { const a = i * 2.4 + s, r = 0.15 + (i % 3) * 0.2, h = 0.5 + (i % 4) * 0.18; blob(ctx, Math.cos(a) * r * 1.3, h + 0.1, Math.sin(a) * r * 1.3, 0.04, 0.04, 0.04, i, 0, 3, 4); } noglow(ctx);
    return;
  }
  if (k === "lectern") { // a reading stand grown from a stump: the bark letters laid open on it
    ctx.albedo(BARK); ctx.color(BARKC); cyl(ctx, 0, 0, 0, 0.35, 0.22, 1.05, 8); boxR(ctx, [0, 1.12, 0], [0.8, 0.08, 0.55], { pitch: 18 });
    ctx.albedo(null); ctx.color("oklch(0.92 0.03 85)"); boxR(ctx, [-0.17, 1.17, 0.0], [0.3, 0.01, 0.4], { pitch: 18, yaw: 4 }); boxR(ctx, [0.18, 1.17, 0.0], [0.3, 0.01, 0.4], { pitch: 18, yaw: -6 });
    return;
  }
  if (k === "waystone") { // a standing stone at the root road, a carved arrow east and a lantern hook
    ctx.albedo(STONE); ctx.color(STONEC); boxR(ctx, [0, 1.5, 0], [0.9, 3.0, 0.5], { roll: 3, yaw: 2 }); boxR(ctx, [0, 0.15, 0], [1.4, 0.3, 0.9]);
    glow(ctx, GREEN); box(ctx, -0.25, 2.0, -0.27, 0.25, 2.08, -0.25); box(ctx, 0.12, 1.88, -0.27, 0.2, 2.2, -0.25); noglow(ctx);
    return;
  }
  if (k === "memorial") { // the grove memorial: a carved post with a blank plaque on each face, waiting for its words
    ctx.albedo(PLANK); ctx.color("oklch(0.85 0.03 70)"); box(ctx, -0.22, 0, -0.22, 0.22, 2.4, 0.22); boxR(ctx, [0, 2.5, 0], [0.7, 0.14, 0.7], { yaw: 45 });
    ctx.albedo(null); ctx.color("oklch(0.9 0.03 85)"); box(ctx, -0.35, 1.2, -0.3, 0.35, 1.8, -0.23); box(ctx, -0.35, 1.2, 0.23, 0.35, 1.8, 0.3);
    ctx.color("oklch(0.75 0.12 30)"); if (lod < 3) for (let i = 0; i < 6; i++) { const a = i * 1.05; blob(ctx, Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55, 0.12, 0.08, 0.12, i, 0.3, 3, 5); } // flowers left at its foot
    return;
  }
  if (k === "fiber") { // the healthy heart-root, bared: pale cords glowing green
    ctx.albedo(BARK); ctx.color(BARKC); root(ctx, [-2, 0.2, 0], [2, 0.1, 0.4], 0.5, 0.35, 8);
    glow(ctx, GREEN); for (let i = 0; i < 5; i++) root(ctx, [-1.5 + i * 0.1, 0.45 + i * 0.05, -0.2 + i * 0.08], [1.4, 0.38 + i * 0.03, 0.2 + i * 0.07], 0.03, 0.03, 4); noglow(ctx);
    return;
  }
  if (k === "hollow") { // a split stump with something tucked in its hollow
    ctx.albedo(BARK); ctx.color(BARKC); cyl(ctx, 0, 0, 0, 0.9, 0.75, 1.5, 10, false, (i) => (i === 0 || i === 1 ? 0.5 : 1));
    ctx.albedo(null); ctx.color("oklch(0.2 0.02 60)"); cyl(ctx, 0, 1.0, 0, 0.6, 0.6, 0.05, 8);
    ctx.color("oklch(0.88 0.04 80)"); boxR(ctx, [0.1, 1.1, 0], [0.32, 0.05, 0.22], { yaw: 20 }); ctx.color("oklch(0.4 0.15 25)"); boxR(ctx, [0.1, 1.14, 0], [0.06, 0.03, 0.06]);
    return;
  }
  if (k === "barkface") { // the old bole: a broken giant's trunk, its -Z face scarred with living letters that glow faintly
    ctx.albedo(BARK); ctx.color(BARKC); cyl(ctx, 0, -0.3, 0, 1.5, 1.2, 4.6, lod > 2 ? 8 : 14, true, (i, kk) => 1 + 0.1 * Math.sin(i * 2.1 + kk));
    if (lod < 4) flare(ctx, 0, 0, 1.3, 6, 1.5, 0.2);
    ctx.albedo(null); ctx.color(MOSS); blob(ctx, 0, 4.4, 0, 1.3, 0.5, 1.3, s, 0.35, 4, 8);
    glow(ctx, [1.6, 2.2, 0.9]); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { if ((r * 7 + c * 3) % 4 === 0) continue; const x = -0.55 + c * 0.27, y = 1.4 + r * 0.32; box(ctx, x, y, -1.47, x + 0.16 + ((r + c) % 2) * 0.06, y + 0.05, -1.43); } noglow(ctx);
    return;
  }
  if (k === "firepit") {
    ctx.albedo(STONE); ctx.color(STONEC); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; blob(ctx, Math.cos(a) * 0.75, 0.12, Math.sin(a) * 0.75, 0.22, 0.16, 0.2, i, 0.3, 3, 5); }
    ctx.albedo(BARK); ctx.color("oklch(0.5 0.03 50)"); for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.3; root(ctx, [Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55], [0, 0.35, 0], 0.08, 0.05, 5); }
    return;
  }
  if (k === "leanto") { // the elder's lean-to: woven withy roof on three poles, moss on top
    ctx.albedo(BARK); ctx.color(BARKC); for (const x of [-1.8, 0, 1.8]) { root(ctx, [x, 0, -1.2], [x, 2.3, -1.2], 0.09, 0.07, 5); }
    ctx.albedo(PLANK); ctx.color("oklch(0.7 0.06 80)"); boxR(ctx, [0, 1.65, -0.1], [4.0, 0.08, 2.6], { pitch: -28 });
    ctx.albedo(null); ctx.color(MOSS); if (lod < 3) for (let i = 0; i < 4; i++) blob(ctx, -1.5 + i, 1.9, -0.3, 0.6, 0.12, 0.5, i, 0.4, 3, 6);
    ctx.color("oklch(0.55 0.08 40)"); box(ctx, -1.2, 0, 0.3, -0.2, 0.15, 1.1); ctx.color("oklch(0.6 0.07 120)"); box(ctx, 0.3, 0, 0.3, 1.3, 0.15, 1.1); // two bedrolls
    return;
  }
}

export function collider(ctx) {
  const k = (ctx.params || {}).kind;
  if (k === "gate") { boxR(ctx, [-3.4, 2, 0], [2.2, 4, 2.4]); boxR(ctx, [3.4, 2, 0], [2.2, 4, 2.4]); return; }
  if (k === "spiral") {
    cyl(ctx, 0, -0.5, 0, 2.55, 2.0, 22, 12, true);
    const H = 14, turns = 2, ri = 2.4, ro = 4.5, seg = 72, P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    for (let i = 0; i < seg; i++) { const t0 = i / seg, t1 = (i + 1) / seg, a0 = t0 * turns * Math.PI * 2, a1 = t1 * turns * Math.PI * 2, y0 = 0.25 + t0 * H, y1 = 0.25 + t1 * H; quadN(ctx, P(a0, ri, y0), P(a0, ro, y0), P(a1, ro, y1), P(a1, ri, y1), [0, 1, 0]); const m = (a0 + a1) / 2; quadN(ctx, P(a0, ro - 0.1, y0), P(a1, ro - 0.1, y1), P(a1, ro - 0.1, y1 + 1.1), P(a0, ro - 0.1, y0 + 1.1), [Math.cos(m), 0, Math.sin(m)]); }
    const Y = H + 0.25, dk = 28;
    for (let i = 0; i < dk; i++) { const a0 = (i / dk) * Math.PI * 2, a1 = ((i + 1) / dk) * Math.PI * 2; quadN(ctx, P(a0, 2.3, Y), P(a0, 6.2, Y), P(a1, 6.2, Y), P(a1, 2.3, Y), [0, 1, 0]); if (Math.abs(Math.sin(((a0 + a1) / 2) / 2)) > 0.1) { const m = (a0 + a1) / 2; quadN(ctx, P(a0, 6.1, Y), P(a1, 6.1, Y), P(a1, 6.1, Y + 1.1), P(a0, 6.1, Y + 1.1), [Math.cos(m), 0, Math.sin(m)]); } }
    return;
  }
  if (k === "archive") { boxR(ctx, [0, 2.5, 3.5], [12, 5, 8]); box(ctx, -2.3, 0, -1.7, -1.5, 3.2, -0.7); box(ctx, 1.5, 0, -1.7, 2.3, 3.2, -0.7); return; }
  if (k === "shrine") { boxR(ctx, [0, 0.65, 0], [1.9, 1.3, 1.1]); return; }
  if (k === "snare") return { kind: "box", width: 0.9, height: 2.4, depth: 0.9 };
  if (k === "lectern") return { kind: "box", width: 0.8, height: 1.2, depth: 0.6 };
  if (k === "waystone") return { kind: "box", width: 1.0, height: 3.0, depth: 0.6 };
  if (k === "memorial") return { kind: "box", width: 0.5, height: 2.5, depth: 0.5 };
  if (k === "hollow") return { kind: "box", width: 1.6, height: 1.5, depth: 1.6 };
  if (k === "barkface") return { kind: "box", width: 2.6, height: 4.4, depth: 2.6 };
  if (k === "leanto") { box(ctx, -2, 0, -1.4, 2, 2.3, -1.0); return; }
  return null;
}
