// The three frontiers' landmarks by params.kind: head (Frostveil giant's head), stone (rune standing stone),
// waystone (road marker with a hanging lantern), tent (striped caravan tent, open −Z), gate (Sunscar sandstone gate
// half sunk in a dune, passage along Z), rootarch (Elderveil root you walk under, spans X), roots (buttress roots
// round the colossal tree's foot). Origin at the ground.
import { box, boxR, cyl, blob, quadN, triN } from "./shape.js";
const ROCK = "/cdn/rocks-diffuse-u03avi37y.webp", TWIST = "/cdn/bark-twistedtree-u3vvl00p9.webp";
const FIELD = "cdn/texture-rough-fieldstone-wall-mossy.png", IRON = "cdn/texture-rusted-black-iron-hammered.png", WOOD = "cdn/texture-dark-oak-timber-beam-hand-painted.png";
const SNOW = "cdn/texture-wind-packed-snow-drift.png", SANDST = "cdn/texture-weathered-carved-sandstone-blocks.png", SAND = "cdn/texture-rippled-desert-sand-dunes.png";
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// a swept tube through pts with a radius per point; faces wound from the ring's centre outward
function tube(ctx, pts, rad, seg = 10, caps = true) {
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    const u = norm(crs(t, Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = crs(t, u);
    const r = [];
    for (let k = 0; k < seg; k++) { const an = (k / seg) * Math.PI * 2, c = Math.cos(an) * rad[i], s = Math.sin(an) * rad[i]; r.push([p[0] + u[0] * c + v[0] * s, p[1] + u[1] * c + v[1] * s, p[2] + u[2] * c + v[2] * s]); }
    return r;
  });
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < seg; k++) {
    const k2 = (k + 1) % seg, A = rings[i][k], B = rings[i][k2], C = rings[i + 1][k2], D = rings[i + 1][k];
    const m = [(A[0] + C[0]) / 2 - (pts[i][0] + pts[i + 1][0]) / 2, (A[1] + C[1]) / 2 - (pts[i][1] + pts[i + 1][1]) / 2, (A[2] + C[2]) / 2 - (pts[i][2] + pts[i + 1][2]) / 2];
    quadN(ctx, A, B, C, D, m);
  }
  if (caps) for (const [i, j] of [[0, 1], [pts.length - 1, pts.length - 2]]) {
    const n = [pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]];
    for (let k = 0; k < seg; k++) triN(ctx, pts[i], rings[i][k], rings[i][(k + 1) % seg], n);
  }
}
const glyphs = (ctx, x0, y0, z, n, step, seed) => {
  let h = seed;
  const r = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
  for (let i = 0; i < n; i++) {
    const y = y0 - i * step, x = x0 + (r() - 0.5) * 0.15;
    boxR(ctx, [x, y, z], [0.08, 0.46, 0.05]);
    boxR(ctx, [x + 0.11, y + 0.08 - r() * 0.16, z], [0.07, 0.28, 0.05], { roll: r() > 0.5 ? 40 : -40 });
    if (r() > 0.5) boxR(ctx, [x - 0.1, y - 0.12, z], [0.18, 0.06, 0.05]);
  }
};
const K = {
  head(ctx, p, s, P) {
    P(ROCK, "oklch(0.9 0.015 240)", 0.95);
    blob(ctx, 0, 3, 0, 8, 11, 9, 4.2, 0.06, s ? 7 : 14, s ? 10 : 20); // the skull, crown at 14 m
    if (s) return;
    blob(ctx, 0, 1.4, -3.6, 7, 4.6, 6.2, 7.1, 0.08, 8, 12); // jaw and cheeks
    boxR(ctx, [0, 8.7, -7.5], [12.5, 1.9, 3.2], { pitch: -12 }); // brow
    boxR(ctx, [0, 5.5, -8.5], [2.4, 4.4, 2.6], { pitch: 14 }); // nose
    blob(ctx, 0, 3.7, -9.4, 2.0, 1.3, 1.4, 3, 0.1, 5, 8);
    for (const sd of [-1, 1]) {
      blob(ctx, sd * 4.7, 5.3, -7.3, 2.5, 1.4, 1.9, 5 + sd, 0.12, 5, 8); // cheekbones
      blob(ctx, sd * 8.1, 6.6, 0.6, 1.3, 3.3, 2.3, 9 + sd, 0.15, 6, 8); // ears
    }
    boxR(ctx, [0, 2.0, -9.6], [5.2, 0.9, 1.2], { pitch: 8 }); // lips
    for (let i = 0; i < 7; i++) blob(ctx, -3 + i, 0.5 - (i % 2) * 0.4, -9.5 + Math.abs(i - 3) * 0.3, 0.55, 1.3, 0.55, 20 + i, 0.15, 5, 6); // braided beard sinking into the ground
    P(ROCK, "oklch(0.85 0.02 240)", 0.95);
    for (let i = 0; i < 16; i++) { // a broken circlet of rune blocks
      if (i === 3 || i === 4 || i === 11) continue;
      const a = (i / 16) * Math.PI * 2;
      boxR(ctx, [Math.cos(a) * 6.1, 10.5 + (i % 3) * 0.08, Math.sin(a) * 6.8], [2.5, 1.35, 1.0], { yaw: -(a * 57.3 + 90), pitch: (i % 2) * 4 });
    }
    ctx.albedo(null); ctx.color("oklch(0.2 0.02 240)"); ctx.roughness(1);
    for (const sd of [-1, 1]) blob(ctx, sd * 3.1, 7.0, -8.1, 1.6, 1.05, 0.8, 30 + sd, 0.1, 5, 8); // sockets
    boxR(ctx, [0, 2.0, -10.15], [4.2, 0.22, 0.25], { pitch: 8 });
    ctx.color("oklch(0.88 0.07 210)"); ctx.emissive(0.6, 1.8, 2.6); // the old light still in its eyes
    for (const sd of [-1, 1]) blob(ctx, sd * 3.1, 7.0, -8.75, 0.6, 0.42, 0.3, 40 + sd, 0.05, 4, 6);
    ctx.emissive(0.3, 1.0, 1.5);
    glyphs(ctx, -0.6, 10.6, -7.0, 2, 0.6, 7); glyphs(ctx, 0.5, 10.5, -6.95, 2, 0.6, 13);
    ctx.emissive(null);
    P(SNOW, "oklch(0.98 0.01 240)", 0.8);
    blob(ctx, 0.4, 12.9, 0.8, 4.6, 2.1, 5.4, 50, 0.12, 6, 10); // snow cap
    boxR(ctx, [0, 9.75, -7.3], [12, 0.25, 2.6], { pitch: -12 });
    for (const sd of [-1, 1]) blob(ctx, sd * 6.5, 0.2, -6, 4, 1.4, 4, 60 + sd, 0.2, 5, 8); // drifts at the cheeks
  },
  stone(ctx, p, s, P) {
    const h = p.h ?? 4.6;
    P(ROCK, "oklch(0.86 0.015 240)", 0.95);
    boxR(ctx, [0, h / 2 - 0.6, 0], [1.3, h, 0.75]);
    if (s) return;
    boxR(ctx, [0.12, h - 0.5, 0], [1.05, 0.55, 0.78], { roll: 14 });
    boxR(ctx, [0, -0.3, 0], [1.7, 0.6, 1.1]);
    ctx.albedo(null); ctx.color("oklch(0.88 0.07 210)"); ctx.emissive(0.35, 1.1, 1.7);
    glyphs(ctx, -0.15, h - 1.5, -0.39, 5, 0.6, (p.seed ?? 3) * 17 + 5);
    ctx.emissive(null);
    P(SNOW, "oklch(0.98 0.01 240)", 0.8);
    blob(ctx, 0.05, h - 0.2, 0, 0.5, 0.16, 0.36, 71, 0.15, 4, 7);
  },
  waystone(ctx, p, s, P) {
    P(FIELD, "oklch(0.94 0.01 90)");
    cyl(ctx, 0, -0.6, 0, 0.75, 0.62, 0.9, 8);
    boxR(ctx, [0, 1.4, 0], [0.58, 2.3, 0.58]);
    if (s) return;
    boxR(ctx, [0, 2.62, 0], [0.82, 0.22, 0.82]);
    cyl(ctx, 0, 2.73, 0, 0.52, 0.0, 0.5, 4);
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)"); ctx.emissive(1.6, 0.9, 0.3);
    glyphs(ctx, -0.05, 2.0, -0.3, 3, 0.55, 11);
    ctx.emissive(null);
    P(IRON, "oklch(0.75 0.01 60)", 0.6, 0.6);
    boxR(ctx, [0.5, 2.3, 0], [0.75, 0.07, 0.07]); boxR(ctx, [0.32, 2.12, 0], [0.4, 0.06, 0.06], { roll: 40 });
    box(ctx, 0.73, 2.08, -0.015, 0.77, 2.3, 0.015);
    box(ctx, 0.56, 1.62, -0.17, 0.94, 1.67, 0.17); box(ctx, 0.58, 2.02, -0.15, 0.92, 2.07, 0.15);
    for (const [x, z] of [[0.58, -0.15], [0.92, -0.15], [0.58, 0.15], [0.92, 0.15]]) box(ctx, x - 0.02, 1.67, z - 0.02, x + 0.02, 2.02, z + 0.02);
    cyl(ctx, 0.75, 2.07, 0, 0.21, 0.0, 0.16, 8);
    ctx.albedo(null); ctx.color("oklch(0.9 0.12 75)", 0.85); ctx.emissive(4, 2.2, 0.8);
    box(ctx, 0.62, 1.67, -0.11, 0.88, 2.02, 0.11); ctx.emissive(null);
  },
  tent(ctx, p, s, P) {
    const w = p.w ?? 3.8, L = p.l ?? 4.4, H = p.h ?? 2.7, hw = w / 2, hl = L / 2;
    P("cdn/texture-red-and-cream-striped-canvas-awning.png", p.tint ?? "oklch(0.95 0.02 30)", 0.95);
    quadN(ctx, [-hw, 0, -hl], [0, H, -hl], [0, H, hl], [-hw, 0, hl], [-H, hw, 0]);
    quadN(ctx, [hw, 0, -hl], [0, H, -hl], [0, H, hl], [hw, 0, hl], [H, hw, 0]);
    triN(ctx, [-hw, 0, hl], [hw, 0, hl], [0, H, hl], [0, 0, 1]);
    if (s) return;
    for (const sd of [-1, 1]) triN(ctx, [0, H, -hl], [sd * hw, 0, -hl], [sd * (hw + 0.5), 0.15, -hl + 0.7], [sd, 0.3, -1]); // flaps tied back
    P(WOOD, "oklch(0.92 0.02 60)", 0.85);
    for (const z of [-hl - 0.05, hl + 0.05]) cyl(ctx, 0, 0, z, 0.06, 0.05, H + 0.35, 6);
    boxR(ctx, [0, H + 0.03, 0], [0.09, 0.09, L + 0.3]);
    for (const sd of [-1, 1]) for (const z of [-hl, hl]) boxR(ctx, [sd * (hw + 0.25), 0.1, z], [0.06, 0.4, 0.06], { roll: sd * 20 });
    P("cdn/texture-woven-red-wool-kilim-rug.png", "oklch(0.92 0.04 40)", 0.95);
    box(ctx, -hw * 0.62, 0.0, -hl + 0.4, hw * 0.62, 0.04, hl - 0.25);
    ctx.albedo(null); ctx.color("oklch(0.6 0.12 60)"); ctx.roughness(0.9);
    blob(ctx, -0.6, 0.18, hl - 0.6, 0.35, 0.16, 0.3, 3, 0.1, 4, 7); blob(ctx, 0.55, 0.18, hl - 0.7, 0.35, 0.16, 0.3, 4, 0.1, 4, 7);
  },
  gate(ctx, p, s, P) {
    P(SANDST, "oklch(0.95 0.03 75)", 0.9);
    for (const sd of [-1, 1]) {
      box(ctx, sd * 3.8 - 1.3, -3, -1.3, sd * 3.8 + 1.3, 8.6, 1.3);
      if (!s) { box(ctx, sd * 3.8 - 1.6, 8.0, -1.6, sd * 3.8 + 1.6, 8.6, 1.6); for (const y of [2.2, 5.2]) box(ctx, sd * 3.8 - 1.4, y, -1.4, sd * 3.8 + 1.4, y + 0.3, 1.4); }
    }
    box(ctx, -6.2, 8.6, -1.5, 6.2, 10.0, 1.5);
    if (!s) {
      box(ctx, -6.6, 10.0, -1.7, 6.6, 10.4, 1.7);
      box(ctx, -1.5, 10.4, -1.2, 1.5, 11.0, 1.2);
      ctx.albedo(null); ctx.color("oklch(0.8 0.12 85)"); ctx.metalness(0.9); ctx.roughness(0.35);
      for (const z of [-1.55, 1.55]) {
        blob(ctx, 0, 9.3, z, 0.6, 0.6, 0.12, 5, 0.02, 4, 10);
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; boxR(ctx, [Math.cos(a) * 0.95, 9.3 + Math.sin(a) * 0.55, z], [0.4, 0.07, 0.06], { roll: a * 57.3 }); }
      }
      ctx.metalness(0);
    }
    P(SAND, "oklch(0.95 0.035 80)", 1);
    blob(ctx, 7.5, -1.4, 2.5, 10, 4.2, 9, 81, 0.05, s ? 6 : 9, s ? 10 : 16); // the dune swallowing the east pylon
    blob(ctx, -7, -1.6, -3, 6.5, 2.8, 6, 82, 0.06, s ? 5 : 8, s ? 8 : 14);
  },
  rootarch(ctx, p, s, P) {
    const span = p.span ?? 12, top = p.top ?? 5.6, n = s ? 8 : 18;
    P(TWIST, "oklch(0.82 0.02 60)", 0.95);
    const pts = [], rad = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([-span / 2 + span * t, -1.4 + (top + 1.4) * Math.sin(Math.PI * t), Math.sin(t * Math.PI * 2) * 1.1]); rad.push(1.6 - 0.75 * Math.sin(Math.PI * t)); }
    tube(ctx, pts, rad, s ? 6 : 12);
    if (s) return;
    const tw = pts.map((q, i) => { const a = (i / n) * Math.PI * 5; return [q[0], q[1] + Math.cos(a) * (rad[i] + 0.15), q[2] + Math.sin(a) * (rad[i] + 0.15)]; });
    tube(ctx, tw, tw.map((_, i) => 0.42 - 0.18 * Math.sin(Math.PI * (i / n))), 7);
    ctx.albedo("cdn/texture-thick-green-forest-moss.png"); ctx.color("oklch(0.85 0.07 140)");
    for (let i = 3; i < n - 2; i += 2) blob(ctx, pts[i][0], pts[i][1] + rad[i] * 0.8, pts[i][2], rad[i] * 0.8, 0.3, rad[i] * 0.7, i, 0.25, 4, 7);
    ctx.albedo(null); ctx.color("oklch(0.9 0.06 200)"); ctx.emissive(0.4, 1.6, 2.0);
    for (let i = 2; i < n - 1; i += 3) for (const sd of [-1, 1]) blob(ctx, pts[i][0], pts[i][1] - 0.2 + (i % 2) * 0.3, pts[i][2] + sd * rad[i] * 0.95, 0.16, 0.06, 0.16, i + sd, 0.1, 3, 6);
    ctx.emissive(null);
  },
  roots(ctx, p, s, P) {
    const N = p.n ?? 9, R = p.reach ?? 13;
    P(TWIST, "oklch(0.82 0.02 60)", 0.95);
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI * 2 + Math.sin(k * 7.3) * 0.2, len = R * (0.75 + 0.25 * Math.abs(Math.sin(k * 3.1))), m = s ? 5 : 10;
      const pts = [], rad = [];
      for (let i = 0; i <= m; i++) {
        const t = i / m, a = a0 + Math.sin(t * 3 + k) * 0.12, r = 1.8 + len * t;
        pts.push([Math.cos(a) * r, 6.5 * Math.pow(1 - t, 1.8) - 0.9, Math.sin(a) * r]); rad.push(2.0 * (1 - t) + 0.25);
      }
      tube(ctx, pts, rad, s ? 6 : 10);
      if (!s) { ctx.albedo(null); ctx.color("oklch(0.9 0.06 200)"); ctx.emissive(0.4, 1.5, 1.9);
        for (const t of [0.55, 0.75]) { const i = Math.round(t * m); blob(ctx, pts[i][0], pts[i][1] + rad[i] * 0.6, pts[i][2], 0.18, 0.07, 0.18, k + t, 0.1, 3, 6); }
        ctx.emissive(null); P(TWIST, "oklch(0.82 0.02 60)", 0.95); }
    }
  },
};
function build(ctx, s, paint = !s) {
  const p = ctx.params || {};
  const P = (tex, col, r = 0.9, m = 0) => { if (!paint) return; ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); };
  (K[p.kind] || K.stone)(ctx, p, s, P);
}
export function geometry(ctx) { ctx.flat(); const far = (ctx.lod || 1) >= 4; build(ctx, far, true); } // levels 4–5: the solid outline alone, still painted
export function collider(ctx) { build(ctx, true); }
