// Emberstone Bastion, the Stonewrought forgehold of the Ashfall Reaches: params.kind picks the piece. Origin at the ground.
// curtain {verts [[x,z]…], h}: the ring of crenellated basalt wall + spired octagonal towers through verts, open between last and first
// wall {L h t}: one segment along X, outward −Z · tower {h r} · gatehouse: twin 6×6 towers, 5 m pointed passage along Z, portcullis raised
// keep {w d h}: forge-keep, door −Z 3 m, flagstone floor, great forge at +Z · guardian {h}: hammer-bearing stone colossus facing −Z on a plinth
// lavafall {h w}: lava sheet down a basalt face (rock at +Z), glowing pool at (0,0,-2.6) · channel {L wd}: lava runnel along X between rock banks
// bridge {L wd rise}: arched stone bridge spanning Z · workshop {w d}: open smithy, back wall +Z · banner {tint}: red, gold compass-star · brazier
import { box, boxR, cyl, blob, quadN, triN } from "./shape.js";
const BAS = "cdn/texture-dark-volcanic-basalt-blocks.png", ROCK = "cdn/texture-cracked-black-volcanic-rock.png", STAT = "cdn/texture-weathered-grey-granite-carved-stone.png";
const FLAG = "cdn/texture-dark-basalt-flagstone-floor.png", SLATE = "cdn/texture-dark-slate-roof-tiles.png", IRON = "cdn/texture-rusted-black-iron-hammered.png";
const WOOD = "cdn/texture-dark-oak-timber-beam-hand-painted.png", CLOTH = "cdn/texture-rust-red-woven-wool-cloth.png";
const GOLD = "oklch(0.8 0.14 80)", EMB = "oklch(0.72 0.19 45)";
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// an emitter seen through a placement: offset, yaw (radians), uniform scale; rigid, so winding holds
function xf(e, ox, oy, oz, yaw = 0, k = 1) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const m = (v) => { const o = []; for (let i = 0; i < v.length; i += 3) { const x = v[i] * k, y = v[i + 1] * k, z = v[i + 2] * k; o.push(ox + x * c + z * s, oy + y, oz - x * s + z * c); } return o; };
  return { quad: (...v) => e.quad(...m(v)), tri: (...v) => e.tri(...m(v)) };
}
// a squared beam from a to b, w across (horizontal side), d the other way
function beam(e, a, b, w, d) {
  const u = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const s = norm(crs(u, Math.abs(u[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0])), t = crs(s, u);
  const P = (p, i, j) => [p[0] + s[0] * i * w / 2 + t[0] * j * d / 2, p[1] + s[1] * i * w / 2 + t[1] * j * d / 2, p[2] + s[2] * i * w / 2 + t[2] * j * d / 2];
  const side = (i0, j0, i1, j1, n) => quadN(e, P(a, i0, j0), P(b, i0, j0), P(b, i1, j1), P(a, i1, j1), n);
  side(1, -1, 1, 1, s); side(-1, -1, -1, 1, [-s[0], -s[1], -s[2]]); side(-1, 1, 1, 1, t); side(-1, -1, 1, -1, [-t[0], -t[1], -t[2]]);
  quadN(e, P(a, -1, -1), P(a, 1, -1), P(a, 1, 1), P(a, -1, 1), [-u[0], -u[1], -u[2]]);
  quadN(e, P(b, -1, -1), P(b, 1, -1), P(b, 1, 1), P(b, -1, 1), u);
}
// a box tapering from w0×d0 at y0 to w1×d1 at y1
function frustum(e, cx, cz, y0, y1, w0, d0, w1, d1) {
  const c = [cx, (y0 + y1) / 2, cz], A = [], B = [];
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { A.push([cx + i * w0 / 2, y0, cz + j * d0 / 2]); B.push([cx + i * w1 / 2, y1, cz + j * d1 / 2]); }
  for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4, m = [(A[k][0] + B[k2][0]) / 2 - c[0], 0, (A[k][2] + B[k2][2]) / 2 - c[2]]; quadN(e, A[k], A[k2], B[k2], B[k], m); }
  quadN(e, A[0], A[1], A[2], A[3], [0, -1, 0]); quadN(e, B[0], B[1], B[2], B[3], [0, 1, 0]);
}
// the solid above a pointed arch of half-width a (spring → apex), wall from t0 to t1 along Z, up to top
function archY(a, spring, apex) {
  const rise = apex - spring, R = (a * a + rise * rise) / (2 * a), lc = -a + R;
  return { R, lc, y: (l) => spring + Math.sqrt(Math.max(0, R * R - (l <= 0 ? (l - lc) ** 2 : (l + lc) ** 2))) };
}
function archFill(e, a, spring, apex, top, t0, t1, n = 10) {
  const A = archY(a, spring, apex);
  for (let k = 0; k < n; k++) {
    const l0 = -a + (2 * a * k) / n, l1 = -a + (2 * a * (k + 1)) / n, y0 = A.y(l0), y1 = A.y(l1), lm = (l0 + l1) / 2;
    quadN(e, [l0, y0, t0], [l1, y1, t0], [l1, top, t0], [l0, top, t0], [0, 0, -1]);
    quadN(e, [l0, y0, t1], [l1, y1, t1], [l1, top, t1], [l0, top, t1], [0, 0, 1]);
    quadN(e, [l0, y0, t0], [l1, y1, t0], [l1, y1, t1], [l0, y0, t1], [(lm <= 0 ? A.lc : -A.lc) - lm, spring - (y0 + y1) / 2, 0]);
  }
}
// voussoir ring proud of a face at z, around the arch
function archRing(e, a, spring, apex, z, n = 9, w = 0.5) {
  const A = archY(a + 0.25, spring, apex + 0.3); let prev = null;
  for (let k = 0; k <= n; k++) { const l = -(a + 0.25) + (2 * (a + 0.25) * k) / n, p = [l, A.y(l), z]; if (prev) beam(e, prev, p, 0.28, w); prev = p; }
}
// the Stonewrought compass-star: 8 points in the plane z, facing nz
function star(e, cx, cy, z, R, nz) {
  const n = [0, 0, nz];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 2, r = i % 2 ? R * 0.58 : R, b = R * 0.2;
    const tip = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], l = [cx + Math.cos(a - 0.39) * b, cy + Math.sin(a - 0.39) * b, z], q = [cx + Math.cos(a + 0.39) * b, cy + Math.sin(a + 0.39) * b, z];
    triN(e, [cx, cy, z], l, tip, n); triN(e, [cx, cy, z], tip, q, n);
  }
  for (let i = 0; i < 20; i++) { const a0 = (i / 20) * 6.283, a1 = ((i + 1) / 20) * 6.283, r0 = R * 0.68, r1 = R * 0.78;
    quadN(e, [cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0, z], [cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0, z], [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1, z], [cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1, z], n); }
}
function disc(e, cx, cy, z, R, nz, seg = 16) { for (let i = 0; i < seg; i++) { const a0 = (i / seg) * 6.283, a1 = ((i + 1) / seg) * 6.283; triN(e, [cx, cy, z], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, z], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, z], [0, 0, nz]); } }
const rnd = (seed) => { let h = (seed * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };

function wallSeg(e, g, L, h = 8, t = 3) {
  const a = -L / 2, b = L / 2, o = -t / 2;
  g.P(BAS, "oklch(0.98 0.012 40)");
  if (g.col) { box(e, a, -4, o, b, h, t / 2); box(e, a, h, o, b, h + 1.5, o + 0.6); return; }
  box(e, a, -4, o - 0.5, b, 1.0, t / 2 + 0.3);
  box(e, a, 1.0, o, b, h, t / 2);
  if (g.simple) { box(e, a, h, o, b, h + 1.5, o + 0.6); return; }
  quadN(e, [a, 1.0, o - 0.5], [b, 1.0, o - 0.5], [b, 1.7, o], [a, 1.7, o], [0, 0.7, -1]);
  g.P(BAS, "oklch(0.92 0.012 40)");
  box(e, a, h - 1.5, o - 0.15, b, h - 1.1, t / 2 + 0.1);
  const n = Math.max(1, Math.round(L / 9));
  for (let i = 1; i < n; i++) { const x = a + (i * L) / n; box(e, x - 0.6, 1.0, o - 0.45, x + 0.6, h - 1.5, o); }
  g.P(BAS, "oklch(0.98 0.012 40)");
  box(e, a, h, o, b, h + 0.5, o + 0.6);
  const m = Math.max(2, Math.round(L / 2.2));
  for (let i = 0; i < m; i++) {
    const x0 = a + (i * L) / m + 0.4, x1 = a + ((i + 1) * L) / m - 0.4;
    box(e, x0, h + 0.5, o, x1, h + 1.5, o + 0.6);
    if (g.trim) box(e, x0 - 0.05, h + 1.5, o - 0.05, x1 + 0.05, h + 1.62, o + 0.65);
  }
  box(e, a, h, t / 2 - 0.4, b, h + 0.7, t / 2);
  if (g.trim) { g.glow(EMB, 3, 0.9, 0.2); for (let i = 0; i < n; i++) { const x = a + ((i + 0.5) * L) / n; box(e, x - 0.12, h - 4.2, o - 0.03, x + 0.12, h - 2.8, o + 0.02); } }
}
function tower(e, g, h = 11, r = 4) {
  g.P(BAS, "oklch(0.98 0.012 40)");
  if (g.col) { cyl(e, 0, -4, 0, r + 0.4, r, h + 1.6, 8); return; }
  cyl(e, 0, -4, 0, r + 0.7, r, 5, 8);
  cyl(e, 0, 1, 0, r, r, h - 1, 8);
  const ap = r * Math.cos(Math.PI / 8);
  if (!g.simple) {
    g.P(BAS, "oklch(0.92 0.012 40)"); cyl(e, 0, h - 0.6, 0, r + 0.05, r + 0.5, 0.6, 8);
    g.P(BAS, "oklch(0.98 0.012 40)"); cyl(e, 0, h, 0, r + 0.5, r + 0.5, 0.5, 8);
    for (let i = 0; i < 8; i++) { const an = ((i + 0.5) / 8) * 6.283, R = (r + 0.2) * Math.cos(Math.PI / 8); boxR(e, [Math.cos(an) * R, h + 1.0, Math.sin(an) * R], [1.5, 1.0, 0.55], { yaw: 90 - (an * 180) / Math.PI }); }
    g.glow(EMB, 3, 0.9, 0.2);
    for (let i = 0; i < 8; i += 2) { const an = ((i + 0.5) / 8) * 6.283; boxR(e, [Math.cos(an) * (ap + 0.02), h * 0.55, Math.sin(an) * (ap + 0.02)], [0.24, 1.4, 0.1], { yaw: 90 - (an * 180) / Math.PI }); }
  } else cyl(e, 0, h, 0, r + 0.5, r + 0.5, 1.5, 8);
  g.P(SLATE, "oklch(0.86 0.03 25)", 0.75);
  cyl(e, 0, h + 0.5, 0, r * 0.95, 0, r * 1.9, 8);
  if (g.trim) { g.P(IRON, "oklch(0.8 0.01 60)", 0.4, 0.8); cyl(e, 0, h + 0.3 + r * 1.9, 0, 0.09, 0.02, 1.6, 5); g.glow(GOLD, 1.2, 0.8, 0.2); blob(e, 0, h + 0.5 + r * 1.9, 0, 0.18, 0.18, 0.18, 1, 0.05, 4, 6); }
}
const K = {
  wall(e, g, p) { wallSeg(e, g, p.L || 20, p.h || 8, p.t || 3); },
  tower(e, g, p) { tower(e, g, p.h || 11, p.r || 4); },
  curtain(e, g, p) {
    const V = p.verts || [], h = p.h || 8;
    for (let i = 0; i < V.length - 1; i++) {
      const A = V[i], B = V[i + 1], dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
      let th = Math.atan2(-dz, dx);
      if (-Math.sin(th) * mx - Math.cos(th) * mz < 0) th += Math.PI; // local −Z faces out of the ring
      wallSeg(xf(e, mx, 0, mz, th), g, L + 1, h);
    }
    for (let i = 1; i < V.length - 1; i++) tower(xf(e, V[i][0], 0, V[i][1]), g, h + 3, 4);
  },
  gatehouse(e, g, p) {
    const a = 2.5, T = 6, H = 13, sp = 3.5, ap = 7, top = 10;
    g.P(BAS, "oklch(0.98 0.012 40)");
    const sides = [[a, a + T], [-a - T, -a]];
    if (g.col) { for (const [x0, x1] of sides) box(e, x0, -3, -3, x1, H + 1.2, 3); box(e, -a, ap, -3, a, 12.5, 3); return; }
    for (const [x0, x1] of sides) { box(e, x0 - 0.3, -3, -3.3, x1 + 0.3, 1.2, 3.3); box(e, x0, 1.2, -3, x1, H, 3); }
    if (g.simple) { box(e, -a, ap, -3, a, 12.5, 3); g.P(SLATE, "oklch(0.86 0.03 25)"); for (const [x0, x1] of sides) cyl(e, (x0 + x1) / 2, H, 0, 2.8, 0, 7.5, 8); return; }
    archFill(e, a, sp, ap, top, -3, 3); box(e, -a, top, -3, a, 12.5, 3);
    g.P(BAS, "oklch(0.9 0.012 40)");
    archRing(e, a, sp, ap, -3.1); archRing(e, a, sp, ap, 3.1);
    for (const [x0, x1] of sides) {
      box(e, x0 - 0.15, 6.4, -3.15, x1 + 0.15, 6.7, 3.15);
      box(e, x0 - 0.35, H - 0.5, -3.35, x1 + 0.35, H, 3.35);
      const cx = (x0 + x1) / 2;
      g.P(BAS, "oklch(0.98 0.012 40)");
      for (let i = 0; i < 3; i++) { const u = -2.3 + i * 2.3; box(e, cx + u - 0.55, H, -3.35, cx + u + 0.55, H + 1.1, -2.85); box(e, cx + u - 0.55, H, 2.85, cx + u + 0.55, H + 1.1, 3.35); box(e, x0 - 0.35, H, u - 0.55, x0 + 0.15, H + 1.1, u + 0.55); box(e, x1 - 0.15, H, u - 0.55, x1 + 0.35, H + 1.1, u + 0.55); }
      g.P(SLATE, "oklch(0.86 0.03 25)", 0.75); cyl(e, cx, H, 0, 2.7, 0, 7.5, 8);
      g.P(IRON, "oklch(0.8 0.01 60)", 0.4, 0.8); cyl(e, cx, H + 7.2, 0, 0.09, 0.02, 1.8, 5);
      g.glow(EMB, 3, 0.9, 0.2);
      for (const y of [3.6, 9.2]) box(e, cx - 0.13, y, -3.05, cx + 0.13, y + 1.4, -2.98);
      g.P(BAS, "oklch(0.98 0.012 40)");
    }
    g.P(BAS, "oklch(0.98 0.012 40)");
    for (const z of [-3, 2.4]) for (let i = 0; i < 3; i++) { const x = -1.8 + i * 1.8; box(e, x - 0.5, 12.5, z, x + 0.5, 13.6, z + 0.6); }
    g.P(IRON, "oklch(0.75 0.01 60)", 0.45, 0.8);
    for (let x = -2.2; x <= 2.21; x += 0.55) { box(e, x - 0.06, 5.6, -1.86, x + 0.06, 9.8, -1.74); cyl(e, x, 5.25, -1.8, 0.0, 0.08, 0.36, 4, false); }
    for (const y of [6.0, 7.1]) box(e, -2.4, y, -1.9, 2.4, y + 0.12, -1.7);
    g.P(CLOTH, "oklch(0.68 0.16 28)", 0.95); disc(e, 0, 8.65, -3.03, 1.15, -1, 20);
    g.glow(GOLD, 0.9, 0.55, 0.12); star(e, 0, 8.65, -3.06, 1.05, -1);
  },
  keep(e, g, p) {
    const w = p.w || 16, d = p.d || 12, h = p.h || 11, X = w / 2, Z = d / 2, t = 1, F = 0.35;
    const corners = [[-X, -Z], [X, -Z], [-X, Z], [X, Z]];
    g.P(BAS, "oklch(0.98 0.012 40)");
    if (g.col) {
      box(e, -X - 0.4, -3, -Z - 0.4, X + 0.4, F, Z + 0.4); box(e, -2.4, -1, -Z - 1.6, 2.4, 0.17, -Z - 0.4);
      box(e, -X, F, -Z, -1.5, h, -Z + t); box(e, 1.5, F, -Z, X, h, -Z + t); box(e, -1.5, 3.4, -Z, 1.5, h, -Z + t);
      box(e, -X, F, Z - t, X, h, Z); box(e, -X, F, -Z + t, -X + t, h, Z - t); box(e, X - t, F, -Z + t, X, h, Z - t); box(e, -X, h, -Z, X, h + 0.6, Z);
      for (const [cx, cz] of corners) box(e, cx - 1.6, -1, cz - 1.6, cx + 1.6, 13.4, cz + 1.6);
      box(e, -2.9, F, Z - 3.4, 2.9, 3.8, Z - t);
      for (const sx of [-1, 1]) box(e, sx * 4 - 0.45, F, -0.45, sx * 4 + 0.45, h, 0.45);
      return;
    }
    box(e, -X - 0.4, -3, -Z - 0.4, X + 0.4, F, Z + 0.4);
    if (g.simple) {
      box(e, -X, F, -Z, X, h + 1.6, Z);
      for (const [cx, cz] of corners) box(e, cx - 1.6, -1, cz - 1.6, cx + 1.6, 14.4, cz + 1.6);
      box(e, -1.4, h, Z - 2.6, 1.4, h + 5.5, Z + 0.2);
      g.glow(EMB, 2.5, 0.8, 0.15); box(e, -1.5, F, -Z - 0.04, 1.5, 4.2, -Z);
      g.P(SLATE, "oklch(0.86 0.03 25)"); for (const [cx, cz] of corners) cyl(e, cx, 14.4, cz, 1.4, 0, 4, 8);
      return;
    }
    box(e, -2.4, -1, -Z - 1.6, 2.4, 0.17, -Z - 0.4);
    // walls with the door
    box(e, -X, F, -Z, -1.5, h, -Z + t); box(e, 1.5, F, -Z, X, h, -Z + t);
    archFill(e, 1.5, 3.4, 5.0, 5.4, -Z, -Z + t); box(e, -1.5, 5.4, -Z, 1.5, h, -Z + t);
    box(e, -X, F, Z - t, X, h, Z); box(e, -X, F, -Z + t, -X + t, h, Z - t); box(e, X - t, F, -Z + t, X, h, Z - t);
    box(e, -X, h, -Z, X, h + 0.5, Z);
    g.P(BAS, "oklch(0.9 0.012 40)");
    archRing(e, 1.5, 3.4, 5.0, -Z - 0.12, 9, 0.55);
    for (const sx of [-1, 1]) box(e, sx * 1.5 - (sx > 0 ? 0 : 0.45), F, -Z - 0.25, sx * 1.5 + (sx > 0 ? 0.45 : 0), 3.4, -Z);
    for (const y of [6.0, 9.6]) { box(e, -X - 0.12, y, -Z - 0.12, X + 0.12, y + 0.3, -Z); box(e, -X - 0.12, y, Z, X + 0.12, y + 0.3, Z + 0.12); box(e, -X - 0.12, y, -Z, -X, y + 0.3, Z); box(e, X, y, -Z, X + 0.12, y + 0.3, Z); }
    // parapet
    g.P(BAS, "oklch(0.98 0.012 40)");
    box(e, -X - 0.2, h + 0.5, -Z - 0.2, X + 0.2, h + 0.9, -Z + 0.4); box(e, -X - 0.2, h + 0.5, Z - 0.4, X + 0.2, h + 0.9, Z + 0.2);
    box(e, -X - 0.2, h + 0.5, -Z + 0.4, -X + 0.4, h + 0.9, Z - 0.4); box(e, X - 0.4, h + 0.5, -Z + 0.4, X + 0.2, h + 0.9, Z - 0.4);
    for (let x = -X + 2.6; x <= X - 2.5; x += 2) { box(e, x - 0.5, h + 0.9, -Z - 0.2, x + 0.5, h + 1.9, -Z + 0.4); box(e, x - 0.5, h + 0.9, Z - 0.4, x + 0.5, h + 1.9, Z + 0.2); }
    for (let z = -Z + 2.6; z <= Z - 2.5; z += 2) for (const sx of [-1, 1]) box(e, sx * X - 0.4 * sx - (sx > 0 ? 0 : 0.2), h + 0.9, z - 0.5, sx * X + (sx > 0 ? 0.2 : 0.4), h + 1.9, z + 0.5);
    // corner turrets and spires
    for (const [cx, cz] of corners) {
      g.P(BAS, "oklch(0.98 0.012 40)"); box(e, cx - 1.6, -1, cz - 1.6, cx + 1.6, 13.4, cz + 1.6);
      g.P(BAS, "oklch(0.9 0.012 40)"); box(e, cx - 1.85, 12.9, cz - 1.85, cx + 1.85, 13.4, cz + 1.85);
      g.P(BAS, "oklch(0.98 0.012 40)"); for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(e, cx + u * 1.35 - 0.5, 13.4, cz + v * 1.35 - 0.5, cx + u * 1.35 + 0.5, 14.4, cz + v * 1.35 + 0.5);
      g.P(SLATE, "oklch(0.86 0.03 25)", 0.75); cyl(e, cx, 13.4, cz, 1.45, 0, 5, 8);
      g.P(IRON, "oklch(0.8 0.01 60)", 0.4, 0.8); cyl(e, cx, 18.2, cz, 0.07, 0.02, 1.3, 5);
      g.glow(EMB, 3, 0.9, 0.2); box(e, cx - 0.13, 8.2, cz + Math.sign(cz) * 1.62 - 0.03, cx + 0.13, 9.8, cz + Math.sign(cz) * 1.62 + 0.03);
    }
    // glowing lancet windows: front pair, two each side
    const lancet = (x, z, nz, sx = 0) => {
      g.P(BAS, "oklch(0.9 0.012 40)");
      if (sx) { box(e, sx * X - (sx < 0 ? 0.2 : 0), 2.0, z - 0.75, sx * X + (sx > 0 ? 0.2 : 0), 2.2, z + 0.75); }
      else box(e, x - 0.75, 2.0, nz < 0 ? -Z - 0.2 : Z, x + 0.75, 2.2, nz < 0 ? -Z : Z + 0.2);
      g.glow(EMB, 3.4, 1.2, 0.25);
      if (sx) { const xx = sx * (X + 0.03); quadN(e, [xx, 2.2, z - 0.5], [xx, 2.2, z + 0.5], [xx, 4.6, z + 0.5], [xx, 4.6, z - 0.5], [sx, 0, 0]); triN(e, [xx, 4.6, z - 0.5], [xx, 4.6, z + 0.5], [xx, 5.4, z], [sx, 0, 0]); }
      else { const zz = -Z - 0.03; quadN(e, [x - 0.5, 2.2, zz], [x + 0.5, 2.2, zz], [x + 0.5, 4.6, zz], [x - 0.5, 4.6, zz], [0, 0, -1]); triN(e, [x - 0.5, 4.6, zz], [x + 0.5, 4.6, zz], [x, 5.4, zz], [0, 0, -1]); }
    };
    lancet(-4.6, 0, -1); lancet(4.6, 0, -1); for (const sx of [-1, 1]) for (const z of [-2.2, 2.2]) lancet(0, z, 0, sx);
    // the compass-star roundel over the door
    g.P(CLOTH, "oklch(0.68 0.16 28)", 0.95); disc(e, 0, 7.9, -Z - 0.05, 1.45, -1, 20);
    g.glow(GOLD, 0.9, 0.55, 0.12); star(e, 0, 7.9, -Z - 0.08, 1.3, -1);
    // inside: flagstones, columns, beams, doors folded open
    g.P(FLAG, "oklch(0.97 0.01 40)", 0.85); box(e, -X + t, F, -Z, X - t, F + 0.03, Z - t);
    if (g.trim) {
      g.P(BAS, "oklch(0.98 0.012 40)");
      for (const sx of [-1, 1]) { cyl(e, sx * 4, F, 0, 0.5, 0.42, h - 0.6 - F, 8); box(e, sx * 4 - 0.6, h - 1.2, -0.6, sx * 4 + 0.6, h - 0.6, 0.6); }
      g.P(WOOD, "oklch(0.92 0.03 50)");
      for (let x = -6; x <= 6; x += 3) box(e, x - 0.22, h - 0.6, -Z + t, x + 0.22, h, Z - t);
      box(e, -X + t, h - 1.0, -0.25, X - t, h - 0.6, 0.25);
      for (const sx of [-1, 1]) box(e, sx * 1.5 - (sx > 0 ? -0.0 : 0) + (sx > 0 ? 0 : -1.5), F + 0.03, -Z + t, sx * 1.5 + (sx > 0 ? 1.5 : 0), 3.3, -Z + t + 0.14);
      g.P(IRON, "oklch(0.75 0.01 60)", 0.45, 0.8);
      for (const sx of [-1, 1]) for (const y of [0.9, 2.6]) box(e, sx > 0 ? 1.5 : -3.0, y, -Z + t + 0.14, sx > 0 ? 3.0 : -1.5, y + 0.12, -Z + t + 0.18);
    }
    // the great forge against the back wall: cheeks, lintel, bed, a molten mouth, the hood to the ceiling
    g.P(BAS, "oklch(0.98 0.012 40)");
    box(e, -2.9, F, Z - 3.4, -1.7, 3.8, Z - t); box(e, 1.7, F, Z - 3.4, 2.9, 3.8, Z - t);
    box(e, -1.7, 2.5, Z - 3.4, 1.7, 3.8, Z - t); box(e, -1.7, F, Z - 3.4, 1.7, 1.0, Z - t);
    box(e, -3.1, 3.8, Z - 3.6, 3.1, 4.15, Z - t);
    frustum(e, 0, Z - 2.3, 4.15, h, 5.6, 2.4, 2.4, 1.4);
    g.glow("oklch(0.75 0.2 45)", 5.5, 1.8, 0.3);
    quadN(e, [-1.7, 1.0, Z - 1.6], [1.7, 1.0, Z - 1.6], [1.7, 2.5, Z - 1.6], [-1.7, 2.5, Z - 1.6], [0, 0, -1]);
    for (const sx of [-1, 1]) quadN(e, [sx * 1.68, 1.0, Z - 3.4], [sx * 1.68, 1.0, Z - 1.6], [sx * 1.68, 2.5, Z - 1.6], [sx * 1.68, 2.5, Z - 3.4], [-sx, 0, 0]);
    quadN(e, [-1.7, 2.48, Z - 3.4], [1.7, 2.48, Z - 3.4], [1.7, 2.48, Z - 1.6], [-1.7, 2.48, Z - 1.6], [0, -1, 0]);
    g.glow("oklch(0.85 0.17 70)", 7, 3.2, 0.8);
    for (let i = 0; i < 16; i++) { const x = -1.45 + ((i * 37) % 15) / 5.2, z = Z - 3.2 + ((i * 53) % 7) / 4; blob(e, x, 1.02, z, 0.17, 0.1, 0.17, i, 0.3, 3, 5); }
    // chimney through the roof, crowned with a glowing throat
    g.P(BAS, "oklch(0.98 0.012 40)"); box(e, -1.4, h + 0.5, Z - 2.6, 1.4, h + 5.5, Z + 0.2);
    g.P(BAS, "oklch(0.9 0.012 40)"); box(e, -1.65, h + 5.5, Z - 2.85, 1.65, h + 5.9, Z + 0.45);
    g.glow(EMB, 4, 1.2, 0.2); quadN(e, [-1.0, h + 5.92, Z - 2.2], [1.0, h + 5.92, Z - 2.2], [1.0, h + 5.92, Z - 0.2], [-1.0, h + 5.92, Z - 0.2], [0, 1, 0]);
  },
  guardian(e, g, p) {
    const E = xf(e, 0, 0, 0, 0, (p.h || 14) / 14), Y = 2;
    g.P(BAS, "oklch(0.98 0.012 40)");
    box(E, -3.4, -3, -3.4, 3.4, 0.8, 3.4); box(E, -3, 0.8, -3, 3, Y, 3);
    if (g.col) { box(E, -2.3, Y, -3.5, 2.3, Y + 9.6, 1.4); box(E, -1, Y + 9.6, -1.2, 1, Y + 12, 1); return; }
    g.P(STAT, "oklch(0.96 0.02 60)", 0.9);
    if (g.simple) { box(E, -2.2, Y, -1.2, 2.2, Y + 5.5, 1.2); frustum(E, 0, 0, Y + 5.5, Y + 9.6, 3.6, 2.4, 5.4, 2.8); box(E, -1, Y + 9.6, -1.1, 1, Y + 11.8, 1); box(E, -1.7, Y, -3.4, 1.7, Y + 1.7, -1.4); box(E, -0.3, Y + 1.7, -2.7, 0.3, Y + 8.2, -2.1); return; }
    if (g.trim) { g.P(BAS, "oklch(0.9 0.012 40)"); box(E, -3.6, 0.6, -3.6, 3.6, 0.85, 3.6); box(E, -3.15, Y - 0.2, -3.15, 3.15, Y, 3.15); g.glow(EMB, 2.6, 0.8, 0.15); box(E, -2, 1.15, -3.04, 2, 1.32, -2.98); box(E, -2, 1.15, 2.98, 2, 1.32, 3.04); g.P(STAT, "oklch(0.96 0.02 60)", 0.9); }
    for (const sx of [-1, 1]) {
      box(E, sx * 1.1 - 0.75, Y, -1.5, sx * 1.1 + 0.75, Y + 1.0, 0.7);
      frustum(E, sx * 1.1, 0, Y + 1, Y + 4.2, 1.3, 1.3, 1.5, 1.5);
      boxR(E, [sx * 1.1, Y + 2.9, -0.72], [1.1, 1.0, 0.4], { pitch: -10 });
      boxR(E, [sx * 0.95, Y + 4.4, -1.42], [1.6, 2.1, 0.22], { pitch: -8 });
    }
    frustum(E, 0, 0, Y + 3.4, Y + 5.6, 4.4, 2.8, 3.7, 2.3);
    frustum(E, 0, 0, Y + 6.1, Y + 9.2, 3.4, 2.2, 4.8, 2.8);
    frustum(E, 0, -0.15, Y + 6.9, Y + 9.0, 3.0, 2.6, 4.2, 3.0);
    frustum(E, 0, 0, Y + 9.2, Y + 9.7, 4.8, 2.8, 3.6, 2.4);
    g.P(STAT, "oklch(0.9 0.02 60)", 0.9);
    box(E, -1.95, Y + 5.5, -1.25, 1.95, Y + 6.1, 1.25);
    for (const sx of [-1, 1]) {
      boxR(E, [sx * 2.8, Y + 9.0, 0], [1.9, 1.5, 2.6], { roll: sx * -18 });
      boxR(E, [sx * 3.1, Y + 8.2, 0], [1.6, 0.55, 2.3], { roll: sx * -26 });
      const sh = [sx * 2.7, Y + 8.4, 0.1], el = [sx * 2.3, Y + 6.4, -0.8], hand = [sx * 0.62, sx < 0 ? Y + 6.3 : Y + 7.2, -2.4];
      beam(E, sh, el, 1.2, 1.2); blob(E, el[0], el[1], el[2], 0.7, 0.7, 0.7, 3 + sx, 0.1, 4, 6); beam(E, el, hand, 1.05, 0.95);
      const bc = [(el[0] + hand[0]) / 2, (el[1] + hand[1]) / 2, (el[2] + hand[2]) / 2]; beam(E, [el[0] * 0.75 + hand[0] * 0.25, el[1] * 0.75 + hand[1] * 0.25, el[2] * 0.75 + hand[2] * 0.25], bc, 1.25, 1.15);
      boxR(E, hand, [1.0, 0.85, 1.1]);
    }
    g.P(STAT, "oklch(0.96 0.02 60)", 0.9);
    box(E, -0.6, Y + 9.5, -0.5, 0.6, Y + 9.9, 0.6);
    box(E, -0.95, Y + 9.8, -1.05, 0.95, Y + 11.6, 0.95);
    frustum(E, 0, 0, Y + 11.6, Y + 12.1, 1.9, 2.0, 1.2, 1.4);
    boxR(E, [0, Y + 12.1, 0.1], [0.3, 0.7, 2.0]);
    box(E, -1.05, Y + 10.9, -1.2, 1.05, Y + 11.2, -0.9); box(E, -0.15, Y + 10.0, -1.25, 0.15, Y + 10.95, -1.0);
    for (const sx of [-1, 1]) { box(E, sx * 0.95 - 0.12, Y + 9.9, -1.1, sx * 0.95 + 0.12, Y + 10.9, 0.3); beam(E, [sx * 0.9, Y + 11.2, -0.2], [sx * 1.8, Y + 12.1, -0.6], 0.42, 0.42); beam(E, [sx * 1.8, Y + 12.1, -0.6], [sx * 2.0, Y + 13.0, -0.3], 0.26, 0.26); }
    boxR(E, [0, Y + 9.4, -1.25], [1.7, 1.9, 0.7], { pitch: 12 });
    for (const sx of [-1, 1]) beam(E, [sx * 0.45, Y + 8.8, -1.45], [sx * 0.4, Y + 7.7, -1.62], 0.32, 0.32);
    // the hammer, head on the plinth, haft between the fists
    g.P(STAT, "oklch(0.82 0.02 60)", 0.8);
    box(E, -1.7, Y, -3.4, 1.7, Y + 1.7, -1.4);
    for (const sx of [-1, 1]) box(E, sx * 1.55 - 0.22, Y - 0.05, -3.5, sx * 1.55 + 0.22, Y + 1.8, -1.3);
    cyl(E, 0, Y + 1.7, -2.4, 0.3, 0.26, 6.6, 8);
    blob(E, 0, Y + 8.5, -2.4, 0.42, 0.42, 0.42, 2, 0.1, 4, 6);
    g.glow(EMB, 4, 1.3, 0.2);
    box(E, -0.7, Y + 10.58, -1.1, 0.7, Y + 10.8, -1.03);
    box(E, -1.0, Y + 0.7, -3.44, 1.0, Y + 0.9, -3.38);
    for (const [x0, y0, x1, y1] of [[-1.2, 8.6, 0, 7.6], [0, 7.6, 1.2, 8.6], [-1.0, 7.9, 0, 6.95], [0, 6.95, 1.0, 7.9]]) beam(E, [x0, Y + y0, -1.6], [x1, Y + y1, -1.6], 0.06, 0.16);
  },
  lavafall(e, g, p) {
    const h = p.h || 18, w = p.w || 14, r = rnd(p.seed || 3);
    g.P(ROCK, "oklch(0.95 0.015 30)", 0.95);
    if (g.col) { box(e, -w / 2, -3, 0.9, w / 2, h, 8); for (let i = 0; i < 10; i++) { const a = Math.PI * 0.05 + (i / 9) * Math.PI * 0.9 + Math.PI; box(e, Math.cos(a) * 3.9 - 0.6, -0.5, -2.6 - Math.sin(a) * -3.9 - 0.6, Math.cos(a) * 3.9 + 0.6, 0.6, -2.6 - Math.sin(a) * -3.9 + 0.6); } return; }
    if (g.simple) box(e, -w / 2, -3, 0.6, w / 2, h + 1, 8);
    else {
      blob(e, 0, h * 0.45, 4.6, w * 0.55, h * 0.58, 4.2, 3, 0.16, 7, 10);
      blob(e, -w * 0.36, h * 0.3, 3.3, w * 0.3, h * 0.42, 3, 7, 0.2, 6, 8); blob(e, w * 0.36, h * 0.34, 3.5, w * 0.3, h * 0.46, 3.2, 9, 0.2, 6, 8);
      for (let i = 0; i < 12; i++) { const x = -w / 2 + 0.8 + (i * (w - 1.6)) / 11; if (Math.abs(x) < 2.0) continue; const ht = h * (0.3 + 0.55 * r()); cyl(e, x, -2, 1.1 + r() * 1.2, 0.8, 0.7, ht + 2, 6); }
      boxR(e, [0, h + 0.1, 1.3], [4.2, 0.9, 2.4], { pitch: -6 });
      for (const sx of [-1, 1]) blob(e, sx * 2.2, h * 0.55, 0.6, 0.9, h * 0.5, 1.0, 11 + sx, 0.25, 6, 6);
    }
    // the sheet, hottest at the lip
    const n = g.simple ? 3 : 12, S = (v) => [h * (1 - v) + 0.2 * v, 0.5 - 1.7 * v * v, 1.35 + 0.55 * v];
    for (let k = 0; k < n; k++) {
      const v0 = k / n, v1 = (k + 1) / n, [y0, z0, w0] = S(v0), [y1, z1, w1] = S(v1), m = (v0 + v1) / 2;
      g.glow("oklch(0.8 0.18 60)", 4.2 - 1.2 * m, 2.5 - 1.7 * m, 0.7 - 0.55 * m);
      quadN(e, [-w0, y0, z0], [w0, y0, z0], [w1, y1, z1], [-w1, y1, z1], [0, 0.2, -1]);
      if (g.trim) { g.glow("oklch(0.9 0.15 85)", 5, 3.4, 1.1); for (const x of [-0.75, 0.05, 0.8]) { const f = 1 + 0.3 * m; quadN(e, [x * f - 0.09, y0, z0 - 0.05], [x * f + 0.09, y0, z0 - 0.05], [x * f + 0.09, y1, z1 - 0.05], [x * f - 0.09, y1, z1 - 0.05], [0, 0.2, -1]); } }
    }
    // the pool
    g.glow("oklch(0.72 0.19 45)", 5, 1.5, 0.25); cyl(e, 0, -0.3, -2.6, 3.5, 3.5, 0.45, 14);
    if (g.simple) return;
    g.P(ROCK, "oklch(0.83 0.015 30)", 0.95);
    for (let i = 0; i < 9; i++) blob(e, (r() - 0.5) * 4.4, 0.17, -2.6 + (r() - 0.5) * 4.0, 0.4 + r() * 0.5, 0.05, 0.3 + r() * 0.4, i + 30, 0.3, 3, 6);
    g.P(ROCK, "oklch(0.95 0.015 30)", 0.95);
    for (let i = 0; i < 14; i++) { const a = Math.PI + 0.12 + (i / 13) * (Math.PI - 0.24); blob(e, Math.cos(a) * 3.9, 0.15, -2.6 + Math.sin(a) * 3.9 * -1 * -1, 0.75, 0.55 + r() * 0.3, 0.7, i + 50, 0.3, 4, 6); }
  },
  channel(e, g, p) {
    const L = p.L || 34, hw = (p.wd || 5) / 2, r = rnd(p.seed || 5), a = -L / 2;
    g.P(ROCK, "oklch(0.95 0.015 30)", 0.95);
    if (g.col) { box(e, a, -1, -hw - 1.2, -a, 0.8, -hw); box(e, a, -1, hw, -a, 0.8, hw + 1.2); box(e, a - 1.2, -1, -hw - 1.2, a, 0.8, hw + 1.2); return; }
    if (g.simple) { box(e, a, -1, -hw - 1.2, -a, 0.8, -hw); box(e, a, -1, hw, -a, 0.8, hw + 1.2); box(e, a - 1.2, -1, -hw - 1.2, a, 0.8, hw + 1.2); }
    else {
      for (let x = a; x < -a; x += 1.6) for (const sz of [-1, 1]) boxR(e, [x + 0.8, -0.1, sz * (hw + 0.6)], [1.7, 1.4 + r() * 0.5, 1.3 + r() * 0.2], { yaw: (r() - 0.5) * 10, roll: (r() - 0.5) * 6 });
      blob(e, a - 0.4, 0.3, 0, 1.4, 0.9, hw + 1, 4, 0.2, 5, 8);
    }
    g.glow("oklch(0.72 0.19 45)", 5, 1.5, 0.25);
    quadN(e, [a, 0.15, -hw], [-a, 0.15, -hw], [-a, 0.15, hw], [a, 0.15, hw], [0, 1, 0]);
    if (g.simple) return;
    g.glow("oklch(0.88 0.16 80)", 4.6, 2.8, 0.8);
    let z = 0; for (let x = a; x < -a - 1; x += 1.5) { const z1 = Math.max(-hw + 0.5, Math.min(hw - 0.5, z + (r() - 0.5) * 1.4)); quadN(e, [x, 0.17, z - 0.1], [x + 1.5, 0.17, z1 - 0.1], [x + 1.5, 0.17, z1 + 0.1], [x, 0.17, z + 0.1], [0, 1, 0]); z = z1; }
    g.P(ROCK, "oklch(0.78 0.015 30)", 0.95);
    for (let i = 0; i < Math.round(L * 0.9); i++) blob(e, a + 0.5 + r() * (L - 1), 0.19, (r() - 0.5) * (2 * hw - 0.8), 0.35 + r() * 0.6, 0.05, 0.3 + r() * 0.45, i + 70, 0.35, 3, 6);
  },
  bridge(e, g, p) {
    const L = p.L || 14, hw = (p.wd || 4) / 2, rise = p.rise || 2.2, s = 3.4, ya = 1.2, n = g.simple ? 6 : 14;
    const Yd = (z) => 0.2 + rise * Math.cos((Math.PI * z) / L), Rr = (s * s + ya * ya) / (2 * ya), yc = ya - Rr;
    const Bt = (z) => (Math.abs(z) < s ? Math.max(0, yc + Math.sqrt(Math.max(0, Rr * Rr - z * z))) : -0.6);
    const Zs = []; for (let k = 0; k <= n; k++) Zs.push(-L / 2 + (L * k) / n);
    if (!Zs.some((z) => Math.abs(Math.abs(z) - s) < 0.01)) { Zs.push(-s, s); Zs.sort((x, y) => x - y); }
    g.P(FLAG, "oklch(0.95 0.01 40)", 0.85);
    for (let k = 0; k < Zs.length - 1; k++) { const z0 = Zs[k], z1 = Zs[k + 1]; quadN(e, [-hw, Yd(z0), z0], [hw, Yd(z0), z0], [hw, Yd(z1), z1], [-hw, Yd(z1), z1], [0, 1, 0]); }
    g.P(BAS, "oklch(0.98 0.012 40)");
    const rail = (yo, ww, dd) => { for (const sx of [-1, 1]) for (let k = 0; k < Zs.length - 1; k++) { const z0 = Zs[k], z1 = Zs[k + 1], x = sx * (hw - 0.18); beam(e, [x, Yd(z0) + yo, z0 - 0.04], [x, Yd(z1) + yo, z1 + 0.04], ww, dd); } };
    if (g.col) { rail(0.5, 0.35, 1.0); return; }
    for (let k = 0; k < Zs.length - 1; k++) {
      const z0 = Zs[k], z1 = Zs[k + 1], b0 = Bt(z0 + (Math.abs(z0) === s && Math.abs(z1) > s ? 0 : 0)), b1 = Bt(z1);
      const lo0 = Math.abs(z0) <= s && Math.abs(z1) <= s ? Bt(z0) : -0.6, lo1 = Math.abs(z0) <= s && Math.abs(z1) <= s ? Bt(z1) : -0.6;
      for (const sx of [-1, 1]) quadN(e, [sx * hw, lo0, z0], [sx * hw, lo1, z1], [sx * hw, Yd(z1) - 0.01, z1], [sx * hw, Yd(z0) - 0.01, z0], [sx, 0, 0]);
      quadN(e, [-hw, lo0, z0], [hw, lo0, z0], [hw, lo1, z1], [-hw, lo1, z1], [0, -1, 0]);
    }
    for (const sz of [-1, 1]) { const z = (sz * L) / 2; quadN(e, [-hw, -0.6, z], [hw, -0.6, z], [hw, Yd(z), z], [-hw, Yd(z), z], [0, 0, sz]); for (const zz of [s]) quadN(e, [-hw, -0.6, sz * zz], [hw, -0.6, sz * zz], [hw, 0, sz * zz], [-hw, 0, sz * zz], [0, 0, -sz]); }
    rail(0.5, 0.35, 1.0);
    if (g.simple) return;
    g.P(BAS, "oklch(0.98 0.012 40)"); rail(1.05, 0.5, 0.12);
    g.P(BAS, "oklch(0.9 0.012 40)");
    const ph = Math.asin(s / Rr);
    for (const sx of [-1, 1]) { let prev = null; for (let j = 0; j <= 9; j++) { const f = -ph + (2 * ph * j) / 9, q = [sx * (hw + 0.08), yc + (Rr + 0.3) * Math.cos(f), (Rr + 0.3) * Math.sin(f)]; if (prev) beam(e, prev, q, 0.2, 0.65); prev = q; } }
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) { const z = sz * (L / 2 - 0.3), y = Yd(z); box(e, sx * hw - 0.35 - (sx > 0 ? 0.2 : 0) + 0.1, y - 0.6, z - 0.3, sx * hw + 0.35 - (sx > 0 ? 0.2 : 0) + 0.1, y + 1.5, z + 0.3); g.glow(GOLD, 0.8, 0.5, 0.12); blob(e, sx * (hw - 0.1), y + 1.65, z, 0.18, 0.18, 0.18, 1, 0.05, 4, 6); g.P(BAS, "oklch(0.9 0.012 40)"); }
  },
  workshop(e, g, p) {
    const w = p.w || 8, d = p.d || 6, X = w / 2, Z = d / 2, F = 0.25, eh = 2.9, rh = 4.7, ov = 0.7;
    const pd = (Math.atan2(rh - eh, Z + ov) * 180) / Math.PI, sl = Math.hypot(rh - eh, Z + ov) + 0.15, rc = (rh + eh) / 2 + 0.1;
    const roof = () => { for (const sz of [-1, 1]) boxR(e, [0, rc, (sz * (Z + ov)) / 2], [w + 1.2, 0.18, sl], { pitch: sz < 0 ? -pd : pd }); };
    g.P(BAS, "oklch(0.98 0.012 40)");
    const posts = []; for (const x of [-X + 0.2, 0, X - 0.2]) posts.push([x, -Z + 0.2]); for (const x of [-X + 0.2, X - 0.2]) posts.push([x, Z - 0.2]);
    if (g.col) { box(e, -X - 0.3, -0.8, -Z - 0.3, X + 0.3, F, Z + 0.3); box(e, -X, F, Z - 0.6, X, 1.6, Z); box(e, -X, F, 0, -X + 0.5, 1.6, Z - 0.6); box(e, X - 0.5, F, 0, X, 1.6, Z - 0.6); for (const [x, z] of posts) box(e, x - 0.2, F, z - 0.2, x + 0.2, eh, z + 0.2); roof(); return; }
    box(e, -X - 0.3, -0.8, -Z - 0.3, X + 0.3, F, Z + 0.3);
    g.P(BAS, "oklch(0.98 0.012 40)"); box(e, -X, F, Z - 0.6, X, 1.6, Z); box(e, -X, F, 0, -X + 0.5, 1.6, Z - 0.6); box(e, X - 0.5, F, 0, X, 1.6, Z - 0.6);
    g.P(WOOD, "oklch(0.95 0.03 50)");
    for (const [x, z] of posts) box(e, x - 0.15, F, z - 0.15, x + 0.15, eh, z + 0.15);
    if (!g.simple) {
      box(e, -X - 0.2, eh - 0.05, -Z + 0.05, X + 0.2, eh + 0.25, -Z + 0.35); box(e, -X - 0.2, eh - 0.05, Z - 0.35, X + 0.2, eh + 0.25, Z - 0.05);
      for (const x of [-X + 0.2, X - 0.2]) { box(e, x - 0.12, eh, -Z + 0.2, x + 0.12, eh + 0.25, Z - 0.2); box(e, x - 0.1, eh + 0.25, -0.1, x + 0.1, rh, 0.1); }
      for (const [x, z] of posts) for (const sx of [-1, 1]) if (Math.abs(x + sx * 0.8) < X) beam(e, [x, eh - 0.9, z], [x + sx * 0.8, eh, z], 0.12, 0.12);
      for (const sx of [-1, 1]) triN(e, [sx * X, eh + 0.25, -Z], [sx * X, eh + 0.25, Z], [sx * X, rh, 0], [sx, 0, 0]);
      g.P(BAS, "oklch(0.9 0.012 40)"); for (const [x, z] of posts) box(e, x - 0.25, F, z - 0.25, x + 0.25, F + 0.35, z + 0.25);
    }
    g.P(SLATE, "oklch(0.86 0.03 25)", 0.75); roof();
    if (g.simple) return;
    for (const sz of [-1, 1]) for (let i = 1; i < 7; i++) { const u = i / 7, y = rh - (rh - eh) * u + 0.2, z = sz * (Z + ov) * u; boxR(e, [0, y, z], [w + 1.2, 0.06, 0.14], { pitch: sz < 0 ? -pd : pd }); }
    g.P(WOOD, "oklch(0.95 0.03 50)"); boxR(e, [0, rh + 0.14, 0], [w + 1.3, 0.24, 0.4]);
    g.P(IRON, "oklch(0.8 0.01 60)", 0.4, 0.8);
    for (let i = 0; i < 5; i++) { const x = -1.5 + i * 0.75; box(e, x - 0.03, 1.7, Z - 0.66, x + 0.03, 2.3, Z - 0.62); box(e, x - 0.12, 1.72, Z - 0.68, x + 0.12, 1.86, Z - 0.6); }
    box(e, -1.9, 2.3, Z - 0.7, 1.9, 2.36, Z - 0.6);
    box(e, -0.03, eh - 0.6, -0.03, 0.03, eh + 0.25, 0.03); box(e, -0.15, eh - 0.95, -0.15, 0.15, eh - 0.6, 0.15);
    g.glow("oklch(0.85 0.15 70)", 4, 2.4, 0.7); box(e, -0.1, eh - 0.9, -0.1, 0.1, eh - 0.65, 0.1);
  },
  banner(e, g, p) {
    g.P(IRON, "oklch(0.8 0.01 60)", 0.45, 0.75);
    if (g.col) { box(e, -0.12, -0.5, -0.12, 0.12, 6.6, 0.12); return; }
    cyl(e, 0, -0.5, 0, 0.08, 0.07, 7.2, 6);
    if (g.simple) { g.P(CLOTH, p.tint || "oklch(0.42 0.16 28)", 0.95); box(e, -0.75, 2.8, 0.05, 0.75, 6.4, 0.15); return; }
    box(e, -0.9, 6.4, -0.06, 0.9, 6.52, 0.06);
    g.P(BAS, "oklch(0.94 0.012 40)"); cyl(e, 0, -0.3, 0, 0.35, 0.28, 0.65, 8);
    g.glow(GOLD, 0.9, 0.55, 0.12); cyl(e, 0, 6.65, 0, 0.13, 0, 0.5, 6); for (const sx of [-1, 1]) blob(e, sx * 0.9, 6.46, 0, 0.09, 0.09, 0.09, 2, 0.05, 4, 5);
    g.P(CLOTH, p.tint || "oklch(0.42 0.16 28)", 0.95);
    const R = 8, top = 6.38, len = 3.6, hw = 0.75, sd = p.seed || 1;
    const pt = (u, v) => [-hw + u * 2 * hw, top - v * len, 0.1 + Math.sin(v * 4 + u * 2 + sd) * 0.06 * v];
    for (let i = 0; i < R; i++) { const a = i / R, b = (i + 1) / R; quadN(e, pt(0, a), pt(1, a), pt(1, b), pt(0, b), [0, 0, -1]); }
    triN(e, pt(0, 1), pt(0.5, 1), [-hw / 2, top - len - 0.55, pt(0.25, 1)[2]], [0, 0, -1]);
    triN(e, pt(0.5, 1), pt(1, 1), [hw / 2, top - len - 0.55, pt(0.75, 1)[2]], [0, 0, -1]);
    g.glow(GOLD, 0.9, 0.55, 0.12);
    for (const nz of [-1, 1]) { const z = nz < 0 ? 0.035 : 0.17; star(e, 0, top - 1.45, z, 0.62, nz); box(e, -hw, top - 0.2, z - 0.01, hw, top - 0.1, z + 0.01); box(e, -hw, top - 3.0, z - 0.01, hw, top - 2.9, z + 0.01); }
  },
  brazier(e, g, p) {
    g.P(BAS, "oklch(0.98 0.012 40)");
    if (g.col) { box(e, -0.5, -0.3, -0.5, 0.5, 1.45, 0.5); return; }
    box(e, -0.55, -0.3, -0.55, 0.55, 0.2, 0.55); frustum(e, 0, 0, 0.2, 1.0, 0.8, 0.8, 0.5, 0.5);
    g.P(IRON, "oklch(0.75 0.01 60)", 0.45, 0.8); cyl(e, 0, 1.0, 0, 0.28, 0.62, 0.45, 10);
    if (g.simple) return;
    box(e, -0.32, 0.95, -0.32, 0.32, 1.05, 0.32);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * 6.283 + 0.785; boxR(e, [Math.cos(a) * 0.62, 1.52, Math.sin(a) * 0.62], [0.08, 0.3, 0.14], { yaw: 90 - (a * 180) / Math.PI, pitch: 15 }); }
    g.glow("oklch(0.75 0.2 45)", 6, 1.8, 0.25);
    for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = 0.12 + (i % 3) * 0.13; blob(e, Math.cos(a) * rr, 1.47, Math.sin(a) * rr, 0.12, 0.07, 0.12, i, 0.3, 3, 5); }
  },
};
function build(ctx, col) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  const g = {
    col, simple: !col && lod >= 4, trim: !col && lod <= 2,
    P: (tex, c, r = 0.9, m = 0) => { if (col) return; ctx.albedo(tex); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); },
    glow: (c, r, gg, b) => { if (col) return; ctx.albedo(null); ctx.color(c); ctx.roughness(0.6); ctx.metalness(0); ctx.emissive(r, gg, b); },
  };
  (K[p.kind] || K.brazier)(ctx, g, p);
}
export function geometry(ctx) { ctx.flat(); build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
