// Shade on the player's body: 1 Strike (a dagger; x3 as an Ambush), 2 Shadowstep (blink behind the target in front,
// or 8 m ahead), 3 Veil (6 s unseen: wolves, scavengers and wardens lose you; a Strike breaks it). Numbers in shade.yml.
// The Unseen Door's drills: a veiled hero slipping past a `shade-drill` thing with state.need "veil", or landing a
// Shadowstep beside one with need "step", counts its tallyKey once per thing while state.quest is active.
import S from './lib/data/shade.yml'
import { classOf, canAct, softTargets, forward, alive, aimPoint, meleePlayer, strikePlayer, power, meleeFoley } from './lib/kit.js'
import { rotate, normalize } from 'builtin/vec3'
import { raycast } from 'builtin/physics'

const PUFF = `fx
pop smoke burst=14..20 on=sphere(.35) life=.5..0.9 v=sdir()*(.6..1.4)+up(.4) size=.3..0.55 acc=drag(2)+buoy(.3) sz=$size*(.7>1.8) col=<.16,.11,.22>><.08,.06,.1> a=0>.08:.8>.6:.5>0 rot=spin(.4) r=sprite(smoke-puff,alpha)
pop motes burst=10 on=sphere(.4) life=.4..0.8 v=sdir()*(1..2) size=.03..0.06 acc=drag(1.5) col=hdr(1.2,.6,2.2) a=1>0 r=sprite(mote,add)`
const VEIL = `fx
pop wisp rate=?mobile:10|22 on=disc(.35) life=.6..1.1 v=up(.5..1.1)+sdir()*.2 size=.2..0.38 acc=buoy(.4)+curl(.4)+drag(1.2) sz=$size*(.6>1.6) col=<.14,.1,.2> a=0>.2:.55>.7:.3>0 rot=spin(.3) r=sprite(smoke-puff,alpha)
pop glint rate=4 on=disc(.3).c(1) life=.5..0.9 v=up(.3) size=.03..0.05 col=hdr(1,.5,1.9) a=1>0 r=sprite(mote,add)`
const CUT = `fx
pop spark burst=6..10 life=.12..0.25 v=<%normal|0,1,0>*(2..4)+sdir()*(1..2) size=.02..0.04 col=hdr(3,2.6,3.2) a=1>0 r=sprite(ember,add,velocity,.04)
pop shade burst=4 life=.3..0.5 v=sdir()*.6 size=.2..0.3 acc=drag(2) col=<.2,.12,.28> a=.6>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)`
const THUD = '/cdn/moodboard-painterly-fantasy/sfx-sword-hit-wooden-dummy-thud.mp3'

function me(ctx) { return (ctx.session.shade ??= {})[ctx.self.id] ??= { ready: {} } }
export function veiled(ctx) { return (ctx.self.state.veiledUntil || 0) > ctx.now() }

export function onInput(ctx, input) {
  if (classOf(ctx) !== 'shade' || !canAct(ctx)) return
  const p = input.pressed || {}
  if (p.attack) use(ctx, 'strike')
  else if (p.castSlot2) use(ctx, 'step')
  else if (p.castSlot3) use(ctx, 'veil')
}

function use(ctx, kind) {
  const a = S[kind], m = me(ctx), now = ctx.now(), self = ctx.self
  if (now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000
  m.busyUntil = now + (kind === 'strike' ? 380 : 300)
  self.state.cd = { ...(self.state.cd || {}), [kind]: m.ready[kind] }
  const near = { audience: { nearby: self.feetPosition, radius: 30 } }
  if (a.clip) {
    self.anim.action = { clip: a.clip, weight: 1, loop: 'once', speed: a.speed, blendIn: 0.06 }
    if (m.clearId) ctx.cancel(m.clearId)
    m.clearId = ctx.after(a.length, 'endAction')
  }
  if (a.sound) ctx.emit('playSound', { clip: a.sound, position: self.feetPosition, volume: kind === 'veil' ? 0.5 : 0.4, pitch: 0.95 + ctx.random() * 0.1 }, near)
  if (kind === 'strike') { ctx.after(a.hitAt, 'land'); return }
  if (kind === 'veil') {
    self.state.veiledUntil = now + a.length * 1000
    ctx.emit('fx', { position: self.feetPosition, attachTo: self.id, script: VEIL, lifetime: a.length }, { audience: { nearby: self.feetPosition, radius: 60 } })
    ctx.emit('fx', { position: { ...self.feetPosition, y: self.feetPosition.y + 1 }, script: PUFF }, near)
    ctx.emit('screenFlash', { color: '#2a1838', duration: 0.35, intensity: 0.4 }, { audience: { player: self.id } })
    if (m.unveilId) ctx.cancel(m.unveilId)
    m.unveilId = ctx.after(a.length, 'unveil')
    return
  }
  // Shadowstep: behind the soft target, else straight ahead until a wall
  const from = { ...self.feetPosition }
  const tid = softTargets(ctx, a.range, S.arc, 1)[0], t = tid ? ctx.getObject(tid) : null
  let dest, faceYaw
  if (t && alive(t)) {
    const tf = rotate(t.rotation || 0, { x: 0, y: 0, z: -1 }), l = Math.hypot(tf.x, tf.z) || 1
    dest = { x: t.feetPosition.x - tf.x / l * a.behind, y: t.feetPosition.y, z: t.feetPosition.z - tf.z / l * a.behind }
    faceYaw = Math.atan2(-(t.feetPosition.x - dest.x), -(t.feetPosition.z - dest.z)) * 180 / Math.PI
  } else {
    const f = forward(self), eye = { x: from.x, y: from.y + 1.1, z: from.z }
    const hit = raycast(ctx, eye, f, { distance: a.blink, physicsOnly: true, excludeTags: ['player', 'projectile'] })
    const d = hit ? Math.max(0, hit.distance - 0.7) : a.blink
    dest = { x: from.x + f.x * d, y: from.y, z: from.z + f.z * d }
  }
  const h = ctx.place.terrain?.heightAt?.(dest.x, dest.z)
  if (typeof h === 'number' && h > dest.y - 0.5) dest.y = Math.max(dest.y, h)
  ctx.emit('fx', { position: { ...from, y: from.y + 1 }, script: PUFF }, near)
  self.velocity = { x: 0, y: 0, z: 0 }
  self.feetPosition = { x: dest.x, y: dest.y + 0.05, z: dest.z }
  if (faceYaw !== undefined) self.rotation = { yaw: faceYaw }
  m.ambushUntil = now + a.ambushWindow * 1000
  ctx.emit('fx', { position: { ...dest, y: dest.y + 1 }, script: PUFF }, { audience: { nearby: dest, radius: 30 } })
  drill(ctx, 'step', dest)
}

export function land(ctx) {
  const a = S.strike, self = ctx.self, m = me(ctx), now = ctx.now()
  const f = forward(self), cosArc = Math.cos(S.arc * Math.PI / 180)
  let hit = null
  for (const r of ctx.query({ tags: ['enemy'], radius: a.reach + 1 })) {
    if (!r.state || (r.state.hp ?? 0) <= 0 || r.state.dead || r.state.down) continue
    const dx = r.feetPosition.x - self.feetPosition.x, dz = r.feetPosition.z - self.feetPosition.z, d = Math.hypot(dx, dz)
    if (d > a.reach + (r.state.radius ?? 0.4)) continue
    if (d > 0.3 && (dx * f.x + dz * f.z) / d < cosArc) continue
    hit = r; break
  }
  const wasVeiled = veiled(ctx)
  if (wasVeiled) unveil(ctx)
  let pvp = null
  if (!hit) { pvp = meleePlayer(ctx, a.reach, cosArc); if (!pvp) return }
  const t = pvp || ctx.getObject(hit.id); if (!t) return
  const tf = rotate(t.rotation || 0, { x: 0, y: 0, z: -1 }), tl = Math.hypot(tf.x, tf.z) || 1
  const bx = self.feetPosition.x - t.feetPosition.x, bz = self.feetPosition.z - t.feetPosition.z, bl = Math.hypot(bx, bz) || 1
  const behind = (tf.x * bx + tf.z * bz) / (tl * bl) < -0.35
  const ambush = wasVeiled || now < (m.ambushUntil || 0) || behind
  const dmg = Math.round(a.damage * power(ctx) * (ambush ? a.ambush : 1))
  m.ambushUntil = 0
  let shown = dmg
  if (pvp) shown = strikePlayer(ctx, t, dmg, ambush ? 'ambush' : 'strike')
  else { t.state.hp -= dmg; t.state.lastHitBy = self.id; t.state.lastHitAt = now; t.state.lastHitKind = ambush ? 'ambush' : 'strike' }
  const pos = aimPoint(t), n = normalize({ x: -bx, y: 0.4, z: -bz }), near = { nearby: pos, radius: 40 }
  ctx.emit('damageNumber', { position: pos, value: shown, crit: ambush, color: pvp ? '#ff6a55' : ambush ? '#d9a6ff' : undefined }, { audience: near })
  if (ambush) ctx.emit('damageNumber', { position: { ...pos, y: pos.y + 0.6 }, text: 'Ambush!', color: '#c890ff', size: 1.2, lifetime: 1.2 }, { audience: { player: self.id } })
  ctx.emit('fx', { position: pos, script: CUT, params: { normal: n } }, { audience: near })
  meleeFoley(ctx, pvp ? { tags: [], state: { material: 'flesh' } } : t, pos, ambush, near)
  ctx.emit('squash', { target: t.id, axis: 'y', intensity: ambush ? 0.22 : 0.1, duration: 0.18 }, { audience: near })
  ctx.emit('hitstop', { duration: ambush ? 0.08 : 0.04 }, { audience: { player: self.id } })
  ctx.emit('cameraPunch', { direction: n, intensity: ambush ? 0.45 : 0.18 }, { audience: { player: self.id } })
}

export function unveil(ctx) {
  const m = me(ctx); if (m.unveilId) { ctx.cancel(m.unveilId); m.unveilId = null }
  if (!ctx.self.state.veiledUntil) return
  ctx.self.state.veiledUntil = 0
  ctx.emit('fx', { position: { ...ctx.self.feetPosition, y: ctx.self.feetPosition.y + 1 }, script: PUFF }, { audience: { nearby: ctx.self.feetPosition, radius: 30 } })
}
export function endAction(ctx) { ctx.self.anim.action = null }

// a sentry slipped past, a trial post stepped to: once per thing per quest
function drill(ctx, need, at) {
  const st = ctx.self.state, aqs = st.activeQuests || [], p = at || ctx.self.feetPosition
  for (const r of ctx.query({ tags: ['shade-drill'], center: p, radius: S.drillReach })) {
    const d = r.state || {}; if (d.need !== need || !aqs.some((q) => q && q.questId === d.quest)) continue
    const key = r.id + ':' + d.quest; if ((st.marks || {})[key]) continue
    st.marks = { ...(st.marks || {}), [key]: ctx.now() }
    st.tally = { ...(st.tally || {}), [d.tallyKey]: ((st.tally || {})[d.tallyKey] || 0) + 1 }; st._questSave = true
    const pos = { x: r.feetPosition.x, y: r.feetPosition.y + 2.1, z: r.feetPosition.z }
    ctx.emit('damageNumber', { position: pos, text: d.blockText || 'Unseen', color: '#c9a6ff', size: 1.1, lifetime: 1.4 }, { audience: { player: ctx.self.id } })
    ctx.emit('playSound', { clip: d.sound || '/cdn/moodboard-painterly-fantasy/sfx-quest-objective-chime.mp3', position: pos, volume: 0.5 }, { audience: { player: ctx.self.id } })
  }
}
export function update(ctx) {
  if (classOf(ctx) !== 'shade') { ctx.sleep(5); return }
  if (!veiled(ctx)) { if (ctx.self.state.veiledUntil) ctx.self.state.veiledUntil = 0; ctx.sleep(1); return }
  drill(ctx, 'veil')
  ctx.sleep(0.25)
}
