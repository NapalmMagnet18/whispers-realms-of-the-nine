// A resident of Lantern's Reach at their post (Elric's pattern): idles in their own clip, turns to whoever walks up,
// nods to them now and then, turns back to their watch. state: { who, homeYaw, idle }. Their talk lives on the
// player's side (scripts/quest-player.js reads scripts/lib/data/townsfolk.yml); distances are quests.yml npc.
import Q from './lib/data/quests.yml';
const N = Q.npc;

export function onSpawn(ctx) {
  ctx.self.anim.base = { clip: ctx.self.state.idle || 'Idle_FoldArms_Loop', weight: 1, loop: 'loop' };
  ctx.self.state.homeYaw ??= ctx.self.state.yaw ?? 0;
}
export const updateSchedule = { every: { seconds: 0.25 } };
export function update(ctx, dt) {
  const me = ctx.self.feetPosition;
  let best = null, bd = N.greetReach;
  for (const p of ctx.place.players) { const d = Math.hypot(p.feetPosition.x - me.x, p.feetPosition.z - me.z); if (d < bd) { bd = d; best = p; } }
  const want = best ? Math.atan2(-(best.feetPosition.x - me.x), -(best.feetPosition.z - me.z)) * 180 / Math.PI : ctx.self.state.homeYaw;
  const yaw = ctx.self.state.yaw ?? ctx.self.state.homeYaw;
  const diff = ((want - yaw + 540) % 360) - 180;
  if (Math.abs(diff) > 2) {
    const ny = yaw + Math.sign(diff) * Math.min(Math.abs(diff), 200 * dt);
    ctx.self.state.yaw = ny; ctx.self.rotation = { yaw: ny };
  }
  if (best && ctx.now() > (ctx.self.state.nextGreet ?? 0)) {
    ctx.self.state.nextGreet = ctx.now() + N.greetCooldown * 1000;
    ctx.self.anim.gesture = { clip: 'Yes', weight: 3, loop: 'once', mask: { from: 'spine_02' } };
  }
}
