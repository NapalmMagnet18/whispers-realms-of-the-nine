// Codex — Invariants. Rules that must never break — canon + technical laws.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "invariants-1",
    "title": "Original assets only",
    "body": "Creator's rule. No models, icons, UI art, maps, class or spell names, sounds or characters copied from World of Warcraft, RuneScape or any other game. References are for study only. Every imported art, sound and font has verified licence provenance before it lands."
  },
  {
    "id": "invariants-2",
    "title": "Build in small tested stages",
    "body": "Creator's rule. One player-testable system per iteration; play it, fix it, record it, then move on. No full-region polish before the proof-of-concept tests pass (Gate 0)."
  },
  {
    "id": "invariants-3",
    "title": "Preserve working features",
    "body": "Creator's rule. Never replace or regenerate working features, NPC quests, HUD, saves, terrain or assets without the exact scope confirmed. When unsure, inspect and report first. A regression stops new work until the offending change is found and reverted."
  },
  {
    "id": "invariants-4",
    "title": "Claim only what is tested",
    "body": "Creator's rule. Nothing is called done, working or verified until it was played; the publish description describes only what exists. No promise of MMO concurrency, cross-world characters, guilds, payments or instance isolation before a test proves it."
  },
  {
    "id": "invariants-5",
    "title": "A reward is claimable once",
    "body": "Creator's rule. Every quest, contract and loot reward pays exactly once, across double clicks, reconnects and two clients. Completion is written before the reward and an already-completed id is refused. Never infer completion from a UI marker."
  },
  {
    "id": "invariants-6",
    "title": "Persistence through Spawn's save system",
    "body": "Creator's rule. Characters, inventory, coin, XP and quest state save through Spawn's own state and SQL. Old saves load after every update, new fields get defaults, and nothing is reset or deleted without the owner's approval and a recovery path."
  },
  {
    "id": "invariants-7",
    "title": "No invented external servers",
    "body": "Creator's rule. No separate engine, networking layer, backend or database bolted on; no undocumented Spawn calls; no tokens in files. If a mechanism isn't supported, say so and disable the feature with an honest message instead of faking it."
  },
  {
    "id": "invariants-8",
    "title": "No loading screens",
    "body": "Creator's rule. Spawn streams the world; nothing stands between a player and it. The main menu is the only front screen, by the creator's call."
  },
  {
    "id": "invariants-9",
    "title": "Durable changes are validated",
    "body": "Every inventory and currency change runs through the authoritative path, never trusting a client UI action. A purchase without enough coin fails whole: no partial spend, no negative balance. No player trade or marketplace until atomic exchange and duplication tests pass."
  },
  {
    "id": "invariants-10",
    "title": "Stable item ids",
    "body": "Items are keyed by an immutable id, never by display name; rarity never secretly changes stats; stat modifiers apply exactly once."
  },
  {
    "id": "invariants-11",
    "title": "Readable combat",
    "body": "Every enemy telegraphs its heavy attacks (bosses 0.8–1.5 s ahead) with shape and motion as well as colour. Enemies leash, heal and reset cleanly; dead enemies take no damage; no hits through walls or out of range."
  },
  {
    "id": "invariants-12",
    "title": "A safe, readable start",
    "body": "New players find their first NPC in under 15 seconds, are never sent into lethal enemies without warning, and never get trapped by geometry. Night and fog never hide the objective."
  },
  {
    "id": "invariants-13",
    "title": "Shared vs personal state",
    "body": "Player progress lives on the character; shared world changes (oaks, ore, enemies) live on the world. Two players on one node follow a defined rule; party members each get their own reward."
  },
  {
    "id": "invariants-14",
    "title": "Performance",
    "body": "60 fps on ordinary desktops and supported phones is the target, measured, not assumed. Few active enemies, distant effects culled, materials reused; a feature that costs the frame rate loses."
  }
];
