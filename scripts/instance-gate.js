// A dungeon or raid door (and its twin inside): walking into the glass carries the hero to state.link ("+place#gate").
// state.minLevel: heroes below it are turned back with a line saying why. state.enterTally: a quest step counted on entry, only while state.enterQuest is active.
// The world's doorway (scripts/arrival.js) sends any un-stamped arrival back to the menu, so the gate stamps _worldEnterAt first.
export function onTriggerEnter(ctx, other) {
  if (!other || !(other.tags || []).includes("player")) return;
  const s = other.state || {}, g = ctx.self.state || {};
  if (!s.characterCreated || s.phase === "creating" || s.dying) return;
  const now = ctx.now();
  if (g.minLevel && (s.level || 1) < g.minLevel) {
    if (now - (ctx.session["refused:" + other.id] || 0) > 3000) {
      ctx.session["refused:" + other.id] = now;
      const p = other.feetPosition;
      ctx.emit("damageNumber", { position: { x: p.x, y: p.y + 2.2, z: p.z }, text: `${g.name || "This door"} needs level ${g.minLevel}`, color: "oklch(0.8 0.15 40)", size: 1.1, lifetime: 2.2 }, { audience: { player: other.id } });
      ctx.emit("playSound", { clip: "/cdn/moodboard-gothic-horror/sfx-heavy-stone-door-grind-echo.mp3", position: p, volume: 0.4 }, { audience: { player: other.id } });
    }
    return;
  }
  s._worldEnterAt = now;
  if (g.enterTally && (!g.enterQuest || (s.activeQuests || []).some((q) => q && q.questId === g.enterQuest))) { s.tally = { ...(s.tally || {}), [g.enterTally]: (s.tally?.[g.enterTally] || 0) + 1 }; s._questSave = true; }
  ctx.cross(other, g.link);
}
export function onCross(ctx) {
  const p = ctx.self.worldFeetPosition ?? ctx.self.feetPosition;
  ctx.emit("playSound", { clip: ctx.self.state.sound || "/cdn/moodboard-gothic-horror/sfx-heavy-stone-door-grind-echo.mp3", position: p, volume: 0.6 }, { audience: { nearby: p, radius: 30 } });
}
export function onRefuse(ctx, other, verdict) { ctx.log("instance gate refused", { link: ctx.self.state.link, verdict }); }
