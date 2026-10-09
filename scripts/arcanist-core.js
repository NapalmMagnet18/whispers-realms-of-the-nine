// Arcanist on the player's body: 1 Firebolt, 2 Frost Shard (slows 40% for 3 s), 3 Ward (4 s, halves damage taken).
// Bolts are homing missiles (scripts/missile.js) launched at the soft target; the hit is judged on the caster's machine.
import A from './lib/data/arcanist.yml'
import { classOf, canAct, softTargets, launch, drill, haste, forward, applyHit, alive, power } from './lib/kit.js'
const WARD = `fx
pop shell n=1 size=2.6 col=hdr(1.1,1.5,2.6) a=.22*flick(3,.25) sz=$size*(1+time().sin*.02) r=sprite(soft-disc,add)
pop runes rate=?mobile:10|18 on=sphere(1.05).c(1) life=.6..1.1 v=up(.3..0.6) size=.05..0.09 col=hdr(1.4,2,3.4) a=0>.2:1>0 rot=spin(.5) r=sprite(mote,add)
pop ring rate=2.2 at=point().c(1) life=.9 size=2.2 col=hdr(.8,1.2,2.2) a=.5>0 sz=$size*(.85>1.1) r=sprite(soft-disc,add,none,0,0,lit=false)
pop glow n=1 at=point().c(1.1) r=light(<.6,.75,1>,1.6,5)`
// Cinderfall, in four beats: the chant at the caster, the warning ring on the ground, the star's streak, the landing
const CHANT = `fx
pop sigil n=1 at=point().c(.04) size=2.2 col=hdr(3,1.2,.3) a=0>.2:.8>1:.8>0 sz=$size*(.6>1) rot=$age*1.5 r=sprite(soft-disc,add,axis,0,0,axis=<0,1,0>)
pop motes rate=?mobile:30|60 on=disc(1.1) life=.5..0.9 v=up(1.2..2.2) size=.03..0.06 col=hdr(5,2.2,.5) a=0>.2:1>0 acc=curl(.6)+drag(1) r=sprite(ember,add,velocity,.02)
pop glow n=1 at=point().c(1.2) r=light(<1,.55,.2>,2.4,6)`
const WARN = `fx
pop ring n=1 at=point().c(.05) size=%r|4 col=hdr(3,.9,.2) a=(.25>.9)*flick(9,.25) sz=$size*2*(1.15>1) r=sprite(soft-disc,add,axis,0,.5,axis=<0,1,0>)
pop fill n=1 at=point().c(.04) size=%r|4 col=hdr(1.2,.3,.05) a=.1>.45 sz=$size*2*(0>1) r=sprite(soft-disc,add,axis,0,0,axis=<0,1,0>)
pop sparks rate=40 on=disc(%r|4) life=.3..0.6 v=up(.6..1.4) size=.02..0.04 col=hdr(5,2,.4) a=1>0 r=sprite(ember,add,velocity,.02)`
const STREAK = `fx
pop star n=1 at=point() size=1.6 col=hdr(8,4,1.4) life=%t|0.9 a=1 sz=$size*flick(14,.15) local r=sprite(soft-disc,add)
pop trail rate=?mobile:90|180 on=sphere(.4) life=.35..0.7 v=sdir()*(.3..0.8) size=.4..0.8 col=hdr(5,2.2,.5)>hdr(1.6,.4,.06)>hdr(.3,.06,.01) a=0>.1:1>.6:.6>0 sz=$size*(1>.3) acc=curl(.6)+drag(2) r=sprite(flame-wisp,add)
pop smoke rate=?mobile:12|24 on=sphere(.5) life=1..1.8 size=.5..0.9 col=<.2,.17,.16> a=0>.2:.35>0 sz=$size*(.8>2.4) acc=curl(.3)+drag(1.4) r=sprite(smoke-puff,alpha)
pop glow n=1 at=point() r=light(<1,.6,.25>,8,14)`
const BOOM = `fx
pop flash burst=1 life=.25 size=6 col=hdr(8,4,1.2) a=1>0 sz=$size*(.4>1.4) r=sprite(soft-disc,add)
pop wave burst=1 at=point().c(.1) life=.55 size=1 col=hdr(4,1.8,.4) a=.9>0 sz=%r|4*2.4*(.2>1) r=sprite(soft-disc,add,axis,0,.85,axis=<0,1,0>)
pop pillar burst=40..60 on=disc(1.2) life=.5..1.1 v=up(5..9)+sdir()*(1..2.5) size=.5..1 acc=curl(.8)*1.4+buoy(1.5)+drag(2.6) sz=$size*(.6>1.5:.5>.3) col=hdr(6,2.8,.7)>.45:hdr(2.6,.8,.12)>hdr(.6,.12,.02) a=0>.06:1>.7:.8>0 rot=spin(.3) r=sprite(flame-wisp,add)
pop ground burst=30..44 on=disc(%r|4) life=.8..1.8 v=up(.6..1.6) size=.3..0.6 acc=curl(.5)+buoy(1.2)+drag(2) sz=$size*(.5>1:1>.2) col=hdr(4,1.6,.35)>hdr(1,.22,.03) a=(0>.1:1>.7:.8>0)*flick(9,.3) r=sprite(flame-wisp,add)
pop rocks burst=18..26 on=disc(.8) life=1..1.6 v=up(5..8)+sdir()*(3..6) size=.08..0.2 acc=grav()*1.4+drag(.3) col=<.18,.12,.09> a=1 floor=bounce(.25) r=mesh(rock,1,1,1,velocity)
pop embers burst=80..120 life=.8..2 v=sdir()*(4..10)+up(3..6) size=.02..0.05 acc=curl(1)*.8+grav()*.6+drag(.6) col=hdr(6,3,.7)>hdr(1.4,.35,.05) a=(1>0)*flick(12,.4) floor=bounce(.2) r=sprite(ember,add,velocity,.03)
pop smoke burst=16..22 on=disc(%r|4) life=2.5..4.5 v=up(.8..2)+sdir()*.8 size=1..1.8 acc=buoy(.5)+curl(.3)*.6+drag(1) sz=$size*(.6>2.6) col=<.22,.19,.17>><.12,.12,.13> a=0>.4:.4>0 rot=spin(.1) r=sprite(smoke-puff,alpha)
pop haze burst=?low:0|8 life=.6..1 v=up(1) size=2..3 sz=$size*(.7>1.4) col=<.008,.01,0> a=.8>0 r=sprite(soft-disc,distort)
pop light burst=1 life=1.4 gl=1>.15:.4>0 r=light(<1,.5,.18>,$gl*40,18)`
const SCORCH = '/cdn/value.ef4ee5e30d4a5eeb5e69ded461e8ca612b535ef6192f1e6b201f150316e8bce7.png'
export function callStar(ctx, { targetId }) {
  if (classOf(ctx) !== 'arcanist') return
  const a = A.cinderfall, self = ctx.self, t = targetId ? ctx.getObject(targetId) : null
  let at
  if (t && alive(t)) at = { x: t.feetPosition.x, y: t.feetPosition.y, z: t.feetPosition.z }
  else { const f = forward(self), x = self.feetPosition.x + f.x * a.ahead, z = self.feetPosition.z + f.z * a.ahead, h = ctx.place.terrain?.heightAt?.(x, z); at = { x, y: h ?? self.feetPosition.y, z } }
  const aud = { audience: { nearby: at, radius: 90 } }
  ctx.emit('fx', { position: at, script: WARN, params: { r: a.radius }, lifetime: a.fallAt + 0.1 }, aud)
  // the star streaks in from high behind the caster's shoulder, so it reads as falling toward the mark
  const f = forward(self), from = { x: at.x - f.x * 10, y: at.y + 26, z: at.z - f.z * 10 }
  const star = ctx.spawn({ feetPosition: from, lifetime: a.fallAt + 0.3, castShadow: false, fx: { script: STREAK, params: { t: a.fallAt } }, interpolation: null })
  import('builtin/tween').then(({ animate }) => animate(ctx, star, { 'feetPosition.x': at.x, 'feetPosition.y': at.y + 0.3, 'feetPosition.z': at.z }, { duration: a.fallAt, easing: 'easeInQuad' })).catch(() => {})
  ctx.emit('playSound', { clip: a.fall, position: at, volume: 0.55, maxDistance: 60 }, aud)
  ctx.after(a.fallAt, 'starLands', { at })
}
export function starLands(ctx, { at }) {
  const a = A.cinderfall, self = ctx.self, aud = { audience: { nearby: at, radius: 90 } }
  ctx.emit('fx', { position: at, script: BOOM, params: { r: a.radius } }, aud)
  ctx.emit('decal', { position: at, normal: { x: 0, y: 1, z: 0 }, texture: SCORCH, size: a.radius * 2.2, lifetime: 18, fade: 4 }, aud)
  ctx.emit('shockwave', { position: { x: at.x, y: at.y + 0.5, z: at.z }, speed: 18, thickness: 1.2, intensity: 0.5 }, aud)
  ctx.emit('playSound', { clip: a.impact, position: at, volume: 0.9, maxDistance: 80 }, aud)
  ctx.emit('screenShake', { intensity: 0.35, duration: 0.35 }, { audience: { player: self.id } })
  const dmg = Math.round(a.damage * power(ctx)), hit = { x: at.x, y: at.y + 1, z: at.z }
  for (const r of ctx.query({ tags: ['enemy'], center: at, radius: a.radius + 0.6 })) {
    const t = ctx.getObject(r.id); if (!alive(t)) continue
    const d = Math.hypot(r.feetPosition.x - at.x, r.feetPosition.z - at.z), falloff = d < a.radius * 0.4 ? 1 : 0.65
    applyHit(ctx, self.id, t, { damage: Math.round(dmg * falloff), kind: 'firebolt', at: { x: r.feetPosition.x, y: r.feetPosition.y + 1, z: r.feetPosition.z }, missile: 'fire', normal: { x: 0, y: 1, z: 0 } })
    ctx.emit('impulse', { target: r.id, impulse: { x: (r.feetPosition.x - at.x) * 2, y: 4, z: (r.feetPosition.z - at.z) * 2 } }, aud)
  }
}
function me(ctx) { return (ctx.session.arcanist ??= {})[ctx.self.id] ??= { ready: {} } }
export function onInput(ctx, input) {
  if (classOf(ctx) !== 'arcanist' || !canAct(ctx)) return
  const p = input.pressed || {}
  if (p.attack) use(ctx, 'firebolt')
  else if (p.castSlot2) use(ctx, 'frost')
  else if (p.castSlot3) use(ctx, 'ward')
  else if (p.castSlot4) use(ctx, 'cinderfall')
}
function use(ctx, kind) {
  const a = A[kind], m = me(ctx), now = ctx.now(), self = ctx.self
  if (!a || now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000 * haste(ctx)
  m.busyUntil = now + (a.busy ?? 0.5) * 1000
  self.state.cd = { ...(self.state.cd || {}), [kind]: m.ready[kind] }
  self.anim.action = { clip: a.clip, weight: 1, loop: 'once', speed: a.speed_anim ?? 1, blendIn: 0.08 }
  if (m.clearId) ctx.cancel(m.clearId)
  m.clearId = ctx.after(a.length, 'endAction')
  const near = { audience: { nearby: self.feetPosition, radius: 30 } }
  if (a.sound) ctx.emit('playSound', { clip: a.sound, position: self.feetPosition, volume: 0.45, pitch: 0.95 + ctx.random() * 0.1 }, near)
  if (kind === 'ward') {
    self.state.guardUntil = now + a.length * 1000
    self.state.guardReduce = a.reduce
    self.state.wardUntil = now + a.length * 1000
    ctx.emit('fx', { position: self.feetPosition, attachTo: self.id, script: WARD, lifetime: a.length }, { audience: { nearby: self.feetPosition, radius: 60 } })
    ctx.after(a.length, 'wardEnd')
    drill(ctx, 'arcane-drill')
    return
  }
  if (kind === 'cinderfall') {
    // ground glow at the caster's hands while the chant builds
    ctx.emit('fx', { position: self.feetPosition, attachTo: self.id, script: CHANT, lifetime: a.castAt + 0.2 }, near)
    ctx.after(a.castAt, 'callStar', { targetId: softTargets(ctx, a.range, A.arc, 1)[0] ?? null })
    return
  }
  ctx.after(a.castAt, 'release', { kind, targetId: softTargets(ctx, a.range, A.arc, 1)[0] ?? null })
}
export function release(ctx, { kind, targetId }) { if (classOf(ctx) === 'arcanist') launch(ctx, { ...A[kind], kind }, targetId, 0) }
export function wardEnd(ctx) { if ((ctx.self.state.wardUntil ?? 0) <= ctx.now() + 50) ctx.self.state.wardUntil = 0 }
export function endAction(ctx) { ctx.self.anim.action = null }
