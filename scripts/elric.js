// Gatekeeper Elric at the west gate: stands at ease, turns to whoever walks up and salutes them now and then,
// and turns back to watch the square. Talk and the quest live in scripts/quest-player.js (the player's side);
// his quest marker and nameplate are drawn by the HUD (lib/ui-quest.js renderQuestTracker).
// distances mirror quests.yml npc, inlined so the spawn cell's boot never carries the quest book
const N = { talkReach: 3.5, greetReach: 7, greetCooldown: 20, sayLength: 5 };
import { residentIdle, greetResident, residentPitch } from './lib/resident-animation.js';

export function onSpawn(ctx) {
  ctx.self.anim.base = { clip: residentIdle(ctx, 'Idle_FoldArms_Loop'), weight: 1, loop: 'loop' };
  ctx.self.state.homeYaw ??= ctx.self.state.yaw ?? -90;
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
    const ny = yaw + Math.sign(diff) * Math.min(Math.abs(diff), 240 * dt);
    ctx.self.state.yaw = ny;
  }
  if (best && ctx.now() > (ctx.self.state.nextGreet ?? 0)) {
    ctx.self.state.nextGreet = ctx.now() + N.greetCooldown * 1000;
    if (!greetResident(ctx)) ctx.self.anim.gesture = { clip: 'cdn/clip-salute.glb', weight: 4, loop: 'once', mask: { from: 'spine_02' }, duration: 2 };
  }
  const pitch = residentPitch(ctx);
  if (Math.abs(diff) > 2 || pitch !== (ctx.session.residentPitch || 0)) ctx.self.rotation = { yaw: ctx.self.state.yaw ?? yaw, pitch };
  ctx.session.residentPitch = pitch;
}
