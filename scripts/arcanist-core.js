// Arcanist on the player's body: 1 Firebolt, 2 Frost Shard (slows 40% for 3 s), 3 Ward (4 s, halves damage taken).
// Bolts are homing missiles (scripts/missile.js) launched at the soft target; the hit is judged on the caster's machine.
import A from './lib/data/arcanist.yml'
import { classOf, canAct, softTargets, launch, drill, haste } from './lib/kit.js'
const WARD = `fx
pop shell n=1 size=2.6 col=hdr(1.1,1.5,2.6) a=.22*flick(3,.25) sz=$size*(1+time().sin*.02) r=sprite(soft-disc,add)
pop runes rate=?mobile:10|18 on=sphere(1.05).c(1) life=.6..1.1 v=up(.3..0.6) size=.05..0.09 col=hdr(1.4,2,3.4) a=0>.2:1>0 rot=spin(.5) r=sprite(mote,add)
pop ring rate=2.2 at=point().c(1) life=.9 size=2.2 col=hdr(.8,1.2,2.2) a=.5>0 sz=$size*(.85>1.1) r=sprite(soft-disc,add,none,0,0,lit=false)
pop glow n=1 at=point().c(1.1) r=light(<.6,.75,1>,1.6,5)`
function me(ctx) { return (ctx.session.arcanist ??= {})[ctx.self.id] ??= { ready: {} } }
export function onInput(ctx, input) {
  if (classOf(ctx) !== 'arcanist' || !canAct(ctx)) return
  const p = input.pressed || {}
  if (p.attack) use(ctx, 'firebolt')
  else if (p.castSlot2) use(ctx, 'frost')
  else if (p.castSlot3) use(ctx, 'ward')
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
  ctx.after(a.castAt, 'release', { kind, targetId: softTargets(ctx, a.range, A.arc, 1)[0] ?? null })
}
export function release(ctx, { kind, targetId }) { if (classOf(ctx) === 'arcanist') launch(ctx, { ...A[kind], kind }, targetId, 0) }
export function wardEnd(ctx) { if ((ctx.self.state.wardUntil ?? 0) <= ctx.now() + 50) ctx.self.state.wardUntil = 0 }
export function endAction(ctx) { ctx.self.anim.action = null }
