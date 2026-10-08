// Area themes: each player hears the theme of where they stand (menu, character select, the region of the March,
// the crypt), crossfaded as they cross a border. Per player, so two heroes in two regions hear two songs.
// Steps aside while the jukebox tab plays a chosen track, and stays silent when the player muted music.
import MUSIC from "./lib/data/music.yml";
import { isPlay } from './lib/places.js';
export const updateSchedule = { every: { seconds: 0.5 } };

// per-machine module cache: the region table is code, not shared state
let regionsMod = null, loading = false;

function themeFor(ctx, self) {
  const place = self.place;
  if (MUSIC.places[place]) return MUSIC.places[place];
  if (place !== "main") return "wilds";
  if (!regionsMod) {
    if (!loading) { loading = true; import("./lib/regions.js").then((m) => { regionsMod = m; }); }
    return null;
  }
  const p = self.feetPosition;
  for (const g of regionsMod.REGIONS) {
    if (g.test ? g.test(p.x, p.z) : Math.hypot(p.x - g.x, p.z - g.z) < g.r) { zoneSting(ctx, self, g.id); return MUSIC.regions[g.id] || "wilds"; }
  }
  zoneSting(ctx, self, "march");
  return "wilds";
}

export function update(ctx) {
  const self = ctx.self;
  const s = self.state || {};
  if (typeof s.activeTrack === "number" && s.activeTrack >= 0) { ctx.session._areaTheme = null; return; } // the jukebox has it
  if (s.musicMuted) { ctx.session._areaTheme = null; return; }
  const now0 = ctx.now(), C = MUSIC.combat;
  // a fight: my hp dropped, or something near me carries my last hit
  const hp = s.hp;
  if (typeof hp === "number" && typeof ctx.session._lastHp === "number" && hp < ctx.session._lastHp) ctx.session._fightAt = now0;
  ctx.session._lastHp = hp;
  if (isPlay(self.place)) {
    for (const r of ctx.query({ radius: C.radius, excludeTags: ["player", "dummy", "training-dummy"] })) {
      const st = r.state;
      if (st && st.lastHitBy === self.id && now0 - (st.lastHitAt || 0) < 4000 && (st.hp ?? 1) > 0) { ctx.session._fightAt = now0; break; }
    }
  }
  const fighting = now0 - (ctx.session._fightAt || 0) < C.holdSeconds * 1000 && !MUSIC.places[self.place];
  const area = themeFor(ctx, self);
  ambience(ctx, self, area);
  const hushing = (s._hushUntil || 0) > now0;
  if (hushing) ctx.session._fightAt = now0; // the boss is speaking: the fight is on, the music holds its breath
  const theme = hushing ? "hush" : fighting ? "battle" : area;
  if (!theme) return;
  const vol = typeof s.musicVolume === "number" ? s.musicVolume * MUSIC.volume : MUSIC.volume;
  if (theme === "hush") { if (ctx.session._areaTheme !== "hush") { ctx.session._areaTheme = "hush"; ctx.session._hushed = true; ctx.musicShift(MUSIC.themes.battle, { fade: 0.25, volume: 0.001, audience: { kind: "player", id: self.id } }); } return; }
  const key = theme + "|" + vol.toFixed(2);
  const now = ctx.now();
  // re-assert every 20 s too: a menu or place change elsewhere in the kit may have set its own track
  if (ctx.session._areaTheme === key && now - (ctx.session._areaAt || 0) < 20000) return;
  ctx.session._areaTheme = key; ctx.session._areaAt = now;
  const slam = theme === "battle" && ctx.session._hushed; ctx.session._hushed = false;
  if (slam) ctx.emit("playSound", { clip: "/cdn/moodboard-painterly-fantasy/sfx-huge-war-drum-and-brass-hit-boss-fight-begins.mp3", volume: 0.7, bus: "Music" }, { audience: { player: self.id } });
  ctx.musicShift(MUSIC.themes[theme], { fade: theme === "battle" ? (ctx.session._hushed ? 0.15 : C.fade) : MUSIC.fade, volume: vol, audience: { kind: "player", id: self.id } });
}

// The area's bed under the music, and now and then a far-off one-shot only this player hears (a crow, a toll, a howl).
function ambience(ctx, self, area) {
  const key = MUSIC.places[self.place] ? self.place : area;
  if (!key) return;
  const theme = MUSIC.places[self.place] || area;
  const bed = MUSIC.ambience?.[theme] ?? null;
  if (ctx.session._ambBed !== bed) { ctx.session._ambBed = bed; self.ambience = bed; }
  const S = MUSIC.stingers, set = S?.sets?.[theme];
  if (!set || !set.length) return;
  const now = ctx.now();
  if (!ctx.session._stingAt) { ctx.session._stingAt = now + (S.every[0] + ctx.random() * (S.every[1] - S.every[0])) * 1000; return; }
  if (now < ctx.session._stingAt) return;
  ctx.session._stingAt = now + (S.every[0] + ctx.random() * (S.every[1] - S.every[0])) * 1000;
  const clip = set[Math.floor(ctx.random() * set.length)];
  ctx.emit("playSound", { clip, volume: S.volume * (0.7 + ctx.random() * 0.3), pitch: 0.92 + ctx.random() * 0.12, bus: "Ambience" });
}

// WoW-style: crossing into an area plays a short sting under the banner the HUD draws; the first time ever, a bigger one.
// The sea is skipped: its border wobbles with the coast.
function zoneSting(ctx, self, id) {
  const was = ctx.session._zone; ctx.session._zone = id;
  if (was === id || id === "sea") return;
  if (was === undefined) return; // the first read after a load: you were already here
  const st = self.state, seen = st.discoveredZones || [];
  const fresh = !seen.includes(id);
  if (fresh) st.discoveredZones = [...seen, id];
  const Z = MUSIC.zoneSting || {};
  const clip = fresh ? Z.discover : Z.enter;
  if (clip && !(st.flying)) ctx.emit("playSound", { clip, volume: fresh ? 0.55 : 0.35, bus: "Music" });
}
