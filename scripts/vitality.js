// A player's fall and rise, and mending out of combat. Enemies write state.health; this reads it.
// health ≤ 0 → dying for FALL_S (input already blocked by the mod while dying) → stand where they last stood safe at RISE_PCT.
const FALL_S = 2.5, RISE_PCT = 0.5, CALM_S = 8, MEND_PER_S = 0.03; // mend 3% of max a second once 8 s unhurt
import { nearestRoost, PVP, pvpRealm, sanctuaryAt } from "./lib/pvp.js";
const SAFE_HOME = { hollowcrypt: { x: 0, y: 0.3, z: -4 } }; // the vestibule, by the residents
export const updateSchedule = { every: { seconds: 0.25 } };
export function update(ctx, dt) {
  const me = ctx.self, s = me.state, mem = ctx.session, now = ctx.now();
  if (!s.characterCreated || s.phase !== "playing" || s.pvpDead) return;
  if (me.place !== "main" && me.place !== "hollowcrypt") return;
  if (mem.zoneAt !== Math.floor(now / 1000)) { // once a second: which ground am I on, on a PvP realm
    mem.zoneAt = Math.floor(now / 1000);
    const fp = me.feetPosition, safe = me.place === "main" && pvpRealm(ctx) ? sanctuaryAt(fp.x, fp.z) : null;
    const zone = me.place === "main" && pvpRealm(ctx) ? (safe ? "sanctuary" : "contested") : null;
    if (s.pvpZone !== zone) {
      const was = s.pvpZone; s.pvpZone = zone; s.pvpSanctuary = safe ? safe.name : null;
      if (was !== undefined && zone) ctx.emit("damageNumber", { position: { ...fp, y: fp.y + 2.6 }, text: zone === "sanctuary" ? "Sanctuary: " + safe.name : "Contested ground", color: zone === "sanctuary" ? "#9fe08a" : "#ff6a55", size: 1.1, lifetime: 2 }, { audience: { player: me.id } });
    }
  }
  const max = s.maxHealth || 1000, hp = s.health ?? max;
  if (mem.vitPlace !== me.place) { mem.vitPlace = me.place; mem.safe = null; }
  if (hp < (mem.lastHp ?? hp)) mem.hurtAt = now;
  mem.lastHp = hp;
  if (s.dying) {
    if (s._fellAt && now - s._fellAt >= FALL_S * 1000) {
      let at = mem.safe || SAFE_HOME[me.place] || null;
      if (s._pvpFall) { const g = nearestRoost(me.feetPosition.x, me.feetPosition.z); if (g) { const h = ctx.place.terrain?.heightAt?.(g.x + 4, g.z + 4); at = { x: g.x + 4, y: Math.max(g.y, typeof h === "number" ? h : g.y), z: g.z + 4 }; } s.pvpShieldUntil = now + (PVP.shieldSeconds || 15) * 1000; s._pvpFall = false; }
      if (at) { me.feetPosition = { x: at.x, y: at.y + 0.3, z: at.z }; }
      me.velocity = { x: 0, y: 0, z: 0 };
      s.health = Math.round(max * RISE_PCT); mem.lastHp = s.health; mem.hurtAt = now;
      s.dying = false; s._fellAt = null; s._questSave = true;
      ctx.emit("screenFlash", { color: "oklch(0.92 0.06 85)", duration: 0.6, intensity: 0.35 }, { audience: { player: me.id } });
      ctx.emit("damageNumber", { position: { ...me.feetPosition, y: me.feetPosition.y + 2.2 }, text: "On your feet", color: "#f2d48a", size: 1.1, lifetime: 1.6 }, { audience: { player: me.id } });
    } else if (!s._fellAt) s._fellAt = now; // a fall the save carried over
    return;
  }
  if (hp <= 0) {
    s.dying = true; s._fellAt = now; me.velocity = { x: 0, y: me.velocity.y, z: 0 };
    if (s.lastPvpBy && now - (s.lastPvpAt || 0) < (PVP.creditSeconds || 8) * 1000) { // a hero felled me: their kill
      s._pvpFall = true; s.pvpDeaths = (s.pvpDeaths || 0) + 1;
      const k = ctx.getObject(s.lastPvpBy);
      if (k && k.state) { k.state.pvpKills = (k.state.pvpKills || 0) + 1; ctx.emit("damageNumber", { position: { ...k.feetPosition, y: k.feetPosition.y + 2.4 }, text: "Felled " + (s.charName || "a hero"), color: "#ff6a55", size: 1.2, lifetime: 2 }, { audience: { player: k.id } }); }
      ctx.emit("damageNumber", { position: { ...me.feetPosition, y: me.feetPosition.y + 2.8 }, text: (s.lastPvpName || "A hero") + " fells " + (s.charName || "a hero"), color: "#ff8a70", size: 1.1, lifetime: 3 }, { audience: { nearby: me.feetPosition, radius: 80 } });
      s.lastPvpBy = null;
    }
    ctx.emit("screenFlash", { color: "oklch(0.25 0.12 25)", duration: FALL_S, intensity: 0.75 }, { audience: { player: me.id } });
    ctx.emit("damageNumber", { position: { ...me.feetPosition, y: me.feetPosition.y + 2.2 }, text: "You fall", color: "#e25b4a", size: 1.3, lifetime: 2.2 }, { audience: { player: me.id } });
    ctx.emit("playSound", { clip: "/cdn/moodboard-painterly-fantasy/sfx-hero-falls-low-thud-and-fading-breath.mp3", position: me.feetPosition, volume: 0.8 });
    return;
  }
  const calm = now - (mem.hurtAt ?? 0) > CALM_S * 1000;
  if (calm && me.grounded) {
    const p = me.feetPosition, k = Math.floor(now / 2000);
    if (mem.safeAt !== k) { mem.safeAt = k; mem.safe = { x: p.x, y: p.y, z: p.z }; }
    if (hp < max) s.health = Math.min(max, hp + Math.max(1, Math.round(max * MEND_PER_S * dt))), mem.lastHp = s.health;
  }
}
