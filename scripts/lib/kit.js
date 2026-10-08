// Shared by the class kits (vanguard.js, arcanist.js, pathfinder.js) and scripts/missile.js:
// which class a body plays, soft targeting, launching a missile and landing a hit into target.state.hp.
import { rotate, rotationFromDirection } from 'builtin/vec3'
import LV from './data/levels.yml'
// a hero's hits grow with their level, as their health does: every class reads this one number
export function power(ctx) { return (1 + (LV.damagePerLevel ?? 0.08) * Math.max(0, (ctx.self.state?.level ?? 1) - 1)) * (1 + gearPower(ctx.self.state) / 100) }
// worn gear's power stat (scripts/lib/data/gear.yml): % more damage, summed over every equipped piece
export function gearPower(s) { let n = 0; for (const it of Object.values(s?.equipment || {})) n += Number(it?.stats?.power) || 0; return n }
import { MISSILES, impactFx } from './missiles.js'
import { pvpTargets, isPlayer, strikePlayer, canPvp } from './pvp.js'

// state.className is the character's class name ("Arcanist"); a hero saved before classes counts as a Vanguard.
export function classOf(ctx) { return String(ctx.self.state.className || 'vanguard').toLowerCase() }
export function canAct(ctx) { const s = ctx.self.state; return isPlay(ctx.self.place) && s.phase !== 'creating' && !s.dying && (s.health ?? 1) > 0 }
export function forward(self) { const f = rotate(self.rotation, { x: 0, y: 0, z: -1 }); const l = Math.hypot(f.x, f.z) || 1; return { x: f.x / l, y: 0, z: f.z / l } }
export function alive(t) { if (!t || !t.state) return false; if (isPlayer(t)) return (t.state.health ?? 1) > 0 && !t.state.dying && !t.state.pvpDead; return (t.state.hp ?? 0) > 0 && !t.state.dead && !t.state.down }
export function aimPoint(t) {
  const b = t.bounds
  if (b && b.center) return { x: b.center.x, y: Math.min(b.center.y, b.min.y + 1.3), z: b.center.z }
  return { x: t.feetPosition.x, y: t.feetPosition.y + 0.8, z: t.feetPosition.z }
}
// live enemies within range, those in front first (closest-to-centre weighted); nothing in front: the nearest within half range.
export function softTargets(ctx, range, arcDeg, n = 1) {
  const self = ctx.self, f = forward(self), cosArc = Math.cos(arcDeg * Math.PI / 180), p = self.feetPosition
  const front = [], near = []
  for (const r of ctx.query({ tags: ['enemy'], radius: range })) {
    if (!r.state || (r.state.hp ?? 0) <= 0 || r.state.dead || r.state.down) continue
    const dx = r.feetPosition.x - p.x, dz = r.feetPosition.z - p.z, d = Math.hypot(dx, dz) || 0.01
    const c = (dx * f.x + dz * f.z) / d
    if (c >= cosArc) front.push({ id: r.id, score: d * (1.6 - c) }); else if (d < range / 2) near.push({ id: r.id, score: d })
  }
  if (!front.length) for (const r of pvpTargets(ctx, range)) { // PvP realms: a hostile hero, only when no monster stands in front
    const dx = r.feetPosition.x - p.x, dz = r.feetPosition.z - p.z, d = Math.hypot(dx, dz) || 0.01, c = (dx * f.x + dz * f.z) / d
    if (c >= cosArc) front.push({ id: r.id, score: d * (1.6 - c) })
  }
  front.sort((a, b) => a.score - b.score); near.sort((a, b) => a.score - b.score)
  return (front.length ? front : near).slice(0, n).map((r) => r.id)
}
// a missile leaves the caster's hand at chest height; yawOff fans it (degrees, + is left)
export function launch(ctx, a, targetId, yawOff = 0) {
  const self = ctx.self, M = MISSILES[a.missile], p = self.feetPosition, f = forward(self)
  const origin = { x: p.x + f.x * 0.7, y: p.y + 1.4, z: p.z + f.z * 0.7 }
  const t = targetId ? ctx.getObject(targetId) : null
  let dir = f
  if (t && alive(t)) { const q = aimPoint(t), dx = q.x - origin.x, dy = q.y - origin.y, dz = q.z - origin.z, l = Math.hypot(dx, dy, dz) || 1; dir = { x: dx / l, y: dy / l, z: dz / l } }
  if (yawOff) { const r = yawOff * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); dir = { x: dir.x * c + dir.z * s, y: dir.y, z: -dir.x * s + dir.z * c } }
  if (M.cast) ctx.emit('fx', { position: origin, script: M.cast }, { audience: { nearby: origin, radius: 60 } })
  return ctx.spawn({
    tags: ['projectile'], lifetime: 5, castShadow: false, feetPosition: origin, rotation: rotationFromDirection(dir),
    ...(M.primitive ? { primitive: M.primitive } : {}), fx: { script: M.trail }, behavior: 'scripts/missile.js',
    state: { kind: a.missile, ability: a.kind, ownerId: self.id, targetId: t && alive(t) ? t.id : null, dir, speed: a.speed, turn: a.turn, damage: Math.round(a.damage * power(ctx)), slow: a.slow ?? 0, slowFor: a.slowFor ?? 0, range: a.range + 8 },
  })
}
export function materialOf(t) { return t.state?.material || ((t.tags || []).includes('wolf') ? 'fur' : 'wood') }
// the hit, judged on the shooter's machine: hp, the hit marks the dummy and wolves read, a slow, and the payoff
export function applyHit(ctx, ownerId, t, h) {
  const now = ctx.now(), s = t.state
  if (isPlayer(t)) return hitPlayer(ctx, ownerId, t, h)
  s.hp -= h.damage
  s.lastHitBy = ownerId; s.lastHitAt = now; s.lastHitKind = h.kind
  const near = { nearby: h.at, radius: 50 }
  if (h.slow > 0) { s.slowUntil = now + h.slowFor * 1000; s.slowMult = 1 - h.slow; ctx.emit('highlightSet', { target: t.id, color: '#8fd0ff', style: 'glow', duration: h.slowFor }, { audience: near }) }
  ctx.emit('damageNumber', { position: { x: h.at.x, y: h.at.y + 0.4, z: h.at.z }, value: h.damage, color: h.slow > 0 ? '#9fdcff' : h.kind === 'firebolt' ? '#ffb347' : undefined }, { audience: near })
  ctx.emit('squash', { target: t.id, axis: 'y', intensity: 0.12, duration: 0.18 }, { audience: near })
  if (h.missile) impactFx(ctx, h.missile, materialOf(t), h.at, h.normal)
  if (ownerId) ctx.emit('hitstop', { duration: 0.03 }, { audience: { player: ownerId } })
}

// A class drill: a guard or ward raised beside a thing tagged `tag` while its quest (state.quest) is active counts one (state.tallyKey).
// The Shield Table's pells and trial stones, the Observatory's forge and plinths.
export function drill(ctx, tag) {
  const st = ctx.self.state, now = ctx.now(), aqs = st.activeQuests || []
  for (const r of ctx.query({ tags: [tag], radius: 3.5 })) {
    const d = r.state || {}; if (!aqs.some((q) => q && q.questId === d.quest)) continue
    if (now < (ctx.session.drillCd || 0)) return
    ctx.session.drillCd = now + 1500
    st.tally = { ...(st.tally || {}), [d.tallyKey]: ((st.tally || {})[d.tallyKey] || 0) + 1 }; st._questSave = true
    const at = { x: r.feetPosition.x, y: r.feetPosition.y + 1.6, z: r.feetPosition.z }
    ctx.emit('damageNumber', { position: at, text: d.blockText || 'Blocked!', color: 'oklch(0.86 0.12 85)', size: 1.1, lifetime: 1.2 }, { audience: { player: ctx.self.id } })
    ctx.emit('shake', { target: r.id, intensity: 0.25, duration: 0.25 }, { audience: { nearby: r.feetPosition, radius: 30 } })
    ctx.emit('playSound', { clip: d.sound || '/cdn/moodboard-painterly-fantasy/sfx-wooden-shield-block-thud.mp3', position: at, volume: 0.6 }, { audience: { nearby: r.feetPosition, radius: 25 } })
    return
  }
}

// a missile reaching a hero on a PvP realm (the missile runs on the shooter's machine: ctx.self is the missile)
function hitPlayer(ctx, ownerId, t, h) {
  const owner = ownerId ? ctx.getObject(ownerId) : null
  if (!owner) return
  const dmg = Math.max(1, Math.round(h.damage * (PVP_MULT())))
  t.state.health = (t.state.health ?? t.state.maxHealth ?? 1000) - dmg
  t.state.lastPvpBy = ownerId; t.state.lastPvpName = owner.state.charName || 'a hero'; t.state.lastPvpAt = ctx.now(); t.state.lastPvpKind = h.kind
  if (h.slow > 0) { t.state.slowUntil = ctx.now() + h.slowFor * 1000; t.state.slowMult = 1 - h.slow }
  const near = { nearby: h.at, radius: 50 }
  ctx.emit('damageNumber', { position: { x: h.at.x, y: h.at.y + 0.4, z: h.at.z }, value: dmg, color: '#ff6a55' }, { audience: near })
  ctx.emit('squash', { target: t.id, axis: 'y', intensity: 0.1, duration: 0.18 }, { audience: near })
  if (h.missile) impactFx(ctx, h.missile, 'fur', h.at, h.normal)
  ctx.emit('hitstop', { duration: 0.03 }, { audience: { player: ownerId } })
}
import PV from './data/pvp.yml'
import { isPlay } from './places.js';
function PVP_MULT() { return PV.damageMult || 1 }
// melee on a PvP realm (vanguard, shade): the nearest hostile hero inside reach and arc
export function meleePlayer(ctx, reach, cosArc) {
  const self = ctx.self, f = forward(self)
  for (const o of pvpTargets(ctx, reach + 0.6)) {
    const dx = o.feetPosition.x - self.feetPosition.x, dz = o.feetPosition.z - self.feetPosition.z, d = Math.hypot(dx, dz)
    if (d > 0.3 && (dx * f.x + dz * f.z) / d < cosArc) continue
    return ctx.getObject(o.id)
  }
  return null
}
export { strikePlayer, canPvp, isPlayer }
