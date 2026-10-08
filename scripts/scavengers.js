// Quarry Scavengers: one manager on the invisible quarry-scavenger-camp steps every row in scripts/lib/data/scavengers.yml
// (the Briar Wolf pattern, humanoid bodies). idle/roam near home → chase a player within aggro → telegraphed pick swing
// (red glow, raised arm) → hit if still in reach (guard reduces it) → leash home. Struck (class scripts write hp/lastHitBy/
// lastHitAt): flinch and hunt the striker. hp ≤ 0: fall, the killer's tally.quarry_scavenger += 1 (+xp, +copper), fade, respawn.
import S from "./lib/data/scavengers.yml";
import { animate } from "builtin/tween";

const BAR = (name) => `<div face="top" facing="player" offset="0.6m" width="0.8m" class="flex flex-col items-center gap-[10px]">
<div class="text-[60px] font-bold text-amber-100 tracking-wide" style="font-family:Cinzel,serif;text-shadow:0 3px 6px #000">${name}</div>
<div hidden="{{ state.unhurt }}" class="w-full h-[52px] rounded-md bg-black/75 border-[3px] border-amber-900 p-[5px]"><div class="h-full rounded bg-red-700" style="width: {{ state.hpPct }}%"></div></div>
</div>`;
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const arc = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;
const near = (p) => ({ nearby: p, radius: 40 });

function spawnOne(ctx, def, cs = {}) {
  ctx.spawn(def.id, {
    tags: ["enemy", "scavenger", "quarry-scavenger"], physics: "character", model: cs.model || S.model, ...(cs.look ? { material: { ...cs.look, dissolve: 0 } } : {}),
    layout: cs.extents ? { minExtents: { x: -cs.extents.x / 2, y: 0, z: -cs.extents.z / 2 }, maxExtents: { x: cs.extents.x / 2, y: cs.extents.y, z: cs.extents.z / 2 } } : { minExtents: { x: -0.4, y: 0, z: -0.3 }, maxExtents: { x: 0.4, y: 1.8, z: 0.3 } },
    ...(cs.look ? {} : { material: { dissolve: 0 } }), feetPosition: { x: def.x, z: def.z, y: cs.floorY != null ? cs.floorY : { terrain: 0 } }, ...(cs.scale ? { scale: cs.scale } : {}), rotation: def.yaw ?? 0, ui: BAR(cs.name || "Quarry Scavenger"),
    state: { hp: cs.hp || S.hp, maxHp: cs.hp || S.hp, home: { x: def.x, z: def.z }, mode: "idle", radius: cs.radius || 0.45, hpPct: 100, unhurt: true },
  });
}
function gait(w, m, name, speed = 1) {
  if (m.gait === name) return;
  m.gait = name;
  w.anim.base = { clip: S.clips[name], weight: 1, loop: "loop", speed };
}
function once(w, clip, speed = 1) { w.anim.action = { clip, weight: 1, loop: "once", speed, blend: "override" }; }
function face(w, m, to, dt) {
  const p = w.feetPosition, want = (Math.atan2(-(to.x - p.x), -(to.z - p.z)) * 180) / Math.PI;
  m.yaw ??= want;
  m.yaw += Math.max(-S.turn * dt, Math.min(S.turn * dt, arc(m.yaw, want)));
  w.rotation = m.yaw;
}
function move(ctx, w, m, to, speed, dt) {
  if ((w.state?.slowUntil ?? 0) > ctx.now()) speed *= w.state.slowMult ?? 1;
  const p = w.feetPosition, dx = to.x - p.x, dz = to.z - p.z, d = Math.hypot(dx, dz) || 1;
  const vy = w.grounded ? -2 : Math.max(-30, (w.velocity?.y ?? 0) - 20 * dt);
  w.velocity = { x: (dx / d) * speed, y: vy, z: (dz / d) * speed };
  face(w, m, to, dt);
}
function halt(w, m) {
  if (m.still && w.grounded) return;
  w.velocity = { x: 0, y: w.grounded ? -2 : (w.velocity?.y ?? 0) - 0.6, z: 0 };
  m.still = w.grounded;
}
function aggro(ctx, w, s, target) {
  s.target = target;
  if (s.mode === "idle") ctx.emit("playSound", { clip: S.sounds.shout, position: w.feetPosition, volume: 0.6, maxDistance: 30 }, { audience: near(w.feetPosition) });
  s.mode = "chase";
}
function die(ctx, w, s, m) {
  const now = ctx.now(), pos = { x: w.feetPosition.x, y: w.feetPosition.y + 1.2, z: w.feetPosition.z };
  s.mode = "dead"; s.diedAt = now; s.target = null; s.hpPct = 0; s.unhurt = true;
  w.velocity = { x: 0, y: -2, z: 0 };
  w.anim.base = null; once(w, S.clips.die); m.gait = null;
  try { animate(ctx, w.id, { "material.dissolve": 1 }, { duration: S.corpse - S.fadeAt, delay: S.fadeAt }); } catch (e) {}
  ctx.emit("playSound", { clip: S.sounds.die, position: pos, volume: 0.7, maxDistance: 35 }, { audience: near(pos) });
  const p = s.lastHitBy ? ctx.getObject(s.lastHitBy) : null;
  if (p && (p.tags || []).includes("player")) {
    const tk = ctx.self.state.tallyKey || "quarry_scavenger"; // a camp names its own kill (KHA-06's tunnel_scavenger)
    p.state.tally = { ...(p.state.tally || {}), [tk]: (p.state.tally?.[tk] || 0) + 1 };
    const RW = ctx.self.state.reward || S.reward; // a camp may pay its own (an elite pays more)
    if (typeof p.state.xp === "number") p.state.xp += RW.xp; else p.state.xp = RW.xp;
    if (RW.copper) ctx.emit("coins", { delta: RW.copper, reason: "kill:" + tk }, { to: p.id });
    ctx.emit("damageNumber", { position: pos, text: `+${RW.xp} XP`, color: "#f2b04a", size: 1.2, lifetime: 1.8 }, { audience: { player: p.id } });
  }
}
function strike(ctx, w, s, m, p, dist) {
  const now = ctx.now();
  m.nextStrike = now + S.strike.cooldown * 1000;
  s.mode = "chase";
  ctx.emit("playSound", { clip: S.sounds.swing, position: w.feetPosition, volume: 0.6, maxDistance: 25 }, { audience: near(w.feetPosition) });
  if (dist > S.strike.reach || !p) return;
  const ps = p.state, guarded = (ps.guardUntil ?? 0) > now, health = ps.health ?? 1000;
  const dmg = Math.min(health, Math.round((ctx.self.state.damage || S.strike.damage) * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
  if (dmg > 0) ps.health = health - dmg;
  const hit = { x: p.feetPosition.x, y: p.feetPosition.y + 1.1, z: p.feetPosition.z };
  ctx.emit("playSound", { clip: S.sounds.hit, position: hit, volume: 0.75, maxDistance: 30 }, { audience: near(hit) });
  ctx.emit("damageNumber", { position: hit, value: dmg, color: guarded ? "#9fb6c8" : "#ff5a4a" }, { audience: near(hit) });
  ctx.emit("screenShake", { intensity: guarded ? 0.15 : 0.35, duration: 0.2 }, { audience: { player: p.id } });
  ctx.emit("flash", { target: p.id, color: "#ff3a2a", duration: 0.12 }, { audience: near(hit) });
}

// A boss toll (camp state.toll = { every, windup, radius, damage, enrageAt, enrageEvery, sound, name }): a filling ring
// at its feet for windup seconds, then a shockwave that hits every hero still inside. Below enrageAt % it tolls faster.
function tollBegin(ctx, w, s, m, T) {
  const now = ctx.now(), p = w.feetPosition, r = T.radius, life = T.windup + 0.2;
  m.tollAt = now + T.windup * 1000; s.mode = "toll";
  halt(w, m); gait(w, m, "idle"); once(w, S.clips.attack, 0.55);
  const base = { feetPosition: { x: p.x, y: p.y + 0.06, z: p.z }, physics: "none", castShadow: false, receiveShadow: false, lifetime: life };
  ctx.spawn({ ...base, primitive: { kind: "cylinder", radiusTop: r, radiusBottom: r, height: 0.04, radialSegments: 48 }, material: { color: "oklch(0.7 0.14 235 / 0.22)", emissive: "#4aa8ff", emissiveIntensity: 0.6, transparent: true, opacity: 0.22 } });
  const fill = ctx.spawn({ ...base, feetPosition: { x: p.x, y: p.y + 0.08, z: p.z }, scale: { x: 0.05, y: 1, z: 0.05 }, primitive: { kind: "cylinder", radiusTop: r, radiusBottom: r, height: 0.04, radialSegments: 48 }, material: { color: "oklch(0.75 0.16 230 / 0.45)", emissive: "#7fd0ff", emissiveIntensity: 1.4, transparent: true, opacity: 0.45 } });
  try { animate(ctx, fill, { "scale.x": 1, "scale.z": 1 }, { duration: T.windup, easing: "easeInQuad" }); } catch (e) {}
  ctx.emit("highlightSet", { target: w.id, color: "#7fd0ff", style: "glow", duration: T.windup }, { audience: near(p) });
  ctx.emit("playSound", { clip: T.sound, position: p, volume: 0.55, pitch: 1.35, maxDistance: 45 }, { audience: near(p) });
}
function tollLand(ctx, w, s, m, T, players) {
  const p = w.feetPosition, at = { x: p.x, y: p.y + 0.3, z: p.z }, now = ctx.now(), enraged = s.enraged;
  s.mode = "chase"; m.nextToll = now + (enraged ? T.enrageEvery : T.every) * 1000; m.nextStrike = now + 900;
  ctx.emit("shockwave", { position: at, speed: 14, thickness: 1.2, intensity: 0.9 }, { audience: near(at) });
  ctx.emit("playSound", { clip: T.sound, position: at, volume: 1, pitch: 0.75, maxDistance: 70 }, { audience: { nearby: at, radius: 70 } });
  for (const q of players) {
    const d = flat(q.feetPosition, p); if (d > T.radius) continue;
    const ps = q.state, guarded = (ps.guardUntil ?? 0) > now, health = ps.health ?? 1000;
    const dmg = Math.min(health, Math.round(T.damage * (enraged ? 1.25 : 1) * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
    if (dmg > 0) ps.health = health - dmg;
    const hit = { x: q.feetPosition.x, y: q.feetPosition.y + 1.1, z: q.feetPosition.z };
    ctx.emit("damageNumber", { position: hit, value: dmg, color: "#7fd0ff", crit: true }, { audience: near(hit) });
    ctx.emit("screenShake", { intensity: 0.55, duration: 0.35 }, { audience: { player: q.id } });
    ctx.emit("screenFlash", { color: "#6fb8ff", duration: 0.3, intensity: 0.35 }, { audience: { player: q.id } });
  }
}
function tollEnrage(ctx, w, s, m, T) {
  s.enraged = true; m.nextToll = Math.min(m.nextToll ?? 0, ctx.now() + 1500);
  const p = w.feetPosition, at = { x: p.x, y: p.y + 3, z: p.z };
  ctx.emit("damageNumber", { position: at, text: (T.name || "It") + " thrashes in agony!", color: "#7fd0ff", size: 1.4, lifetime: 2.4 }, { audience: { nearby: p, radius: 50 } });
  ctx.emit("screenShake", { intensity: 0.3, duration: 0.6 }, { audience: { nearby: p, radius: 30 } });
  ctx.emit("highlightSet", { target: w.id, color: "#3a9cff", style: "pulse" }, { audience: near(p) });
}

export function update(ctx, dt) {
  const camp = ctx.self, cs = camp.state, now = ctx.now(), M = (ctx.session["scav:" + camp.id] ??= {}); // each camp its own scratch: two camps never share a census clock
  if (now >= (M.census ?? 0)) {
    M.census = now + 1000;
    for (const def of (cs.crew || S.crew)) if (!ctx.getObject(def.id) && now >= (cs.respawnAt?.[def.id] ?? 0)) spawnOne(ctx, def, cs);
  }
  const players = ctx.place.players.filter((p) => (p.state?.health ?? 1000) > 0 && !p.state?.dying && !p.state?.pvpDead && p.state?.phase !== "creating" && !((p.state?.veiledUntil || 0) > ctx.now()));
  for (const def of (cs.crew || S.crew)) {
    const w = ctx.getObject(def.id);
    if (!w) { delete M[def.id]; continue; }
    const s = w.state, pos = w.feetPosition, home = s.home ?? { x: def.x, z: def.z };
    const m = (M[def.id] ??= { seen: s.lastHitAt ?? 0, hp: null });
    if (s.mode === "dead") {
      if (now >= (s.diedAt ?? now) + S.corpse * 1000) {
        cs.respawnAt = { ...(cs.respawnAt || {}), [def.id]: (s.diedAt ?? now) + S.respawn * 1000 };
        ctx.destroy(def.id); delete M[def.id];
      }
      continue;
    }
    if ((s.hp ?? 0) <= 0) { die(ctx, w, s, m); continue; }
    if (m.hp !== s.hp) { m.hp = s.hp; s.hpPct = Math.max(0, Math.round((100 * s.hp) / (s.maxHp || cs.hp || S.hp))); s.unhurt = s.hp >= (s.maxHp || S.hp); }
    if ((s.lastHitAt ?? 0) !== m.seen) {
      m.seen = s.lastHitAt ?? 0;
      once(w, S.clips.hit, 1.3);
      ctx.emit("flash", { target: w.id, color: "#ffffff", duration: 0.08 }, { audience: near(pos) });
      if (s.mode !== "leash" && s.lastHitBy && players.some((p) => p.id === s.lastHitBy)) aggro(ctx, w, s, s.lastHitBy);
    }
    const fromHome = flat(pos, home);
    if (s.mode !== "leash" && fromHome > S.leash) { s.mode = "leash"; s.target = null; }
    if (s.mode === "leash") {
      if (fromHome < 1.5) { s.mode = "idle"; s.hp = s.maxHp || S.hp; s.lastHitBy = null; m.roamUntil = now + 2000; if (s.enraged) { s.enraged = false; m.nextToll = null; ctx.emit("highlightClear", { target: w.id }, { audience: near(pos) }); } }
      else { gait(w, m, "run"); move(ctx, w, m, home, S.run, dt); m.still = false; continue; }
    }
    if (s.mode === "idle") {
      let best = S.aggro, prey = null;
      for (const p of players) { const d = flat(p.feetPosition, pos); if (d < best) { best = d; prey = p; } }
      if (prey) aggro(ctx, w, s, prey.id);
      else {
        if (now >= (m.roamUntil ?? 0)) {
          const a = ctx.random() * Math.PI * 2, r = ctx.random() * S.roamRadius;
          m.roamTo = ctx.random() < 0.4 ? null : { x: home.x + Math.cos(a) * r, z: home.z + Math.sin(a) * r };
          m.roamUntil = now + (S.roamPause[0] + ctx.random() * (S.roamPause[1] - S.roamPause[0])) * 1000;
        }
        if (m.roamTo && flat(pos, m.roamTo) > 0.6) { gait(w, m, "walk"); move(ctx, w, m, m.roamTo, S.walk, dt); m.still = false; }
        else { m.roamTo = null; gait(w, m, "idle"); halt(w, m); }
        continue;
      }
    }
    const p = players.find((q) => q.id === s.target);
    const dist = p ? flat(p.feetPosition, pos) : Infinity;
    const T = cs.toll;
    if (T) {
      if (s.mode === "toll") { halt(w, m); if (now >= m.tollAt) tollLand(ctx, w, s, m, T, players); continue; }
      if (!s.enraged && s.hpPct <= T.enrageAt) tollEnrage(ctx, w, s, m, T);
      m.nextToll ??= now + 4000;
      if (p && dist < T.radius + 4 && now >= m.nextToll && s.mode !== "windup") { tollBegin(ctx, w, s, m, T); continue; }
    }
    if (s.mode === "windup") {
      halt(w, m);
      if (p) face(w, m, p.feetPosition, dt);
      if (now >= m.strikeAt) strike(ctx, w, s, m, p, dist);
      continue;
    }
    if (!p || dist > S.dropAggro) { s.mode = "idle"; s.target = null; m.roamUntil = 0; continue; }
    if (dist <= S.strike.start && now >= (m.nextStrike ?? 0)) {
      s.mode = "windup"; m.strikeAt = now + S.strike.windup * 1000;
      gait(w, m, "idle"); halt(w, m); once(w, S.clips.attack, 0.9);
      ctx.emit("highlightSet", { target: w.id, color: "#ff2a1a", style: "glow", duration: S.strike.windup }, { audience: near(pos) });
      continue;
    }
    if (dist > S.strike.stopAt) { gait(w, m, "run"); move(ctx, w, m, p.feetPosition, S.run, dt); m.still = false; }
    else { gait(w, m, "idle"); halt(w, m); face(w, m, p.feetPosition, dt); }
  }
}
