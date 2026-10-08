# WHISPERS: REALMS OF THE NINE
## Spawn Technical Implementation, Agent Workflow & Quality Gates
Version 1.1 | Validated against public Spawn guidance October 2026

## Platform assumptions (confirmed vs unconfirmed)
| Area | Current public guidance | Our acceptance condition |
| Multiplayer | Spawn worlds are multiplayer and playable through a browser | Join with two clients; observe shared actors |
| Persistence | Spawn retains game/player saves; exact APIs are world-scoped | Verify coins, inventory and quest data across rejoin |
| Git workflow | A world has editable Git repo; authorized agents can push | Read AGENTS.md; commit clean one-feature changes |
| Engine API | Docs delivered via world-scoped agent/docs and skills | Do not invent unsupported signatures |
| Imported assets | Asset upload supported, including GLB/textures/audio | Confirm format, size and performance per world |
| Party/guild/auction | Not promised by general marketing | Spec and prototype before commitment |
| MMO-scale capacity | No validated concurrent-player capacity in this roadmap | Small-cohort load test; revise architecture |

**Primary source:** https://www.spawn.co/llms.txt ; background https://www.spawn.co/about . The game's own AGENTS.md and world-scoped agent/docs are the source of truth at build time.

## Non-negotiable agent instructions
1. Target only the designated NEW Spawn world. Do not modify unrelated worlds or accounts.
2. Read current repository AGENTS.md, exact world-scoped Tome API reference and relevant Spawn building skills before changes.
3. Never assume Unity, Unreal, Roblox, generic browser DOM or Node game-server functionality is valid inside Spawn.
4. Keep tokens out of source control, logs, documents and screenshots. Use authorized crew/invite access.
5. Plan small patch; preserve known-good behavior and existing save schema; commit clear player-facing change summary.
6. Join game and test after every meaningful update, checking logs and two-player behavior when relevant.
7. Stop and describe unsupported mechanisms rather than building insecure approximations for trade/save features.
8. No deletion or reset of saved inventory, quests or characters without explicit owner approval and a recovery approach.

## Technical proof of concept (Phase 0)
- World boots in third-person 3D, no scene errors.
- Camera follows a visible character with stable orbit, jump and walk; collision surfaces work.
- A second player can join and move; two different clients see corresponding players.
- NPC responds to interact, quest advances, one enemy dies and respawns.
- One ore node produces inventory item and XP, with proper ownership.
- A coin reward survives leave/rejoin, with no duplicate grant.
- Text HUD displays health, coins, inventory count and objective.
- Observe room health/tick and errors using supported diagnostics.

**Gate 0:** No full-region polish until all proof-of-concept tests pass.

## Implementation milestones and deliverable checklists
### Phase 1 — First playable region
**Deliver:** Lantern's Reach blockout + Briarwild path + quarry branch, 3 functional NPCs, walk/camera/interact, basic HUD, wolf enemy, first quest, ore crafting loop.
**Test:** A fresh player completes walk → speak → fight → gather → craft → equip → reconnect in one uninterrupted loop.

### Phase 2 — Character depth
**Deliver:** 3 disciplines, equipment system, initial skills page, cooking loop, vendor/bank, level-up and gear tooltip.
**Test:** Weapon stats change real damage, recipes use materials exactly once, player does not lose progress while switching regions.

### Phase 3 — Cooperative loop
**Deliver:** party invites where implementable, co-op battle, private reward handling, group frames and Mini-boss.
**Test:** 2–4 players succeed; each gets proper rewards; leave/rejoin doesn't duplicate loot.

### Phase 4 — Hollowcrypt dungeon
**Deliver:** independent place/instance, entrance, boss mechanic, checkpoints and return.
**Test:** two groups cannot influence each other's dungeon instance; dungeon can reset without leaving stale objects.

### Phase 5 — Expansion & public beta
**Deliver:** Sorrowfen, more crafting/reagents, difficulty tuning, UI polish, performance profiles, accessibility, retention events where supported.
**Test:** invited cohort completes repeat sessions without persistent-data corruption; known critical issues fixed.

## Failure-based QA test scenarios
| ID | Setup | Action | Expected result |
| QA-001 | New character | Connect and enter Lantern's Reach | Character can move and see tutorial |
| QA-002 | Two different players | Join same world, change position | Both see each other; no desync crashes |
| QA-003 | Quest near complete | Trigger reward twice rapidly | Exactly one reward issued |
| QA-004 | One item near full bag | Gather resource | Correct success or clear full-inventory error |
| QA-005 | Craft ingredients in bag | Click craft twice | Item/count not duplicated |
| QA-006 | Coins below purchase cost | Buy expensive item | No purchase, no negative coin balance |
| QA-007 | Player just gained item | Leave and rejoin | New item and XP remain once |
| QA-008 | Enemy at leash boundary | Lure enemy out, disengage | Resets correctly |
| QA-009 | Two players on one ore | Gather simultaneously | Node and rewards obey defined rule |
| QA-010 | Two dungeon groups | Enter separately | Actors, loot and bosses are independent |
| QA-011 | Any active HUD | Change viewport width | Controls remain legible/clickable |
| QA-012 | Previous save exists | Apply feature update | Existing save loads, no accidental reset |

## Performance and optimization goals
Treat 60fps on mainstream desktop as a goal, not a guaranteed platform entitlement. Set measurements for camera responsiveness, visual clarity, network smoothness and server health in actual spawned sessions. Begin with low-cost primitives and modular materials. Keep active enemy behavior counts small; cull or simplify effects when distant. Test 1920x1080 and 1366x768, plus narrower screens when mobile is in scope. Observe scene load time, frame hitches, and world tick/health where current APIs allow.

## Stability and change management
- Before each major feature: describe baseline behavior and record test accounts/scenes.
- After feature: run the smallest relevant QA subset and one regression walkthrough of the main player loop.
- When a regression occurs: stop adding features, identify minimal offending change, restore known good state via normal Git workflow (avoid force pushes), retest saves.
- Never merge asset imports without verifying license provenance and browser load performance.
- Use concise milestones and closed bug reports with repro steps, expected, actual and screenshots as available.

## Public-beta decisions and risks
**Do not launch player-to-player economy** until transaction safety, duplication and disconnect recovery are proved.
**Do not advertise large MMO concurrency** until representative load and session tests succeed.
**Do not promise cross-world shared characters, payments, or guild features** before checking terms and APIs.
**Keep license compliance** for every imported art, sound, font and reference.
**Account moderation:** explore available chat controls and reporting, and restrict open chat until abuse handling is adequate.

## Release checklist
- [ ] New player can finish tutorial and first quest.
- [ ] Two players can fight and gather without corruption.
- [ ] Saved XP, items, quests and coins persist after reconnect.
- [ ] A dungeon only ships if instance separation passes.
- [ ] No critical crafting, trading or inventory duplication exploits.
- [ ] Every interface screen has keyboard behavior and reasonable contrast.
- [ ] Privacy, permissions, tokens and asset licenses reviewed.
- [ ] Publish description accurately represents current implemented features.

## Agent documentation and sources
- Spawn agent contract: https://www.spawn.co/llms.txt
- Spawn platform: https://www.spawn.co/about
- Bringing external code: https://www.spawn.co/about/bring-a-game
- World-specific agent docs (requires actual world ID and access): https://www.spawn.co/api/sdk/v1/<worldId>/agent/docs
