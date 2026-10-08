// Tideglass Coast set pieces (TID-01..04). params.kind:
// lighthouse | quay | drydock | beacon | stake | ferrypost | registry | netrack
import { box, boxR, cyl, blob, quadN } from "./shape.js";
const T = (n) => "cdn/texture-" + n + ".png";
const WOOD = T("weathered-wood-planks-grey"), OAK = T("dark-oak-timber-beam-hand-painted"), IRON = T("rusted-black-iron-hammered"), STONE = T("rough-fieldstone-wall-mossy"), PLASTER = T("limewash-plaster-wall-weathered"), ROPE = T("twisted-hemp-rope"), SLATE = T("dark-grey-slate-roof-tiles");
const rng = (s) => { let h = (s * 9301 + 49297) % 233280; return () => { h = (h * 9301 + 49297) % 233280; return h / 233280; }; };
const P = (ctx, tex, col, r = 0.85, m = 0) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx, col, e) => { ctx.albedo(null); ctx.color(col); ctx.emissive(...e); };
const piling = (ctx, x, z, top, bot = -4) => cyl(ctx, x, bot, z, 0.18, 0.2, top - bot, 7);
const K = {
  lighthouse(ctx, q, far) { // 22 m tapered tower of whitewashed stone with a red band; its lamp room's lens faces INLAND (-Z), a dark side to the sea
    P(ctx, STONE, "oklch(0.6 0.02 120)"); cyl(ctx, 0, -1, 0, 4.6, 4.8, 2.2, 14);
    P(ctx, PLASTER, "oklch(0.93 0.02 90)"); cyl(ctx, 0, 1.2, 0, 3.6, 2.6, 18, far ? 10 : 16);
    P(ctx, null, "oklch(0.5 0.15 28)", 0.7); cyl(ctx, 0, 10, 0, 3.12, 3.02, 2.2, far ? 10 : 16, false);
    P(ctx, IRON, "oklch(0.3 0.01 60)", 0.5, 0.7); cyl(ctx, 0, 19.2, 0, 3.6, 3.6, 0.3, 16); // gallery
    if (!far) for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; box(ctx, Math.cos(a) * 3.45 - 0.03, 19.5, Math.sin(a) * 3.45 - 0.03, Math.cos(a) * 3.45 + 0.03, 20.5, Math.sin(a) * 3.45 + 0.03); }
    cyl(ctx, 0, 23, 0, 2.3, 0.1, 1.8, 12); // cap
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; box(ctx, Math.cos(a) * 2 - 0.06, 19.5, Math.sin(a) * 2 - 0.06, Math.cos(a) * 2 + 0.06, 23, Math.sin(a) * 2 + 0.06); }
    P(ctx, null, "oklch(0.25 0.02 230)", 0.2); cyl(ctx, 0, 19.5, 0, 1.95, 1.95, 3.5, 12, false); // sea-side glass, dark
    glow(ctx, "oklch(0.9 0.1 85)", [3.2, 2.4, 1.1]); boxR(ctx, [0, 21.2, -1.9], [2.2, 2.6, 0.3], {}); // the lens, aimed inland
    if (far) return;
    P(ctx, OAK, "oklch(0.42 0.05 50)"); box(ctx, -0.8, 1.2, -3.62, 0.8, 3.6, -3.4); // door, inland side
    P(ctx, null, "oklch(0.2 0.02 60)"); for (const y of [6, 13]) box(ctx, -0.35, y, -3.3 + y * 0.055, 0.35, y + 1.1, -3.1 + y * 0.055);
    P(ctx, PLASTER, "oklch(0.9 0.02 90)"); box(ctx, 3.4, -0.5, -3, 8.4, 3.4, 2); P(ctx, SLATE, "oklch(0.45 0.02 250)"); // keeper's cottage
    quadN(ctx, [3.2, 3.4, -3.2], [8.6, 3.4, -3.2], [8.6, 5.2, -0.5], [3.2, 5.2, -0.5], [0, 0.83, -0.55]); quadN(ctx, [3.2, 5.2, -0.5], [8.6, 5.2, -0.5], [8.6, 3.4, 2.2], [3.2, 3.4, 2.2], [0, 0.83, 0.55]);
    P(ctx, OAK, "oklch(0.42 0.05 50)"); box(ctx, 5.4, -0.2, -3.08, 6.4, 2.2, -2.98); glow(ctx, "oklch(0.85 0.12 75)", [1.6, 1.1, 0.4]); box(ctx, 7, 1.2, -3.06, 7.8, 2, -3.0);
  },
  quay(ctx, q, far) { // a plank pier on pilings, len along -Z... +Z: from shore (z=0) out to sea (z=len); deck at y=0
    const len = ctx.params.len || 40, w = ctx.params.w || 4;
    P(ctx, WOOD, "oklch(0.7 0.02 70)"); box(ctx, -w / 2, -0.25, 0, w / 2, 0, len);
    if (far) return;
    P(ctx, OAK, "oklch(0.4 0.04 50)"); for (let z = 1; z < len; z += 4) { piling(ctx, -w / 2 + 0.1, z, 0.9); piling(ctx, w / 2 - 0.1, z, 0.9); box(ctx, -w / 2, -0.6, z - 0.12, w / 2, -0.25, z + 0.12); }
    P(ctx, ROPE, "oklch(0.72 0.05 85)"); for (let z = 1; z < len - 4; z += 4) { box(ctx, -w / 2 + 0.05, 0.75, z, -w / 2 + 0.1, 0.8, z + 4); box(ctx, w / 2 - 0.1, 0.75, z, w / 2 - 0.05, 0.8, z + 4); }
    P(ctx, IRON, "oklch(0.3 0.01 60)", 0.5, 0.6); for (let z = 6; z < len; z += 10) cyl(ctx, w / 2 - 0.4, 0, z, 0.14, 0.18, 0.45, 8);
  },
  drydock(ctx, q, far) { // an empty slipway: a stone ramp into the water between timber cradle frames, a winch at its head
    P(ctx, STONE, "oklch(0.58 0.02 110)"); boxR(ctx, [0, -1, 6], [5, 0.6, 16], { pitch: 8 });
    box(ctx, -3.4, -2, -2, -2.6, 1.2, 14); box(ctx, 2.6, -2, -2, 3.4, 1.2, 14);
    if (far) return;
    P(ctx, OAK, "oklch(0.38 0.04 50)"); for (let z = 0; z < 12; z += 3) { boxR(ctx, [0, 0.4 - z * 0.14, z], [5, 0.25, 0.3], {}); for (const x of [-1.8, 1.8]) boxR(ctx, [x, 0.9 - z * 0.14, z], [0.25, 0.9, 0.25], { roll: x > 0 ? -20 : 20 }); }
    P(ctx, OAK, "oklch(0.45 0.05 55)"); box(ctx, -1.4, 1.2, -3.2, 1.4, 1.5, -2.6); cyl(ctx, -1.2, 1.5, -2.9, 0.08, 0.08, 1, 6); cyl(ctx, 1.2, 1.5, -2.9, 0.08, 0.08, 1, 6);
    P(ctx, ROPE, "oklch(0.7 0.05 85)"); cyl(ctx, 0, 2.3, -2.9, 0.3, 0.3, 0.1, 10); boxR(ctx, [0, 1.9, 2], [0.06, 0.06, 9], { pitch: 6 });
    P(ctx, WOOD, "oklch(0.6 0.02 70)"); for (let i = 0; i < 6; i++) boxR(ctx, [(q() - 0.5) * 4, 0.2, (q() - 0.2) * 8], [0.2, 0.06, 2 + q() * 2], { yaw: q() * 60 - 30 }); // abandoned planks
  },
  beacon(ctx, q, far) { // a harbour beacon: fieldstone cairn, iron basket, a glass lens bowl (the fx lights it)
    P(ctx, STONE, "oklch(0.6 0.02 120)"); cyl(ctx, 0, 0, 0, 0.9, 0.6, 1.8, 8, true, far ? null : (i, k) => 1 + ((i * 7 + k * 3) % 5) * 0.03);
    P(ctx, IRON, "oklch(0.3 0.01 60)", 0.5, 0.7); cyl(ctx, 0, 1.8, 0, 0.12, 0.12, 0.8, 6); cyl(ctx, 0, 2.5, 0, 0.55, 0.7, 0.5, 8, false);
    glow(ctx, "oklch(0.8 0.06 210)", [0.2, 0.35, 0.45]); ctx.roughness(0.1); blob(ctx, 0, 2.75, 0, 0.42, 0.25, 0.42, 3, 0.05, 4, 8);
  },
  stake(ctx, q) { // a surveyor's stake: striped pole, a flag, a brass tide plate
    P(ctx, WOOD, "oklch(0.68 0.03 70)"); cyl(ctx, 0, 0, 0, 0.06, 0.05, 2.2, 6);
    for (let i = 0; i < 3; i++) { P(ctx, null, i % 2 ? "oklch(0.92 0.02 90)" : "oklch(0.55 0.15 245)", 0.7); cyl(ctx, 0, 1.2 + i * 0.25, 0, 0.065, 0.065, 0.12, 6, false); }
    P(ctx, null, "oklch(0.6 0.16 245)", 0.8); boxR(ctx, [0.28, 2, 0], [0.5, 0.32, 0.01], { yaw: 0, roll: -4 });
    P(ctx, null, "oklch(0.78 0.11 80)", 0.3, 0.9); box(ctx, -0.07, 0.6, -0.07, 0.07, 0.75, -0.055);
  },
  ferrypost(ctx, q) { // a stout ferry post on the landing, its guide rope snapped and trailing in the water
    P(ctx, OAK, "oklch(0.38 0.04 50)"); cyl(ctx, 0, -0.5, 0, 0.35, 0.4, 3.4, 9); box(ctx, -0.6, 2.2, -0.12, 0.6, 2.45, 0.12);
    P(ctx, IRON, "oklch(0.3 0.01 60)", 0.5, 0.7); cyl(ctx, 0, 2.5, 0, 0.18, 0.18, 0.3, 8);
    P(ctx, ROPE, "oklch(0.7 0.05 85)"); cyl(ctx, 0, 1.6, 0, 0.42, 0.42, 0.25, 10); boxR(ctx, [0, 0.5, 2.2], [0.07, 0.07, 4], { pitch: 18 }); cyl(ctx, 0.6, 0, 4.6, 0.4, 0.4, 0.12, 10);
    P(ctx, WOOD, "oklch(0.65 0.02 70)"); box(ctx, -2.5, -0.2, -3, 2.5, 0.05, 0); // landing deck
  },
  registry(ctx) { // the dock registry: a slant-top clerk's desk under an awning, ledgers chained to it
    P(ctx, OAK, "oklch(0.45 0.05 55)"); box(ctx, -0.8, 0, -0.4, 0.8, 0.95, 0.4); boxR(ctx, [0, 1.05, 0], [1.7, 0.08, 0.9], { pitch: -12 });
    P(ctx, null, "oklch(0.35 0.08 30)", 0.8); boxR(ctx, [-0.35, 1.13, 0], [0.5, 0.06, 0.65], { pitch: -12 }); P(ctx, null, "oklch(0.88 0.04 85)", 0.9); boxR(ctx, [0.35, 1.12, 0], [0.55, 0.03, 0.7], { pitch: -12 });
    P(ctx, OAK, "oklch(0.4 0.04 50)"); for (const x of [-1.2, 1.2]) box(ctx, x - 0.06, 0, 0.9, x + 0.06, 2.6, 1.02);
    P(ctx, null, "oklch(0.55 0.12 245)", 0.9); boxR(ctx, [0, 2.6, 0.3], [2.8, 0.05, 1.8], { pitch: 14 });
  },
  netrack(ctx, q) { // nets drying on a pole rack, floats strung along the top
    P(ctx, WOOD, "oklch(0.62 0.02 70)"); for (const x of [-2, 0, 2]) cyl(ctx, x, 0, 0, 0.07, 0.07, 2.2, 6); box(ctx, -2.2, 2.1, -0.05, 2.2, 2.2, 0.05);
    P(ctx, ROPE, "oklch(0.55 0.03 150)", 1); for (let i = 0; i < 2; i++) boxR(ctx, [-1 + i * 2, 1.3, 0], [1.9, 1.6, 0.02], { roll: (q() - 0.5) * 6 });
    P(ctx, null, "oklch(0.75 0.12 70)", 0.6); for (let i = 0; i < 7; i++) blob(ctx, -1.8 + i * 0.6, 2.05, 0.08, 0.09, 0.09, 0.09, i, 0.1, 3, 5);
  },
};
export function geometry(ctx) { const p = ctx.params || {}; ctx.flat(); const far = (ctx.lod || 1) >= 4; (K[p.kind] || K.stake)(ctx, rng((ctx.seed ?? 1) + 7), far); ctx.emissive(null); }
export function collider(ctx) { const p = ctx.params || {}, k = p.kind;
  if (k === "lighthouse") { cyl(ctx, 0, -1, 0, 4.8, 4.8, 3.2, 10); cyl(ctx, 0, 2.2, 0, 3.6, 2.6, 21, 10); box(ctx, 3.4, -0.5, -3, 8.4, 5, 2); return; }
  if (k === "quay") { box(ctx, -(p.w || 4) / 2, -0.25, 0, (p.w || 4) / 2, 0, p.len || 40); return; }
  if (k === "drydock") { boxR(ctx, [0, -1, 6], [5, 0.6, 16], { pitch: 8 }); box(ctx, -3.4, -2, -2, -2.6, 1.2, 14); box(ctx, 2.6, -2, -2, 3.4, 1.2, 14); return; }
  if (k === "beacon") { cyl(ctx, 0, 0, 0, 0.9, 0.7, 2.4, 8); return; }
  if (k === "ferrypost") { cyl(ctx, 0, -0.5, 0, 0.4, 0.4, 3.4, 8); box(ctx, -2.5, -0.2, -3, 2.5, 0.05, 0); return; }
  if (k === "registry") { box(ctx, -0.8, 0, -0.4, 0.8, 1.1, 0.4); return; }
  if (k === "stake") { cyl(ctx, 0, 0, 0, 0.08, 0.08, 2.2, 6); return; }
  return null;
}
