// Emberstone Cradle set pieces (Kharic origin KHA-01..08). params.kind: chisel | pillar | hammer | token | board | tuning | shard | seal | lintel | shrine
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const ASHLAR = T("chiselled-red-sandstone-ashlar-block"), WOOD = T("dark-oak-timber-beam-hand-painted"), IRON = T("rusted-black-iron-hammered"), BASALT = T("dark-volcanic-basalt-blocks");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glowCut = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const K = {
  chisel(ctx) { // a novice chisel on a split stump-bench
    P(ctx, WOOD, "oklch(0.6 0.05 55)"); box(ctx, -0.5, 0, -0.3, 0.5, 0.7, 0.3);
    P(ctx, IRON, "oklch(0.5 0.01 60)", 0.5, 0.8); boxR(ctx, [0.05, 0.74, 0], [0.34, 0.04, 0.05], { yaw: 20 });
    P(ctx, WOOD, "oklch(0.5 0.06 50)"); boxR(ctx, [-0.2, 0.74, 0.08], [0.2, 0.05, 0.06], { yaw: 20 });
    P(ctx, IRON, "oklch(0.45 0.01 60)", 0.6, 0.7); boxR(ctx, [0.2, 0.76, -0.15], [0.12, 0.08, 0.1], { yaw: -30 });
  },
  pillar(ctx, q) { // a squat ashlar pillar split by a crack that glows faintly silver along letter-shaped lines
    P(ctx, ASHLAR, "oklch(0.72 0.07 40)"); cyl(ctx, 0, 0, 0, 0.75, 0.7, 0.4, 8); 
    for (let i = 0; i < 5; i++) boxR(ctx, [(q() - 0.5) * 0.05, 0.4 + i * 0.62 + 0.3, 0], [1.0 - i * 0.03, 0.58, 1.0 - i * 0.03], { yaw: (q() - 0.5) * 6 });
    glowCut(ctx, "oklch(0.9 0.02 250)", [0.7, 0.8, 1.1]);
    let y = 0.5, x = 0; for (let i = 0; i < 7; i++) { const nx = x + (q() - 0.5) * 0.3, ny = y + 0.35 + q() * 0.15; boxR(ctx, [(x + nx) / 2, (y + ny) / 2, -0.505], [0.035, Math.hypot(nx - x, ny - y), 0.01], { roll: Math.atan2(nx - x, ny - y) * -57.3 }); x = nx; y = ny; }
  },
  hammer(ctx) { // a tuning hammer on a little iron stand
    P(ctx, IRON, "oklch(0.45 0.01 60)", 0.5, 0.8); box(ctx, -0.25, 0, -0.2, 0.25, 0.06, 0.2); cyl(ctx, 0, 0.06, 0, 0.03, 0.03, 0.9, 6);
    P(ctx, null, "oklch(0.78 0.1 75)", 0.3, 0.9); boxR(ctx, [0, 0.98, 0], [0.32, 0.1, 0.1], {});
    P(ctx, WOOD, "oklch(0.55 0.06 55)"); boxR(ctx, [0.05, 0.75, 0.1], [0.04, 0.45, 0.04], { roll: 12 });
  },
  token(ctx) { // a brass shift token, stamped, on a scrap of red cloth
    P(ctx, null, "oklch(0.45 0.12 30)", 1); boxR(ctx, [0, 0.01, 0], [0.4, 0.015, 0.3], { yaw: 15 });
    P(ctx, null, "oklch(0.78 0.12 80)", 0.3, 0.9); cyl(ctx, 0, 0.02, 0, 0.09, 0.09, 0.025, 10);
  },
  board(ctx) { // the shift roster: a timber frame with nail-hung tags, a gap where a whole crew was
    P(ctx, WOOD, "oklch(0.55 0.05 55)"); box(ctx, -1.15, 0, -0.08, -1.0, 2.2, 0.08); box(ctx, 1.0, 0, -0.08, 1.15, 2.2, 0.08); box(ctx, -1.15, 2.2, -0.12, 1.15, 2.35, 0.12);
    P(ctx, WOOD, "oklch(0.68 0.04 70)"); box(ctx, -1.0, 0.9, -0.03, 1.0, 2.1, 0.03);
    P(ctx, null, "oklch(0.88 0.03 85)", 0.9); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { if (r === 2 && c > 1 && c < 5) continue; box(ctx, -0.85 + c * 0.3, 1.0 + r * 0.27, -0.05, -0.65 + c * 0.3, 1.18 + r * 0.27, -0.04); }
  },
  tuning(ctx, q) { // a waist-high basalt stone with a ring of brass and a seam that lights when struck
    P(ctx, BASALT, "oklch(0.5 0.02 40)", 0.9); blob(ctx, 0, 0.6, 0, 0.45, 0.65, 0.4, 3, 0.18);
    P(ctx, null, "oklch(0.75 0.11 75)", 0.3, 0.9); cyl(ctx, 0, 0.85, 0, 0.47, 0.47, 0.08, 12, false);
    glowCut(ctx, "oklch(0.88 0.08 300)", [1.2, 0.8, 2.2]); boxR(ctx, [0, 0.6, -0.4], [0.05, 0.8, 0.04], {});
  },
  shard(ctx) { // a fist of bellglass on the anvil's horn: violet, faceted, humming
    glowCut(ctx, "oklch(0.8 0.14 300)", [1.6, 0.9, 2.8]); ctx.roughness(0.1);
    for (let i = 0; i < 4; i++) boxR(ctx, [Math.cos(i * 1.6) * 0.05, 0.12, Math.sin(i * 1.6) * 0.05], [0.07, 0.24 - i * 0.03, 0.07], { pitch: 12 + i * 8, yaw: i * 90 });
  },
  seal(ctx) { // a rust-red nine-pointed iron seal half-embedded in a fallen block
    P(ctx, ASHLAR, "oklch(0.6 0.06 40)"); boxR(ctx, [0, 0.45, 0], [1.4, 0.9, 1.0], { roll: 4 });
    P(ctx, IRON, "oklch(0.42 0.08 40)", 0.7, 0.6); cyl(ctx, 0, 0.45, -0.52, 0.32, 0.32, 0.06, 18, true);
    for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9; boxR(ctx, [Math.cos(a) * 0.38, 0.45 + Math.sin(a) * 0.38, -0.53], [0.06, 0.14, 0.04], { roll: -a * 57.3 + 90 }); }
  },
  lintel(ctx) { // two dressed posts and a new pale lintel, blank, waiting for names
    P(ctx, ASHLAR, "oklch(0.7 0.07 40)"); box(ctx, -1.6, 0, -0.35, -1.0, 2.6, 0.35); box(ctx, 1.0, 0, -0.35, 1.6, 2.6, 0.35);
    P(ctx, null, "oklch(0.86 0.03 80)", 0.8); box(ctx, -1.9, 2.6, -0.4, 1.9, 3.2, 0.4);
    P(ctx, IRON, "oklch(0.4 0.01 60)", 0.6, 0.7); box(ctx, -1.7, 2.75, -0.42, -1.55, 3.05, -0.4);
  },
  shrine(ctx, q) { // the miners' shrine: a stacked cairn, chisels laid at its foot, a lamp niche
    P(ctx, BASALT, "oklch(0.48 0.02 40)", 0.9); for (let i = 0; i < 6; i++) blob(ctx, (q() - 0.5) * 0.2, 0.25 + i * 0.36, (q() - 0.5) * 0.2, 0.7 - i * 0.09, 0.22, 0.6 - i * 0.08, i + 2, 0.2, 4, 7);
    P(ctx, IRON, "oklch(0.45 0.01 60)", 0.5, 0.8); for (let i = 0; i < 4; i++) boxR(ctx, [-0.5 + i * 0.3, 0.03, -0.75], [0.04, 0.03, 0.32], { yaw: (q() - 0.5) * 40 });
    glowCut(ctx, "oklch(0.85 0.12 70)", [3.5, 2, 0.7]); blob(ctx, 0, 1.55, -0.32, 0.07, 0.09, 0.07, 1, 0.1, 3, 5);
  },
};
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat(); if ((ctx.lod || 1) >= 4) { if (["token", "shard", "hammer", "chisel"].includes(p.kind)) return; P(ctx, null, p.kind === "lintel" || p.kind === "board" ? "oklch(0.6 0.05 50)" : "oklch(0.5 0.03 40)"); const hh = { pillar: 3.4, lintel: 3.2, board: 2.3, shrine: 2, seal: 0.9, tuning: 1.2 }[p.kind] || 1; box(ctx, -0.6, 0, -0.5, 0.6, hh, 0.5); return; } (K[p.kind] || K.token)(ctx, rng((ctx.seed ?? 1) + 5)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind; if (k === "pillar") cyl(ctx, 0, 0, 0, 0.6, 0.6, 3.4, 8); else if (k === "lintel" || k === "board" || k === "seal" || k === "shrine") return undefined; else return null; }
