import { raycast } from 'builtin/physics'
// The player's own movement: WASD relative to the camera's aim, jump, gravity: on the
// character controller. A body is three writes: feetPosition puts it there, velocity asks the
// controller to take it there (held until the next write: it slides, steps and grounds), forces
// push until null. Numbers live in lib/data/player.yml; gravity is the PLACE's
// (places/<p>/config.yaml gravity:), so a district that declares its own pulls on you the
// moment you step in. The body arrives dressed by the join: the template's model, else the card's
// avatar, and its own file carries Idle, Walk, Run, Sprint, Jump; any other clip is an address on a
// mixer channel (anim.sit = "cdn/clip-sit-loop.glb": →animations).
import PLAYER from './lib/data/player.yml'
import { wowMove, modalOpen } from './lib/wow-move.js'

// Footsteps from the creator's foley pack: the ground under the foot picks the set, a floor above the terrain is hard.
const STEPS = {
  hard: ['/cdn/sfx-footstep-hard-surface-fvkz5mig.mp3', '/cdn/sfx-footstep-hard-surface-step-fodr77wl.mp3', '/cdn/footstep-04-hard-surface-step-5xkxucmi.mp3', '/cdn/footstep-hard-surface-walk-unyuz2k7.mp3'],
  gravel: ['/cdn/footstep-07-gravel-walk-3xm4nwid.mp3'],
  soft: ['/cdn/sfx-footstep-dirt-walk-9iixa3ms.mp3', '/cdn/sfx-footstep-walking-movement-po5miq4i.mp3', '/cdn/sfx-footstep-walking-movement-shoe-plqtyode.mp3'],
  grass: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-thick-grass-soft-swish.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-thick-grass-soft-swish-2.mp3'],
  forest: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-forest-floor-pine-needles-twig-crackle.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-forest-floor-dry-leaves-crunch.mp3'],
  snow: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-crunching-into-fresh-packed-snow.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-crunching-into-fresh-packed-snow-2.mp3'],
  mud: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-squelching-in-wet-marsh-mud-suck.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-squelching-in-wet-marsh-mud-splash.mp3'],
  sand: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-dry-sand-soft-hiss-crunch.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-dry-sand-soft-hiss-crunch-2.mp3'],
  ash: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-brittle-volcanic-ash-cinders-crackle.mp3'],
  crystal: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-crystal-rock-glassy-clink-crunch.mp3'],
  wood: ['/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-hollow-wooden-plank-bridge-creak-thump.mp3', '/cdn/moodboard-painterly-fantasy/sfx-footstep-boot-on-hollow-wooden-dock-boards-knock.mp3'],
}
const HARD = { cobble: 1, rock: 1, redrock: 1, pathrock: 1, desertrock: 1 }
const BY_MAT = { grass: 'grass', forest: 'forest', snow: 'snow', mud: 'mud', sand: 'sand', blight: 'ash', ashrock: 'ash', veil: 'crystal', gravel: 'gravel', dirt: 'soft' }
const WOOD = /bridge|dock|boardwalk|pier|plank|deck|stilt|jetty|walkway|floor-wood|wharf/i
function footstep(ctx, w, speed, dt) {
  w.stepT = (w.stepT ?? 0) - dt
  if (w.stepT > 0) return
  w.stepT = Math.min(0.6, Math.max(0.27, 1.7 / speed))
  const p = ctx.self.feetPosition
  const t = ctx.place.terrain
  const h = t?.heightAt?.(p.x, p.z)
  let mat = t?.materialAt?.(p.x, p.z)
  if (mat && typeof mat === 'object') mat = mat.id
  let set
  if (h == null || p.y > h + 0.35) { // on something built: wood if the thing underfoot is a deck, else stone
    const r = raycast(ctx, { x: p.x, y: p.y + 0.3, z: p.z }, { x: 0, y: -1, z: 0 }, { distance: 1, physicsOnly: true })
    set = r?.id && WOOD.test(String(r.id)) ? STEPS.wood : STEPS.hard
  } else set = HARD[mat] ? STEPS.hard : STEPS[BY_MAT[mat]] || STEPS.soft
  w.stepI = ((w.stepI ?? 0) + 1) % set.length
  ctx.emit('playSound', { clip: set[w.stepI], position: p, volume: 0.16, pitch: 0.92 + ctx.random() * 0.16, maxDistance: 18 }, { audience: { nearby: p, radius: 18 } })
}

// The keys' intent is this machine's alone: onInput writes it, update() reads it, nobody else does:
// and a value written to state rides the wire and the save on every tick it changes (the intent turns
// with the camera, so a running player would send a row a tick). ctx.session is the room-life scratch:
// never on the wire, gone with the room. One slot per body.
function walkOf(ctx) {
  const walks = (ctx.session.walk ??= {})
  return (walks[ctx.self.id] ??= {})
}

export function onInput(ctx, input) {
  // WoW controls: wasd in the camera's basis, right-drag steers, both buttons run, Q autoruns (lib/wow-move.js).
  const m = wowMove(ctx, input, 'stride')
  walkOf(ctx).moveIntent = { x: m.x * PLAYER.walkSpeed, z: m.z * PLAYER.walkSpeed }
  // The look locks while a dialog is open; the camera rig reads this flag.
  const lock = modalOpen(ctx.self.state)
  if (!!ctx.self.state.wowCameraLocked !== lock) ctx.self.state.wowCameraLocked = lock

  // The jump is your y; x and z stay what the body did last tick (y reads 0 on the ground).
  if (input.pressed.jump && ctx.self.grounded && !m.blocked) {
    const v = ctx.self.velocity
    ctx.self.velocity = { x: v.x, y: PLAYER.jumpSpeed, z: v.z }
  }
}

// The arrival's real signal: the ground under the hero exists and holds them a beat, then the
// streamed cell around them gets a moment to draw. Stamped once per arrival; the veil (ui-zone-splash.js)
// stays up until this stamp is newer than the crossing, never a guess on a timer.
function areaReady(ctx, dt) {
  const a = (ctx.session.arrival ??= {})
  const here = ctx.self.place
  if (a.place !== here) { a.place = here; a.ok = 0; a.done = false }
  if (a.done) return
  const p = ctx.self.feetPosition
  const h = ctx.place.terrain?.heightAt?.(p.x, p.z)
  const standing = (h != null || ctx.place.terrain?.kind === 'off') && (ctx.self.grounded || (h != null && Math.abs(p.y - h) < 0.6))
  a.ok = standing ? a.ok + dt : 0
  if (a.ok >= 0.9) { a.done = true; ctx.self.state._areaReady = ctx.now() }
}

export function update(ctx, dt) {
  areaReady(ctx, dt)
  // Seated (attached to a hull, a mount): the seat carries the body: the legs rest.
  if (ctx.self.parent) return
  // What the body did last tick; y reads 0 on the ground.
  const v = ctx.self.velocity
  // The stride: ease the ground velocity toward the keys' intent: acceleration while the keys point
  // the way the body already moves, deceleration back to rest when none is down or the keys reverse
  // (both m/s², lib/data/player.yml). One capped step per tick, so a held key reaches walkSpeed in
  // walkSpeed / acceleration seconds and a release stops in walkSpeed / deceleration; a body stopped
  // by a wall reads 0 and pushes again from there.
  const intent = walkOf(ctx).moveIntent ?? { x: 0, z: 0 }
  const along = intent.x * v.x + intent.z * v.z > 0 || (v.x === 0 && v.z === 0 && (intent.x !== 0 || intent.z !== 0))
  const step = (along ? PLAYER.acceleration : PLAYER.deceleration) * dt
  const dx = intent.x - v.x
  const dz = intent.z - v.z
  const gap = Math.hypot(dx, dz)
  const k = gap > step ? step / gap : 1
  const vx = v.x + dx * k
  const vz = v.z + dz * k
  // Gravity is yours: the held velocity walks the body; bend its y every tick.
  ctx.self.velocity = { x: vx, y: v.y + ctx.place.gravity.y * dt, z: vz }
  const spd = Math.hypot(vx, vz)
  if (ctx.self.grounded && spd > 1) footstep(ctx, walkOf(ctx), spd, dt)
  // Standing on the ground with no word to walk: nothing changes until something moves the body or a key
  // is pressed: both wake this update (a row of the body written, or onInput running).
  if (ctx.self.grounded && vx === 0 && vz === 0 && intent.x === 0 && intent.z === 0) ctx.sleep()
}
