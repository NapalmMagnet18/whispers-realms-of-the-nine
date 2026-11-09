import { MOVE, SWIM } from './lib/config.js'
import { wowMotion } from './lib/motion.js'
import { raycast } from 'builtin/physics'
// World of Warcraft body movement, the drop-in controller: put "mods/wow-camera-controls/move.js" in the
// player template's behavior list in place of the world's own movement script (never beside it: two
// scripts writing one body's velocity fight).
//   W/S forward/back along her front · A/D turn in place (the camera swings behind) · Q/E strafe (she leans into it)
//   left mouse held: the camera orbits, she does not turn · right mouse held: she faces the camera · both buttons: run forward
//   R or Num Lock autorun (A/D steer it; W or S, R again or Escape stops it) · S backpedals at walk pace
//   runs by default · Numpad / toggles walk · Space: jump · Alt in first person: free look without turning her
//   ground steeper than MOVE.maxSlope can't be walked or jumped up: she slides off (a V between two banks holds still)
// First person (wheel all the way in): she turns with the mouse look, and A/D strafe like Q/E.
// Game hooks on the body (all optional):
//   state.wowMoveLocked = true stops her (menus); a parented body (seated, riding) does not walk
//   state.wowFace = { yaw (rad), at: ctx.now() } turns her once, the walk heading with her
//   state.speedMul scales the pace (a haste, a slow) · state.swimming = true swims (Space rises, X sinks)
//   state.mount set: no jump from a standstill; state.mount.call (a sound clip) plays on Space there instead
//   session.rush = true: another script drives her velocity this moment, the walker stands aside
const N = 'wow-camera-controls:'
const pick = (o, k) => !!(o[k] || o[N + k])
const axis = (a, k) => a[k] ?? a[N + k] ?? 0
function depthOf(me) { const L = me.liquid; return L?.in && L.level != null ? L.level - (me.feetPosition?.y ?? 0) : 0 }
// the ground just under her feet, read by one short ray down; a face steeper than MOVE.maxSlope returns its downhill
// direction (the normal's level part, unit) and how steep it is, else null
const STEEP_NY = Math.cos(MOVE.maxSlope * Math.PI / 180)
function steepUnder(ctx) {
  const f = ctx.self.feetPosition; if (!f) return null
  let hit = null
  try { hit = raycast(ctx, { x: f.x, y: f.y + 0.4, z: f.z }, { x: 0, y: -1, z: 0 }, { distance: 1.0, physicsOnly: true }) } catch { return null }
  const n = hit?.normal; if (!n || n.y >= STEEP_NY || n.y <= 0.02) return null
  const h = Math.hypot(n.x, n.z); if (h < 1e-4) return null
  return { x: n.x / h, z: n.z / h, ny: n.y }
}
function memo(ctx) { const all = (ctx.session.wowMove ??= {}); return (all[ctx.self.id] ??= {}) }

// the body's yaw: the heading the keys and mouse chose plus the eased strafe lean; written only when it moves
function writeHeading(ctx, m) {
  if (typeof m.baseHeading !== 'number') return
  const yaw = m.baseHeading + (m.lean ?? 0), pitch = m.tilt ?? 0
  if (Math.abs(((yaw - (m.lastHeading ?? 1e9)) % 360 + 540) % 360 - 180) > 0.05 || Math.abs(pitch - (m.lastTilt ?? 0)) > 0.3) {
    m.lastHeading = yaw; m.lastTilt = pitch
    ctx.self.rotation = pitch ? { yaw, pitch } : { yaw }
  }
}

// this controller owns her yaw: a walk animator beside it (humanoid-locomotion and its kin read state.turnTo) is told
// to turn nothing, so a fresh world's starter animator never swings her to her walk or the camera
function claimYaw(ctx) { if (ctx.self.state && ctx.self.state.turnTo !== 'none') ctx.self.state.turnTo = 'none' }

export function onSpawn(ctx) { claimYaw(ctx) }

export function onInput(ctx, input) {
  claimYaw(ctx)
  const a = input.axes ?? {}, h = input.held ?? {}, p = input.pressed ?? {}
  const freeLook = pick(h, 'freeLook'), first = !!ctx.session.wowFirst, returning = !!ctx.session.wowReturning
  const touch = !!a.touchActive
  const fpStrafe = first && !freeLook && !returning
  const view = {
    axes: {
      ...a,
      // first person (Alt free-look aside): the mouse owns turning, so A/D strafe alongside Q/E
      moveX: touch ? (a.moveX ?? 0) : fpStrafe ? Math.max(-1, Math.min(1, axis(a, 'strafe') + axis(a, 'turn'))) : axis(a, 'strafe'),
      moveZ: touch ? (a.moveZ ?? 0) : axis(a, 'forward'),
      turn: fpStrafe ? 0 : axis(a, 'turn'),
    },
    held: { orbit: pick(h, 'orbit') || freeLook, steer: pick(h, 'steer'), autoRunStop: pick(h, 'autoRunStop') },
    // A/D (turn, strafe) steer an autorun; only W or S (the forward axis) stops it, or R again
    pressed: { autoRun: pick(p, 'autoRun'), autoRunStop: pick(p, 'autoRunStop') && axis(a, 'forward') !== 0, release: pick(p, 'release') },
    now: ctx.now(),
  }
  const m = memo(ctx)
  // a game turns the body once (state.wowFace, as camera.js reads it): the walk heading turns with it, so W walks the new facing
  const fc = ctx.self.state?.wowFace
  if (fc && typeof fc.yaw === 'number' && fc.at !== m.faceAt) { m.faceAt = fc.at; if (ctx.now() - fc.at < 3000) m.faceYaw = fc.yaw }
  // first person: her front IS the look (Alt aside), so A/D turn from wherever the mouse left her
  const lookYaw = typeof a.aimYawSin === 'number' && typeof a.aimYawCos === 'number' ? Math.atan2(a.aimYawSin, a.aimYawCos) : null
  if (first && !freeLook && !returning && lookYaw !== null && !m.fpTurning) m.faceYaw = lookYaw
  const r = wowMotion(view, m, !!ctx.self.parent || !!ctx.self.state?.wowMoveLocked)
  m.fpTurning = r.turning
  // the camera reads these: A/D swing it round behind her; plain walking keeps the view the mouse left
  ctx.session.wowFaceYaw = r.faceYaw
  ctx.session.wowTurning = r.turning
  ctx.session.wowFollow = !r.blocked && !r.orbiting && r.turning
  let heading = typeof r.heading === 'number' ? r.heading : null
  if (first && !freeLook && !returning && !r.turning && lookYaw !== null) heading = (lookYaw * 180) / Math.PI
  else if (first && heading !== null && !(r.steering || r.mouseForward) && freeLook) heading = null
  // a pure Q/E strafe (third person, keys): her body turns STRAFE_LEAN toward the side she slides to, so she reads
  // like W+Q, legs crossing on the diagonal, while the path stays dead left/right. update() eases the lean in and out.
  const pureStrafe = !touch && !first && !r.blocked && !r.autoRun && !r.mouseForward && (view.axes.moveZ ?? 0) === 0 && (view.axes.moveX ?? 0) !== 0
  m.leanTarget = pureStrafe ? -Math.sign(view.axes.moveX) * MOVE.strafeLean : 0
  m.baseHeading = heading
  if (heading !== null && !r.blocked) writeHeading(ctx, m)
  // run is the default pace; Numpad / toggles walking, WoW style
  if (pick(p, 'walkToggle')) m.walking = !m.walking
  // S backs her up at walking pace whatever the toggle, WoW style: a backpedal is never a run
  const backpedal = !touch && !r.autoRun && !r.mouseForward && (view.axes.moveZ ?? 0) < 0
  const speed = (m.walking || backpedal ? MOVE.walkSpeed : MOVE.runSpeed) * (ctx.self.state?.speedMul ?? 1)
  m.intent = { x: r.x * speed, z: r.z * speed }
  // swimming: forward while steering (right mouse, both buttons, first person) follows the look's pitch;
  // Space rises, X sinks; otherwise the body holds its depth. At the surface Space still jumps you out onto a bank.
  m.swimVy = null
  if (ctx.self.state?.swimming && !r.blocked) {
    const pitch = ctx.session.wowPitch ?? 0, fwd = (view.axes.moveZ ?? 0) > 0 || r.mouseForward || r.autoRun
    let vy = 0
    if (fwd && (r.steering || r.mouseForward || first) && Math.abs(pitch) > SWIM.pitchDead) {
      const c = Math.cos(pitch); vy = Math.sin(pitch) * speed; m.intent = { x: m.intent.x * c, z: m.intent.z * c }
    }
    if (pick(h, 'jump')) vy = SWIM.vertical
    else if (h.sit) vy = -SWIM.vertical
    m.swimVy = vy
  }
  // a mount never jumps from a standstill; Space there plays its call (state.mount.call) if the game gave one
  const stillMount = ctx.self.state?.mount && !r.x && !r.z
  if (pick(p, 'jump') && stillMount && !ctx.self.state?.swimming) {
    const call = ctx.self.state.mount?.call
    if (ctx.now() > (m.neighAt ?? 0) && typeof call === 'string') { m.neighAt = ctx.now() + 1800; ctx.emit('playSound', { clip: call, position: ctx.self.feetPosition, volume: 0.7, pitch: 0.92 + ctx.random() * 0.16 }) }
  } else if (pick(p, 'jump') && !(m.steep && !ctx.self.state?.swimming) && (ctx.self.grounded || (ctx.self.state?.swimming && depthOf(ctx.self) < SWIM.surface + 0.1)) && !r.blocked) {
    const v = ctx.self.velocity
    ctx.self.velocity = { x: v.x, y: MOVE.jumpSpeed, z: v.z }
  }
}

export function update(ctx, dt) {
  claimYaw(ctx)
  if (ctx.self.parent) return // seated or riding: the parent carries her
  if (ctx.self.session?.rush) return // a dash or charge drives her velocity itself; the walker stands aside
  const v = ctx.self.velocity
  const m = memo(ctx)
  let intent = m.intent ?? { x: 0, z: 0 }
  // drunk (state.buffUntil.drunk in the future, state.buffStacks.drunk 1..3): the heading wanders left and right under the
  // keys, two slow swells out of step, up to ~30° off, at the same speed; standing still stays still
  if ((ctx.self.state?.buffUntil?.drunk ?? 0) > ctx.now() && (intent.x || intent.z)) {
    const lv = Math.max(1, Math.min(3, ctx.self.state?.buffStacks?.drunk ?? 1)), t = ctx.now() / 1000 * (1 + (lv - 1) * 0.15)
    const a = (Math.sin(t * 1.9) * 0.6 + Math.sin(t * 0.67 + 1.3) * 0.4) * 0.55 * (1 + (lv - 1) * 0.45), c = Math.cos(a), s = Math.sin(a)
    intent = { x: intent.x * c - intent.z * s, z: intent.x * s + intent.z * c }
  }
  const leanTo = m.leanTarget ?? 0, lean = m.lean ?? 0
  if (lean !== leanTo) {
    const stepDeg = MOVE.strafeLeanRate * dt
    m.lean = Math.abs(leanTo - lean) <= stepDeg ? leanTo : lean + Math.sign(leanTo - lean) * stepDeg
    writeHeading(ctx, m)
  }
  const along = intent.x * v.x + intent.z * v.z > 0 || (v.x === 0 && v.z === 0 && (intent.x !== 0 || intent.z !== 0))
  const step = (along ? MOVE.acceleration : MOVE.deceleration) * dt
  const dx = intent.x - v.x, dz = intent.z - v.z, gap = Math.hypot(dx, dz), k = gap > step ? step / gap : 1
  const vx = v.x + dx * k, vz = v.z + dz * k
  // underwater the stroke owns y: the engine floats a swimmer like a floor near the surface, so her depth is held by hand,
  // stepped by the stroke (a dive, a rise, or still) and kept off the bed; at the surface the engine's float has her
  const sv = ctx.self.state?.swimming ? m.swimVy : null, d = depthOf(ctx.self), deep = d > SWIM.surface + 0.12
  // the body leans into the stroke: nose down on a dive, up on a rise, level at rest and on land
  {
    const hs = Math.hypot(vx, vz), vyNow = sv != null && (deep || sv < 0) ? (m.swimSv ?? sv) : 0
    const want = sv != null && Math.abs(vyNow) > 0.25 ? Math.max(-SWIM.maxTilt, Math.min(SWIM.maxTilt, Math.atan2(vyNow, Math.max(hs, 0.8)) * 180 / Math.PI)) : 0
    const t = m.tilt ?? 0, stepT = SWIM.tiltRate * dt
    if (t !== want) { m.tilt = Math.abs(want - t) <= stepT ? want : t + Math.sign(want - t) * stepT; writeHeading(ctx, m) }
  }
  if (sv != null && (deep || sv < 0)) {
    const f = ctx.self.feetPosition, L = ctx.self.liquid
    m.swimSv = (m.swimSv ?? 0) + (sv - (m.swimSv ?? 0)) * Math.min(1, SWIM.response * dt)
    if (!deep) m.swimSv = Math.min(m.swimSv, -1)
    const bed = (ctx.place.terrain?.heightAt?.(f.x, f.z) ?? -1e9) + 0.05
    let y = Math.max(bed, Math.min(L.level - SWIM.surface + 0.02, (m.swimY != null && Math.abs(m.swimY - f.y) < 0.6 ? m.swimY : f.y) + m.swimSv * dt))
    if (!deep && sv < 0) y = Math.min(y, L.level - SWIM.surface - 0.2)
    ctx.session.wowSwimVy = dt > 0 ? (y - f.y) / dt : 0 // a swim-stroke animation can read it
    m.swimY = y
    ctx.self.feetPosition = { x: f.x, y, z: f.z }
    ctx.self.velocity = { x: vx, y: 0, z: vz }
    return
  }
  m.swimY = null; m.swimSv = 0; ctx.session.wowSwimVy = 0
  // too steep underfoot: her keys can't push her up the face, and the face pushes her down it, building to slideMax
  let st = ctx.self.state?.swimming ? null : steepUnder(ctx)
  // in a V where two too-steep banks meet, each bank would slide her across into the other forever. A slide that turns back
  // on itself within 2 s, or one that goes nowhere for 0.6 s, marks a pocket she stands in, like WoW; the slide comes back
  // once she is 4 m from it.
  if (m.pocket && Math.hypot(ctx.self.feetPosition.x - m.pocket.x, ctx.self.feetPosition.z - m.pocket.z) > 4) m.pocket = null
  if (st) {
    const f = ctx.self.feetPosition, now = ctx.now()
    if (m.pocket) st = null
    else {
      const d = m.slideDir
      if (d && now - d.t < 2000 && st.x * d.x + st.z * d.z < -0.2) m.pocket = { x: f.x, z: f.z }
      else {
        if (!d || st.x * d.x + st.z * d.z > 0.7) m.slideDir = { x: st.x, z: st.z, t: now, ax: d?.ax ?? f.x, az: d?.az ?? f.z, at: d?.at ?? now }
        else m.slideDir = { ...d, x: st.x, z: st.z, t: now }
        const s0 = m.slideDir
        if (Math.hypot(f.x - s0.ax, f.z - s0.az) > 0.7) { s0.ax = f.x; s0.az = f.z; s0.at = now }
        else if (now - s0.at > 600) m.pocket = { x: f.x, z: f.z }
      }
      if (m.pocket) st = null
    }
  }
  m.steep = !!st
  if (st) {
    let ix = intent.x, iz = intent.z
    const up = ix * st.x + iz * st.z; if (up < 0) { ix -= st.x * up; iz -= st.z * up } // drop the uphill part of the keys
    const slid = Math.max(0, v.x * st.x + v.z * st.z)
    const s2 = Math.min(MOVE.slideMax, slid + MOVE.slideAccel * (1 - st.ny) * dt * 2 + 0.6)
    const vy = Math.min(v.y, 0) + (ctx.place.gravity?.y ?? -9.81) * dt // no climbing a face on a held jump
    ctx.self.velocity = { x: ix + st.x * s2, y: vy, z: iz + st.z * s2 }
    return
  }
  ctx.self.velocity = { x: vx, y: v.y + (ctx.place.gravity?.y ?? -9.81) * dt, z: vz }
  if (ctx.self.grounded && vx === 0 && vz === 0 && intent.x === 0 && intent.z === 0 && (m.lean ?? 0) === (m.leanTarget ?? 0) && !(m.tilt ?? 0)) ctx.sleep()
}
