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
