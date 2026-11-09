---
name: Wow Camera Controls
description: World of Warcraft controls, camera and movement: W/S walk, A/D turn, Q/E strafe, R autorun, left-drag orbit without turning the body, right-drag steer, both buttons run, eased wheel zoom into first person, Alt free look, ground-hugging camera arm, steep-slope sliding, swimming along the look; install, wire and tune.
---

# World of Warcraft Controls

Camera, controls and body movement like World of Warcraft. Installing attaches `camera.js` to the world's camera;
`move.js` is the drop-in body controller you put on the player.

## Controls
- **W / S**: walk forward / back along the way she faces; **S** always backpedals at walking pace. **A / D**: turn in place; the camera swings round behind her.
- **Q / E**: strafe left / right; her body leans 45° into a pure strafe while the path stays sideways. Runs by default; **Numpad /** toggles walking. **Space**: jump.
- **R or Num Lock**: autorun; A/D steer it, **W or S** (or R again, Escape, both mouse buttons) stops it.
- **Hold left mouse + drag**: orbit the camera around her. She does NOT turn and her walking course holds. The drag reads the cursor's own screen position (a still mouse never orbits, even while running) and glides ~45 ms to hide uneven samples.
- **Hold right mouse + drag**: turn the camera and she turns to face it, 1:1 with the hand, stopping the moment you let go.
- **Both buttons**: run forward along the camera (the right drag alone turns the view).
- **Wheel / pinch**: eased zoom, 16 m out to first person (the body hides inside 0.65 m).
- **First person**: drag looks (no pointer lock), she turns with the look; A/D strafe like Q/E. **Alt held**: free look.
- No pointer lock in any lens: no browser "press Esc" banner, and right-click picks still reach NPCs and objects.
- The camera arm meets the ground and slides in along it, never under it; under the terrain (cellar, cave) the ground clamp stands aside.
- Ground steeper than 56° can't be walked or jumped up: she slides off. A V between two steep banks holds her still instead of ping-ponging.
- **Escape** releases a held drag until the buttons are let go. **Touch**: the stick walks where it points, drag orbits, pinch zooms.

## Install checklist (the consumer's world)
1. The mod's rig must be the only rig: remove the world's own camera script from `templates/camera.js`'s `behavior`
   list (the attach adds the mod's). Keep `kind: "custom"`.
2. Movement: in the player template's `behavior` list, replace the world's own movement script (the one that writes the
   body's velocity from WASD) with `"mods/wow-camera-controls/move.js"`. Without it, left drag still orbits but nothing
   turns or walks the WoW way. Keep animation scripts; keep game logic but take its velocity and jump writes out. Never run two movers on one body.
3. Lock while a menu is open: `player.state.wowCameraLocked = true` freezes the look, `player.state.wowMoveLocked = true`
   stops the body; clear both on close. A parented body (seated, riding) never walks.
4. A world with its own controller can call `wowMotion(input, memo, blocked)` from `lib/motion.js`
   instead (see its header) and write `ctx.session.wowFaceYaw / wowTurning / wowFollow` the way `move.js` does so the
   camera follows A/D turns.
   The mod's inputs arrive as `wow-camera-controls:<name>` (orbit, steer, autoRun, autoRunStop, release, jump,
   freeLook, walkToggle; axes forward, strafe, turn, zoom); scripts in this folder read them bare.

## Game hooks (all optional, on the player body's state)
- `wowFace = { yaw (rad), pitch?, at: ctx.now() }`: turn the look and the body once (a teleport, a cutscene end).
- `speedMul`: scales the pace. `swimming: true`: swim along the look, Space rises, X (`held.sit`) sinks.
- `mount` set: no jump from a standstill; `mount.call` (a sound clip) plays on Space there. `mountLift` (m): raises the camera pivot and eye for a rider.
- `sitting: true`: lowers the first-person eye. `buffUntil.drunk` / `buffStacks.drunk`: the walk wanders.
- `ctx.self.session.rush = true`: a dash drives her velocity itself; the walker stands aside.
- Read back: `ctx.session.wowPitch` (look pitch), `wowEyeY` (camera height), `wowSwimVy` (stroke speed).

## Tuning
`lib/config.js`: CAMERA (distance 5.5, max 16, zoomRate 1.5, lookSensitivity 3.6, lookResponse 1000 (1:1), cursorDragScale 1.5,
cursorResponse 22, pitch ±1.4 rad, pivot 1.35 m, aim 1.25 m, eye 1.55 m, sit eye 0.82, mount eye +1.1),
MOVE (run 4.8 m/s, walk 1.6, acceleration 80, deceleration 120, jump 10, strafeLean 45°, maxSlope 56°, slide 18 m/s² to 9 m/s)
and SWIM. `lib/motion.js`: TURN_RATE 3.4 rad/s for A/D.

## Judge it
Left drag while standing: the camera circles her and she keeps facing the same way. Walk with W after orbiting: the view
stays where you left it. Hold D: she turns in place and the camera swings round behind her. Right drag while walking: she
turns with the camera. Q/E: she sidesteps, leaning into it. Run at a cliff: she slides back off it. Wheel all the way in:
the pivot glides to eye height, the body vanishes, drag looks.

- The mover owns the body's yaw: it sets `state.turnTo = "none"` on the player every tick, so a walk animator beside it (the starter's humanoid-locomotion) animates the legs and turns nothing. Left drag orbits without turning her in any world, fresh installs included.