// The Quiet Observatory (Arcanist path ARC-01..07, on the Reach's north-west shoulder above the river). params.kind:
// tower | echo | lamp | forge | desk | sigil | plinth | bench
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const STONE = T("pale-limestone-ashlar-blocks-weathered"), OAK = T("dark-oak-timber-beam-hand-painted"), IRON = T("rusted-black-iron-hammered"), SLATE = T("dark-slate-roof-tiles");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const BRASS = "oklch(0.74 0.11 80)";
const K = {
  tower(ctx, q) { // an eight-sided limestone tower, a ring of tall windows, a brass dome cracked open to the sky, a brass telescope
    P(ctx, STONE, "oklch(0.82 0.03 85)"); cyl(ctx, 0, 0, 0, 4.4, 4.6, 0.6, 8); cyl(ctx, 0, 0.6, 0, 3.6, 3.8, 7.4, 8);
    P(ctx, STONE, "oklch(0.74 0.03 80)"); cyl(ctx, 0, 3.6, 0, 3.9, 3.9, 0.3, 8); cyl(ctx, 0, 8.0, 0, 4.0, 4.0, 0.45, 8);
    glow(ctx, "oklch(0.86 0.1 80)", [1.6, 1.1, 0.5]);
    for (let i = 0; i < 8; i++) { if (i === 0) continue; const a = (i + 0.5) / 8 * 6.283; boxR(ctx, [Math.sin(a) * 3.66, 5.6, Math.cos(a) * 3.66], [0.5, 1.5, 0.05], { yaw: a * 57.3 }); }
    P(ctx, OAK, "oklch(0.42 0.05 50)"); boxR(ctx, [0, 1.6, 3.62], [1.3, 2.2, 0.12], {});
    P(ctx, STONE, "oklch(0.7 0.03 80)"); boxR(ctx, [0, 2.85, 3.68], [1.7, 0.3, 0.2], {}); box(ctx, -1.3, 0, 3.6, 1.3, 0.3, 5.2); box(ctx, -1.1, 0, 5.2, 1.1, 0.15, 6.0);
    P(ctx, null, BRASS, 0.35, 0.85); for (let i = 0; i < 6; i++) { const t = i / 6, r = 3.6 * Math.cos(t * 1.4), y = 8.45 + 3.2 * Math.sin(t * 1.4); cyl(ctx, 0, y, 0, r, 3.6 * Math.cos((t + 1 / 6) * 1.4), 3.2 * (Math.sin((t + 1 / 6) * 1.4) - Math.sin(t * 1.4)), 12, false); }
    glow(ctx, "oklch(0.25 0.04 270)", [0.05, 0.05, 0.12]); boxR(ctx, [0, 10.4, 0.6], [1.0, 3.2, 3.6], { pitch: -35 });
    P(ctx, null, BRASS, 0.3, 0.9); cyl(ctx, 0, 11.0, 0, 0.35, 0.35, 0.4, 10); boxR(ctx, [0, 12.2, 1.1], [0.36, 0.36, 3.4], { pitch: 40 });
    P(ctx, null, "oklch(0.35 0.03 260)", 0.4, 0.6); boxR(ctx, [0, 13.3, 2.4], [0.46, 0.46, 0.3], { pitch: 40 });
  },
  echo(ctx, q) { // a memory echo: a small ring of standing stones around a hovering pale light
    P(ctx, STONE, "oklch(0.7 0.02 80)"); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; boxR(ctx, [Math.cos(a) * 0.9, 0.35, Math.sin(a) * 0.9], [0.22, 0.7 + q() * 0.3, 0.18], { yaw: -a * 57.3, roll: (q() - 0.5) * 10 }); }
    glow(ctx, "oklch(0.9 0.06 260)", [1.4, 1.6, 2.6]); blob(ctx, 0, 1.2, 0, 0.16, 0.2, 0.16, 3, 0.1, 4, 6);
  },
  lamp(ctx) { // a resonance lamp: a brass post, a lantern of violet glass
    P(ctx, STONE, "oklch(0.72 0.03 80)"); box(ctx, -0.35, 0, -0.35, 0.35, 0.3, 0.35);
    P(ctx, null, BRASS, 0.35, 0.85); cyl(ctx, 0, 0.3, 0, 0.06, 0.05, 1.6, 8); cyl(ctx, 0, 1.9, 0, 0.26, 0.2, 0.06, 8); cyl(ctx, 0, 2.5, 0, 0.12, 0.3, 0.12, 8);
    glow(ctx, "oklch(0.8 0.13 300)", [1.4, 0.8, 2.4]); cyl(ctx, 0, 1.96, 0, 0.18, 0.2, 0.54, 8);
  },
  forge(ctx) { // the small-star forge: a stone basin, iron hoops, a hot white heart
    P(ctx, STONE, "oklch(0.6 0.02 60)"); cyl(ctx, 0, 0, 0, 0.9, 0.7, 0.9, 10); 
    P(ctx, IRON, "oklch(0.35 0.01 60)", 0.5, 0.8); for (let i = 0; i < 3; i++) { boxR(ctx, [0, 1.6, 0], [0.06, 1.6, 1.6], { yaw: i * 60 }); }
    glow(ctx, "oklch(0.97 0.06 85)", [4, 3.4, 2.2]); blob(ctx, 0, 1.55, 0, 0.22, 0.22, 0.22, 2, 0.1, 5, 7);
  },
  desk(ctx) { // Curator Ossa's copying desk: slanted top, ink, a page that won't hold still
    P(ctx, OAK, "oklch(0.5 0.05 55)"); for (const x of [-0.6, 0.6]) box(ctx, x - 0.05, 0, -0.3, x + 0.05, 0.9, 0.3); boxR(ctx, [0, 1.0, 0], [1.4, 0.06, 0.7], { pitch: -15 });
    P(ctx, null, "oklch(0.9 0.03 85)", 0.95); boxR(ctx, [-0.2, 1.05, 0], [0.5, 0.02, 0.4], { pitch: -15, yaw: 6 });
    glow(ctx, "oklch(0.8 0.1 260)", [0.8, 1, 1.8]); boxR(ctx, [0.3, 1.06, 0.02], [0.4, 0.02, 0.36], { pitch: -15, yaw: -4 });
    P(ctx, null, "oklch(0.2 0.02 260)", 0.3); cyl(ctx, 0.6, 1.08, -0.2, 0.05, 0.05, 0.08, 6);
  },
  sigil(ctx) { // a tall slab, a half-cut sigil glowing faintly, the last line left blank
    P(ctx, STONE, "oklch(0.66 0.02 80)"); box(ctx, -0.8, 0, -0.2, 0.8, 2.4, 0.2);
    glow(ctx, "oklch(0.82 0.1 280)", [1, 0.8, 2]); for (let i = 0; i < 4; i++) box(ctx, -0.55 + (i % 2) * 0.1, 1.9 - i * 0.32, -0.21, 0.55 - (i % 3) * 0.12, 1.96 - i * 0.32, -0.2);
  },
  plinth(ctx) { // a focus-trial plinth: a fluted column, a cupped brass bowl
    P(ctx, STONE, "oklch(0.78 0.03 85)"); cyl(ctx, 0, 0, 0, 0.42, 0.42, 0.15, 10); cyl(ctx, 0, 0.15, 0, 0.26, 0.3, 0.95, 10); cyl(ctx, 0, 1.1, 0, 0.38, 0.34, 0.1, 10);
    P(ctx, null, BRASS, 0.35, 0.85); cyl(ctx, 0, 1.2, 0, 0.3, 0.18, 0.14, 12);
  },
  bench(ctx) { // a stone reading bench
    P(ctx, STONE, "oklch(0.74 0.03 85)"); box(ctx, -1.0, 0.4, -0.25, 1.0, 0.5, 0.25); box(ctx, -0.85, 0, -0.18, -0.6, 0.4, 0.18); box(ctx, 0.6, 0, -0.18, 0.85, 0.4, 0.18);
  },
};
const HH = { tower: 13, echo: 1.4, lamp: 2.6, forge: 3.2, desk: 1.1, sigil: 2.4, plinth: 1.35, bench: 0.5 };
const WW = { tower: 3.8, echo: 1, forge: 0.9 };
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat();
  if ((ctx.lod || 1) >= 4) { P(ctx, null, "oklch(0.75 0.03 80)"); const w = WW[p.kind] || 0.4; if (p.kind === "tower") cyl(ctx, 0, 0, 0, 3.8, 3.8, 8.4, 8); else box(ctx, -w, 0, -w, w, HH[p.kind] || 1, w); if (p.kind === "tower") { P(ctx, null, BRASS, 0.4, 0.8); cyl(ctx, 0, 8.4, 0, 3.6, 0.5, 3.2, 8); } return; }
  (K[p.kind] || K.plinth)(ctx, rng((ctx.seed ?? 1) + 23)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind; if (k === "tower") { cyl(ctx, 0, 0, 0, 3.8, 3.8, 8.4, 8); box(ctx, -1.3, 0, 3.6, 1.3, 0.3, 5.2); return; } if (k === "echo" || k === "desk") return null; return undefined; }
