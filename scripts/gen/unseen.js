// The Unseen Door (Shade path SHA-01..07): the Old Bond House by the river, its walled yard and the guild's drills. params.kind:
// bondhouse | wall | mirror | case | crate | sign | desk | hatch | stepost | reportbox | pouch | lamppost
import { box, boxR, cyl, blob } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const OAK = T("dark-oak-timber-beam-hand-painted"), STONE = T("mossy-fieldstone-wall-painted"), PLANK = T("weathered-wood-planks-painted"), PLASTER = T("limewash-plaster-wall-painted"), SHINGLE = T("red-clay-roof-shingles-painted");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.88, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const IRON = "oklch(0.3 0.01 60)", VIOLET = "oklch(0.42 0.12 300)";
const K = {
  bondhouse(ctx, q) { // a two-storey river warehouse gone quiet: stone ground floor, sagging timber upper, shutters nailed, one door that isn't
    P(ctx, STONE, "oklch(0.58 0.03 100)"); box(ctx, -5, 0, -4, 5, 3.2, 4);
    P(ctx, PLASTER, "oklch(0.74 0.03 80)"); box(ctx, -4.9, 3.2, -3.9, 4.9, 6.0, 3.9);
    P(ctx, OAK, "oklch(0.32 0.04 50)");
    for (const x of [-4.95, -1.6, 1.6, 4.95]) for (const z of [-3.95, 3.95]) box(ctx, x - 0.16, 3.2, z - 0.16, x + 0.16, 6.1, z + 0.16);
    for (const z of [-3.95, 3.95]) { box(ctx, -5.1, 3.1, z - 0.18, 5.1, 3.35, z + 0.18); box(ctx, -5.1, 5.9, z - 0.18, 5.1, 6.15, z + 0.18); }
    for (const x of [-3.3, 0, 3.3]) boxR(ctx, [x, 4.6, 3.97], [0.12, 2.6, 0.08], { roll: 38 });
    P(ctx, SHINGLE, "oklch(0.52 0.1 35)"); for (const s of [-1, 1]) boxR(ctx, [0, 7.35, s * 2.15], [11, 0.25, 5.1], { pitch: s * 33, roll: s * 1.5 });
    P(ctx, PLASTER, "oklch(0.7 0.03 80)"); for (const x of [-4.9, 4.9]) for (let i = 0; i < 5; i++) box(ctx, x - 0.1, 6.0 + i * 0.5, -3.6 + i * 0.75, x + 0.1, 6.5 + i * 0.5, 3.6 - i * 0.75);
    P(ctx, PLANK, "oklch(0.42 0.04 55)"); for (const x of [-3, 3]) { box(ctx, x - 0.55, 4.0, 3.92, x + 0.55, 5.2, 4.02); boxR(ctx, [x, 4.6, 4.05], [1.2, 0.12, 0.04], { roll: 20 }); }
    box(ctx, -1.4, 0, 3.95, 1.4, 2.8, 4.05); // the loading doors, barred
    P(ctx, null, IRON, 0.5, 0.6); box(ctx, -1.6, 1.3, 4.05, 1.6, 1.5, 4.15);
    P(ctx, OAK, "oklch(0.22 0.03 300)"); box(ctx, 3.3, 0, 3.96, 4.3, 2.2, 4.06); // the small side door: the Unseen Door itself, painted near-black
    glow(ctx, "oklch(0.7 0.14 300)", [0.6, 0.35, 1.0]); box(ctx, 3.72, 1.55, 4.06, 3.88, 1.71, 4.09); // a violet keyhole glint
    glow(ctx, "oklch(0.86 0.12 75)", [1.6, 1.0, 0.35]); box(ctx, -0.5, 4.3, -3.98, 0.5, 5.1, -3.94);
    P(ctx, STONE, "oklch(0.5 0.02 70)"); box(ctx, 3.6, 5.5, -2.6, 4.4, 9.2, -1.8);
    P(ctx, PLANK, "oklch(0.5 0.05 60)"); box(ctx, -4.6, 0, 4.1, -2.6, 0.9, 5.2); box(ctx, -4.4, 0.9, 4.3, -3.4, 1.7, 5.0);
    P(ctx, null, "oklch(0.55 0.06 65)", 0.95); cyl(ctx, -1.9, 0, 4.9, 0.4, 0.4, 1.0, 10); cyl(ctx, 2.2, 0, 5.0, 0.4, 0.36, 0.95, 10);
  },
  wall(ctx, q) { // a 6 m length of low fieldstone yard wall, tumbled at one end
    P(ctx, STONE, "oklch(0.6 0.03 105)"); box(ctx, -3, 0, -0.3, 2.2, 1.3, 0.3);
    for (let i = 0; i < 4; i++) blob(ctx, 2.4 + i * 0.25, 0.2 + (3 - i) * 0.22, (q() - 0.5) * 0.3, 0.32, 0.22, 0.28, i + 3, 0.2, 4, 6);
    P(ctx, null, "oklch(0.45 0.08 135)", 1); box(ctx, -3, 1.3, -0.28, 1.5, 1.38, 0.28);
  },
  mirror(ctx) { // a signal mirror on a tripod pole, angled at the sky
    P(ctx, OAK, "oklch(0.36 0.04 50)"); for (let i = 0; i < 3; i++) { const a = i * 2.094; boxR(ctx, [Math.cos(a) * 0.3, 0.9, Math.sin(a) * 0.3], [0.07, 1.9, 0.07], { roll: Math.cos(a) * 9, pitch: -Math.sin(a) * 9 }); }
    P(ctx, null, "oklch(0.55 0.08 70)", 0.35, 0.8); cyl(ctx, 0, 1.85, 0, 0.42, 0.42, 0.06, 16);
    glow(ctx, "oklch(0.95 0.05 90)", [2.6, 2.4, 1.8]); boxR(ctx, [0, 1.95, 0.02], [0.66, 0.66, 0.02], { pitch: -30 });
  },
  case(ctx) { // a practice lockbox on a trestle, iron-bound, three locks
    P(ctx, PLANK, "oklch(0.5 0.05 60)"); for (const x of [-0.5, 0.5]) box(ctx, x - 0.05, 0, -0.25, x + 0.05, 0.75, 0.25); box(ctx, -0.65, 0.75, -0.3, 0.65, 0.82, 0.3);
    P(ctx, OAK, "oklch(0.34 0.05 45)"); box(ctx, -0.4, 0.82, -0.22, 0.4, 1.15, 0.22);
    P(ctx, null, IRON, 0.45, 0.7); for (const x of [-0.3, 0, 0.3]) box(ctx, x - 0.05, 0.92, 0.22, x + 0.05, 1.04, 0.25); box(ctx, -0.42, 1.12, -0.24, 0.42, 1.16, 0.24);
  },
  crate(ctx) { // a fish-crate dead drop with a loose board
    P(ctx, PLANK, "oklch(0.55 0.05 70)"); box(ctx, -0.45, 0, -0.35, 0.45, 0.6, 0.35);
    P(ctx, OAK, "oklch(0.35 0.04 50)"); boxR(ctx, [0.1, 0.63, 0], [0.9, 0.05, 0.16], { yaw: 12 });
    P(ctx, null, "oklch(0.85 0.04 85)", 0.9); box(ctx, -0.15, 0.6, -0.08, 0.12, 0.62, 0.1);
    P(ctx, null, "oklch(0.45 0.16 25)", 0.6); cyl(ctx, -0.02, 0.62, 0.01, 0.035, 0.035, 0.01, 8);
  },
  sign(ctx) { // a fresh hanging sign: the Gilt Lantern Relief Society
    P(ctx, OAK, "oklch(0.38 0.04 50)"); box(ctx, -0.08, 0, -0.08, 0.08, 2.8, 0.08); box(ctx, -0.08, 2.65, -0.06, 1.2, 2.75, 0.06);
    P(ctx, PLANK, "oklch(0.32 0.06 260)"); box(ctx, 0.25, 1.75, -0.04, 1.15, 2.45, 0.04);
    glow(ctx, "oklch(0.82 0.13 85)", [1.2, 0.9, 0.3]); box(ctx, 0.35, 2.15, 0.04, 1.05, 2.3, 0.05); box(ctx, 0.45, 1.9, 0.04, 0.95, 2.0, 0.05);
  },
  desk(ctx) { // Arlo's writing desk under the eaves: a slanted top, a stub of candle, the draft report
    P(ctx, OAK, "oklch(0.4 0.05 55)"); for (const x of [-0.6, 0.6]) for (const z of [-0.3, 0.3]) box(ctx, x - 0.05, 0, z - 0.05, x + 0.05, 0.85, z + 0.05);
    boxR(ctx, [0, 0.9, 0], [1.4, 0.06, 0.75], { pitch: -10 });
    P(ctx, null, "oklch(0.9 0.03 90)", 0.9); boxR(ctx, [-0.15, 0.95, 0.02], [0.5, 0.01, 0.38], { pitch: -10, yaw: 6 });
    P(ctx, null, "oklch(0.92 0.02 90)", 0.7); cyl(ctx, 0.5, 0.93, -0.2, 0.04, 0.04, 0.14, 8);
    glow(ctx, "oklch(0.88 0.14 75)", [2.4, 1.5, 0.4]); cyl(ctx, 0.5, 1.07, -0.2, 0.015, 0.0, 0.06, 6);
  },
  hatch(ctx) { // the cellar hatch to the old records room, set in the flagstones
    P(ctx, STONE, "oklch(0.52 0.02 80)"); box(ctx, -0.9, 0, -0.7, 0.9, 0.12, 0.7);
    P(ctx, OAK, "oklch(0.3 0.04 50)"); box(ctx, -0.7, 0.12, -0.55, 0.7, 0.18, 0.55);
    P(ctx, null, IRON, 0.45, 0.7); for (const z of [-0.35, 0.35]) box(ctx, -0.72, 0.18, z - 0.05, 0.72, 0.21, z + 0.05); cyl(ctx, 0.45, 0.18, 0, 0.08, 0.08, 0.04, 10);
  },
  stepost(ctx) { // a Shade trial post: black-tarred, a violet ribbon you must stand beside after a Shadowstep
    P(ctx, OAK, "oklch(0.22 0.02 300)"); box(ctx, -0.13, 0, -0.13, 0.13, 2.3, 0.13);
    P(ctx, null, VIOLET, 0.9); box(ctx, -0.15, 1.7, -0.15, 0.15, 1.95, 0.15); boxR(ctx, [0.2, 1.6, 0], [0.3, 0.06, 0.02], { roll: -60 });
    glow(ctx, "oklch(0.72 0.15 300)", [0.7, 0.35, 1.2]); box(ctx, -0.04, 2.3, -0.04, 0.04, 2.38, 0.04);
  },
  reportbox(ctx) { // the Beacon Guild's sealed report box: oak, a brass slot, a padlock
    P(ctx, OAK, "oklch(0.36 0.05 50)"); box(ctx, -0.06, 0, -0.06, 0.06, 1.0, 0.06); box(ctx, -0.3, 1.0, -0.2, 0.3, 1.45, 0.2);
    P(ctx, null, "oklch(0.7 0.12 80)", 0.35, 0.8); box(ctx, -0.18, 1.32, 0.2, 0.18, 1.36, 0.22); box(ctx, -0.05, 1.05, 0.2, 0.05, 1.15, 0.24);
  },
  pouch(ctx, q) { // a coin pouch left where a payment changed hands
    P(ctx, null, "oklch(0.45 0.07 55)", 0.95); blob(ctx, 0, 0.1, 0, 0.12, 0.1, 0.11, 7, 0.15, 5, 7);
    P(ctx, null, "oklch(0.78 0.13 85)", 0.35, 0.8); for (let i = 0; i < 3; i++) cyl(ctx, 0.15 + i * 0.05, 0, 0.05 - i * 0.04, 0.03, 0.03, 0.01, 8);
  },
  lamppost(ctx) { // a hooded lamp on an iron hook
    P(ctx, null, IRON, 0.5, 0.6); box(ctx, -0.05, 0, -0.05, 0.05, 2.6, 0.05); box(ctx, -0.05, 2.55, -0.04, 0.5, 2.62, 0.04);
    glow(ctx, "oklch(0.86 0.13 70)", [2.2, 1.4, 0.45]); box(ctx, 0.36, 2.15, -0.1, 0.56, 2.45, 0.1);
  },
};
const HH = { bondhouse: 9, wall: 1.3, mirror: 2.2, case: 1.2, crate: 0.65, sign: 2.8, desk: 1.1, hatch: 0.2, stepost: 2.4, reportbox: 1.45, pouch: 0.2, lamppost: 2.6 };
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat();
  if ((ctx.lod || 1) >= 4) { if (p.kind === "bondhouse") { P(ctx, null, "oklch(0.7 0.03 80)"); box(ctx, -5, 0, -4, 5, 6, 4); P(ctx, null, "oklch(0.52 0.1 35)"); box(ctx, -5.3, 6, -4.3, 5.3, 8.6, 4.3); return; } P(ctx, null, "oklch(0.5 0.04 60)"); if (p.kind === "wall") { box(ctx, -3, 0, -0.3, 3, 1.3, 0.3); return; } box(ctx, -0.25, 0, -0.25, 0.25, HH[p.kind] || 1, 0.25); return; }
  (K[p.kind] || K.case)(ctx, rng((ctx.seed ?? 1) + 17)); ctx.emissive(null); }
export function collider(ctx) { const k = (ctx.params || {}).kind;
  if (k === "bondhouse") { box(ctx, -5, 0, -4, 5, 6.2, 4); return; }
  if (k === "wall") { box(ctx, -3, 0, -0.3, 2.4, 1.3, 0.3); return; }
  if (k === "pouch" || k === "hatch") return null; return undefined; }
