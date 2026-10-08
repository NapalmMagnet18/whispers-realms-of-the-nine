// Forest trees: params.kind "pine" | "giantpine" | "oak" | "twisted" | "dead", seeded shape. Origin at the root flare.
// Bark is a lofted trunk; foliage is alpha-cut cards wearing the creator's painted clusters. Wear it with
// material { kind: scripted, script: scripts/tree-look.js, params: { kind } }: that look reads the uvs written here
// (bark u < 5, cylindrical; a leaf card's u = 10 + its 0..1) and owns the bark/normal/leaf textures per kind.
// Without that material the trunk keeps the painted bark albedo below and cards draw as flat tinted quads.
import { cyl, boxR } from "./shape.js";
const BARK = { dead: "/cdn/bark-deadtree-u2s9hxqea.webp", twisted: "/cdn/bark-twistedtree-u37sw9e2o.webp" };
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];

export function geometry(ctx) {
  ctx.flat();
  const { kind = "pine", bark = null } = ctx.params || {};
  const r = () => ctx.random();
  const lod = ctx.lod || 1;
  const uvs = [];
  // bark faces: cylindrical u about the trunk axis (2 repeats a turn), v up the trunk; caps planar
  const barkUV = (p, n) => {
    const P = []; for (let i = 0; i < n; i++) P.push([p[i * 3], p[i * 3 + 1], p[i * 3 + 2]]);
    const nn = norm(crs([P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]]));
    if (Math.abs(nn[1]) > 0.8) { for (const q of P) uvs.push(2 + q[0] * 0.4, q[2] * 0.4); return; }
    let u0 = null;
    for (const q of P) { let u = Math.atan2(q[2], q[0]) / Math.PI + 2; if (u0 === null) u0 = u; else { if (u - u0 > 1) u -= 2; if (u0 - u > 1) u += 2; } uvs.push(u, q[1] / 2.2); }
  };
  const W = new Proxy(ctx, { get(t, k) {
    if (k === "tri") return (...p) => { t.tri(...p); barkUV(p, 3); };
    if (k === "quad") return (...p) => { t.quad(...p); barkUV(p, 4); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  // a leaf card: centre c, half-extent R (image right) and U (image up)
  const card = (c, R, U) => {
    const a = add(add(c, R, -1), U, -1), b = add(add(c, R), U, -1), cc = add(add(c, R), U), d = add(add(c, R, -1), U);
    ctx.quad(...a, ...b, ...cc, ...d);
    uvs.push(10.004, 0.004, 10.996, 0.004, 10.996, 0.996, 10.004, 0.996);
  };
  // a bent limb: tube from p0 to p1
  const tube = (p0, p1, r0, r1, seg) => {
    const D = norm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
    const A = norm(crs(Math.abs(D[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], D)), B = crs(D, A);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * 6.2832, a1 = ((i + 1) / seg) * 6.2832;
      const o = (a, rr) => add(add([0, 0, 0], A, Math.cos(a) * rr), B, Math.sin(a) * rr);
      const q0 = add(p0, o(a0, r0)), q1 = add(p0, o(a1, r0)), q2 = add(p1, o(a1, r1)), q3 = add(p1, o(a0, r1));
      W.quad(...q0, ...q3, ...q2, ...q1);
    }
  };
  // a crown of cards on an ellipsoid shell, each facing out, tinted darker inside and below
  const crown = (c, rad, n, half, phase = 0) => {
    for (let i = 0; i < n; i++) {
      const yy = 1 - ((i + 0.5) / n) * 1.6, rr = Math.sqrt(Math.max(0, 1 - yy * yy)), th = i * 2.39996 + phase;
      const dir = norm([Math.cos(th) * rr, yy, Math.sin(th) * rr]);
      const p = [c[0] + dir[0] * rad[0] * 0.72, c[1] + dir[1] * rad[1] * 0.72, c[2] + dir[2] * rad[2] * 0.72];
      const R = norm(crs([0, 1, 0], Math.abs(dir[1]) > 0.95 ? [1, 0, 0.01] : dir)), U = norm(crs(dir, R));
      const s = half * (0.85 + r() * 0.35), tw = (r() - 0.5) * 1.2;
      const R2 = add([0, 0, 0], R, Math.cos(tw)), U2 = add([0, 0, 0], U, Math.cos(tw));
      const Rr = add(R2, U, Math.sin(tw)), Ur = add(U2, R, -Math.sin(tw));
      ctx.color(`oklch(${(0.74 + 0.22 * (yy * 0.5 + 0.5)).toFixed(3)} 0 0)`);
      card(p, add([0, 0, 0], Rr, s), add([0, 0, 0], Ur, s));
    }
  };
  // crossed upright cards through the crown's axis: the silhouette from any heading
  const cross = (y0, y1, half, n, tint) => {
    ctx.color(tint);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI + 0.3; const R = [Math.cos(a) * half, 0, Math.sin(a) * half]; card([0, (y0 + y1) / 2, 0], R, [0, (y1 - y0) / 2, 0]); }
  };
  // conifer tiers: cards radiating from the trunk, drooping, rolled alternately so the tier has depth
  const tiers = (y0, y1, rad0, nT, nC, droop, widthK) => {
    for (let i = 0; i < nT; i++) {
      const f = i / Math.max(1, nT - 1), y = y0 + (y1 - y0) * f, rad = rad0 * (1 - f * 0.78) + r() * 0.25;
      ctx.color(`oklch(${(0.72 + 0.26 * f).toFixed(3)} 0 0)`);
      for (let j = 0; j < nC; j++) {
        const a = (j / nC) * 6.2832 + i * 0.9 + r() * 0.4, o = [Math.cos(a), 0, Math.sin(a)];
        const D = norm([o[0], -Math.tan(droop), o[2]]), L = rad * 1.1;
        const roll = (j % 2 ? 1 : -1) * 0.75, side = [-o[2], 0, o[0]];
        const Rd = norm(add(add([0, 0, 0], side, Math.cos(roll)), [0, 1, 0], Math.sin(roll)));
        card(add([0, y, 0], D, L / 2), add([0, 0, 0], Rd, L * widthK), add([0, 0, 0], D, L / 2));
      }
    }
  };

  ctx.albedo(bark || BARK[kind] || "/cdn/bark-normaltree-u9xpx2wlu.webp"); ctx.roughness(0.95);
  ctx.color(kind === "dead" ? "oklch(0.95 0 0)" : kind === "pine" || kind === "giantpine" ? "oklch(0.7 0.02 50)" : "oklch(0.78 0.015 60)");

  if (kind === "pine") {
    const H = 9 + r() * 4;
    cyl(W, 0, -0.3, 0, 0.42, 0.08, H, lod > 2 ? 6 : 9);
    ctx.albedo(null);
    if (lod <= 3) tiers(2.0, H - 1.2, 3.1, lod === 1 ? 7 : lod === 2 ? 5 : 3, lod === 1 ? 6 : lod === 2 ? 5 : 4, 0.3, 0.42);
    // the silhouette: stacked square crossed cards tapering up (a painted cluster stays square, never stretched tall)
    const lv = lod >= 4 ? 2 : 3, span = (H + 0.6 - 1.4) / lv;
    for (let i = 0; i < lv; i++) { const hw = 2.6 * (1 - i * 0.28), y0 = 1.4 + i * span * 0.92; cross(y0, y0 + hw * 2, hw, 2, "oklch(0.86 0 0)"); }
    return { uvs };
  }
  if (kind === "giantpine") {
    const H = 24 + r() * 8;
    cyl(W, 0, -0.5, 0, 0.95, 0.14, H, lod > 2 ? 7 : 11);
    ctx.albedo(null);
    const nT = lod === 1 ? 10 : lod === 2 ? 7 : lod === 3 ? 5 : 3;
    tiers(7, H - 1, 5.6, nT, lod <= 2 ? 6 : 4, 0.22, 0.5);
    ctx.color("oklch(0.95 0 0)"); card([0, H + 0.3, 0], [1.4, 0, 0], [0, 1.6, 0]); card([0, H + 0.3, 0], [0, 0, 1.4], [0, 1.6, 0]);
    return { uvs };
  }
  if (kind === "dead") {
    const H = 6 + r() * 2;
    cyl(W, 0, -0.3, 0, 0.35, 0.1, H, 7);
    for (let i = 0; i < 4; i++) { const y = 2.5 + i * 1.0, a = r() * 360; boxR(W, [Math.cos(a / 57.3) * 0.8, y + 0.4, Math.sin(a / 57.3) * 0.8], [1.8, 0.1, 0.1], { yaw: -a, roll: 30 }); }
    return { uvs };
  }
  if (kind === "twisted") {
    // a leaning, kinked trunk, four writhing limbs, a broad flat red crown with tufts at the limb ends
    const seg = lod > 2 ? 6 : 9, k = [[0, -0.4, 0]];
    for (let i = 1; i <= 3; i++) k.push([(r() - 0.5) * 1.4, i * 1.8, (r() - 0.5) * 1.4]);
    for (let i = 0; i < 3; i++) tube(k[i], k[i + 1], 0.85 - i * 0.2, 0.65 - i * 0.2, seg);
    const top = k[3], ends = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * 6.2832 + r() * 0.8, l = 2.6 + r() * 1.2;
      const mid = [top[0] + Math.cos(a) * l * 0.5, top[1] + 0.9 + r() * 0.6, top[2] + Math.sin(a) * l * 0.5];
      const end = [top[0] + Math.cos(a + 0.4) * l, top[1] + 1.4 + r() * 1.2, top[2] + Math.sin(a + 0.4) * l];
      tube(top, mid, 0.32, 0.22, lod > 2 ? 4 : 6); tube(mid, end, 0.22, 0.08, lod > 2 ? 4 : 5); ends.push(end);
    }
    ctx.albedo(null);
    const c = [top[0], top[1] + 2.0, top[2]];
    crown(c, [4.2, 1.9, 4.2], lod === 1 ? 20 : lod === 2 ? 14 : lod <= 4 ? 9 : 5, 2.0, r() * 6);
    if (lod <= 2) for (const e of ends) crown(e, [1.3, 1.0, 1.3], 4, 1.2, r() * 6);
    return { uvs };
  }
  // oak: thick trunk, three limbs, a crown of leaf-cluster cards
  const H = 4.5 + r() * 1.5;
  cyl(W, 0, -0.3, 0, 0.7, 0.42, H, lod > 2 ? 7 : 10);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * 6.28 + r(), l = 2.2; boxR(W, [Math.cos(a) * l * 0.5, H + 0.7, Math.sin(a) * l * 0.5], [l * 1.2, 0.35, 0.35], { yaw: -a * 57.3, roll: 35 }); }
  ctx.albedo(null);
  crown([0, H + 2.3, 0], [3.5, 2.6, 3.5], lod === 1 ? 22 : lod === 2 ? 16 : lod === 3 ? 10 : lod === 4 ? 6 : 4, 1.9, r() * 6);
  if (lod <= 3) cross(H + 0.6, H + 4.4, 2.6, 2, "oklch(0.8 0 0)");
  return { uvs };
}
export function collider(ctx) {
  const k = ctx.params?.kind;
  cyl(ctx, 0, -0.3, 0, k === "oak" || k === "twisted" ? 0.65 : k === "giantpine" ? 0.9 : 0.4, 0.3, 5, 6);
}
