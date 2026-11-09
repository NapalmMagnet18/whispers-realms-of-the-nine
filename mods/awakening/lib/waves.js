// Awakening waves (experimental): what the swell does to a body the engine already floats. The engine holds
// a body with a density at its flat water level; this adds the difference the shared swell makes, point by
// point, so a log heaves on the crest you see, tips on its slope, and drifts the way the wind and waves go.
// Pure math: the manager (mods/awakening/waves.js) owns the bodies and writes the forces.
import { SWELL, swellHeight, swellRise } from "./swell.js";

export const WAVES = {
  rho: 1000, g: 9.81,
  zeta: 0.35,     // damping share of critical, against the water's own rise
  leeway: 0.025,  // a floater drifts at this share of the wind speed (driftwood ~2-3 %)
  follow: 0.6,    // 1/s: how fast its drift catches the water's
  slap: 0.28,     // m/s of heave against the water that rings it
  band: 1.2,      // m: a body this far from the surface is out of the waves
};

// Stokes drift of the swell at scale sw, m/s, on the ground plane
export function stokes(sw) {
  let x = 0, z = 0;
  for (const s of SWELL) { const u = (s.a * sw) ** 2 * s.k * s.w; x += s.dx * u; z += s.dz * u; }
  return { x, z };
}

// float points on a body's waterline: four, at ±l/2 along its forward and ±w/2 across, world space
export function floatPoints(pos, yawDeg, l, w) {
  const r = (yawDeg * Math.PI) / 180, fx = -Math.sin(r), fz = -Math.cos(r), rx = Math.cos(r), rz = -Math.sin(r);
  const out = [];
  for (const a of [-0.5, 0.5]) for (const b of [-0.5, 0.5]) out.push({ x: pos.x + fx * l * a + rx * w * b, z: pos.z + fz * l * a + rz * w * b });
  return out;
}

// the heave force at one of n points: the swell's extra (or missing) displacement, damped against its rise
export function heave(p, py, vy, t, sw, area, mass, n) {
  const k = WAVES.rho * WAVES.g * area; // N per m of the whole waterplane
  const c = (2 * WAVES.zeta * Math.sqrt(k * mass)) / n;
  const h = swellHeight(p.x, p.z, t, sw), rise = swellRise(p.x, p.z, t, sw);
  return { f: (k / n) * h - c * (vy - rise), rel: vy - rise, h };
}
