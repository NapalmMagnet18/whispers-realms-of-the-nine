// The Briar Wolf pack: one manager on the invisible briar-wolf-den steps every wolf row in scripts/lib/data/wolves.yml.
// idle/roam near home → chase a player within aggro → 0.6 s telegraphed bite (head rears, red pulse) → bite if still in
// reach (guard reduces it) → leash home past 30 m, heal, ignore players. Struck (Vanguard writes hp/lastHitBy/lastHitAt):
// flinch and hunt the striker. hp ≤ 0: collapse, yelp, the killer's tally.briar_wolf += 1 (+xp, +copper via the player's coins ear), fade, respawn.
import W from "./lib/data/wolves.yml";
import { inRefuge } from "./lib/refuge.js";
import { play, stop } from "builtin/anim";
import { animate } from "builtin/tween";
import { velocidadeParaHz } from "../mods/animacao-viva/lib/mistura.js"; // Animação Viva: the ground drives the cycle
// metres of ground one gait cycle covers: the clip plays at speed = (ground m/s ÷ stride) × cycle seconds, so paws never skate
const STRIDE = { walk: 1.25, run: 3.4 };

// Gaits sampled from smooth curves: 24 keys a cycle so the legs roll through their arc instead of snapping between poses.
const N = 24;
const wave = (amp, phase = 0, off = 0, harm = 0) => Array.from({ length: N + 1 }, (_, k) => {
  const t = (k / N) * Math.PI * 2 + phase * Math.PI * 2;
  return +(off + amp * Math.sin(t) + harm * Math.sin(2 * t)).toFixed(2);
});
// a leg's swing: a quick forward reach, a long push back (the foot planted most of the stride)
const stride = (amp, phase, lift = 0.25) => Array.from({ length: N + 1 }, (_, k) => {
  const u = ((k / N + phase) % 1 + 1) % 1;
  const v = u < lift ? -Math.cos((u / lift) * Math.PI) : Math.cos(((u - lift) / (1 - lift)) * Math.PI);
  return +(amp * v).toFixed(2);
});
const GAITS = {
  idle: { name: "wolf-idle-2", duration: 4.2, tracks: {
    body: { y: wave(0.012, 0, 0.006), pitch: wave(0.8, 0.25) },
    head: { pitch: [0, -4, -6, -2, 3, 6, 4, 0, -2, -1, 0, 1, 0], yaw: [0, 0, 6, 14, 18, 12, 4, -6, -14, -16, -10, -4, 0] },
    jaw: { pitch: [0, 0, 0, -2, 0, 0, 0, 0, -3, 0, 0, 0, 0] },
    tail: { yaw: wave(9, 0, 0, 3), pitch: wave(3, 0.3, -6) } } },
  walk: { name: "wolf-walk-2", duration: 1.0, tracks: {
    legFL: { pitch: stride(22, 0) }, legBL: { pitch: stride(20, 0.25) }, legFR: { pitch: stride(22, 0.5) }, legBR: { pitch: stride(20, 0.75) },
    body: { roll: wave(2.2, 0.1), y: wave(0.015, 0, 0.005, 0.01), yaw: wave(1.5, 0.35) },
    head: { pitch: wave(2.5, 0.1, -2, 1.5), yaw: wave(-2.5, 0.1) },
    tail: { yaw: wave(10, 0.4), pitch: wave(2, 0.2, -8) } } },
  run: { name: "wolf-gallop-2", duration: 0.52, tracks: {
    legFL: { pitch: stride(42, 0.0, 0.4) }, legFR: { pitch: stride(40, 0.08, 0.4) }, legBL: { pitch: stride(-40, 0.52, 0.4) }, legBR: { pitch: stride(-38, 0.6, 0.4) },
    body: { pitch: wave(6, 0.15), y: wave(0.05, 0.2, 0.03, 0.02) },
    head: { pitch: wave(-6, 0.1, 4) },
    jaw: { pitch: wave(-3, 0.3, -6) },
    tail: { pitch: wave(8, 0.3, 4), yaw: wave(4, 0.1) } } },
};
const BARF = (name, elite) => `<div face="top" facing="player" offset="0.5m" width="0.8m" class="flex flex-col items-center gap-[10px]">
<div class="text-[64px] font-bold text-amber-100 tracking-wide" style="font-family:Cinzel,serif;text-shadow:0 3px 6px #000;${elite ? "color:#ff9a6a" : ""}">${name}</div>
<div hidden="{{ state.unhurt }}" class="w-full h-[52px] rounded-md bg-black/75 border-[3px] border-amber-900 p-[5px]"><div class="h-full rounded bg-red-700" style="width: {{ state.hpPct }}%"></div></div>
</div>`;
const BAR = BARF("Briar Wolf");

const pos0 = (w) => w.feetPosition;
const THUMP = `fx
pop dust burst=10..14 on=disc(.6) life=.8..1.4 v=up(.3..0.7)+sdir()*(.6..1.2) size=.25..0.45 acc=buoy(.2)+drag(1.6) col=<.55,.5,.42> a=0>.3:.35>0 sz=$size*(.6>2) rot=spin(.1) r=sprite(smoke-puff,alpha)
pop grit burst=8..12 on=disc(.4) life=.4..0.7 v=up(1..2)+sdir()*(.5..1) size=.02..0.04 acc=grav()+drag(.5) col=<.4,.34,.27> a=1>0 floor=stick r=sprite(grain,alpha)`;
const BITE_FX = `fx
pop fur burst=10..16 life=.6..1.1 v=norm(<%normal|0,1,0>)*(1.5..3)+sdir()*(.5..1.2) size=.05..0.1 spin=-6..6 acc=grav()*.5+drag(1.8) col=<.45,.38,.3> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop spray burst=8..12 life=.3..0.6 v=norm(<%normal|0,1,0>)*(2..3.5)+sdir()*(.6..1.4) size=.025..0.05 acc=grav()+drag(.8) col=<.55,.06,.05> a=1>0 floor=stick r=sprite(droplet,alpha,velocity,.02)
pop slash burst=1 life=.18 size=.9 col=hdr(2.5,.5,.3) a=.8>0 sz=$size*(.6>1.2) r=sprite(soft-disc,add)`;
const SPARKS = `fx
pop sparks burst=14..22 life=.15..0.35 v=norm(<%normal|0,1,0>)*(3..6)+sdir()*(1.5..3) size=.015..0.03 acc=grav()*.8+drag(.5) col=hdr(5,3.4,1.4)>hdr(2,.7,.15) a=1>0 r=sprite(ember,add,velocity,.02)
pop flash burst=1 life=.12 size=.7 col=hdr(3,2.6,1.8) a=1>0 r=sprite(soft-disc,add)`;
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const arc = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;
const near = (p) => ({ nearby: p, radius: 40 });

function spawnWolf(ctx, def) {
  ctx.spawn(def.id, {
    tags: ["enemy", "wolf", "briar-wolf"], physics: "character", scale: def.scale ?? 1,
    primitive: { kind: "scripted", script: "scripts/gen/wolf.js" }, material: { roughness: 0.92, dissolve: 0 },
    feetPosition: { x: def.x, z: def.z, y: { terrain: 0 } }, rotation: def.yaw ?? 0, ui: def.name ? BARF(def.name, true) : BAR,
    state: { hp: def.hp ?? W.hp, maxHp: def.hp ?? W.hp, ...(def.damage ? { damage: def.damage } : {}), ...(def.reward ? { reward: def.reward } : {}), home: { x: def.x, z: def.z }, mode: "idle", radius: 0.5, hpPct: 100, unhurt: true },
  });
}

function gait(ctx, w, m, name, speed = 1) {
  if (m.gait === name) return;
  m.gait = name;
  if (STRIDE[name]) {
    const ground = name === "run" ? W.run * speed : W.walk * speed;
    const hz = velocidadeParaHz(ground, STRIDE[name], 4.5);
    if (hz > 0) speed = hz * GAITS[name].duration;
  }
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
  animate(ctx, w.id, { "bones.body.roll": [0, -8, 20, 70, 92, 84], "bones.body.y": [0, -0.04, -0.12, -0.3, -0.38, -0.34], "bones.body.pitch": [0, 8, 4, 0, 0, 0],
    "bones.head.pitch": [0, 20, 10, -18, -10, -12], "bones.jaw.pitch": [0, -30, -26, -20, -22, -22], "bones.tail.pitch": [0, 10, -10, -24, -20, -20],
    "bones.legFL.pitch": [0, -20, 10, 30, 26, 28], "bones.legBR.pitch": [0, 18, -12, -26, -22, -24] }, { duration: 0.85, easing: "easeOutCubic" });
  ctx.emit("fx", { position: { x: pos.x, y: pos.y + 0.1, z: pos.z }, script: THUMP }, { audience: near(pos) });
  try { animate(ctx, w.id, { "material.dissolve": 1 }, { duration: W.corpse - W.fadeAt, delay: W.fadeAt }); } catch (e) {}
  ctx.emit("playSound", { clip: W.sounds.yelp, position: pos, volume: 0.7, maxDistance: 35 }, { audience: near(pos) });
  const p = s.lastHitBy ? ctx.getObject(s.lastHitBy) : null;
  if (p && (p.tags || []).includes("player")) {
    const RWd = s.reward || W.reward; const tk = ctx.self.state.tallyKey || "briar_wolf"; // a den names its own kill (THR-03's bramble_beast)
    ctx.emit("kill", { tally: tk, xp: RWd.xp }, { to: p.id }); // the hero's own machine counts it (scripts/quest-player.js ear)
    if (RWd.copper) ctx.emit("coins", { delta: RWd.copper, reason: "kill:briar_wolf" }, { to: p.id }); // scripts/vendor.js ear: ledger, clink, purse
    ctx.emit("damageNumber", { position: pos, text: `+${RWd.xp} XP`, color: "#f2b04a", size: 1.2, lifetime: 1.8 }, { audience: { player: p.id } });
  }
}

function bite(ctx, w, s, m, p, dist) {
  const now = ctx.now();
  m.nextBite = now + W.bite.cooldown * 1000;
  s.mode = "chase";
  animate(ctx, w.id, { "bones.head.pitch": [28, -22, -14, 0], "bones.jaw.pitch": [-38, -40, 0, 0], "bones.body.pitch": [0, -8, -4, 0], "bones.body.y": [0, 0.06, 0.02, 0], "bones.legBL.pitch": [0, -25, -10, 0], "bones.legBR.pitch": [0, -25, -10, 0] }, { duration: 0.42, easing: "easeOutCubic" });
  if (dist > W.bite.reach || !p) return;
  const ps = p.state, guarded = (ps.guardUntil ?? 0) > now;
  const health = ps.health ?? 1000;
  const dmg = Math.min(health, Math.round((w.state.damage || W.bite.damage) * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
  if (dmg > 0) ps.health = health - dmg;
  const hit = { x: p.feetPosition.x, y: p.feetPosition.y + 1.1, z: p.feetPosition.z };
  ctx.emit("playSound", { clip: W.sounds.bite, position: hit, volume: 0.75, maxDistance: 30 }, { audience: near(hit) });
  ctx.emit("damageNumber", { position: hit, value: dmg, color: guarded ? "#9fb6c8" : "#ff5a4a" }, { audience: near(hit) });
  ctx.emit("fx", { position: hit, script: guarded ? SPARKS : BITE_FX, params: { normal: { x: (p.feetPosition.x - pos0(w).x), y: 0.3, z: (p.feetPosition.z - pos0(w).z) } } }, { audience: near(hit) });
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
      animate(ctx, w.id, { "bones.body.roll": [0, 16, -8, 3, 0], "bones.body.y": [0, -0.06, 0.01, 0], "bones.head.yaw": [0, -24, 6, 0], "bones.head.pitch": [0, 12, -4, 0], "bones.jaw.pitch": [0, -24, -10, 0] }, { duration: 0.38, easing: "easeOutCubic" });
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
      for (const p of players) { if (inRefuge(p.feetPosition)) continue; const d = flat(p.feetPosition, pos); if (d < best) { best = d; prey = p; } }
      if (prey && W.howl && now - (S.howlAt ?? -1e9) > W.howl.every * 1000) {
        // the pack call: head thrown back, the howl, every idle packmate in earshot turns and runs with it
        S.howlAt = now; s.mode = "howl"; s.target = prey.id; m.howlEnd = now + W.howl.seconds * 1000;
        gait(ctx, w, m, "idle", 1); halt(w, m);
        animate(ctx, w.id, { "bones.head.pitch": [0, 44, 46, 40, 0], "bones.jaw.pitch": [0, -26, -30, -24, 0], "bones.body.pitch": [0, 10, 10, 8, 0], "bones.tail.pitch": [0, -16, -18, -14, 0] }, { duration: W.howl.seconds, easing: "easeInOutSine" });
        ctx.emit("playSound", { clip: W.sounds.howl, position: pos, volume: 0.85, maxDistance: 70 }, { audience: near(pos) });
        for (const od of (ds.pack || W.pack)) {
          if (od.id === def.id) continue;
          const o = ctx.getObject(od.id);
          if (o && o.state.mode === "idle" && flat(o.feetPosition, pos) < W.howl.rally) aggro(ctx, o, o.state, prey.id);
        }
        continue;
      }
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
    const p = players.find((q) => q.id === s.target && !inRefuge(q.feetPosition));
    const dist = p ? flat(p.feetPosition, pos) : Infinity;
    if (s.mode === "howl") {
      halt(w, m);
      if (p) face(w, m, p.feetPosition, dt);
      if (now >= (m.howlEnd ?? 0)) s.mode = "chase";
      continue;
    }
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
