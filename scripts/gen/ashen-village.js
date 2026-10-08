// Ashen Close village pieces by params.kind. Origin at ground, front (door) in the −Z face.
// townhouse {w d h1 h2 jet seed lit}: narrow gothic house: fieldstone plinth, ashlar ground floor, jettied
//   timber-and-plaster upper floor on carved corbels, steep slate gable to the street with finials, a chimney.
// laundry {L}: two leaning posts, a sagging line, washing hung · lanternpost {h}: crooked iron post, caged lantern
// woodpile {L}: split logs stacked against a lean-to rail
import { boxR, triN, quadN, cyl, rot } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const FIELD = T("rough-fieldstone-wall-mossy"), ASHLAR = T("weathered-grey-ashlar-stone"), LIME = T("warm-limewash-plaster-hand-painted");
const OAK = T("dark-oak-timber-beam-hand-painted"), SLATE = T("dark-slate-roof-tiles-weathered"), IRON = T("rusted-black-iron-hammered");
const DOOR = T("old-dark-oak-planks"), CLOTH = T("rust-red-woven-wool-cloth"), BARK = T("rough-pine-bark");
const D = 180 / Math.PI;

function paint(ctx, s, tex, col, r = 0.88, m = 0) { if (s) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); }
function glow(ctx, s, col, e) { if (s) return; ctx.albedo(null); ctx.color(col); ctx.roughness(0.4); ctx.emissive(e); }
// a box given local min/max in a frame turned by yaw about the origin
function bx(ctx, yaw, x0, y0, z0, x1, y1, z1) {
  if (x1 - x0 < 1e-4 || y1 - y0 < 1e-4 || z1 - z0 < 1e-4) return;
  boxR(ctx, rot([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], { yaw }), [x1 - x0, y1 - y0, z1 - z0], { yaw });
}
// a wall in a face frame: plane from z0 (outside) to z1, x from -L/2..L/2, with holes {u, w, h, sill}
function wall(ctx, yaw, L, z0, z1, y0, y1, holes) {
  let cur = -L / 2;
  for (const o of [...holes].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    bx(ctx, yaw, cur, y0, z0, a, y1, z1);
    if (o.sill > 0) bx(ctx, yaw, a, y0, z0, b, y0 + o.sill, z1);
    bx(ctx, yaw, a, y0 + o.sill + o.h, z0, b, y1, z1);
    cur = b;
  }
  bx(ctx, yaw, cur, y0, z0, L / 2, y1, z1);
}
// a lit leaded window set into a hole: glass, a cross mullion, a sill and a lintel
function windowIn(ctx, s, yaw, o, z0, z1, y0, lit, lod, shutters) {
  const yb = y0 + o.sill, yt = yb + o.h, a = o.u - o.w / 2, b = o.u + o.w / 2, zm = (z0 + z1) / 2;
  if (lit) glow(ctx, s, "oklch(0.8 0.12 70)", "oklch(0.78 0.16 62)"); else glow(ctx, s, "oklch(0.25 0.03 240)", null);
  bx(ctx, yaw, a, yb, zm - 0.01, b, yt, zm + 0.01);
  paint(ctx, s, IRON, "oklch(0.9 0 0)", 0.6, 0.5);
  bx(ctx, yaw, o.u - 0.025, yb, zm - 0.03, o.u + 0.025, yt, zm + 0.03);
  bx(ctx, yaw, a, yb + o.h * 0.55 - 0.025, zm - 0.03, b, yb + o.h * 0.55 + 0.025, zm + 0.03);
  if (lod > 2) return;
  paint(ctx, s, ASHLAR, "oklch(0.86 0.01 80)");
  bx(ctx, yaw, a - 0.08, yb - 0.1, z0 - 0.08, b + 0.08, yb, z1 - 0.05); // sill
  bx(ctx, yaw, a - 0.12, yt, z0 - 0.04, b + 0.12, yt + 0.16, z1 - 0.05); // lintel
  if (shutters) {
    paint(ctx, s, DOOR, "oklch(0.7 0.05 150)");
    boxR(ctx, rot([a - 0.32, yb + o.h / 2, z0 - 0.22], { yaw }), [0.04, o.h, o.w / 2], { yaw: yaw - 55 });
    boxR(ctx, rot([b + 0.32, yb + o.h / 2, z0 - 0.22], { yaw }), [0.04, o.h, o.w / 2], { yaw: yaw + 55 });
  }
}

function townhouse(ctx, p, s) {
  const lod = s ? 5 : ctx.lod;
  const w = p.w ?? 5, d = p.d ?? 6.5, h1 = p.h1 ?? 2.8, h2 = p.h2 ?? 2.5, jet = p.jet ?? 0.45, lit = p.lit !== false;
  const t = 0.32, y0 = 0.45, y1 = y0 + h1, y2 = y1 + 0.28, y3 = y2 + h2;
  const W2 = w + 2 * jet, D2 = d + 2 * jet, R = W2 * (p.pitch ?? 0.85);
  const doorU = p.doorX ?? -w * 0.18;
  if (s) { // collider: plinth, the ground-floor block, the upper block
    boxR(ctx, [0, (y3 - 1) / 2, 0], [w + 0.16, y3 + 1, d + 0.16]);
    return;
  }
  if (lod >= 5) { // the far hull: the two blocks and the roof, a few dozen faces
    paint(ctx, s, ASHLAR, "oklch(0.88 0.01 80)");
    boxR(ctx, [0, (y1 - 1) / 2, 0], [w, y1 + 1, d]);
    paint(ctx, s, LIME, "oklch(0.86 0.015 85)");
    boxR(ctx, [0, (y1 + y3) / 2, 0], [W2, y3 - y1, D2]);
    for (const sz of [-1, 1]) triN(ctx, [-W2 / 2, y3, sz * D2 / 2], [W2 / 2, y3, sz * D2 / 2], [0, y3 + R, sz * D2 / 2], [0, 0, sz]);
    paint(ctx, s, SLATE, "oklch(0.78 0.015 250)", 0.8);
    const a5 = Math.atan2(R, W2 / 2), l5 = Math.hypot(W2 / 2, R) + 0.35;
    for (const sgn of [-1, 1]) boxR(ctx, [sgn * Math.cos(a5) * l5 / 2, y3 + R - Math.sin(a5) * l5 / 2 + 0.08, 0], [l5, 0.16, D2 + 0.7], { roll: -sgn * a5 * D });
    return;
  }
  // plinth
  paint(ctx, s, FIELD, "oklch(0.8 0.02 120)");
  boxR(ctx, [0, (y0 - 1) / 2, 0], [w + 0.16, y0 + 1, d + 0.16]);
  // ground floor: ashlar, door in front, windows
  paint(ctx, s, ASHLAR, "oklch(0.92 0.01 80)");
  const fH = [{ u: doorU, w: 1.15, h: 2.25, sill: 0 }]; if (w >= 4.4) fH.push({ u: w * 0.24, w: 0.8, h: 1.05, sill: 1.0 });
  const bH = [{ u: 0, w: 0.8, h: 1.0, sill: 1.05 }], sH = [{ u: 0, w: 0.7, h: 1.0, sill: 1.05 }];
  const faces = [[0, w, fH, d / 2], [180, w, bH, d / 2], [90, d - 2 * t, sH, w / 2], [270, d - 2 * t, sH, w / 2]];
  for (const [yaw, L, holes, half] of faces) wall(ctx, yaw, L, -half, -half + t, y0, y1, holes);
  for (const [yaw, L, holes, half] of faces) for (const o of holes) if (o.sill > 0) windowIn(ctx, s, yaw, o, -half, -half + t, y0, lit, lod, lod <= 2 && yaw === 0);
  if (lod <= 3) { // quoins on the corners
    paint(ctx, s, ASHLAR, "oklch(0.97 0.01 80)");
    for (let i = 0, y = y0; y < y1 - 0.1; i++, y += 0.42) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const lx = i % 2 ? 0.5 : 0.32, lz = i % 2 ? 0.32 : 0.5;
      boxR(ctx, [sx * (w / 2 - lx / 2 + 0.03), y + 0.19, sz * (d / 2 - lz / 2 + 0.03)], [lx, 0.36, lz]);
    }
  }
  // the door: recessed leaf, iron straps, a step, a lantern on a bracket
  paint(ctx, s, DOOR, "oklch(0.75 0.03 50)");
  bx(ctx, 0, doorU - 0.58, y0, -d / 2 + t * 0.6, doorU + 0.58, y0 + 2.25, -d / 2 + t * 0.6 + 0.08);
  paint(ctx, s, FIELD, "oklch(0.75 0.02 100)");
  bx(ctx, 0, doorU - 0.75, -0.2, -d / 2 - 0.6, doorU + 0.75, y0 - 0.02, -d / 2);
  if (lod <= 2) {
    paint(ctx, s, IRON, "oklch(0.85 0 0)", 0.55, 0.6);
    for (const yy of [0.5, 1.6]) bx(ctx, 0, doorU - 0.5, y0 + yy, -d / 2 + t * 0.6 - 0.02, doorU + 0.4, y0 + yy + 0.07, -d / 2 + t * 0.6);
    bx(ctx, 0, doorU + 0.36, y0 + 1.05, -d / 2 + t * 0.6 - 0.07, doorU + 0.44, y0 + 1.13, -d / 2 + t * 0.6); // ring
    // pointed arch over the door: two stones leaning to a keystone
    paint(ctx, s, ASHLAR, "oklch(0.97 0.01 80)");
    boxR(ctx, [doorU - 0.32, y0 + 2.42, -d / 2 - 0.02], [0.75, 0.2, 0.12], { roll: 28 });
    boxR(ctx, [doorU + 0.32, y0 + 2.42, -d / 2 - 0.02], [0.75, 0.2, 0.12], { roll: -28 });
    boxR(ctx, [doorU, y0 + 2.6, -d / 2 - 0.03], [0.22, 0.3, 0.14]);
  }
  paint(ctx, s, IRON, "oklch(0.8 0 0)", 0.55, 0.6);
  const lx = doorU + 0.95;
  bx(ctx, 0, lx - 0.03, y0 + 2.2, -d / 2 - 0.5, lx + 0.03, y0 + 2.26, -d / 2);
  bx(ctx, 0, lx - 0.12, y0 + 1.8, -d / 2 - 0.58, lx + 0.12, y0 + 1.82, -d / 2 - 0.34);
  bx(ctx, 0, lx - 0.1, y0 + 2.12, -d / 2 - 0.56, lx + 0.1, y0 + 2.14, -d / 2 - 0.36);
  for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(ctx, 0, lx + ax * 0.1 - 0.012, y0 + 1.82, -d / 2 - 0.46 + az * 0.1 - 0.012, lx + ax * 0.1 + 0.012, y0 + 2.12, -d / 2 - 0.46 + az * 0.1 + 0.012);
  glow(ctx, s, "oklch(0.9 0.1 75)", "oklch(0.85 0.17 65)");
  bx(ctx, 0, lx - 0.06, y0 + 1.86, -d / 2 - 0.52, lx + 0.06, y0 + 2.04, -d / 2 - 0.4);

  // the jetty: a beam course standing proud on corbels
  paint(ctx, s, OAK, "oklch(0.8 0.02 50)");
  boxR(ctx, [0, (y1 + y2) / 2, 0], [W2, y2 - y1, D2]);
  if (lod <= 2) {
    for (const [yaw, L, , half] of [[0, w, 0, d / 2], [180, w, 0, d / 2]]) {
      const n = Math.max(3, Math.round(L / 0.7));
      for (let i = 0; i <= n; i++) { const u = -L / 2 + 0.15 + (i / n) * (L - 0.3); bx(ctx, yaw, u - 0.08, y1 - 0.32, -half - jet + 0.02, u + 0.08, y1, -half + 0.05); }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxR(ctx, [sx * (w / 2 + jet * 0.35), y1 - 0.45, sz * (d / 2 + jet * 0.35)], [0.14, 0.9, 0.14], { yaw: sx * sz > 0 ? 45 : -45, pitch: sz * 35 * (sx > 0 ? 1 : 1), roll: -sx * 25 });
  }
  // upper floor: limewash between dark timbers
  paint(ctx, s, LIME, "oklch(0.88 0.015 85)");
  const t2 = 0.2, fwN = W2 >= 5.4 ? 2 : 1;
  const uF = fwN === 2 ? [{ u: -W2 * 0.22, w: 0.75, h: 1.2, sill: 0.8 }, { u: W2 * 0.22, w: 0.75, h: 1.2, sill: 0.8 }] : [{ u: 0, w: 0.85, h: 1.25, sill: 0.8 }];
  const uS = [{ u: -D2 * 0.15, w: 0.7, h: 1.1, sill: 0.85 }];
  const faces2 = [[0, W2, uF, D2 / 2], [180, W2, uF, D2 / 2], [90, D2 - 2 * t2, uS, W2 / 2], [270, D2 - 2 * t2, uS, W2 / 2]];
  for (const [yaw, L, holes, half] of faces2) wall(ctx, yaw, L, -half, -half + t2, y2, y3, holes);
  for (const [yaw, L, holes, half] of faces2) for (const o of holes) windowIn(ctx, s, yaw, o, -half, -half + t2, y2, lit && (yaw !== 180), lod, false);
  if (lod <= 2) { // the timber frame: corner posts, rails, studs between windows, braces
    paint(ctx, s, OAK, "oklch(0.72 0.03 45)");
    for (const [yaw, L, holes, half] of faces2) {
      const z0 = -half - 0.05, z1 = -half + 0.02, LL = yaw % 180 ? L + 2 * t2 : L;
      for (const u of [-LL / 2 + 0.08, LL / 2 - 0.08]) bx(ctx, yaw, u - 0.1, y2, z0, u + 0.1, y3, z1);
      bx(ctx, yaw, -LL / 2, y2 + 0.72, z0, LL / 2, y2 + 0.84, z1); // sill rail
      bx(ctx, yaw, -LL / 2, y3 - 0.16, z0, LL / 2, y3, z1); // wall plate
      for (const o of holes) for (const sgn of [-1, 1]) { const u = o.u + sgn * (o.w / 2 + 0.07); bx(ctx, yaw, u - 0.07, y2, z0, u + 0.07, y3 - 0.16, z1); }
      const bl = Math.hypot(0.9, y3 - y2 - 0.9);
      for (const sgn of [-1, 1]) boxR(ctx, rot([sgn * (LL / 2 - 0.6), y2 + 0.84 + (y3 - y2 - 1) / 2, (z0 + z1) / 2], { yaw }), [0.12, bl, z1 - z0], { yaw, roll: sgn * 32 });
    }
  }
  // roof: steep slate gable, ridge along Z, gables to the street
  const e = 0.35, a = Math.atan2(R, W2 / 2), sl = Math.hypot(W2 / 2, R) + e, RD = D2 + 0.7;
  paint(ctx, s, SLATE, "oklch(0.78 0.015 250)", 0.8);
  for (const sgn of [-1, 1]) {
    const dir = [sgn * Math.cos(a), -Math.sin(a)], nrm = [sgn * Math.sin(a), Math.cos(a)];
    const mid = [dir[0] * sl / 2 + nrm[0] * 0.09, y3 + R + dir[1] * sl / 2 + nrm[1] * 0.09];
    boxR(ctx, [mid[0], mid[1], 0], [sl, 0.16, RD], { roll: -sgn * a * D });
    if (lod <= 2) for (let k = 0.45; k < sl - 0.1; k += 0.42) { // slate courses
      const c = [dir[0] * k + nrm[0] * 0.19, y3 + R + dir[1] * k + nrm[1] * 0.19];
      boxR(ctx, [c[0], c[1], 0], [0.05, 0.05, RD - 0.04], { roll: -sgn * a * D });
    }
  }
  paint(ctx, s, IRON, "oklch(0.75 0 0)", 0.5, 0.6);
  boxR(ctx, [0, y3 + R + 0.2, 0], [0.24, 0.16, RD + 0.04]);
  for (const sz of [-1, 1]) { cyl(ctx, 0, y3 + R + 0.2, sz * RD / 2, 0.06, 0.0, 0.9, 6); cyl(ctx, 0, y3 + R + 0.42, sz * RD / 2, 0.11, 0.11, 0.06, 6); }
  // gables: plaster triangles, king post and a small lit window
  paint(ctx, s, LIME, "oklch(0.86 0.015 85)");
  for (const sz of [-1, 1]) {
    const z = sz * (D2 / 2 - 0.02);
    triN(ctx, [-W2 / 2, y3, z], [W2 / 2, y3, z], [0, y3 + R, z], [0, 0, sz]);
    triN(ctx, [-W2 / 2, y3, z - sz * 0.18], [W2 / 2, y3, z - sz * 0.18], [0, y3 + R, z - sz * 0.18], [0, 0, -sz]);
  }
  if (lod <= 2) {
    paint(ctx, s, OAK, "oklch(0.72 0.03 45)");
    for (const sz of [-1, 1]) {
      const z = sz * (D2 / 2 + 0.03);
      boxR(ctx, [0, y3 + R * 0.62, z], [0.14, R * 0.36, 0.06]);
      for (const sgn of [-1, 1]) boxR(ctx, [sgn * (W2 / 4 + e / 2 * Math.cos(a)) , y3 + R / 2 - e / 2 * Math.sin(a), sz * (RD / 2 - 0.02)], [sl, 0.24, 0.08], { roll: -sgn * a * D }); // bargeboards
      bx(ctx, 0, -W2 / 2, y3 - 0.02, z - 0.03, W2 / 2, y3 + 0.12, z + 0.03);
    }
    glow(ctx, s, "oklch(0.8 0.12 70)", lit ? "oklch(0.7 0.15 62)" : null);
    boxR(ctx, [0, y3 + R * 0.3, -(D2 / 2 + 0.01)], [0.5, 0.6, 0.02]);
    paint(ctx, s, IRON, "oklch(0.85 0 0)", 0.6, 0.5);
    boxR(ctx, [0, y3 + R * 0.3, -(D2 / 2 + 0.03)], [0.04, 0.6, 0.03]);
  }
  // chimney
  const cx = (p.chimney ?? 1) * W2 * 0.22, cz = D2 * 0.18, top = y3 + R + 0.9;
  paint(ctx, s, FIELD, "oklch(0.8 0.02 110)");
  boxR(ctx, [cx, (y3 + top) / 2, cz], [0.75, top - y3, 0.6]);
  paint(ctx, s, ASHLAR, "oklch(0.9 0.01 80)");
  boxR(ctx, [cx, top + 0.06, cz], [0.9, 0.12, 0.75]);
  if (lod <= 2) { paint(ctx, s, null, "oklch(0.45 0.06 40)"); for (const ox of [-0.15, 0.15]) cyl(ctx, cx + ox, top + 0.12, cz, 0.09, 0.08, 0.28, 8); }
}

function laundry(ctx, p, s) {
  const L = p.L ?? 5, lod = s ? 5 : ctx.lod;
  paint(ctx, s, OAK, "oklch(0.8 0.02 50)");
  boxR(ctx, [-L / 2, 1.1, 0], [0.12, 2.3, 0.12], { roll: -4 });
  boxR(ctx, [L / 2, 1.1, 0], [0.12, 2.3, 0.12], { roll: 5 });
  if (s) return;
  paint(ctx, s, null, "oklch(0.65 0.04 80)");
  const sag = (x) => 2.15 - 0.35 * (1 - (2 * x / L) ** 2);
  const n = 10;
  for (let i = 0; i < n; i++) { const xa = -L / 2 + (i / n) * L, xb = -L / 2 + ((i + 1) / n) * L; const ya = sag(xa), yb = sag(xb); boxR(ctx, [(xa + xb) / 2, (ya + yb) / 2, 0], [Math.hypot(xb - xa, yb - ya), 0.02, 0.02], { roll: Math.atan2(yb - ya, xb - xa) * D }); }
  const cols = ["oklch(0.9 0.02 90)", "oklch(0.75 0.06 30)", "oklch(0.82 0.03 240)", "oklch(0.88 0.04 85)", "oklch(0.7 0.05 140)"];
  let x = -L / 2 + 0.5, k = 0;
  while (x < L / 2 - 0.6) {
    const cw = 0.45 + ((k * 37) % 5) * 0.12, ch = 0.5 + ((k * 53) % 4) * 0.15;
    paint(ctx, s, k % 3 === 1 ? CLOTH : LIME, cols[k % cols.length]);
    const yt = sag(x + cw / 2);
    boxR(ctx, [x + cw / 2, yt - ch / 2, 0], [cw, ch, 0.015], { yaw: ((k * 17) % 9) - 4 });
    if (lod <= 2) { paint(ctx, s, OAK, "oklch(0.9 0.02 60)"); for (const px of [x + 0.06, x + cw - 0.06]) boxR(ctx, [px, sag(px) + 0.01, 0], [0.025, 0.09, 0.035]); }
    x += cw + 0.18; k++;
  }
}

function lanternpost(ctx, p, s) {
  const h = p.h ?? 3.2;
  paint(ctx, s, IRON, "oklch(0.8 0 0)", 0.5, 0.6);
  cyl(ctx, 0, 0, 0, 0.16, 0.12, 0.35, 8);
  boxR(ctx, [0.04, h / 2, 0], [0.09, h, 0.09], { roll: -2 });
  if (s) return;
  // a curled arm to the +X, a hanging cage
  for (let i = 0; i < 6; i++) { const a0 = (i / 6) * Math.PI * 0.9, a1 = ((i + 1) / 6) * Math.PI * 0.9; const p0 = [0.42 - 0.38 * Math.cos(a0), h - 0.4 + 0.38 * Math.sin(a0)], p1 = [0.42 - 0.38 * Math.cos(a1), h - 0.4 + 0.38 * Math.sin(a1)]; boxR(ctx, [(p0[0] + p1[0]) / 2 + 0.08, (p0[1] + p1[1]) / 2, 0], [Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + 0.02, 0.05, 0.05], { roll: Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * D }); }
  boxR(ctx, [0.55, h - 0.08, 0], [0.9, 0.06, 0.06]);
  const lx = 0.9, ly = h - 0.75;
  boxR(ctx, [lx, ly + 0.5, 0], [0.02, 0.3, 0.02]);
  cyl(ctx, lx, ly + 0.3, 0, 0.18, 0.02, 0.14, 6);
  cyl(ctx, lx, ly - 0.04, 0, 0.13, 0.13, 0.04, 6);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; boxR(ctx, [lx + Math.cos(a) * 0.13, ly + 0.13, Math.sin(a) * 0.13], [0.02, 0.34, 0.02]); }
  glow(ctx, s, "oklch(0.92 0.1 80)", "oklch(0.9 0.17 65)");
  cyl(ctx, lx, ly, 0, 0.06, 0.04, 0.24, 6);
}

function woodpile(ctx, p, s) {
  const L = p.L ?? 2.4;
  if (s) { boxR(ctx, [0, 0.6, 0], [L, 1.2, 0.8]); return; }
  paint(ctx, s, OAK, "oklch(0.75 0.03 50)");
  for (const x of [-L / 2, L / 2]) boxR(ctx, [x, 0.7, 0.35], [0.1, 1.4, 0.1]);
  boxR(ctx, [0, 1.45, 0.25], [L + 0.3, 0.06, 0.9], { pitch: -12 });
  paint(ctx, s, BARK, "oklch(0.85 0.03 60)");
  let k = 0;
  for (let row = 0; row < 4; row++) for (let i = 0; i < Math.floor(L / 0.24) - (row % 2); i++, k++) {
    const x = -L / 2 + 0.14 + i * 0.24 + (row % 2) * 0.12, y = 0.12 + row * 0.22;
    const r = 0.1 + ((k * 31) % 5) * 0.006;
    // a log lying along Z: a hexagonal prism
    const P = (zz) => [...Array(6)].map((_, j) => { const a = (j / 6) * Math.PI * 2; return [x + Math.cos(a) * r, y + Math.sin(a) * r, zz]; });
    const A = P(-0.35), B = P(0.35);
    for (let j = 0; j < 6; j++) { const jn = (j + 1) % 6, a = ((j + 0.5) / 6) * Math.PI * 2; quadN(ctx, A[j], A[jn], B[jn], B[j], [Math.cos(a), Math.sin(a), 0]); }
    for (const [Q, nz] of [[A, -1], [B, 1]]) { for (let j = 0; j < 6; j++) triN(ctx, [x, y, Q[0][2]], Q[j], Q[(j + 1) % 6], [0, 0, nz]); }
  }
}

function build(ctx, p, s) {
  const k = p.kind || "townhouse";
  if (k === "townhouse") townhouse(ctx, p, s);
  else if (k === "laundry") laundry(ctx, p, s);
  else if (k === "lanternpost") lanternpost(ctx, p, s);
  else if (k === "woodpile") woodpile(ctx, p, s);
}
export function geometry(ctx) { build(ctx, ctx.params || {}, false); }
export function collider(ctx) { build(ctx, ctx.params || {}, true); }
