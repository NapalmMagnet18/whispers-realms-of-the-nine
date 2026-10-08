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
