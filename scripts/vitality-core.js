// A player's fall and rise, and mending out of combat. Enemies write state.health; this reads it.
// health ≤ 0 → dying for FALL_S (input already blocked by the mod while dying) → stand where they last stood safe at RISE_PCT.
const FALL_S = 2.5, RISE_PCT = 0.5, CALM_S = 8, MEND_PER_S = 0.03; // mend 3% of max a second once 8 s unhurt
import { nearestRoost, PVP, pvpRealm, sanctuaryAt } from "./lib/pvp.js";
import BG from "./lib/data/battleground.yml";
import { isPlay, SAFE_HOME } from './lib/places.js';
const SND = {
  heart: "/cdn/moodboard-gothic-horror/sfx-low-health-heavy-heartbeat-single-thump-muffled-deep.mp3",
  grunt: ["/cdn/moodboard-painterly-fantasy/sfx-hero-pain-grunt-sharp-exhale-hit-taken.mp3", "/cdn/moodboard-painterly-fantasy/sfx-hero-pain-grunt-strained-groan-hit-taken.mp3"],
  fall: "/cdn/moodboard-gothic-horror/sfx-death-sting-dark-low-brass-swell-and-deep-bell-toll.mp3",
  rise: "/cdn/moodboard-painterly-fantasy/sfx-resurrection-soft-angelic-choir-swell-warm-shimmer.mp3",
};
// Food (the bag's useFood { index }): WoW-style, heal across eatSeconds, broken the moment you are struck
const MNS = 'mmorpg-tools:';
const pressed = (input, n) => !!((input.pressed && (input.pressed[n] || input.pressed[MNS + n])) || (input.actions && (input.actions[n] || input.actions[MNS + n])));
const FOOD = { bite: "/cdn/moodboard-painterly-fantasy/sfx-eating-a-bite-of-cooked-fish-soft-chew-and-crunch.mp3", done: "/cdn/moodboard-painterly-fantasy/sfx-satisfied-content-sigh-after-a-meal.mp3" };
const BLOOD = { seconds: 180, cost: 0.2, sound: "/cdn/moodboard-gothic-horror/sfx-blood-pact-deep-war-drum-heartbeat-and-dark-choir-whisper-swell.mp3",
  aura: `fx
pop drip rate=8 on=disc(.45).c(1) life=.8..1.3 v=up(.3..0.8) size=.04..0.07 acc=curl(.4)+buoy(.2) col=hdr(2.6,.25,.15) a=0>.2:.9>.7:.6>0 r=sprite(ember,add)` };
function offerBlood(ctx) {
  const me = ctx.self, s = me.state, now = ctx.now(), fp = me.feetPosition, to = { audience: { player: me.id } };
  const sh = ctx.query({ tags: ['blood-shrine'], radius: 5 })[0]; if (!sh) return false;
  if ((s.bloodUntil || 0) > now) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'The shrine is sated. ' + Math.ceil((s.bloodUntil - now) / 1000) + 's', color: '#e2876a', size: 0.95, lifetime: 1.6 }, to); return true; }
  const max = s.maxHealth || 1000, cost = Math.round(max * BLOOD.cost);
  if ((s.health ?? max) <= cost + 1) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'Too weak to bleed for it', color: '#e2876a', size: 0.95, lifetime: 1.6 }, to); return true; }
  s.health = (s.health ?? max) - cost; ctx.session.lastHp = s.health; ctx.session.hurtAt = now;
  s.bloodUntil = now + BLOOD.seconds * 1000;
  me.fx = { script: BLOOD.aura }; ctx.after(BLOOD.seconds, 'bloodEnds');
  ctx.emit('playSound', { clip: BLOOD.sound, position: fp, volume: 0.75, maxDistance: 30 }, { audience: { nearby: fp, radius: 30 } });
  ctx.emit('screenFlash', { color: 'oklch(0.45 0.2 25)', duration: 0.5, intensity: 0.45 }, to);
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2 }, value: cost, color: '#c0392b' }, to);
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.8 }, text: 'Blood Pact: +25% power', color: '#ff7a60', size: 1.2, lifetime: 2.4 }, to);
  return true;
}
export function bloodEnds(ctx) {
  const s = ctx.self.state; if ((s.bloodUntil || 0) > ctx.now() + 500) return;
  ctx.self.fx = null; s.bloodUntil = 0;
  const fp = ctx.self.feetPosition;
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.4 }, text: 'The Blood Pact fades', color: '#c8b890', size: 0.95, lifetime: 1.8 }, { audience: { player: ctx.self.id } });
}
// Wayside shrines on the town roads: E kneels for the Wayfarer's Blessing, 20% faster travel for 5 min (player.js reads state.blessed).
const BLESS = { seconds: 300, cooldown: 300, sound: "/cdn/moodboard-painterly-fantasy/sfx-wayfarers-blessing-soft-bell-chime-warm-choir-breath.mp3",
  aura: `fx
pop motes rate=5 on=disc(.4) life=1..1.6 v=up(.4..0.8) size=.03..0.05 acc=curl(.3)+buoy(.15) col=hdr(2.4,1.9,.9) a=0>.2:.8>.7:.5>0 r=sprite(ember,add)`,
  burst: `fx
pop rise burst=26 on=disc(.6) life=.9..1.4 v=up(1.4..2.4)+sdir()*.3 size=.04..0.08 acc=drag(1.2) col=hdr(3,2.4,1.1) a=1>.6:.8>0 r=sprite(ember,add)
pop glow n=1 life=.6 g=1>0 r=light(<1,.8,.5>,$g*12,6)` };
function seekBlessing(ctx) {
  const me = ctx.self, s = me.state, now = ctx.now(), fp = me.feetPosition, to = { audience: { player: me.id } };
  const sh = ctx.query({ tags: ['roadside'], radius: 4 })[0]; if (!sh) return false;
  if ((s.blessAt || 0) + BLESS.cooldown * 1000 > now) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'The candles are still. ' + Math.ceil(((s.blessAt || 0) + BLESS.cooldown * 1000 - now) / 1000) + 's', color: '#c8b890', size: 0.95, lifetime: 1.6 }, to); return true; }
  s.blessAt = now; s.blessed = true;
  if (!s.bloodUntil || s.bloodUntil < now) me.fx = { script: BLESS.aura };
  if (ctx.session.blessTimer) ctx.cancel(ctx.session.blessTimer);
  ctx.session.blessTimer = ctx.after(BLESS.seconds, 'blessEnds');
  const sp = sh.feetPosition;
  ctx.emit('playSound', { clip: BLESS.sound, position: sp, volume: 0.7, maxDistance: 20 }, { audience: { nearby: sp, radius: 20 } });
  ctx.emit('fx', { position: { x: fp.x, y: fp.y + 0.1, z: fp.z }, script: BLESS.burst }, { audience: { nearby: fp, radius: 40 } });
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.6 }, text: "Wayfarer's Blessing: +20% speed, 5 min", color: '#f2d48a', size: 1.15, lifetime: 2.4 }, to);
  return true;
}
export function blessEnds(ctx) {
  const s = ctx.self.state; if (!s.blessed) return;
  s.blessed = false; if (!s.bloodUntil || s.bloodUntil < ctx.now()) ctx.self.fx = null;
  const fp = ctx.self.feetPosition;
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.4 }, text: "The Wayfarer's Blessing fades", color: '#c8b890', size: 0.95, lifetime: 1.8 }, { audience: { player: ctx.self.id } });
}
// The March's wells: E beside one cranks up a Bucket of Well Water into the bag (eaten like food: useFood). One draw a minute.
const WELL = { cooldown: 60, crank: "/cdn/moodboard-painterly-fantasy/sfx-well-windlass-crank-creak-rope-and-bucket-splash.mp3",
  item: { id: 'well-water', name: 'Bucket of Well Water', icon: '/cdn/value.4ca00265ea1a372afbe1b3ca70220d211813853223bca49f44bac8723aa3f4e1.png', slot: 'bag', stackable: true, consumable: true, sellPrice: 0,
    description: 'Cold, clear and drawn by your own hand. Restores 250 health over 8 sec. Drinking stops if you are struck.', stats: { healOverTime: 250, eatSeconds: 8 } },
  splash: `fx
pop drops burst=18..26 life=.5..0.9 v=up(1.6..2.6)+sdir()*(.5..1) size=.03..0.06 acc=grav()+drag(.6) col=<.75,.85,.95> a=.9>.7:.9>0 floor=die r=sprite(soft-disc,alpha)
pop mist burst=4 life=.6..1 v=up(.3..0.6) size=.2..0.35 acc=buoy(.2)+drag(1.5) col=<.85,.9,.95> a=0>.2:.25>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)` };
function drawWater(ctx) {
  const me = ctx.self, s = me.state, now = ctx.now(), fp = me.feetPosition, to = { audience: { player: me.id } };
  const w = ctx.query({ tags: ['well'], radius: 3.5 })[0]; if (!w) return false;
  const left = Math.ceil(((s.wellAt || 0) + WELL.cooldown * 1000 - now) / 1000);
  if (left > 0) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'The bucket is still dripping. ' + left + 's', color: '#9cc0d8', size: 0.9, lifetime: 1.4 }, to); return true; }
  const inv = (s.inventory || []).slice();
  let i = inv.findIndex((it) => it && it.id === WELL.item.id && (it.count || 1) < 20); const stack = i >= 0;
  if (!stack) i = inv.findIndex((it) => !it);
  if (i < 0) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'Your bag is full', color: '#e2876a', size: 0.95, lifetime: 1.4 }, to); return true; }
  inv[i] = stack ? { ...inv[i], count: (inv[i].count || 1) + 1 } : { ...WELL.item, count: 1 };
  s.inventory = inv; s._questSave = true; s.wellAt = now;
  const wp = w.feetPosition;
  ctx.emit('playSound', { clip: WELL.crank, position: wp, volume: 0.8, maxDistance: 18 });
  ctx.emit('fx', { position: { x: wp.x, y: wp.y + 0.9, z: wp.z }, script: WELL.splash });
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: '+1 Bucket of Well Water', color: '#9cc0d8', size: 1, lifetime: 1.8 }, to);
  return true;
}
export function onInput(ctx, input) {
  if (pressed(input, 'interact') && ctx.self.state.characterCreated && !ctx.self.state.dying && (offerBlood(ctx) || seekBlessing(ctx) || drawWater(ctx))) return;
  if (!pressed(input, 'useFood')) return;
  const me = ctx.self, s = me.state; if (!s.characterCreated || s.dying) return;
  const d = (input.actionData && (input.actionData.useFood || input.actionData[MNS + 'useFood'])) || {};
  const inv = (s.inventory || []).slice(), i = Number(d.index), it = inv[i];
  if (!it || !it.stats || !it.stats.healOverTime) return;
  const fp = me.feetPosition, to = { audience: { player: me.id } };
  if ((s.health ?? 0) >= (s.maxHealth || 1000)) { ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: it.id === 'well-water' ? 'You are not thirsty' : 'You are not hungry', color: '#c8b890', size: 0.9, lifetime: 1.4 }, to); return; }
  if ((it.count || 1) <= 1) inv[i] = null; else inv[i] = { ...it, count: it.count - 1 };
  s.inventory = inv; s._questSave = true;
  const secs = it.stats.eatSeconds || 10;
  ctx.session.food = { perSec: it.stats.healOverTime / secs, until: ctx.now() + secs * 1000, name: it.name, biteAt: 0 };
  ctx.session.lastHp = s.health;
  ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: (it.id === 'well-water' ? 'Drinking ' : 'Eating ') + it.name, color: '#f2d48a', size: 1, lifetime: 1.8 }, to);
}
function eat(ctx, me, s, now, dt, hurt) {
  const f = ctx.session.food; if (!f) return;
  const fp = me.feetPosition, to = { audience: { player: me.id } };
  if (hurt) { ctx.session.food = null; ctx.emit('damageNumber', { position: { ...fp, y: fp.y + 2.2 }, text: 'Meal interrupted', color: '#e2876a', size: 0.95, lifetime: 1.4 }, to); return; }
  const max = s.maxHealth || 1000;
  if (now >= f.until || (s.health ?? 0) >= max) { ctx.session.food = null; ctx.emit('playSound', { clip: FOOD.done, volume: 0.4 }, to); return; }
  s.health = Math.min(max, (s.health ?? 0) + Math.round(f.perSec * dt));
  if (now >= f.biteAt) { f.biteAt = now + 2500; ctx.emit('playSound', { clip: FOOD.bite, volume: 0.45, pitch: 0.92 + ctx.random() * 0.16 }, to); }
}
export const updateSchedule = { every: { seconds: 0.25 } };
export function update(ctx, dt) {
  const me = ctx.self, s = me.state, mem = ctx.session, now = ctx.now();
  if (!s.characterCreated || s.phase !== "playing" || s.pvpDead) return;
  if (!isPlay(me.place)) return;
  if (mem.zoneAt !== Math.floor(now / 1000)) { // once a second: which ground am I on, on a PvP realm
    mem.zoneAt = Math.floor(now / 1000);
    const room = (ctx.getRoomId && ctx.getRoomId()) || "main"; if (s.realmCurrent !== room) s.realmCurrent = room;
    const fp = me.feetPosition, safe = me.place === "main" && pvpRealm(ctx) ? sanctuaryAt(fp.x, fp.z) : null;
    const zone = me.place === "main" && pvpRealm(ctx) ? (safe ? "sanctuary" : "contested") : null;
    if (s.pvpZone !== zone) {
      const was = s.pvpZone; s.pvpZone = zone; s.pvpSanctuary = safe ? safe.name : null;
      if (was !== undefined && zone) ctx.emit("damageNumber", { position: { ...fp, y: fp.y + 2.6 }, text: zone === "sanctuary" ? "Sanctuary: " + safe.name : "Contested ground", color: zone === "sanctuary" ? "#9fe08a" : "#ff6a55", size: 1.1, lifetime: 2 }, { audience: { player: me.id } });
    }
  }
  const max = s.maxHealth || 1000, hp = s.health ?? max;
  if (mem.vitPlace !== me.place) { mem.vitPlace = me.place; mem.safe = null; }
  eat(ctx, me, s, now, dt, hp < (mem.lastHp ?? hp));
  if (hp < (mem.lastHp ?? hp)) {
    mem.hurtAt = now;
    if ((mem.lastHp - hp) > max * 0.08 && hp > 0 && now - (mem.gruntAt || 0) > 1200) { mem.gruntAt = now; ctx.emit("playSound", { clip: SND.grunt[Math.floor(ctx.random() * SND.grunt.length)], volume: 0.5, pitch: 0.95 + ctx.random() * 0.1, mode: "restart" }); }
  }
  // the hurt pulse: under 35% a heartbeat only you hear, quickening toward zero, and a red edge that breathes with it
  const frac = hp / max, low = hp > 0 && !s.dying && frac < 0.35;
  if (low) {
    const gap = 550 + 1100 * (frac / 0.35);
    if (now - (mem.heartAt || 0) >= gap) { mem.heartAt = now; ctx.emit("playSound", { clip: SND.heart, volume: 0.55 + 0.35 * (1 - frac / 0.35) }); }
    const v = Math.round((0.15 + 0.15 * (1 - frac / 0.35)) * 100) / 100;
    if (me.vignette !== v) me.vignette = v;
  } else if (mem.vigOn) me.vignette = 0;
  mem.vigOn = low;
  mem.lastHp = hp;
  if (s.dying) {
    if (s._fellAt && now - s._fellAt >= FALL_S * 1000) {
      let at = mem.safe || SAFE_HOME[me.place] || null;
      if (me.place === "banner-vale") { const b = BG.teams[s.bgTeam]?.base; if (b) at = b; s.pvpShieldUntil = now + (BG.riseShieldSec || 5) * 1000; s._pvpFall = false; }
      if (s._pvpFall) { const g = nearestRoost(me.feetPosition.x, me.feetPosition.z); if (g) { const h = ctx.place.terrain?.heightAt?.(g.x + 4, g.z + 4); at = { x: g.x + 4, y: Math.max(g.y, typeof h === "number" ? h : g.y), z: g.z + 4 }; } s.pvpShieldUntil = now + (PVP.shieldSeconds || 15) * 1000; s._pvpFall = false; }
      if (at) { me.feetPosition = { x: at.x, y: at.y + 0.3, z: at.z }; }
      me.velocity = { x: 0, y: 0, z: 0 };
      s.health = Math.round(max * RISE_PCT); mem.lastHp = s.health; mem.hurtAt = now;
      s.dying = false; s._fellAt = null; s._questSave = true;
      ctx.emit("screenFlash", { color: "oklch(0.92 0.06 85)", duration: 0.6, intensity: 0.35 }, { audience: { player: me.id } });
      ctx.emit("playSound", { clip: SND.rise, volume: 0.6 });
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
    ctx.emit("playSound", { clip: SND.fall, volume: 0.7 });
    if (mem.vigOn) { me.vignette = 0; mem.vigOn = false; }
    return;
  }
  const calm = now - (mem.hurtAt ?? 0) > CALM_S * 1000;
  if (calm && me.grounded) {
    const p = me.feetPosition, k = Math.floor(now / 2000);
    if (mem.safeAt !== k) { mem.safeAt = k; mem.safe = { x: p.x, y: p.y, z: p.z }; }
    if (hp < max) s.health = Math.min(max, hp + Math.max(1, Math.round(max * MEND_PER_S * dt))), mem.lastHp = s.health;
  }
}
