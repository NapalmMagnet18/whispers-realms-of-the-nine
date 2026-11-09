// Awakening swell: the one wave field every reader shares. The water sheet's vertices rise and fall by it
// (mods/awakening/water.js), and anything that floats asks it where the surface is (swellHeight), so a canoe
// rocks on the very swell you see. Three long trains, deep-water dispersion, each frequency snapped to a
// whole number of cycles an hour so the shader's clock and ctx.now() agree even across a wrap.
// [wavelength m, heading degrees (0 = +X, counter-clockwise from above toward -Z), amplitude m, phase]
const G = 9.81, TAU = Math.PI * 2, HOUR = 3600;
export const SWELL = [
  [14, 20, 0.045, 0.0],
  [9, -35, 0.03, 2.1],
  [6, 62, 0.018, 4.4],
].map(([L, deg, a, ph]) => {
  const k = TAU / L, w = (TAU * Math.round((Math.sqrt(G * k) * HOUR) / TAU)) / HOUR, r = (deg * Math.PI) / 180;
  return { k, w, a, ph, dx: Math.cos(r), dz: -Math.sin(r) };
});

export const swellTime = (ctx) => (ctx.now() / 1000) % HOUR;

// height of the swell above the still level at (x, z), time t (swellTime), scaled by the lake's `swell` param
export function swellHeight(x, z, t, scale = 1) {
  let h = 0;
  for (const s of SWELL) h += s.a * Math.sin(s.k * (s.dx * x + s.dz * z) - s.w * t + s.ph);
  return h * scale;
}

// its vertical speed, m/s: what a float's damping measures against
export function swellRise(x, z, t, scale = 1) {
  let v = 0;
  for (const s of SWELL) v -= s.a * s.w * Math.cos(s.k * (s.dx * x + s.dz * z) - s.w * t + s.ph);
  return v * scale;
}

// squalls: a pure function of the shared clock, so the shader and every floater agree with no per-second
// writes (a stepped wind snaps every wave). period divides the hour, so it survives the clock's wrap.
// strength 0..1 rises, peaks and dies over `length` s once each `period` s; gust() is the wind it adds, m/s.
// Optional, per lake, on its material params: squall: 1 turns squalls on (default off: a steady breeze),
// squallPush: 1 lets them shove and rock what floats (default off: the water builds, boats only bob).
export const SQUALL = { period: 200, length: 55, extra: 8 };
// storm: the squall's weather (look param storm: 1): the same clock, the cover leading the gusts a little
export function storm(t) {
  const lead = ((t % SQUALL.period) / SQUALL.length + 0.12) / 1.24;
  return lead > 0 && lead < 1 ? Math.sin(Math.PI * lead) ** 1.5 : 0;
}
export const squallOpts = (params) => ({ on: Number(params?.squall ?? 0) > 0, push: Number(params?.squallPush ?? 0) > 0 });
// the weather decides a squall's teeth: in clear weather (lake param stormy: 0, mirrored from the Thunderstorms
// switch) a squall is a passing riffle, CLEAR.gust of its storm wind, and raises no storm waves.
export const CLEAR = { gust: 0.35 };
const stormyOf = (params) => (Number(params?.stormy ?? 0) > 0 ? 1 : 0);
// the wind a squall adds right now, m/s: every reader (shader, canoe, floaters) uses this one sum
export const gustOf = (t, params) => (Number(params?.squall ?? 0) > 0 ? squall(t) * SQUALL.extra * (stormyOf(params) ? 1 : CLEAR.gust) : 0);
export function squall(t) {
  const ph = (t % SQUALL.period) / SQUALL.length;
  return ph < 1 ? Math.sin(Math.PI * ph) ** 2 : 0;
}
// how much the wind builds the swell: 0.6 at a 3 m/s breeze (a calm, near-glassy lake), 3x in a gale (the shader uses the same curve)
export const windSwell = (speed) => Math.min(3, Math.max(0.35, (speed ?? 3) / 5));
// storm waves (optional, per lake: stormWaves: 1, needs squall: 1): a squall raises the swell past the breeze's
// cap, up to STORM.extra more at its peak, so a crossing gets real chop. Every reader adds it the same way:
// swell scale = swell * (windSwell(wind) + stormSwell(t, params)); the shader writes the same sum.
export const STORM = { extra: 4 };
export const stormSwell = (t, params) => (Number(params?.squall ?? 0) > 0 ? squall(t) * Number(params?.stormWaves ?? 0) * stormyOf(params) * STORM.extra : 0);
