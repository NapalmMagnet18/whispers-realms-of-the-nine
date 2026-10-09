---
name: fbsrenderer
description: Wire FBsRenderer into this world — lighting model on the world, film look on every place (or a named one).
---

Wire FBsRenderer into this world:
1. Set `lighting: mods/fbsrenderer/lighting.js` in world.config.yaml.
2. For each place (or only the one named in the arguments), set `atmosphere.look.script: mods/fbsrenderer/look.js`,
   keeping any existing `params`; with none, write `{ grain: 0.075, vignette: 0.5, ao: 1.2, dread: 0, bloomStrength: 0.35, bloomRadius: 0.8, bloomThreshold: 0.9 }`.
3. Take one look at the live frame and report what changed. Leave the previous lighting/look files in place for the creator to remove.