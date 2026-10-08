// Codex — Build Order. The phase plan the left rail is generated from.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "buildorder-1",
    "title": "Foundation and front door",
    "body": "Bible Phase 0 plus the creator's front-door ask. Built: hero, WoW camera, menus, realms, races, classes, SQL saves, copper currency. Open: realm routing and the two-player and rejoin proofs.\n\nChecklist:\n- Third-person hero with humanoid locomotion, walk, sprint, jump\n- WoW-style camera controls (orbit, steer, zoom, auto-run)\n- Main menu, pause menu, settings, character create and select (mmorpg-tools)\n- Realm roster: six realms as rooms of this world (realms.yml)\n- Races and classes data with starting zones (races.yml)\n- Characters saved per realm in SQL (characters table), every coin in the ledger\n- Money as one copper integer: 100c = 1s, 100s = 1g\n- No loading screen; the world streams\n- Realm routing wired so picking a realm lands the hero in that room\n- Two clients join one realm and see each other move (QA-002)\n- A coin reward survives leave and rejoin exactly once (SP-004, QA-003)"
  },
  {
    "id": "buildorder-2",
    "title": "The Lantern March: hub, Briarwild, quarry and the continent",
    "body": "Bible Phase 1's ground (SP-005, SP-006) and the continent expansions. The land stands; the six townsfolk are still to stand.\n\nChecklist:\n- Lantern's Reach hub: square, well, inn, smithy, merchant, bank, quest board, cottages, lanes\n- Briarwild forest, river and footbridge, eight timber oaks\n- Emberstone Quarry: pit, ramp, copper veins, cart, lamp\n- Windmill Farm south-west of the square\n- Continent ~12 km with regions table and HUD region names\n- Frostveil Tundra, Sunscar Expanse, Elderveil Wilds ground and roads\n- Creator's nature kit placed in Briarwild and around the Reach\n- Bible landmarks: east gate, stable, watchtower; shrine, chest, fishing pool, mushroom rings; quarry crane, cart, camp, cave, journal\n- Brass Kenney-style UI frames for dialogs, slots, tooltips, region banner\n- Six townsfolk standing and talkable (Mira, Dren, Bram, Tamsin, Sister Vale, Rowan)"
  },
  {
    "id": "buildorder-3",
    "title": "Starting areas: the four race starting zones and the roads between them",
    "body": "Each race wakes in its own place. Four starting zones, each with a greeter quest, a landmark, a resource loop and a waystone road to Lantern's Reach, dressed with licence-checked free assets and the creator's kits. Parallel lanes: one wisp per zone, one for roads.\n\nChecklist:\n- Lantern's Reach polish: Marchborn spawn outside the inn, first NPC visible within 15 s, lanes and services readable\n- Thornhollow (Briarkin, −720, 70): root-house hamlet in the Deepwood with a landmark, a resource loop and a secret\n- Cinderhold (Emberforged, 900, −170): mesa forge-hold on the highland road with ore and forge glow\n- Gullrest (Saltborn, 250, 1430): harbour hamlet on the Saltmere bay with piers, boats, a lighthouse and a fishing spot\n- Waystone roads linking each starting zone to Lantern's Reach, signposted, with a waystone at each end\n- A greeter NPC and one greeter quest per zone (claim once, same quest system as Q002)\n- Dress each zone with free, licence-checked assets (CC0) plus the creator's kits; record every source\n- Each race spawns at its own zone on a fresh level-1 character (test all four)\n- Region names and entry banners for Thornhollow, Cinderhold and Gullrest"
  },
  {
    "id": "buildorder-4",
    "title": "First quest loop: Elric, wolves, timber and the Vanguard",
    "body": "SP-007, SP-008, SP-009: the first quest loop end to end. Most of it is saved in the world and recorded as in flight; it is checked when played.\n\nChecklist:\n- Briar Wolf pack: six wolves at the den with aggro, leash, bite, death and respawn (saved in the world; design.md: in flight)\n- Q002 A Light Against the Briars: 3 wolves + 5 logs, 25 coin + 150 XP, claim once (saved; in flight)\n- Woodcutting on the eight timber oaks: 2.5 s per log, 3 logs per tree, 30 s regrow (saved; in flight)\n- Vanguard hotbar 1–3: Strike, Heavy Strike, Guard, with training dummies\n- Q001 Welcome to Lantern's Reach: talk to Elric, training blade and coin\n- Placeholder HUD: hp, coins, objective, hotbar slots legible at 1366x768 (SP-009)\n- Quest tracker shows counts and survives reconnect"
  },
  {
    "id": "buildorder-5",
    "title": "Gate 0: proof of persistence and two players",
    "body": "Gate 0 from doc 05: no further region polish ships as done until these QA tests pass.\n\nChecklist:\n- QA-001 fresh player moves and interacts\n- QA-002 two accounts see each other\n- QA-003 XP, coin and items remain after rejoin\n- QA-004 rapid double reward grants once\n- QA-008 attacks obey range and walls; QA-009 leash returns wolves home\n- QA-010 two players chop one oak by a defined rule\n- QA-013 an update doesn't reset older saves"
  },
  {
    "id": "buildorder-6",
    "title": "Crafting loops and professions",
    "body": "Bible Phase 1–2: two gathering-to-crafting loops (mine → smelt → smith; fish → cook → eat), Q003–Q005, items, bag, equipment, skills.\n\nChecklist:\n- Copper mining: E on a vein, ore and Mining XP\n- Furnace and forge: ore → ingot → forged blade with Mira; Q003 The First Forge\n- Fishing at the river pool and Gullrest; Q004 The Old River with Rowan\n- Cooking at a campfire or inn stove; eating heals with a cooldown\n- Q005 Supply the Watch: deliver timber to Bram\n- Item registry with stable ids; 24- or 30-slot bag with overflow refusal\n- Equipment slots (weapon, torso, boots, offhand) changing real damage\n- Skills page (F1) with independent profession XP"
  },
  {
    "id": "buildorder-7",
    "title": "Three disciplines and character depth",
    "body": "Bible Phase 2: the other two disciplines, character sheet, vendor and bank.\n\nChecklist:\n- Arcanist: mana and three starter spells\n- Pathfinder: ranged attacks, roll and a third skill\n- Character sheet (K) with stats and gear comparison\n- Quartermaster Dren's shop and the bank, priced in copper/silver/gold, failing whole\n- Level-ups with a sound and an unlock"
  },
  {
    "id": "buildorder-8",
    "title": "Cooperative play",
    "body": "Bible Phase 3: parties, a mini-boss, Q006–Q007.\n\nChecklist:\n- Party invites and group frames where Spawn supports them\n- Quarry Scavengers and Q006 Echoes at the Quarry\n- A mini-boss two players defeat with individual rewards\n- Q007 Broken Sigil: three ancient stones, relic fragment\n- 2–4 players finish a shared encounter without duplicated loot"
  },
  {
    "id": "buildorder-9",
    "title": "The Hollowcrypt dungeon",
    "body": "Bible Phase 4: the Hollowcrypt as a separate copy per party, the Candle Warden, Q008.\n\nChecklist:\n- Q008 The Hollowcrypt Gate: inspect the seal, dungeon access flag\n- Hollowcrypt as its own place, one copy per party\n- Candle Warden: sweep, delayed circle, summon phase, readable telegraphs\n- Checkpoint, reset and a safe return to Lantern's Reach\n- Two parties cannot see or affect each other's dungeon (QA-011)"
  },
  {
    "id": "buildorder-10",
    "title": "Broader world: Sorrowfen and the frontiers",
    "body": "Bible Phase 5: Sorrowfen, factions, and reasons to visit the far frontiers.\n\nChecklist:\n- Sorrowfen: boardwalks, ruins, harder enemies, rare reagents, return shortcut\n- Faction questline: Beacon Guild, Veilbound, Hollow Court\n- A reason to visit Greyspine, Frostveil, Sunscar and Elderveil: an enemy loop and a resource loop each\n- Optional PvP arena and Hollowmere duel rules, if wanted"
  },
  {
    "id": "buildorder-11",
    "title": "Economy safety and live quality",
    "body": "Bible Phase 6: economy safety, accessibility, performance, mobile.\n\nChecklist:\n- Exploit regression suite: quest, vendor and crafting duplicates absent (SP-023)\n- Secure two-party trade only if atomic exchange is proven\n- UI scale, reduced effects, audio mix, performance presets\n- Phone layout with large touch targets\n- Performance profile in a busy hub and a mob fight (SP-022)"
  },
  {
    "id": "buildorder-12",
    "title": "Public beta",
    "body": "Bible Phase 7: publish after save, concurrency and rollback tests pass.\n\nChecklist:\n- Release checklist from doc 05 all passed\n- Invite cohort plays repeat sessions without save corruption\n- Publish description matches what is built"
  }
];
