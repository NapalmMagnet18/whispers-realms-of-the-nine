// Open-world PvP on PvP realms (scripts/lib/data/pvp.yml). The striker judges the hit on its own machine and writes
// the victim's state.health (vitality.js reads it); the victim's vitality.js credits the kill and raises them in a sanctuary.
import P from './data/pvp.yml'
import F from './data/flights.yml'
const ROOMS = new Set(P.rooms || [])
const SAFE = [...(P.sanctuaries || []), ...(F.roosts || []).map((r) => ({ name: r.name, x: r.x, z: r.z, r: P.roostRadius || 35 }))]
export function pvpRealm(ctx) { try { return ROOMS.has(ctx.getRoomId ? ctx.getRoomId() : '') } catch (e) { return false } }
export function sanctuaryAt(x, z) { for (const s of SAFE) if (Math.hypot(x - s.x, z - s.z) < s.r) return s; return null }
// the rise point after a PvP fall: the nearest gryphon roost pad (open ground, y known)
export function nearestRoost(x, z) { let b = null, bd = Infinity; for (const r of F.roosts || []) { const d = Math.hypot(x - r.x, z - r.z); if (d < bd) { bd = d; b = r } } return b }
export function nearestSanctuary(x, z) { let b = SAFE[0], bd = Infinity; for (const s of SAFE) { const d = Math.hypot(x - s.x, z - s.z); if (d < bd) { bd = d; b = s } } return b }
// can this player (a state + position) take part in a fight right now?
export function inFight(ctx, p) {
  const s = p.state || {}, fp = p.feetPosition
  if (!s.characterCreated || s.phase !== 'playing' || s.dying || s.pvpDead || (s.health ?? 1) <= 0) return false
  if ((s.level || 1) < (P.minLevel || 1)) return false
  if ((s.pvpShieldUntil || 0) > ctx.now()) return false
  if (p.place === 'banner-vale' || ctx.self?.place === 'banner-vale') return !!fp && !!s.bgTeam
  return !!fp && !sanctuaryAt(fp.x, fp.z)
}
// may the body running this script strike players now?
export function canPvp(ctx) { if (ctx.self.place === 'banner-vale') return inFight(ctx, ctx.self); return ctx.self.place === 'main' && pvpRealm(ctx) && inFight(ctx, ctx.self) }
// hostile players within range: rows of ctx.place.players
export function pvpTargets(ctx, range) {
  if (!canPvp(ctx)) return []
  const me = ctx.self, p = me.feetPosition, now = ctx.now(), out = []
  for (const o of ctx.place.players) {
    if (o.id === me.id || !inFight(ctx, o) || (o.state.veiledUntil || 0) > now) continue
    if (me.place === 'banner-vale' && o.state.bgTeam === me.state.bgTeam) continue // no friendly fire in the vale
    const d = Math.hypot(o.feetPosition.x - p.x, o.feetPosition.z - p.z)
    if (d <= range && Math.abs(o.feetPosition.y - p.y) < 6) out.push(o)
  }
  return out
}
export function isPlayer(t) { return !!t && ((t.tags || []).includes('player') || (t.state && t.state.charName !== undefined && t.state.hp === undefined && t.state.health !== undefined)) }
// a hit on a player: health, the credit marks, and the striker's feedback. Returns the damage dealt.
export function strikePlayer(ctx, t, damage, kind) {
  const dmg = Math.max(1, Math.round(damage * (P.damageMult || 1)))
  t.state.health = (t.state.health ?? t.state.maxHealth ?? 1000) - dmg
  t.state.lastPvpBy = ctx.self.id; t.state.lastPvpName = ctx.self.state.charName || 'a hero'; t.state.lastPvpAt = ctx.now(); t.state.lastPvpKind = kind
  ctx.self.state.pvpCombatUntil = ctx.now() + 10000
  return dmg
}
export const PVP = P
