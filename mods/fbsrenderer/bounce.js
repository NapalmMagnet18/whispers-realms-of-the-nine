// FBsRenderer — a bounce light, instant radiosity by hand. Stand one where a lamp's light lands (floor pool,
// ceiling patch, wall behind the shade), wearing that surface's colour, no shadow.
// state.src = the lamp's id, state.k = the share that comes back (default lib/tuning BOUNCE.share).
// It follows its lamp live and leaves the light list when dark (a dark light still costs a tile slot).
import { BOUNCE } from "./lib/tuning.js";
export const updateSchedule = { every: 2 };
export function update(ctx) {
  const s = ctx.self.state, src = ctx.getObject(s.src);
  if (!src || !src.light) return;
  const want = (src.light.intensity ?? 0) * (s.k ?? BOUNCE.share);
  const l = ctx.self.light;
  if (Math.abs((l.intensity ?? 0) - want) > BOUNCE.epsilon) ctx.self.light = { ...l, intensity: want };
  const on = want > BOUNCE.offBelow;
  if (ctx.self.visible !== on) ctx.self.visible = on;
}
