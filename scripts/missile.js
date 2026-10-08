// One flying bolt, shard or arrow from a class kit: homes on its soft target at a capped turn rate, casts ahead
// before every step so it never tunnels, and lands its hit through scripts/lib/kit.js applyHit. Looks: lib/missiles.js.
import { raycast } from 'builtin/physics'
import { rotationFromDirection } from 'builtin/vec3'
import { MISSILES, impactFx } from './lib/missiles.js'
import { applyHit, aimPoint, alive } from './lib/kit.js'
const D = Math.PI / 180
const norm = (v) => { const l = Math.hypot(v.x, v.y, v.z) || 1; return { x: v.x / l, y: v.y / l, z: v.z / l } }
function steer(a, b, maxRad) {
  const c = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)), ang = Math.acos(c)
  if (ang <= maxRad || ang < 1e-4) return b
  const t = maxRad / ang
  return norm({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t })
}
function mem(ctx) { const S = (ctx.session.missiles ??= {}); return (S[ctx.self.id] ??= { dir: { ...ctx.self.state.dir }, flown: 0 }) }
export function update(ctx, dt) {
  const self = ctx.self, s = self.state
  if (s.stuck) return
  const M = MISSILES[s.kind]
  if (!M) { ctx.destroy(self.id); return }
  const m = mem(ctx), p = self.feetPosition, step = s.speed * dt
  const t = s.targetId ? ctx.getObject(s.targetId) : null
  let dir = m.dir
  if (t && alive(t)) {
    const q = aimPoint(t), dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, d = Math.hypot(dx, dy, dz) || 1e-4
    const want = { x: dx / d, y: dy / d, z: dz / d }
    if (d <= step + 0.45) return finish(ctx, M, q, want, t, null)
    dir = d < 4 ? want : steer(dir, want, s.turn * D * dt)
  }
  const hit = raycast(ctx, p, dir, { distance: step + 0.1, ignoreEntities: [self.id, s.ownerId], excludeTags: ['projectile', 'player'], physicsOnly: true })
  if (hit) {
    const o = hit.id ? ctx.getObject(hit.id) : null
    ctx.log('missile.ray ' + JSON.stringify({ id: hit.id, tags: o && o.tags, p: hit.position }))
    return finish(ctx, M, hit.position, dir, o && (o.tags || []).includes('enemy') && alive(o) ? o : null, hit.normal)
  }
  m.dir = dir; m.flown += step
  if (m.flown > (s.range ?? 40)) { ctx.destroy(self.id); return }
  self.feetPosition = { x: p.x + dir.x * step, y: p.y + dir.y * step, z: p.z + dir.z * step }
  self.rotation = rotationFromDirection(dir)
}
function finish(ctx, M, at, dir, target, normal) {
  const self = ctx.self, s = self.state, n = normal || { x: -dir.x, y: -dir.y, z: -dir.z }
  ctx.log('missile.finish ' + JSON.stringify({ kind: s.kind, target: target ? target.id : null, at }))
  if (target) applyHit(ctx, s.ownerId, target, { damage: s.damage, kind: s.ability, slow: s.slow, slowFor: s.slowFor, at, normal: n, missile: M })
  else impactFx(ctx, M, 'earth', at, n)
  if (M.sticks && !(target && (target.tags || []).includes('wolf'))) {
    s.stuck = true; self.fx = null
    const back = (M.nose ?? 0.4) - 0.12
    self.feetPosition = { x: at.x - dir.x * back, y: at.y - dir.y * back, z: at.z - dir.z * back }
    self.rotation = rotationFromDirection(dir)
    ctx.after(M.sticks, 'vanish')
    return
  }
  ctx.destroy(self.id)
}
export function vanish(ctx) { ctx.destroy(ctx.self.id) }
