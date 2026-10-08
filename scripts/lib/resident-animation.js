// Generated fantasy residents carry idle/walk/run, not the mannequin's named gestures.
function generatedResident(ctx) {
  const model = ctx.self.model;
  const id = typeof model === 'string' ? model : model?.id;
  return typeof id === 'string' && id.includes('/model-humanoid-fantasy-');
}
export function residentIdle(ctx, fallback) {
  const idle = ctx.self.state.idle || fallback;
  return generatedResident(ctx) && ['Idle', 'Idle_FoldArms_Loop', 'Idle_Lantern_Loop'].includes(idle) ? 'idle' : idle;
}
export function greetResident(ctx) {
  if (!generatedResident(ctx)) return false;
  ctx.session.residentBowUntil = ctx.now() + 1000;
  return true;
}
export function residentPitch(ctx) {
  const left = (ctx.session.residentBowUntil || 0) - ctx.now();
  if (left <= 0 || left > 1000) return 0;
  return Math.sin((1 - left / 1000) * Math.PI) * 6;
}
