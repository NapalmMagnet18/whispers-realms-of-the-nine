---
name: MMORPG Tools Setup
description: How to wire up MMORPG Tools mod after install — places, UI, camera, player, and customization guide
---

# MMORPG Tools Setup

How to wire up MMORPG Tools mod after install — places, UI, camera, player, and customization guide.

## Overview
The MMORPG Tools mod provides a full character creation, class/race system, spellbar, inventory, guild, quest, and menu UI for MMO-style games built in Spawn.

## Post-Install Wiring
After installing, the mod attaches player and camera behaviors automatically. The UI script (`mod-mmorpg/ui.js`) must be set as the game's UI render script.

## Customization
- Races and classes are defined in `mod-mmorpg/lib/races.js`
- Talent trees in `mod-mmorpg/lib/talent-trees.js`
- Quest data in `mod-mmorpg/lib/quest-data.js`
- Shop data in `mod-mmorpg/lib/shop-data.js`
- Weapon data in `mod-mmorpg/lib/weapon-data.js`
