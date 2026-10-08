// The March's weather: a storm rolls through on the room's clock (scripts/lib/data/weather.yml).
// Writes place.state.storm = { on, since, until }; region-music.js reads it for the rain bed and the rain around each player.
import W from "../../scripts/lib/data/weather.yml";
import F from "../../scripts/lib/data/finder.yml";
export const cadence = "1s";
export function tick(ctx) {
  finder(ctx);
  const now = ctx.now(), P = W.periodMin * 60000, L = W.stormMin * 60000;
  const phase = (now + W.offsetMin * 60000) % P, on = phase < L;
  const s = ctx.place.state, was = !!(s.storm && s.storm.on);
  if (on !== was) {
    s.storm = { on, since: now, until: on ? now - phase + L : now - phase + P };
    const a = ctx.place.atmosphere;
    if (on) { s.calm = { fog: a.fog, clouds: a.clouds }; a.fog = { ...a.fog, ...W.storm.fog }; a.clouds = { ...a.clouds, ...W.storm.clouds }; }
    else if (s.calm) { a.fog = s.calm.fog; a.clouds = s.calm.clouds; s.calm = null; }
  }
  if (!on) return;
  if (now >= (s.thunderAt || 0)) {
    s.thunderAt = now + (W.thunder.minGap + ctx.random() * (W.thunder.maxGap - W.thunder.minGap)) * 1000;
    if (ctx.place.playerCount) {
      ctx.emit("screenFlash", { color: "oklch(0.95 0.02 250)", duration: 0.18, intensity: 0.4 }, { audience: { place: ctx.place.name || "main" } });
      ctx.emit("playSound", { clip: W.thunder.clips[Math.floor(ctx.random() * W.thunder.clips.length)], volume: 0.6, bus: "Ambience" }, { audience: { place: ctx.place.name || "main" } });
    }
  }
}

// Party Finder: prune heroes who left, pop a queue when it fills / waited long enough, carry the group in, mirror counts onto boards.
function finder(ctx) {
  const lfg = ctx.world.state.lfg;
  if (!lfg) return;
  const now = ctx.now(), here = new Map(ctx.place.players.map((p) => [p.id, p]));
  const counts = {};
  for (const d of F.dungeons) {
    const q = lfg[d.id] || {};
    let ids = Object.keys(q).filter((id) => here.has(id) && !here.get(id).state?.dying);
    if (ids.length !== Object.keys(q).length) { const k = {}; for (const id of ids) k[id] = q[id]; lfg[d.id] = k; }
    const oldest = ids.length ? Math.min(...ids.map((id) => q[id])) : now, waited = (now - oldest) / 1000;
    if (ids.length && (ids.length >= d.size || (ids.length >= F.minGroup && waited >= F.fillSec) || waited >= F.soloSec)) {
      ids = ids.sort((a, b) => q[a] - q[b]).slice(0, d.size);
      const rest = { ...(lfg[d.id] || {}) }; for (const id of ids) delete rest[id]; lfg[d.id] = rest;
      for (const id of ids) {
        const h = here.get(id), s = h.state;
        ctx.emit("damageNumber", { position: { x: h.feetPosition.x, y: h.feetPosition.y + 2.4, z: h.feetPosition.z }, text: (ids.length > 1 ? "Group of " + ids.length + " found: " : "No group yet, heading in alone: ") + d.name, color: "#f2b04a", size: 1.3, lifetime: 3 }, { audience: { player: id } });
        ctx.emit("screenFlash", { color: "#f2b04a", duration: 0.4, intensity: 0.3 }, { audience: { player: id } });
        s._worldEnterAt = now;
        if (d.tally && (!d.quest || (s.activeQuests || []).some((x) => x && x.questId === d.quest))) { s.tally = { ...(s.tally || {}), [d.tally]: (s.tally?.[d.tally] || 0) + 1 }; s._questSave = true; }
        try { ctx.cross(h, d.link); } catch (e) { ctx.log("finder cross failed", { id, link: d.link, e: String(e) }); }
      }
    }
    counts[d.id.replace(/-/g, "_")] = Object.keys(lfg[d.id] || {}).length;
  }
  const key = JSON.stringify(counts);
  if (key !== finderKey) { finderKey = key; for (const b of ctx.query({ tags: ["party-finder"] })) b.state.q = counts; }
}
let finderKey = "";
