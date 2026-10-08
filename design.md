# WHISPERS : Realm of the Nine — build page
The full bible lives in scripts/lib/data/01–05 *.md and the backlog/QA csvs (the creator's). This page tracks what stands.

## Stage 1 (now): the place
- main = the Lantern March. Lantern's Reach at origin (y 4): cobbled Lantern Square + well, inn (N, z −24), smithy (E), merchant + stall (W), bank (SW), quest board, 5 cottages, lamplit lanes.
- Briarwild west (centre −130,−30): pine/oak forest, 8 gatherable timber oaks (tag timber), river at x≈−50 crossed by a timber footbridge.
- Emberstone Quarry east (centre 135,30): red-rock hill with a carved pit + ramp, 6 copper veins (tag copper), boulders, cart, lamp.
- Far cathedral spire north (30,−360) as the sightline landmark.
- Entry: mmorpg-tools menu (main-menu-land) → character creation → main.

## Next stages (one at a time, tested before the next)
2. third-person camera/controls check + placeholder HUD (hp, coins, objective, hotbar slots)
3. interact + NPC dialogue (Gatekeeper Elric, Mira, Dren, Bram) + quest Q001/Q002
4. wolves: aggro, leash, death, respawn, combat hotbar
5. gather timber/copper → inventory → forge craft → persistence on rejoin
6. two-player test

## Decisions
- 2026-10-08: map follows the creator's bible (Briarwild W, quarry E), set after their docs landed.

- 2026-10-08: from @whispers reference photos (village w/ windmill, crop plots, fenced dirt lanes): Windmill Farm added south-west of the square (-30,50), fenced wheat/cabbage/carrot beds, hay, scarecrow, dry-stone walls, lane from the south lane. Original art, inspired only.

## The Lantern March continent (2026-10-08)
Creator asked for the world as big as it can be, room for story. The main place is now a continent ~6.4 km across, ringed by the Shrouded Sea.
Lantern's Reach stays at the centre untouched. Regions (table in scripts/lib/regions.js, HUD names them over the minimap):
Greyspine Mountains (north, snow peaks ~110 m, north pass road), Emberstone Highlands (east, stepped red mesas, highland road),
Hollowcrypt Vale (NE sunken blighted bowl, ruined chapel spire: future dungeon hook), Briarwild Deepwood (west forested hills),
Sorrowfen (SW marsh at sea level, drowned trees), Saltmere Coast (south bay, future harbor town), the river runs north mountains → town → south sea.
Regions are ground, roads and landmarks only: no NPCs, quests or enemies there yet. Next story beats pick one region at a time.

- 2026-10-08: creator's nature kit (OBJ pines, twisted trees, rocks, path stones, plants, grasses, petals, mushrooms + their bark/leaf/rock textures) converted to GLB and placed: Briarwild gets 5 crimson twisted trees on the road, 110 kit pines, undergrowth, boulders, stepping stones off the road's end; meadows of petals/short grass ring the Reach (r 62–95) and the farm. Procedural trees wear the creator's bark textures.
- 2026-10-08: "follow the roadmap": next stages SP-007/SP-008 in flight — Briar Wolves (scripts/wolves.js, den at -92,-40) and Gatekeeper Elric's Q002 (3 wolves + 5 logs, 25 coins + 150 XP, claim once) with woodcutting on the timber oaks.

- 2026-10-08: creator: "expand the world size even further". Continent grows from ~6.4 km to ~12 km east-west and ~8 km north of town (scripts/terrain-reach.js COAST/coastD; south coast + Saltmere bay kept, SW/SE lobes added). Three new frontiers: Frostveil Tundra (z < −3000, high cold plain, snow, landmark ~(−40,−3800)), Sunscar Expanse (x > 3000, dunes on the creator's desert-rock texture, oasis ~(3800,−180)), Elderveil Wilds (x < −3000, ancient high forest, giant tree ~(−3600,−60)). New roads road-frostveil / road-sunscar / road-elderveil. HUD + regions.js name them.
- 2026-10-08: bible landmarks going in: Reach east gate, stable, watchtower + six townsfolk (Mira, Dren, Bram, Tamsin, Sister Vale, Rowan; talk only, no quests yet); Briarwild shrine/lore, hidden chest, fishing pool (dressing), glowing mushroom rings, fallen-log shortcut; quarry crane, rail cart, camp, cave with 2 more copper veins, miner's journal.
- 2026-10-08: UI dressed in the creator's Kenney-style frame kit, tinted brass: quest dialogs, action slots, spell tooltips, accept/turn-in plates, region-entry banner with fading sword dividers.
- 2026-10-08: creator asked for the full MMO front door: main menu, pause menu, settings, character create/select, a realm (server) roster, races with their own starting zones, classes, level 1 start, live database saves of inventory, and a copper/silver/gold economy. Built as: realms = rooms of this world (scripts/lib/data/realms.yml, scripts/routing.js), characters saved per realm in SQL (scripts/db.js `characters`), money one copper integer (lib/currency.js, 100c = 1s, 100s = 1g), every coin movement in `ledger`. Races/zones/classes in scripts/lib/data/races.yml: Marchborn → Lantern's Reach, Briarkin → Thornhollow (Deepwood), Emberforged → Cinderhold (Highlands), Saltborn → Gullrest (Saltmere); classes Vanguard, Arcanist, Pathfinder from the bible.
- 2026-10-08: loading screens declined: Spawn streams the world, a loading screen would only stand in front of it. The main menu stays (creator's call).

- 2026-10-08: version tag (mods/mmorpg-tools/mod-mmorpg/lib/version.js, GAME_VERSION) shows on main menu, settings and pause only. @whispers: "update the version number at the bottom on every update". Every landed update bumps the patch number (0.7.1 → 0.7.2…); a big milestone bumps the minor.

- 2026-10-08: every join, rejoin, realm link or portal lands on the realm gate main menu (was: a rejoin landed where you last stood). Only Enter World and Create step past it. @whispers: "anyone and everyone who joins from any part loads into the starting main menu every time". Code: scripts/arrival.js.

- 2026-10-08: continent grown to ~19 km east-west and ~9 km north. New frontiers: The Ninth Veil (z < -6400, violet crystal plateau, Veilgate Aerie at 30,-7560) and Ashfall Reaches (x > 6400, black volcanic shelves, Emberstone Bastion at 7560,-170), each reached by a graded road (road-ninthveil from Frostveil, road-bastion from Sunscar). Gryphon roosts (scripts/lib/data/flights.yml, 11 of them): walking within 22 m learns a roost (saved per character as roosts), E at a roost opens the flight map, fare 0.25 copper per 100 m, a flight lasts 18-80 s. Asked for "fly to each area in the select few way like world of warcraft".

## 2026-10-08 · Marchfolk origin slice (#14489)
- Marchborn (raceIndex 0) now wake in Lantern Ward, a walled quarter north of the Reach (centre 0,-100), gate at z -71.
- MAR-01..MAR-08 live in scripts/lib/data/quests.yml with their bible IDs; givers follow the bible (Elric, Dren, Bram, Vale, Mira).
- Q001 carries `origin: { race: 0, quest: MAR-08 }`: Marchborn walk the origin first; other peoples and saves already past Q001 are unchanged.
- Item rewards pay after the completed flag (once); a full bag keeps them in owedItems. marks, questFlags, owedItems now save with the character.
- MAR-08's choice (display vs archive the plaque) is a personal questFlag, never shared world state.

- 2026-10-08: Thren origin THR-01..08 built in Rootwake Glade around Thornhollow (-720,70) for Briarkin (raceIndex 1), from the campaign bible. Origin chains are now race-locked (quest `race:` field): MAR-* Marchborn only, THR-* Briarkin only. Q001 waits on MAR-08 for Marchborn and THR-08 for Briarkin; other peoples start at Q001. Wolf dens may carry their own pack and tally key (THR-03 bramble_beast).
- 2026-10-08: Kharic origin KHA-01..08 (campaign bible) stands at Cinderhold as the Emberstone Cradle, race 2 (Emberforged) only; Q001's origin gate now waits on KHA-08 for Emberforged. Givers: Yurra Flint-Eye, Foreman Kiv, Dren, Mira (cradle-npc-*). KHA-06 uses a second scavenger camp (kha-scav-camp, tallyKey tunnel_scavenger). Synthetic chain harness passes; not yet played live.
- 2026-10-08: Namar origin NAM-01..08 stands at Gullrest (Breakwater Strand), race 3 (Saltborn) only; Q001 now waits on NAM-08 for Saltborn, so every playable people has its origin. Givers Sena (pier head), Ruun (chart table), Sari (net racks); NAM-06 fight is the phantom-current camp (scavengers.js with camp name/model/look); NAM-08 hands in to Rowan at the Reach dock. THR-08 and KHA-08 now hand in to Gatekeeper Elric at the Reach instead of sending heroes back to their origin. Synthetic chain harness passes for all four origins; not yet played live.
- 2026-10-08: Vanguard path VAN-01..07 stands at the Shield Table (x28 z18, east of the Reach training yard), gated by a new quest field `cls` (className, lowercased) and requires Q001. Guard (3) beside a `shield-drill` pell or trial stone counts the drill tally (scripts/vanguard.js drill()). VAN-03/06 sites and the bridge-raider camp sit on the briar bridge's far bank (x -70..-83). Arcanist ARC and Pathfinder PAT paths are next in the same shape; Shade has no class yet. Synthetic harness passes; not yet played live.
- 2026-10-08: Arcanist path ARC-01..07 at the Quiet Observatory (tower x-24 z-40, NW of the Reach above the river), cls arcanist, requires Q001; Vale / Leth Sen / Ossa. Ward (3) beside an `arcane-drill` thing (forge, plinths) counts via shared scripts/lib/kit.js drill(), which Vanguard's guard now uses too. ARC-03 consent asks sit beside Mira, Bram, Rowan. Synthetic harness passes; not played live. Pathfinder next; Shade class not built.
- 2026-10-08: Pathfinder path PAT-01..07 at the Wayfarers' Lodge (x-33 z88, river meadow south of the farms), cls pathfinder, requires Q001; Tamsin / Rowan / Bram / Iona Sedge. Dodge Roll (3) beside a `trail-drill` post counts. All three class paths now stand; synthetic harness passes each, gated by class; none played live. Creator said yes-pending to building the 6 peoples + Shade themselves (2026-10-08). quests.yml (72 KB) now pushes character-creation arrival to 608 KB: split per-chain data on first need next.
- 2026-10-08 · (superseded by the live run below) Marchborn slice report (#14489), bench-level: synthetic chain MAR-01..08 → Q001..08 offers in order (no early Q001); every objective of MAR/Q00x/VAN/ARC/PAT has enough world sources in place (169 marks/drills + 4 camps + wolf den/woodcutting/Reach-entry tallies), every giver/turn-in NPC exists. Rewards: completed flag lands before pay (code read), bag-full rewards owed in owedItems. NOT yet: a live player run of the chain, reconnect mid-quest, two players at once. Blocker: arrival 608 KB at character creation (quests.yml 72 KB loaded at boot); a lazy import() probe gave no answer, so the quest book stays static until proven.

## 2026-10-08 · #14489 live test report: MAR-01..08 → Q001..Q008 (16/16 pass)
Run on Savi's own test body in the dev room (not the creator's character): race forced to Marchborn, quest state cleared, then every quest
accepted at its real giver with E, every objective earned at its real world source with E (marks, timber oaks, ore veins), turned in at its real taker.
- 16/16 completed in order; no quest offered early; Q001 waited on MAR-08.
- Each turn-in pressed twice: paid once every time (idempotent rewards).
- Q002 wolves and Q006 quarry scavengers: kill credited by the den/camp's own die() (default keys briar_wolf / quarry_scavenger; the
  bramble_beast / tunnel_scavenger dens are THR-03 / KHA-06 only, no mismatch). The blow itself was written as a class hit would write it,
  so combat feel was not part of this run. Movement between sources was by teleport, not walking.
- Reconnect: body left the room and rejoined → main menu → Continue: all 16 completed quests and the 10,964 copper purse came back.
- Not tested yet: leaving mid-quest with partial progress, a full bag, two players at once, walking the route on foot.
- Gate status: the 16-quest proof passes at this level. Other origins/dungeons may proceed in small stages.

## 2026-10-08 · Emberstone Quarry chapter, EQU-01..09 (campaign bible, lv 12–17)
Follows Q008. Givers: Mira, Yurra and Kiv (now standing at the quarry camp: quarry-npc-yurra, quarry-npc-kiv), Dren, Tamsin, Vale, Elric. Marks are all in the quarry pit around (140, 3, 28) except the bellglass smelt at Mira's forge. New set pieces in scripts/gen/quarryworks.js: crystal veins, survey stake, lift brakes, drill rig, tuning hammers, east shaft door. EQU-07's drill crew is a scavengers.js camp (equ-drill-camp, tallyKey drill_crew) on the south rim.
Bench test (builder body, driver): all nine accepted, progressed and turned in in order. Marks were pressed with E after moving the body beside them (teleport moves, not walking); the three drill-crew kills were state writes, not class combat. Fixes found by the run: Kiv's tally board moved clear of Kiv (E talked to him instead); the shaft door was buried in the pit wall, now set at its foot. DHC-01 (Hollowcrypt) is next and needs the dungeon itself; not built.
Correction to the earlier MAR/Q00x live report: Q002/Q006 kills were state writes and MAR-08's reach visit was a teleport; after reconnect the test body read raceIndex 1, not the 0 it was set to: open.

## 2026-10-08 · The Hollowcrypt (DHC-01..04), v0.19.0 Alpha
- Place `hollowcrypt`: a mausoleum in Hollowcrypt Vale (main 1322,-688) leads down to the vestibule (Sister Vale, Gatekeeper Elric, 3 unclaimed candles), the ribbed hall, the inked archive (4 Inkbound Archivists, 2 census strips, 2 echo testimonies), and the Warden's chamber (3 sigil stones, index stone, the Candle Warden: 900 hp, telegraphed flame sweep).
- DHC-01 needs Q008 + EQU-09 (from quest_database_300.json). Sister Vale in the Reach gives it; DHC-04 is turned in to her there. The index stone only takes the command after both echoes are released.
- New rule, a core-loop fix: health 0 now means falling (screen dims, 2.5 s, no input), then rising where you last stood safe at 50% health. Health mends 3% a second after 8 s unhurt. Before this, a player at 0 stayed stuck forever (scripts/vitality.js).
- Test (Savi's builder body, 2026-10-08): DHC-01→04 completed in order. Entry and exit went through the real gates. Each turn-in pressed twice and paid once: 4200 / 4600 / 9000 / 6000 copper. The archivist and Warden kills were written to state, not fought with class combat. The sweeps were dodged by teleport kiting, and the lowest hp was 65/1000. Fall and rise were checked: 0 → 500 in the vestibule → mending. Not tested: real class combat against the Warden, two players sharing the boss, reconnecting mid-dungeon.

## 2026-10-08 · Sorrowfen act one (SOR-01..04)
After DHC-04, Sorrowfen opens: a stilt-boardwalk village at Mourner Pool (-1240, 850), reached on foot from Sorrowfen Stilts roost (-1170, 760).
Pools are nine small lake marks (level 0.42); mud grows reeds + sedge. Sites follow map_topology Sorrowfen nodes: Raised Entry (roost ramp), Mourner Pool (hub: Pell, Kele, Iona, Vale, Wenna), Sunken Boat (-1303, 804), Blue Wisp Marsh deck (-1318, 894) with 3 tether-spirits (scavengers.js crew, tally tether_spirit), Shrine Isle (-1402, 836).
SOR-01 4 ward lanterns + 3 evac stakes · SOR-02 3 gentle wisps + 2 tether-spirits · SOR-03 Wenna then 4 reflected footsteps (gated after) · SOR-04 2 chimes then the shrine basin (gated after).
Untested so far: no on-foot run, no real combat against tether-spirits, no journal or reconnect check. SOR-05..09 still to build.
2026-10-08 · Sorrowfen act two (SOR-05..09): Orla's grounded skiff (-1360, 925), drowned chapel (-1298, 945) on a south boardwalk from the wisp deck, three unmarked stones, Mirelurker elite (hp 900, hit 140, scale 1.9, 300 xp) in the pool at (-1265, 902) via scavengers.js camp overrides (hp, damage, scale, reward now per camp), Eda's echo on Mourner Pool, Tamsin at the fen hub. SOR-09 carries out to the Reach: Shield Table + witnesses Corbin and Ada, turn-in to reach-npc-vale. Untested: no on-foot run, no real fight with the Mirelurker, no journal/reconnect check.
