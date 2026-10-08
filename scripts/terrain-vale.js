// Banner Vale: a green valley 260 m long between two ridges. Raised bases at z = +-104, a low central ridge across z = 0
// cut by two gullies (x = +-24) and crossed by the road over its saddle (x = 0); cliffs close both ends.
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
export function heightAt(ctx) {
  const { x, z, noise, seedOffset: so } = ctx;
  const ax = Math.abs(x), az = Math.abs(z);
  const roll = noise.fbm2({ x, z, frequency: 1 / 40, octaves: 3, seed: so(0) });
  let h = roll * 1.2;
  h += sstep(46, 86, ax + roll * 6) * (30 + noise.ridged({ x, z, frequency: 1 / 60, octaves: 3, seed: so(1) }) * 14); // the ridges
  h += sstep(122, 150, az) * 34;                                                                                 // the end cliffs
  const ridge = 6 * Math.exp(-((z / 11) ** 2));                                                                  // the middle ridge
  const gully = Math.max(Math.exp(-(((ax - 24) / 6) ** 2)) * 1.4, Math.exp(-((x / 5) ** 2)) * 0.55);
  h += ridge * (1 - Math.min(1, gully)) - Math.exp(-(((ax - 24) / 5) ** 2)) * Math.exp(-((z / 16) ** 2)) * 1.8;
  const base = 1 - sstep(16, 30, Math.hypot(x, az - 104));                                                       // flat raised bases
  return h * (1 - base) + 3 * base;
}
export function materialAt(ctx) {
  const { x, z, slope, noise, seedOffset: so } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 18, octaves: 2, seed: so(5) });
  const rock = Math.min(1, Math.max(0, (slope - 0.32 + n * 0.1) * 4));
  if (rock > 0.5) return { rock: rock, grass: 1 - rock };
  const az = Math.abs(z), ax = Math.abs(x);
  if (Math.hypot(x, az - 104) < 15 + n * 2) return { cobble: 0.8, dirt: 0.2 };
  const road = ax < 2.2 + n * 0.8 && az < 100;
  if (road) return { dirt: 0.85, grass: 0.15 };
  if (Math.abs(ax - 24) < 3 + n && az < 20) return { mud: 0.6, grass: 0.4 };
  return { grass: 1 - rock * 0.6, rock: rock * 0.6 };
}
