---
name: Fbsrenderer
description: FBsRenderer — The Fourth Knock's renderer. How to wire its lighting model, film look and bounce lights into a world, its dials, and how to light a scene for it.
---

# FBsRenderer

Three parts, each one file, all numbers in `lib/tuning.js`:

- **lighting.js** — the world's shading. `world.config.yaml`: `lighting: mods/fbsrenderer/lighting.js`.
  GGX + Lambert, dielectrics pushed matte, soft shadow edge, **zero flat ambient**. A room is lit only by its lamps,
  their bounce rows and the sky's environment. A dark corner stays dark unless a light or bounce reaches it.
- **look.js** — the film. Per place: `atmosphere.look: { script: mods/fbsrenderer/look.js, params: {...} }`.
  Dials: `exposure` (1), `sat` (0.74), `vignette` (0.55), `grain` (0.085), `dread` 0..1 (drains colour, closes the
  vignette; a director script may move it live), `ao` 0..1.5 (contact shadow strength). Bloom keys
  (`bloomStrength`, `bloomRadius`, `bloomThreshold`) ride the same params.
- **bounce.js** — a behavior for a shadowless light standing where a lamp's light lands, tinted by that surface:
  `{ light: { kind: "point", color, intensity: 0, distance: 4, shadow: { enabled: false } }, behavior: "mods/fbsrenderer/bounce.js", state: { src: "<lamp id>", k: 0.2 } }`.
  It tracks the lamp's intensity every 2 ticks and hides when dark.

Lighting for it: practicals first (a lamp is a light at the bulb, shadow on), then one or two bounce rows per lamp
(floor pool, ceiling above the shade). Interiors want terrain off and a sealed shell; outdoor day scenes work as-is
(the sky's environment carries the fill). Judge by a look at the live frame: blacks kept black, practicals warm.
Tune by editing `lib/tuning.js` (one source) or the place's look params, never by copying a file.