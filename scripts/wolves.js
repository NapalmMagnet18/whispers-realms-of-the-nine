// The Briar Wolf pack: one manager on the invisible briar-wolf-den steps every wolf row in scripts/lib/data/wolves.yml.
// idle/roam near home → chase a player within aggro → 0.6 s telegraphed bite (head rears, red pulse) → bite if still in
// reach (guard reduces it) → leash home past 30 m, heal, ignore players. Struck (Vanguard writes hp/lastHitBy/lastHitAt):
// flinch and hunt the striker. hp ≤ 0: collapse, yelp, the killer's tally.briar_wolf += 1 (+xp, +copper via the player's coins ear), fade, respawn.
import W from "./lib/data/wolves.yml";
import { play, stop } from "builtin/anim";
import { animate } from "builtin/tween";

const GAITS = {
  idle: { name: "wolf-idle", duration: 3, tracks: { body: { y: [0, 0.012, 0] }, head: { pitch: [0, -5, 3, 0] }, tail: { yaw: [-10, 10, -10] } } },
  walk: { name: "wolf-walk", duration: 0.9, tracks: {
    legFL: { pitch: [20, 0, -20, 0, 20] }, legBR: { pitch: [20, 0, -20, 0, 20] }, legFR: { pitch: [-20, 0, 20, 0, -20] }, legBL: { pitch: [-20, 0, 20, 0, -20] },
    head: { pitch: [0, -3, 0, -3, 0] }, tail: { yaw: [-8, 8, -8] } } },
  run: { name: "wolf-lope", duration: 0.5, tracks: {
    legFL: { pitch: [35, 0, -40, -10, 35] }, legFR: { pitch: [25, 10, -35, -20, 25] }, legBL: { pitch: [-40, -10, 35, 0, -40] }, legBR: { pitch: [-30, -20, 30, 10, -30] },
    body: { pitch: [-5, 0, 5, 0, -5], y: [0, 0.04, 0, 0.04, 0] }, head: { pitch: [5, 0, -6, 0, 5] }, tail: { pitch: [-10, 5, -10] } } },
};
const BAR = `<div face="top" facing="player" offset="0.5m" width="0.8m" class="flex flex-col items-center gap-[10px]">
<div class="text-[64px] font-bold text-amber-100 tracking-wide" style="font-family:Cinzel,serif;text-shadow:0 3px 6px #000">Briar Wolf</div>
<div hidden="{{ state.unhurt }}" class="w-full h-[52px] rounded-md bg-black/75 border-[3px] border-amber-900 p-[5px]"><div class="h-full rounded bg-red-700" style="width: {{ state.hpPct }}%"></div></div>
</div>`;

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const arc = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;
const near = (p) => ({ nearby: p, radius: 40 });

function spawnWolf(ctx, def) {
  ctx.spawn(def.id, {
    tags: ["enemy", "wolf", "briar-wolf"], physics: "character", scale: def.scale ?? 1,
    primitive: { kind: "scripted", script: "scripts/gen/wolf.js" }, material: { roughness: 0.92, dissolve: 0 },
    feetPosition: { x: def.x, z: def.z, y: { terrain: 0 } }, rotation: def.yaw ?? 0, ui: BAR,
    state: { hp: W.hp, maxHp: W.hp, home: { x: def.x, z: def.z }, mode: "idle", radius: 0.5, hpPct: 100, unhurt: true },
  });
}

function gait(ctx, w, m, name, speed = 1) {
  if (m.gait === name) return;
  m.gait = name;
  play(ctx, w.id, GAITS[name], { channel: "gait", loop: true, speed, blendIn: 0.15 });
}

function move(ctx, w, m, to, speed, dt) {
  if ((w.state?.slowUntil ?? 0) > ctx.now()) speed *= w.state.slowMult ?? 1; // Frost Shard
  const p = w.feetPosition, dx = to.x - p.x, dz = to.z - p.z, d = Math.hypot(dx, dz) || 1;
  const vy = w.grounded ? -2 : Math.max(-30, (w.velocity?.y ?? 0) - 20 * dt);
  w.velocity = { x: (dx / d) * speed, y: vy, z: (dz / d) * speed };
  face(w, m, to, dt);
}
function face(w, m, to, dt) {
  const p = w.feetPosition, want = (Math.atan2(-(to.x - p.x), -(to.z - p.z)) * 180) / Math.PI;
  m.yaw ??= want;
  const step = W.turn * dt, a = arc(m.yaw, want);
  m.yaw += Math.max(-step, Math.min(step, a));
  w.rotation = m.yaw;
}
function halt(w, m) {
  if (m.still && w.grounded) return;
  w.velocity = { x: 0, y: w.grounded ? -2 : (w.velocity?.y ?? 0) - 0.6, z: 0 };
  m.still = w.grounded;
}

function aggro(ctx, w, s, target) {
  s.target = target;
  if (s.mode === "idle") ctx.emit("playSound", { clip: W.sounds.growl, position: w.feetPosition, volume: 0.6, maxDistance: 30 }, { audience: near(w.feetPosition) });
  s.mode = "chase";
}

function die(ctx, w, s, m) {
  const now = ctx.now(), pos = { x: w.feetPosition.x, y: w.feetPosition.y + 1.1, z: w.feetPosition.z };
  s.mode = "dead"; s.diedAt = now; s.target = null; s.hpPct = 0; s.unhurt = true;
  w.velocity = { x: 0, y: -2, z: 0 };
  stop(ctx, w.id, "gait"); m.gait = null;
  animate(ctx, w.id, { "bones.body.roll": 84, "bones.body.y": -0.34, "bones.head.pitch": -12, "bones.jaw.pitch": -22, "bones.tail.pitch": -20 }, { duration: 0.45, easing: "easeOutCubic" });
  try { animate(ctx, w.id, { "material.dissolve": 1 }, { duration: W.corpse - W.fadeAt, delay: W.fadeAt }); } catch (e) {}
  ctx.emit("playSound", { clip: W.sounds.yelp, position: pos, volume: 0.7, maxDistance: 35 }, { audience: near(pos) });
  const p = s.lastHitBy ? ctx.getObject(s.lastHitBy) : null;
  if (p && (p.tags || []).includes("player")) {
    const tk = ctx.self.state.tallyKey || "briar_wolf"; // a den names its own kill (THR-03's bramble_beast)
    p.state.tally = { ...(p.state.tally || {}), [tk]: (p.state.tally?.[tk] || 0) + 1 };
    if (typeof p.state.xp === "number") p.state.xp += W.reward.xp; else p.state.xp = W.reward.xp;
    if (W.reward.copper) ctx.emit("coins", { delta: W.reward.copper, reason: "kill:briar_wolf" }, { to: p.id }); // scripts/vendor.js ear: ledger, clink, purse
    ctx.emit("damageNumber", { position: pos, text: `+${W.reward.xp} XP`, color: "#f2b04a", size: 1.2, lifetime: 1.8 }, { audience: { player: p.id } });
  }
}

function bite(ctx, w, s, m, p, dist) {
  const now = ctx.now();
  m.nextBite = now + W.bite.cooldown * 1000;
  s.mode = "chase";
  animate(ctx, w.id, { "bones.head.pitch": -18, "bones.jaw.pitch": 0 }, { duration: 0.1 });
  animate(ctx, w.id, { "bones.head.pitch": 0 }, { duration: 0.3, delay: 0.18 });
  if (dist > W.bite.reach || !p) return;
  const ps = p.state, guarded = (ps.guardUntil ?? 0) > now;
  const health = ps.health ?? 1000;
  const dmg = Math.min(health, Math.round(W.bite.damage * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
  if (dmg > 0) ps.health = health - dmg;
  const hit = { x: p.feetPosition.x, y: p.feetPosition.y + 1.1, z: p.feetPosition.z };
  ctx.emit("playSound", { clip: W.sounds.bite, position: hit, volume: 0.75, maxDistance: 30 }, { audience: near(hit) });
  ctx.emit("damageNumber", { position: hit, value: dmg, color: guarded ? "#9fb6c8" : "#ff5a4a" }, { audience: near(hit) });
  ctx.emit("screenShake", { intensity: guarded ? 0.15 : 0.35, duration: 0.2 }, { audience: { player: p.id } });
  ctx.emit("flash", { target: p.id, color: "#ff3a2a", duration: 0.12 }, { audience: near(hit) });
}

export function update(ctx, dt) {
  const den = ctx.self, ds = den.state, now = ctx.now(), S = (ctx.session.wolves ??= {});
  if (now >= (S.census ?? 0)) {
    S.census = now + 1000;
    for (const def of (ds.pack || W.pack)) if (!ctx.getObject(def.id) && now >= (ds.respawnAt?.[def.id] ?? 0)) spawnWolf(ctx, def);
  }
  const players = ctx.place.players.filter((p) => (p.state?.health ?? 1000) > 0 && !p.state?.dying && !p.state?.pvpDead && p.state?.phase !== "creating" && !((p.state?.veiledUntil || 0) > ctx.now()));
  for (const def of (ds.pack || W.pack)) {
    const w = ctx.getObject(def.id);
    if (!w) { delete S[def.id]; continue; }
    const s = w.state, pos = w.feetPosition, home = s.home ?? { x: def.x, z: def.z };
    const m = (S[def.id] ??= { seen: s.lastHitAt ?? 0, hp: null });
    if (s.mode === "dead") {
      if (now >= (s.diedAt ?? now) + W.corpse * 1000) {
        ds.respawnAt = { ...(ds.respawnAt || {}), [def.id]: (s.diedAt ?? now) + W.respawn * 1000 };
        ctx.destroy(def.id); delete S[def.id];
      }
      continue;
    }
    if ((s.hp ?? 0) <= 0) { die(ctx, w, s, m); continue; }
    if (m.hp !== s.hp) { m.hp = s.hp; s.hpPct = Math.max(0, Math.round((100 * s.hp) / (s.maxHp || W.hp))); s.unhurt = s.hp >= (s.maxHp || W.hp); }
    if ((s.lastHitAt ?? 0) !== m.seen) {
      m.seen = s.lastHitAt ?? 0;
      animate(ctx, w.id, { "bones.body.roll": [0, 14, -7, 0], "bones.head.yaw": [0, -20, 0] }, { duration: 0.3 });
      ctx.emit("flash", { target: w.id, color: "#ffffff", duration: 0.08 }, { audience: near(pos) });
      if (s.mode !== "leash" && s.lastHitBy && players.some((p) => p.id === s.lastHitBy)) aggro(ctx, w, s, s.lastHitBy);
    }
    const fromHome = flat(pos, home);
    if (s.mode !== "leash" && fromHome > W.leash) { s.mode = "leash"; s.target = null; }
    if (s.mode === "leash") {
      if (fromHome < 1.5) { s.mode = "idle"; s.hp = s.maxHp || W.hp; s.lastHitBy = null; m.roamUntil = now + 2000; }
      else { gait(ctx, w, m, "run", 1.1); move(ctx, w, m, home, W.run, dt); m.still = false; continue; }
    }
    if (s.mode === "idle") {
      let best = W.aggro, prey = null;
      for (const p of players) { const d = flat(p.feetPosition, pos); if (d < best) { best = d; prey = p; } }
      if (prey) aggro(ctx, w, s, prey.id);
      else {
        if (now >= (m.roamUntil ?? 0)) {
          const a = ctx.random() * Math.PI * 2, r = ctx.random() * W.roamRadius;
          m.roamTo = ctx.random() < 0.35 ? null : { x: home.x + Math.cos(a) * r, z: home.z + Math.sin(a) * r };
          m.roamUntil = now + (W.roamPause[0] + ctx.random() * (W.roamPause[1] - W.roamPause[0])) * 1000;
        }
        if (m.roamTo && flat(pos, m.roamTo) > 0.6) { gait(ctx, w, m, "walk", 1); move(ctx, w, m, m.roamTo, W.walk, dt); m.still = false; }
        else { m.roamTo = null; gait(ctx, w, m, "idle", 1); halt(w, m); }
        continue;
      }
    }
    const p = players.find((q) => q.id === s.target);
    const dist = p ? flat(p.feetPosition, pos) : Infinity;
    if (s.mode === "windup") {
      halt(w, m);
      if (p) face(w, m, p.feetPosition, dt);
      if (now >= m.biteAt) bite(ctx, w, s, m, p, dist);
      continue;
    }
    // chase
    if (!p || dist > W.dropAggro) { s.mode = "idle"; s.target = null; m.roamUntil = 0; continue; }
    if (dist <= W.bite.start && now >= (m.nextBite ?? 0)) {
      s.mode = "windup"; m.biteAt = now + W.bite.windup * 1000;
      gait(ctx, w, m, "idle", 1); halt(w, m);
      animate(ctx, w.id, { "bones.head.pitch": 28, "bones.jaw.pitch": -38 }, { duration: W.bite.windup * 0.6, easing: "easeOutCubic" });
      ctx.emit("highlightSet", { target: w.id, color: "#ff2a1a", style: "glow", duration: W.bite.windup }, { audience: near(pos) });
      ctx.emit("flash", { target: w.id, color: "#ff2a1a", duration: W.bite.windup }, { audience: near(pos) });
      ctx.emit("playSound", { clip: W.sounds.growl, position: pos, volume: 0.45, pitch: 1.25, maxDistance: 25 }, { audience: near(pos) });
      continue;
    }
    if (dist > W.bite.stopAt) { gait(ctx, w, m, "run", 1.1); move(ctx, w, m, p.feetPosition, W.run, dt); m.still = false; }
    else { gait(ctx, w, m, "idle", 1); halt(w, m); face(w, m, p.feetPosition, dt); }
  }
}
