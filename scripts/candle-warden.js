// The Candle Warden: the Hollowcrypt's boss (DHC-03). One body, its own update. Asleep until a hero steps into the ring;
// then it walks at the nearest hero and swings; every few seconds it gathers flame (a telegraphed ring on the floor),
// and the ring bursts: inside burns, outside in the chamber is a dodge (tally warden_sweep). Class scripts write
// hp / lastHitBy / lastHitAt like any enemy. At 0 hp every hero in the chamber is credited (tally candle_warden), it falls,
// and it rises again after W.respawn seconds. Nobody in the chamber: it walks home and heals.
import W from "./lib/data/warden.yml";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const arc = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;
const near = (p) => ({ nearby: p, radius: 45 });
const RING = (r) => `fx
pop ring burst=90 on=arc(${r},6.283,.15) life=1.8 v=up(.15..0.4) size=.18..0.3 col=hdr(3.4,1.4,.5) a=0>.2:1>.8:1>0 sz=$size*(.6>1.3) r=sprite(soft-disc,add)
pop inner burst=30 on=disc(${r}) life=1.8 v=up(.05..0.2) size=.08..0.14 col=hdr(1.6,.5,2.4) a=0>.4:.6>1:0 sz=$size r=sprite(soft-disc,add)
pop glow n=1 at=<0,.4,0> life=1.8 r=light(<1,.5,.2>,6,${r + 4})`;
const BURST = (r) => `fx
pop flame burst=160 on=disc(${r * 0.5}) life=.5..0.9 v=radial(${r * 1.6})+up(1.5..3) size=.3..0.6 acc=drag(2.5)+buoy(1.5) sz=$size*(.6>1.4:.6>.2) col=hdr(4.6,2.2,.6)>hdr(2,.5,.1)>hdr(.6,.12,.03) a=0>.1:1>.7:.8>0 rot=spin(.4) r=sprite(flame-wisp,add)
pop smoke burst=24 on=disc(${r * 0.6}) life=1.5..2.4 v=up(.6..1.2) size=.4..0.7 acc=buoy(.5)+drag(.8) sz=$size*(.6>2.4) col=<.2,.18,.2> a=0>.3:.3>.7:.2>0 r=sprite(smoke-puff,alpha)
pop flash n=1 life=.35 r=light(<1,.6,.25>,30,${r + 8})`;
const CROWN = `fx
pop flame rate=40 on=arc(.35,6.283,.05) life=.3..0.6 v=up(.7..1.2) size=.06..0.12 acc=curl(.5)+buoy(1) sz=$size*(1>.3) col=hdr(4,2.4,.8)>hdr(1.8,.5,.1) a=0>.1:1>.7:.8>0 r=sprite(flame-wisp,add)
pop glow n=1 at=<0,.2,0> r=light(<1,.62,.3>,5,10)`;

function once(w, clip, speed = 1) { w.anim.action = { clip, weight: 1, loop: "once", speed, blend: "override" }; }
function gait(w, m, name) { if (m.gait === name) return; m.gait = name; w.anim.base = { clip: W.clips[name], weight: 1, loop: "loop" }; }
function face(w, m, to, dt) {
  const p = w.feetPosition, want = (Math.atan2(-(to.x - p.x), -(to.z - p.z)) * 180) / Math.PI;
  m.yaw ??= w.state.yaw ?? 0;
  m.yaw += Math.max(-W.turn * dt, Math.min(W.turn * dt, arc(m.yaw, want)));
  w.rotation = m.yaw;
}
function hurt(ctx, p, dmg, color) {
  const ps = p.state, now = ctx.now(), guarded = (ps.guardUntil ?? 0) > now, health = ps.health ?? 1000;
  const d = Math.min(health, Math.round(dmg * (guarded ? 1 - (ps.guardReduce ?? 0) : 1)));
  if (d > 0) ps.health = health - d;
  const at = { x: p.feetPosition.x, y: p.feetPosition.y + 1.1, z: p.feetPosition.z };
  ctx.emit("damageNumber", { position: at, value: d, color: guarded ? "#9fb6c8" : color }, { audience: near(at) });
  ctx.emit("screenShake", { intensity: 0.4, duration: 0.25 }, { audience: { player: p.id } });
  ctx.emit("flash", { target: p.id, color: "#ff6a2a", duration: 0.15 }, { audience: near(at) });
}
function credit(ctx, p, key, text) {
  p.state.tally = { ...(p.state.tally || {}), [key]: (p.state.tally?.[key] || 0) + 1 };
  p.state._questSave = true;
  if (text) ctx.emit("damageNumber", { position: { x: p.feetPosition.x, y: p.feetPosition.y + 2.1, z: p.feetPosition.z }, text, color: "oklch(0.86 0.15 85)", size: 1.1, lifetime: 1.6 }, { audience: { player: p.id } });
}

export function onSpawn(ctx) {
  const s = ctx.self.state;
  s.maxHp = W.hp; if (s.hp == null || s.mode === "dead") s.hp = W.hp;
  s.mode = "asleep"; s.hpPct = 100; s.unhurt = true;
  ctx.self.anim.base = { clip: W.clips.idle, weight: 1, loop: "loop" };
}

export function update(ctx, dt) {
  const w = ctx.self, s = w.state, now = ctx.now(), C = W.chamber, home = s.home ?? { x: 0, z: -70 };
  const m = (ctx.session.warden ??= { seen: s.lastHitAt ?? 0 });
  const fighters = ctx.place.players.filter((p) => (p.state?.health ?? 1000) > 0 && !p.state?.dying && !((p.state?.veiledUntil || 0) > ctx.now()) && flat(p.feetPosition, C) < C.r + 1);
  if (s.mode === "dead") {
    if (now >= (s.diedAt ?? now) + W.respawn * 1000) { s.hp = W.hp; s.hpPct = 100; s.unhurt = true; s.mode = "asleep"; s.lastHitBy = null; w.material = { dissolve: 0 }; w.fx = { script: CROWN }; m.gait = null; gait(w, m, "idle"); }
    else return;
  }
  if ((s.hp ?? 0) <= 0) {
    s.mode = "dead"; s.diedAt = now; s.hpPct = 0; s.unhurt = true; s.sweepAt = 0;
    w.velocity = { x: 0, y: -2, z: 0 }; w.anim.base = null; once(w, W.clips.die); m.gait = null; w.fx = null;
    const at = { x: w.feetPosition.x, y: w.feetPosition.y + 2, z: w.feetPosition.z };
    ctx.emit("playSound", { clip: W.sounds.die, position: at, volume: 0.9, maxDistance: 60 }, { audience: near(at) });
    ctx.emit("shockwave", { position: at, speed: 14, thickness: 1.2, intensity: 0.6 }, { audience: near(at) });
    ctx.emit("slowMo", { scale: 0.4, duration: 0.8 }, { audience: near(at) });
    for (const p of fighters) {
      credit(ctx, p, "candle_warden", "The Warden kneels");
      if (typeof p.state.xp === "number") p.state.xp += W.reward.xp; else p.state.xp = W.reward.xp;
      ctx.emit("coins", { delta: W.reward.copper, reason: "kill:candle_warden" }, { to: p.id });
    }
    return;
  }
  if (m.hp !== s.hp) { m.hp = s.hp; s.hpPct = Math.max(0, Math.round((100 * s.hp) / W.hp)); s.unhurt = s.hp >= W.hp; }
  if ((s.lastHitAt ?? 0) !== m.seen) { m.seen = s.lastHitAt ?? 0; once(w, W.clips.hit, 1.2); ctx.emit("flash", { target: w.id, color: "#ffffff", duration: 0.08 }, { audience: near(w.feetPosition) }); }

  if (!fighters.length) { // nobody in the ring: home, heal, sleep
    if (s.mode !== "asleep") { s.mode = "asleep"; s.sweepAt = 0; s.hp = W.hp; }
    if (flat(w.feetPosition, home) > 0.8) { gait(w, m, "walk"); const p = w.feetPosition, d = flat(p, home) || 1; w.velocity = { x: ((home.x - p.x) / d) * W.walk, y: -2, z: ((home.z - p.z) / d) * W.walk }; face(w, m, home, dt); }
    else { gait(w, m, "idle"); w.velocity = { x: 0, y: -2, z: 0 }; if (now > (m.idleNap ?? 0)) { m.idleNap = now + 1000; ctx.sleep(1); } }
    return;
  }
  if (s.mode === "asleep") {
    if (!fighters.some((p) => flat(p.feetPosition, w.feetPosition) < W.aggro) && !(s.lastHitAt && now - s.lastHitAt < 3000)) return;
    s.mode = "fight"; s.sweepAt = now + W.sweep.every * 1000; m.nextSwing = now + 1500;
    ctx.emit("playSound", { clip: W.sounds.wake, position: w.feetPosition, volume: 0.9, maxDistance: 70 }, { audience: near(w.feetPosition) });
    ctx.emit("screenShake", { intensity: 0.25, duration: 0.6 }, { audience: near(w.feetPosition) });
  }
  // the sweep: telegraph, then burst
  if (s.sweepAt && !s.sweeping && now >= s.sweepAt - W.sweep.telegraph * 1000) {
    s.sweeping = true; w.velocity = { x: 0, y: -2, z: 0 }; gait(w, m, "idle"); once(w, W.clips.attack, 0.5);
    const at = { x: w.feetPosition.x, y: w.feetPosition.y + 0.05, z: w.feetPosition.z };
    ctx.emit("fx", { position: at, script: RING(W.sweep.radius) }, { audience: near(at) });
    ctx.emit("highlightSet", { target: w.id, color: "#ff8a2a", style: "glow", duration: W.sweep.telegraph }, { audience: near(at) });
    ctx.emit("playSound", { clip: W.sounds.telegraph, position: at, volume: 0.8, maxDistance: 50 }, { audience: near(at) });
  }
  if (s.sweeping) {
    if (now < s.sweepAt) return; // rooted while the flame gathers
    s.sweeping = false; s.sweepAt = now + W.sweep.every * 1000;
    const at = { x: w.feetPosition.x, y: w.feetPosition.y + 0.3, z: w.feetPosition.z };
    ctx.emit("fx", { position: at, script: BURST(W.sweep.radius) }, { audience: near(at) });
    ctx.emit("playSound", { clip: W.sounds.sweep, position: at, volume: 1, maxDistance: 60 }, { audience: near(at) });
    ctx.emit("shockwave", { position: at, speed: 10, thickness: 0.8, intensity: 0.35 }, { audience: near(at) });
    for (const p of fighters) {
      if (flat(p.feetPosition, w.feetPosition) <= W.sweep.radius) hurt(ctx, p, W.sweep.damage, "#ff7a2a");
      else credit(ctx, p, "warden_sweep", "Sweep dodged");
    }
    return;
  }
  // walk at the nearest hero and swing
  let prey = null, best = Infinity;
  for (const p of fighters) { const d = flat(p.feetPosition, w.feetPosition); if (d < best) { best = d; prey = p; } }
  if (m.windup) {
    w.velocity = { x: 0, y: -2, z: 0 }; face(w, m, prey.feetPosition, dt);
    if (now >= m.windup) { m.windup = 0; ctx.emit("playSound", { clip: W.sounds.swing, position: w.feetPosition, volume: 0.8, maxDistance: 30 }, { audience: near(w.feetPosition) }); if (best <= W.melee.reach) hurt(ctx, prey, W.melee.damage, "#ff5a4a"); }
    return;
  }
  if (best <= W.melee.reach * 0.85) {
    w.velocity = { x: 0, y: -2, z: 0 }; gait(w, m, "idle"); face(w, m, prey.feetPosition, dt);
    if (now >= (m.nextSwing ?? 0)) { m.nextSwing = now + W.melee.every * 1000; m.windup = now + W.melee.windup * 1000; once(w, W.clips.attack, 0.9); ctx.emit("highlightSet", { target: w.id, color: "#ff2a1a", style: "glow", duration: W.melee.windup }, { audience: near(w.feetPosition) }); }
  } else {
    gait(w, m, "walk"); face(w, m, prey.feetPosition, dt);
    const p = w.feetPosition, d = best || 1;
    w.velocity = { x: ((prey.feetPosition.x - p.x) / d) * W.walk, y: -2, z: ((prey.feetPosition.z - p.z) / d) * W.walk };
  }
}
