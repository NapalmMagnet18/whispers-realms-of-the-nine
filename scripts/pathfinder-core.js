// Pathfinder on the player's body: 1 Arrow, 2 Volley (three arrows in a fan, each to its own target when the pack allows),
// 3 Dodge Roll (a 6 m dash, damage immunity for its length). Arrows are scripts/missile.js rows; numbers in pathfinder.yml.
import P from './lib/data/pathfinder.yml'
import { classOf, canAct, softTargets, launch, forward, drill } from './lib/kit.js'
const DUST = `fx
pop dust burst=6..9 on=disc(.4) life=.5..0.9 v=up(.4..0.9)+sdir()*(.4..0.9) size=.25..0.4 acc=buoy(.2)+drag(1.6) sz=$size*(.6>1.8) col=<.66,.58,.46> a=0>.35:.3>0 rot=spin(.2) r=sprite(smoke-puff,alpha)`
function me(ctx) { return (ctx.session.pathfinder ??= {})[ctx.self.id] ??= { ready: {} } }
export function onInput(ctx, input) {
  if (classOf(ctx) !== 'pathfinder' || !canAct(ctx)) return
  const p = input.pressed || {}
  if (p.attack) use(ctx, 'arrow', input)
  else if (p.castSlot2) use(ctx, 'volley', input)
  else if (p.castSlot3) use(ctx, 'roll', input)
}
function use(ctx, kind, input) {
  const a = P[kind], m = me(ctx), now = ctx.now(), self = ctx.self
  if (!a || now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000
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
