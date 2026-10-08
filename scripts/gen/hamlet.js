// Race starting hamlets (Thornhollow, Cinderhold, Gullrest): params.kind picks the piece. Origin at the ground unless noted.
// stilthut {w d h stilt porch rise}: timber-and-thatch hut on posts, deck at y=stilt, door + steps in −Z
// ropebridge {L wd sag}: plank-and-rope bridge spanning +X from 0..L, deck y=0 at both ends
// shrine: mossy trilithon, altar, old-magic glow · rockhall {w d H cw ch}: hall cut into rock, door in −Z face (z=0), body to +Z
// banner {tint} · orecart · rails {L} along +Z · pier {L wd down}: deck y=0 running −Z · netrack · boat {L B D tint}
// lighthouse {h} · campfire · stairs {rise run wd} climbing +Z · plate (arrival stone) · signpost (post + arrow tip at +X)
import { box, boxR, cyl, blob, quadN, triN } from "./shape.js";
const WOOD = "cdn/texture-dark-oak-timber-beam-hand-painted.png", PLANK = "cdn/texture-worn-oak-floor-boards.png", DECK = "cdn/texture-weathered-wood-planks-grey.png";
const THATCH = "cdn/texture-old-golden-thatch-straw-roof.png", FIELD = "cdn/texture-rough-fieldstone-wall-mossy.png", MOSS = "cdn/texture-thick-green-forest-moss.png";
const ROCK = "cdn/texture-terrain-red-sandstone-rock-realistic-albedo.png", CARVE = "cdn/texture-weathered-carved-sandstone-blocks.png", IRON = "cdn/texture-rusted-black-iron-hammered.png";
const ROPE = "cdn/texture-twisted-hemp-rope.png", LIME = "cdn/texture-warm-limewash-plaster-hand-painted.png", CLOTH = "cdn/texture-rust-red-woven-wool-cloth.png", HULL = "cdn/texture-weathered-painted-boat-planks.png";
const FLAG = "cdn/texture-weathered-grey-ashlar-stone.png";
const DEG = 180 / Math.PI;

function wallX(ctx, z0, z1, x0, x1, y0, y1, holes) {
  let cur = x0;
  for (const o of [...holes].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    box(ctx, cur, y0, z0, a, y1, z1);
    if (o.sill > 0) box(ctx, a, y0, z0, b, y0 + o.sill, z1);
    box(ctx, a, y0 + o.sill + o.h, z0, b, y1, z1);
    cur = b;
  }
  box(ctx, cur, y0, z0, x1, y1, z1);
}
function wallZ(ctx, x0, x1, z0, z1, y0, y1, holes) {
  let cur = z0;
  for (const o of [...holes].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    box(ctx, x0, y0, cur, x1, y1, a);
    if (o.sill > 0) box(ctx, x0, y0, a, x1, y0 + o.sill, b);
    box(ctx, x0, y0 + o.sill + o.h, a, x1, y1, b);
    cur = b;
  }
  box(ctx, x0, y0, cur, x1, y1, z1);
}
const glow = (ctx, r, g, b, col = "oklch(0.9 0.1 75)") => { ctx.albedo(null); ctx.color(col); ctx.emissive(r, g, b); };
const unglow = (ctx) => ctx.emissive(null);
// a cylinder lying along X
function wheelX(ctx, x0, x1, y, z, r, seg = 10) {
  const P = (x, a) => [x, y + Math.sin(a) * r, z + Math.cos(a) * r];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * 6.283, b = ((i + 1) / seg) * 6.283, m = (a + b) / 2;
    quadN(ctx, P(x0, a), P(x0, b), P(x1, b), P(x1, a), [0, Math.sin(m), Math.cos(m)]);
    triN(ctx, [x0, y, z], P(x0, a), P(x0, b), [-1, 0, 0]); triN(ctx, [x1, y, z], P(x1, a), P(x1, b), [1, 0, 0]);
  }
}
// a thin strand from a to b (rope, rail)
function strand(ctx, a, b, t) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
  boxR(ctx, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [t, t, L], { pitch: Math.atan2(dy, Math.hypot(dx, dz)) * DEG, yaw: Math.atan2(-dx, -dz) * DEG + 180 });
}

const K = {
  stilthut(ctx, p, s, P) {
    const { w = 5, d = 4.4, h = 2.5, stilt = 2.2, porch = 1.8, rise = 1.9 } = p;
    const hw = w / 2, hd = d / 2, S = stilt, t = 0.16, y1 = S + h, Z0 = -hd - porch;
    P(WOOD, "oklch(0.8 0.02 60)");
    for (const x of [-hw, 0, hw]) for (const z of [Z0 + 0.15, -hd, hd]) box(ctx, x - 0.13, -1, z - 0.13, x + 0.13, S - 0.2, z + 0.13);
    if (!s) for (const x of [-hw, hw]) strand(ctx, [x, 0.2, -hd], [x, S - 0.3, hd], 0.1);
    P(PLANK, "oklch(0.9 0.03 65)");
    box(ctx, -hw - 0.3, S - 0.22, Z0, hw + 0.3, S, hd + 0.3);
    P(WOOD, "oklch(0.93 0.03 65)");
    wallX(ctx, -hd, -hd + t, -hw, hw, S, y1, [{ u: 0, w: 1.2, sill: 0, h: 2.1 }]);
    wallX(ctx, hd - t, hd, -hw, hw, S, y1, [{ u: 0, w: 0.9, sill: 0.95, h: 0.75 }]);
    wallZ(ctx, -hw, -hw + t, -hd + t, hd - t, S, y1, [{ u: 0, w: 0.9, sill: 0.95, h: 0.75 }]);
    wallZ(ctx, hw - t, hw, -hd + t, hd - t, S, y1, [{ u: 0, w: 0.9, sill: 0.95, h: 0.75 }]);
    // steps down from the porch
    const n = Math.ceil(S / 0.19), r = S / n;
    P(PLANK, "oklch(0.85 0.03 65)");
    for (let k = 1; k < n; k++) box(ctx, -0.7, Math.max(-0.4, k * r - 0.9), Z0 - (n - k) * 0.3, 0.7, k * r, Z0 - (n - k - 1) * 0.3);
    // porch rail, gap at the steps
    P(WOOD, "oklch(0.8 0.02 60)");
    for (const sx of [-1, 1]) {
      box(ctx, sx > 0 ? 0.75 : -hw - 0.3, S + 0.85, Z0, sx > 0 ? hw + 0.3 : -0.75, S + 0.95, Z0 + 0.1);
      for (const x of [sx * 0.8, sx * (hw + 0.2)]) box(ctx, x - 0.06, S, Z0, x + 0.06, S + 0.95, Z0 + 0.12);
    }
    // gables and thatch
    const ov = 0.6, ye = y1 - (ov * rise) / hd, yr = y1 + rise, L = Math.hypot(hd + ov, yr - ye), pa = Math.atan2(yr - ye, hd + ov) * DEG;
    if (!s) { P(WOOD, "oklch(0.88 0.03 60)"); for (const sx of [-1, 1]) triN(ctx, [sx * hw, y1, -hd], [sx * hw, y1, hd], [sx * hw, yr, 0], [sx, 0, 0]); }
    P(THATCH, "oklch(0.95 0.03 80)", 0.95);
    for (const sg of [-1, 1]) boxR(ctx, [0, (ye + yr) / 2 + 0.14, (sg * (hd + ov)) / 2], [w + 1.1, 0.34, L + 0.1], { pitch: sg * pa });
    if (s) return;
    P(MOSS, "oklch(0.9 0.05 130)");
    boxR(ctx, [0, yr + 0.22, 0], [w + 1.2, 0.3, 0.5]);
    for (let i = 0; i < 4; i++) blob(ctx, -hw + 0.6 + i * (w - 1.2) / 3, yr + 0.05, (i % 2 ? 0.6 : -0.7) * hd, 0.5, 0.18, 0.4, i + 3, 0.3, 4, 6);
    // window glow + lantern at the door
    ctx.color("oklch(0.85 0.09 75)", 0.6); ctx.albedo(null); ctx.emissive(1.4, 0.75, 0.3);
    quadN(ctx, [-0.45, S + 0.95, hd - 0.08], [0.45, S + 0.95, hd - 0.08], [0.45, S + 1.7, hd - 0.08], [-0.45, S + 1.7, hd - 0.08], [0, 0, 1]);
    for (const sx of [-1, 1]) quadN(ctx, [sx * (hw - 0.08), S + 0.95, -0.45], [sx * (hw - 0.08), S + 0.95, 0.45], [sx * (hw - 0.08), S + 1.7, 0.45], [sx * (hw - 0.08), S + 1.7, -0.45], [sx, 0, 0]);
    glow(ctx, 2.4, 1.3, 0.45); blob(ctx, 0.95, S + 2.0, -hd - 0.35, 0.13, 0.17, 0.13, 2, 0.05, 4, 6); unglow(ctx);
    P(IRON, "oklch(0.6 0.01 60)", 0.6, 0.6); box(ctx, 0.9, S + 2.17, -hd - 0.4, 1.0, S + 2.25, -hd); cyl(ctx, 0.95, S + 2.15, -hd - 0.35, 0.16, 0.02, 0.12, 6);
    // inside: a cot, a table, a shelf of jars, hanging herbs
    P(PLANK, "oklch(0.85 0.04 60)");
    box(ctx, -hw + t, S, hd - t - 0.9, -hw + t + 1.9, S + 0.45, hd - t);
    box(ctx, hw - t - 1.1, S + 0.72, -0.3, hw - t - 0.2, S + 0.8, 0.5);
    for (const [x, z] of [[hw - t - 1.05, -0.25], [hw - t - 0.25, -0.25], [hw - t - 1.05, 0.45], [hw - t - 0.25, 0.45]]) box(ctx, x - 0.04, S, z - 0.04, x + 0.04, S + 0.72, z + 0.04);
    box(ctx, hw - t - 0.35, S + 1.4, -hd + t + 0.3, hw - t, S + 1.46, hd - t - 0.3);
    ctx.albedo("cdn/texture-patched-burlap-sackcloth.png"); ctx.color("oklch(0.8 0.08 45)");
    box(ctx, -hw + t + 0.05, S + 0.45, hd - t - 0.85, -hw + t + 1.85, S + 0.6, hd - t - 0.05);
    ctx.albedo(null);
    for (let i = 0; i < 4; i++) { ctx.color(["oklch(0.6 0.08 140)", "oklch(0.55 0.1 30)", "oklch(0.75 0.05 90)", "oklch(0.5 0.07 250)"][i]); cyl(ctx, hw - t - 0.18, S + 1.46, -1 + i * 0.6, 0.09, 0.07, 0.22, 6); }
    ctx.color("oklch(0.55 0.09 130)");
    for (let i = 0; i < 3; i++) blob(ctx, -0.8 + i * 0.8, y1 - 0.35, 0.3, 0.12, 0.28, 0.12, i + 9, 0.4, 4, 5);
  },
  ropebridge(ctx, p, s, P) {
    const { L = 8, wd = 1.2, sag = 0.35 } = p, hz = wd / 2;
    const y = (x) => -sag * 4 * (x / L) * (1 - x / L), sl = (x) => (-sag * 4 * (1 - (2 * x) / L)) / L;
    if (s) {
      const N = 8;
      for (let i = 0; i < N; i++) {
        const x = ((i + 0.5) / N) * L, r = Math.atan(sl(x)) * DEG;
        boxR(ctx, [x, y(x) - 0.08, 0], [L / N + 0.08, 0.16, wd], { roll: r });
        for (const sz of [-1, 1]) boxR(ctx, [x, y(x) + 0.55, sz * (hz + 0.04)], [L / N + 0.08, 1.1, 0.08], { roll: r });
      }
      return;
    }
    P(DECK, "oklch(0.88 0.03 70)", 0.9);
    const N = Math.ceil(L / 0.3);
    for (let i = 0; i < N; i++) { const x = ((i + 0.5) / N) * L, j = Math.sin(i * 12.9898) * 0.04; boxR(ctx, [x, y(x) - 0.04, j], [0.24, 0.06, wd + 0.1 + Math.abs(j)], { roll: Math.atan(sl(x)) * DEG + j * 40 }); }
    P(ROPE, "oklch(0.88 0.05 80)", 0.95);
    const M = 12;
    for (const sz of [-1, 1]) {
      const z = sz * (hz + 0.02);
      for (let i = 0; i < M; i++) {
        const xa = (i / M) * L, xb = ((i + 1) / M) * L, hr = (x) => y(x) + 1.05 - 0.12 * 4 * (x / L) * (1 - x / L);
        strand(ctx, [xa, hr(xa), z], [xb, hr(xb), z], 0.05);
        strand(ctx, [xa, y(xa) - 0.02, z], [xb, y(xb) - 0.02, z], 0.05);
        strand(ctx, [xb, y(xb), z], [xb, hr(xb), z], 0.03);
      }
    }
  },
  shrine(ctx, p, s, P) {
    P(FIELD, "oklch(0.9 0.01 100)");
    cyl(ctx, 0, -0.5, 0, 2.7, 2.6, 0.8, 12); cyl(ctx, 0, 0.3, 0, 2.1, 2.0, 0.25, 12);
    for (const sx of [-1, 1]) boxR(ctx, [sx * 1.35, 1.75, 0.6], [0.7, 2.9, 0.6], { roll: sx * -3 });
    boxR(ctx, [0, 3.35, 0.6], [3.7, 0.55, 0.75], { roll: 2 });
    box(ctx, -0.6, 0.55, -0.45, 0.6, 1.4, 0.15);
    if (s) return;
    P(MOSS, "oklch(0.88 0.07 135)");
    blob(ctx, 0.4, 3.62, 0.6, 1.4, 0.2, 0.45, 2, 0.35, 4, 7); blob(ctx, -1.4, 0.45, 1.2, 0.9, 0.2, 0.7, 5, 0.4, 4, 7); blob(ctx, 1.8, 0.4, -0.6, 0.7, 0.18, 0.6, 7, 0.4, 4, 7);
    for (const sx of [-1, 1]) blob(ctx, sx * 1.45, 2.4, 0.5, 0.42, 0.6, 0.38, sx + 9, 0.35, 4, 6);
    // the offering bowl and the old magic above it
    P(IRON, "oklch(0.65 0.03 70)", 0.5, 0.7); cyl(ctx, 0, 1.4, -0.15, 0.22, 0.32, 0.16, 10);
    glow(ctx, 0.45, 1.6, 1.3, "oklch(0.9 0.08 180)"); blob(ctx, 0, 1.95, -0.15, 0.16, 0.16, 0.16, 1, 0.05, 5, 8);
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) box(ctx, sx * 1.35 - 0.12, 1.2 + i * 0.5, 0.29, sx * 1.35 + 0.12, 1.24 + i * 0.5, 0.3);
    glow(ctx, 0.9, 1.4, 0.6, "oklch(0.9 0.1 130)");
    for (let i = 0; i < 9; i++) { const a = i * 2.39, rr = 1.75 + (i % 3) * 0.12; cyl(ctx, Math.cos(a) * rr, 0.55, Math.sin(a) * rr, 0.03, 0.03, 0.12, 5); blob(ctx, Math.cos(a) * rr, 0.69, Math.sin(a) * rr, 0.08, 0.04, 0.08, i, 0.1, 3, 6); }
    unglow(ctx);
  },
  rockhall(ctx, p, s, P) {
    const { w = 10, d = 13, H = 12, cw = 6.4, ch = 4.6, fr = 1.6 } = p, hw = w / 2, hc = cw / 2;
    P(ROCK, "oklch(0.9 0.05 45)", 0.95);
    wallX(ctx, 0, fr, -hw, hw, 0, H, [{ u: 0, w: 2.6, sill: 0, h: 3.6 }]);
    box(ctx, -hw, 0, fr, -hc, H, d); box(ctx, hc, 0, fr, hw, H, d);
    box(ctx, -hc, 0, d - 1.5, hc, H, d); box(ctx, -hc, ch, fr, hc, H, d - 1.5);
    P(FLAG, "oklch(0.75 0.04 40)", 0.9);
    box(ctx, -hc, -0.3, fr, hc, 0.08, d - 1.5); box(ctx, -1.3, -0.3, 0, 1.3, 0.08, fr); box(ctx, -2.4, -0.6, -1.5, 2.4, 0.08, 0);
    P(CARVE, "oklch(0.85 0.05 45)");
    for (const sx of [-1, 1]) box(ctx, sx > 0 ? 1.3 : -2.3, 0.08, -0.35, sx > 0 ? 2.3 : -1.3, 4.6, 0.02);
    box(ctx, -2.5, 3.6, -0.42, 2.5, 4.6, 0.02); box(ctx, -2.9, 4.6, -0.6, 2.9, 5.0, 0.02);
    if (s) return;
    // the mesa's crag over the halls
    P(ROCK, "oklch(0.86 0.06 42)", 0.95);
    for (let i = 0; i < 5; i++) blob(ctx, -hw + 1 + i * (w - 2) / 4, H - 0.3, 1.5 + (i % 2) * 3, 2.2, 1.6 + (i % 3) * 0.6, 2.4, i + (p.seed || 0), 0.35, 5, 8);
    for (let i = 0; i < 3; i++) blob(ctx, (i - 1) * 3.6, H * 0.72, -0.1, 1.4, 1.2, 0.5, i + 20, 0.4, 4, 6);
    // ember-rune band on the lintel, braziers by the door
    glow(ctx, 2.6, 0.9, 0.2, "oklch(0.8 0.15 45)");
    for (let i = 0; i < 9; i++) box(ctx, -2.1 + i * 0.5, 4.0, -0.44, -1.9 + i * 0.5, 4.0 + (i % 2 ? 0.28 : 0.16), -0.42);
    for (const sx of [-1, 1]) blob(ctx, sx * 3.1, 1.08, -0.9, 0.3, 0.1, 0.3, sx, 0.2, 3, 7);
    unglow(ctx);
    P(IRON, "oklch(0.55 0.01 60)", 0.55, 0.7);
    for (const sx of [-1, 1]) { cyl(ctx, sx * 3.1, 0, -0.9, 0.08, 0.08, 0.8, 6); cyl(ctx, sx * 3.1, 0.75, -0.9, 0.18, 0.4, 0.35, 8, false); }
    // inside: long table, benches, weapon rack, a back hearth
    P(PLANK, "oklch(0.8 0.05 50)");
    const zc = (fr + d - 1.5) / 2;
    box(ctx, -0.6, 0.72, zc - 2.2, 0.6, 0.82, zc + 2.2);
    for (const sx of [-1, 1]) { box(ctx, sx * 0.55 - 0.03, 0.08, zc - 2, sx * 0.55 + 0.03, 0.72, zc + 2); box(ctx, sx * 1.3 - 0.2, 0.42, zc - 2, sx * 1.3 + 0.2, 0.5, zc + 2); }
    box(ctx, -hc, 1.3, fr + 1, -hc + 0.4, 1.36, fr + 4); box(ctx, hc - 0.4, 1.6, fr + 1, hc, 1.66, fr + 4);
    P(FIELD, "oklch(0.7 0.04 40)");
    box(ctx, -1.2, 0.08, d - 2.3, 1.2, 1.1, d - 1.5); box(ctx, -1.4, 2.2, d - 2.6, 1.4, 2.6, d - 1.5);
    glow(ctx, 3.2, 1.1, 0.25, "oklch(0.75 0.17 45)"); box(ctx, -0.9, 1.1, d - 2.25, 0.9, 1.25, d - 1.6); unglow(ctx);
    P(IRON, "oklch(0.6 0.02 60)", 0.4, 0.8);
    for (let i = 0; i < 4; i++) strand(ctx, [hc - 0.25, 1.66, fr + 1.3 + i * 0.7], [hc - 0.25, 2.9, fr + 1.5 + i * 0.7], 0.06);
  },
  banner(ctx, p, s, P) {
    P(IRON, "oklch(0.55 0.01 60)", 0.5, 0.7);
    cyl(ctx, 0, -0.4, 0, 0.07, 0.06, 5.6, 6);
    if (s) return;
    box(ctx, -0.7, 4.95, -0.05, 0.7, 5.05, 0.05); blob(ctx, 0, 5.3, 0, 0.12, 0.12, 0.12, 1, 0.05, 4, 6);
    P(CLOTH, p.tint || "oklch(0.72 0.12 32)", 0.95);
    const R = 7, top = 4.92, len = 2.7, hw = 0.6, sd = p.seed || 1;
    const pt = (u, v) => [-hw + u * 2 * hw, top - v * len, 0.08 + Math.sin(v * 4 + u * 2 + sd) * 0.07 * v];
    for (let i = 0; i < R; i++) { const a = i / R, b = (i + 1) / R; quadN(ctx, pt(0, a), pt(1, a), pt(1, b), pt(0, b), [0, 0, -1]); }
    triN(ctx, pt(0, 1), pt(0.5, 1), [0 - hw / 2, top - len - 0.45, pt(0.25, 1)[2]], [0, 0, -1]);
    triN(ctx, pt(0.5, 1), pt(1, 1), [hw / 2, top - len - 0.45, pt(0.75, 1)[2]], [0, 0, -1]);
    // a gold anvil sigil on the face
    ctx.albedo(null); ctx.color("oklch(0.82 0.13 80)"); ctx.metalness(0.6); ctx.roughness(0.4);
    const z = pt(0.5, 0.4)[2] - 0.02;
    box(ctx, -0.32, top - 1.0, z - 0.01, 0.32, top - 0.88, z); box(ctx, -0.12, top - 1.25, z - 0.01, 0.12, top - 1.0, z); box(ctx, -0.25, top - 1.35, z - 0.01, 0.25, top - 1.25, z);
    box(ctx, -hw, top - 0.12, z - 0.01, hw, top - 0.04, z); ctx.metalness(0);
  },
  orecart(ctx, p, s, P) {
    P(IRON, "oklch(0.6 0.02 50)", 0.5, 0.6);
    box(ctx, -0.55, 0.32, -0.8, 0.55, 1.0, 0.8);
    if (s) return;
    P(PLANK, "oklch(0.75 0.05 50)"); for (const sx of [-1, 1]) box(ctx, sx * 0.56 - 0.02, 0.4, -0.75, sx * 0.56 + 0.02, 0.9, 0.75);
    P(IRON, "oklch(0.45 0.01 50)", 0.5, 0.8);
    for (const z of [-0.5, 0.5]) { wheelX(ctx, -0.62, -0.5, 0.24, z, 0.24); wheelX(ctx, 0.5, 0.62, 0.24, z, 0.24); }
    box(ctx, -0.6, 0.98, -0.85, 0.6, 1.06, -0.78); box(ctx, -0.6, 0.98, 0.78, 0.6, 1.06, 0.85);
    ctx.albedo(ROCK); ctx.color("oklch(0.65 0.06 40)");
    for (let i = 0; i < 7; i++) blob(ctx, ((i % 3) - 1) * 0.3, 1.0 + (i % 2) * 0.1, (i - 3) * 0.2, 0.22, 0.18, 0.2, i, 0.35, 3, 5);
    ctx.albedo(null); ctx.color("oklch(0.65 0.14 50)"); ctx.metalness(0.85); ctx.roughness(0.3); ctx.emissive("oklch(0.3 0.09 50)");
    for (let i = 0; i < 5; i++) blob(ctx, ((i % 2) - 0.5) * 0.4, 1.15, (i - 2) * 0.28, 0.1, 0.08, 0.1, i + 5, 0.3, 3, 5);
    unglow(ctx); ctx.metalness(0);
  },
  rails(ctx, p, s, P) {
    const { L = 10 } = p;
    P(PLANK, "oklch(0.7 0.04 50)");
    for (let z = 0.3; z < L; z += 0.65) box(ctx, -0.8, -0.05, z - 0.11, 0.8, 0.08, z + 0.11);
    if (s) return;
    P(IRON, "oklch(0.55 0.01 50)", 0.4, 0.8);
    for (const sx of [-1, 1]) box(ctx, sx * 0.56 - 0.04, 0.08, 0, sx * 0.56 + 0.04, 0.18, L);
  },
  pier(ctx, p, s, P) {
    const { L = 14, wd = 2.6, down = 3.2 } = p, hw = wd / 2;
    P(DECK, "oklch(0.9 0.02 70)", 0.9);
    if (s) { box(ctx, -hw, -0.2, -L, hw, 0, 0); for (let z = 0; z <= L; z += 2.4) for (const sx of [-1, 1]) box(ctx, sx * (hw + 0.05) - 0.16, -down, -z - 0.16, sx * (hw + 0.05) + 0.16, 0.6, -z + 0.16); return; }
    for (let z = 0, i = 0; z < L; z += 0.3, i++) { const j = Math.sin(i * 7.31) * 0.02; box(ctx, -hw - Math.abs(j) * 3, -0.08 + j * 0.3, -z - 0.27, hw + Math.abs(j) * 2, 0, -z); }
    P(WOOD, "oklch(0.75 0.02 60)", 0.9);
    for (const sx of [-1, 1]) box(ctx, sx * (hw - 0.2) - 0.1, -0.4, -L, sx * (hw - 0.2) + 0.1, -0.08, 0);
    for (let z = 0; z <= L; z += 2.4) {
      for (const sx of [-1, 1]) cyl(ctx, sx * (hw + 0.05), -down, -z, 0.17, 0.15, down + 0.6, 8);
      strand(ctx, [-hw, -0.5, -z], [hw, -down + 0.6, -z], 0.09);
    }
    // the end: a ladder to the water, a lantern post, a coil of rope
    for (let y = -0.3; y > -2; y -= 0.35) box(ctx, -0.35, y - 0.04, -L - 0.12, 0.35, y + 0.04, -L - 0.04);
    for (const sx of [-1, 1]) box(ctx, sx * 0.38 - 0.04, -2.1, -L - 0.12, sx * 0.38 + 0.04, 0.5, -L - 0.04);
    cyl(ctx, hw - 0.15, 0, -L + 0.3, 0.09, 0.08, 2.6, 6); box(ctx, hw - 0.5, 2.45, -L + 0.25, hw - 0.1, 2.53, -L + 0.35);
    glow(ctx, 2.6, 1.4, 0.5); blob(ctx, hw - 0.45, 2.2, -L + 0.3, 0.12, 0.17, 0.12, 3, 0.05, 4, 6); unglow(ctx);
    P(ROPE, "oklch(0.85 0.05 80)", 0.95);
    for (let i = 0; i < 3; i++) cyl(ctx, -hw + 0.6, i * 0.07, -L * 0.6, 0.4 - i * 0.05, 0.4 - i * 0.05, 0.07, 10);
  },
  netrack(ctx, p, s, P) {
    const { w = 4.6 } = p, hw = w / 2;
    P(WOOD, "oklch(0.8 0.02 60)", 0.9);
    for (const x of [-hw, 0, hw]) cyl(ctx, x, -0.3, 0, 0.09, 0.07, 2.6, 6);
    if (s) return;
    box(ctx, -hw - 0.2, 2.1, -0.05, hw + 0.2, 2.2, 0.05);
    ctx.albedo(null); ctx.color("oklch(0.62 0.03 80)"); ctx.roughness(1);
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? -hw + 0.1 : 0.1, x1 = sx < 0 ? -0.1 : hw - 0.1, Y = (u) => 2.1 - 0.25 * Math.sin(u * Math.PI);
      for (let i = 0; i <= 9; i++) { const u = i / 9, x = x0 + (x1 - x0) * u; strand(ctx, [x, Y(u), 0.06], [x, 0.45 + Math.sin(i * 2.1) * 0.1, 0.18 + Math.sin(i) * 0.05], 0.02); }
      for (let j = 1; j <= 6; j++) { const v = j / 7; for (let i = 0; i < 9; i++) { const ua = i / 9, ub = (i + 1) / 9, ya = Y(ua) - v * (Y(ua) - 0.5), yb = Y(ub) - v * (Y(ub) - 0.5); strand(ctx, [x0 + (x1 - x0) * ua, ya, 0.06 + v * 0.12], [x0 + (x1 - x0) * ub, yb, 0.06 + v * 0.12], 0.02); } }
      ctx.color("oklch(0.72 0.15 55)"); for (let i = 0; i < 5; i++) blob(ctx, x0 + (x1 - x0) * (i + 0.5) / 5, 2.0 - 0.2 * Math.sin(((i + 0.5) / 5) * Math.PI), 0.08, 0.08, 0.06, 0.06, i, 0.1, 3, 5);
      ctx.color("oklch(0.62 0.03 80)");
    }
    // a heap of net on the ground
    ctx.color("oklch(0.5 0.03 80)"); blob(ctx, hw + 1, 0.15, 0.6, 0.8, 0.25, 0.6, 4, 0.4, 4, 7);
  },
  boat(ctx, p, s, P) {
    const { L = 4.6, B = 1.5, D = 0.7, tint = "oklch(0.85 0.06 230)" } = p;
    if (s) { box(ctx, -B / 2, 0, -L / 2, B / 2, D, L / 2); return; }
    const N = 12, sec = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, z = -L / 2 + u * L, b = Math.max(0.02, (B / 2) * Math.pow(Math.sin(Math.PI * u), 0.55)), top = D + 0.25 * Math.pow(2 * u - 1, 2);
      sec.push([[-b, top, z], [-b * 0.86, D * 0.35, z], [0, 0, z], [b * 0.86, D * 0.35, z], [b, top, z]]);
    }
    for (let j = 0; j < 4; j++) {
      if (j === 0 || j === 3) P(HULL, tint, 0.85); else P(HULL, "oklch(0.9 0.02 70)", 0.85);
      for (let i = 0; i < N; i++) { const a = sec[i][j], b = sec[i][j + 1], c = sec[i + 1][j + 1], d = sec[i + 1][j]; quadN(ctx, a, b, c, d, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - D * 0.6, 0]); }
    }
    P(WOOD, "oklch(0.8 0.03 60)", 0.9);
    for (const z of [-0.8, 0.2, 1.0]) box(ctx, -B * 0.42, D * 0.62, z - 0.12, B * 0.42, D * 0.7, z + 0.12);
    for (const sx of [-1, 1]) { strand(ctx, [sx * 0.3, D * 0.75, -1.6], [sx * 0.45, D * 0.78, 1.5], 0.05); box(ctx, sx * 0.45 - 0.08, D * 0.72, 1.35, sx * 0.45 + 0.08, D * 0.8, 1.9); }
  },
  lighthouse(ctx, p, s, P) {
    const { h = 13, r0 = 2.4, r1 = 1.7 } = p;
    P(FIELD, "oklch(0.92 0.01 90)");
    cyl(ctx, 0, -2.5, 0, r0 + 0.6, r0 + 0.5, 3.2, 12);
    const bands = 5, rr = (y) => r0 + (r1 - r0) * (y / h);
    for (let i = 0; i < bands; i++) {
      const y0 = 0.7 + (i / bands) * (h - 0.7), y1 = 0.7 + ((i + 1) / bands) * (h - 0.7);
      if (i % 2) P(LIME, "oklch(0.62 0.13 32)", 0.9); else P(LIME, "oklch(0.97 0.02 85)", 0.9);
      cyl(ctx, 0, y0, 0, rr(y0), rr(y1), y1 - y0, 14, false);
    }
    if (s) return;
    P(FIELD, "oklch(0.85 0.01 90)");
    cyl(ctx, 0, h, 0, r1 + 0.9, r1 + 0.9, 0.3, 14);
    P(IRON, "oklch(0.5 0.01 60)", 0.5, 0.7);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; cyl(ctx, Math.cos(a) * (r1 + 0.8), h + 0.3, Math.sin(a) * (r1 + 0.8), 0.03, 0.03, 0.9, 4); }
    for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283, b = ((i + 1) / 14) * 6.283, R = r1 + 0.8; strand(ctx, [Math.cos(a) * R, h + 1.2, Math.sin(a) * R], [Math.cos(b) * R, h + 1.2, Math.sin(b) * R], 0.05); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; box(ctx, Math.cos(a) * (r1 - 0.3) - 0.05, h + 0.3, Math.sin(a) * (r1 - 0.3) - 0.05, Math.cos(a) * (r1 - 0.3) + 0.05, h + 2.2, Math.sin(a) * (r1 - 0.3) + 0.05); }
    ctx.albedo(null); ctx.color("oklch(0.95 0.08 85)", 0.7); ctx.emissive(3.2, 2.2, 0.9);
    cyl(ctx, 0, h + 0.3, 0, r1 - 0.35, r1 - 0.35, 1.9, 12, false);
    blob(ctx, 0, h + 1.2, 0, 0.45, 0.45, 0.45, 2, 0.05, 5, 8); unglow(ctx);
    P(LIME, "oklch(0.55 0.13 32)", 0.8); cyl(ctx, 0, h + 2.2, 0, r1 + 0.15, 0.05, 1.5, 12); blob(ctx, 0, h + 3.75, 0, 0.16, 0.16, 0.16, 1, 0.05, 4, 6);
    // a door and three slit windows facing −Z
    P(WOOD, "oklch(0.7 0.03 50)"); box(ctx, -0.55, 0.7, -rr(0.7) - 0.12, 0.55, 2.8, -rr(0.7) + 0.2);
    P(FIELD, "oklch(0.8 0.01 90)"); box(ctx, -0.75, 2.8, -rr(2.8) - 0.2, 0.75, 3.1, -rr(2.8) + 0.2);
    glow(ctx, 1.6, 0.9, 0.35); for (const y of [5, 8, 11]) box(ctx, -0.15, y, -rr(y) - 0.04, 0.15, y + 0.8, -rr(y) + 0.1); unglow(ctx);
  },
  campfire(ctx, p, s, P) {
    P(FIELD, "oklch(0.8 0.01 80)");
    if (s) { cyl(ctx, 0, 0, 0, 0.95, 0.9, 0.3, 8); return; }
    for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.283; blob(ctx, Math.cos(a) * 0.82, 0.1, Math.sin(a) * 0.82, 0.2, 0.15, 0.17, i, 0.3, 3, 6); }
    ctx.albedo(null); ctx.color("oklch(0.25 0.01 50)"); cyl(ctx, 0, 0, 0, 0.65, 0.6, 0.04, 10);
    P(WOOD, "oklch(0.55 0.03 50)", 0.95);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; boxR(ctx, [Math.cos(a) * 0.22, 0.28, Math.sin(a) * 0.22], [0.11, 0.11, 0.75], { pitch: 50, yaw: -a * DEG - 90 }); }
    glow(ctx, 3.4, 1.2, 0.3, "oklch(0.7 0.18 45)"); for (let i = 0; i < 6; i++) blob(ctx, Math.cos(i) * 0.25, 0.05, Math.sin(i) * 0.25, 0.1, 0.05, 0.1, i, 0.3, 3, 5); unglow(ctx);
    P(WOOD, "oklch(0.7 0.03 50)");
    for (const sx of [-1, 1]) { strand(ctx, [sx * 1.05, 0, -0.1], [sx * 1.05, 1.35, 0], 0.07); strand(ctx, [sx * 1.05, 1.1, 0], [sx * 1.2, 1.45, 0], 0.05); }
    strand(ctx, [-1.15, 1.32, 0], [1.15, 1.32, 0], 0.05);
    P(IRON, "oklch(0.45 0.01 60)", 0.5, 0.7); cyl(ctx, 0, 0.75, 0, 0.18, 0.24, 0.32, 10); strand(ctx, [0, 1.32, 0], [0, 1.07, 0], 0.015);
  },
  stairs(ctx, p, s, P) {
    const { rise = 8, run = 16, wd = 1.8 } = p, n = Math.max(2, Math.round(rise / 0.2)), r = rise / n, tl = run / n, hw = wd / 2;
    P(PLANK, "oklch(0.88 0.03 65)");
    for (let k = 1; k <= n; k++) box(ctx, -hw, k * r - 0.9, (k - 1) * tl, hw, k * r, k * tl + (k === n ? 0.6 : 0.02));
    if (s) return;
    P(WOOD, "oklch(0.75 0.02 60)");
    for (const sx of [-1, 1]) {
      for (let k = 0; k <= n; k += 6) box(ctx, sx * hw - 0.06, k * r - 0.5, k * tl, sx * hw + 0.06, k * r + 1.0, k * tl + 0.12);
      strand(ctx, [sx * hw, 0.95, 0], [sx * hw, rise + 0.95, run], 0.08);
    }
  },
  plate(ctx, p, s, P) {
    P(FLAG, "oklch(0.9 0.02 70)");
    cyl(ctx, 0, -0.4, 0, 1.7, 1.6, 0.43, 16);
    if (s) return;
    P(FLAG, "oklch(0.75 0.03 60)"); cyl(ctx, 0, 0.03, 0, 0.5, 0.48, 0.03, 12);
    glow(ctx, 2.2, 1.3, 0.45); for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; boxR(ctx, [Math.cos(a) * 1.25, 0.035, Math.sin(a) * 1.25], [0.1, 0.012, i % 3 ? 0.18 : 0.32], { yaw: -a * DEG }); }
    unglow(ctx);
  },
  signpost(ctx, p, s, P) {
    P(WOOD, "oklch(0.85 0.02 60)");
    box(ctx, -0.09, -0.3, -0.09, 0.09, 2.7, 0.09);
    if (s) return;
    cyl(ctx, 0, 2.7, 0, 0.14, 0.0, 0.25, 4);
    P(PLANK, "oklch(0.85 0.04 60)");
    const y0 = 2.02, y1 = 2.38, x = 1.62;
    for (const z of [-0.035, 0.035]) triN(ctx, [x, y0, z], [x, y1, z], [x + 0.28, (y0 + y1) / 2, z], [0, 0, z]);
    quadN(ctx, [x, y0, -0.035], [x + 0.28, (y0 + y1) / 2, -0.035], [x + 0.28, (y0 + y1) / 2, 0.035], [x, y0, 0.035], [0.3, -1, 0]);
    quadN(ctx, [x, y1, -0.035], [x + 0.28, (y0 + y1) / 2, -0.035], [x + 0.28, (y0 + y1) / 2, 0.035], [x, y1, 0.035], [0.3, 1, 0]);
    glow(ctx, 2.2, 1.2, 0.4); blob(ctx, -0.32, 1.7, 0, 0.1, 0.14, 0.1, 1, 0.05, 4, 6); unglow(ctx);
    P(IRON, "oklch(0.5 0.01 60)", 0.5, 0.7); box(ctx, -0.36, 1.9, -0.02, 0.0, 1.95, 0.02);
  },
};
function build(ctx, s) {
  const p = ctx.params || {};
  const P = (tex, col, r = 0.9, m = 0) => { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
  (K[p.kind] || K.plate)(ctx, p, s, P);
}
export function geometry(ctx) { ctx.flat(); build(ctx, (ctx.lod || 1) >= 4); }
export function collider(ctx) { build(ctx, true); }
