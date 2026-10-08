// Vanguard on the player's body: 1 strike, 2 heavy strike, 3 guard. The swing plays a clip from the creator's
// animation library on the "action" channel, and the hit is judged here, on the striker's machine, into the
// target's state (target.state.hp -= d). Anything tagged "enemy" with state.hp is struck.
import V from './lib/data/vanguard.yml'
import { rotate, sub, normalize, dot, length } from 'builtin/vec3'
import { drill, classOf, meleePlayer, strikePlayer, power } from './lib/kit.js'

const WHOOSH = '/cdn/knife-slice-sharp-blade-swing-eqoai55c.mp3'
const THUD = '/cdn/moodboard-painterly-fantasy/sfx-sword-hit-wooden-dummy-thud.mp3'
const GUARD_SND = '/cdn/sfx-metal-latch-mechanical-click-l16pxrf7.mp3'
const SPARKS = `fx
pop chips burst=10..16 life=.4..0.8 v=<%normal|0,1,0>*(2..4)+sdir()*(.6..1.4) size=.03..0.07 acc=grav()*.8+drag(1.2) col=<.62,.45,.28> a=1>.6:1>0 sz=$size floor=stick r=sprite(stalk,alpha,velocity,.02)
pop spark burst=6..9 life=.12..0.25 v=sdir()*(3..6) size=.02..0.04 col=hdr(4,3,1.6) a=1>0 r=sprite(ember,add,velocity,.03)
pop dust burst=3 life=.5..0.8 v=up(.4)+sdir()*.4 size=.15..0.25 acc=drag(1.5) col=<.7,.62,.5> a=0>.3:.3>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)`

function me(ctx) { return (ctx.session.vg ??= {})[ctx.self.id] ??= { ready: {} } }

export function onInput(ctx, input) {
  if (classOf(ctx) !== 'vanguard') return
  if ((ctx.self.place !== 'main' && ctx.self.place !== 'hollowcrypt') || ctx.self.state.phase === 'creating') return
  const p = input.pressed || {}
  if (p.attack) act(ctx, 'strike')
  else if (p.castSlot2) act(ctx, 'heavy')
  else if (p.castSlot3) act(ctx, 'guard')
}

function act(ctx, kind) {
  const m = me(ctx), now = ctx.now(), a = V[kind]
  if (now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000
  m.busyUntil = now + (kind === 'guard' ? 400 : a.cooldown * 700)
  ctx.self.anim.action = { clip: a.clip, weight: 1, loop: 'once', speed: a.speed, blendIn: 0.08 }
  ctx.self.state.cd = { ...(ctx.self.state.cd || {}), [kind]: m.ready[kind] }
  if (m.clearId) ctx.cancel(m.clearId)
  m.clearId = ctx.after(a.length, 'endAction')
  if (kind === 'guard') {
    ctx.self.state.guardUntil = now + a.length * 1000
    ctx.self.state.guardReduce = a.reduce
    drill(ctx, 'shield-drill')
    ctx.emit('playSound', { clip: GUARD_SND, position: ctx.self.feetPosition, volume: 0.4 }, { audience: { nearby: ctx.self.feetPosition, radius: 25 } })
    return
  }
  ctx.emit('playSound', { clip: WHOOSH, position: ctx.self.feetPosition, volume: 0.35, pitch: kind === 'heavy' ? 0.8 : 1.05 }, { audience: { nearby: ctx.self.feetPosition, radius: 25 } })
  ctx.after(a.hitAt / 1, 'land', { kind })
}

export function endAction(ctx) { ctx.self.anim.action = null }

export function land(ctx, { kind }) {
  const a = V[kind], self = ctx.self
  const fwd = rotate(self.rotation, { x: 0, y: 0, z: -1 })
  const cosArc = Math.cos(V.arc * Math.PI / 180)
  let hit = null
  for (const t of ctx.query({ tags: ['enemy'], radius: a.reach + 1 })) {
    if (!t.state || (t.state.hp ?? 0) <= 0) continue
    const d = sub(t.feetPosition, self.feetPosition); d.y = 0
    const dist = length(d)
    if (dist > a.reach + (t.state.radius ?? 0.4)) continue
    if (dist > 0.3 && dot(normalize(d), { x: fwd.x, y: 0, z: fwd.z }) < cosArc) continue
    hit = t; break
  }
  if (!hit) {
    const pt = meleePlayer(ctx, a.reach, cosArc)
    if (!pt) return
    const dmg = strikePlayer(ctx, pt, Math.round(a.damage * power(ctx)), kind), pos = { x: pt.feetPosition.x, y: pt.feetPosition.y + 1.2, z: pt.feetPosition.z }
    const n = normalize({ x: pt.feetPosition.x - self.feetPosition.x, y: 0.4, z: pt.feetPosition.z - self.feetPosition.z }), near = { nearby: pos, radius: 40 }
    ctx.emit('damageNumber', { position: pos, value: dmg, crit: kind === 'heavy', color: '#ff6a55' }, { audience: near })
    ctx.emit('fx', { position: pos, script: SPARKS, params: { normal: n } }, { audience: near })
    ctx.emit('playSound', { clip: THUD, position: pos, volume: 0.6 }, { audience: near })
    ctx.emit('hitstop', { duration: 0.05 }, { audience: { player: self.id } })
    ctx.emit('cameraPunch', { direction: n, intensity: 0.25 }, { audience: { player: self.id } })
    return
  }
  const target = ctx.getObject(hit.id)
  if (!target) return
  const dealt = Math.round(a.damage * power(ctx))
  target.state.hp -= dealt
  target.state.lastHitBy = self.id
  target.state.lastHitAt = ctx.now()
  target.state.lastHitKind = kind
  const pos = { x: hit.feetPosition.x, y: hit.feetPosition.y + 1.2, z: hit.feetPosition.z }
  const n = normalize({ x: hit.feetPosition.x - self.feetPosition.x, y: 0.4, z: hit.feetPosition.z - self.feetPosition.z })
  const near = { nearby: pos, radius: 40 }
  ctx.emit('damageNumber', { position: pos, value: a.damage, crit: kind === 'heavy' }, { audience: near })
  ctx.emit('fx', { position: pos, script: SPARKS, params: { normal: n } }, { audience: near })
  ctx.emit('playSound', { clip: THUD, position: pos, volume: kind === 'heavy' ? 0.7 : 0.5, pitch: kind === 'heavy' ? 0.8 : 1 }, { audience: near })
  ctx.emit('squash', { target: hit.id, axis: 'y', intensity: kind === 'heavy' ? 0.25 : 0.12, duration: 0.18 }, { audience: near })
  ctx.emit('hitstop', { duration: kind === 'heavy' ? 0.09 : 0.05 }, { audience: { player: self.id } })
  ctx.emit('cameraPunch', { direction: n, intensity: kind === 'heavy' ? 0.5 : 0.2 }, { audience: { player: self.id } })
}

