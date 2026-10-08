// Rootwake Glade set pieces (Thren origin THR-01..08). params.kind: handroot | stump | bowl | lectern | seedling | hollow | seed | leaf
import { box, boxR, cyl, blob } from "./shape.js";
const BARK = "cdn/texture-dark-gnarled-oak-bark.png", WOOD = "cdn/texture-weathered-oak-planks.png", STONE = "cdn/texture-mossy-fieldstone.png";
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
// a bent tube of rings from a list of points (a root, a finger)
function tube(ctx, pts, r0, r1, seg = 6) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1);
    const ra = r0 + (r1 - r0) * t0, rb = r0 + (r1 - r0) * t1, h = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]) * 180 / Math.PI, pitch = Math.acos(Math.max(-1, Math.min(1, (b[1] - a[1]) / (h || 1)))) * 180 / Math.PI;
    boxR(ctx, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [ra + rb, h + Math.min(ra, rb), ra + rb], { yaw, pitch });
  }
}
const K = {
  handroot(ctx, q) { // a palm half-sunk in soil, five knuckled fingers pressed down and out
    ctx.albedo(BARK); ctx.color("oklch(0.62 0.04 70)"); ctx.roughness(0.95);
    blob(ctx, 0, 0.12, 0, 0.32, 0.16, 0.38, 3, 0.2);
    for (let f = 0; f < 5; f++) {
      const a = (-60 + f * 30) * Math.PI / 180, thumb = f === 0, L = thumb ? 0.45 : 0.6 + q() * 0.15;
      const dx = Math.sin(a), dz = -Math.cos(a), b = [dx * 0.25, 0.18, dz * 0.25];
      const k1 = [b[0] + dx * L * 0.45, 0.32, b[2] + dz * L * 0.45], k2 = [b[0] + dx * L * 0.8, 0.22, b[2] + dz * L * 0.8], tip = [b[0] + dx * L, 0.02, b[2] + dz * L];
      tube(ctx, [b, k1, k2, tip], 0.075, 0.035, 6);
    }
    ctx.albedo(null); ctx.color("oklch(0.92 0.03 90)"); ctx.emissive(0.5, 0.5, 0.4);
    for (let i = 0; i < 4; i++) blob(ctx, (q() - 0.5) * 0.5, 0.29, (q() - 0.5) * 0.3, 0.025, 0.02, 0.025, i, 0.2, 3, 4);
    ctx.emissive(null);
  },
  stump(ctx, q) {
    ctx.albedo(BARK); ctx.color("oklch(0.55 0.04 60)"); ctx.roughness(0.95);
    cyl(ctx, 0, 0, 0, 0.75, 0.62, 0.9, 12, false);
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + q(); tube(ctx, [[Math.cos(a) * 0.6, 0.35, Math.sin(a) * 0.6], [Math.cos(a) * 1.1, 0.1, Math.sin(a) * 1.1], [Math.cos(a) * 1.5, -0.05, Math.sin(a) * 1.5]], 0.16, 0.06); }
    ctx.albedo(null); ctx.color("oklch(0.74 0.06 75)"); cyl(ctx, 0, 0.88, 0, 0.62, 0.62, 0.03, 12, true);
    ctx.color("oklch(0.5 0.05 70)"); for (let r = 0.15; r < 0.6; r += 0.12) cyl(ctx, 0, 0.905, 0, r, r, 0.005, 14, false);
  },
  bowl(ctx) {
    ctx.albedo(STONE); ctx.color("oklch(0.72 0.03 120)"); ctx.roughness(0.9);
    cyl(ctx, 0, 0, 0, 0.4, 0.3, 0.55, 10); cyl(ctx, 0, 0.55, 0, 0.35, 0.65, 0.28, 14, false);
    ctx.albedo(null); ctx.color("oklch(0.55 0.08 220)"); ctx.roughness(0.1); ctx.metalness(0.2); cyl(ctx, 0, 0.76, 0, 0.6, 0.6, 0.02, 14, true); ctx.metalness(0);
  },
  lectern(ctx) {
    ctx.albedo(WOOD); ctx.color("oklch(0.62 0.05 60)"); ctx.roughness(0.85);
    box(ctx, -0.25, 0, -0.2, 0.25, 0.08, 0.2); cyl(ctx, 0, 0.08, 0, 0.08, 0.06, 1.0, 8);
    boxR(ctx, [0, 1.12, 0], [0.62, 0.05, 0.44], { pitch: -25 });
    ctx.albedo(null); ctx.color("oklch(0.93 0.03 90)"); boxR(ctx, [0, 1.15, 0.01], [0.5, 0.02, 0.34], { pitch: -25 });
  },
  seedling(ctx, q) {
    ctx.albedo(null); ctx.color("oklch(0.42 0.05 60)"); ctx.roughness(1); cyl(ctx, 0, 0, 0, 0.5, 0.55, 0.12, 12);
    ctx.color("oklch(0.5 0.06 110)"); tube(ctx, [[0, 0.1, 0], [0.03, 0.4, 0], [-0.02, 0.7, 0.02]], 0.03, 0.015, 5);
    ctx.color("oklch(0.72 0.16 135)"); for (let i = 0; i < 6; i++) { const a = i * 1.05, y = 0.35 + i * 0.06; boxR(ctx, [Math.cos(a) * 0.09, y, Math.sin(a) * 0.09], [0.16, 0.01, 0.07], { yaw: -a * 57.3, roll: 20 }); }
    ctx.color("oklch(0.98 0.02 90)"); ctx.emissive(0.6, 0.6, 0.55); blob(ctx, -0.02, 0.73, 0.02, 0.04, 0.04, 0.04, 2, 0.1, 3, 5); ctx.emissive(null);
  },
  hollow(ctx, q) { // a root arch over a dark mouth in the soil, roots as a stair down
    ctx.albedo(BARK); ctx.color("oklch(0.5 0.04 60)"); ctx.roughness(0.95);
    for (let s = -1; s <= 1; s += 2) tube(ctx, [[s * 1.4, -0.1, 0.3], [s * 1.3, 1.4, 0], [s * 0.6, 2.4, -0.1], [0, 2.6, -0.1]], 0.3, 0.18, 7);
    for (let i = 0; i < 4; i++) tube(ctx, [[-1.1, -0.1 - i * 0.25, -0.2 - i * 0.55], [1.1, -0.1 - i * 0.25, -0.2 - i * 0.55]], 0.12, 0.12, 6);
    ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)"); ctx.roughness(1); box(ctx, -1.15, -0.02, -2.6, 1.15, 0.0, 0.2);
  },
  seed(ctx) { ctx.albedo(null); ctx.color("oklch(0.96 0.03 95)"); ctx.emissive(0.9, 0.85, 0.6); blob(ctx, 0, 0.08, 0, 0.07, 0.09, 0.07, 1, 0.15, 4, 6); ctx.emissive(null); ctx.color("oklch(0.4 0.05 70)"); cyl(ctx, 0, 0, 0, 0.25, 0.3, 0.04, 10); },
  leaf(ctx) { ctx.albedo(null); ctx.color("oklch(0.7 0.13 70)"); ctx.roughness(0.8); boxR(ctx, [0, 0.03, 0], [0.36, 0.01, 0.2], { yaw: 20, roll: 6 }); ctx.color("oklch(0.35 0.05 60)"); boxR(ctx, [0, 0.04, 0], [0.32, 0.012, 0.012], { yaw: 20, roll: 6 }); },
};
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat(); (K[p.kind] || K.stump)(ctx, rng((ctx.seed ?? 1) + 11)); }
export function collider(ctx) { const k = (ctx.params || {}).kind; if (k === "stump") cyl(ctx, 0, 0, 0, 0.7, 0.7, 0.9, 8); else if (k === "lectern" || k === "bowl") box(ctx, -0.3, 0, -0.25, 0.3, 1.1, 0.25); else return null; }
