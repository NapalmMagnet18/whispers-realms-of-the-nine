# WHISPERS: REALMS OF THE NINE
## Spawn 6 MMORPG — Creative Bible, Product Roadmap, and First-Build Specification
Version 1.0 | October 2026 | Working title, changeable

> Vision: A multiplayer dark-fantasy world with RuneScape-like freedom to gather, craft, trade, and progress, plus World of Warcraft-inspired readable combat, parties, classes, quests, and dungeons. Everything must be an original implementation, with original environments, names, artwork, icons, lore, and mechanics.

## 1. Platform decisions and implementation rules
- Target **Spawn 6** as a new 3D multiplayer world. Build with **Savi in Spawn**; an authorized Codex/other coding agent may edit the world's Git repository.
- Spawn provides built-in multiplayer, persistence for player inventory/currency/progress, places and instances, portals, browser play, and the tools to generate/import world objects. Prove the desired game-specific rules through playtests; do not assume the platform guarantees any particular MMO concurrency, atomic marketplace operation, anti-cheat behavior, or economy security.
- Do **not** build a standalone Unity/Unreal/Three.js engine inside Spawn; do **not** bolt on independent networking or an external database as the default. Adapt to Spawn's runtime and save contract.
- Savi should create the world structure through conversation. External agents must first read the world's `AGENTS.md`, the world-scoped **Tome API** documentation, and relevant skills before editing supported scripts. Do not invent methods or file formats.
- Create this as its **own** Spawn world, not as an update to a different game. Use a fresh, world-specific agent invitation if Codex needs build access. Never commit or paste persistent auth tokens into game files or design prompts.
- Link source: https://www.spawn.co/llms.txt ; official Spawn overview: https://www.spawn.co/about ; agent guidance: https://www.spawn.co/about/bring-a-game

## 2. Original game identity
**Working title:** WHISPERS: Realms of the Nine. Alternative standalone titles: Veilbound, Kingdoms of Ash, The Hollow Crown.

**Logline:** The borders between nine ancient realms are breaking. Adventurers known as Wayfarers establish themselves in the last lantern-lit settlements, master professions, bargain with rival factions, and venture into shifting territories where forgotten powers are waking.

**Player fantasy:** Begin with worn clothes and a crude tool. Become a legendary smith, an explorer, a monster hunter, a merchant, a spellcaster, or a member of a guild. Your identity emerges from your choices and activities, not only a level number.

**Tone:** Inviting, colorful, and legible near settlements; gradually mysterious and ominous beyond civilization. Readable silhouettes and saturated focal colors; gothic architecture, colossal ruins, old stones, pale fog, glowing runes, and eerie forests. Not constant black-on-black horror.

**Three pillars:**
1. **Live another life:** resource gathering, processing, crafting, selling, fishing, trade, housing later.
2. **Become powerful together:** approachable combat, distinct disciplines, parties, instanced dungeons, memorable bosses.
3. **A world worth roaming:** dense secrets, branching quests, shortcuts, day/night atmosphere, distinct biome identities.

## 3. Reference matrix and art direction
- **RuneScape 3:** long-lived skills, flexible progression, town/quest/exploration loop, inventory readability, natural resource nodes. Do not copy its icons, models, map, exact skill XP formulas, UI frame art, or character designs.
- **World of Warcraft:** readable third-person combat, clear class ability roles, action bar, creature silhouettes, dungeon telegraphs, party coordination, rich quest hubs. Do not copy class names/spells, interface artwork, NPCs or map.
- **Albion Online:** legible gathering interactions, economy and crafting-loop clarity, item/tool progression. No reuse of assets or item economy details.
- **Fable:** warm storybook medieval villages, charming street lighting, approachable environmental storytelling.
- **Guild Wars 2 environment art:** monumental forest ruins, layered vistas, vertical routes, distant landmarks.

**Reference image links (inspiration only, not shippable game assets):**
- Fable village architecture: https://www.gamesradar.com/upcoming-xbox-series-x-games/
- Guild Wars 2 forest ruin concept: https://videogamesartwork.com/games/guild-wars-2/environment-concept-26
- RuneScape 3 world / hub: https://www.hiperks.com/games/runescape-3
- RuneScape 3 interface: https://pvme.io/pvme-guides/getting-started/interface-guide/
- World of Warcraft UI: https://www.mmo-champion.com/content/10527-World-of-Warcraft-Dragonflight-UI-Revamp-Panel
- Albion gathering UI: https://albiononline.com/news/patch-12-brings-combat-balance-changes

**Art bible:**
- Geometry: stylized mid-poly forms with hand-painted-feeling material breakup; exaggerated roof silhouettes; big roots/trees and sculptural stonework; foreground detail only around meaningful gameplay spots.
- Character proportions: approximately heroic 7–7.5 heads, memorable silhouette at distance, readable weapon poses.
- Textures: restrained painted roughness, no photoreal skin or noisy PBR; small number of coordinated materials.
- Lighting: warm amber lanterns, turquoise mystical accents, lavender cloud shadows, fog falloff; sunny starter biome followed by colder corrupted biomes.
- Palette: forest #344F42, parchment #D6C49A, charcoal #181C22, brass #AF8951, spectral teal #5AAFA7, danger crimson #B64B52. White high-contrast text for HUD, never rely solely on color.
- Effects: restrained particle clusters, directional melee arcs, large unmistakable enemy ground telegraphs; avoid constant effect spam.
- Environment audio: birds, creaking signs, rivers, blacksmith hammers, subtle music loops, wind whispers at ancient gates.

## 4. Initial overworld map — the Lantern March
**Central hub — Lantern's Reach:** an intimate walled town containing fountain, bank, general trader, inn, smithy, crafting stations, notice board, stables, faction representatives, guard gates, and 3–5 quest givers. A distant spire should be visible from the square.

**West — Briarwild:** sunlit forest, river crossings, starter wolves, herb patches, timber, fishing. Connect by bridge and woodland footpaths.

**East — Emberstone Quarry:** quarry terraces, copper and iron, aggressive cave scavengers, forge-related sidequests and a hidden miner tunnel shortcut.

**South — Sorrowfen:** night fog, fungi, drowned ruins, occult fragments, undead; unlock after starter progression. Elevated walkways and alternate routes.

**Dungeon place — The Hollowcrypt:** 3-boss group adventure through ruined chapel, ossuary, and underground hall; accessed through a visible portal or dungeon gate. First release may have **one** simple boss, with the full dungeon later.

**World layout rules:** traversable paths connect logically, every zone has at least one memorable landmark, sightlines indicate next destinations, vertical routes reward exploration, safe respawn/fast travel points reduce dead running. World expansion follows the **place/instance** model only when useful, without prematurely splitting every area.

## 5. Core player journey and MVP definition
**Minute 0–5:** character appears outside Lantern's Reach, receives a short cinematic/dialogue introduction, learns movement, camera, interact key, and basic quest dialogue.

**Minute 5–12:** accepts 'A Light Against the Briars', defeats three forest creatures, gathers five logs, returns to a guard or carpenter; XP and small coins awarded.

**Minute 12–20:** learns a gathering tool, mines ore or cuts timber, crafts first upgraded weapon at a forge. Compare equipment stats and equip it.

**Minute 20–30:** groups with a second player; both see each other, party nameplates work, they defeat a mini-boss, receive individually assigned rewards; leave and rejoin to prove saved inventory and progression.

**Definition of first playable:** One attractive central hub, three walkable interconnected areas, two enemy species and one boss, three combat disciplines, six fundamental professions or at minimum two complete gathering-to-crafting loops, 6–8 starter quests, inventory/equipment, XP, loot, bank/shop, on-screen quest tracker, 2-player collaboration, reliable persistence. If that scope is too broad, prioritize the full 20-minute path rather than half-built features.

## 6. Camera, input, interactions, and combat
- **Camera:** third-person orbit, adjustable zoom, mouse orbit, optional mouse lock; player stays fully legible; no motion-blur dependency. Keyboard movement WASD, Shift sprint, Space jump, E interact, Tab target, 1–8 abilities, F1 skills, I inventory, J journal, M map, K character, Esc pause.
- **Interaction:** outline nearby resource or NPC, floating label with button/key, contextual progress for gathering, click-to-move only as a later option.
- **Combat:** hybrid modern MMO: soft-tab target selection with active movement, 6–8 hotbar slots; basic attack, resource-cost skills, cooldowns, dodge/defensive reaction. Early mobs telegraph heavy attacks. Range and visibility rules prevent striking through walls.
- **Disciplines:** Vanguard (melee guardian), Arcanist (spellcaster), Pathfinder (ranged skirmisher). Later add Warden (support/healer). Start with one chosen archetype; allow later retraining or switching at trainers so players are not permanently locked out.
- **Character attributes:** health, stamina/mana, physical/magical power, armor, critical chance; avoid overwhelming new players. Bosses telegraph red danger areas 0.8–1.5 seconds before attacks as a starting tuning target, then playtest.
- **Enemy AI:** idle/patrol, aggro, chase within region, strike, cooldown, disengage/leash/reset, death/respawn, loot ownership. Boss: 2–3 distinct moves and one avoidable area attack.

## 7. Skills, equipment, crafting, and economy
**Initial skill roster:** Mining, Woodcutting, Fishing, Smithing, Cooking, Alchemy, Survival. Start with 2 fully implemented pipelines for MVP (e.g., mine → smelt → smith; fish → cook → eat). Expand only after persistence tests. Later Farming, Tailoring, Enchanting, Hunting, Construction, Runecraft/Occultism.

**Progression:** independent combat and profession XP; displayed level, progress, and next unlock. Avoid choosing a universal XP curve before tuning the actual fun of gathering. Keep level-up sounds and small meaningful unlocks.

**Equipment:** head, torso, legs, gloves, boots, main hand, offhand, amulet, ring; initial MVP can implement 4 slots and expand. Tiered rarity with readable names: Common, Fine, Rare, Relic, Mythic. Rarity must not automatically override level or build relevance.

**Inventory:** capacity slots, stackable materials, drag/drop or click-to-equip, item tooltip, amount, weight/capacity rule, overflow rejection, drop and pickup feedback. One canonical item registry gives each item an ID, name, category, icon, stack limit, value, tags, and stat modifiers.

**Economy:** initial gold earned by quests and mobs, spent on items, tools and repairs. Progress to vendor selling, bank, player-to-player trade, then marketplace only after anti-duplication verification. Use gold sinks, repair costs, transaction limits and trade audit logs. Do not add a player marketplace until a failure-safe and abuse-resistant implementation is demonstrated.

**Transactions:** all durable inventory/currency changes must be validated through Spawn's supported shared/server-authoritative mechanisms, according to the current world API. Test simultaneous acquisition, disconnect during transaction, reconnect, double-click purchase, two users trading and canceling, and inventory-full behavior. If atomic operations are unavailable, hold off on direct trading and auction houses.

## 8. Quests, social features, and dungeons
**Quest templates:** short dialogue chain; kill/count; gather/return; interact/explore; delivery; escort later; choice/branching later. Quest state = unavailable/available/active/objectives/completed/rewarded, and cannot reward twice.

**Starter quests:** 1) Welcome to Lantern's Reach 2) A Light Against the Briars 3) The First Forge 4) The Old River 5) Supply the Watch 6) Echoes at the Quarry 7) Broken Sigil 8) The Hollowcrypt Gate.

**NPC roles:** town guide, guard captain, carpenter, smith, quartermaster, alchemist, ferryman, old archivist. Write short distinct speech and ensure no unsourced copyrighted voice imitation.

**Social priority:** native Spawn player presence/chat/parties first; later friends integration where available, party invites, group health frames, basic roles, guilds, raid groups, and communal events. A guild roster or cross-server chat is not assumed present until verified.

**Dungeon rules:** self-contained place / instance, checkpoint, trash mobs, boss telegraphs, restart or reset, party loot rule, death/respawn, rejoin and save testing. First benchmark is a clean 2-player dungeon; expand party cap only after tests.

## 9. UI/UX blueprint
**Visual target:** Dark charcoal tinted glass mixed with restrained parchment and aged brass. Clean, modern readability over elaborate decorative framing. All icons, artwork and type treatments original.

**Screen layout for desktop (16:9):**
```
+-------------------------------------------------------------------------+
| PLAYER portrait / HP MP       Zone: Briarwild                 MINIMAP    |
| Target: Briar Wolf  [HP]                       Quest tracker    (top R) |
|                                                                         |
|                       THIRD-PERSON WORLD                               |
|                          [target name]                                  |
|                                                                         |
|  CHAT / SYSTEM                                FLOATING DAMAGE/LOOT      |
|                                                                         |
|               [1][2][3][4][5][6][7][8]  [HP] [MANA]                    |
| [Social] [Journal] [Map]  XP BAR   [Bag] [Character] [Skills] [Menu]   |
+-------------------------------------------------------------------------+
```
**UI views:** HUD; journal and tracking; inventory; equipment and character stats; skills page with progress and unlock previews; world/area map; bank and vendor; crafting station; settings/accessibility; death/respawn; party frame; dungeon summary; game guide.

**Interaction polish:** consistent draggable vs click interactions; icon hover tooltips; numerical cooldowns; color-blind-friendly shapes and text; quest markers at sensible distances; button prompts matching the active input device; adjustable UI scale; reduced effects mode; remappable keys if Spawn implementation allows.

**Mobile later:** camera swipe, movement joystick, 4–6 context-based action buttons, compact party bars, tabbed inventory and skills; keep touch targets large. Do not shrink the entire desktop HUD to a phone.

## 10. Technical architecture — Spawn-aligned
- Use **places** for substantial separated areas and **instances** for private dungeon copies; portals when needed. Treat crossing of items, quest flags and parties as explicit test scenarios.
- Source-control game in Spawn 6 Git. External code agent reads exact `AGENTS.md`, Tome API reference at `/api/sdk/v1/<worldId>/agent/docs` and relevant skills before any code edit. Ask Savi to maintain separate supported game files for items, quests, creatures, progression, UI and input, avoiding a single impossible-to-maintain script.
- Store item definitions and quest definitions as data registries if supported. Centralize XP thresholds, item costs, combat formulas, vendor stock and loot tables for tunability.
- Keep player-specific progress distinct from shared world changes. Durable transactions and game economy should use supported authority/persistence features, never blindly trust a client-side UI action.
- Preload near visible regions only, reduce drawn distant props, reuse materials, moderate particle emissions, profile busy village scenes and nearby mobs. Target stable 60 fps desktop where practical and responsive play on supported phones, but measure rather than assume.
- Use Spawn logs, game history, read-only agent inspection tools and actual in-game tests. Set a performance budget and error checklist before expanding.
- Support meaningful publish milestones and rollback; write change summaries that refer to player-facing changes.
- Maintain `GAME_BIBLE.md`, `FEATURE_BACKLOG.md`, `ITEMS.md`, `QUESTS.md`, `ART_BIBLE.md`, `TEST_PLAN.md` in the project when compatible with Spawn's Git layout; avoid corrupting required engine files.

## 11. Roadmap — gates, tasks, and acceptance
### Phase 0 — Direction and technical spike
- Confirm Spawn 6 world is fresh and editable. Record original name, camera, art style, first region and MVP player journey.
- Test one NPC interaction, enemy, gatherable object, HUD panel, and saved coin/item. Run a 2-player join-and-rejoin test.
- **Gate:** two people can walk and interact without major desync; one reward is retained after leaving and returning.

### Phase 1 — Vertical slice / first 20 minutes
- Build Lantern's Reach, Briarwild and Quarry paths as playable low-cost terrain, and place NPCs, props, enemies and workstations.
- Add third-person controls, core HUD, three disciplines, hotbar, mobs, one boss, inventory, quests, XP and 2 crafting chains.
- **Gate:** from fresh spawn to quest, combat, crafted upgrade, mini-boss and rejoin persistence in approximately 20–30 minutes.

### Phase 2 — RPG depth
- Skill page, character sheet, gear comparison, bank, vendor, rarity, progression unlocks, fishing/cooking and Alchemy when stable.
- **Gate:** a player can pursue combat or a profession for a full session with clear rewards and no item loss.

### Phase 3 — Cooperative multiplayer
- Party invitations, group UI, friendly player names, individual loot, co-op quests, disconnected-player handling, basic social actions.
- **Gate:** 2–4 users complete a shared encounter and retain rewards independently; no duplicated loot.

### Phase 4 — Dungeon and bosses
- Build Hollowcrypt as a separate place/instance, checkpoints, boss states, loot table, dungeon completion summary.
- **Gate:** two independent parties enter separate instances without unwanted interaction; revisit/restart reliably.

### Phase 5 — Broader world and content
- Open Sorrowfen, introduce new enemies, linked story quests, factions and map, optional PvP arena. Add shortcuts and new skill recipes.
- **Gate:** every new area has its own reason to visit and at least one repeatable economic loop.

### Phase 6 — Economy and live quality
- Evaluate player trading only if secure persistence and transactional tests succeed; otherwise keep player commerce to NPCs. Add onboarding, UI scale, audio mix, performance presets, mobile layout and accessibility.
- **Gate:** a small invite-only cohort can play over multiple sessions without major progression loss, performance regression or economy exploits.

### Phase 7 — Public beta and expansion
- Publish after save/data, concurrency and rollback scenarios have been tested. Track retention, crashes, quest completion and performance.
- Add world events, guilds, housing and high-level raids iteratively based on what players actually enjoy; don't introduce monetization until current Spawn feature availability and terms are confirmed.

**Suggested launch priority:** A playable 20-minute prototype > 60-minute polished game loop > co-op dungeon > persistent economy > full MMO scale. Time estimates depend heavily on Savi output quality, asset review, tests, and project iteration; these are gates rather than guaranteed deadlines.

## 12. Immediate Sprint Backlog — Savi issue cards
1. Create new third-person 3D fantasy multiplayer world and one clearly visible player character with appropriate animations.
2. Make a compact, believable town called Lantern's Reach with a castle silhouette and sensible streets.
3. Add one forest trail, one quarry trail, traversal obstacles, two route shortcuts, and signposts.
4. Implement camera, WASD, sprint, jump, interact and HUD with minimap placeholder and health bar.
5. NPC dialogue and first quest: talk → kill 3 wolves → return → unique completion reward.
6. Add enemy spawn, patrol, aggro/leash, damage, death and reappearance.
7. Add one profession: copper ore node → mining XP → inventory ore → smithing station → bronze blade (placeholder progression tuning).
8. Add equip slot, tooltips and hotbar; make stats visibly alter an attack.
9. Test two accounts together and verify both can complete quests independently.
10. Test inventory, quest progress, XP and currency after leave/rejoin.
11. Fix the highest-impact playability errors, then polish world lighting and art.
12. Only then introduce party mini-boss and first dungeon entrance.

## 13. QA and exploit test matrix
- New player / returning player / same player on two clients where allowed.
- Two players gather same resource simultaneously; correct node state and reward rules.
- Client loses connection as loot is awarded; no double reward on reconnect.
- Quest completion sent twice; quest reward issued once.
- Vendor purchase with insufficient coins, full inventory, disconnect mid-purchase.
- Enter dungeon while in party; player leaves; player rejoins; second independent party enters.
- UI at 1920×1080, 1366×768, and narrow mobile viewport; buttons remain clickable.
- Twenty enemies in a region, eight nearby players in hub: measure fps/tick and response under an **aspirational test scenario**, not a verified Spawn concurrency limit.
- Behavior on mobile/slow connection, line-of-sight combat, pathing around fences, restoring player position after logout.
- No use of copied characters, models, class/skill artwork, sounds, UI assets, or maps from inspiration games.

## 14. Prompts and collaboration rules
**First prompt to Savi:** Use the separate `Spawn_Savi_First_Build_Prompt.txt` file. Paste it into a NEW Spawn 6 game.

**How to continue:** Ask Savi for one player-testable system per iteration. After each build: play; note three concrete issues; have Savi fix them; record the changes in the game spec / project notes; do not regenerate or overwrite working systems unnecessarily.

**If Codex joins:** Use the target world's `/code` page to grant authorized access. The agent should inspect the real repo and docs, plan file-level changes, commit one coherent feature at a time, and test by joining the world. Never attempt undocumented Spawn API calls or introduce a new engine/server by habit.

**Guardrail:** 'Never replace functioning features, NPC quests, HUD, saves, terrain, or assets without confirming exact requested scope. Preserve backward compatibility with saved player state wherever feasible. When unsure, first inspect and report.'

## 15. Source notes and intellectual property
These games and artworks are references for mechanics and broad visual language, not reusable assets. Build all shipped content as original IP. Details from Spawn's public docs are subject to platform changes. Sources: https://www.spawn.co/llms.txt ; https://www.spawn.co/about ; https://www.spawn.co/about/bring-a-game .
