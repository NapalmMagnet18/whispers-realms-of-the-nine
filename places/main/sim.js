// The March's weather: a storm rolls through on the room's clock (scripts/lib/data/weather.yml).
// Writes place.state.storm = { on, since, until }; region-music.js reads it for the rain bed and the rain around each player.
import W from "../../scripts/lib/data/weather.yml";
export const cadence = "1s";
export function tick(ctx) {
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
