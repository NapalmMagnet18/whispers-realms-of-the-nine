// Area themes: each player hears the theme of where they stand (menu, character select, the region of the March,
// the crypt), crossfaded as they cross a border. Per player, so two heroes in two regions hear two songs.
// Steps aside while the jukebox tab plays a chosen track, and stays silent when the player muted music.
import MUSIC from "./lib/data/music.yml";
export const updateSchedule = { every: { seconds: 2 } };

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
    if (g.test ? g.test(p.x, p.z) : Math.hypot(p.x - g.x, p.z - g.z) < g.r) return MUSIC.regions[g.id] || "wilds";
  }
  return "wilds";
}

export function update(ctx) {
  const self = ctx.self;
  const s = self.state || {};
  if (typeof s.activeTrack === "number" && s.activeTrack >= 0) { ctx.session._areaTheme = null; return; } // the jukebox has it
  if (s.musicMuted) { ctx.session._areaTheme = null; return; }
  const theme = themeFor(ctx, self);
  if (!theme) return;
  const vol = MUSIC.volume * (typeof s.musicVolume === "number" ? s.musicVolume / 0.5 * 0.5 + 0.5 * s.musicVolume : 1);
  const key = theme + "|" + vol.toFixed(2);
  const now = ctx.now();
  // re-assert every 20 s too: a menu or place change elsewhere in the kit may have set its own track
  if (ctx.session._areaTheme === key && now - (ctx.session._areaAt || 0) < 20000) return;
  ctx.session._areaTheme = key; ctx.session._areaAt = now;
  ctx.musicShift(MUSIC.themes[theme], { fade: MUSIC.fade, volume: vol, audience: { kind: "player", id: self.id } });
}
