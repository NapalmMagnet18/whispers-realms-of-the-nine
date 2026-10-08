// Breakwater Strand set pieces (Namar origin NAM-01..08, Gullrest). params.kind:
// tidepost | shell | conch | lamp | wreck | pool | chart | buoy | fishspot | skiff
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const WOOD = T("weathered-wood-planks-grey"), OAK = T("dark-oak-timber-beam-hand-painted"), IRON = T("rusted-black-iron-hammered"), STONE = T("rough-fieldstone-wall-mossy"), ROPE = T("twisted-hemp-rope");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const K = {
  tidepost(ctx, q) { // a barnacled marker post, painted rings, a brass tide notch
    P(ctx, WOOD, "oklch(0.62 0.02 230)"); cyl(ctx, 0, 0, 0, 0.14, 0.12, 2.4, 7, true, 0.02);
    for (let i = 0; i < 4; i++) { P(ctx, null, i % 2 ? "oklch(0.92 0.02 90)" : "oklch(0.5 0.15 28)", 0.7); cyl(ctx, 0, 0.9 + i * 0.25, 0, 0.15, 0.15, 0.12, 8, false); }
    P(ctx, null, "oklch(0.78 0.11 80)", 0.3, 0.9); box(ctx, -0.04, 1.6, -0.17, 0.04, 1.66, -0.13);
    P(ctx, null, "oklch(0.75 0.02 100)", 1); for (let i = 0; i < 9; i++) { const a = q() * 6.28, y = q() * 0.6; blob(ctx, Math.cos(a) * 0.14, y + 0.05, Math.sin(a) * 0.14, 0.04, 0.03, 0.04, i, 0.3, 3, 4); }
  },
  shell(ctx, q) { // a big spiral whelk, pale and pink inside, half in the sand
    P(ctx, null, "oklch(0.88 0.04 60)", 0.5); for (let i = 0; i < 5; i++) blob(ctx, i * 0.05, 0.06 + i * 0.03, 0, 0.16 - i * 0.028, 0.1 - i * 0.015, 0.14 - i * 0.025, i + 1, 0.12, 4, 7);
    glow(ctx, "oklch(0.8 0.09 10)", [0.3, 0.15, 0.2]); blob(ctx, -0.12, 0.07, -0.02, 0.06, 0.05, 0.08, 9, 0.1, 3, 5);
  },
  conch(ctx) { // a driftwood stand holding a great hollow conch, mouth outward
    P(ctx, WOOD, "oklch(0.66 0.02 70)"); box(ctx, -0.4, 0, -0.3, 0.4, 0.9, 0.3);
    P(ctx, null, "oklch(0.9 0.04 70)", 0.45); for (let i = 0; i < 6; i++) blob(ctx, -0.25 + i * 0.09, 1.08 + Math.sin(i) * 0.03, 0, 0.28 - i * 0.04, 0.18 - i * 0.022, 0.2 - i * 0.026, i + 3, 0.1, 4, 8);
    glow(ctx, "oklch(0.82 0.1 15)", [0.6, 0.3, 0.35]); blob(ctx, -0.36, 1.08, 0, 0.08, 0.13, 0.14, 2, 0.05, 3, 6);
  },
  lamp(ctx) { // a coastal lamp: stone foot, iron cage, a cold wick (the fx lights it)
    P(ctx, STONE, "oklch(0.62 0.02 120)"); blob(ctx, 0, 0.3, 0, 0.5, 0.35, 0.5, 4, 0.2, 4, 7);
    P(ctx, IRON, "oklch(0.36 0.01 60)", 0.6, 0.7); cyl(ctx, 0, 0.55, 0, 0.07, 0.06, 1.8, 6);
    box(ctx, -0.26, 2.3, -0.26, 0.26, 2.36, 0.26); for (const [x, z] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) box(ctx, x - 0.02, 2.36, z - 0.02, x + 0.02, 2.8, z + 0.02);
    cyl(ctx, 0, 2.8, 0, 0.32, 0.05, 0.25, 4); P(ctx, null, "oklch(0.85 0.05 80)", 0.2); cyl(ctx, 0, 2.36, 0, 0.12, 0.1, 0.16, 8);
  },
  wreck(ctx, q) { // a gutted skiff on its side, ribs showing, glass glinting in the bilge
    P(ctx, WOOD, "oklch(0.5 0.02 60)");
    for (let i = 0; i < 7; i++) { const z = -2.1 + i * 0.7, w = 1.1 - Math.abs(i - 3) * 0.16; boxR(ctx, [0, 0.35, z], [0.12, 1.4 * w, 0.12], { roll: 70 }); boxR(ctx, [w * 0.55, 0.9 * w, z], [0.1, 0.9 * w, 0.1], { roll: 10 }); }
    for (let i = 0; i < 3; i++) boxR(ctx, [-0.2 + i * 0.25, 0.12 + i * 0.25, 0], [0.04, 0.28, 4.4 - i * 0.6], { roll: 70 - i * 20 });
    P(ctx, OAK, "oklch(0.42 0.03 50)"); boxR(ctx, [0.2, 0.15, 0], [0.15, 0.15, 4.6], {});
    glow(ctx, "oklch(0.86 0.08 200)", [0.6, 1.2, 1.5]); boxR(ctx, [0.15, 0.32, 0.6], [0.12, 0.05, 0.09], { yaw: 30, roll: 20 });
  },
  pool(ctx, q) { // a ring of wet rocks holding a still tide pool
    P(ctx, STONE, "oklch(0.5 0.02 200)", 0.6); for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28; blob(ctx, Math.cos(a) * 1.5, 0.15, Math.sin(a) * 1.2, 0.35 + q() * 0.2, 0.22 + q() * 0.1, 0.35, i, 0.3, 4, 6); }
    glow(ctx, "oklch(0.55 0.08 210)", [0.05, 0.12, 0.16]); ctx.roughness(0.05); cyl(ctx, 0, 0.1, 0, 1.4, 1.4, 0.04, 16);
  },
  chart(ctx) { // Ruun's chart table: driftwood trestle, a pinned sea chart, compass rose, a lamp
    P(ctx, OAK, "oklch(0.52 0.05 55)"); box(ctx, -0.9, 0.82, -0.55, 0.9, 0.9, 0.55); for (const x of [-0.8, 0.8]) for (const z of [-0.45, 0.45]) box(ctx, x - 0.05, 0, z - 0.05, x + 0.05, 0.82, z + 0.05);
    P(ctx, null, "oklch(0.88 0.04 85)", 0.9); box(ctx, -0.7, 0.9, -0.42, 0.7, 0.91, 0.42);
    P(ctx, null, "oklch(0.45 0.08 240)", 0.9); for (let i = 0; i < 5; i++) box(ctx, -0.6 + i * 0.25, 0.911, -0.3 + (i % 2) * 0.2, -0.5 + i * 0.25, 0.913, -0.05 + (i % 2) * 0.3);
    P(ctx, null, "oklch(0.78 0.11 80)", 0.3, 0.9); cyl(ctx, 0.35, 0.91, 0.15, 0.12, 0.12, 0.03, 12);
    glow(ctx, "oklch(0.85 0.08 200)", [0.4, 0.9, 1.1]); boxR(ctx, [0.35, 0.95, 0.15], [0.02, 0.01, 0.2], { yaw: 35 });
  },
  buoy(ctx) { // a ferry-lane buoy: red-and-white float, little iron lantern cage on top
    P(ctx, null, "oklch(0.55 0.17 28)", 0.6); cyl(ctx, 0, -0.3, 0, 0.45, 0.55, 0.7, 10); P(ctx, null, "oklch(0.92 0.02 90)", 0.6); cyl(ctx, 0, 0.4, 0, 0.3, 0.45, 0.35, 10);
    P(ctx, IRON, "oklch(0.35 0.01 60)", 0.6, 0.7); cyl(ctx, 0, 0.75, 0, 0.05, 0.05, 0.6, 5); box(ctx, -0.12, 1.35, -0.12, 0.12, 1.6, 0.12);
    glow(ctx, "oklch(0.88 0.1 80)", [2.5, 1.6, 0.6]); box(ctx, -0.07, 1.38, -0.07, 0.07, 1.55, 0.07);
  },
  fishspot(ctx) { // a pier-end rod rest: a forked stake, a coiled line, a bucket
    P(ctx, WOOD, "oklch(0.6 0.02 70)"); boxR(ctx, [0, 0.45, 0], [0.06, 0.9, 0.06], { pitch: -25 }); boxR(ctx, [0, 1.25, -0.6], [0.025, 1.6, 0.025], { pitch: -55 });
    P(ctx, OAK, "oklch(0.5 0.04 55)"); cyl(ctx, 0.45, 0, 0.2, 0.18, 0.15, 0.32, 9);
    P(ctx, ROPE, "oklch(0.75 0.05 85)"); cyl(ctx, -0.35, 0, 0.25, 0.14, 0.14, 0.08, 9);
  },
  skiff(ctx, q) { // a small skiff jammed on the rocks, bow high, one oar gone
    P(ctx, WOOD, "oklch(0.65 0.05 230)"); for (let i = 0; i < 5; i++) { const z = -1.4 + i * 0.7, w = 0.75 - Math.abs(i - 2) * 0.18; boxR(ctx, [0, 0.25 + i * 0.06, z], [w * 2, 0.08, 0.72], {}); boxR(ctx, [-w, 0.45 + i * 0.06, z], [0.07, 0.42, 0.72], { roll: -15 }); boxR(ctx, [w, 0.45 + i * 0.06, z], [0.07, 0.42, 0.72], { roll: 15 }); }
    P(ctx, OAK, "oklch(0.5 0.04 55)"); boxR(ctx, [0.3, 0.75, 0.2], [0.05, 0.05, 2.2], { yaw: 20, pitch: 8 });
    P(ctx, STONE, "oklch(0.48 0.02 200)"); blob(ctx, 0.2, 0.15, -1.6, 0.8, 0.45, 0.6, 3, 0.3, 4, 7);
  },
};
const HH = { tidepost: 2.4, lamp: 2.9, wreck: 1.3, chart: 1, buoy: 1.6, conch: 1.3, skiff: 0.9, pool: 0.4 };
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat();
  if ((ctx.lod || 1) >= 4) { if (p.kind === "shell" || p.kind === "fishspot") return; P(ctx, null, "oklch(0.55 0.02 200)"); const h = HH[p.kind] || 1, w = p.kind === "wreck" ? 1 : 0.4; box(ctx, -w, 0, -w * 2, w, h, w * 2); return; }
  (K[p.kind] || K.shell)(ctx, rng((ctx.seed ?? 1) + 11)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind; if (k === "tidepost") cyl(ctx, 0, 0, 0, 0.16, 0.16, 2.4, 6); else if (k === "lamp" || k === "chart" || k === "conch" || k === "wreck" || k === "skiff" || k === "buoy") return undefined; else return null; }
