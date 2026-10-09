// Every dungeon and raid boss after the Candle Warden: one engine, one data table (scripts/lib/data/bosses.yml).
// A placement names its boss by state.boss; the table gives its body, its swing and its abilities. Asleep until a hero
// steps into its arena (state.arena or the def's); then it walks at its target and swings, and each ability fires on its
// own clock with a telegraph the heroes can read and dodge:
//   sweep  - a ring of fire around the boss: get OUT (a dodge counts tally <boss>_dodge)
//   nova   - the arena erupts beyond a safe circle around the boss: get IN
//   pools  - a circle under every hero: step off it
//   cleave - a cone in front: get behind or beside
//   summon - adds (a def of their own, same engine) pour in at the arena edge
// Phases: an ability with from: 60 starts once hp is at or under 60%. enrage: { below, speed } quickens every clock.
// Raids: hp scales by the heroes in the arena when the fight opens (raidScale per extra hero).
// mind: true = the boss asks jev:decide whom to turn on, from what each hero did to it (damage, distance).
// Class scripts write hp / lastHitBy / lastHitAt like any enemy. At 0 hp every hero in the arena is credited
// (tally = the def's tally, XP, copper). It rises again after respawn seconds; an empty arena walks it home and heals it.
import BOSSES from "./lib/data/bosses.yml";
import VOICES from "./lib/data/boss-voices.yml";
import TAUNTS from "./lib/data/boss-taunts.yml";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const arcd = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;
const near = (p, r = 60) => ({ nearby: p, radius: r });
const C = { fire: [3.4, 1.4, 0.5], frost: [0.8, 1.8, 3.4], void: [2.2, 0.8, 3.4], tide: [0.6, 2.2, 2.6], gold: [3.4, 2.6, 0.9], blood: [3.2, 0.5, 0.4] };
const tint = (k) => C[k] || C.fire;
const RING = (r, k, t) => { const [a, b, c] = tint(k); return `fx
pop ring burst=${Math.round(40 + r * 8)} on=arc(${r},6.283,.12) life=${t} v=up(.1..0.35) size=.16..0.28 col=hdr(${a},${b},${c}) a=0>.2:1>.85:1>0 sz=$size*(.6>1.3) r=sprite(soft-disc,add)
pop fill burst=${Math.round(20 + r * 4)} on=disc(${r}) life=${t} v=up(.03..0.15) size=.07..0.13 col=hdr(${a * 0.5},${b * 0.5},${c * 0.5}) a=0>.4:.55>1:0 sz=$size r=sprite(soft-disc,add)`; };
const BURST = (r, k) => { const [a, b, c] = tint(k); return `fx
pop flame burst=${Math.round(60 + r * 12)} on=disc(${r * 0.7}) life=.45..0.85 v=up(1.5..3.2)+sdir()*${(r * 0.25).toFixed(2)} size=.3..0.6 acc=drag(2.5)+buoy(1.4) sz=$size*(.6>1.4:.6>.2) col=hdr(${a + 1},${b + 0.6},${c + 0.2})>hdr(${a * 0.5},${b * 0.3},${c * 0.3}) a=0>.1:1>.7:.8>0 rot=spin(.4) r=sprite(flame-wisp,add)
pop smoke burst=20 on=disc(${r * 0.6}) life=1.4..2.2 v=up(.5..1.1) size=.4..0.7 acc=buoy(.5)+drag(.8) sz=$size*(.6>2.4) col=<.18,.16,.2> a=0>.3:.3>.7:.2>0 r=sprite(smoke-puff,alpha)
pop flash n=1 life=.35 r=light(<${(a / 3.4).toFixed(2)},${(b / 3.4).toFixed(2)},${(c / 3.4).toFixed(2)}>,26,${r + 8})`; };

function def(ctx) { return BOSSES[ctx.self.state.boss] || null; }
function once(w, clip, speed = 1) { if (clip) w.anim.action = { clip, weight: 1, loop: "once", speed, blend: "override", blendIn: 0.14, blendOut: 0.25 }; }
function gait(w, m, D, name) { if (m.gait === name) return; m.gait = name; const c = D.clips?.[name] ?? (name === "idle" ? "Idle" : "Walk"); w.anim.base = { clip: c, weight: 1, loop: "loop", blendIn: 0.3 }; }
function face(w, m, D, to, dt) {
  const p = w.feetPosition, want = (Math.atan2(-(to.x - p.x), -(to.z - p.z)) * 180) / Math.PI;
  m.yaw ??= typeof w.state.yaw === "number" ? w.state.yaw : 0;
  m.yaw += Math.max(-(D.turn ?? 140) * dt, Math.min((D.turn ?? 140) * dt, arcd(m.yaw, want)));
  w.rotation = m.yaw;
}
function hurt(ctx, p, dmg, color) {
  const ps = p.state, now = ctx.now(), guarded = (ps.guardUntil ?? 0) > now, health = ps.health ?? 1000;
  const d = Math.min(health, Math.round(dmg * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
  if (d > 0) ps.health = health - d;
  const at = { x: p.feetPosition.x, y: p.feetPosition.y + 1.1, z: p.feetPosition.z };
  ctx.emit("damageNumber", { position: at, value: d, color: guarded ? "#9fb6c8" : color }, { audience: near(at) });
  ctx.emit("screenShake", { intensity: 0.4, duration: 0.25 }, { audience: { player: p.id } });
  ctx.emit("flash", { target: p.id, color, duration: 0.15 }, { audience: near(at) });
}
function credit(ctx, p, key, text, xp = 0, loot = null) {
  if (key) ctx.emit("kill", loot ? { tally: key, xp, loot } : { tally: key, xp }, { to: p.id }); // the hero's own machine counts it (quest-player.js ear)
  if (text) ctx.emit("damageNumber", { position: { x: p.feetPosition.x, y: p.feetPosition.y + 2.1, z: p.feetPosition.z }, text, color: "oklch(0.86 0.15 85)", size: 1.1, lifetime: 1.6 }, { audience: { player: p.id } });
}
function arenaOf(ctx, D) { const s = ctx.self.state; return s.arena ?? D.arena ?? { x: s.home?.x ?? ctx.self.feetPosition.x, z: s.home?.z ?? ctx.self.feetPosition.z, r: 16 }; }
function clearAdds(ctx) { for (const r of ctx.query({ tags: ["add-of-" + ctx.self.id], radius: 200 })) ctx.destroy(r.id); }

export function onSpawn(ctx) {
  const D = def(ctx); if (!D) return;
  const s = ctx.self.state;
  s.maxHp = s.maxHp && s.mode !== "dead" ? s.maxHp : D.hp;
  if (s.hp == null || s.mode === "dead") s.hp = s.maxHp;
  s.mode = "asleep"; s.hpPct = Math.round((100 * s.hp) / s.maxHp); s.unhurt = s.hp >= s.maxHp; s.title ??= D.name;
  s.home ??= { x: ctx.self.feetPosition.x, z: ctx.self.feetPosition.z };
  ctx.self.anim.base = { clip: D.clips?.idle ?? "Idle", weight: 1, loop: "loop" };
  if (D.aura) ctx.self.fx = { script: D.aura };
}

function reset(ctx, D, m) {
  const s = ctx.self.state;
  s.mode = "asleep"; s.maxHp = D.hp; s.hp = D.hp; s.hpPct = 100; s.unhurt = true; s.enraged = false; s.cast = null; s.lastHitBy = null;
  m.clocks = {}; m.dmg = {}; m.target = null; clearAdds(ctx);
  if (D.aura) ctx.self.fx = { script: D.aura };
}

export function update(ctx, dt) {
  const D = def(ctx); if (!D) { ctx.sleep(5); return; }
  const w = ctx.self, s = w.state, now = ctx.now(), A = arenaOf(ctx, D), home = s.home;
  const m = (ctx.session.boss ??= { seen: s.lastHitAt ?? 0, clocks: {}, dmg: {} });
  const fighters = ctx.place.players.filter((p) => (p.state?.health ?? 1000) > 0 && !p.state?.dying && !((p.state?.veiledUntil || 0) > now) && flat(p.feetPosition, A) < A.r + 1);

  if (s.mode === "dead") {
    if (s.add) { if (now > (s.diedAt ?? now) + 2500) ctx.destroy(w.id); return; }
    if (now >= (s.diedAt ?? now) + (D.respawn ?? 120) * 1000) { reset(ctx, D, m); w.material = { dissolve: 0 }; m.gait = null; gait(w, m, D, "idle"); }
    else { ctx.sleep(2); return; }
  }
  if (D.aura && !w.fx) w.fx = { script: D.aura };
  if ((s.hp ?? 0) <= 0) return die(ctx, D, m, fighters);
  if (m.hp !== s.hp) {
    if (m.hp != null && s.hp < m.hp && s.lastHitBy) m.dmg[s.lastHitBy] = (m.dmg[s.lastHitBy] ?? 0) + (m.hp - s.hp);
    m.hp = s.hp; s.hpPct = Math.max(0, Math.round((100 * s.hp) / (s.maxHp || D.hp))); s.unhurt = s.hp >= (s.maxHp || D.hp);
  }
  if ((s.lastHitAt ?? 0) !== m.seen) { m.seen = s.lastHitAt ?? 0; if (!s.cast) once(w, D.clips?.hit ?? "cdn/clip-hit-react.glb", 1.2); ctx.emit("flash", { target: w.id, color: "#ffffff", duration: 0.08 }, { audience: near(w.feetPosition) }); }

  if (!fighters.length) {
    if (s.add) { s.hp = 0; return; }
    if (s.mode !== "asleep") reset(ctx, D, m);
    if (flat(w.feetPosition, home) > 0.8) { gait(w, m, D, "walk"); const p = w.feetPosition, d = flat(p, home) || 1; w.velocity = { x: ((home.x - p.x) / d) * (D.walk ?? 1.6), y: -2, z: ((home.z - p.z) / d) * (D.walk ?? 1.6) }; face(w, m, D, home, dt); }
    else { gait(w, m, D, "idle"); w.velocity = { x: 0, y: -2, z: 0 }; if (now > (m.nap ?? 0)) { m.nap = now + 1000; ctx.sleep(1); } }
    return;
  }
  if (s.mode === "asleep") {
    // a hero steps into the arena: the boss speaks first, before it wakes (once a minute)
    if (TAUNTS[s.boss] && !s.add && fighters.length && now > (m.tauntAt ?? 0) && !fighters.some((p) => flat(p.feetPosition, w.feetPosition) < (D.aggro ?? 12))) {
      m.tauntAt = now + 60000;
      ctx.emit("playSound", { clip: TAUNTS[s.boss], position: w.feetPosition, volume: 1, maxDistance: 90, refDistance: 12, bus: "Voice", mode: "restart" }, { audience: near(w.feetPosition, 95) });
    }
    if (!s.add && !fighters.some((p) => flat(p.feetPosition, w.feetPosition) < (D.aggro ?? 12)) && !(s.lastHitAt && now - s.lastHitAt < 3000)) return;
    s.mode = "fight";
    if (D.raidScale && !s.add) { const n = fighters.length; s.maxHp = Math.round(D.hp * (1 + D.raidScale * (n - 1))); s.hp = s.maxHp; m.hp = s.hp; s.hpPct = 100; }
    for (const [i, a] of (D.abilities || []).entries()) m.clocks[i] = now + (a.first ?? a.every * 0.6) * 1000;
    m.nextSwing = now + 1500;
    if (D.sounds?.wake) ctx.emit("playSound", { clip: D.sounds.wake, position: w.feetPosition, volume: 0.9, maxDistance: 80 }, { audience: near(w.feetPosition, 90) });
    if (VOICES[s.boss] && !s.add) for (const p of fighters) { const h = ctx.getObject(p.id); if (h && h.state) h.state._hushUntil = now + 2400; } // their music drops out for the line
    if (VOICES[s.boss] && !s.add) ctx.emit("playSound", { clip: VOICES[s.boss], position: w.feetPosition, volume: 1, maxDistance: 90, refDistance: 12, bus: "Voice", mode: "restart" }, { audience: near(w.feetPosition, 95) });
    if (D.wakeLine && !s.add) for (const p of fighters) ctx.emit("damageNumber", { position: { x: w.feetPosition.x, y: w.feetPosition.y + (D.height ?? 3) + 0.5, z: w.feetPosition.z }, text: D.wakeLine, color: "oklch(0.85 0.12 60)", size: 1.2, lifetime: 3 }, { audience: { player: p.id } });
    ctx.emit("screenShake", { intensity: 0.25, duration: 0.6 }, { audience: near(w.feetPosition) });
  }
  if (D.enrage && !s.enraged && s.hpPct <= D.enrage.below) {
    s.enraged = true; ctx.emit("screenFlash", { color: "#ff3a1a", duration: 0.4, intensity: 0.35 }, { audience: near(w.feetPosition, 90) });
    ctx.emit("highlightSet", { target: w.id, color: "#ff3a1a", style: "pulse", duration: 4 }, { audience: near(w.feetPosition) });
    if (D.enrage.line) for (const p of fighters) credit(ctx, p, null, D.enrage.line);
  }
  const pace = s.enraged ? (D.enrage?.speed ?? 1.25) : 1;

  // a cast in progress: rooted until it lands
  if (s.cast) {
    w.velocity = { x: 0, y: -2, z: 0 };
    if (now < s.cast.at) return;
    land(ctx, D, s.cast, fighters); s.cast = null; return;
  }
  // an ability whose clock is up and whose phase has come
  for (const [i, a] of (D.abilities || []).entries()) {
    if ((a.from ?? 100) < s.hpPct) continue;
    if (now < (m.clocks[i] ?? 0)) continue;
    m.clocks[i] = now + (a.every * 1000) / pace;
    begin(ctx, D, a, i, fighters, A); return;
  }
  // pick a target: nearest, or the mind's choice
  if (D.mind && !s.add) think(ctx, D, m, fighters, now);
  let prey = m.target && fighters.find((p) => p.id === m.target), best = Infinity;
  if (!prey) for (const p of fighters) { const d = flat(p.feetPosition, w.feetPosition); if (d < best) { best = d; prey = p; } }
  best = flat(prey.feetPosition, w.feetPosition);
  const M = D.melee || { damage: 60, reach: 2.6, every: 2.4, windup: 0.6 };
  if (m.windup) {
    w.velocity = { x: 0, y: -2, z: 0 }; face(w, m, D, prey.feetPosition, dt);
    if (now >= m.windup) { m.windup = 0; if (D.sounds?.swing) ctx.emit("playSound", { clip: D.sounds.swing, position: w.feetPosition, volume: 0.8, maxDistance: 30 }, { audience: near(w.feetPosition, 35) }); if (best <= M.reach) { hurt(ctx, prey, M.damage * (s.enraged ? 1.2 : 1), "#ff5a4a"); if (D.sounds?.hit) ctx.emit("playSound", { clip: D.sounds.hit, position: prey.feetPosition, volume: 0.8, maxDistance: 30 }, { audience: near(prey.feetPosition, 35) }); if (D.hitFx) { const hp = { x: prey.feetPosition.x, y: prey.feetPosition.y + 1.1, z: prey.feetPosition.z }; ctx.emit("fx", { position: hp, script: D.hitFx }, { audience: near(hp, 40) }); ctx.emit("cameraPunch", { direction: { x: prey.feetPosition.x - w.feetPosition.x, y: 0, z: prey.feetPosition.z - w.feetPosition.z }, intensity: 0.6 }, { audience: { player: prey.id } }); ctx.emit("hitstop", { duration: 0.05 }, { audience: { player: prey.id } }); } } }
    return;
  }
  if (best <= M.reach * 0.85) {
    w.velocity = { x: 0, y: -2, z: 0 }; gait(w, m, D, "idle"); face(w, m, D, prey.feetPosition, dt);
    if (now >= (m.nextSwing ?? 0)) { m.nextSwing = now + (M.every * 1000) / pace; m.windup = now + M.windup * 1000; once(w, D.clips?.attack ?? "cdn/clip-attack.glb", 0.9); ctx.emit("highlightSet", { target: w.id, color: "#ff2a1a", style: "glow", duration: M.windup }, { audience: near(w.feetPosition) }); }
  } else {
    gait(w, m, D, "walk"); face(w, m, D, prey.feetPosition, dt);
    const p = w.feetPosition, d = best || 1, sp = (D.walk ?? 1.6) * pace;
    w.velocity = { x: ((prey.feetPosition.x - p.x) / d) * sp, y: -2, z: ((prey.feetPosition.z - p.z) / d) * sp };
  }
}

function begin(ctx, D, a, i, fighters, A) {
  const w = ctx.self, s = w.state, now = ctx.now(), t = a.telegraph ?? 1.8, pos = w.feetPosition;
  once(w, D.clips?.cast ?? D.clips?.attack ?? "cdn/clip-attack.glb", 0.5); gait(w, ctx.session.boss, D, "idle");
  const spots = [];
  if (a.kind === "sweep") { spots.push({ x: pos.x, y: pos.y, z: pos.z, r: a.radius }); ctx.emit("fx", { position: { x: pos.x, y: pos.y + 0.05, z: pos.z }, script: RING(a.radius, a.color, t) }, { audience: near(pos) }); }
  if (a.kind === "nova") { spots.push({ x: pos.x, y: pos.y, z: pos.z, r: a.safe }); ctx.emit("fx", { position: { x: pos.x, y: pos.y + 0.05, z: pos.z }, script: RING(a.safe, "gold", t) }, { audience: near(pos) }); ctx.emit("fx", { position: { x: A.x, y: pos.y + 0.05, z: A.z }, script: RING(A.r, a.color, t) }, { audience: near(pos) }); }
  if (a.kind === "pools") for (const p of fighters) { const q = { x: p.feetPosition.x, y: p.feetPosition.y, z: p.feetPosition.z, r: a.radius }; spots.push(q); ctx.emit("fx", { position: { x: q.x, y: q.y + 0.05, z: q.z }, script: RING(a.radius, a.color, t) }, { audience: near(q) }); }
  if (a.kind === "cleave") { const yaw = ((ctx.session.boss.yaw ?? 0) * Math.PI) / 180; spots.push({ x: pos.x, y: pos.y, z: pos.z, yaw, r: a.radius, cone: a.cone ?? 90 }); for (let k = 1; k <= 4; k++) { const d = (a.radius * k) / 4.5; ctx.emit("fx", { position: { x: pos.x - Math.sin(yaw) * d, y: pos.y + 0.05, z: pos.z - Math.cos(yaw) * d }, script: RING(Math.max(0.8, d * Math.tan(((a.cone ?? 90) * Math.PI) / 360)), a.color, t) }, { audience: near(pos) }); } }
  if (a.kind === "summon") spots.push({ x: A.x, y: pos.y, z: A.z });
  s.cast = { i, kind: a.kind, at: now + t * 1000, spots };
  ctx.emit("highlightSet", { target: w.id, color: "#ffb02a", style: "glow", duration: t }, { audience: near(pos) });
  if (a.sound || D.sounds?.telegraph) ctx.emit("playSound", { clip: a.sound || D.sounds.telegraph, position: pos, volume: 0.8, maxDistance: 60 }, { audience: near(pos) });
  if (a.call) for (const p of fighters) ctx.emit("damageNumber", { position: { x: p.feetPosition.x, y: p.feetPosition.y + 2.4, z: p.feetPosition.z }, text: a.call, color: "oklch(0.88 0.16 70)", size: 1.15, lifetime: t + 0.4 }, { audience: { player: p.id } });
}

function land(ctx, D, cast, fighters) {
  const w = ctx.self, a = D.abilities[cast.i], pos = w.feetPosition, key = (D.tally || ctx.self.state.boss) + "_dodge";
  const boom = (q, r) => { ctx.emit("fx", { position: { x: q.x, y: q.y + 0.3, z: q.z }, script: BURST(r, a.color) }, { audience: near(q) }); };
  if (a.sound2 || D.sounds?.burst) ctx.emit("playSound", { clip: a.sound2 || D.sounds.burst, position: pos, volume: 1, maxDistance: 70 }, { audience: near(pos) });
  ctx.emit("shockwave", { position: { x: pos.x, y: pos.y + 0.3, z: pos.z }, speed: 12, thickness: 0.8, intensity: 0.35 }, { audience: near(pos) });
  if (a.kind === "summon") { summon(ctx, D, a); return; }
  for (const q of cast.spots) boom(q, a.kind === "nova" ? 2 : q.r);
  if (a.kind === "nova") { const A = arenaOf(ctx, D); boom({ x: A.x, y: pos.y, z: A.z }, A.r * 0.8); }
  for (const p of fighters) {
    let hit = false;
    if (a.kind === "sweep" || a.kind === "pools") hit = cast.spots.some((q) => flat(p.feetPosition, q) <= q.r);
    if (a.kind === "nova") hit = flat(p.feetPosition, cast.spots[0]) > cast.spots[0].r;
    if (a.kind === "cleave") { const q = cast.spots[0], dx = p.feetPosition.x - q.x, dz = p.feetPosition.z - q.z, d = Math.hypot(dx, dz); const ang = Math.abs(arcd((Math.atan2(-dx, -dz) * 180) / Math.PI, (q.yaw * 180) / Math.PI)); hit = d <= q.r && ang <= q.cone / 2; }
    if (hit) hurt(ctx, p, a.damage * (w.state.enraged ? 1.15 : 1), "#ff7a2a"); else credit(ctx, p, key, "Dodged");
  }
}

function summon(ctx, D, a) {
  const A = arenaOf(ctx, D), n = a.count ?? 3, AD = BOSSES[a.add];
  if (!AD) return;
  const live = ctx.query({ tags: ["add-of-" + ctx.self.id], radius: 200 }).length;
  for (let k = 0; k < Math.min(n, (a.max ?? 8) - live); k++) {
    const ang = ctx.random() * Math.PI * 2, r = A.r * 0.8;
    const at = { x: A.x + Math.cos(ang) * r, y: ctx.self.feetPosition.y + 0.2, z: A.z + Math.sin(ang) * r };
    ctx.spawn({ behavior: "scripts/boss.js", model: AD.model, scale: AD.scale ?? 1, physics: "character", feetPosition: at, tags: ["enemy", "add", "add-of-" + ctx.self.id],
      layout: AD.layout, state: { boss: a.add, add: true, home: { x: at.x, z: at.z }, arena: A, hp: AD.hp, maxHp: AD.hp, hpPct: 100, unhurt: true, radius: 0.6, title: AD.name },
      ui: `<div face="top" facing="player" offset="0.4m" width="0.8m" class="flex flex-col items-center gap-[6px]"><div class="text-[48px] font-bold text-red-200" style="font-family:Cinzel,serif;text-shadow:0 3px 6px #000">${AD.name}</div><div hidden="{{ state.unhurt }}" class="w-full h-[30px] rounded bg-black/75 border-2 border-red-900 p-[3px]"><div class="h-full rounded bg-red-600" style="width: {{ state.hpPct }}%"></div></div></div>` });
    ctx.emit("fx", { position: at, script: BURST(1.2, a.color) }, { audience: near(at) });
  }
}

function think(ctx, D, m, fighters, now) {
  if (now < (m.askAt ?? 0) || m.asking) return;
  m.askAt = now + 6000; m.asking = true;
  const heroes = {}; for (const p of fighters) heroes[p.id] = { damage: Math.round(m.dmg[p.id] ?? 0), distance: Math.round(flat(p.feetPosition, ctx.self.feetPosition)), health: p.state?.health ?? 1000, guarding: (p.state?.guardUntil ?? 0) > now };
  const criteria = {}; for (const p of fighters) criteria[p.id] = "turn on " + (p.displayName || "this hero");
  if (Object.keys(criteria).length < 2) { m.asking = false; m.target = null; return; }
  ctx.job("jev:decide", { state: { boss: D.name, hpPct: ctx.self.state.hpPct, heroes, current: m.target, recent: m.recent ?? [] },
    questions: { target: { type: "choice", instructions: D.mindNote || "Which hero does this raid boss turn on next? It hunts whoever hurts it most, punishes the weak, and rarely chases the one who guards.", criteria } } }, "decided");
}
export function decided(ctx, r) {
  const m = ctx.session.boss; if (!m) return; m.asking = false;
  if (!r?.ok) return;
  const t = r.data?.answers?.target; if (!t?.probabilities) return;
  let roll = ctx.random(), pick = t.choice;
  for (const [id, p] of Object.entries(t.probabilities)) if ((roll -= p) <= 0) { pick = id; break; }
  m.target = pick; m.recent = [...(m.recent ?? []).slice(-3), { at: ctx.now(), target: pick }];
}

function die(ctx, D, m, fighters) {
  const w = ctx.self, s = w.state, now = ctx.now();
  s.mode = "dead"; s.diedAt = now; s.hpPct = 0; s.unhurt = true; s.cast = null;
  w.velocity = { x: 0, y: -2, z: 0 }; w.anim.base = null; once(w, D.clips?.die ?? "cdn/clip-die.glb"); m.gait = null;
  if (D.aura) w.fx = null;
  const at = { x: w.feetPosition.x, y: w.feetPosition.y + 2, z: w.feetPosition.z };
  if (D.sounds?.die) ctx.emit("playSound", { clip: D.sounds.die, position: at, volume: 0.9, maxDistance: 70 }, { audience: near(at) });
  if (s.add) { for (const p of fighters) credit(ctx, p, D.tally, null, D.reward?.xp ?? 0); return; }
  clearAdds(ctx);
  ctx.emit("shockwave", { position: at, speed: 14, thickness: 1.2, intensity: 0.6 }, { audience: near(at) });
  ctx.emit("slowMo", { scale: 0.4, duration: 0.9 }, { audience: near(at) });
  for (const p of fighters) {
    credit(ctx, p, D.tally || s.boss, D.killText || (D.name + " falls"), D.reward?.xp ?? 0, s.boss); // loot: the hero rolls gear.yml on their own machine
    if (D.reward?.copper) ctx.emit("coins", { delta: D.reward.copper, reason: "kill:" + (D.tally || s.boss) }, { to: p.id });
    ctx.emit("milestone", { step: D.milestone ?? 0, name: "boss:" + s.boss }, { audience: { player: p.id } });
  }
}
