// Codex — Overview. Theme, genre, premise, pillars, tone, audience.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "overview-1",
    "title": "Identity",
    "body": "WHISPERS: Realm of the Nine is a multiplayer dark-fantasy MMO built in Spawn: RuneScape-like freedom to gather, craft, trade and progress, joined to World of Warcraft-inspired readable combat, classes, parties, quests and dungeons. Every name, model, icon, sound and line of lore is original.\n\nLogline: the borders between nine ancient realms are breaking. Wayfarers settle in the last lantern-lit towns of the Lantern March, master professions, bargain with rival factions, and push into shifting lands where forgotten powers are waking.\n\nPlayer fantasy: start in worn clothes with a crude tool, and become a legendary smith, an explorer, a monster hunter, a merchant, a spellcaster or a guild member. Who you are comes from what you do, not only a level number.\n\nWorking title from the bible: \"Realms of the Nine\" (alternatives: Veilbound, Kingdoms of Ash, The Hollow Crown). The world itself is named \"Realm of the Nine\"."
  },
  {
    "id": "overview-2",
    "title": "Three pillars",
    "body": "1. Live another life: gathering, processing, crafting, selling, fishing, trade; housing later.\n2. Become powerful together: approachable combat, distinct disciplines, parties, instanced dungeons, memorable bosses.\n3. A world worth roaming: dense secrets, branching quests, shortcuts, day/night atmosphere, distinct biome identities."
  },
  {
    "id": "overview-3",
    "title": "Tone and art direction",
    "body": "Inviting, colourful and readable near settlements; slowly mysterious and ominous beyond them. Storybook medieval fantasy meets twilight occult mystery: gothic architecture, colossal ruins, old stones, pale fog, glowing runes, eerie forests, never constant black-on-black horror.\n\nThe standing look (aesthetic.yml, \"lantern-gold\"): a stylized medieval frontier with ancient gothic ruins at its edges; late golden afternoon (hour 16.9), warm windows, long shadows, a hush of old magic. Finishes: limewash plaster, dark oak timber, red clay shingle, mossy fieldstone, hammered iron, lantern glow. Fog 140–700 m, clouds 0.55 density.\n\nValue contrast by region: warm town, emerald forest, weathered rust quarry, cyan-grey occult marsh, blackstone-and-bone crypt. Readability first, atmosphere second; darkness never hides a hazard or the objective.\n\nStudied, never copied: RuneScape 3 (life skills, resource loops), World of Warcraft (action bar, roles, dungeons), Albion Online (gathering and crafting clarity), Fable (storybook villages), Guild Wars 2 (monumental ruins, vistas)."
  },
  {
    "id": "overview-4",
    "title": "Platform and audience",
    "body": "Spawn, played in the browser, multiplayer by default. Desktop first (tested at 1920x1080 and 1366x768); phones later with their own layout, never a shrunk desktop HUD. Players are MMO fans who want a cozy-to-ominous world they can roam, gather in and fight through together.\n\nBuilt on Spawn's own runtime, multiplayer, places, rooms and save system: no separate engine, no external server or database. Realms are rooms of this one world (six on the roster, 120 players each, 6 characters per realm). The world streams; there is no loading screen. The main menu stays at the front door by the creator's call."
  },
  {
    "id": "overview-5",
    "title": "First playable (MVP)",
    "body": "The bible's definition of first playable: one attractive central hub, three walkable connected areas, two enemy species and one boss, three combat disciplines, at least two complete gathering-to-crafting loops (six professions is the full target), 6–8 starter quests, inventory and equipment, XP, loot, bank and shop, an on-screen quest tracker, two-player collaboration and reliable persistence.\n\nIf that is too broad, the rule is: finish the full 20-minute path before half-building wider features. Launch priority: 20-minute prototype > 60-minute polished loop > co-op dungeon > persistent economy > full MMO scale."
  },
  {
    "id": "overview-6",
    "title": "The first thirty minutes",
    "body": "Minute 0–5: the hero appears at their race's starting zone (Marchborn outside Lantern's Reach), gets a short spoken introduction, learns movement, camera, E to interact and quest dialogue.\nMinute 5–12: accepts A Light Against the Briars: three Briar Wolves and five oak logs for Gatekeeper Elric; XP and coin.\nMinute 12–20: learns a gathering tool, mines ore or cuts timber, forges a first upgraded weapon, compares and equips it.\nMinute 20–30: groups with a second player, both see each other's nameplates, defeat a mini-boss, each gets their own reward; they leave and rejoin and the bag and progress are still there."
  }
];
