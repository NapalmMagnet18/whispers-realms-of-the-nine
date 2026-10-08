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
  const w = noise.fbm2({ x, z, frequency: 1 / 900, octaves: 3, seed: so(7) }) * 0.16;
  const d = Math.hypot(x / 3200, z / (z > 0 ? 2050 : 3200)) + w;
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
  const north = sstep(-600, -1350, z);
  if (north > 0) h += north * (55 + noise.ridged({ x, z, frequency: 1 / 340, octaves: 5, seed: so(3) }) * 85);
  // Emberstone Highlands, east: stepped mesas
  const east = sstep(520, 1050, x) * (1 - north * 0.4);
  if (east > 0) {
    const m = 22 + noise.fbm2({ x, z, frequency: 1 / 420, octaves: 3, seed: so(4) }) * 26, t = Math.max(0, m) / 8, f = t - Math.floor(t);
    h += east * (Math.floor(t) + sstep(0.72, 1, f)) * 8;
  }
  // Briarwild Deepwood, west
  const west = sstep(-260, -650, x);
  if (west > 0) h += west * (5 + noise.fbm2({ x, z, frequency: 1 / 200, octaves: 3, seed: so(6) }) * 9);
  // Hollowcrypt Vale: a sunken bowl
  const dc = Math.hypot(x - CRYPT.x, z - CRYPT.z);
  if (dc < 700) { const v = Math.exp(-((dc / 300) ** 2)); h = lerp(h, 7 + noise.fbm2({ x, z, frequency: 1 / 70, octaves: 2, seed: so(8) }) * 2.5, v); }
  // Sorrowfen: flat marsh at the waterline; pools where the noise dips under 0
  const df = Math.hypot(x - FEN.x, z - FEN.z);
  if (df < 1100) { const v = Math.exp(-((df / 480) ** 2)); h = lerp(h, 0.5 + noise.fbm2({ x, z, frequency: 1 / 55, octaves: 3, seed: so(9) }) * 1.8, v); }
  h = quarryShape(x, z, h);
  // coast to the sea
  const land = landFactor(x, z, noise, so);
  h = lerp(-18, h, land);
  return shore(h, 0);
}
export function materialAt(ctx) {
  const { x, z, slope, noise, seedOffset: so, worldHeight: y } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 25, octaves: 3, seed: so(5) });
  const rock = clamp01((slope - 0.2 + n * 0.1) * 4);
  const dq = Math.hypot(x - QUARRY.x, z - QUARRY.z);
  if (dq < 32 + n * 6) return { gravel: 0.7 - rock * 0.5, rock: 0.3 + rock * 0.5 };
  if (dq < 60 + n * 10) return { rock: 0.4 + rock * 0.6, grass: 0.6 - rock * 0.6 };
  if (y < 1.6 + n * 0.8) {
    const df = Math.hypot(x - FEN.x, z - FEN.z);
    return df < 650 ? { mud: 1 } : { sand: 1 };
  }
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
