// Codex — Feature List. Every feature the game will have, one page per system.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "features-1",
    "title": "Front door: menu, realms, character creation",
    "body": "Entry is the main menu place (main-menu-land) → character creation (character-creation-land) → the Lantern March (main). The menu holds the realm roster, character select, settings and a pause menu. No loading screen anywhere: Spawn streams the world.\n\nCharacter creation picks name, race and class; every hero starts at level 1 with 0 copper (races.yml). Names are unique per realm (case-insensitive). Up to 6 characters per realm."
  },
  {
    "id": "features-2",
    "title": "Realms",
    "body": "A realm is a room of this world with its own world state, wolves, oaks and chat (realms.yml). Roster: Lantern's Rest (main, recommended), Emberfall, Greyspine Watch, Hollowmere (PvP: duel anywhere outside towns), Saltwind (RP: stay in character), The Nine Veils (Far Shores). 120 players per realm. A hero lives on one realm; characters are saved per realm. Each realm writes its population to realm_pulse once a minute for the roster list."
  },
  {
    "id": "features-3",
    "title": "Races and starting zones",
    "body": "Four playable races, each waking at level 1 in its own starting zone (races.yml): Marchborn → Lantern's Reach (0, 8); Briarkin → Thornhollow in the Briarwild Deepwood (−720, 70); Emberforged → Cinderhold in the Emberstone Highlands (900, −170); Saltborn → Gullrest on the Saltmere Coast (250, 1430). Each zone needs its own greeter, a first quest and a road to Lantern's Reach."
  },
  {
    "id": "features-4",
    "title": "Combat disciplines (classes)",
    "body": "Three disciplines from the bible: Vanguard (melee guardian), Arcanist (spellcaster), Pathfinder (ranged skirmisher); Warden (support/healer) later. One is chosen at creation; trainers will later allow switching so nobody is locked out for good.\n\nVanguard is playable now on hotbar 1–3 (vanguard.yml): Strike 8 dmg, 0.6 s cooldown, 2.6 m reach; Heavy Strike 22 dmg, 3.0 s cooldown, 3.0 m reach; Guard 4.0 s cooldown, 1.5 s long, 70% damage reduction; swings reach 75° either side of facing. Arcanist and Pathfinder are chosen at creation but have no abilities yet."
  },
  {
    "id": "features-5",
    "title": "Combat core",
    "body": "Hybrid modern MMO: soft tab-targeting with active movement, a 6–8 slot hotbar (keys 1–8), a basic attack, resource-cost skills, cooldowns and a dodge or guard. Range and line of sight stop hits through walls. Damage numbers are readable but sparse. Death in the MVP is a controlled respawn with no item loss.\n\nStarting tuning targets: starter enemy time-to-kill 6–12 s, basic attack cooldown 1.0–1.5 s, boss telegraphs 0.8–1.5 s before the hit. Attributes: health, stamina or mana, physical and spell power, armor, optional crit; every shown stat must visibly change play."
  },
  {
    "id": "features-6",
    "title": "Enemy AI",
    "body": "Every enemy runs idle/patrol → aggro → chase within its region → strike → cooldown → disengage/leash/reset → death → respawn, with loot ownership. A leash heals to full and resets state. Bosses have 2–3 moves and one avoidable area attack.\n\nBriar Wolves (wolves.yml): 60 hp, aggro 14 m, let go past 24 m, leash 30 m from home, walk 1.4 m/s, run 6.6 m/s, bite 45 damage after a 0.6 s windup, 1.5 s bite cooldown, corpse fades after 3 s. Six wolves at the den (−92, −40). Normal mob respawn target 30–60 s."
  },
  {
    "id": "features-7",
    "title": "Quests",
    "body": "Templates: short dialogue chain, kill/count, gather/return, interact/explore, delivery; escort and branching later. State machine: Unavailable → Available → Active → ObjectivesComplete → Rewarded. Per-character flags and counts; a reward pays exactly once, even across reconnects or a double click (the claim writes completedQuests first and refuses an id already there).\n\nThe first eight: Q001 Welcome to Lantern's Reach, Q002 A Light Against the Briars, Q003 The First Forge, Q004 The Old River, Q005 Supply the Watch, Q006 Echoes at the Quarry, Q007 Broken Sigil, Q008 The Hollowcrypt Gate. Q002 stands now: 3 Briar Wolves + 5 logs for Gatekeeper Elric, reward 25 coin and 150 XP. Each new starting zone adds one greeter quest."
  },
  {
    "id": "features-8",
    "title": "Gathering professions",
    "body": "Roster: Mining, Woodcutting, Fishing, Smithing, Cooking, Alchemy, Survival; later Farming, Tailoring, Enchanting, Hunting, Construction, Runecraft/Occultism. Profession XP is separate from combat rank.\n\nWoodcutting stands now (quests.yml): E within 3 m of a timber oak, 2.5 s per log in 3 swings, moving 1.2 m cancels, 3 logs per tree, the tree falls (82°, 1.6 s) and regrows after 30 s. Eight oaks in Briarwild. Copper veins: 6 in the quarry pit plus 2 in the cave, not yet mineable. Gathering action target 2–4 s."
  },
  {
    "id": "features-9",
    "title": "Crafting",
    "body": "Two full pipelines for the MVP: mine copper → smelt at a furnace → smith a blade (Mira the Forgekeeper), and fish → cook at a campfire or inn stove → eat to heal with a cooldown. Each recipe shows ingredients, owned counts, the output and the reason it can't be made; materials are consumed exactly once. First crafted upgrade reachable in 15–25 minutes without rare luck."
  },
  {
    "id": "features-10",
    "title": "Inventory and items",
    "body": "One item registry: each item has a stable id (never its display name), display name, kind, stack max, vendor value, rarity, equip slot, stat modifiers and tags. Starting bag: 24 slots in the bible; the woodcutting build uses 30 slots and stacks of 20 (to be reconciled). Full-bag gathers are refused with a clear message, never lost.\n\nInitial items: worn_sword, novice_staff, short_bow, pickaxe_basic, axe_basic, copper_ore, copper_ingot, oak_log, raw_fish, cooked_fish, healing_tonic, forged_sword, relic_shard, copper_coin."
  },
  {
    "id": "features-11",
    "title": "Equipment and rarity",
    "body": "MVP slots: weapon, torso, boots, offhand; later head, legs, gloves, amulet, ring, relic. Rarity tiers Common, Fine, Rare, Relic, Mythic; rarity never secretly changes stats or outranks level and build. Equipping a forged weapon must change real damage."
  },
  {
    "id": "features-12",
    "title": "Progression",
    "body": "Combat rank and each profession level independently, each showing level, progress and next unlock. Every hero starts at level 1. The XP curve is not fixed until gathering has been tuned for fun; calculations are deterministic. Level-ups get a sound and a small, meaningful unlock."
  },
  {
    "id": "features-13",
    "title": "Economy and currency",
    "body": "Money is one copper integer: 100 copper = 1 silver, 100 silver = 1 gold (lib/currency.js). Every coin that moves is a row in the ledger table. Staged safety: A) quest coin, controlled drops, shops, repairs; B) bank deposits and vendor pricing; C) secure two-party trade only if atomic exchange is proven; D) player marketplace only after concurrency and duplication tests. Gold sinks: repairs, travel services, recipe fees, never punishing beginners."
  },
  {
    "id": "features-14",
    "title": "Vendors and bank",
    "body": "Quartermaster Dren sells starter goods with clear prices, one-click buy confirmation and inventory-full feedback. A purchase without enough coin fails whole: no partial spend, never a negative balance. The bank in Lantern's Reach stores items and coin per character."
  },
  {
    "id": "features-15",
    "title": "Saving and persistence",
    "body": "Each hero is one row in the characters SQL table (user, realm, slot): name, race, class, level, copper, inventory, equipment and data, rewritten the moment bag, purse or level changes. Quest state rides the same save. Old records get defaults for new fields; no update resets saves. Every save scenario (disconnect mid-gather, equip, reward, purchase, place change, death) is proven by a real leave-and-rejoin test."
  },
  {
    "id": "features-16",
    "title": "Social, parties and PvP",
    "body": "Spawn's own presence, chat and parties first; then party invites, group health frames, roles, guilds and raid groups once each is verified. Shared targets, individual safe rewards. Hollowmere is the PvP realm (duels anywhere outside towns); an optional PvP arena is a Phase 5 idea."
  },
  {
    "id": "features-17",
    "title": "Dungeons",
    "body": "The Hollowcrypt: abandoned chapel → catacomb corridor → collapsed ossuary → ritual chamber, as its own place with one copy per party. Stage 1: one room and the Candle Warden boss, 2–4 players once load-tested, a safe checkpoint and a clean return to Lantern's Reach. Stage 2: two more encounters and mechanisms. Two parties can never see or touch each other's dungeon. First run target 10–15 minutes."
  },
  {
    "id": "features-18",
    "title": "Camera and controls",
    "body": "Third-person orbit with WoW-style controls (the wow-camera-controls mod): hold left mouse to orbit, hold right mouse to steer, scroll to zoom, Q auto-run (W stops it), Esc releases the mouse. WASD move, Space jump, E interact, 1–3 abilities today (1–8 planned), Tab target, I bag, J journal, M map, K character, F1 skills, Esc pause. No motion-blur dependency; the hero stays readable."
  },
  {
    "id": "features-19",
    "title": "World travel and regions",
    "body": "One continent, the Lantern March, about 12 km east-west and 8 km north of town, ringed by the Shrouded Sea. Regions are named by one table (scripts/lib/regions.js) and the HUD shows the name over the minimap with an entry banner. Roads link the regions (north pass, highland road, roads to Frostveil, Sunscar and Elderveil). Waystones mark the roads; whether they become fast travel is open. Every zone needs a safe route, a resource loop, an enemy loop and a secret."
  },
  {
    "id": "features-20",
    "title": "Interaction and NPC dialogue",
    "body": "Nearby NPCs and resources outline and show a floating E prompt within their range (Elric talks at 3.5 m, salutes passers-by at 7 m every 20 s, a speech bubble stands 5 s). Readable signs and journals float their page for 11 s at 2.6 m. Quest dialogs use the brass Kenney-style frame with accept and turn-in plates."
  }
];
