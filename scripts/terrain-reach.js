// Lantern's Reach: the town shelf at y≈4, rolling meadow, Thornwood to the NE, the copper quarry
// (a rocky hill with a carved pit and a ramp cut toward town) to the SW, a ring of peaks far out.
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const sstep = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const QUARRY = { x: -110, z: 90 };
export const FOREST = { x: 120, z: -90 };
function quarryShape(x, z, h) {
  const dx = x - QUARRY.x, dz = z - QUARRY.z, dq = Math.hypot(dx, dz);
  h += 17 * Math.exp(-((dq / 52) ** 2));
  const pit = 1 - sstep(19, 29, dq);
  h = h * (1 - pit) + 3.2 * pit;
  // ramp cut from the pit toward town (direction to the origin)
  const ux = 0.774, uz = -0.633, along = dx * ux + dz * uz, perp = Math.abs(dx * -uz + dz * ux);
  if (along > 10 && along < 70) {
    const cut = (1 - sstep(4.5, 9, perp)) * (1 - sstep(55, 70, along));
    const target = 3.2 + Math.max(0, along - 22) * 0.12;
    h = h * (1 - cut) + Math.min(h, target) * cut;
  }
  return h;
}
export function heightAt(ctx) {
  const { x, z, noise, seedOffset } = ctx;
  const r = Math.hypot(x, z);
  const roll = noise.fbm2({ x, z, frequency: 1 / 90, octaves: 3, seed: seedOffset(0) }) * 3.5 + noise.fbm2({ x, z, frequency: 1 / 280, octaves: 2, seed: seedOffset(1) }) * 7;
  let h = 4 + roll * sstep(35, 95, r);
  const fx = x - FOREST.x, fz = z - FOREST.z;
  h += 5 * sstep(40, 110, Math.hypot(fx, fz)) * sstep(60, 120, r); // forest sits in a shallow valley
  h += sstep(240, 430, r) * (35 + noise.ridged({ x, z, frequency: 1 / 160, octaves: 4, seed: seedOffset(2) }) * 40);
  return quarryShape(x, z, h);
}
export function materialAt(ctx) {
  const { x, z, slope, noise, seedOffset, worldHeight } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 25, octaves: 3, seed: seedOffset(5) });
  const dq = Math.hypot(x - QUARRY.x, z - QUARRY.z);
  const rock = clamp01((slope - 0.2 + n * 0.1) * 4);
  if (dq < 32 + n * 6) return { gravel: 0.7 - rock * 0.5, rock: 0.3 + rock * 0.5 };
  if (dq < 60 + n * 10) return { rock: 0.4 + rock * 0.6, grass: 0.6 - rock * 0.6 };
  if (Math.hypot(x, z) > 300 && worldHeight > 30 + n * 8) return { rock: 0.6 + rock * 0.4, gravel: 0.4 - rock * 0.4 };
  const df = Math.hypot(x - FOREST.x, z - FOREST.z);
  if (df < 75 + n * 15) { const f = clamp01((75 + n * 15 - df) / 15); return { forest: f * (1 - rock), grass: (1 - f) * (1 - rock), rock }; }
  return { rock, grass: 1 - rock };
}
