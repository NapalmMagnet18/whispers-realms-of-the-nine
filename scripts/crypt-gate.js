// The Hollowcrypt's gate pair: walking into the glass carries the body to the twin gate (state.link, "+place#gate").
// The world's doorway (scripts/arrival.js) sends any un-stamped arrival back to the menu, so the gate stamps the hero's
// _worldEnterAt first: this crossing is play, not a fresh join.
export function onTriggerEnter(ctx, other) {
  if (!other || !(other.tags || []).includes("player")) return;
  const s = other.state || {};
  if (!s.characterCreated || s.phase === "creating") return;
  s._worldEnterAt = ctx.now();
  ctx.cross(other, ctx.self.state.link);
}
export function onCross(ctx, other) {
  ctx.emit("playSound", { clip: "/cdn/moodboard-gothic-horror/sfx-heavy-stone-door-grind-echo.mp3", position: ctx.self.worldFeetPosition ?? ctx.self.feetPosition, volume: 0.6 }, { audience: { nearby: ctx.self.feetPosition, radius: 30 } });
}
export function onRefuse(ctx, other, verdict) {
  ctx.log("crypt gate refused", { verdict });
}
