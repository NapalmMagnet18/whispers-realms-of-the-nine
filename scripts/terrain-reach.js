// The Lantern March, a continent ~6.4 km across. Near field (r < 220) is Lantern's Reach as built:
// the town shelf at y≈4, Thornwood valley west, the copper quarry pit east. Beyond it:
// Greyspine Mountains (north, snow), Emberstone Highlands (east, terraced red mesas), Hollowcrypt Vale
// (a sunken blighted bowl NE), Briarwild Deepwood (west hills), Sorrowfen (SW marsh at sea level),
// Saltmere Coast (south, a bay), and the Shrouded Sea all around. Sea level 0.
import { shore } from "builtin/terrain";
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const sstep = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
export const QUARRY = { x: 135, z: 30 };
export const FOREST = { x: -130, z: -30 };
export const CRYPT = { x: 1350, z: -700 };
export const FEN = { x: -1300, z: 950 };
export const BAY = { x: 300, z: 1880 };
export const TIDE = { x: -1000, z: 1900 }; // Tideglass Coast: a harbour shelf on the south-west shore
export const HEAD = { x: -860, z: 1985 };  // the headland the inland lighthouse stands on
// 2026-10-08 expansion: the continent now runs ~12 km east-west. Beyond the old coasts:
// Frostveil Tundra (far north, past the Greyspine), Sunscar Expanse (far east, dunes and desert rock),
// Elderveil Wilds (far west, an ancient high forest). The south coast and Saltmere bay stay where they were.
// 2026-10-08 (2): grown again to ~19 km east-west and ~9 km north of town. Two new frontiers past the old edges:
// the Ninth Veil (z < -6400: a violet crystal plateau of floating ruins, the realm's heart) and
// the Ashfall Reaches (x > 6400: black volcanic shelves around Emberstone Bastion, the Stonewrought forgehold).
export const COAST = { rx: 9600, rzN: 9200, rzS: 2050, rzS2: 3700 };
export const VEIL = { x: 0, z: -7600 };
export const BASTION = { x: 7600, z: -200 };
export function coastD(x, z) {
  const rz = z > 0 ? COAST.rzS + (COAST.rzS2 - COAST.rzS) * sstep(1300, 2800, Math.abs(x)) : COAST.rzN;
  return Math.hypot(x / COAST.rx, z / rz);
}
function quarryShape(x, z, h) {
  const dx = x - QUARRY.x, dz = z - QUARRY.z, dq = Math.hypot(dx, dz);
  if (dq > 160) return h;
  h += 17 * Math.exp(-((dq / 52) ** 2));
  const pit = 1 - sstep(19, 29, dq);
  h = h * (1 - pit) + 3.2 * pit;
  const ux = -0.976, uz = -0.217, along = dx * ux + dz * uz, perp = Math.abs(dx * -uz + dz * ux);
  if (along > 10 && along < 70) {
    const cut = (1 - sstep(4.5, 9, perp)) * (1 - sstep(55, 70, along));
    const target = 3.2 + Math.max(0, along - 22) * 0.12;
    h = h * (1 - cut) + Math.min(h, target) * cut;
  }
  return h;
}
function landFactor(x, z, noise, so) {
  const w = noise.fbm2({ x, z, frequency: 1 / 1400, octaves: 3, seed: so(7) }) * 0.12;
  const d = coastD(x, z) + w;
  let land = 1 - sstep(0.84, 1.0, d);
  const db = Math.hypot(x - BAY.x, (z - BAY.z) * 1.3);
  land *= sstep(160, 330, db); // Saltmere bay bites into the south coast
  return land;
}
export function heightAt(ctx) {
  const { x, z, noise, seedOffset: so } = ctx;
  const r = Math.hypot(x, z);
  const roll = noise.fbm2({ x, z, frequency: 1 / 90, octaves: 3, seed: so(0) }) * 3.5 + noise.fbm2({ x, z, frequency: 1 / 280, octaves: 2, seed: so(1) }) * 7;
  let h = 4 + roll * sstep(35, 95, r);
  h += 5 * sstep(40, 110, Math.hypot(x - FOREST.x, z - FOREST.z)) * sstep(60, 120, r);
  // the March: rolling hills past the town
  const far = sstep(220, 520, r);
  if (far > 0) h += far * (6 + noise.ridged({ x, z, frequency: 1 / 300, octaves: 3, seed: so(2) }) * 9);
  // Greyspine Mountains, north
  const north = sstep(-600, -1350, z) * (1 - 0.8 * sstep(-2700, -3500, z));
  if (north > 0) h += north * (55 + noise.ridged({ x, z, frequency: 1 / 340, octaves: 5, seed: so(3) }) * 85);
  // Emberstone Highlands, east: stepped mesas
  const east = sstep(520, 1050, x) * (1 - north * 0.4) * (1 - 0.85 * sstep(2700, 3500, x));
  if (east > 0) {
    const m = 22 + noise.fbm2({ x, z, frequency: 1 / 420, octaves: 3, seed: so(4) }) * 26, t = Math.max(0, m) / 8, f = t - Math.floor(t);
    h += east * (Math.floor(t) + sstep(0.72, 1, f)) * 8;
  }
  // Frostveil Tundra, far north: a high cold plain with frozen meres
  const tundra = sstep(-3000, -3600, z);
  if (tundra > 0) h += tundra * (38 + noise.fbm2({ x, z, frequency: 1 / 500, octaves: 3, seed: so(12) }) * 14);
  // the Ninth Veil, past the tundra: a raised violet plateau cut by ridged spines
  const veil = sstep(-6200, -6900, z);
  if (veil > 0) h += veil * (30 + noise.ridged({ x, z, frequency: 1 / 520, octaves: 4, seed: so(16) }) * 40);
  // Ashfall Reaches, past the desert: black stepped shelves and cinder cones
  const ash = sstep(6200, 6900, x) * (1 - tundra);
  if (ash > 0) {
    const m = 20 + noise.fbm2({ x, z, frequency: 1 / 360, octaves: 3, seed: so(17) }) * 30, t = Math.max(0, m) / 7, f = t - Math.floor(t);
    h += ash * ((Math.floor(t) + sstep(0.7, 1, f)) * 7 - 4);
  }
  // Sunscar Expanse, far east: long dunes over desert rock
  const desert = sstep(2900, 3600, x) * (1 - tundra) * (1 - ash);
  if (desert > 0) {
    const dn = noise.fbm2({ x, z, frequency: 1 / 700, octaves: 2, seed: so(13) });
    const dune = Math.abs(Math.sin((x * 0.6 + z * 0.8) / 46 + dn * 6)) * 7 + noise.ridged({ x, z, frequency: 1 / 900, octaves: 3, seed: so(14) }) * 26;
    h += desert * (14 + dune);
  }
  // Elderveil Wilds, far west: old high forest on long ridges
  const elder = sstep(-2900, -3600, x) * (1 - tundra);
  if (elder > 0) h += elder * (18 + noise.fbm2({ x, z, frequency: 1 / 380, octaves: 4, seed: so(15) }) * 22);
  // Briarwild Deepwood, west
  const west = sstep(-260, -650, x);
  if (west > 0) h += west * (5 + noise.fbm2({ x, z, frequency: 1 / 200, octaves: 3, seed: so(6) }) * 9);
  // Hollowcrypt Vale: a sunken bowl
  const dc = Math.hypot(x - CRYPT.x, z - CRYPT.z);
  if (dc < 700) { const v = Math.exp(-((dc / 300) ** 2)); h = lerp(h, 10 + noise.fbm2({ x, z, frequency: 1 / 70, octaves: 2, seed: so(8) }) * 1.5, v); }
  // Sorrowfen: flat marsh at the waterline; pools where the noise dips under 0
  const df = Math.hypot(x - FEN.x, z - FEN.z);
  if (df < 1100) { const v = Math.exp(-((df / 480) ** 2)); h = lerp(h, 0.5 + noise.fbm2({ x, z, frequency: 1 / 55, octaves: 3, seed: so(9) }) * 1.8, v); }
  // Tideglass Coast: a low shelf to the sea, a headland at its east horn
  const dt = Math.hypot(x - TIDE.x, (z - TIDE.z) * 1.4);
  if (dt < 900) { const v = Math.exp(-((dt / 330) ** 2)); h = lerp(h, 5.2 + (z < TIDE.z ? (TIDE.z - z) * 0.03 : 0) + noise.fbm2({ x, z, frequency: 1 / 60, octaves: 2, seed: so(12) }) * 0.9, v); }
  const dh = Math.hypot(x - HEAD.x, z - HEAD.z);
  if (dh < 90) h = Math.max(h, 5 + 12 * sstep(90, 30, dh));
  h = quarryShape(x, z, h);
  // coast to the sea
  const land = landFactor(x, z, noise, so);
  h = lerp(-18, h, land);
  h = shore(h, 0);
  // Sorrowfen stands its floor a metre over the tide line: the engine paints the strand under ~1 m as beach sand,
  // and the marsh must read as black mud and sedge. Pools (under 0) stay pools.
  const fl = 1.0 * sstep(720, 480, df);
  if (fl > 0 && h > -0.4) h += fl * sstep(-0.4, 0.25, h);
  return h;
}
export function materialAt(ctx) {
  const { x, z, slope, noise, seedOffset: so, worldHeight: y } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 25, octaves: 3, seed: so(5) });
  const rock = clamp01((slope - 0.2 + n * 0.1) * 4);
  const dq = Math.hypot(x - QUARRY.x, z - QUARRY.z);
  if (dq < 32 + n * 6) return { gravel: 0.7 - rock * 0.5, rock: 0.3 + rock * 0.5 };
  if (dq < 60 + n * 10) return { rock: 0.4 + rock * 0.6, grass: 0.6 - rock * 0.6 };
  const dfen = Math.hypot(x - FEN.x, z - FEN.z);
  if (dfen < 600 + n * 40 && y < 3.5) { // Sorrowfen: black wet mud in the low ground, sedge on the banks, never beach sand
    const bank = clamp01((y - 1.45 + n * 0.6) * 1.6);
    return { mud: 1 - bank * 0.55, grass: bank * 0.55 };
  }
  if (y < 1.6 + n * 0.8) {
    const df = dfen;
    if (df >= 650) return { sand: 1 };
    const bank = clamp01((y - 0.75 + n * 0.5) * 1.6); // the low ground stays black wet mud; the banks between the pools green over with sedge
    return { mud: 1 - bank * 0.6, grass: bank * 0.6 };
  }
  if (z < -6500 + n * 160) return { veil: 0.7 - rock * 0.4, snow: 0.3 - rock * 0.1, rock: rock * 0.5 };
  if (x > 6500 + n * 160) return slope > 0.3 ? { ashrock: 1 } : { ashrock: 0.55 + rock * 0.45, blight: 0.45 - rock * 0.45 };
  if (z < -3050 + n * 120) return { snow: 1 - rock * 0.5, rock: rock * 0.5 };
  if (x > 3000 + n * 150) return slope > 0.35 ? { desertrock: 1 } : { sand: 0.75 - rock * 0.3, desertrock: 0.25 + rock * 0.3 };
  if (x < -3000 + n * 150) return { forest: 1 - rock, rock };
  if (z < -700 && y > 120 + n * 14) return { snow: 1 - rock * 0.6, rock: rock * 0.6 };
  if (z < -650 && y > 45) return { rock: 0.5 + rock * 0.5, gravel: 0.5 - rock * 0.5 };
  if (Math.hypot(x - CRYPT.x, z - CRYPT.z) < 300 + n * 40) return { blight: 1 - rock, rock };
  if (Math.hypot(x - FEN.x, z - FEN.z) < 560 + n * 60) return { mud: 0.55, grass: 0.45 };
  if (x > 620 + n * 60) return { redrock: 0.45 + rock * 0.55, grass: 0.55 - rock * 0.55 };
  const df2 = Math.hypot(x - FOREST.x, z - FOREST.z);
  if (df2 < 75 + n * 15) { const f = clamp01((75 + n * 15 - df2) / 15); return { forest: f * (1 - rock), grass: (1 - f) * (1 - rock), rock }; }
  const woods = noise.fbm2({ x, z, frequency: 1 / 160, octaves: 2, seed: so(11) });
  const wantWood = x < -300 ? woods > -0.35 : (Math.hypot(x, z) > 380 && woods > 0.35);
  if (wantWood) return { forest: 1 - rock, rock };
  return { rock, grass: 1 - rock };
}
