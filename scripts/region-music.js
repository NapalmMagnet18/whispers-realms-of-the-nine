// Area themes: each player hears the theme of where they stand (menu, character select, the region of the March,
// the crypt), crossfaded as they cross a border. Per player, so two heroes in two regions hear two songs.
// Steps aside while the jukebox tab plays a chosen track, and stays silent when the player muted music.
import WEATHER from "./lib/data/weather.yml";
import MUSIC from "./lib/data/music.yml";
import { isPlay } from './lib/places.js';
export const updateSchedule = { every: { seconds: 0.5 } };

// per-machine module cache: the region table is code, not shared state
let regionsMod = null, loading = false;

// a theme is one track or a playlist: each track plays through, then the next; the menu opens on its first, an area on a random one
function trackOf(ctx, theme) {
  const t = MUSIC.themes[theme];
  if (!Array.isArray(t)) return t;
  const pl = ctx.session._pl || (ctx.session._pl = {}), now = ctx.now();
  let r = pl[theme];
  if (!r || ctx.session._plLast !== theme) { r = pl[theme] = { i: r ? r.i + 1 : (theme === "menu" || theme === "creation" ? 0 : Math.floor(ctx.random() * t.length)), at: now }; }
  ctx.session._plLast = theme;
  const len = ctx.world.assets?.[t[r.i % t.length]]?.duration || 150;
  if (now - r.at > (len - 2) * 1000) { r.i++; r.at = now; }
  return t[r.i % t.length];
}

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
  if (theme === "hush") { if (ctx.session._areaTheme !== "hush") { ctx.session._areaTheme = "hush"; ctx.session._hushed = true; ctx.musicShift(trackOf(ctx, "battle"), { fade: 0.25, volume: 0.001, audience: { kind: "player", id: self.id } }); } return; }
  const ref = trackOf(ctx, theme);
  const key = ref + "|" + vol.toFixed(2);
  const now = ctx.now();
  // re-assert every 20 s too: a menu or place change elsewhere in the kit may have set its own track
  if (ctx.session._areaTheme === key && now - (ctx.session._areaAt || 0) < 20000) return;
  ctx.session._areaTheme = key; ctx.session._areaAt = now;
  const slam = theme === "battle" && ctx.session._hushed; ctx.session._hushed = false;
  if (slam) ctx.emit("playSound", { clip: "/cdn/moodboard-painterly-fantasy/sfx-huge-war-drum-and-brass-hit-boss-fight-begins.mp3", volume: 0.7, bus: "Music" }, { audience: { player: self.id } });
  ctx.musicShift(ref, { fade: theme === "battle" ? (ctx.session._hushed ? 0.15 : C.fade) : MUSIC.fade, volume: vol, audience: { kind: "player", id: self.id } });
}

// The area's bed under the music, and now and then a far-off one-shot only this player hears (a crow, a toll, a howl).
function ambience(ctx, self, area) {
  const key = MUSIC.places[self.place] ? self.place : area;
  if (!key) return;
  const theme = MUSIC.places[self.place] || area;
  const storm = self.place === "main" && ctx.place.state?.storm?.on;
  rain(ctx, storm);
  woodlight(ctx, self.place === "main" && !storm && FOREST.has(ctx.session._zone) ? (self.place === "main" && isNight(ctx) ? "night" : "day") : null);
  const N = MUSIC.night, h = self.place === "main" ? ctx.place.atmosphere?.timeOfDay : null;
  const night = !!N && typeof h === "number" && (h >= N.from || h < N.until);
  const bed = storm ? WEATHER.rainBed : ((night && N.ambience?.[theme]) || MUSIC.ambience?.[theme] || null);
  if (ctx.session._ambBed !== bed) { ctx.session._ambBed = bed; self.ambience = bed; }
  const nightSet = night && !storm ? N.stingers?.sets?.[theme] : null;
  const S = nightSet ? { ...MUSIC.stingers, every: N.stingers.every } : MUSIC.stingers, set = nightSet || S?.sets?.[theme];
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

// the rain around this player alone, riding their camera, while the March storms
const RAIN = `fx follow=camera
pop rain rate=?mobile:350|900 on=disc(16).c(11) life=.8..1 v=<-1.5,-15,0>+sdir()*.3 size=.015..0.025 col=<.72,.76,.86> a=.4 floor=die r=sprite(stalk,alpha,velocity,.05)
pop splash rate=?mobile:40|120 on=disc(9).c(.05) life=.25 v=up(.6..1.2)+sdir()*.5 size=.04..0.07 acc=grav() col=<.8,.84,.92> a=.45>0 r=sprite(soft-disc,alpha)`;
function rain(ctx, on) {
  const id = ctx.session._rainId;
  if (on && !id) ctx.session._rainId = ctx.spawn({ audience: "local", scope: "session", feetPosition: { x: 0, y: 0, z: 0 }, fx: { script: RAIN } });
  else if (!on && id) { ctx.destroy(id); ctx.session._rainId = null; }
}

// the woods' own light around this player, riding their camera: fireflies and drifting wisps after dusk, pollen motes by day
const FOREST = new Set(["briarwild", "deepwood", "deepgrove", "thornhollow", "petalfall", "sorrowfen", "elderveil"]);
function isNight(ctx) { const N = MUSIC.night, h = ctx.place.atmosphere?.timeOfDay; return !!N && typeof h === "number" && (h >= N.from || h < N.until); }
const WOODS_NIGHT = `fx follow=camera
pop flies n=?mobile:22|50 on=disc(18).c(1.4) life=5..9 v=sdir()*(.1..0.3) size=.03..0.06 acc=curl(.35)*.5+drag(.6) col=hdr(2.4,3.4,.8) a=(0>.15:1>.85:1>0)*flick(.7,.95) r=sprite(mote,add)
pop wisp n=?low:1|3 on=disc(14).c(1.6) life=10..16 v=sdir()*(.2..0.4) size=.28..0.4 acc=curl(.15)*.4+drag(.4) col=hdr(.8,2.2,2.6) a=(0>.2:.85>.8:.85>0)*flick(1.3,.25) sz=$size*flick(2,.12) r=sprite(soft-disc,add)
pop trail on=@wisp?.6 inh=p life=.8..1.4 v=sdir()*.05 size=.05..0.09 col=hdr(.7,1.8,2.2) a=.7>0 sz=$size*(1>.3) r=sprite(mote,add)
pop glow n=?low:0|2 on=disc(12).c(1.6) life=10..16 v=sdir()*(.2..0.35) acc=curl(.15)*.4+drag(.4) gl=(0>.2:1>.8:1>0) r=light(<.45,.95,1>,$gl*1.2,6,perParticle)`;
const WOODS_DAY = `fx follow=camera
pop motes n=?mobile:16|36 on=disc(14).c(2.5) life=6..10 v=sdir()*(.05..0.15) size=.015..0.035 acc=curl(.2)*.3+wind()*.1+drag(.5) col=hdr(1.6,1.45,1) a=(0>.2:.55>.8:.55>0)*flick(2,.4) r=sprite(mote,add)`;
function woodlight(ctx, kind) {
  if (ctx.session._woodKind === kind) return;
  if (ctx.session._woodId) { ctx.destroy(ctx.session._woodId); ctx.session._woodId = null; }
  ctx.session._woodKind = kind;
  if (kind) ctx.session._woodId = ctx.spawn({ audience: "local", scope: "session", feetPosition: { x: 0, y: 0, z: 0 }, fx: { script: kind === "night" ? WOODS_NIGHT : WOODS_DAY } });
}
