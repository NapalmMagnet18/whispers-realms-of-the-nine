// a hidden chest: its lid (state.lid, a separate object hinged at the back edge) swings open while state.openUntil is ahead
export const updateSchedule = { every: { seconds: 0.05 } };
export function update(ctx, dt) {
  const s = ctx.self.state, lid = s.lid && ctx.place.objects[s.lid];
  if (!lid) return ctx.sleep(2);
  const want = (s.openUntil || 0) > ctx.now() ? 1 : 0, t = ctx.session.t ?? 0;
  if (t === want) return ctx.sleep(0.5);
  const nt = Math.max(0, Math.min(1, t + (want ? 1 : -1) * dt * 1.8));
  ctx.session.t = nt;
  const e = nt * nt * (3 - 2 * nt);
  lid.rotation = { yaw: s.yaw || 0, pitch: e * 105 };
}
