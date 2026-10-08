// On each timber oak (tags timber, gatherable): logsLeft / depletedUntil are written by the chopper's
// scripts/quest-player.js; this behavior only shows it: a felled oak tips over away from its chopper with a crash,
// lies there regrowSeconds, then stands again full (logsLeft back to logsPerTree). Numbers: quests.yml woodcutting.
import Q from './lib/data/quests.yml';
const W = Q.woodcutting;

export const updateSchedule = { every: { seconds: 0.05 } };
export function onSpawn(ctx) {
  const st = ctx.self.state;
  st.logsLeft ??= W.logsPerTree;
  if (st.baseYaw === undefined) { const r = ctx.self.rotation; st.baseYaw = (r && typeof r.yaw === 'number') ? r.yaw : 0; }
}
export function update(ctx, dt) {
  const st = ctx.self.state;
  const down = (st.depletedUntil || 0) > ctx.now();
  if (!down && st.depletedUntil) { st.depletedUntil = 0; st.logsLeft = W.logsPerTree; }
  const goal = down ? W.fallAngle : 0;
  const tilt = st.tilt || 0;
  if (tilt === goal) { if (!down) ctx.sleep(1); return; }
  if (down && tilt === 0) {
    const f = st.fellFrom || { x: ctx.self.feetPosition.x + 1, z: ctx.self.feetPosition.z };
    // fall away from the chopper: the direction from them to the trunk
    st.fallYaw = Math.atan2(-(ctx.self.feetPosition.x - f.x), -(ctx.self.feetPosition.z - f.z)) * 180 / Math.PI;
    ctx.emit('playSound', { clip: W.fallSound, position: ctx.self.feetPosition, volume: 0.7, maxDistance: 60 });
  }
  const rate = down ? W.fallAngle / W.fallSeconds * (0.35 + 1.3 * tilt / W.fallAngle) : 60;
  const next = goal > tilt ? Math.min(goal, tilt + rate * dt) : Math.max(goal, tilt - rate * dt);
  st.tilt = next;
  // turn to the fall heading, pitch forward (−pitch tips −Z down), keep the oak's own yaw when upright
  ctx.self.rotation = next > 0 ? { yaw: st.fallYaw ?? 0, pitch: -next, roll: 0 } : { yaw: st.baseYaw || 0 };
}
