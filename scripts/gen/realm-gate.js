// THE REALM GATE of the Nine: the main menu's backdrop pieces, one script, kind by params.
// kinds: arch | warden | brazier | pillar | causeway | lantern | ridge. Front faces +Z (toward the menu camera).
// Origin: ground centre of each piece. Nobody walks here: no collider.
const STONE = "cdn/texture-mossy-weathered-fieldstone-ashlar.png";
const STATUE = "cdn/texture-lichen-speckled-dark-granite.png";
const IRON = "cdn/texture-hammered-dark-iron.png";
const GOLD = [2.6, 1.6, 0.45];

// ---------- vector + emit helpers ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const avg = (pts) => { const s = [0, 0, 0]; for (const p of pts) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; } return mul(s, 1 / pts.length); };

// a triangle wound CCW as seen from outside: `ref` is a point inside the solid (or an outward direction when dir)
function tri(ctx, a, b, c, ref, dir) {
  const n = crs(sub(b, a), sub(c, a));
  const out = dir ? ref : sub(avg([a, b, c]), ref);
  if (dot(n, out) < 0) { const t = b; b = c; c = t; }
  ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
}
function quad(ctx, a, b, c, d, ref, dir) { tri(ctx, a, b, c, ref, dir); tri(ctx, a, c, d, ref, dir); }

// a stone: front quad F (cyclic), back quad B; the front rim bevelled by c
function block(ctx, F, B, c) {
  const ref = avg([...F, ...B]);
  const cf = avg(F);
  const Fi = F.map((p) => add(p, mul(nrm(sub(cf, p)), c * 1.35)));
  const R = F.map((p, k) => add(p, mul(nrm(sub(B[k], p)), c)));
  quad(ctx, Fi[0], Fi[1], Fi[2], Fi[3], ref);
  for (let k = 0; k < 4; k++) {
    const k1 = (k + 1) % 4;
    quad(ctx, Fi[k], Fi[k1], R[k1], R[k], ref);
    quad(ctx, R[k], R[k1], B[k1], B[k], ref);
  }
  quad(ctx, B[0], B[1], B[2], B[3], ref);
}
// an axis box, bevelled on its +Z face (face "z") or its top (face "y")
function box(ctx, x0, y0, z0, x1, y1, z1, c = 0.05, face = "z") {
  if (face === "y") {
    const F = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    const B = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
    return block(ctx, F, B, c);
  }
  const F = [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const B = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]];
  block(ctx, F, B, c);
}
// rings: arrays of points, joined in order; centre refs orient each band outward
function loft(ctx, rings, centres, closed = true) {
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1], ref = avg([centres[i], centres[i + 1]]);
    const n = A.length;
    for (let k = 0; k < (closed ? n : n - 1); k++) {
      const k1 = (k + 1) % n;
      quad(ctx, A[k], A[k1], B[k1], B[k], ref);
    }
  }
}
function cap(ctx, ring, centre, outDir) { for (let k = 0; k < ring.length; k++) tri(ctx, centre, ring[k], ring[(k + 1) % ring.length], outDir, true); }
function ellRing(cx, cy, cz, rx, rz, n, fold = 0, foldK = 9, phase = 0) {
  const r = [];
  for (let k = 0; k < n; k++) {
    const t = (k / n) * Math.PI * 2;
    const f = 1 + fold * Math.sin(t * foldK + phase) * (0.6 + 0.4 * Math.sin(t * 3 + phase * 2));
    r.push([cx + Math.cos(t) * rx * f, cy, cz + Math.sin(t) * rz * f]);
  }
  return r;
}
// a tube along a polyline, radius per point
function tube(ctx, path, radii, n = 10, closedEnds = false) {
  const rings = [];
  for (let i = 0; i < path.length; i++) {
    const t = nrm(sub(path[Math.min(i + 1, path.length - 1)], path[Math.max(i - 1, 0)]));
    let side = crs(t, [0, 1, 0]);
    if (Math.hypot(...side) < 1e-3) side = [1, 0, 0];
    side = nrm(side);
    const up = nrm(crs(side, t));
    const ring = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      ring.push(add(path[i], add(mul(side, Math.cos(a) * radii[i]), mul(up, Math.sin(a) * radii[i]))));
    }
    rings.push(ring);
  }
  loft(ctx, rings, path);
  if (closedEnds) {
    cap(ctx, rings[0], path[0], sub(path[0], path[1]));
    cap(ctx, rings[rings.length - 1], path[path.length - 1], sub(path[path.length - 1], path[path.length - 2]));
  }
}
// a closed loop tube: loop points around a centre in a plane with normal N
function tubeLoop(ctx, pts, centre, N, r, n = 6) {
  const rings = pts.map((p) => {
    const o = nrm(sub(p, centre));
    const ring = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; ring.push(add(p, add(mul(o, Math.cos(a) * r), mul(N, Math.sin(a) * r)))); }
    return ring;
  });
  for (let i = 0; i < rings.length; i++) {
    const A = rings[i], B = rings[(i + 1) % rings.length], ref = avg([pts[i], pts[(i + 1) % pts.length]]);
    for (let k = 0; k < n; k++) quad(ctx, A[k], A[(k + 1) % n], B[(k + 1) % n], B[k], ref);
  }
}
function ellipsoid(ctx, c, rx, ry, rz, n = 10, m = 6) {
  const rings = [], centres = [];
  for (let j = 1; j < m; j++) {
    const v = -Math.PI / 2 + (j / m) * Math.PI;
    rings.push(ellRing(c[0], c[1] + Math.sin(v) * ry, c[2], Math.cos(v) * rx, Math.cos(v) * rz, n));
    centres.push([c[0], c[1] + Math.sin(v) * ry, c[2]]);
  }
  loft(ctx, rings, centres.map(() => c));
  cap(ctx, rings[0], [c[0], c[1] - ry, c[2]], [0, -1, 0]);
  cap(ctx, rings[rings.length - 1], [c[0], c[1] + ry, c[2]], [0, 1, 0]);
}
// a glyph: strokes on a 3x3 grid, centred at c, facing +Z, side s
const GRID = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
function glyph(ctx, c, s, rnd, angle = 0) {
  const strokes = 3 + Math.floor(rnd() * 3), w = s * 0.11;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const P = (g) => { const x = g[0] * s * 0.45, y = g[1] * s * 0.45; return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca, c[2]]; };
  let cur = 4;
  for (let i = 0; i < strokes; i++) {
    let nx = Math.floor(rnd() * 9); if (nx === cur) nx = (nx + 3) % 9;
    const a = P(GRID[cur]), b = P(GRID[nx]);
    const d = nrm(sub(b, a)), o = mul([-d[1], d[0], 0], w / 2);
    quad(ctx, sub(a, o), add(a, o), add(b, o), sub(b, o), [0, 0, 1], true);
    cur = rnd() < 0.5 ? nx : cur;
  }
}
function stoneTint(ctx, rnd, base = 0.9) {
  const l = base + rnd() * 0.07, moss = rnd() < 0.25;
  ctx.color(moss ? `oklch(${l.toFixed(3)} 0.05 125)` : `oklch(${l.toFixed(3)} 0.015 ${(60 + rnd() * 30).toFixed(0)})`);
}

// ---------- the arch ----------
function arch(ctx) {
  const rnd = () => ctx.random();
  const y0 = 1.2, hw = 3.8, jw = 2.3, ow = hw + jw, D = 1.5, ys = y0 + 7.6, ri = hw, ro = ow;
  const c = ctx.lod <= 2 ? 0.07 : 0;
  ctx.albedo(STONE); ctx.roughness(0.95); ctx.flat();
  // plinth and three steps, laid in blocks
  const tiers = [[0, 0.4, -3, 4.0, 8.6], [0.4, 0.8, -3, 3.1, 8.1], [0.8, 1.2, -3, 2.2, 7.6]];
  for (const [a, b, zb, zf, hx] of tiers) {
    let x = -hx;
    while (x < hx - 0.01) {
      const w = Math.min(hx - x, 1.3 + rnd() * 1.1);
      stoneTint(ctx, rnd, 0.86);
      box(ctx, x + 0.03, a, zb, x + w - 0.03, b - rnd() * 0.04, zf - rnd() * 0.06, c, "y");
      x += w;
    }
  }
  // jambs: coursed blocks, alternating bond, a base moulding and an impost
  for (const sgn of [-1, 1]) {
    const xi = sgn * hw, xo = sgn * ow;
    const lo = Math.min(xi, xo), hi = Math.max(xi, xo);
    stoneTint(ctx, rnd, 0.84);
    box(ctx, lo - 0.25, y0, -D - 0.25, hi + 0.25, y0 + 0.55, D + 0.25, c);
    let y = y0 + 0.55, row = 0;
    while (y < ys - 0.45 - 0.01) {
      const h = Math.min(ys - 0.45 - y, 0.75 + rnd() * 0.45);
      const split = row % 2 ? 0.45 : 0.6;
      const xm = lo + (hi - lo) * (split + (rnd() - 0.5) * 0.15);
      for (const [a, b] of [[lo, xm], [xm, hi]]) {
        stoneTint(ctx, rnd, 0.86);
        const proud = rnd() * 0.08;
        box(ctx, a + 0.025, y + 0.025, -D - proud, b - 0.025, y + h - 0.025, D + proud, c);
      }
      y += h; row++;
    }
    stoneTint(ctx, rnd, 0.88);
    box(ctx, lo - 0.22, ys - 0.45, -D - 0.22, hi + 0.22, ys, D + 0.22, c); // impost
  }
  // nine voussoirs, each carrying one rune of the Nine
  const N = 9, glyphs = [];
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI - (i / N) * Math.PI - 0.008, a1 = Math.PI - ((i + 1) / N) * Math.PI + 0.008;
    const pin = (a) => [Math.cos(a) * ri, ys + Math.sin(a) * ri];
    const pout = (a) => [Math.cos(a) * (ro + 0.1), ys + Math.sin(a) * (ro + 0.1)];
    const pts = [pin(a0), pout(a0), pout(a1), pin(a1)];
    const zf = D + 0.12 + rnd() * 0.05;
    stoneTint(ctx, rnd, 0.88);
    block(ctx, pts.map((p) => [p[0], p[1], zf]), pts.map((p) => [p[0], p[1], -zf]), c);
    const am = (a0 + a1) / 2, rm = (ri + ro) / 2;
    glyphs.push({ p: [Math.cos(am) * rm, ys + Math.sin(am) * rm, zf], ang: am - Math.PI / 2 });
  }
  // spandrels: courses between the arch ring and the square outline
  for (const sgn of [-1, 1]) {
    let y = ys, row = 0;
    while (y < ys + ro + 0.6) {
      const h = Math.min(0.9 + rnd() * 0.3, ys + ro + 0.6 - y);
      const xa = (yy) => { const dy = yy - ys; return dy >= ro + 0.1 ? 0 : Math.sqrt((ro + 0.1) ** 2 - dy * dy); };
      const xA = xa(y), xB = xa(y + h);
      if (ow - Math.min(xA, xB) > 0.2) {
        const splitAt = (row % 2 ? 0.5 : 0.65);
        const xmA = xA + (ow - xA) * splitAt, xmB = xB + (ow - xB) * splitAt;
        const parts = (ow - Math.max(xA, xB) > 1.4) ? [[xA, xB, xmA, xmB], [xmA, xmB, ow, ow]] : [[xA, xB, ow, ow]];
        for (const [ia, ib, oa, ob] of parts) {
          const F = [[sgn * ia, y + 0.02], [sgn * oa, y + 0.02], [sgn * ob, y + h - 0.02], [sgn * ib, y + h - 0.02]];
          stoneTint(ctx, rnd, 0.85);
          const z = D + rnd() * 0.05;
          block(ctx, F.map((p) => [p[0], p[1], z]), F.map((p) => [p[0], p[1], -z]), c);
        }
      }
      y += h; row++;
    }
  }
  const yt = ys + ro + 0.6;
  // cornice, band, attic, crown; the right end of the cornice broken away
  stoneTint(ctx, rnd, 0.9); box(ctx, -ow - 0.5, yt, -D - 0.3, ow - 0.9, yt + 0.6, D + 0.3, c);
  stoneTint(ctx, rnd, 0.82); box(ctx, ow - 0.9, yt, -D - 0.1, ow + 0.2, yt + 0.38, D + 0.05, c);
  stoneTint(ctx, rnd, 0.88); box(ctx, -ow + 0.2, yt + 0.6, -D + 0.1, ow - 0.4, yt + 0.8, D, c);
  let x = -4.6;
  while (x < 4.59) { const w = Math.min(4.6 - x, 1.4 + rnd() * 0.8); stoneTint(ctx, rnd, 0.86); box(ctx, x + 0.03, yt + 0.8, -1.2, x + w - 0.03, yt + 1.95, 1.2 + rnd() * 0.05, c); x += w; }
  stoneTint(ctx, rnd, 0.9); box(ctx, -1.5, yt + 1.95, -1.0, 1.5, yt + 3.0, 1.25, c);
  stoneTint(ctx, rnd, 0.9); box(ctx, -1.8, yt + 1.95, -1.1, 1.8, yt + 2.15, 1.35, c);
  // rubble fallen at the broken corner
  for (let i = 0; i < 5; i++) { const bx = 6.4 + rnd() * 2.2, bz = 2.4 + rnd() * 2, s = 0.25 + rnd() * 0.4; stoneTint(ctx, rnd, 0.84); box(ctx, bx - s, 1.2 * (bz < 2.2 ? 1 : 0), bz - s, bx + s, s * 1.4, bz + s, c * 0.6, "y"); }
  // iron rune sockets and their gold glyphs
  ctx.albedo(IRON); ctx.metalness(0.6); ctx.roughness(0.45); ctx.color("oklch(0.55 0.02 60)");
  const sock = (p, r, depth) => {
    const ring = [], ring2 = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; ring.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, p[2] + depth]); ring2.push([p[0] + Math.cos(a) * r * 1.12, p[1] + Math.sin(a) * r * 1.12, p[2] - 0.05]); }
    loft(ctx, [ring2, ring], [[p[0], p[1], p[2] - 0.2], [p[0], p[1], p[2] - 0.2]]);
    cap(ctx, ring, [p[0], p[1], p[2] + depth], [0, 0, 1]);
  };
  for (const g of glyphs) sock(g.p, 0.42, 0.06);
  const crownP = [0, yt + 2.45, 1.25];
  sock(crownP, 0.55, 0.06);
  ctx.albedo(null); ctx.metalness(null); ctx.color(null); ctx.emissive(GOLD[0], GOLD[1], GOLD[2]);
  const grnd = (() => { let s = 9; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  for (const g of glyphs) glyph(ctx, [g.p[0], g.p[1], g.p[2] + 0.075], 0.6, grnd, g.ang);
  // the crown: a nine-rayed star
  const cz = crownP[2] + 0.075;
  for (let k = 0; k < 9; k++) {
    const a = Math.PI / 2 + (k / 9) * Math.PI * 2, b = a + Math.PI / 9;
    const P = (ang, r) => [crownP[0] + Math.cos(ang) * r, crownP[1] + Math.sin(ang) * r, cz];
    quad(ctx, [crownP[0], crownP[1], cz], P(a - 0.12, 0.18), P(a, 0.46), P(a + 0.12, 0.18), [0, 0, 1], true);
    void b;
  }
  // a gold inlay line along the soffit edge
  ctx.emissive(GOLD[0] * 0.5, GOLD[1] * 0.5, GOLD[2] * 0.5);
  for (let i = 0; i < 36; i++) {
    const a0 = Math.PI - (i / 36) * Math.PI, a1 = Math.PI - ((i + 1) / 36) * Math.PI, r0 = ri + 0.14, r1 = ri + 0.2, z = D + 0.2;
    quad(ctx, [Math.cos(a0) * r0, ys + Math.sin(a0) * r0, z], [Math.cos(a0) * r1, ys + Math.sin(a0) * r1, z], [Math.cos(a1) * r1, ys + Math.sin(a1) * r1, z], [Math.cos(a1) * r0, ys + Math.sin(a1) * r0, z], [0, 0, 1], true);
  }
  ctx.emissive(null);
}

// ---------- a hooded warden, hands on a sword's pommel ----------
function warden(ctx) {
  const rnd = () => ctx.random();
  const c = ctx.lod <= 2 ? 0.06 : 0;
  const n = ctx.lod <= 2 ? 24 : 12;
  ctx.albedo(STATUE); ctx.roughness(0.9); ctx.flat();
  ctx.color("oklch(0.88 0.015 70)"); box(ctx, -1.7, 0, -1.6, 1.7, 0.5, 1.7, c, "y");
  ctx.color("oklch(0.92 0.02 75)"); box(ctx, -1.45, 0.5, -1.35, 1.45, 0.95, 1.45, c, "y");
  const y0 = 0.95;
  ctx.color("oklch(0.93 0.01 80)");
  ctx.smooth();
  // robe
  const robe = [[0, 1.2, 1.0, 0.07], [0.25, 1.15, 0.95, 0.07], [1.4, 1.0, 0.8, 0.06], [2.5, 0.86, 0.66, 0.04], [3.3, 0.9, 0.64, 0.03], [4.1, 1.05, 0.62, 0.02], [4.45, 1.12, 0.6, 0.01], [4.7, 0.95, 0.55, 0], [4.88, 0.5, 0.42, 0]];
  loft(ctx, robe.map(([y, rx, rz, f]) => ellRing(0, y0 + y, 0, rx, rz, n, f, 9, 0.4)), robe.map(([y]) => [0, y0 + y, 0]));
  // mantle over the shoulders, open beneath
  const mantle = [[4.98, 0.72, 0.58, 0], [4.72, 1.22, 0.72, 0.03], [4.3, 1.3, 0.78, 0.06], [3.65, 1.33, 0.84, 0.09]];
  loft(ctx, mantle.map(([y, rx, rz, f]) => ellRing(0, y0 + y, -0.02, rx, rz, n, f, 11, 1.3)), mantle.map(([y]) => [0, y0 + y, 0]));
  // hood
  const hood = [[4.8, 0.6, 0.58], [5.15, 0.66, 0.66], [5.55, 0.63, 0.65], [5.9, 0.54, 0.58], [6.15, 0.4, 0.47], [6.33, 0.2, 0.32]];
  const hr = hood.map(([y, rx, rz]) => ellRing(0, y0 + y, -0.1, rx, rz, n, 0.02, 5, 0.2));
  loft(ctx, hr, hood.map(([y]) => [0, y0 + y, -0.1]));
  cap(ctx, hr[hr.length - 1], [0, y0 + 6.42, -0.32], [0, 1, 0.2]);
  // sleeves, the cuffs bell over the hands
  for (const s of [-1, 1]) tube(ctx, [[s * 0.98, y0 + 4.5, 0.02], [s * 1.08, y0 + 3.95, 0.3], [s * 0.85, y0 + 3.62, 0.68], [s * 0.42, y0 + 3.55, 1.0]], [0.3, 0.3, 0.31, 0.38], ctx.lod <= 2 ? 10 : 6);
  // hands on the pommel
  ellipsoid(ctx, [-0.17, y0 + 3.62, 1.17], 0.19, 0.12, 0.2, 8, 5);
  ellipsoid(ctx, [0.17, y0 + 3.7, 1.15], 0.19, 0.12, 0.2, 8, 5);
  ctx.flat();
  // the face: a dark hollow under a heavy cowl rim
  ctx.albedo(null); ctx.color("oklch(0.1 0.01 60)");
  const fc = [0, y0 + 5.5, 0.53], fr = [];
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; fr.push([fc[0] + Math.cos(a) * 0.34, fc[1] + Math.sin(a) * 0.42, fc[2] - 0.05 * (1 - Math.abs(Math.sin(a)))]); }
  cap(ctx, fr, [fc[0], fc[1], fc[2] - 0.18], [0, 0, 1]);
  ctx.albedo(STATUE); ctx.color("oklch(0.9 0.015 70)");
  const rim = [];
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; rim.push([Math.cos(a) * 0.4, y0 + 5.5 + Math.sin(a) * 0.5, 0.56 - 0.06 * Math.max(0, -Math.sin(a))]); }
  tubeLoop(ctx, rim, [0, y0 + 5.5, 0.56], [0, 0, 1], 0.1, ctx.lod <= 2 ? 6 : 4);
  // a rope belt
  const belt = [];
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; belt.push([Math.cos(a) * 0.9, y0 + 2.55, Math.sin(a) * 0.69]); }
  tubeLoop(ctx, belt, [0, y0 + 2.55, 0], [0, 1, 0], 0.07, 5);
  // two faint eye-glints
  ctx.albedo(null); ctx.color("oklch(0.2 0.02 70)"); ctx.emissive(3.2, 2.0, 0.6);
  for (const s of [-1, 1]) quad(ctx, [s * 0.15 - 0.06, y0 + 5.58, 0.5], [s * 0.15 + 0.06, y0 + 5.58 - s * 0.012, 0.5], [s * 0.15 + 0.06, y0 + 5.625, 0.5], [s * 0.15 - 0.06, y0 + 5.62 + s * 0.01, 0.5], [0, 0, 1], true);
  ctx.emissive(null);
  // the sword: tip on the plinth, hammered iron
  ctx.albedo(IRON); ctx.metalness(0.55); ctx.roughness(0.5); ctx.color("oklch(0.7 0.01 60)");
  const sz = 1.2, gy = y0 + 2.75;
  const dia = (y, w, t) => [[-w, y, sz], [0, y, sz + t], [w, y, sz], [0, y, sz - t]];
  loft(ctx, [dia(y0 + 0.05, 0.04, 0.02), dia(y0 + 0.5, 0.12, 0.04), dia(gy, 0.17, 0.05)], [[0, y0, sz], [0, y0 + 0.5, sz], [0, gy, sz]]);
  box(ctx, -0.62, gy, sz - 0.09, 0.62, gy + 0.15, sz + 0.09, 0.03);
  ctx.color("oklch(0.6 0.03 50)");
  tube(ctx, [[0, gy + 0.15, sz], [0, y0 + 3.42, sz]], [0.065, 0.06], 8, true);
  ctx.smooth(); ellipsoid(ctx, [0, y0 + 3.5, sz], 0.14, 0.12, 0.14, 8, 5); ctx.flat();
  ctx.metalness(null);
}

// ---------- a stepped dais with an iron brazier ----------
function brazier(ctx) {
  const rnd = () => ctx.random();
  const c = ctx.lod <= 2 ? 0.05 : 0;
  ctx.albedo(STONE); ctx.roughness(0.95); ctx.flat();
  [[1.5, 0, 0.35], [1.15, 0.35, 0.7], [0.82, 0.7, 1.05]].forEach(([h, a, b]) => { stoneTint(ctx, rnd, 0.86); box(ctx, -h, a, -h, h, b, h, c, "y"); });
  ctx.albedo(IRON); ctx.metalness(0.6); ctx.roughness(0.5); ctx.color("oklch(0.62 0.02 55)");
  const n = ctx.lod <= 2 ? 18 : 10;
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5, ca = Math.cos(a), sa = Math.sin(a);
    tube(ctx, [[ca * 0.62, 1.05, sa * 0.62], [ca * 0.7, 1.25, sa * 0.7], [ca * 0.5, 1.6, sa * 0.5], [ca * 0.3, 1.92, sa * 0.3]], [0.06, 0.05, 0.05, 0.05], 6, true);
  }
  ctx.smooth();
  const prof = [[1.85, 0.08], [1.86, 0.3], [1.97, 0.52], [2.15, 0.68], [2.33, 0.76], [2.42, 0.8]];
  loft(ctx, prof.map(([y, r]) => ellRing(0, y, 0, r, r, n)), prof.map(([y]) => [0, y - 0.6, 0]));
  ctx.flat();
  const rim = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; rim.push([Math.cos(a) * 0.8, 2.42, Math.sin(a) * 0.8]); }
  tubeLoop(ctx, rim, [0, 2.42, 0], [0, 1, 0], 0.055, 5);
  ctx.metalness(null);
  // glowing coals
  ctx.albedo(null); ctx.color("oklch(0.3 0.05 40)"); ctx.emissive(2.4, 0.75, 0.15);
  const coal = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; coal.push([Math.cos(a) * 0.68, 2.2 + 0.05 * Math.sin(a * 5), Math.sin(a) * 0.68]); }
  cap(ctx, coal, [0, 2.32, 0], [0, 1, 0]);
  ctx.emissive(null);
}

// ---------- a broken fluted pillar with its fallen drum ----------
function pillar(ctx) {
  const rnd = () => ctx.random();
  const h = ctx.params.h ?? 6, r = 0.72, n = ctx.lod <= 2 ? 28 : 12;
  const c = ctx.lod <= 2 ? 0.06 : 0;
  ctx.albedo(STONE); ctx.roughness(0.95); ctx.flat();
  stoneTint(ctx, rnd, 0.86); box(ctx, -1.1, 0, -1.1, 1.1, 0.55, 1.1, c, "y");
  ctx.smooth();
  const flute = (y, rr, rot) => { const ring = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + rot; const f = 1 - 0.04 * Math.abs(Math.sin(a * 6)); ring.push([Math.cos(a) * rr * f, y, Math.sin(a) * rr * f]); } return ring; };
  let y = 0.55;
  const bt = [[0.55, r * 1.3], [0.7, r * 1.25], [0.82, r * 1.08]];
  loft(ctx, bt.map(([yy, rr]) => flute(yy, rr, 0)), bt.map(([yy]) => [0, yy, 0]));
  y = 0.82;
  while (y < h - 0.05) {
    const dh = Math.min(h - y, 1.2 + rnd() * 0.5), rot = rnd() * 0.2, last = y + dh >= h - 0.05;
    stoneTint(ctx, rnd, 0.88);
    const lo = flute(y + 0.02, r * (1 - 0.02 * rnd()), rot), hi = flute(y + dh - 0.02, r * 0.97, rot);
    if (last) hi.forEach((p, k) => { p[1] -= rnd() * 0.7 * (0.5 + 0.5 * Math.sin(k * 0.7)); });
    loft(ctx, [lo, hi], [[0, y, 0], [0, y + dh, 0]]);
    cap(ctx, hi, [0, y + dh - 0.35, 0], [0, 1, 0]);
    y += dh;
  }
  // the fallen drum
  ctx.flat(); stoneTint(ctx, rnd, 0.86);
  const fx = 1.9, fz = 0.9 + rnd(), fl = 1.3, yaw = rnd() * 3;
  const along = [Math.cos(yaw), 0, Math.sin(yaw)];
  tube(ctx, [[fx - along[0] * fl / 2, r, fz - along[2] * fl / 2], [fx + along[0] * fl / 2, r, fz + along[2] * fl / 2]], [r, r], n > 12 ? 16 : 8, true);
  for (let i = 0; i < 4; i++) { const bx = -1.6 + rnd() * 3.2, bz = 1.2 + rnd() * 1.5, s = 0.15 + rnd() * 0.25; stoneTint(ctx, rnd, 0.84); box(ctx, bx - s, 0, bz - s, bx + s, s * 1.2, bz + s, c * 0.5, "y"); }
}

// ---------- the flagstone causeway, kerbed ----------
function causeway(ctx) {
  const rnd = () => ctx.random();
  const z0 = ctx.params.zFront ?? 10, z1 = ctx.params.zBack ?? -12, hw = ctx.params.halfWidth ?? 2.6;
  const c = ctx.lod <= 2 ? 0.04 : 0;
  ctx.albedo(STONE); ctx.roughness(0.9); ctx.flat();
  let z = z0;
  while (z > z1 + 0.05) {
    const d = Math.min(z - z1, 0.75 + rnd() * 0.5);
    let x = -hw;
    while (x < hw - 0.01) {
      const w = Math.min(hw - x, 0.7 + rnd() * 0.9);
      if (rnd() > 0.05) {
        stoneTint(ctx, rnd, 0.84);
        const t = 0.08 + rnd() * 0.06;
        box(ctx, x + 0.04, -0.1, z - d + 0.04, x + w - 0.04, t, z - 0.04, c, "y");
      }
      x += w;
    }
    z -= d;
  }
  for (const s of [-1, 1]) {
    let zz = z0;
    while (zz > z1 + 0.05) { const L = Math.min(zz - z1, 1.4 + rnd() * 0.8); stoneTint(ctx, rnd, 0.8); box(ctx, s * hw + (s < 0 ? -0.42 : 0.02), -0.1, zz - L + 0.03, s * hw + (s < 0 ? -0.02 : 0.42), 0.22 + rnd() * 0.06, zz - 0.03, c, "y"); zz -= L; }
  }
}

// ---------- an iron lantern post; the lantern hangs at local +X ----------
function lantern(ctx) {
  const rnd = () => ctx.random();
  ctx.albedo(STONE); ctx.roughness(0.95); ctx.flat(); stoneTint(ctx, rnd, 0.85);
  box(ctx, -0.32, 0, -0.32, 0.32, 0.45, 0.32, 0.04, "y");
  ctx.albedo(IRON); ctx.metalness(0.6); ctx.roughness(0.5); ctx.color("oklch(0.6 0.02 55)");
  box(ctx, -0.07, 0.45, -0.07, 0.07, 3.15, 0.07, 0.02);
  ctx.smooth(); ellipsoid(ctx, [0, 3.22, 0], 0.11, 0.11, 0.11, 8, 5); ctx.flat();
  tube(ctx, [[0, 2.95, 0], [0.3, 3.0, 0], [0.62, 2.98, 0], [0.72, 2.88, 0]], [0.035, 0.035, 0.035, 0.03], 6, true);
  tube(ctx, [[0.05, 2.5, 0], [0.3, 2.85, 0]], [0.025, 0.025], 5, true);
  const lx = 0.72, top = 2.78, bot = 2.25, s = 0.17;
  box(ctx, lx - s - 0.03, bot - 0.06, -s - 0.03, lx + s + 0.03, bot, s + 0.03, 0.01, "y");
  // a pyramid cap
  const P = [[lx - s - 0.05, top, -s - 0.05], [lx + s + 0.05, top, -s - 0.05], [lx + s + 0.05, top, s + 0.05], [lx - s - 0.05, top, s + 0.05]], apex = [lx, top + 0.16, 0];
  for (let k = 0; k < 4; k++) tri(ctx, P[k], P[(k + 1) % 4], apex, [lx, top, 0]);
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(ctx, lx + dx * s - 0.018, bot, dz * s - 0.018, lx + dx * s + 0.018, top, dz * s + 0.018, 0.005);
  ctx.metalness(null); ctx.albedo(null);
  ctx.color("oklch(0.9 0.05 80)"); ctx.emissive(3.0, 1.75, 0.5);
  box(ctx, lx - s + 0.02, bot, -s + 0.02, lx + s - 0.02, top - 0.02, s - 0.02, 0);
  ctx.emissive(null);
}

// ---------- a far ridge of crags, the horizon ----------
function ridge(ctx) {
  const len = ctx.params.length ?? 700, base = ctx.params.height ?? 45;
  ctx.albedo(null); ctx.color("oklch(0.24 0.02 280)"); ctx.roughness(1); ctx.flat();
  const step = 9, pts = [];
  for (let x = -len / 2; x <= len / 2; x += step) {
    const n = ctx.noise2d(x * 0.006, 0.3) * 0.6 + ctx.noise2d(x * 0.03, 1.7) * 0.3 + ctx.noise2d(x * 0.12, 4.1) * 0.1;
    pts.push([x, Math.max(6, base * (0.55 + n)), (ctx.random() - 0.5) * 14]);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    quad(ctx, [a[0], -5, a[2]], [b[0], -5, b[2]], [b[0], b[1], b[2]], [a[0], a[1], a[2]], [0, 0, 1], true);
  }
}

export function geometry(ctx) {
  const k = ctx.params.kind;
  if (k === "arch") arch(ctx);
  else if (k === "warden") warden(ctx);
  else if (k === "brazier") brazier(ctx);
  else if (k === "pillar") pillar(ctx);
  else if (k === "causeway") causeway(ctx);
  else if (k === "lantern") lantern(ctx);
  else if (k === "ridge") ridge(ctx);
}
export function collider() { return null; }
