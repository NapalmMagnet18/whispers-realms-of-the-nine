# Campaign verification — October 8, 2026

Verified against main dbe984a and engine spec 1724 by @@spaiber.

- 209 implemented quest definitions parsed.
- Every quest giver and receiver resolves to a placed object tagged quest-npc; every scene parsed successfully. This checks authored placements, not accessibility or collision.
- Six races × four classes × two branches: all 48 synthetic routes reach VEI-09 using the actual published eligibility and XP functions.
- Q001 refuses all six origins until their corresponding origin finale is complete, and accepts each after that finale.
- Previous data audit found no missing dependency IDs or unknown item rewards.

The route simulation completes objectives synthetically and includes all available optional quest XP, with no combat or gathering XP. It does not prove quest pacing, combat difficulty, physical NPC reachability, party behavior or persistence. The source plan's 300 quests is not a claim that 300 are implemented; the current count is 209.

## Remaining gates

### QA-REJOIN-001 — real QA body, October 8 (spaiber)

Created SpaiberLanternQA (Marchborn Vanguard) through the creation UI on the agent-owned spaiber_qa body. The actual save path acknowledged its SQL write. Disconnected, rejoined the same body, saw the hero in the roster and selected Enter World. Name, race, class, level, copper, XP and starter sword/robes matched the pre-disconnect state. Empty bag, bank, quest and cache fields also matched; this does not test nonempty contents. One second of real W input moved the restored hero 5.933 metres (rounded).

This is a real creation/save/rejoin smoke test, not a full origin loop. UI click handlers were dispatched through Playwright because the CPU canvas intercepted physical pointer clicks. Direct SQL inspection was unavailable through the installed client: run_script has no player @caller and accepts only published SQL statements; its suggested game_db command is not exposed by this client. SQL acknowledgement is inferred from the game's confirmed-save fingerprint. The QA hero remains for the next run; no saves deleted. Detailed state captures and comparisons are in the Codex outputs, qa-rejoin-summary.json.

1. Continue the existing QA hero through its origin → Q001; creation and basic rejoin smoke test passed as above.
2. Claim quest/chest reward, leave, rejoin, inspect SQL-backed character state and attempt repeat claim.
3. Traverse giver/receiver approaches and objective sites, including origins surrounded by higher-level regions.
4. Actual two-player reward ownership/reconnect check.
5. Rendered review of NPC bows and rigs; profile world arrival/rendering before increasing art density.

No player state was mutated by the read-only engine audit. Local JSON evidence is in the creator's Codex task outputs, campaign-route-engine-audit.json and quest-placement-audit.json.
