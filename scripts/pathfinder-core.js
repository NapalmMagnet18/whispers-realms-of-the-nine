// Pathfinder on the player's body: 1 Arrow, 2 Volley (three arrows in a fan, each to its own target when the pack allows),
// 3 Dodge Roll (a 6 m dash, damage immunity for its length). Arrows are scripts/missile.js rows; numbers in pathfinder.yml.
import P from './lib/data/pathfinder.yml'
import { classOf, canAct, softTargets, launch, forward, drill, haste, applyHit, alive, power } from './lib/kit.js'
const DUST = `fx
pop dust burst=6..9 on=disc(.4) life=.5..0.9 v=up(.4..0.9)+sdir()*(.4..0.9) size=.25..0.4 acc=buoy(.2)+drag(1.6) sz=$size*(.6>1.8) col=<.66,.58,.46> a=0>.35:.3>0 rot=spin(.2) r=sprite(smoke-puff,alpha)`
// Rain of Thorns: one arrow lofted high off the bow, a green mark on the ground, waves of arrows, then the brambles stand
const LOFT = `fx
pop streak burst=1 at=point() life=.5 size=.06 v=<0,1,0>*30 col=hdr(1.6,2.6,1) a=1>0 r=sprite(ember,add,velocity,.4)
pop trail burst=14 on=point() life=.3..0.5 v=up(10..28) size=.04 col=hdr(1,2,.8) a=.8>0 r=sprite(ember,add,velocity,.06)`
const MARK = `fx
pop ring n=1 at=point().c(.05) size=%r|4.5 col=hdr(.9,2.2,.6) a=(.2>.8)*flick(7,.2) sz=$size*2*(1.12>1) r=sprite(soft-disc,add,axis,0,.55,axis=<0,1,0>)
pop leaves rate=24 on=disc(%r|4.5).c(4) life=.8..1.2 v=<0,-1,0>*(2..3)+sdir()*.4 size=.05..0.09 col=<.3,.5,.18> a=1>0 rot=spin(2) r=sprite(soft-disc,alpha)
pop glow n=1 at=point().c(.5) r=light(<.5,1,.35>,2.5,%r|4.5*2)`
const WAVE = `fx
pop arrows burst=?mobile:16|28 on=disc(%r|4.5).c(9) life=.32..0.4 v=<0,-1,0>*(26..32)+sdir()*1.2 size=.035 col=hdr(.9,1.6,.7) a=1 floor=die r=sprite(ember,add,velocity,.55)
pop chips on=@arrows life=.4..0.7 v=up(1.5..3)+sdir()*(1..2) size=.03..0.06 acc=grav()*1.2+drag(.8) col=<.42,.33,.22> a=1>0 floor=bounce(.2) r=mesh(box,1,.5,1)
pop dust on=@arrows?.5 life=.6..1 v=up(.4..0.8)+sdir()*.4 size=.25..0.4 acc=buoy(.2)+drag(1.6) sz=$size*(.6>1.7) col=<.6,.53,.42> a=0>.3:.3>0 rot=spin(.2) r=sprite(smoke-puff,alpha)
pop sparks on=@arrows?.4 life=.15..0.3 v=up(1..2.5)+sdir()*(1..2) size=.015..0.03 col=hdr(1.4,2.6,.9) a=1>0 r=sprite(ember,add,velocity,.02)
pop light burst=1 life=.5 gl=1>0 r=light(<.6,1,.4>,$gl*5,%r|4.5*2.2)`
const THORNS = `fx
pop vines n=?mobile:22|40 on=disc(%r|4.5) size=.04..0.06 tilt=-.5..0.5 col=<.12,.16,.07> a=1 rot=$tilt r=mesh(cylinder,1,14,1)
pop barbs n=?mobile:30|60 on=disc(%r|4.5).c(.6) size=.08..0.14 col=<.22,.2,.1> a=1 rot=spin(1) r=mesh(box,.2,1,.2)
pop glow rate=10 on=disc(%r|4.5).c(.3) life=1..1.6 v=up(.2..0.5) size=.03..0.06 col=hdr(.8,2,.5) a=0>.2:.8>0 acc=curl(.4) r=sprite(mote,add)
pop shade n=1 at=point().c(.03) size=%r|4.5 col=<.05,.08,.02> a=.55 sz=$size*2 r=sprite(soft-disc,alpha,axis,0,0,axis=<0,1,0>)`
export function loftRain(ctx, { targetId }) {
  if (classOf(ctx) !== 'pathfinder') return
  const a = P.rain, self = ctx.self, t = targetId ? ctx.getObject(targetId) : null
  let at
  if (t && alive(t)) at = { x: t.feetPosition.x, y: t.feetPosition.y, z: t.feetPosition.z }
  else { const f = forward(self), x = self.feetPosition.x + f.x * a.ahead, z = self.feetPosition.z + f.z * a.ahead, h = ctx.place.terrain?.heightAt?.(x, z); at = { x, y: h ?? self.feetPosition.y, z } }
  const p = self.feetPosition, aud = { audience: { nearby: at, radius: 80 } }
  ctx.emit('fx', { position: { x: p.x, y: p.y + 1.6, z: p.z }, script: LOFT }, aud)
  ctx.emit('fx', { position: at, script: MARK, params: { r: a.radius }, lifetime: a.fallAt + 0.1 }, aud)
  ctx.emit('playSound', { clip: a.hiss, position: at, volume: 0.5, maxDistance: 50 }, aud)
  ctx.after(a.fallAt, 'rainPulse', { at, n: 0 })
}
export function rainPulse(ctx, { at, n }) {
  const a = P.rain, self = ctx.self, now = ctx.now(), aud = { audience: { nearby: at, radius: 80 } }
  const thornPulses = Math.ceil(a.thornsFor / 0.5), striking = n < a.waves
  if (striking) {
    ctx.emit('fx', { position: at, script: WAVE, params: { r: a.radius } }, aud)
    ctx.emit('playSound', { clip: a.thud, position: at, volume: 0.6, pitch: 0.92 + ctx.random() * 0.16, maxDistance: 45 }, aud)
  }
  if (n === a.waves - 1) {
    ctx.emit('fx', { position: at, script: THORNS, params: { r: a.radius }, lifetime: a.thornsFor }, aud)
    ctx.emit('playSound', { clip: a.thorns, position: at, volume: 0.45, maxDistance: 35 }, aud)
  }
  const dmg = Math.round(a.damage * power(ctx))
  for (const r of ctx.query({ tags: ['enemy'], center: at, radius: a.radius + 0.4 })) {
    const t = ctx.getObject(r.id); if (!alive(t)) continue
    if (striking) applyHit(ctx, self.id, t, { damage: dmg, kind: 'arrow', at: { x: r.feetPosition.x, y: r.feetPosition.y + 1, z: r.feetPosition.z }, slow: n === a.waves - 1 ? a.slow : 0, slowFor: 1.2 })
    else if (n >= a.waves) { t.state.slowUntil = now + 800; t.state.slowMult = 1 - a.slow }
  }
  if (n < a.waves - 1) ctx.after(a.pulseEvery, 'rainPulse', { at, n: n + 1 })
  else if (n < a.waves - 1 + thornPulses) ctx.after(0.5, 'rainPulse', { at, n: n + 1 })
}
function me(ctx) { return (ctx.session.pathfinder ??= {})[ctx.self.id] ??= { ready: {} } }
export function onInput(ctx, input) {
  if (classOf(ctx) !== 'pathfinder' || !canAct(ctx)) return
  const p = input.pressed || {}
  if (p.attack) use(ctx, 'arrow', input)
  else if (p.castSlot2) use(ctx, 'volley', input)
  else if (p.castSlot3) use(ctx, 'roll', input)
  else if (p.castSlot4) use(ctx, 'rain', input)
}
function use(ctx, kind, input) {
  const a = P[kind], m = me(ctx), now = ctx.now(), self = ctx.self
  if (!a || now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000 * haste(ctx)
  m.busyUntil = now + (a.busy ?? 0.5) * 1000
  self.state.cd = { ...(self.state.cd || {}), [kind]: m.ready[kind] }
  self.anim.action = { clip: a.clip, weight: 1, loop: 'once', speed: a.speed_anim ?? 1, blendIn: 0.06 }
  if (m.clearId) ctx.cancel(m.clearId)
  m.clearId = ctx.after(a.length, 'endAction')
  const near = { audience: { nearby: self.feetPosition, radius: 30 } }
  if (a.sound) ctx.emit('playSound', { clip: a.sound, position: self.feetPosition, volume: 0.45, pitch: 0.95 + ctx.random() * 0.12 }, near)
  if (kind === 'roll') {
    drill(ctx, 'trail-drill')
    const v = self.velocity || { x: 0, z: 0 }, sp = Math.hypot(v.x, v.z)
    const dir = sp > 1 ? { x: v.x / sp, z: v.z / sp } : forward(self)
    m.rollDir = dir; m.rollSpeed = a.distance / a.dash; m.rollUntil = now + a.dash * 1000
    self.state.guardUntil = now + a.immune * 1000
    self.state.guardReduce = 1
    self.state.dodgeUntil = now + a.immune * 1000
    self.velocity = { x: dir.x * m.rollSpeed, y: self.velocity?.y ?? 0, z: dir.z * m.rollSpeed }
    ctx.emit('fx', { position: self.feetPosition, script: DUST }, near)
    return
  }
  if (kind === 'rain') { ctx.after(a.castAt, 'loftRain', { targetId: softTargets(ctx, a.range, P.arc, 1)[0] ?? null }); return }
  ctx.after(a.castAt, 'release', { kind, targets: softTargets(ctx, a.range, P.arc, a.count ?? 1) })
}
export function release(ctx, { kind, targets }) {
  if (classOf(ctx) !== 'pathfinder') return
  const a = { ...P[kind], kind }, n = a.count ?? 1
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : (i - (n - 1) / 2) * (a.fan ?? 12)       // centre, then left/right
    launch(ctx, a, targets[i === (n - 1) / 2 ? 0 : (i < (n - 1) / 2 ? 1 : 2)] ?? targets[0] ?? null, off)
  }
}
// the dash holds its speed over player.js's easing for its length
export function update(ctx) {
  const m = ctx.session.pathfinder?.[ctx.self.id]
  if (!m || !m.rollUntil) return
  if (ctx.now() >= m.rollUntil) { m.rollUntil = 0; return }
  const v = ctx.self.velocity || { y: 0 }
  ctx.self.velocity = { x: m.rollDir.x * m.rollSpeed, y: v.y, z: m.rollDir.z * m.rollSpeed }
}
export function endAction(ctx) { ctx.self.anim.action = null }
