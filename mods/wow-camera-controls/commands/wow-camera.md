---
name: wow-camera
description: Install and wire the World of Warcraft controls in this world — camera rig, WoW body movement, steering and autorun.
---

Load the `wow-camera-controls#wow-camera-controls` skill and follow its install checklist in this world: make the mod's rig the only camera behavior, swap the player's own movement script for `mods/wow-camera-controls/move.js` (or wire `lib/motion.js` into a custom controller), and lock look and movement while this game's menus are open via `wowCameraLocked` / `wowMoveLocked`. Then walk it once and judge it by the skill's "Judge it" section.