---
name: Wow Camera Controls
description: MMO / World of Warcraft style camera and mouse controls — left-drag orbit, right-drag steer, both buttons run, eased wheel zoom into first person; how to install, wire movement and tune it.
---

# World of Warcraft Camera Controls

Camera and mouse controls exactly like World of Warcraft. Installing attaches `camera.js` to the world's camera.

## Controls
- **Hold left mouse + drag**: orbit the camera around the character. A walking course holds while you look around.
- **Hold right mouse + drag**: turn the camera; with movement wired (below) the body steers to face it and A/D strafe.
- **Both buttons**: run forward along the camera.
- **Mouse wheel / pinch**: eased zoom, 16 m out to first person (the body hides inside 0.65 m).
- **Q** autorun, **W** cancels it. **Escape** releases a held drag until the buttons are let go.
- **Touch**: drag anywhere orbits, pinch zooms.

## Install checklist (the consumer's world)
1. The mod's rig must be the only rig: remove the world's own camera script from `templates/camera.js`'s `behavior` list (the mod's attach adds its own). Keep `kind: "custom"`.
2. The rig sets `pointerLock: false` and `orientation: { source: "look" }` itself — the cursor stays free for clicking the world.
3. Lock the look while a menu or dialog is open: set `wowCameraLocked = true` on the player's state; clear it on close.
4. Movement (optional, the right-steer / both-buttons-run / autorun half): in the body's `onInput`, call
   `wowMotion(input, memo, blocked)` from `mods/wow-camera-controls/lib/motion.js` (the controller imports it by path; a
   host script outside the folder names the full path), multiply `x/z` by walk speed for the velocity, and turn the body to
   `heading` (degrees) when not null. `memo` is any per-body object kept across ticks (ctx.session).
   The mod's input actions arrive as `wow-camera-controls:orbit` etc.; a host script reads them under that name, or the
   host declares its own `orbit/steer/autoRun/autoRunStop/release` bindings.

## Tuning
Every number is in `lib/config.js`: distance 5.5, max 16, zoomRate 1.5, lookSensitivity 3, lookResponse 24 (higher = snappier,
lower = floatier), pitch clamp ±1.4 rad, pivot 1.35 m, aim 1.25 m, eye 1.55 m.

## Judge it
Orbit with left drag and let go: the camera stops exactly where you left it, no drift back. Right drag while walking: the
body turns with the camera. Wheel in slowly: the pivot glides down to eye height and the body vanishes, no pop.