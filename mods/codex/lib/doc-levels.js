// Codex — Level Design. Places, layouts, flow, encounters, landmarks.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "levels-1",
    "title": "The continent at a glance",
    "body": "The Lantern March, ~12 km east-west, ~8 km north of town, ringed by the Shrouded Sea. Lantern's Reach at the origin (ground y ≈ 4). Regions resolve in order from regions.js: sea, Lantern's Reach (r 70), Windmill Farm (r 26), Emberstone Quarry (r 80), The Old Spire (r 90), Hollowcrypt Vale (r 330), Sorrowfen (r 520), Saltmere Coast (r 420), Frostveil Tundra (z < −3000), Sunscar Expanse (x > 3000), Elderveil Wilds (x < −3000), Greyspine Mountains (z < −800), Emberstone Highlands (x > 650), Briarwild Deepwood (x < −500), Briarwild (x −60 to −500, |z| < 420).\n\nRules: every zone has a landmark, sightlines point to the next destination, vertical routes reward exploring, safe respawn and travel points cut dead running, and no one gets trapped by unclear geometry."
  },
  {
    "id": "levels-2",
    "title": "Lantern's Reach (Marchborn start)",
    "body": "Starter city at (0, 0). Cobbled Lantern Square with well, inn (north, z −24), smithy (east), merchant and stall (west), bank (south-west), quest board, five cottages, lamplit lanes, armory and training yard with three dummies, east gate, stable, watchtower. Spawn outside the inn with the square in view; the first NPC is found in under 15 seconds. Beats: a hammering smith, chickens by a fence, overheard rumours, fireflies after dusk, river water, a distant bell. Build order per the bible: blockout → navigation → services → dressing → lighting → sound → performance."
  },
  {
    "id": "levels-3",
    "title": "Windmill Farm",
    "body": "South-west of the square at (−18, 52): windmill with turning sails, fenced wheat, cabbage and carrot beds, hay, scarecrow, dry-stone walls, a lane from the south of town; petal and short-grass meadows ring the Reach (r 62–95)."
  },
  {
    "id": "levels-4",
    "title": "Briarwild",
    "body": "Starter forest west, centred (−130, −30). Oak, birch and pine, the river at x ≈ −50 crossed by a timber footbridge, eight timber oaks, the wolf den (−92, −40), five crimson twisted trees on the road, shrine with a lore fragment, hidden chest, fishing pool, glowing mushroom rings, fallen-log shortcut. Warm greens near town, dim cyan in the ancient grove. Routes: signposted road, riverside path, the shortcut unlocked by a quest. Foliage must never hide a telegraph or a prompt."
  },
  {
    "id": "levels-5",
    "title": "Emberstone Quarry",
    "body": "East, centred (135, 30). Red-rock hill with a carved pit and ramp, six copper veins plus two in the cave, crane, rail cart, smith's camp, boulders, lamp, miner's journal. Routes: outer switchbacks, cave loop, a lift shortcut later (no fake shafts). Discovery: a guarded ore pocket and an overlook of the town. Enemy: Quarry Scavengers."
  },
  {
    "id": "levels-6",
    "title": "The Old Spire",
    "body": "Far cathedral spire north at (30, −360), the March's first sightline landmark."
  },
  {
    "id": "levels-7",
    "title": "Thornhollow (Briarkin start)",
    "body": "Starting zone in the Briarwild Deepwood at (−720, 70); a start marker stands, nothing else yet. Proposed shape: a hamlet of root-houses and rope walks in a hollow among giant old trees, a greeter, a small resource loop (herbs, timber), a gentle enemy loop and a secret, and a signed road east through Briarwild to the Reach (~720 m)."
  },
  {
    "id": "levels-8",
    "title": "Cinderhold (Emberforged start)",
    "body": "Starting zone in the Emberstone Highlands at (900, −170); a start marker and the highlands waystone stand. Proposed shape: a forge-hold cut into a stepped red mesa, terraces, chimneys glowing, a greeter, an ore loop, and the highland road west past the quarry to the Reach (~900 m)."
  },
  {
    "id": "levels-9",
    "title": "Gullrest (Saltborn start)",
    "body": "Starting zone on the Saltmere Coast at (250, 1430); a start marker stands. Proposed shape: the \"future harbor town\" of the south bay, piers, net racks, boats, a lighthouse as landmark, a greeter, a fishing loop, and a road north along the river to the Reach (~1.45 km)."
  },
  {
    "id": "levels-10",
    "title": "Briarwild Deepwood",
    "body": "West forested hills, x < −500: older, darker woods beyond Briarwild. Home of Thornhollow."
  },
  {
    "id": "levels-11",
    "title": "Emberstone Highlands",
    "body": "East beyond x 650: stepped red mesas and the highland road. Home of Cinderhold."
  },
  {
    "id": "levels-12",
    "title": "Saltmere Coast",
    "body": "The south bay at (300, 1650), r 420: shore, river mouth, Gullrest."
  },
  {
    "id": "levels-13",
    "title": "Greyspine Mountains",
    "body": "North of z −800: snow peaks around 110 m, the north pass road, the river's source."
  },
  {
    "id": "levels-14",
    "title": "Hollowcrypt Vale",
    "body": "North-east at (1350, −700), r 330: a sunken, blighted bowl with a ruined chapel spire, the entrance to the Hollowcrypt dungeon (its own place, one copy per party)."
  },
  {
    "id": "levels-15",
    "title": "Sorrowfen",
    "body": "South-west marsh at (−1300, 950), r 520, at sea level: drowned trees, flooded cobbled roads, ruined mausoleums, pale fog, sickly lanterns. Harder enemies, rare reagents, an elite. Raised boardwalk, dry embankment, cellar connection and a return shortcut. Visible early as a mystery, opened after starter progression, with warnings before lethal enemies."
  },
  {
    "id": "levels-16",
    "title": "Frostveil Tundra",
    "body": "Far north, z < −3000: high cold plain under snow, landmark near (−40, −3800), reached by road-frostveil. Ground and road only."
  },
  {
    "id": "levels-17",
    "title": "Sunscar Expanse",
    "body": "Far east, x > 3000: dunes on the creator's desert-rock texture, an oasis near (3800, −180), reached by road-sunscar. Ground and road only."
  },
  {
    "id": "levels-18",
    "title": "Elderveil Wilds",
    "body": "Far west, x < −3000: ancient high forest with a giant tree near (−3600, −60), reached by road-elderveil. Ground and road only."
  },
  {
    "id": "levels-19",
    "title": "The Hollowcrypt (dungeon)",
    "body": "Its own place. Chapel threshold → catacomb corridor → collapsed ossuary → ritual chamber with the Candle Warden's platform. Modular vaulted ceilings, worn stairs, candlelit hall, broken sigils, restrained fog. Stage 1 is one room and the boss with a checkpoint and a clean exit to Lantern's Reach."
  }
];
