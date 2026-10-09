// Vanguard on the player's body: 1 strike, 2 heavy strike, 3 guard. The swing plays a clip from the creator's
// animation library on the "action" channel, and the hit is judged here, on the striker's machine, into the
// target's state (target.state.hp -= d). Anything tagged "enemy" with state.hp is struck.
import V from './lib/data/vanguard.yml'
import { rotate, sub, normalize, dot, length } from 'builtin/vec3'
import { drill, classOf, meleePlayer, strikePlayer, power, meleeFoley, haste } from './lib/kit.js'
import { isPlay } from './lib/places.js';

const WHOOSH = '/cdn/moodboard-painterly-fantasy/sfx-longsword-swing-fast-steel-whoosh-air-cut.mp3'
const HEAVY_WHOOSH = '/cdn/moodboard-painterly-fantasy/sfx-two-handed-greatsword-heavy-overhead-swing-deep-whoosh-warrior-grunt.mp3'
const THUD = '/cdn/moodboard-painterly-fantasy/sfx-sword-hit-wooden-dummy-thud.mp3'
const GUARD_SND = '/cdn/moodboard-painterly-fantasy/sfx-raise-wooden-iron-rimmed-shield-brace-thump-leather-straps.mp3'
const SPARKS = `fx
pop chips burst=10..16 life=.4..0.8 v=<%normal|0,1,0>*(2..4)+sdir()*(.6..1.4) size=.03..0.07 acc=grav()*.8+drag(1.2) col=<.62,.45,.28> a=1>.6:1>0 sz=$size floor=stick r=sprite(stalk,alpha,velocity,.02)
pop spark burst=6..9 life=.12..0.25 v=sdir()*(3..6) size=.02..0.04 col=hdr(4,3,1.6) a=1>0 r=sprite(ember,add,velocity,.03)
pop dust burst=3 life=.5..0.8 v=up(.4)+sdir()*.4 size=.15..0.25 acc=drag(1.5) col=<.7,.62,.5> a=0>.3:.3>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)`

function me(ctx) { return (ctx.session.vg ??= {})[ctx.self.id] ??= { ready: {} } }

export function onInput(ctx, input) {
  if (classOf(ctx) !== 'vanguard') return
  if (!isPlay(ctx.self.place) || ctx.self.state.phase === 'creating') return
  const p = input.pressed || {}
  if (p.attack) act(ctx, 'strike')
  else if (p.castSlot2) act(ctx, 'heavy')
  else if (p.castSlot3) act(ctx, 'guard')
  else if (p.castSlot4) act(ctx, 'split')
}

function act(ctx, kind) {
  const m = me(ctx), now = ctx.now(), a = V[kind]
  if (now < (m.ready[kind] ?? 0) || now < (m.busyUntil ?? 0)) return
  m.ready[kind] = now + a.cooldown * 1000 * haste(ctx)
  m.busyUntil = now + (kind === 'guard' ? 400 : kind === 'split' ? 1300 : a.cooldown * 700)
  ctx.self.anim.action = { clip: a.clip, weight: 1, loop: 'once', speed: a.speed, blendIn: 0.08 }
  ctx.self.state.cd = { ...(ctx.self.state.cd || {}), [kind]: m.ready[kind] }
  if (m.clearId) ctx.cancel(m.clearId)
  m.clearId = ctx.after(a.length, 'endAction')
  if (kind === 'guard') {
    ctx.self.state.guardUntil = now + a.length * 1000
    ctx.self.state.guardReduce = a.reduce
    drill(ctx, 'shield-drill')
    ctx.emit('playSound', { clip: GUARD_SND, position: ctx.self.feetPosition, volume: 0.5 }, { audience: { nearby: ctx.self.feetPosition, radius: 25 } })
    return
  }
  if (kind === 'split') { ctx.emit('playSound', { clip: HEAVY_WHOOSH, position: ctx.self.feetPosition, volume: 0.55, pitch: 0.85 }, { audience: { nearby: ctx.self.feetPosition, radius: 25 } }); ctx.after(a.hitAt, 'splitLand'); return }
  ctx.emit('playSound', { clip: kind === 'heavy' ? HEAVY_WHOOSH : WHOOSH, position: ctx.self.feetPosition, volume: kind === 'heavy' ? 0.5 : 0.38, pitch: 0.94 + ctx.random() * 0.12 }, { audience: { nearby: ctx.self.feetPosition, radius: 25 } })
  ctx.after(a.hitAt / 1, 'land', { kind })
}

export function endAction(ctx) { ctx.self.anim.action = null }

export function land(ctx, { kind }) {
  const a = V[kind], self = ctx.self
  const fwd = rotate(self.rotation, { x: 0, y: 0, z: -1 })
  const cosArc = Math.cos(V.arc * Math.PI / 180)
  const hits = [], most = kind === 'heavy' ? (V.cleave ?? 4) : 1
  for (const t of ctx.query({ tags: ['enemy'], radius: a.reach + 1 })) {
    if (!t.state || (t.state.hp ?? 0) <= 0 || t.state.dead) continue
    const d = sub(t.feetPosition, self.feetPosition); d.y = 0
    const dist = length(d)
    if (dist > a.reach + (t.state.radius ?? 0.4)) continue
    if (dist > 0.3 && dot(normalize(d), { x: fwd.x, y: 0, z: fwd.z }) < cosArc) continue
    hits.push(t); if (hits.length >= most) break
  }
  const hit = hits[0] ?? null
  if (!hit) {
    const pt = meleePlayer(ctx, a.reach, cosArc)
    if (!pt) return
    const dmg = strikePlayer(ctx, pt, Math.round(a.damage * power(ctx)), kind), pos = { x: pt.feetPosition.x, y: pt.feetPosition.y + 1.2, z: pt.feetPosition.z }
    const n = normalize({ x: pt.feetPosition.x - self.feetPosition.x, y: 0.4, z: pt.feetPosition.z - self.feetPosition.z }), near = { nearby: pos, radius: 40 }
    ctx.emit('damageNumber', { position: pos, value: dmg, crit: kind === 'heavy', color: '#ff6a55' }, { audience: near })
    ctx.emit('fx', { position: pos, script: SPARKS, params: { normal: n } }, { audience: near })
    meleeFoley(ctx, { tags: [], state: { material: 'flesh' } }, pos, kind === 'heavy', near)
    ctx.emit('hitstop', { duration: 0.05 }, { audience: { player: self.id } })
    ctx.emit('cameraPunch', { direction: n, intensity: 0.25 }, { audience: { player: self.id } })
    return
  }
  for (let i = 0; i < hits.length; i++) strikeOne(ctx, hits[i], kind, a, i === 0)
}
function strikeOne(ctx, hit, kind, a, first) {
  const self = ctx.self
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
  ctx.emit('damageNumber', { position: pos, value: dealt, crit: kind === 'heavy' }, { audience: near })
  ctx.emit('fx', { position: pos, script: SPARKS, params: { normal: n } }, { audience: near })
  if (first) meleeFoley(ctx, hit, pos, kind === 'heavy', near)
  ctx.emit('squash', { target: hit.id, axis: 'y', intensity: kind === 'heavy' ? 0.25 : 0.12, duration: 0.18 }, { audience: near })
  if (!first) return
  ctx.emit('hitstop', { duration: kind === 'heavy' ? 0.09 : 0.05 }, { audience: { player: self.id } })
  ctx.emit('cameraPunch', { direction: n, intensity: kind === 'heavy' ? 0.5 : 0.2 }, { audience: { player: self.id } })
}


// Earthsplitter: the slam, then a fissure that tears forward in five steps, every foe on the line struck once
const SLAM = `fx
pop flash burst=1 at=point().c(.1) life=.3 size=1 col=hdr(4,2,.6) a=.9>0 sz=3.2*(.3>1) r=sprite(soft-disc,add,axis,0,.8,axis=<0,1,0>)
pop rocks burst=14..20 on=disc(.6) life=.8..1.3 v=up(4..7)+sdir()*(2..4) size=.08..0.18 acc=grav()*1.4+drag(.3) col=<.3,.24,.19> a=1 floor=bounce(.25) r=mesh(box,1,.7,.8)
pop dust burst=14..20 on=disc(1) life=1..1.8 v=up(.5..1.2)+sdir()*(1.5..3) size=.5..0.9 acc=buoy(.2)+drag(1.8) sz=$size*(.6>2.2) col=<.55,.48,.38> a=0>.4:.3>0 rot=spin(.15) r=sprite(smoke-puff,alpha)
pop light burst=1 life=.5 gl=1>0 r=light(<1,.6,.25>,$gl*12,8)`
const CRACK = `fx
pop glow burst=1 at=point().c(.04) life=2.2 size=1.6 col=hdr(3,1.2,.25) a=.9>.5:.6>0 sz=$size*(.5>1:.15>1) r=sprite(soft-disc,add,axis,0,0,axis=<0,1,0>)
pop shards burst=8..12 on=disc(.7) life=.6..1 v=up(3..5.5)+sdir()*(1..2) size=.08..0.2 acc=grav()*1.5+drag(.4) col=<.28,.22,.17> a=1 floor=bounce(.2) r=mesh(box,1,1.4,.6)
pop lava burst=10..16 on=disc(.5) life=.4..0.8 v=up(2..4)+sdir()*.8 size=.03..0.06 acc=grav()*.9+drag(.5) col=hdr(5,2.2,.4)>hdr(1.4,.3,.04) a=1>0 floor=die r=sprite(ember,add,velocity,.03)
pop dust burst=6..9 on=disc(.8) life=.8..1.4 v=up(.6..1.4)+sdir()*.8 size=.4..0.7 acc=buoy(.2)+drag(1.8) sz=$size*(.6>2) col=<.52,.45,.36> a=0>.38:.3>0 rot=spin(.15) r=sprite(smoke-puff,alpha)`
export function splitLand(ctx) {
  if (classOf(ctx) !== 'vanguard') return
  const a = V.split, self = ctx.self, p = self.feetPosition
  const f = rotate(self.rotation, { x: 0, y: 0, z: -1 }), l = Math.hypot(f.x, f.z) || 1, dir = { x: f.x / l, z: f.z / l }
  const aud = { audience: { nearby: p, radius: 60 } }
  ctx.emit('fx', { position: { x: p.x + dir.x * 1.2, y: p.y, z: p.z + dir.z * 1.2 }, script: SLAM }, aud)
  ctx.emit('playSound', { clip: a.crack, position: p, volume: 0.8, maxDistance: 45 }, aud)
  ctx.emit('shockwave', { position: { x: p.x + dir.x * 1.2, y: p.y + 0.3, z: p.z + dir.z * 1.2 }, speed: 12, thickness: 0.8, intensity: 0.35 }, aud)
  ctx.emit('screenShake', { intensity: 0.3, duration: 0.3 }, { audience: { player: self.id } })
  ctx.emit('hitstop', { duration: 0.06 }, { audience: { player: self.id } })
  me(ctx).splitStruck = {}
  for (let i = 0; i < 5; i++) ctx.after(i * 0.07, 'splitStep', { o: { x: p.x, y: p.y, z: p.z }, dir, i })
}
export function splitStep(ctx, { o, dir, i }) {
  const a = V.split, self = ctx.self, step = a.reach / 5, d = 1.2 + step * (i + 0.5)
  const x = o.x + dir.x * d, z = o.z + dir.z * d, y = ctx.place.terrain?.heightAt?.(x, z) ?? o.y, at = { x, y, z }
  const aud = { audience: { nearby: at, radius: 60 } }
  ctx.emit('fx', { position: at, script: CRACK }, aud)
  const struck = me(ctx).splitStruck ??= {}, dmg = Math.round(a.damage * power(ctx)), now = ctx.now()
  for (const r of ctx.query({ tags: ['enemy'], center: at, radius: a.width / 2 + step / 2 + 0.4 })) {
    if (struck[r.id] || !r.state || (r.state.hp ?? 0) <= 0 || r.state.dead) continue
    const t = ctx.getObject(r.id); if (!t) continue
    struck[r.id] = 1
    t.state.hp -= dmg; t.state.lastHitBy = self.id; t.state.lastHitAt = now; t.state.lastHitKind = 'heavy'
    t.state.slowUntil = now + a.slowFor * 1000; t.state.slowMult = 1 - a.slow
    const pos = { x: r.feetPosition.x, y: r.feetPosition.y + 1.2, z: r.feetPosition.z }, near = { nearby: pos, radius: 40 }
    ctx.emit('damageNumber', { position: pos, value: dmg, crit: true }, { audience: near })
    ctx.emit('squash', { target: r.id, axis: 'y', intensity: 0.3, duration: 0.2 }, { audience: near })
    ctx.emit('impulse', { target: r.id, impulse: { x: dir.x * 6, y: 5, z: dir.z * 6 } }, { audience: near })
    meleeFoley(ctx, t, pos, true, near)
  }
  if (i === 4) me(ctx).splitStruck = null
}
