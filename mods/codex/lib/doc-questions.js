// Codex — Open Questions. Gaps found in the brief. One question per page, answered inline.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "questions-1",
    "title": "How does Arcanist mana work?",
    "body": "The bible says \"stamina/mana\" and resource-cost skills, but no numbers: pool size, regeneration rate in and out of combat, what costs what, and whether Vanguard and Pathfinder use stamina instead. Needed before the Arcanist is wired."
  },
  {
    "id": "questions-2",
    "title": "Which ability names are canon?",
    "body": "races.yml gives Vanguard strike/heavy/guard, Arcanist firebolt/frost shard/ward, Pathfinder arrow/volley/dodge roll; the bible (doc 03) gives Cleave/Guard/Rally, Ember Bolt/Arcane Ward/Nova, Quick Shot/Roll/Pinning Arrow. Which set ships?"
  },
  {
    "id": "questions-3",
    "title": "What is the level cap and the XP curve?",
    "body": "Every hero starts at level 1; the bible delays the curve until gathering is tuned. What cap for the first release (10? 20?), and do professions cap at the same number?"
  },
  {
    "id": "questions-4",
    "title": "Where do the races meet after their starting zone?",
    "body": "Marchborn begin at Q001 in the Reach; the other three wake hundreds of metres to 1.45 km away. Does every race walk to Lantern's Reach for Q002–Q008, or does each zone carry its own chain up to a shared level? And which regions are which level band (Sorrowfen, Hollowcrypt, Greyspine, Frostveil, Sunscar, Elderveil)?"
  },
  {
    "id": "questions-5",
    "title": "Are PvP duels wanted on Hollowmere now?",
    "body": "realms.yml calls Hollowmere a PvP realm where players duel anywhere outside towns, and Phase 5 mentions an optional arena. Is open PvP part of the first release, consent-only duels, or later? What happens on a PvP death?"
  },
  {
    "id": "questions-6",
    "title": "Is Q002's reward 25 copper or 25 gold?",
    "body": "quests.yml writes \"gold: 25\"; design.md says \"25 coins\"; money is now copper/silver/gold with 100c = 1s. 25 gold would be 250,000 copper. What should the first quest pay?"
  },
  {
    "id": "questions-7",
    "title": "Bag size: 24 or 30 slots?",
    "body": "The bible says a 24-slot starting bag; the woodcutting build uses 30 slots with stacks of 20 (bible example stack: 99). Which numbers are canon?"
  },
  {
    "id": "questions-8",
    "title": "Player health scale",
    "body": "The HUD's maximum health is 1000 and a wolf bite does 45; the bible targets 6–12 s to kill a starter enemy. Is 1000 the intended level-1 health, and how does it grow?"
  },
  {
    "id": "questions-9",
    "title": "Do races differ in play?",
    "body": "races.yml gives only a name, zone and blurb; the MMORPG kit carries racial abilities and race damage tables. Should races have stats, a racial ability, their own looks and voices, or be cosmetic plus zone?"
  },
  {
    "id": "questions-10",
    "title": "Are waystones fast travel?",
    "body": "A waystone stands on the highland road. Should waystones teleport between discovered stops (and cost coin as a gold sink), or only mark the road? Mounts?"
  },
  {
    "id": "questions-11",
    "title": "Death and respawn",
    "body": "No item loss in the MVP. Where does a hero respawn: the nearest town, their race's starting zone, a waystone? Any penalty (durability, short debuff)?"
  },
  {
    "id": "questions-12",
    "title": "Day/night or a fixed golden hour?",
    "body": "The bible asks for day/night tone shifts and fireflies after dusk; the look is frozen at 16.9 (late afternoon). Should a cycle run, and how long is a day?"
  },
  {
    "id": "questions-13",
    "title": "What is The Nine Veils realm's \"Far Shores\"?",
    "body": "Five realms are in \"The March\"; The Nine Veils lists \"Far Shores\". A different starting land, a later continent, or just a name? Can a hero ever move between realms?"
  },
  {
    "id": "questions-14",
    "title": "Who are the Nine?",
    "body": "The bible keeps the Nine mysterious. Do they have names, domains and a link to each region (e.g. Frostveil, Sunscar, Elderveil), and do the nine realms map onto places a player will visit?"
  },
  {
    "id": "questions-15",
    "title": "Which outside assets are allowed?",
    "body": "The creator asks to search for and download assets. The rules say original or properly licensed only. Is CC0 (e.g. Kenney, Poly Haven, Quaternius) acceptable, must each be credited in a file, and is any paid pack in play?"
  },
  {
    "id": "questions-16",
    "title": "Title: Realm or Realms of the Nine?",
    "body": "The bible's working title is \"Realms of the Nine\"; the world and aesthetic file say \"Realm of the Nine\". Which is final?"
  }
];
