// The Wayfarers' Lodge (Pathfinder path PAT-01..07, riverside meadow south of the farms). params.kind:
// lodge | sign | beacon | marker | lure | ropeposts | stake | tracks | trialpost
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const OAK = T("dark-oak-timber-beam-hand-painted"), STONE = T("mossy-fieldstone-wall-painted"), THATCH = T("weathered-straw-thatch-roof"), PLANK = T("weathered-wood-planks-painted");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.88, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const ROPE = "oklch(0.62 0.06 75)";
const K = {
  lodge(ctx, q) { // a long low timber lodge, fieldstone footing, thatch pulled low, antlers over the door, a porch with a bench
    P(ctx, STONE, "oklch(0.62 0.03 110)"); box(ctx, -5, 0, -3, 5, 0.6, 3);
    P(ctx, PLANK, "oklch(0.5 0.05 55)"); box(ctx, -4.8, 0.6, -2.8, 4.8, 3.0, 2.8);
    P(ctx, OAK, "oklch(0.36 0.04 50)"); for (const x of [-4.8, -1.6, 1.6, 4.8]) for (const z of [-2.8, 2.8]) box(ctx, x - 0.15, 0.6, z - 0.15, x + 0.15, 3.1, z + 0.15);
    box(ctx, -4.95, 2.9, 2.75, 4.95, 3.15, 3.0); box(ctx, -4.95, 2.9, -3.0, 4.95, 3.15, -2.75);
    P(ctx, THATCH, "oklch(0.66 0.08 80)"); for (const s of [-1, 1]) boxR(ctx, [0, 4.15, s * 1.7], [11.2, 0.4, 4.3], { pitch: s * 34 });
    P(ctx, PLANK, "oklch(0.46 0.05 55)"); for (const x of [-4.85, 4.85]) for (let i = 0; i < 4; i++) box(ctx, x - 0.1, 3.1 + i * 0.4, -2.4 + i * 0.6, x + 0.1, 3.5 + i * 0.4, 2.4 - i * 0.6);
    P(ctx, OAK, "oklch(0.3 0.04 50)"); box(ctx, -0.7, 0.6, 2.82, 0.7, 2.5, 2.92);
    glow(ctx, "oklch(0.86 0.12 75)", [1.8, 1.1, 0.4]); for (const x of [-3, 3]) box(ctx, x - 0.5, 1.4, 2.83, x + 0.5, 2.2, 2.9);
    P(ctx, PLANK, "oklch(0.52 0.05 60)"); box(ctx, -3.5, 0.45, 2.9, 3.5, 0.6, 4.6); for (const x of [-3.4, 3.4]) box(ctx, x - 0.1, 0.6, 4.4, x + 0.1, 2.9, 4.6); boxR(ctx, [0, 3.0, 3.9], [7.4, 0.12, 1.8], { pitch: 18 });
    box(ctx, 1.4, 0.6, 3.9, 3.0, 1.0, 4.3);
    P(ctx, null, "oklch(0.86 0.03 80)", 0.6); for (const s of [-1, 1]) { boxR(ctx, [s * 0.35, 5.6, 3.0], [0.07, 0.8, 0.07], { roll: s * 30 }); boxR(ctx, [s * 0.65, 5.85, 3.0], [0.06, 0.4, 0.06], { roll: s * 70 }); boxR(ctx, [s * 0.5, 5.5, 3.0], [0.05, 0.35, 0.05], { roll: s * 80 }); }
    P(ctx, STONE, "oklch(0.55 0.02 60)"); box(ctx, 3.4, 2.8, -1.4, 4.2, 6.2, -0.6);
  },
  sign(ctx, q) { // a leaning trail post with two carved arrows
    P(ctx, OAK, "oklch(0.42 0.04 55)"); boxR(ctx, [0, 1.0, 0], [0.14, 2.0, 0.14], { roll: (q() - 0.5) * 6 });
    P(ctx, PLANK, "oklch(0.58 0.05 70)"); boxR(ctx, [0.3, 1.65, 0], [0.8, 0.2, 0.05], { roll: 4 }); boxR(ctx, [-0.25, 1.35, 0.02], [0.7, 0.18, 0.05], { roll: -6, yaw: 20 });
    glow(ctx, "oklch(0.86 0.1 140)", [0.5, 1.0, 0.5]); boxR(ctx, [0.3, 1.65, 0.03], [0.4, 0.05, 0.02], { roll: 4 });
  },
  beacon(ctx, q) { // a stacked-stone cairn with a lantern hook
    P(ctx, STONE, "oklch(0.6 0.02 100)"); for (let i = 0; i < 5; i++) { const r = 0.55 - i * 0.09; blob(ctx, (q() - 0.5) * 0.08, 0.15 + i * 0.26, (q() - 0.5) * 0.08, r, 0.15, r * 0.9, 1, 0.12, 4, 6); }
    P(ctx, OAK, "oklch(0.38 0.04 55)"); box(ctx, -0.04, 1.2, -0.04, 0.04, 1.9, 0.04); box(ctx, -0.04, 1.84, -0.04, 0.3, 1.9, 0.04);
    glow(ctx, "oklch(0.86 0.13 75)", [2.4, 1.5, 0.5]); box(ctx, 0.18, 1.48, -0.08, 0.34, 1.72, 0.08);
  },
  marker(ctx, q) { // a rounded mile-stone, a number half worn
    P(ctx, STONE, "oklch(0.7 0.02 90)"); box(ctx, -0.3, 0, -0.15, 0.3, 0.8, 0.15); cyl(ctx, 0, 0.8, 0, 0.3, 0.3, 0.12, 10);
    P(ctx, null, "oklch(0.35 0.02 90)"); box(ctx, -0.15, 0.45, -0.16, 0.15, 0.62, -0.15);
  },
  lure(ctx) { // a bellglass lure: a crooked pole, a hanging bell of greenish glass, a ring of bones under it
    P(ctx, OAK, "oklch(0.33 0.03 50)"); boxR(ctx, [0, 1.2, 0], [0.1, 2.4, 0.1], { roll: 6 }); boxR(ctx, [0.35, 2.35, 0], [0.8, 0.08, 0.08], { roll: 6 });
    glow(ctx, "oklch(0.78 0.12 160)", [0.6, 1.6, 1.0]); cyl(ctx, 0.62, 1.65, 0, 0.22, 0.08, 0.5, 10);
    P(ctx, null, "oklch(0.86 0.02 85)", 0.7); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; boxR(ctx, [Math.cos(a) * 0.6, 0.04, Math.sin(a) * 0.6], [0.3, 0.06, 0.06], { yaw: a * 57.3 + 40 }); }
  },
  ropeposts(ctx) { // two driven posts and a coil of rope: where a bridge will go
    P(ctx, OAK, "oklch(0.4 0.04 55)"); for (const x of [-0.9, 0.9]) box(ctx, x - 0.1, 0, -0.1, x + 0.1, 1.3, 0.1);
    P(ctx, null, ROPE, 0.95); box(ctx, -0.9, 1.1, -0.03, 0.9, 1.16, 0.03); cyl(ctx, 0, 0, 0.5, 0.3, 0.3, 0.16, 10);
  },
  bridge(ctx) { // a simple rope bridge: plank deck, two rope rails, posts at each end (along +z, 14 m)
    P(ctx, PLANK, "oklch(0.55 0.05 65)"); for (let i = 0; i < 28; i++) { const z = -7 + i * 0.5, y = 0.9 - 0.5 * Math.cos((z / 7) * 1.5708); box(ctx, -0.6, y, z, 0.6, y + 0.07, z + 0.4); }
    P(ctx, OAK, "oklch(0.4 0.04 55)"); for (const z of [-7.2, 7.2]) for (const x of [-0.75, 0.75]) box(ctx, x - 0.1, -1, z - 0.1, x + 0.1, 2.0, z + 0.1);
    P(ctx, null, ROPE, 0.95); for (const x of [-0.75, 0.75]) for (let i = 0; i < 14; i++) { const z = -7 + i, y = 1.8 - 0.45 * Math.cos(((z + 0.5) / 7) * 1.5708); box(ctx, x - 0.03, y, z, x + 0.03, y + 0.06, z + 1); }
  },
  stake(ctx) { // a return marker: a whittled stake with a bright rag
    P(ctx, OAK, "oklch(0.5 0.04 60)"); box(ctx, -0.05, 0, -0.05, 0.05, 1.2, 0.05);
    P(ctx, null, "oklch(0.6 0.16 30)", 0.95); boxR(ctx, [0.12, 1.05, 0], [0.24, 0.12, 0.02], { roll: -15 });
  },
  tracks(ctx, q) { // paw prints pressed into the mud, heading +z
    P(ctx, null, "oklch(0.3 0.03 60)", 1); for (let i = 0; i < 6; i++) { const s = i % 2 ? 0.14 : -0.14; blob(ctx, s, 0.01, i * 0.45 - 1.1, 0.08, 0.012, 0.1, 1, 0.1, 3, 5); for (let t = -1; t <= 1; t++) blob(ctx, s + t * 0.06, 0.01, i * 0.45 - 1.0, 0.025, 0.01, 0.025, 1, 0, 2, 4); }
  },
  trialpost(ctx) { // a tall post wrapped in red cloth: roll past it
    P(ctx, OAK, "oklch(0.42 0.04 55)"); box(ctx, -0.12, 0, -0.12, 0.12, 2.2, 0.12);
    P(ctx, null, "oklch(0.55 0.17 28)", 0.9); box(ctx, -0.14, 1.6, -0.14, 0.14, 1.9, 0.14);
  },
};
const HH = { lodge: 6, sign: 2, beacon: 1.9, marker: 0.9, lure: 2.4, ropeposts: 1.3, bridge: 2, stake: 1.2, tracks: 0.02, trialpost: 2.2 };
const WW = { lodge: 5, bridge: 0.8, lure: 0.6 };
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat();
  if ((ctx.lod || 1) >= 4) { if (p.kind === "tracks") return; P(ctx, null, "oklch(0.5 0.04 60)"); const w = WW[p.kind] || 0.2; if (p.kind === "lodge") { box(ctx, -5, 0, -3, 5, 3, 3); P(ctx, null, "oklch(0.66 0.08 80)"); box(ctx, -5.3, 3, -3.3, 5.3, 5.3, 3.3); } else if (p.kind === "bridge") box(ctx, -0.6, 0.4, -7, 0.6, 0.9, 7); else box(ctx, -w, 0, -w, w, HH[p.kind] || 1, w); return; }
  (K[p.kind] || K.marker)(ctx, rng((ctx.seed ?? 1) + 31)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind;
  if (k === "lodge") { box(ctx, -5, 0, -3, 5, 3.2, 3); box(ctx, -3.5, 0, 2.9, 3.5, 0.6, 4.6); return; }
  if (k === "bridge") { for (let i = 0; i < 14; i++) { const z = -7 + i, y = 0.9 - 0.5 * Math.cos(((z + 0.5) / 7) * 1.5708); box(ctx, -0.6, y - 0.1, z, 0.6, y + 0.07, z + 1); } return; }
  if (k === "tracks" || k === "stake") return null; return undefined; }
