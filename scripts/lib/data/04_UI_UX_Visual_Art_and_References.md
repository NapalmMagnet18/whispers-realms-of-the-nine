# WHISPERS: REALMS OF THE NINE
## UI/UX, Character, Environment & Visual Reference Bible
Version 1.1 | WHISPERS Technical design language

## Art identity
**Art direction:** Storybook medieval fantasy meets twilight occult mystery. Compared with RuneScape, add stronger scene lighting, richer architecture and cinematic landmarks. Compared with World of Warcraft, reduce visual clutter, oversized ability effects and interface framing. Preserve exceptional interaction clarity.

**Value contrast:** Warm and welcoming town; emerald forest; weathered rust quarry; cyan-grey occult marsh; blackstone and bone crypt. Readability first, dramatic atmosphere second. Never use visual darkness to conceal combat hazards or the current objective.

## Visual palette
| Role | Hex | Usage |
| Charcoal | #181C22 | HUD backing, menus, contrast |
| Forest | #344F42 | Terrain, foliage, naturalism |
| Parchment | #D6C49A | Headings, map text, labels |
| Aged brass | #AF8951 | Frame lines, selected tabs |
| Spectral teal | #5AAFA7 | Magic, portals, discoveries |
| Danger crimson | #B64B52 | Warnings, enemy attacks |
| Off-white | #F1EEE8 | Readable primary text |

**Fonts:** readable sans-serif for in-game numbers and menus; optional restrained display serif for title/lore only. Ensure all text scales independently and offers substantial contrast over moving gameplay.

## Desktop HUD wireframe
[[IMAGE:hud]]

## Inventory and crafting wireframe
[[IMAGE:inventory]]

## Core UI views
### Gameplay HUD
Player health/resources and portrait upper-left, minimap upper-right, quest summary right side, party frames under player portrait, compact chat lower left, center-bottom eight-slot hotbar, bottom icon bar for skills/bag/journal/map/settings. Strong spacing and opacity control. A minimally invasive experience is more important than ornament.

### Inventory
Open with I; 24-slot starting bag; clear stack numbers; item tooltips compare equipment; click/equip, sort, transfer, and discard confirmation; nearby merchant and bank integration when appropriate.

### Skills
Open with F1 or icon; category tiles show level and XP, next unlock, tool requirements, and linked craft recipes. RuneScape inspiration is **many worthwhile life skills**, not copied icon positions.

### Character and equipment
Open K; avatar on one side, gear slots around it, concise stat list and equipped-item comparison. Avoid overloading the first character sheet with unused endgame statistics.

### Quest journal
Open J; active, available and completed tabs. Every quest shows concise objective, location hint, current counts and reward preview. Quest tracking persists after reconnect.

### Map and navigation
Open M; place names and fog of discovery; color and shape-coded landmarks; destination pins for tracked quests; legend and scale. Do not promise a full dynamic world map before the game world geometry exists.

### Crafting and vendors
Show ingredients, owned quantity, material cost, resulting item and reason for unavailable crafting. Vendor purchases always report coin shortage/inventory full without spending partial currency.

### Chat and multiplayer
Readable sender label, optional chat tabs, spam-rate protections, ability to mute/block if current platform supports them, party member names and HP. Never block third-person control by stealing focus unexpectedly.

## UX requirements and acceptance
| Requirement | Expected behavior |
| Key feedback | HUD button visibly presses and shows cooldown |
| Readability | Ability icons clear at 1366x768, test at 1920x1080 |
| Interaction | E prompt within designed distance, invalid prompt disappears |
| Color dependence | Hazard uses warning shape and motion in addition to red |
| Accessibility | UI scaling, reduced flashes, camera sensitivity, sound sliders |
| Control rebinding | Implement if Spawn supports configurable bindings; otherwise label current mapping accurately |
| Error messages | Plain player-facing explanation for failed purchases/crafting |
| Mobile later | Alternate layout and large tap targets after desktop UX stabilizes |

## Asset direction and checklist
**Heroes:** Vanguard broad armor silhouette and grounded stance; Arcanist layered robe and crystal focus; Pathfinder lighter leathers and distinctive bow. Character silhouette should work at in-game camera distance.
**Enemies:** Briar Wolf (low attack tells), Quarry Scavenger (heavy strike), Candle Warden (boss hazard). Original silhouettes and animation sets.
**Weapons:** Human-scale readable models; avoid giant visual noise. Equipment should be distinguishable at several camera zoom levels.
**Props:** Modular stone-and-timber building pieces, market stalls, anvil, bank chest, signposts, fence, bridge, ore rocks, felled logs, rune slabs, dungeon arch modules.
**World effects:** Day/night tone shifts, smoke puffs, footprints where affordable, glow runes, subtle fog, lantern particles, small dust in quarry.

## Original reference-image briefs
1. **Lantern town key art:** 16:9 elevated third-person vista, original fantasy village from stone entrance, timber market, orange lanterns, winding streets, green hills, magical tower silhouette, stylized 3D videogame look, game-readable pathways, no text or logos.
2. **Briarwild forest:** 16:9 game environment reference, readable pathways, footbridge and river, ancient standing stone, emerald/teal light, resource nodes and wolf encounter clearing, original assets, stylized painterly materials.
3. **Quarry gameplay frame:** 16:9 third-person gameplay environment, layered red cliffs, copper mining nodes, wooden winch lift, traversable paths and a sheltered forge, clear scale.
4. **Marsh cinematic:** 16:9 gothic fantasy zone, misty swamp, ruined chapel, cold blue light, glowing mushrooms, elevated footways, readable game navigation.
5. **Main HUD visual:** 16:9 MMORPG gameplay screen with contemporary charcoal/aged-brass UI, clean hotbar, enemy bar, minimap, quest list, inventory icon, original iconography, no other games' branding.
6. **Inventory mock-up:** game-ready 16:9 fantasy inventory and character panel, slot grid, tooltips, item rarity and recipe comparison, deep charcoal background, muted brass borders, high-contrast typography.

## Reference gallery index
**All links are for independent study only. Do not place copyrighted images, icons or models in released game files.**
| Reference | What to study | Source |
| RuneScape | Life skills, readable resource loops, inventory | https://www.runescape.com/ |
| World of Warcraft | Action bar, combat roles, dungeons, silhouette | https://worldofwarcraft.blizzard.com/ |
| Albion Online | Simple trade/gathering feedback and crafting clarity | https://albiononline.com/ |
| Guild Wars 2 | Natural environments, ruined landmarks, vistas | https://www.guildwars2.com/ |
| Fable | Storybook settlement mood and whimsical scale | https://www.fablethegame.com/ |

## Visual sign-off checklist
- [ ] All visual content is original or properly licensed.
- [ ] Important gameplay props are recognizable without relying on text.
- [ ] Hotbar, map, quest tracker and inventory are readable over bright/dark scenes.
- [ ] Hazard telegraphs are visible for colorblind players.
- [ ] Players can navigate without referring to a separate wiki or tool.
- [ ] Character animations communicate anticipation and impact.
- [ ] Night and fog effects do not make the starter zone frustrating.
