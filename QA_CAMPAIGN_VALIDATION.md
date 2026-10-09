# Campaign verification — October 8, 2026

Verified against main dbe984a and engine spec 1724 by @@spaiber.

- 209 implemented quest definitions parsed.
- Every quest giver and receiver resolves to a placed object tagged quest-npc; every scene parsed successfully. This checks authored placements, not accessibility or collision.
- Six races × four classes × two branches: all 48 synthetic routes reach VEI-09 using the actual published eligibility and XP functions.
- Q001 refuses all six origins until their corresponding origin finale is complete, and accepts each after that finale.
- Previous data audit found no missing dependency IDs or unknown item rewards.

The route simulation completes objectives synthetically and includes all available optional quest XP, with no combat or gathering XP. It does not prove quest pacing, combat difficulty, physical NPC reachability, party behavior or persistence. The source plan's 300 quests is not a claim that 300 are implemented; the current count is 209.

## Remaining gates

1. Fresh-character main-menu → origin → Q001 playthrough using normal input.
2. Claim quest/chest reward, leave, rejoin, inspect SQL-backed character state and attempt repeat claim.
3. Traverse giver/receiver approaches and objective sites, including origins surrounded by higher-level regions.
4. Actual two-player reward ownership/reconnect check.
5. Rendered review of NPC bows and rigs; profile world arrival/rendering before increasing art density.

No player state was mutated by the read-only engine audit. Local JSON evidence is in the creator's Codex task outputs, campaign-route-engine-audit.json and quest-placement-audit.json.
