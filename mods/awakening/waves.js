// Awakening waves (experimental): one manager for every floater on one lake. A floater is any dynamic body
// with a density (the engine floats it) tagged "floats"; optional state.dims { l, w } names its waterline.
// Each beat it reads the shared swell (lib/swell.js) at four points of each floater and holds four heave
// forces and one drift force on it: so it rides the very waves the water sheet draws. A hard slap rings
// the lake ("awakening:water-ring"). state: { lake: id of the water sheet, level, radius, center: {x,z} }.
import { swellTime, windSwell, stormSwell, gustOf, squallOpts } from "./lib/swell.js";
import { WAVES, stokes, floatPoints, heave } from "./lib/waves.js";
import { eulerFromRotation } from "builtin/vec3";

export const updateSchedule = { every: 2 }; // 15 Hz: forces hold between beats
const mem = new Map(); // this machine's scratch per floater: last slap

export function update(ctx) {
  const s = ctx.self.state, L = s.level ?? 0.6, c = s.center ?? ctx.self.feetPosition;
  const rows = ctx.query({ tags: ["floats"], center: { x: c.x, y: L, z: c.z }, radius: s.radius ?? 60 });
  if (!rows.length) return ctx.sleep(3);
  const lake = ctx.getObject(s.lake ?? "awakening-lake"), lp = lake?.material?.params ?? {};
  const sq = squallOpts(lp), t = swellTime(ctx), w0 = ctx.place.atmosphere?.wind ?? { direction: 0, speed: 3 };
  const gust = gustOf(t, lp), ws = (w0.speed ?? 3) + gust;
  const sw = (lp.swell ?? 1) * (windSwell(ws) + stormSwell(t, lp));
  const wsDrift = (w0.speed ?? 3) + (sq.push || Number(lp.stormWaves ?? 0) > 0 ? gust : 0); // the squall shoves floaters only when a weather switch lets it
  const wr = ((w0.direction ?? 0) * Math.PI) / 180, st = stokes(sw);
  const drift = { x: st.x - Math.sin(wr) * wsDrift * WAVES.leeway, z: st.z - Math.cos(wr) * wsDrift * WAVES.leeway };
  const now = ctx.now();
  let riding = 0;
  for (const r of rows) {
    const o = ctx.getObject(r.id); if (!o) continue;
    const b = o.bounds, m = o.measure, pos = o.feetPosition, v = o.velocity ?? { x: 0, y: 0, z: 0 };
    const g = ctx.place.terrain.heightAt(pos.x, pos.z) ?? -99;
    const mid = b ? b.center.y : pos.y;
    const afloat = b && m && g < L - 0.1 && Math.abs(mid - L) < WAVES.band;
    if (!afloat) { if (o.forces.wave0) for (const k of ["wave0", "wave1", "wave2", "wave3", "drift"]) o.forces[k] = null; continue; }
    const h = Math.max(0.05, b.size.y), area = m.volume / h;
    const d = o.state?.dims ?? { l: Math.sqrt(area), w: Math.sqrt(area) };
    const yaw = typeof o.rotation === "number" ? o.rotation : (eulerFromRotation(o.rotation)?.yaw ?? 0);
    let slap = 0;
    floatPoints(pos, yaw, d.l, d.w).forEach((p, i) => {
      const hv = heave(p, mid, v.y, t, sw, area, m.mass, 4);
      o.forces["wave" + i] = { force: { x: 0, y: hv.f, z: 0 }, position: { x: p.x, y: mid, z: p.z } };
      slap = Math.max(slap, Math.abs(hv.rel));
    });
    riding++;
    const k = m.mass * WAVES.follow;
    o.forces.drift = { force: { x: (drift.x - v.x) * k, y: 0, z: (drift.z - v.z) * k } };
    const me = mem.get(r.id) ?? {}; mem.set(r.id, me);
    if (slap > WAVES.slap && now - (me.at ?? 0) > 1800) { me.at = now; ctx.emit("awakening:water-ring", { x: pos.x, z: pos.z, strength: Math.min(1, slap) }); }
  }
  if (now - (mem.logAt ?? 0) > 10000) { mem.logAt = now; ctx.log("waves", { floaters: rows.length, riding, sw: Math.round(sw * 100) / 100 }); }
}
