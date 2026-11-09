// On every player's body: the Lantern Stag (buyable "lantern-stag") and the Runed Cloak (buyable "runed-cloak").
// Z calls or dismisses the stag in the open March: the stag is its own character body, the hero rides it
// seated (parented, so humanoid-locomotion.js holds the seat pose), and the keys' intent from player.js
// (ctx.session.walk) drives the stag at RIDE.speed times the walk. The cloak dresses an owner on every join.
// What an account bought is player.state.purchases: the platform's record, never written here.
import { raycast } from 'builtin/physics'
import RIDE from './lib/data/mount.yml'

const MNS = 'mmorpg-tools:'
const hit = (input, n) => !!(input.pressed?.[n] || input.actions?.[n])
const owns = (ctx, id) => !!ctx.self.state.purchases?.[id]
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating'
const busy = (st) => st.flying || st.showQuestDialog || st.vendorOpen || st.flightMap || st.dead || (st.hp != null && st.hp <= 0)

function say(ctx, text) {
  ctx.emit('damageNumber', { position: { ...ctx.self.feetPosition, y: ctx.self.feetPosition.y + 2.3 }, text, color: '#f2b04a', size: 0.8, lifetime: 1.6 }, { audience: { player: ctx.self.id } })
}

function callStag(ctx) {
  const p = ctx.self.feetPosition
  const yaw = ctx.self.yaw ?? 0
  const id = ctx.spawn({
    tags: ['mount', 'lantern-stag'], scope: 'session', audience: 'near',
    feetPosition: { x: p.x, y: p.y + 0.05, z: p.z }, rotation: { yaw },
    model: RIDE.model, layout: { box: RIDE.box },
    physics: { body: 'character', collider: 'capsule' },
    fx: { script: RIDE.aura },
    children: [{ feetPosition: RIDE.lanternAt, light: { kind: 'point', color: 'oklch(0.85 0.13 70)', intensity: 2.2, distance: 9 } }],
    state: { rider: ctx.self.id },
  })
  ctx.self.state.mounted = id
  ctx.self.velocity = { x: 0, y: 0, z: 0 }
  ctx.self.parent = id
  ctx.self.feetPosition = RIDE.seat
  ctx.emit('fx', { position: p, script: RIDE.burst }, { audience: { nearby: p, radius: 40 } })
  ctx.emit('playSound', { clip: RIDE.callSound, position: p, volume: 0.6, maxDistance: 30 })
}

function dismiss(ctx) {
  const st = ctx.self.state, stag = st.mounted && ctx.getObject(st.mounted)
  const at = stag ? stag.feetPosition : ctx.self.feetPosition
  if (ctx.self.parent) ctx.self.parent = null
  ctx.self.feetPosition = { x: at.x + 0.9, y: at.y + 0.3, z: at.z }
  ctx.self.velocity = { x: 0, y: 0, z: 0 }
  if (stag) { ctx.emit('fx', { position: at, script: RIDE.burst }, { audience: { nearby: at, radius: 40 } }); ctx.destroy(stag.id) }
  ctx.emit('playSound', { clip: RIDE.dismissSound, position: at, volume: 0.5, maxDistance: 25 })
  st.mounted = null
}

function dressCloak(ctx) {
  const want = owns(ctx, 'runed-cloak') && !ctx.self.state.hideCloak
  const s = ctx.self.session
  const have = s.cloak && ctx.getObject(s.cloak)
  if (want && !have) {
    s.cloak = ctx.spawn({ parent: ctx.self.id, tags: ['cloak'], scope: 'session', model: RIDE.cloak.model, layout: { box: RIDE.cloak.box }, feetPosition: RIDE.cloak.at, physics: 'none' })
  } else if (!want && have) { ctx.destroy(s.cloak); s.cloak = null }
}

export function onSpawn(ctx) { ctx.self.state.mounted = null; dressCloak(ctx) }

export function onInput(ctx, input) {
  if (!hit(input, 'mountToggle')) return
  const st = ctx.self.state
  if (st.mounted) { dismiss(ctx); return }
  if (!playing(ctx)) return
  if (!owns(ctx, 'lantern-stag')) { say(ctx, 'The Lantern Stall in the Reach sells the Lantern Stag'); return }
  if (busy(st) || ctx.self.parent) return
  callStag(ctx)
}

export const updateSchedule = { every: 1 }
export function update(ctx, dt) {
  const st = ctx.self.state
  const s = ctx.self.session
  // the cloak follows the record, checked twice a second, never per frame
  if (!st.mounted) { dressCloak(ctx); ctx.sleep(0.5); return }
  const stag = ctx.getObject(st.mounted)
  if (!stag || !playing(ctx) || busy(st) || ctx.self.parent?.id !== st.mounted) { dismiss(ctx); return }
  const intent = ctx.session.walk?.[ctx.self.id]?.moveIntent ?? { x: 0, z: 0 }
  const v = stag.velocity
  const tx = intent.x * RIDE.speed, tz = intent.z * RIDE.speed
  const step = RIDE.accel * dt
  const dx = tx - v.x, dz = tz - v.z, gap = Math.hypot(dx, dz), k = gap > step ? step / gap : 1
  const vx = v.x + dx * k, vz = v.z + dz * k
  stag.velocity = { x: vx, y: v.y + ctx.place.gravity.y * dt, z: vz }
  const spd = Math.hypot(vx, vz)
  if (spd > 0.4) {
    const want = Math.atan2(-vx, -vz) * 180 / Math.PI
    const cur = s.stagYaw ?? want
    let d = ((want - cur + 540) % 360) - 180
    s.stagYaw = cur + Math.max(-RIDE.turn * dt, Math.min(RIDE.turn * dt, d))
    stag.rotation = { yaw: s.stagYaw }
  }
  // hooves: a clop per stride, quicker at the gallop
  if (spd > 1 && stag.grounded !== false) {
    s.hoofT = (s.hoofT ?? 0) - dt
    if (s.hoofT <= 0) {
      s.hoofT = Math.max(0.16, 2.2 / spd)
      s.hoofI = ((s.hoofI ?? 0) + 1) % RIDE.hooves.length
      ctx.emit('playSound', { clip: RIDE.hooves[s.hoofI], position: stag.feetPosition, volume: 0.22, pitch: 0.9 + ctx.random() * 0.2, maxDistance: 22 }, { audience: { nearby: stag.feetPosition, radius: 22 } })
    }
  }
}
