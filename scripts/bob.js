// a moored boat riding the swell: a slow heave and a gentle roll, sleeps when nobody is near
export const updateSchedule = { every: 2 };
export function update(ctx) {
  const s = ctx.self, t = ctx.now() / 1000;
  if (s.state.baseY == null) { s.state.baseY = s.feetPosition.y; s.state.yaw = typeof s.rotation === "number" ? s.rotation : 45; }
  s.feetPosition = { x: s.feetPosition.x, y: s.state.baseY + Math.sin(t * 0.9) * 0.08, z: s.feetPosition.z };
  s.rotation = { yaw: s.state.yaw, roll: Math.sin(t * 0.7) * 3, pitch: Math.sin(t * 0.55 + 1) * 1.5 };
}
