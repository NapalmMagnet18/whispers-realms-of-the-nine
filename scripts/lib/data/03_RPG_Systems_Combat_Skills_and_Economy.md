# WHISPERS: REALMS OF THE NINE
## RPG Systems, Combat, Skills, Items & Economy Specification
Version 1.1 | Spawn 6 platform-specific design notes

## System boundaries
Spawn handles its own runtime, multiplayer and world hosting. Build world logic within documented Spawn mechanics. The authoritative rules for rewards, inventory and currency must live in the shared/server-controlled execution path offered by the current world API. Agent instructions: inspect the project's AGENTS.md and world-scoped documentation, not generic examples from another engine. Do not introduce an external backend by default.

## Character model
**Player identity:** Persistent character within the game world, unique persistent identifier where supported. Keep display names and saved stats separate.
**Base attributes:** Health, combat resource (stamina/mana), attack power, spell power, armor; optional critical chance. Every stat displayed to the player must visibly affect game behavior.
**Combat disciplines:** Vanguard (melee), Arcanist (magic), Pathfinder (ranged). Avoid irreversible class lock-in initially; trainers can eventually enable switching.
**Slot MVP:** Weapon, torso, boots, offhand. Later expand to helmet, legs, gloves, accessory and relic slots.
**Progression:** Combat rank separate from independent profession progression; track XP, level, and next unlock. Keep calculation deterministic.

## Combat specification
| Feature | MVP behavior | Validation |
| Target selection | Nearest relevant enemy or tab select | Target label and line-of-sight correct |
| Basic attack | Cooldown, range, stat-based damage | Cannot damage outside accepted range |
| Ability hotbar | 1–8 key mapping, ability status | Button shows unavailable/cooldown |
| Damage numbers | Readable but not overwhelming | No invalid damage on dead enemy |
| Dodge / guard | Short response window, cost | Timing and invulnerability checked |
| Enemy AI | Patrol, aggro, pursue, strike, leash, respawn | Leash resets health and state safely |
| Death | Controlled respawn, no item loss during MVP | Does not duplicate loot or XP |
| Party combat | Shared targets with individual safe rewards | Two-player state remains isolated |

**Starter abilities:** Vanguard — Cleave, Guard, Rally; Arcanist — Ember Bolt, Arcane Ward, Nova; Pathfinder — Quick Shot, Roll, Pinning Arrow. Prototype one basic and one special for each first. Use VFX colors and icon shapes that remain distinguishable in colorblind modes.

## Item registry
Every item has a stable non-display identifier. Never use a localized display name as an inventory key.
| Field | Example | Required behavior |
| id | ore_copper | Immutable unique key |
| display_name | Copper Ore | Localized human-facing string |
| kind | resource | One of a finite supported set |
| stack_max | 99 | Enforce capacity and overflow behavior |
| vendor_value | 3 | Nonnegative integer |
| rarity | common | Must not secretly change item stats |
| equip_slot | weapon or none | Reject illegal equipment slots |
| stat_modifiers | {attack:2} | Applied exactly once |
| tags | mining, metal | Crafting filter and search |

**Initial items:** worn_sword, novice_staff, short_bow, pickaxe_basic, axe_basic, copper_ore, copper_ingot, oak_log, raw_fish, cooked_fish, healing_tonic, forged_sword, relic_shard, copper_coin.

## Profession loops
### Mining and Smithing
Find copper deposit → start interact progress → roll material yield (shared rule) → increment Mining XP → safely add ore to bag → refine at furnace → consume material once → gain Smithing XP → produce forged item → equip to change a visible combat stat.

### Fishing and Cooking
Interact at allowed water edge → receive fish and Fishing XP → take fish to campfire/inn stove → verify recipe inventory → consume fish once → cook meal → consume meal to restore health, with sensible cooldown.

### Woodcutting and Town Contracts
Approach tree node → chop with required tool → award logs/XP → deposit timber to carpenter contract → grant a one-time reward. Tree visuals regrow on defined timer; resync safely when players leave/rejoin.

## Persistence and data integrity
**Saving scenarios:** player disconnect during gathering; equipment changes; quest reward; vendor purchase; dungeon transition; combat death; multiple connected sessions where supported. Verify each state actually survives a full leave/rejoin test.
**Idempotency:** each quest can be rewarded only once; transaction events need deduplication where supported. Test two players interacting with a shared node simultaneously. Distinguish per-player state and shared world state.
**Backwards compatibility:** new patches must handle older character records and defaults for new fields; do not wholesale reset user data during normal feature addition.
**Failure policy:** if a transaction cannot be safely committed or tested in current Spawn APIs, disable that trade feature and show an honest user message rather than simulating an insecure economy.

## Economy model: staged safety
**Stage A:** Quest coins, controlled enemy drops, shops, upgrades and repair fees. Controlled inflows/outflows; no player currency exchange.
**Stage B:** Deposits, bank withdrawal, limited resource pricing and vendor inventory. Ensure persistence and capacity tests.
**Stage C:** Only if platform permits robust atomic exchange, build a secure two-party trade: both offers locked; revalidation; explicit confirmation; cancel/disconnect recovery; audit record.
**Stage D:** Player marketplace, taxes, searchable orders and safeguards only after successful concurrency and duplication testing.
**Gold sinks:** repair costs, travel services and recipe fees; avoid punishing beginner play. **Abuse controls:** rate limits, item ID validation, duplicate reward rejection, spending checks, server-side verification.

## Suggested balance starting values (playtest placeholders)
| Tunable | Starting candidate | Caveat |
| Starter enemy time-to-kill | 6–12 seconds | Tune across all 3 disciplines |
| Basic attack cooldown | 1.0–1.5 seconds | Depends on animation feel |
| Starter bag size | 24 slots | UI and item stack size to follow |
| Starter gathering action | 2–4 seconds | Avoid boring repeated waits |
| Normal mob respawn | 30–60 seconds | Need group/load tests |
| First crafted upgrade | Reachable in 15–25 minutes | Shouldn't require rare RNG |
| First dungeon | 10–15 minutes | Only after save/instance tests |

These are provisional design targets, not verified Spawn engine limits or guaranteed final balance values.

## Quest state machine
Unavailable → Available → Active → ObjectivesComplete → Rewarded. Cancel or reconnect must not bypass reward guards. Store per-character quest flags and current counts; never infer quest completion from a transient UI marker.

## Multiplayer roles and shared state
**Per-player:** inventory, XP, equipment, quest status, personal cooldowns and rewards.
**Shared:** enemy AI, resource availability where applicable, environmental triggers and zone events.
**Party:** membership, assigned dungeon instance and optional encounter progress. Do not assume built-in party API before inspecting the target world documentation.

## System delivery gates
- [ ] One combat skill causes damage in range and never hits through solid walls.
- [ ] Players can loot, disconnect and keep only the intended quantity.
- [ ] Crafting fails cleanly for insufficient materials and full inventory.
- [ ] Each quest rewards precisely once after rapid double-click/reconnect.
- [ ] Vendor coin totals never drop below zero.
- [ ] Two players can share encounters without sharing private inventories.
- [ ] A game update preserves old characters' important progression.
- [ ] Trade/auction functionality remains off until exploit controls pass.
