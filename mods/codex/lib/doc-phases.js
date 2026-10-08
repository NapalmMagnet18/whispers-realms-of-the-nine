// Codex — the build-order rail: every phase with its checklist, bug list
// and alteration notes, plus the standing directive. Savi writes this file.
export const PHASES = [
  {
    "id": "phase-1",
    "title": "Foundation and front door",
    "stage": "bug-pass",
    "steps": [
      {
        "id": "steps-1",
        "text": "Third-person hero with humanoid locomotion, walk, sprint, jump",
        "done": true
      },
      {
        "id": "steps-2",
        "text": "WoW-style camera controls (orbit, steer, zoom, auto-run)",
        "done": true
      },
      {
        "id": "steps-3",
        "text": "Main menu, pause menu, settings, character create and select (mmorpg-tools)",
        "done": true
      },
      {
        "id": "steps-4",
        "text": "Realm roster: six realms as rooms of this world (realms.yml)",
        "done": true
      },
      {
        "id": "steps-5",
        "text": "Races and classes data with starting zones (races.yml)",
        "done": true
      },
      {
        "id": "steps-6",
        "text": "Characters saved per realm in SQL (characters table), every coin in the ledger",
        "done": true
      },
      {
        "id": "steps-7",
        "text": "Money as one copper integer: 100c = 1s, 100s = 1g",
        "done": true
      },
      {
        "id": "steps-8",
        "text": "No loading screen; the world streams",
        "done": true
      }
    ],
    "bugs": [
      {"id": "bugs-1", "text": "A hero back at the gate with an old characterCreated flag drew the game HUD over the title. Fixed v0.7.9 in main-menu-mgr.js; reload verified: title shows", "done": true},
      {"id": "bugs-2", "text": "Realm round trip A → B → A never run end to end; logout from pause must land on the right view (realm list vs title)", "done": false},
      {"id": "bugs-3", "text": "Character creation arrival 854 KB vs 450 KB budget: ui-menu-panel.js 147 KB, player.js 72 KB, ui.js 64 KB load before standing", "done": false},
      {"id": "bugs-4", "text": "Title camera drift: verified moving across three fresh frames", "done": true},
      {"id": "bugs-5", "text": "Version tag on a stuck hero's HUD: gone with bugs-1, title shows v0.7.9 Alpha", "done": true}
    ],
    "notes": [
      {"id": "notes-1", "text": "Windows crew handoff: rebuild the game windows as ui-book.js + one lib file per tab routed from renderMenuPanel; HUD fixes first: minimap labels pile up, empty hotbar slots glare white, tip panel covers nameplates, version tag over the XP text. v0.8.0: hotbar empties darkened, minimap names de-overlapped, pause version line lifted (unwatched in play). Seen in play 0.8.1: hotbar now dark brass slots (the white came from a raw ::after border in ui.js), version line clear of XP, game menu closes again (inline display beat the hide rule), windows in brass (crew: char/stats/inv/spellbook/quests/professions seen; talents, world map, backpack not). Open: tip panel over nameplates, minimap names clipped at the ring edge", "done": false},
      {"id": "notes-2", "text": "Checked by Savi in her own browser 2026-10-08: title → Enter World → Lantern's Reach → Esc menu → Log Out → clean title, no HUD. Realm round trip 0.8.2: Lantern's Rest shows Savibw, The Nine Veils shows 0/6 (was leaking the other realm's roster through player.state; fixed in main-menu-mgr), back to Lantern's Rest shows Savibw again", "done": true},
      {"id": "notes-3", "text": "0.8.2 in play: talents window opens in the brass frame; controls tip card shrunk and clear of nameplates, hides from level 2. 0.8.3: locked talent names readable (seen in play); minimap icons 24px, names drawn only when inside the ring (seen; Inn and Well labels still close at the hub); quest-giver anchors drawn only within 90 m of the Reach to quiet the gatekeeper-elric anchor warning (not yet confirmed in logs)", "done": false}
    ]
  },
  {
    "id": "phase-2",
    "title": "The Lantern March: hub, Briarwild, quarry and the continent",
    "stage": "second-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Lantern's Reach hub: square, well, inn, smithy, merchant, bank, quest board, cottages, lanes",
        "done": true
      },
      {
        "id": "steps-2",
        "text": "Briarwild forest, river and footbridge, eight timber oaks",
        "done": true
      },
      {
        "id": "steps-3",
        "text": "Emberstone Quarry: pit, ramp, copper veins, cart, lamp",
        "done": true
      },
      {
        "id": "steps-4",
        "text": "Windmill Farm south-west of the square",
        "done": true
      },
      {
        "id": "steps-5",
        "text": "Continent ~12 km with regions table and HUD region names",
        "done": true
      },
      {
        "id": "steps-6",
        "text": "Frostveil Tundra, Sunscar Expanse, Elderveil Wilds ground and roads",
        "done": true
      },
      {
        "id": "steps-7",
        "text": "Creator's nature kit placed in Briarwild and around the Reach",
        "done": true
      },
      {
        "id": "steps-8",
        "text": "Bible landmarks: east gate, stable, watchtower; shrine, chest, fishing pool, mushroom rings; quarry crane, cart, camp, cave, journal",
        "done": true
      },
      {
        "id": "steps-9",
        "text": "Brass Kenney-style UI frames for dialogs, slots, tooltips, region banner",
        "done": true
      }
    ],
    "bugs": [
      {"id": "bugs-1", "text": "Elderveil great tree (frontier-elderveil, x-28z0, twisted kind ×4.6): crown draws as flat pale cards, bark untextured. Leaf images checked fine; roots moved to their own piece, trunk tint added; still pale in the far view", "done": false}
    ],
    "notes": []
  },
  {
    "id": "phase-3",
    "title": "Starting areas: the four race starting zones and the roads between them",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Lantern's Reach polish: Marchborn spawn outside the inn, first NPC visible within 15 s, lanes and services readable",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Thornhollow (Briarkin, −720, 70): root-house hamlet in the Deepwood with a landmark, a resource loop and a secret",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Cinderhold (Emberforged, 900, −170): mesa forge-hold on the highland road with ore and forge glow",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Gullrest (Saltborn, 250, 1430): harbour hamlet on the Saltmere bay with piers, boats, a lighthouse and a fishing spot",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Waystone roads linking each starting zone to Lantern's Reach, signposted, with a waystone at each end",
        "done": false
      },
      {
        "id": "steps-6",
        "text": "A greeter NPC and one greeter quest per zone (claim once, same quest system as Q002)",
        "done": false
      },
      {
        "id": "steps-7",
        "text": "Dress each zone with free, licence-checked assets (CC0) plus the creator's kits; record every source",
        "done": false
      },
      {
        "id": "steps-8",
        "text": "Each race spawns at its own zone on a fresh level-1 character (test all four)",
        "done": false
      },
      {
        "id": "steps-9",
        "text": "Region names and entry banners for Thornhollow, Cinderhold and Gullrest",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-4",
    "title": "First quest loop: Elric, wolves, timber and the Vanguard",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Briar Wolf pack: six wolves at the den with aggro, leash, bite, death and respawn (saved in the world; design.md: in flight)",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Q002 A Light Against the Briars: 3 wolves + 5 logs, 25 coin + 150 XP, claim once (saved; in flight)",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Woodcutting on the eight timber oaks: 2.5 s per log, 3 logs per tree, 30 s regrow (saved; in flight)",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Vanguard hotbar 1–3: Strike, Heavy Strike, Guard, with training dummies",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Q001 Welcome to Lantern's Reach: talk to Elric, training blade and coin",
        "done": false
      },
      {
        "id": "steps-6",
        "text": "Placeholder HUD: hp, coins, objective, hotbar slots legible at 1366x768 (SP-009)",
        "done": false
      },
      {
        "id": "steps-7",
        "text": "Quest tracker shows counts and survives reconnect",
        "done": false
      },
      {
        "id": "steps-8",
        "text": "Six townsfolk standing and talkable (Mira, Dren, Bram, Tamsin, Sister Vale, Rowan)",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-5",
    "title": "Gate 0: proof of persistence and two players",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Realm routing wired so picking a realm lands the hero in that room",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Two clients join one realm and see each other move (QA-002)",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "A coin reward survives leave and rejoin exactly once (SP-004, QA-003)",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "QA-001 fresh player moves and interacts",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "QA-002 two accounts see each other",
        "done": false
      },
      {
        "id": "steps-6",
        "text": "QA-003 XP, coin and items remain after rejoin",
        "done": false
      },
      {
        "id": "steps-7",
        "text": "QA-004 rapid double reward grants once",
        "done": false
      },
      {
        "id": "steps-8",
        "text": "QA-008 attacks obey range and walls; QA-009 leash returns wolves home",
        "done": false
      },
      {
        "id": "steps-9",
        "text": "QA-010 two players chop one oak by a defined rule",
        "done": false
      },
      {
        "id": "steps-10",
        "text": "QA-013 an update doesn't reset older saves",
        "done": false
      }
    ],
    "bugs": [
      {
        "id": "bugs-1",
        "text": "design.md names scripts/routing.js for realm rooms, but no routing.js exists and world.config.yaml has no routing: realm choice may not reach its room. Check before claiming realms work.",
        "done": false
      }
    ],
    "notes": []
  },
  {
    "id": "phase-6",
    "title": "Crafting loops and professions",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Copper mining: E on a vein, ore and Mining XP",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Furnace and forge: ore → ingot → forged blade with Mira; Q003 The First Forge",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Fishing at the river pool and Gullrest; Q004 The Old River with Rowan",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Cooking at a campfire or inn stove; eating heals with a cooldown",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Q005 Supply the Watch: deliver timber to Bram",
        "done": false
      },
      {
        "id": "steps-6",
        "text": "Item registry with stable ids; 24- or 30-slot bag with overflow refusal",
        "done": false
      },
      {
        "id": "steps-7",
        "text": "Equipment slots (weapon, torso, boots, offhand) changing real damage",
        "done": false
      },
      {
        "id": "steps-8",
        "text": "Skills page (F1) with independent profession XP",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-7",
    "title": "Three disciplines and character depth",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Arcanist: mana and three starter spells",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Pathfinder: ranged attacks, roll and a third skill",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Character sheet (K) with stats and gear comparison",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Quartermaster Dren's shop and the bank, priced in copper/silver/gold, failing whole",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Level-ups with a sound and an unlock",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-8",
    "title": "Cooperative play",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Party invites and group frames where Spawn supports them",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Quarry Scavengers and Q006 Echoes at the Quarry",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "A mini-boss two players defeat with individual rewards",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Q007 Broken Sigil: three ancient stones, relic fragment",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "2–4 players finish a shared encounter without duplicated loot",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-9",
    "title": "The Hollowcrypt dungeon",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Q008 The Hollowcrypt Gate: inspect the seal, dungeon access flag",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Hollowcrypt as its own place, one copy per party",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Candle Warden: sweep, delayed circle, summon phase, readable telegraphs",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Checkpoint, reset and a safe return to Lantern's Reach",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Two parties cannot see or affect each other's dungeon (QA-011)",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-10",
    "title": "Broader world: Sorrowfen and the frontiers",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Sorrowfen: boardwalks, ruins, harder enemies, rare reagents, return shortcut",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Faction questline: Beacon Guild, Veilbound, Hollow Court",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "A reason to visit Greyspine, Frostveil, Sunscar and Elderveil: an enemy loop and a resource loop each",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Optional PvP arena and Hollowmere duel rules, if wanted",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-11",
    "title": "Economy safety and live quality",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Exploit regression suite: quest, vendor and crafting duplicates absent (SP-023)",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Secure two-party trade only if atomic exchange is proven",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "UI scale, reduced effects, audio mix, performance presets",
        "done": false
      },
      {
        "id": "steps-4",
        "text": "Phone layout with large touch targets",
        "done": false
      },
      {
        "id": "steps-5",
        "text": "Performance profile in a busy hub and a mob fight (SP-022)",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  },
  {
    "id": "phase-12",
    "title": "Public beta",
    "stage": "first-draft",
    "steps": [
      {
        "id": "steps-1",
        "text": "Release checklist from doc 05 all passed",
        "done": false
      },
      {
        "id": "steps-2",
        "text": "Invite cohort plays repeat sessions without save corruption",
        "done": false
      },
      {
        "id": "steps-3",
        "text": "Publish description matches what is built",
        "done": false
      }
    ],
    "bugs": [],
    "notes": []
  }
];

export const DIRECTIVE = {
  "active": true,
  "stage": "build"
};
