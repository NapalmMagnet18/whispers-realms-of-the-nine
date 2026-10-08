# THE SHATTERED ACCORD — COMPLETE GAME CAMPAIGN & QUEST BIBLE
**Book One  |  Expanded edition 2.0  |  Spawn/Savi production draft**
**Total:** 300 individually indexed quests. 201 legacy quests unchanged in ID; 99 new optional community/profession quests.

## How to interpret the quest specification
A golden marker denotes shared main campaign or required origin; blue denotes class trials; silver denotes optional community; green denotes profession. All quest flags and reward receipts must be stored atomically in a supported persistence method. Each objective below is authoring intent, not evidence it is implemented in Spawn.
Every race finishes one of six origin finale IDs; Q001 checks an OR gate. Every combat class can begin its chain after Q001. At level ~25, finish either Tideglass or Deepgrove; Velthraen uses the OR gate TID-09 or BRD-09. No optional profession or community quest gates the season ending.

## Reading order / world progression
- **Levels 1–5 · Racial Origin:** Eight introductory quests in one protected start.
- **Levels 6–11 · Lantern's Reach:** Eight shared town tutorial and omen quests.
- **Levels 12–16 · Emberstone Quarry:** Nine public evidence and mining quests.
- **Levels 17–20 · Hollowcrypt:** Four encounters; story-mode projection accepted.
- **Levels 21–24 · Sorrowfen:** Nine testimony quests and regional closure.
- **Levels 25–30 · Tideglass OR Deepgrove:** One of two independent nine-quest campaigns.
- **Levels 31–37 · Velthraen Reach:** Nine convergence and observatory quests.
- **Levels 38–44 · Emberstone Bastion:** Nine engine and civic response quests.
- **Levels 45–51 · Glassmere Archive:** Nine archive and withdrawal-clause quests.
- **Levels 52–60 · The Ninth Veil:** Nine finale zone quests plus closing assembly.

## Marchfolk Origin: Names on a Census
**Location:** Lantern Ward  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### MAR-01 — The Bell Before Dawn
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-01`. **Reward:** Starter Coat + 10 XP.
**Objectives:** Speak to Gatekeeper Elric; examine the town census board.
**Story consequence:** A whole line of homes has been rubbed from the ward ledger.
**Requires all:** None. 
**Quest acceptance:** In Lantern Ward, Gatekeeper Elric needs you to speak to Gatekeeper Elric.
**Turn-in dialogue:** A whole line of homes has been rubbed from the ward ledger.
**Completion flag:** `completed.MAR-01` (grant reward once; persist before UI reward acknowledgment).

### MAR-02 — A Face in the Crowd
**Giver:** Quartermaster Dren. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-02`. **Reward:** Copper Coins + Trading tutorial.
**Objectives:** Deliver three supply parcels; ask two neighbors about the vanished address.
**Story consequence:** Each neighbor remembers a different color for a house that apparently never existed.
**Requires all:** MAR-01. 
**Quest acceptance:** In Lantern Ward, Quartermaster Dren needs you to deliver three supply parcels.
**Turn-in dialogue:** Each neighbor remembers a different color for a house that apparently never existed.
**Completion flag:** `completed.MAR-02` (grant reward once; persist before UI reward acknowledgment).

### MAR-03 — The Empty Door
**Giver:** Bram Alder. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-03`. **Reward:** Lantern Scrap + Discovery XP.
**Objectives:** Follow chalk marks to a walled door; inspect its latch.
**Story consequence:** The sealed doorway opens inward from a street that has no counterpart.
**Requires all:** MAR-02. 
**Quest acceptance:** In Lantern Ward, Bram Alder needs you to follow chalk marks to a walled door.
**Turn-in dialogue:** The sealed doorway opens inward from a street that has no counterpart.
**Completion flag:** `completed.MAR-03` (grant reward once; persist before UI reward acknowledgment).

### MAR-04 — Three Names Too Few
**Giver:** Sister Vale. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-04`. **Reward:** Archive Note + Lore tab.
**Objectives:** Collect three lost notices; compare them with the bell roll.
**Story consequence:** The notices are dated tomorrow and signed by people no one can find.
**Requires all:** MAR-03. 
**Quest acceptance:** In Lantern Ward, Sister Vale needs you to collect three lost notices.
**Turn-in dialogue:** The notices are dated tomorrow and signed by people no one can find.
**Completion flag:** `completed.MAR-04` (grant reward once; persist before UI reward acknowledgment).

### MAR-05 — Keep the Light
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-05`. **Reward:** First combat gear + XP.
**Objectives:** Light two storm lamps; defend the bell rope from two echo shades.
**Story consequence:** The shades whisper a list of names instead of attacking ordinary townsfolk.
**Requires all:** MAR-04. 
**Quest acceptance:** In Lantern Ward, Gatekeeper Elric needs you to light two storm lamps.
**Turn-in dialogue:** The shades whisper a list of names instead of attacking ordinary townsfolk.
**Completion flag:** `completed.MAR-05` (grant reward once; persist before UI reward acknowledgment).

### MAR-06 — A Ledger of Ash
**Giver:** Mira the Forgekeeper. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-06`. **Reward:** Crafting component + XP.
**Objectives:** Collect soot from the old furnace; uncover a brass maker mark.
**Story consequence:** The furnace was used to burn documents, not ore, during the First Silence.
**Requires all:** MAR-05. 
**Quest acceptance:** In Lantern Ward, Mira the Forgekeeper needs you to collect soot from the old furnace.
**Turn-in dialogue:** The furnace was used to burn documents, not ore, during the First Silence.
**Completion flag:** `completed.MAR-06` (grant reward once; persist before UI reward acknowledgment).

### MAR-07 — No Grave, No Record
**Giver:** Sister Vale. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-01`. **Reward:** Marchfolk Lantern Token + Reputation.
**Objectives:** Read a forgotten memorial plaque; present it to Elric.
**Story consequence:** Elric finally admits that he once signed an order to cross out a district.
**Requires all:** MAR-06. 
**Quest acceptance:** In Lantern Ward, Sister Vale needs you to read a forgotten memorial plaque.
**Turn-in dialogue:** Elric finally admits that he once signed an order to cross out a district.
**Completion flag:** `completed.MAR-07` (grant reward once; persist before UI reward acknowledgment).

### MAR-08 — Open the Eastern Gate
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Choose whether to archive or publicly display the memorial; travel to Lantern's Reach square.
**Story consequence:** The Marchfolk entry ends with the promise that truth cannot be private forever.
**Requires all:** MAR-07. 
**Quest acceptance:** In Lantern Ward, Gatekeeper Elric needs you to choose whether to archive or publicly display the memorial.
**Turn-in dialogue:** The Marchfolk entry ends with the promise that truth cannot be private forever.
**Completion flag:** `completed.MAR-08` (grant reward once; persist before UI reward acknowledgment).

## Thren Origin: The Root That Learned a Name
**Location:** Rootwake Glade  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### THR-01 — A Seed Without Spring
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-01`. **Reward:** Root Seed + Gathering tutorial.
**Objectives:** Collect three memory seeds from the glade; plant one at the witness stump.
**Story consequence:** One seed refuses a grave and grows toward the old road.
**Requires all:** None. 
**Quest acceptance:** In Rootwake Glade, Elder Fenna Rootwake needs you to collect three memory seeds from the glade.
**Turn-in dialogue:** One seed refuses a grave and grows toward the old road.
**Completion flag:** `completed.THR-01` (grant reward once; persist before UI reward acknowledgment).

### THR-02 — The Branch of Hands
**Giver:** Grove Singer Ell. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-02`. **Reward:** Lore Glyph + XP.
**Objectives:** Examine three hand-shaped roots; record their whispers.
**Story consequence:** A forbidden name is repeated in sap vibrations, but the forest elder interrupts.
**Requires all:** THR-01. 
**Quest acceptance:** In Rootwake Glade, Grove Singer Ell needs you to examine three hand-shaped roots.
**Turn-in dialogue:** A forbidden name is repeated in sap vibrations, but the forest elder interrupts.
**Completion flag:** `completed.THR-02` (grant reward once; persist before UI reward acknowledgment).

### THR-03 — Hungry Bark
**Giver:** Tamsin the Ranger. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-03`. **Reward:** Pathfinder tonic + Combat XP.
**Objectives:** Fend off two bramble-struck beasts; spare a pacified beast.
**Story consequence:** The creatures are frightened by a metallic ringing beneath the soil.
**Requires all:** THR-02. 
**Quest acceptance:** In Rootwake Glade, Tamsin the Ranger needs you to fend off two bramble-struck beasts.
**Turn-in dialogue:** The creatures are frightened by a metallic ringing beneath the soil.
**Completion flag:** `completed.THR-03` (grant reward once; persist before UI reward acknowledgment).

### THR-04 — Gatherer of Last Words
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-04`. **Reward:** Memory Leaf + XP.
**Objectives:** Collect four fallen leaf-notes; arrange them around a memorial bowl.
**Story consequence:** The grove keeps even the memories of those who caused harm.
**Requires all:** THR-03. 
**Quest acceptance:** In Rootwake Glade, Elder Fenna Rootwake needs you to collect four fallen leaf-notes.
**Turn-in dialogue:** The grove keeps even the memories of those who caused harm.
**Completion flag:** `completed.THR-04` (grant reward once; persist before UI reward acknowledgment).

### THR-05 — The Root Below
**Giver:** Grove Singer Ell. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-05`. **Reward:** Bellglass Shard + Interact tutorial.
**Objectives:** Descend a safe root tunnel; cut a bellglass shard free without damaging roots.
**Story consequence:** The shard hums with the voice of a child who still believes someone will return.
**Requires all:** THR-04. 
**Quest acceptance:** In Rootwake Glade, Grove Singer Ell needs you to descend a safe root tunnel.
**Turn-in dialogue:** The shard hums with the voice of a child who still believes someone will return.
**Completion flag:** `completed.THR-05` (grant reward once; persist before UI reward acknowledgment).

### THR-06 — What We Do Not Burn
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-06`. **Reward:** Glade Charm + XP.
**Objectives:** Choose one testimony to preserve publicly; protect a seedling from rootblight.
**Story consequence:** The child name is not a curse; it was erased by an old compromise.
**Requires all:** THR-05. 
**Quest acceptance:** In Rootwake Glade, Elder Fenna Rootwake needs you to choose one testimony to preserve publicly.
**Turn-in dialogue:** The child name is not a curse; it was erased by an old compromise.
**Completion flag:** `completed.THR-06` (grant reward once; persist before UI reward acknowledgment).

### THR-07 — The Walk of Witnesses
**Giver:** Tamsin the Ranger. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-01`. **Reward:** Rootwake Seed Sigil + XP.
**Objectives:** Repair the woodland footbridge; escort an old witness to the border.
**Story consequence:** The waystones point to a living signal in Lantern's Reach.
**Requires all:** THR-06. 
**Quest acceptance:** In Rootwake Glade, Tamsin the Ranger needs you to repair the woodland footbridge.
**Turn-in dialogue:** The waystones point to a living signal in Lantern's Reach.
**Completion flag:** `completed.THR-07` (grant reward once; persist before UI reward acknowledgment).

### THR-08 — Between Grove and Bell
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Speak the lost name over the stream; leave for Lantern's Reach.
**Story consequence:** The trees refuse to hold a truth that belongs to the living alone.
**Requires all:** THR-07. 
**Quest acceptance:** In Rootwake Glade, Elder Fenna Rootwake needs you to speak the lost name over the stream.
**Turn-in dialogue:** The trees refuse to hold a truth that belongs to the living alone.
**Completion flag:** `completed.THR-08` (grant reward once; persist before UI reward acknowledgment).

## Kharic Origin: The Quarry Has a Voice
**Location:** Emberstone Cradle  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### KHA-01 — First Chisel
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-01`. **Reward:** Training Chisel + Mining tutorial.
**Objectives:** Mine two copper nodes; repair the novice chisel.
**Story consequence:** A buried note rings in the novice chisel.
**Requires all:** None. 
**Quest acceptance:** In Emberstone Cradle, Mason Yurra Flint-Eye needs you to mine two copper nodes.
**Turn-in dialogue:** A buried note rings in the novice chisel.
**Completion flag:** `completed.KHA-01` (grant reward once; persist before UI reward acknowledgment).

### KHA-02 — Stones That Should Be Silent
**Giver:** Quarry Foreman Kiv. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-02`. **Reward:** Ore Chips + XP.
**Objectives:** Inspect cracked pillars; compare their tones with a tuning hammer.
**Story consequence:** The cracks follow letters in a script that predates the quarry.
**Requires all:** KHA-01. 
**Quest acceptance:** In Emberstone Cradle, Quarry Foreman Kiv needs you to inspect cracked pillars.
**Turn-in dialogue:** The cracks follow letters in a script that predates the quarry.
**Completion flag:** `completed.KHA-02` (grant reward once; persist before UI reward acknowledgment).

### KHA-03 — The Closed Shift
**Giver:** Quartermaster Dren. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-03`. **Reward:** Coins + Reputation.
**Objectives:** Recover three shift tokens; count the missing miners.
**Story consequence:** The tokens belong to a work crew absent from all payrolls.
**Requires all:** KHA-02. 
**Quest acceptance:** In Emberstone Cradle, Quartermaster Dren needs you to recover three shift tokens.
**Turn-in dialogue:** The tokens belong to a work crew absent from all payrolls.
**Completion flag:** `completed.KHA-03` (grant reward once; persist before UI reward acknowledgment).

### KHA-04 — Resonance Underfoot
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-04`. **Reward:** Tuning Stone + Puzzle tutorial.
**Objectives:** Enter a shallow training tunnel; activate two tuning stones.
**Story consequence:** The floor sings an impossible duet when one miner speaks.
**Requires all:** KHA-03. 
**Quest acceptance:** In Emberstone Cradle, Mason Yurra Flint-Eye needs you to enter a shallow training tunnel.
**Turn-in dialogue:** The floor sings an impossible duet when one miner speaks.
**Completion flag:** `completed.KHA-04` (grant reward once; persist before UI reward acknowledgment).

### KHA-05 — The Lighter Vein
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-05`. **Reward:** Novice Weapon + Crafting XP.
**Objectives:** Smelt one copper bar; compare it with one bellglass fragment.
**Story consequence:** Bellglass is compressed, unspoken testimony, not ordinary mineral.
**Requires all:** KHA-04. 
**Quest acceptance:** In Emberstone Cradle, Mira the Forgekeeper needs you to smelt one copper bar.
**Turn-in dialogue:** Bellglass is compressed, unspoken testimony, not ordinary mineral.
**Completion flag:** `completed.KHA-05` (grant reward once; persist before UI reward acknowledgment).

### KHA-06 — A Seal in the Wall
**Giver:** Quarry Foreman Kiv. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-06`. **Reward:** Rust Seal + XP.
**Objectives:** Defend the tunnel mouth from three scavengers; recover an old seal.
**Story consequence:** The sealed excavation leads toward the Hollowcrypt foundation.
**Requires all:** KHA-05. 
**Quest acceptance:** In Emberstone Cradle, Quarry Foreman Kiv needs you to defend the tunnel mouth from three scavengers.
**Turn-in dialogue:** The sealed excavation leads toward the Hollowcrypt foundation.
**Completion flag:** `completed.KHA-06` (grant reward once; persist before UI reward acknowledgment).

### KHA-07 — Honest Stone
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-01`. **Reward:** Chisel of Witness + Reputation.
**Objectives:** Preserve the lost miners' names by cutting them on the new lintel.
**Story consequence:** The ancestors sealed a chamber knowing somebody was still inside.
**Requires all:** KHA-06. 
**Quest acceptance:** In Emberstone Cradle, Mason Yurra Flint-Eye needs you to preserve the lost miners' names by cutting them on the new lintel.
**Turn-in dialogue:** The ancestors sealed a chamber knowing somebody was still inside.
**Completion flag:** `completed.KHA-07` (grant reward once; persist before UI reward acknowledgment).

### KHA-08 — Road to the Living Bell
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Leave your old chisel at the shrine; travel to Lantern's Reach.
**Story consequence:** The Kharic vow to record the cost of every miracle before accepting another.
**Requires all:** KHA-07. 
**Quest acceptance:** In Emberstone Cradle, Mason Yurra Flint-Eye needs you to leave your old chisel at the shrine.
**Turn-in dialogue:** The Kharic vow to record the cost of every miracle before accepting another.
**Completion flag:** `completed.KHA-08` (grant reward once; persist before UI reward acknowledgment).

## Namar Origin: Harbor of the Uncharted
**Location:** Breakwater Strand  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### NAM-01 — Tide on the Wrong Hour
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-01`. **Reward:** Tide Chart + Navigation tutorial.
**Objectives:** Chart three tide marks; report the reversed current.
**Story consequence:** The ebb is carrying fragments of a harbor song upstream.
**Requires all:** None. 
**Quest acceptance:** In Breakwater Strand, Pilot Sena Wavebound needs you to chart three tide marks.
**Turn-in dialogue:** The ebb is carrying fragments of a harbor song upstream.
**Completion flag:** `completed.NAM-01` (grant reward once; persist before UI reward acknowledgment).

### NAM-02 — A Shell That Answered
**Giver:** Shellkeeper Ruun. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-02`. **Reward:** Conch Token + XP.
**Objectives:** Collect four shell echoes; listen through a hollow conch.
**Story consequence:** An entire fleet calls from the inland hills.
**Requires all:** NAM-01. 
**Quest acceptance:** In Breakwater Strand, Shellkeeper Ruun needs you to collect four shell echoes.
**Turn-in dialogue:** An entire fleet calls from the inland hills.
**Completion flag:** `completed.NAM-02` (grant reward once; persist before UI reward acknowledgment).

### NAM-03 — The False Beacon
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-03`. **Reward:** Lantern Oil + XP.
**Objectives:** Inspect the unmapped lighthouse; relight two coastal lamps.
**Story consequence:** The light points away from the sea, toward Lantern's Reach.
**Requires all:** NAM-02. 
**Quest acceptance:** In Breakwater Strand, Pilot Sena Wavebound needs you to inspect the unmapped lighthouse.
**Turn-in dialogue:** The light points away from the sea, toward Lantern's Reach.
**Completion flag:** `completed.NAM-03` (grant reward once; persist before UI reward acknowledgment).

### NAM-04 — The Nets Are Empty
**Giver:** Netmaker Sari. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-04`. **Reward:** Fishing Kit + Fishing XP.
**Objectives:** Catch two reef fish; rescue one trapped skiff.
**Story consequence:** Shadows under the nets are sailors who have no names in memory.
**Requires all:** NAM-03. 
**Quest acceptance:** In Breakwater Strand, Netmaker Sari needs you to catch two reef fish.
**Turn-in dialogue:** Shadows under the nets are sailors who have no names in memory.
**Completion flag:** `completed.NAM-04` (grant reward once; persist before UI reward acknowledgment).

### NAM-05 — Salt Against Glass
**Giver:** Shellkeeper Ruun. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-05`. **Reward:** Washed Glass + XP.
**Objectives:** Recover a glass fragment from a wreck; wash it in the tidal pool.
**Story consequence:** Bellglass stops singing when allowed to hear a consenting voice.
**Requires all:** NAM-04. 
**Quest acceptance:** In Breakwater Strand, Shellkeeper Ruun needs you to recover a glass fragment from a wreck.
**Turn-in dialogue:** Bellglass stops singing when allowed to hear a consenting voice.
**Completion flag:** `completed.NAM-05` (grant reward once; persist before UI reward acknowledgment).

### NAM-06 — Songs of the Lost Fleet
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-06`. **Reward:** Coast Mantle + Combat XP.
**Objectives:** Defend three stranded sailors from phantom currents; learn the harbor refrain.
**Story consequence:** The fleet was not wrecked; it became a living seal for an old breach.
**Requires all:** NAM-05. 
**Quest acceptance:** In Breakwater Strand, Pilot Sena Wavebound needs you to defend three stranded sailors from phantom currents.
**Turn-in dialogue:** The fleet was not wrecked; it became a living seal for an old breach.
**Completion flag:** `completed.NAM-06` (grant reward once; persist before UI reward acknowledgment).

### NAM-07 — Compass for the Forgotten
**Giver:** Shellkeeper Ruun. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-01`. **Reward:** Tideglass Compass + XP.
**Objectives:** Make a tideglass compass; choose which old route to map publicly.
**Story consequence:** The Namar must decide whether protection excuses concealment.
**Requires all:** NAM-06. 
**Quest acceptance:** In Breakwater Strand, Shellkeeper Ruun needs you to make a tideglass compass.
**Turn-in dialogue:** The Namar must decide whether protection excuses concealment.
**Completion flag:** `completed.NAM-07` (grant reward once; persist before UI reward acknowledgment).

### NAM-08 — A Road Made of Water
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Cross the safe ferry lane; meet Rowan the Ferryman at Lantern's Reach.
**Story consequence:** The inland rivers are carrying messages the coast can no longer contain.
**Requires all:** NAM-07. 
**Quest acceptance:** In Breakwater Strand, Pilot Sena Wavebound needs you to cross the safe ferry lane.
**Turn-in dialogue:** The inland rivers are carrying messages the coast can no longer contain.
**Completion flag:** `completed.NAM-08` (grant reward once; persist before UI reward acknowledgment).

## Reedbound Origin: The Names in the Reeds
**Location:** Reedhaven Refuge  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### REH-01 — When the Reeds Bow
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-01`. **Reward:** Braided Knot + Gathering XP.
**Objectives:** Gather three marsh reeds; braid the first witness knot.
**Story consequence:** The reeds bow toward voices rather than wind.
**Requires all:** None. 
**Quest acceptance:** In Reedhaven Refuge, Reedkeeper Iona Sedge needs you to gather three marsh reeds.
**Turn-in dialogue:** The reeds bow toward voices rather than wind.
**Completion flag:** `completed.REH-01` (grant reward once; persist before UI reward acknowledgment).

### REH-02 — The Lantern in the Water
**Giver:** Wisp Tender Kele. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-02`. **Reward:** Wisp Jar + Interaction tutorial.
**Objectives:** Capture two harmless stray wisps; return them to the memorial pool.
**Story consequence:** The wisps repeat the last words of missing relatives.
**Requires all:** REH-01. 
**Quest acceptance:** In Reedhaven Refuge, Wisp Tender Kele needs you to capture two harmless stray wisps.
**Turn-in dialogue:** The wisps repeat the last words of missing relatives.
**Completion flag:** `completed.REH-02` (grant reward once; persist before UI reward acknowledgment).

### REH-03 — Dry Feet, Safe Path
**Giver:** Marsh Guide Pell. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-03`. **Reward:** Boot Upgrade + Navigation XP.
**Objectives:** Place four safe-path markers; avoid the deep mire.
**Story consequence:** The previous markers were moved on purpose to isolate the refuge.
**Requires all:** REH-02. 
**Quest acceptance:** In Reedhaven Refuge, Marsh Guide Pell needs you to place four safe-path markers.
**Turn-in dialogue:** The previous markers were moved on purpose to isolate the refuge.
**Completion flag:** `completed.REH-03` (grant reward once; persist before UI reward acknowledgment).

### REH-04 — Guests We Cannot Bury
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-04`. **Reward:** Reed Book + Lore XP.
**Objectives:** Speak with three mourners; read the woven roll of names.
**Story consequence:** The mourners remember the same people at different ages.
**Requires all:** REH-03. 
**Quest acceptance:** In Reedhaven Refuge, Reedkeeper Iona Sedge needs you to speak with three mourners.
**Turn-in dialogue:** The mourners remember the same people at different ages.
**Completion flag:** `completed.REH-04` (grant reward once; persist before UI reward acknowledgment).

### REH-05 — A Hush Beneath the Boards
**Giver:** Marsh Guide Pell. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-05`. **Reward:** Marsh Salve + Combat XP.
**Objectives:** Explore the dry cellar; cleanse two tainted bellglass knots.
**Story consequence:** The taint originates from a newly installed Beacon Guild signal device.
**Requires all:** REH-04. 
**Quest acceptance:** In Reedhaven Refuge, Marsh Guide Pell needs you to explore the dry cellar.
**Turn-in dialogue:** The taint originates from a newly installed Beacon Guild signal device.
**Completion flag:** `completed.REH-05` (grant reward once; persist before UI reward acknowledgment).

### REH-06 — The Wisp Chooses
**Giver:** Wisp Tender Kele. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-06`. **Reward:** Wisp Companion Visual + XP.
**Objectives:** Offer a wisp an unmarked lantern; protect it without binding it.
**Story consequence:** The wisp becomes a guide only after being asked, not commanded.
**Requires all:** REH-05. 
**Quest acceptance:** In Reedhaven Refuge, Wisp Tender Kele needs you to offer a wisp an unmarked lantern.
**Turn-in dialogue:** The wisp becomes a guide only after being asked, not commanded.
**Completion flag:** `completed.REH-06` (grant reward once; persist before UI reward acknowledgment).

### REH-07 — The Floating Memorial
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-01`. **Reward:** Reedhaven Wisp Jar + XP.
**Objectives:** Release three braided names into the marsh; retrieve one hidden map.
**Story consequence:** The map leads to an old crossing beneath Lantern's Reach.
**Requires all:** REH-06. 
**Quest acceptance:** In Reedhaven Refuge, Reedkeeper Iona Sedge needs you to release three braided names into the marsh.
**Turn-in dialogue:** The map leads to an old crossing beneath Lantern's Reach.
**Completion flag:** `completed.REH-07` (grant reward once; persist before UI reward acknowledgment).

### REH-08 — Leaving the Safe Water
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Mark the danger boundary for new travelers; take the river road to Lantern's Reach.
**Story consequence:** Reedhaven stays accessible while the outer Sorrowfen remains a higher-level zone.
**Requires all:** REH-07. 
**Quest acceptance:** In Reedhaven Refuge, Reedkeeper Iona Sedge needs you to mark the danger boundary for new travelers.
**Turn-in dialogue:** Reedhaven stays accessible while the outer Sorrowfen remains a higher-level zone.
**Completion flag:** `completed.REH-08` (grant reward once; persist before UI reward acknowledgment).

## Veylori Origin: The Constellation That Fell
**Location:** Starfall Eyrie  |  **Levels:** 1–5  |  **Quests:** 8  |  **Type:** origin

### VEY-01 — The Missing Point
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-01`. **Reward:** Novice Lens + Observation tutorial.
**Objectives:** Align three novice sky lenses; identify the absent constellation.
**Story consequence:** The chart contains nine stations but the sky has only eight.
**Requires all:** None. 
**Quest acceptance:** In Starfall Eyrie, Astromer Neris Sol needs you to align three novice sky lenses.
**Turn-in dialogue:** The chart contains nine stations but the sky has only eight.
**Completion flag:** `completed.VEY-01` (grant reward once; persist before UI reward acknowledgment).

### VEY-02 — Wind Over the Abyss
**Giver:** Glidewarden Ires. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-02`. **Reward:** Wind Token + XP.
**Objectives:** Cross the protected stone span; activate two wind chimes.
**Story consequence:** The chimes strike a forbidden ninth note.
**Requires all:** VEY-01. 
**Quest acceptance:** In Starfall Eyrie, Glidewarden Ires needs you to cross the protected stone span.
**Turn-in dialogue:** The chimes strike a forbidden ninth note.
**Completion flag:** `completed.VEY-02` (grant reward once; persist before UI reward acknowledgment).

### VEY-03 — A Light from Below
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-03`. **Reward:** Astromer Shard + XP.
**Objectives:** Examine meteor fragments; distinguish starlight from bellglass.
**Story consequence:** The fallen meteor is manufactured from a terrestrial memory.
**Requires all:** VEY-02. 
**Quest acceptance:** In Starfall Eyrie, Astromer Neris Sol needs you to examine meteor fragments.
**Turn-in dialogue:** The fallen meteor is manufactured from a terrestrial memory.
**Completion flag:** `completed.VEY-03` (grant reward once; persist before UI reward acknowledgment).

### VEY-04 — The Observatory Listens
**Giver:** Star Reader Otho. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-04`. **Reward:** Sky Chart + Lore XP.
**Objectives:** Track a moving sky-rune; record its path.
**Story consequence:** Its motion traces the inland road to Lantern's Reach.
**Requires all:** VEY-03. 
**Quest acceptance:** In Starfall Eyrie, Star Reader Otho needs you to track a moving sky-rune.
**Turn-in dialogue:** Its motion traces the inland road to Lantern's Reach.
**Completion flag:** `completed.VEY-04` (grant reward once; persist before UI reward acknowledgment).

### VEY-05 — The False Star
**Giver:** Glidewarden Ires. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-05`. **Reward:** Light Cloak + Combat XP.
**Objectives:** Defend the lens array from two aerial shades; reset the counterweights.
**Story consequence:** The shades try to hide one name engraved on the telescope.
**Requires all:** VEY-04. 
**Quest acceptance:** In Starfall Eyrie, Glidewarden Ires needs you to defend the lens array from two aerial shades.
**Turn-in dialogue:** The shades try to hide one name engraved on the telescope.
**Completion flag:** `completed.VEY-05` (grant reward once; persist before UI reward acknowledgment).

### VEY-06 — A Question of Altitude
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-06`. **Reward:** Windharp + XP.
**Objectives:** Read the telescope inscription aloud; choose to publish or conceal it.
**Story consequence:** The Ninth was deliberately omitted from public maps by agreement of witnesses.
**Requires all:** VEY-05. 
**Quest acceptance:** In Starfall Eyrie, Astromer Neris Sol needs you to read the telescope inscription aloud.
**Turn-in dialogue:** The Ninth was deliberately omitted from public maps by agreement of witnesses.
**Completion flag:** `completed.VEY-06` (grant reward once; persist before UI reward acknowledgment).

### VEY-07 — The Right to Dissent
**Giver:** Star Reader Otho. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-01`. **Reward:** Starfall Lens + Reputation.
**Objectives:** Carry an uncensored chart through the watch assembly.
**Story consequence:** The skywatchers split over whether forgetting can be merciful.
**Requires all:** VEY-06. 
**Quest acceptance:** In Starfall Eyrie, Star Reader Otho needs you to carry an uncensored chart through the watch assembly.
**Turn-in dialogue:** The skywatchers split over whether forgetting can be merciful.
**Completion flag:** `completed.VEY-07` (grant reward once; persist before UI reward acknowledgment).

### VEY-08 — Descending to the Bell
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-02`. **Reward:** Origin completion flag + City access.
**Objectives:** Reach the mountain lift; travel to Lantern's Reach.
**Story consequence:** If a star can be erased, the world's oldest maps cannot be treated as truth.
**Requires all:** VEY-07. 
**Quest acceptance:** In Starfall Eyrie, Astromer Neris Sol needs you to reach the mountain lift.
**Turn-in dialogue:** If a star can be erased, the world's oldest maps cannot be treated as truth.
**Completion flag:** `completed.VEY-08` (grant reward once; persist before UI reward acknowledgment).

## Shared Tutorial: First Light
**Location:** Lantern's Reach / Lantern March  |  **Levels:** 5–12  |  **Quests:** 8  |  **Type:** core

### Q001 — Welcome to Lantern's Reach
**Giver:** Gatekeeper Elric. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-01`. **Reward:** Training blade + Coins.
**Objectives:** Talk to Gatekeeper Elric; register your arrival with the Beacon Guild.
**Story consequence:** Elric recognizes the mark carried by every origin, even those he has never seen.
**Requires all:** None. **Requires any:** MAR-08 OR THR-08 OR KHA-08 OR NAM-08 OR REH-08 OR VEY-08.
**Quest acceptance:** In Lantern's Reach / Lantern March, Gatekeeper Elric needs you to talk to Gatekeeper Elric.
**Turn-in dialogue:** Elric recognizes the mark carried by every origin, even those he has never seen.
**Completion flag:** `completed.Q001` (grant reward once; persist before UI reward acknowledgment).

### Q002 — A Light Against the Briars
**Giver:** Tamsin the Ranger. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-02`. **Reward:** XP + Coins.
**Objectives:** Defeat three wolves; return to Tamsin.
**Story consequence:** The wolves chase the pulse of a hidden bellglass device and need not be exterminated beyond the quest.
**Requires all:** Q001. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Tamsin the Ranger needs you to defeat three wolves.
**Turn-in dialogue:** The wolves chase the pulse of a hidden bellglass device and need not be exterminated beyond the quest.
**Completion flag:** `completed.Q002` (grant reward once; persist before UI reward acknowledgment).

### Q003 — The First Forge
**Giver:** Mira the Forgekeeper. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-03`. **Reward:** Forged blade + Crafting XP.
**Objectives:** Gather two ore; smelt one bar; craft a practice blade.
**Story consequence:** The forge rings with a voice saying “There should be nine.”
**Requires all:** Q002. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Mira the Forgekeeper needs you to gather two ore.
**Turn-in dialogue:** The forge rings with a voice saying “There should be nine.”
**Completion flag:** `completed.Q003` (grant reward once; persist before UI reward acknowledgment).

### Q004 — The Old River
**Giver:** Rowan the Ferryman. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-04`. **Reward:** Cooking ingredients + Fishing XP.
**Objectives:** Catch two river fish; cook one portion; deliver a meal to the dock watch.
**Story consequence:** A ferry manifest records passage to a dock no citizen can see.
**Requires all:** Q003. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Rowan the Ferryman needs you to catch two river fish.
**Turn-in dialogue:** A ferry manifest records passage to a dock no citizen can see.
**Completion flag:** `completed.Q004` (grant reward once; persist before UI reward acknowledgment).

### Q005 — Supply the Watch
**Giver:** Bram Alder. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-05`. **Reward:** Coins + Gathering XP.
**Objectives:** Deliver three timber bundles; help repair the eastern watch steps.
**Story consequence:** The repaired structure reveals a buried waymark pointing to Hollowcrypt.
**Requires all:** Q004. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Bram Alder needs you to deliver three timber bundles.
**Turn-in dialogue:** The repaired structure reveals a buried waymark pointing to Hollowcrypt.
**Completion flag:** `completed.Q005` (grant reward once; persist before UI reward acknowledgment).

### Q006 — Echoes at the Quarry
**Giver:** Mira the Forgekeeper. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-06`. **Reward:** Rare ore + XP.
**Objectives:** Defeat three quarry scavengers; investigate the damaged bellglass lamp.
**Story consequence:** A fresh Hollow Court maker seal has been pressed over a much older Accord mark.
**Requires all:** Q005. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Mira the Forgekeeper needs you to defeat three quarry scavengers.
**Turn-in dialogue:** A fresh Hollow Court maker seal has been pressed over a much older Accord mark.
**Completion flag:** `completed.Q006` (grant reward once; persist before UI reward acknowledgment).

### Q007 — Broken Sigil
**Giver:** Sister Vale. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-01`. **Reward:** Relic fragment + Lore XP.
**Objectives:** Locate three ancient sigil stones; place them in the witness recess.
**Story consequence:** Each stone answers only to a different voice; no solitary hero can restore the inscription.
**Requires all:** Q006. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Sister Vale needs you to locate three ancient sigil stones.
**Turn-in dialogue:** Each stone answers only to a different voice; no solitary hero can restore the inscription.
**Completion flag:** `completed.Q007` (grant reward once; persist before UI reward acknowledgment).

### Q008 — The Hollowcrypt Gate
**Giver:** Gatekeeper Elric. **Zone:** Lantern's Reach / Lantern March. **Atlas point:** `LANTCB5E-02`. **Reward:** Hollowcrypt access flag + XP.
**Objectives:** Inspect the Hollowcrypt seal; invite a party or select story-mode projection; speak with Sister Vale.
**Story consequence:** The first sealed district lies somewhere beneath the town, and the gate accepts witnesses, not owners.
**Requires all:** Q007. 
**Quest acceptance:** In Lantern's Reach / Lantern March, Gatekeeper Elric needs you to inspect the Hollowcrypt seal.
**Turn-in dialogue:** The first sealed district lies somewhere beneath the town, and the gate accepts witnesses, not owners.
**Completion flag:** `completed.Q008` (grant reward once; persist before UI reward acknowledgment).

## Vanguard Path: A Shield is Not a Crown
**Location:** The Shield Table  |  **Levels:** 8–18  |  **Quests:** 7  |  **Type:** class

### VAN-01 — The Weight of a Promise
**Giver:** Marshal Oren Flint. **Zone:** The Shield Table. **Atlas point:** `GLASA846-01`. **Reward:** Guard ability + XP.
**Objectives:** Equip a shield; intercept two practice strikes aimed at trainees.
**Story consequence:** A shield is a covenant with others, not proof of command.
**Requires all:** Q001. 
**Quest acceptance:** In The Shield Table, Marshal Oren Flint needs you to equip a shield.
**Turn-in dialogue:** A shield is a covenant with others, not proof of command.
**Completion flag:** `completed.VAN-01` (grant reward once; persist before UI reward acknowledgment).

### VAN-02 — The Door and the Refugee
**Giver:** Marshal Oren Flint. **Zone:** The Shield Table. **Atlas point:** `GLASA846-02`. **Reward:** Intercept ability + XP.
**Objectives:** Escort three evacuees; choose a defensive position under pressure.
**Story consequence:** The marshal once protected a gate by refusing entry to families already inside its records.
**Requires all:** VAN-01. 
**Quest acceptance:** In The Shield Table, Marshal Oren Flint needs you to escort three evacuees.
**Turn-in dialogue:** The marshal once protected a gate by refusing entry to families already inside its records.
**Completion flag:** `completed.VAN-02` (grant reward once; persist before UI reward acknowledgment).

### VAN-03 — The Captain Who Counted
**Giver:** Gatekeeper Elric. **Zone:** The Shield Table. **Atlas point:** `GLASA846-03`. **Reward:** Shield Pattern + XP.
**Objectives:** Find a battlefield register; return it to Oren Flint.
**Story consequence:** Officials marked rescued civilians as military supplies to hide a catastrophe.
**Requires all:** VAN-02. 
**Quest acceptance:** In The Shield Table, Gatekeeper Elric needs you to find a battlefield register.
**Turn-in dialogue:** Officials marked rescued civilians as military supplies to hide a catastrophe.
**Completion flag:** `completed.VAN-03` (grant reward once; persist before UI reward acknowledgment).

### VAN-04 — Stand Where It Hurts
**Giver:** Tamsin the Ranger. **Zone:** The Shield Table. **Atlas point:** `GLASA846-04`. **Reward:** Parry upgrade + XP.
**Objectives:** Defend the bridge against three waves; use parry to block the cleave.
**Story consequence:** The courage of a guardian is measured by who escapes, not who falls.
**Requires all:** VAN-03. 
**Quest acceptance:** In The Shield Table, Tamsin the Ranger needs you to defend the bridge against three waves.
**Turn-in dialogue:** The courage of a guardian is measured by who escapes, not who falls.
**Completion flag:** `completed.VAN-04` (grant reward once; persist before UI reward acknowledgment).

### VAN-05 — The Order to Withdraw
**Giver:** Marshal Oren Flint. **Zone:** The Shield Table. **Atlas point:** `GLASA846-05`. **Reward:** Shield Table reputation + XP.
**Objectives:** Hear two opposing witnesses; decide whether to publish the captain's unlawful order.
**Story consequence:** Oren recognizes the first protected citizen as his own predecessor.
**Requires all:** VAN-04. 
**Quest acceptance:** In The Shield Table, Marshal Oren Flint needs you to hear two opposing witnesses.
**Turn-in dialogue:** Oren recognizes the first protected citizen as his own predecessor.
**Completion flag:** `completed.VAN-05` (grant reward once; persist before UI reward acknowledgment).

### VAN-06 — Names Behind the Rampart
**Giver:** Sister Vale. **Zone:** The Shield Table. **Atlas point:** `GLASA846-06`. **Reward:** Legacy shield cosmetic + XP.
**Objectives:** Collect three shield-plate names from the ruins; restore the memorial.
**Story consequence:** The missing dead were from all peoples, not a single proud regiment.
**Requires all:** VAN-05. 
**Quest acceptance:** In The Shield Table, Sister Vale needs you to collect three shield-plate names from the ruins.
**Turn-in dialogue:** The missing dead were from all peoples, not a single proud regiment.
**Completion flag:** `completed.VAN-06` (grant reward once; persist before UI reward acknowledgment).

### VAN-07 — The Open Shield
**Giver:** Marshal Oren Flint. **Zone:** The Shield Table. **Atlas point:** `GLASA846-01`. **Reward:** Vanguard chapter flag + skill point.
**Objectives:** Complete a guardian trial; vow never to use protection to silence the protected.
**Story consequence:** The Vanguard path closes with a freely given oath rather than a compulsory allegiance.
**Requires all:** VAN-06. 
**Quest acceptance:** In The Shield Table, Marshal Oren Flint needs you to complete a guardian trial.
**Turn-in dialogue:** The Vanguard path closes with a freely given oath rather than a compulsory allegiance.
**Completion flag:** `completed.VAN-07` (grant reward once; persist before UI reward acknowledgment).

## Arcanist Path: The Listening Flame
**Location:** The Quiet Observatory  |  **Levels:** 8–18  |  **Quests:** 7  |  **Type:** class

### ARC-01 — Listen Without Taking
**Giver:** Sister Vale. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-01`. **Reward:** Resonance Sight + XP.
**Objectives:** Use a focus on three memory echoes; release each without collecting it.
**Story consequence:** Magic can witness a past event without claiming the speaker.
**Requires all:** Q001. 
**Quest acceptance:** In The Quiet Observatory, Sister Vale needs you to use a focus on three memory echoes.
**Turn-in dialogue:** Magic can witness a past event without claiming the speaker.
**Completion flag:** `completed.ARC-01` (grant reward once; persist before UI reward acknowledgment).

### ARC-02 — The Lamp That Lies
**Giver:** Magister Leth Sen. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-02`. **Reward:** Arcane Ward + XP.
**Objectives:** Compare two resonance signals; identify the false one.
**Story consequence:** The Beacon Guild purchased counterfeit readings to keep trade roads open.
**Requires all:** ARC-01. 
**Quest acceptance:** In The Quiet Observatory, Magister Leth Sen needs you to compare two resonance signals.
**Turn-in dialogue:** The Beacon Guild purchased counterfeit readings to keep trade roads open.
**Completion flag:** `completed.ARC-02` (grant reward once; persist before UI reward acknowledgment).

### ARC-03 — A Lesson in Consent
**Giver:** Sister Vale. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-03`. **Reward:** Focus tonic + XP.
**Objectives:** Ask three NPCs for permission to read a trace; refuse the forced reading offered by a device.
**Story consequence:** The apparatus works, but ethical restraint is part of mastery.
**Requires all:** ARC-02. 
**Quest acceptance:** In The Quiet Observatory, Sister Vale needs you to ask three NPCs for permission to read a trace.
**Turn-in dialogue:** The apparatus works, but ethical restraint is part of mastery.
**Completion flag:** `completed.ARC-03` (grant reward once; persist before UI reward acknowledgment).

### ARC-04 — What the Ink Remembered
**Giver:** Curator Ossa. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-04`. **Reward:** Bound page + XP.
**Objectives:** Copy three shifting fragments; stabilize the page.
**Story consequence:** The names on the page were written by someone trying to be forgotten.
**Requires all:** ARC-03. 
**Quest acceptance:** In The Quiet Observatory, Curator Ossa needs you to copy three shifting fragments.
**Turn-in dialogue:** The names on the page were written by someone trying to be forgotten.
**Completion flag:** `completed.ARC-04` (grant reward once; persist before UI reward acknowledgment).

### ARC-05 — The Heat of a Small Star
**Giver:** Sister Vale. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-05`. **Reward:** Ward upgrade + XP.
**Objectives:** Channel a shield around the forge; prevent two echoes from breaking free.
**Story consequence:** Not every echo seeks a body; some only want to be heard.
**Requires all:** ARC-04. 
**Quest acceptance:** In The Quiet Observatory, Sister Vale needs you to channel a shield around the forge.
**Turn-in dialogue:** Not every echo seeks a body; some only want to be heard.
**Completion flag:** `completed.ARC-05` (grant reward once; persist before UI reward acknowledgment).

### ARC-06 — The Unfinished Sentence
**Giver:** Magister Leth Sen. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-06`. **Reward:** Arcane Staff cosmetic + XP.
**Objectives:** Translate a partial sigil; leave its final line deliberately unsigned.
**Story consequence:** The Nine had written no clause that allowed one witness to rule all others.
**Requires all:** ARC-05. 
**Quest acceptance:** In The Quiet Observatory, Magister Leth Sen needs you to translate a partial sigil.
**Turn-in dialogue:** The Nine had written no clause that allowed one witness to rule all others.
**Completion flag:** `completed.ARC-06` (grant reward once; persist before UI reward acknowledgment).

### ARC-07 — The Reader's Oath
**Giver:** Sister Vale. **Zone:** The Quiet Observatory. **Atlas point:** `GLASA846-01`. **Reward:** Arcanist chapter flag + skill point.
**Objectives:** Complete a focus trial; decide how to credit the unknown author.
**Story consequence:** The Arcanist commits to keeping truth legible and ownership explicit.
**Requires all:** ARC-06. 
**Quest acceptance:** In The Quiet Observatory, Sister Vale needs you to complete a focus trial.
**Turn-in dialogue:** The Arcanist commits to keeping truth legible and ownership explicit.
**Completion flag:** `completed.ARC-07` (grant reward once; persist before UI reward acknowledgment).

## Pathfinder Path: The Road Has Witnesses
**Location:** The Wayfarers' Lodge  |  **Levels:** 8–18  |  **Quests:** 7  |  **Type:** class

### PAT-01 — Pathmakers
**Giver:** Tamsin the Ranger. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-01`. **Reward:** Trail Mark + XP.
**Objectives:** Follow three trail signs; place a beacon on a safe route.
**Story consequence:** A road exists only because countless unknown travelers maintained it.
**Requires all:** Q001. 
**Quest acceptance:** In The Wayfarers' Lodge, Tamsin the Ranger needs you to follow three trail signs.
**Turn-in dialogue:** A road exists only because countless unknown travelers maintained it.
**Completion flag:** `completed.PAT-01` (grant reward once; persist before UI reward acknowledgment).

### PAT-02 — The Predator and the Bell
**Giver:** Tamsin the Ranger. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-02`. **Reward:** Mark Target ability + XP.
**Objectives:** Track a bramblewolf; disable the bellglass lure instead of killing it.
**Story consequence:** The animals were led into town by deliberate noise.
**Requires all:** PAT-01. 
**Quest acceptance:** In The Wayfarers' Lodge, Tamsin the Ranger needs you to track a bramblewolf.
**Turn-in dialogue:** The animals were led into town by deliberate noise.
**Completion flag:** `completed.PAT-02` (grant reward once; persist before UI reward acknowledgment).

### PAT-03 — Crossing Without a Map
**Giver:** Rowan the Ferryman. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-03`. **Reward:** Trap kit + XP.
**Objectives:** Survey two crossings; craft a simple rope bridge.
**Story consequence:** One crossing disappears from sight when no two people watch it at once.
**Requires all:** PAT-02. 
**Quest acceptance:** In The Wayfarers' Lodge, Rowan the Ferryman needs you to survey two crossings.
**Turn-in dialogue:** One crossing disappears from sight when no two people watch it at once.
**Completion flag:** `completed.PAT-03` (grant reward once; persist before UI reward acknowledgment).

### PAT-04 — The Ranger Who Lied
**Giver:** Bram Alder. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-04`. **Reward:** Pathfinder journal + XP.
**Objectives:** Compare Tamsin's old report with two mile markers.
**Story consequence:** Tamsin redirected a caravan to save a stranded child; the caravan never arrived.
**Requires all:** PAT-03. 
**Quest acceptance:** In The Wayfarers' Lodge, Bram Alder needs you to compare Tamsin's old report with two mile markers.
**Turn-in dialogue:** Tamsin redirected a caravan to save a stranded child; the caravan never arrived.
**Completion flag:** `completed.PAT-04` (grant reward once; persist before UI reward acknowledgment).

### PAT-05 — The Long Way Home
**Giver:** Tamsin the Ranger. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-05`. **Reward:** Scout speed passive + XP.
**Objectives:** Guide three refugees through the slow safe trail.
**Story consequence:** The safest road is not always the shortest or the most profitable.
**Requires all:** PAT-04. 
**Quest acceptance:** In The Wayfarers' Lodge, Tamsin the Ranger needs you to guide three refugees through the slow safe trail.
**Turn-in dialogue:** The safest road is not always the shortest or the most profitable.
**Completion flag:** `completed.PAT-05` (grant reward once; persist before UI reward acknowledgment).

### PAT-06 — No Trail Left Behind
**Giver:** Reedkeeper Iona Sedge. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-06`. **Reward:** Traveler Bow cosmetic + XP.
**Objectives:** Open a marsh footpath; place return markers.
**Story consequence:** Travelers stop disappearing when exits are as visible as entrances.
**Requires all:** PAT-05. 
**Quest acceptance:** In The Wayfarers' Lodge, Reedkeeper Iona Sedge needs you to open a marsh footpath.
**Turn-in dialogue:** Travelers stop disappearing when exits are as visible as entrances.
**Completion flag:** `completed.PAT-06` (grant reward once; persist before UI reward acknowledgment).

### PAT-07 — Wayfarer's Witness
**Giver:** Tamsin the Ranger. **Zone:** The Wayfarers' Lodge. **Atlas point:** `GLASA846-01`. **Reward:** Pathfinder chapter flag + skill point.
**Objectives:** Finish a trail trial; report both the safe and forbidden routes to the lodge.
**Story consequence:** The Pathfinders inherit neither land nor law, only the duty to leave a way home.
**Requires all:** PAT-06. 
**Quest acceptance:** In The Wayfarers' Lodge, Tamsin the Ranger needs you to finish a trail trial.
**Turn-in dialogue:** The Pathfinders inherit neither land nor law, only the duty to leave a way home.
**Completion flag:** `completed.PAT-07` (grant reward once; persist before UI reward acknowledgment).

## Shade Path: The Door Without a Key
**Location:** The Unseen Door  |  **Levels:** 8–18  |  **Quests:** 7  |  **Type:** class

### SHA-01 — The Shadow of a Lock
**Giver:** Keeper Sen Arlo. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-01`. **Reward:** Stealth ability + XP.
**Objectives:** Sneak past two sentries; open a practice case without harming guards.
**Story consequence:** Secrecy can protect the weak when force would fail.
**Requires all:** Q001. 
**Quest acceptance:** In The Unseen Door, Keeper Sen Arlo needs you to sneak past two sentries.
**Turn-in dialogue:** Secrecy can protect the weak when force would fail.
**Completion flag:** `completed.SHA-01` (grant reward once; persist before UI reward acknowledgment).

### SHA-02 — Someone Else's Letter
**Giver:** Keeper Sen Arlo. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-02`. **Reward:** Diversion ability + XP.
**Objectives:** Retrieve a sealed letter; deliver it unopened to its owner.
**Story consequence:** The guild measures restraint by what it refuses to read.
**Requires all:** SHA-01. 
**Quest acceptance:** In The Unseen Door, Keeper Sen Arlo needs you to retrieve a sealed letter.
**Turn-in dialogue:** The guild measures restraint by what it refuses to read.
**Completion flag:** `completed.SHA-02` (grant reward once; persist before UI reward acknowledgment).

### SHA-03 — A Ledger Bought Twice
**Giver:** Quartermaster Dren. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-03`. **Reward:** Coin Purse + XP.
**Objectives:** Follow three suspicious payments; mark the Hollow Court front company.
**Story consequence:** The Court is funding shelters as well as thefts.
**Requires all:** SHA-02. 
**Quest acceptance:** In The Unseen Door, Quartermaster Dren needs you to follow three suspicious payments.
**Turn-in dialogue:** The Court is funding shelters as well as thefts.
**Completion flag:** `completed.SHA-03` (grant reward once; persist before UI reward acknowledgment).

### SHA-04 — Knife in the Spotlight
**Giver:** Keeper Sen Arlo. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-04`. **Reward:** Shadowstep trial + XP.
**Objectives:** Disable three signal mirrors; rescue a captured informant.
**Story consequence:** A public accusation could expose the informant before they are safe.
**Requires all:** SHA-03. 
**Quest acceptance:** In The Unseen Door, Keeper Sen Arlo needs you to disable three signal mirrors.
**Turn-in dialogue:** A public accusation could expose the informant before they are safe.
**Completion flag:** `completed.SHA-04` (grant reward once; persist before UI reward acknowledgment).

### SHA-05 — The Truth Without the Name
**Giver:** Sister Vale. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-05`. **Reward:** Silent Cloak + XP.
**Objectives:** Report the conspiracy without identifying a vulnerable witness.
**Story consequence:** A truthful statement need not destroy the person who supplied it.
**Requires all:** SHA-04. 
**Quest acceptance:** In The Unseen Door, Sister Vale needs you to report the conspiracy without identifying a vulnerable witness.
**Turn-in dialogue:** A truthful statement need not destroy the person who supplied it.
**Completion flag:** `completed.SHA-05` (grant reward once; persist before UI reward acknowledgment).

### SHA-06 — The Keeper Was There
**Giver:** Keeper Sen Arlo. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-06`. **Reward:** Shade blades cosmetic + XP.
**Objectives:** Infiltrate an old records room; recover Arlo's original badge.
**Story consequence:** Arlo belonged to the Court before leaving over forced mind-reading.
**Requires all:** SHA-05. 
**Quest acceptance:** In The Unseen Door, Keeper Sen Arlo needs you to infiltrate an old records room.
**Turn-in dialogue:** Arlo belonged to the Court before leaving over forced mind-reading.
**Completion flag:** `completed.SHA-06` (grant reward once; persist before UI reward acknowledgment).

### SHA-07 — Unseen, Not Unaccountable
**Giver:** Keeper Sen Arlo. **Zone:** The Unseen Door. **Atlas point:** `GLASA846-01`. **Reward:** Shade chapter flag + skill point.
**Objectives:** Complete a nonlethal infiltration trial; show evidence to its rightful owners.
**Story consequence:** The Shade earns the right to act quietly by accepting public judgment afterward.
**Requires all:** SHA-06. 
**Quest acceptance:** In The Unseen Door, Keeper Sen Arlo needs you to complete a nonlethal infiltration trial.
**Turn-in dialogue:** The Shade earns the right to act quietly by accepting public judgment afterward.
**Completion flag:** `completed.SHA-07` (grant reward once; persist before UI reward acknowledgment).

## Emberstone Quarry: The Price of Stone
**Location:** Emberstone Quarry  |  **Levels:** 12–17  |  **Quests:** 9  |  **Type:** zone

### EQU-01 — A Vein Out of Season
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-01`. **Reward:** Mining XP + Coins.
**Objectives:** Sample three new crystal veins; inspect a damaged survey stake.
**Story consequence:** Ore is forming around conversations that were never spoken.
**Requires all:** Q008. 
**Quest acceptance:** In Emberstone Quarry, Mira the Forgekeeper needs you to sample three new crystal veins.
**Turn-in dialogue:** Ore is forming around conversations that were never spoken.
**Completion flag:** `completed.EQU-01` (grant reward once; persist before UI reward acknowledgment).

### EQU-02 — The Quarry Ledger
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-02`. **Reward:** Witnessed Ledger + XP.
**Objectives:** Recover two shift ledgers; confront the foreman.
**Story consequence:** Six miners were listed as tools instead of people.
**Requires all:** EQU-01. 
**Quest acceptance:** In Emberstone Quarry, Mason Yurra Flint-Eye needs you to recover two shift ledgers.
**Turn-in dialogue:** Six miners were listed as tools instead of people.
**Completion flag:** `completed.EQU-02` (grant reward once; persist before UI reward acknowledgment).

### EQU-03 — The Machine Beneath
**Giver:** Quarry Foreman Kiv. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-03`. **Reward:** Lift shortcut + XP.
**Objectives:** Activate three safe lift brakes; enter the sealed lower gallery.
**Story consequence:** Someone restarted an Accord machine long after its authorized keepers died.
**Requires all:** EQU-02. 
**Quest acceptance:** In Emberstone Quarry, Quarry Foreman Kiv needs you to activate three safe lift brakes.
**Turn-in dialogue:** Someone restarted an Accord machine long after its authorized keepers died.
**Completion flag:** `completed.EQU-03` (grant reward once; persist before UI reward acknowledgment).

### EQU-04 — Ore and Oaths
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-04`. **Reward:** Forge Recipe: Resonant Pin.
**Objectives:** Smelt a bellglass-alloy test sample; compare the signal against true copper.
**Story consequence:** Unwitnessed testimony crystallizes under pressure.
**Requires all:** EQU-03. 
**Quest acceptance:** In Emberstone Quarry, Mira the Forgekeeper needs you to smelt a bellglass-alloy test sample.
**Turn-in dialogue:** Unwitnessed testimony crystallizes under pressure.
**Completion flag:** `completed.EQU-04` (grant reward once; persist before UI reward acknowledgment).

### EQU-05 — Sparks for Sale
**Giver:** Quartermaster Dren. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-05`. **Reward:** Market Evidence + XP.
**Objectives:** Track a Hollow Court buyer; recover two purchase orders.
**Story consequence:** Court agents are buying bellglass for a device meant to retrieve the erased.
**Requires all:** EQU-04. 
**Quest acceptance:** In Emberstone Quarry, Quartermaster Dren needs you to track a Hollow Court buyer.
**Turn-in dialogue:** Court agents are buying bellglass for a device meant to retrieve the erased.
**Completion flag:** `completed.EQU-05` (grant reward once; persist before UI reward acknowledgment).

### EQU-06 — The Man on the Other Side
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-06`. **Reward:** Stone Witness Fragment + XP.
**Objectives:** Speak across a sealed wall; triangulate the voice with two tuning hammers.
**Story consequence:** The imprisoned miner may be an echo who remembers a real injustice.
**Requires all:** EQU-05. 
**Quest acceptance:** In Emberstone Quarry, Mason Yurra Flint-Eye needs you to speak across a sealed wall.
**Turn-in dialogue:** The imprisoned miner may be an echo who remembers a real injustice.
**Completion flag:** `completed.EQU-06` (grant reward once; persist before UI reward acknowledgment).

### EQU-07 — Break the Drill
**Giver:** Tamsin the Ranger. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-01`. **Reward:** Quarry Sigil + XP.
**Objectives:** Defeat the illegal drill crew; stop the unstable rig without harming workers.
**Story consequence:** Mareth's people were promised that excavation would restore loved ones.
**Requires all:** EQU-06. 
**Quest acceptance:** In Emberstone Quarry, Tamsin the Ranger needs you to defeat the illegal drill crew.
**Turn-in dialogue:** Mareth's people were promised that excavation would restore loved ones.
**Completion flag:** `completed.EQU-07` (grant reward once; persist before UI reward acknowledgment).

### EQU-08 — Written in the Dust
**Giver:** Sister Vale. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-02`. **Reward:** Hollowcrypt clue + XP.
**Objectives:** Display the miners' names on the quarry board; read the hidden exit coordinates.
**Story consequence:** All six disappeared on the night of the First Silence.
**Requires all:** EQU-07. 
**Quest acceptance:** In Emberstone Quarry, Sister Vale needs you to display the miners' names on the quarry board.
**Turn-in dialogue:** All six disappeared on the night of the First Silence.
**Completion flag:** `completed.EQU-08` (grant reward once; persist before UI reward acknowledgment).

### EQU-09 — A Road Below the Town
**Giver:** Gatekeeper Elric. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-03`. **Reward:** Zone completion + level gate.
**Objectives:** Open the east shaft connector; report the lost corridor.
**Story consequence:** The route leads beneath the memorial district toward the Hollowcrypt.
**Requires all:** EQU-08. 
**Quest acceptance:** In Emberstone Quarry, Gatekeeper Elric needs you to open the east shaft connector.
**Turn-in dialogue:** The route leads beneath the memorial district toward the Hollowcrypt.
**Completion flag:** `completed.EQU-09` (grant reward once; persist before UI reward acknowledgment).

## Sorrowfen: The Unfinished Mourning
**Location:** Sorrowfen  |  **Levels:** 21–25  |  **Quests:** 9  |  **Type:** zone

### SOR-01 — Boardwalk at Dusk
**Giver:** Marsh Guide Pell. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-01`. **Reward:** Marsh traversal + XP.
**Objectives:** Activate four ward lanterns; mark a safe evacuation line.
**Story consequence:** The lanterns carry living names stitched into the wicks.
**Requires all:** DHC-04. 
**Quest acceptance:** In Sorrowfen, Marsh Guide Pell needs you to activate four ward lanterns.
**Turn-in dialogue:** The lanterns carry living names stitched into the wicks.
**Completion flag:** `completed.SOR-01` (grant reward once; persist before UI reward acknowledgment).

### SOR-02 — Not All Wisps Are Lost
**Giver:** Wisp Tender Kele. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-02`. **Reward:** Wisp Jar + XP.
**Objectives:** Identify three harmless wisps; defeat two coercive tether-spirits.
**Story consequence:** The aggressive spirits are being pulled toward a Court receiver.
**Requires all:** SOR-01. 
**Quest acceptance:** In Sorrowfen, Wisp Tender Kele needs you to identify three harmless wisps.
**Turn-in dialogue:** The aggressive spirits are being pulled toward a Court receiver.
**Completion flag:** `completed.SOR-02` (grant reward once; persist before UI reward acknowledgment).

### SOR-03 — Mourner in the Reeds
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-03`. **Reward:** Story fragment + XP.
**Objectives:** Interview a mourner; follow her reflected footsteps.
**Story consequence:** Her missing family is heard only in the reflection, not in the water itself.
**Requires all:** SOR-02. 
**Quest acceptance:** In Sorrowfen, Reedkeeper Iona Sedge needs you to interview a mourner.
**Turn-in dialogue:** Her missing family is heard only in the reflection, not in the water itself.
**Completion flag:** `completed.SOR-03` (grant reward once; persist before UI reward acknowledgment).

### SOR-04 — The Bell in the Bog
**Giver:** Sister Vale. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-04`. **Reward:** Resonant Ward + XP.
**Objectives:** Recover two sunken bellglass chimes; turn them face-down.
**Story consequence:** The chimes were meant to guide rather than imprison echoes.
**Requires all:** SOR-03. 
**Quest acceptance:** In Sorrowfen, Sister Vale needs you to recover two sunken bellglass chimes.
**Turn-in dialogue:** The chimes were meant to guide rather than imprison echoes.
**Completion flag:** `completed.SOR-04` (grant reward once; persist before UI reward acknowledgment).

### SOR-05 — The Marsh Bargain
**Giver:** Marsh Guide Pell. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-05`. **Reward:** Reedbound trust + XP.
**Objectives:** Choose to rescue a smuggler or recover her manifest first; complete both outcomes.
**Story consequence:** The smuggler ferried refugees for the Hollow Court and later abandoned the trade.
**Requires all:** SOR-04. 
**Quest acceptance:** In Sorrowfen, Marsh Guide Pell needs you to choose to rescue a smuggler or recover her manifest first.
**Turn-in dialogue:** The smuggler ferried refugees for the Hollow Court and later abandoned the trade.
**Completion flag:** `completed.SOR-05` (grant reward once; persist before UI reward acknowledgment).

### SOR-06 — A Chapel Without Graves
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-06`. **Reward:** Chapel Map + XP.
**Objectives:** Explore the drowned chapel; read three unmarked stones.
**Story consequence:** Memorials were erased to hide that the first victims volunteered under false pretenses.
**Requires all:** SOR-05. 
**Quest acceptance:** In Sorrowfen, Reedkeeper Iona Sedge needs you to explore the drowned chapel.
**Turn-in dialogue:** Memorials were erased to hide that the first victims volunteered under false pretenses.
**Completion flag:** `completed.SOR-06` (grant reward once; persist before UI reward acknowledgment).

### SOR-07 — The Mirelurker's Hunger
**Giver:** Tamsin the Ranger. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-01`. **Reward:** Rare Reagent + XP.
**Objectives:** Defeat an elite mirelurker; remove its embedded bellglass splinter.
**Story consequence:** The beast is a suffering animal, not an enemy of the world.
**Requires all:** SOR-06. 
**Quest acceptance:** In Sorrowfen, Tamsin the Ranger needs you to defeat an elite mirelurker.
**Turn-in dialogue:** The beast is a suffering animal, not an enemy of the world.
**Completion flag:** `completed.SOR-07` (grant reward once; persist before UI reward acknowledgment).

### SOR-08 — The Visitor Beneath Water
**Giver:** Sister Vale. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-02`. **Reward:** Eda testimony + XP.
**Objectives:** Enter an echo reflection; speak to the child there.
**Story consequence:** A child named Eda Sable asks when her mother will come back.
**Requires all:** SOR-07. 
**Quest acceptance:** In Sorrowfen, Sister Vale needs you to enter an echo reflection.
**Turn-in dialogue:** A child named Eda Sable asks when her mother will come back.
**Completion flag:** `completed.SOR-08` (grant reward once; persist before UI reward acknowledgment).

### SOR-09 — Carry the Name Out
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-03`. **Reward:** Sorrowfen arc flag + XP.
**Objectives:** Escort the testimony to Lantern's Reach; invite two living witnesses to hear it.
**Story consequence:** Mareth Sable is revealed as more than a villain, but her methods are endangering thousands.
**Requires all:** SOR-08. 
**Quest acceptance:** In Sorrowfen, Reedkeeper Iona Sedge needs you to escort the testimony to Lantern's Reach.
**Turn-in dialogue:** Mareth Sable is revealed as more than a villain, but her methods are endangering thousands.
**Completion flag:** `completed.SOR-09` (grant reward once; persist before UI reward acknowledgment).

## Tideglass Coast: The Harbor That Never Was
**Location:** Tideglass Coast  |  **Levels:** 24–30  |  **Quests:** 9  |  **Type:** zone

### TID-01 — Salt on the Charts
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-01`. **Reward:** Tide Survey + XP.
**Objectives:** Survey three uncharted inlets; question the dock registry.
**Story consequence:** The old fleet sailed carrying volunteers who were told they could return.
**Requires all:** SOR-09. 
**Quest acceptance:** In Tideglass Coast, Pilot Sena Wavebound needs you to survey three uncharted inlets.
**Turn-in dialogue:** The old fleet sailed carrying volunteers who were told they could return.
**Completion flag:** `completed.TID-01` (grant reward once; persist before UI reward acknowledgment).

### TID-02 — The Lighthouse Faces Inland
**Giver:** Shellkeeper Ruun. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-02`. **Reward:** Lightkeeper Badge + XP.
**Objectives:** Relight three lighthouse lenses; rotate one toward the lost inland sea.
**Story consequence:** The lighthouse is an Accord station, not a maritime warning beacon.
**Requires all:** TID-01. 
**Quest acceptance:** In Tideglass Coast, Shellkeeper Ruun needs you to relight three lighthouse lenses.
**Turn-in dialogue:** The lighthouse is an Accord station, not a maritime warning beacon.
**Completion flag:** `completed.TID-02` (grant reward once; persist before UI reward acknowledgment).

### TID-03 — A Song Without a Singer
**Giver:** Netmaker Sari. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-03`. **Reward:** Namar Song + XP.
**Objectives:** Collect three melody fragments; teach the refrain to a living crew.
**Story consequence:** A disappeared fleet can be remembered without being conjured back.
**Requires all:** TID-02. 
**Quest acceptance:** In Tideglass Coast, Netmaker Sari needs you to collect three melody fragments.
**Turn-in dialogue:** A disappeared fleet can be remembered without being conjured back.
**Completion flag:** `completed.TID-03` (grant reward once; persist before UI reward acknowledgment).

### TID-04 — Drowned in Air
**Giver:** Rowan the Ferryman. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-04`. **Reward:** Ferry fast route + XP.
**Objectives:** Search two empty dry docks; repair the ferry rope.
**Story consequence:** The fleet manifests only when a listener agrees to hear its testimony.
**Requires all:** TID-03. 
**Quest acceptance:** In Tideglass Coast, Rowan the Ferryman needs you to search two empty dry docks.
**Turn-in dialogue:** The fleet manifests only when a listener agrees to hear its testimony.
**Completion flag:** `completed.TID-04` (grant reward once; persist before UI reward acknowledgment).

### TID-05 — The Broken Compass
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-05`. **Reward:** Tideglass Lens + XP.
**Objectives:** Craft tideglass lens; chart the phantom fleet crossing.
**Story consequence:** Mareth has stolen a navigational fragment keyed to Eda's last song.
**Requires all:** TID-04. 
**Quest acceptance:** In Tideglass Coast, Pilot Sena Wavebound needs you to craft tideglass lens.
**Turn-in dialogue:** Mareth has stolen a navigational fragment keyed to Eda's last song.
**Completion flag:** `completed.TID-05` (grant reward once; persist before UI reward acknowledgment).

### TID-06 — The Nets of Mercy
**Giver:** Reedkeeper Iona Sedge. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-06`. **Reward:** Mire Salve + XP.
**Objectives:** Release trapped memory-forms; stop the brine collector.
**Story consequence:** The Court's harvesting physically harms the coastline.
**Requires all:** TID-05. 
**Quest acceptance:** In Tideglass Coast, Reedkeeper Iona Sedge needs you to release trapped memory-forms.
**Turn-in dialogue:** The Court's harvesting physically harms the coastline.
**Completion flag:** `completed.TID-06` (grant reward once; persist before UI reward acknowledgment).

### TID-07 — The Captain Who Stayed
**Giver:** Shellkeeper Ruun. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-01`. **Reward:** Captain's Account + XP.
**Objectives:** Meet a fleet echo; refuse to compel her oath.
**Story consequence:** Captain Orin volunteered to keep the door open, then was forcibly forgotten.
**Requires all:** TID-06. 
**Quest acceptance:** In Tideglass Coast, Shellkeeper Ruun needs you to meet a fleet echo.
**Turn-in dialogue:** Captain Orin volunteered to keep the door open, then was forcibly forgotten.
**Completion flag:** `completed.TID-07` (grant reward once; persist before UI reward acknowledgment).

### TID-08 — The Harbor Song
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-02`. **Reward:** Tideglass Cape + XP.
**Objectives:** Play the recovered song at three beacons; stabilize the estuary.
**Story consequence:** The ocean route becomes visible again to anyone who wishes to sail it.
**Requires all:** TID-07. 
**Quest acceptance:** In Tideglass Coast, Pilot Sena Wavebound needs you to play the recovered song at three beacons.
**Turn-in dialogue:** The ocean route becomes visible again to anyone who wishes to sail it.
**Completion flag:** `completed.TID-08` (grant reward once; persist before UI reward acknowledgment).

### TID-09 — Beyond the White Headland
**Giver:** Rowan the Ferryman. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-03`. **Reward:** Tideglass arc flag + XP.
**Objectives:** Board the relay skiff; deliver the captain's record to Magister Leth Sen.
**Story consequence:** A chain of archives points toward Glassmere.
**Requires all:** TID-08. 
**Quest acceptance:** In Tideglass Coast, Rowan the Ferryman needs you to board the relay skiff.
**Turn-in dialogue:** A chain of archives points toward Glassmere.
**Completion flag:** `completed.TID-09` (grant reward once; persist before UI reward acknowledgment).

## Deep Briarwild: The Orchard of Ash
**Location:** Briarwild Deepgrove  |  **Levels:** 24–30  |  **Quests:** 9  |  **Type:** zone

### BRD-01 — Through the Quiet Trunk
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-01`. **Reward:** Rootway access + XP.
**Objectives:** Open the ancient root passage; follow three memory pollen trails.
**Story consequence:** The deep grove is protecting a buried Accord archive.
**Requires all:** SOR-09. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to open the ancient root passage.
**Turn-in dialogue:** The deep grove is protecting a buried Accord archive.
**Completion flag:** `completed.BRD-01` (grant reward once; persist before UI reward acknowledgment).

### BRD-02 — The Thorn Shepherd
**Giver:** Grove Singer Ell. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-02`. **Reward:** Nature Ward + XP.
**Objectives:** Calm two bramble creatures; destroy one bellglass snare.
**Story consequence:** Fear turned the guardians against travelers who had once been welcome.
**Requires all:** BRD-01. 
**Quest acceptance:** In Briarwild Deepgrove, Grove Singer Ell needs you to calm two bramble creatures.
**Turn-in dialogue:** Fear turned the guardians against travelers who had once been welcome.
**Completion flag:** `completed.BRD-02` (grant reward once; persist before UI reward acknowledgment).

### BRD-03 — A Name Grown Crooked
**Giver:** Sister Vale. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-03`. **Reward:** Living Inscription + XP.
**Objectives:** Read the living bark inscription; compare it with two handwritten letters.
**Story consequence:** The erased child was not lost in the woods; she was given to the Ninth as a witness.
**Requires all:** BRD-02. 
**Quest acceptance:** In Briarwild Deepgrove, Sister Vale needs you to read the living bark inscription.
**Turn-in dialogue:** The erased child was not lost in the woods; she was given to the Ninth as a witness.
**Completion flag:** `completed.BRD-03` (grant reward once; persist before UI reward acknowledgment).

### BRD-04 — Scars of the Orchard
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-04`. **Reward:** Seed Elixir + XP.
**Objectives:** Remove three blight nodules; preserve the healthy root fiber.
**Story consequence:** The corruption is spreading from a controlled restoration attempt.
**Requires all:** BRD-03. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to remove three blight nodules.
**Turn-in dialogue:** The corruption is spreading from a controlled restoration attempt.
**Completion flag:** `completed.BRD-04` (grant reward once; persist before UI reward acknowledgment).

### BRD-05 — The Garden That Refused
**Giver:** Grove Singer Ell. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-05`. **Reward:** Glade Reputation + XP.
**Objectives:** Assist two conflicting gardeners; choose how to label the memorial.
**Story consequence:** The Thren honor loss without pretending every sacrifice was consensual.
**Requires all:** BRD-04. 
**Quest acceptance:** In Briarwild Deepgrove, Grove Singer Ell needs you to assist two conflicting gardeners.
**Turn-in dialogue:** The Thren honor loss without pretending every sacrifice was consensual.
**Completion flag:** `completed.BRD-05` (grant reward once; persist before UI reward acknowledgment).

### BRD-06 — Voice of the Buried Path
**Giver:** Tamsin the Ranger. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-06`. **Reward:** Shortcut unlock + XP.
**Objectives:** Traverse a vertical tree walkway; follow a voice without chasing it blindly.
**Story consequence:** An old route connects Briarwild to the Glassmere archives.
**Requires all:** BRD-05. 
**Quest acceptance:** In Briarwild Deepgrove, Tamsin the Ranger needs you to traverse a vertical tree walkway.
**Turn-in dialogue:** An old route connects Briarwild to the Glassmere archives.
**Completion flag:** `completed.BRD-06` (grant reward once; persist before UI reward acknowledgment).

### BRD-07 — Mareth's Offering
**Giver:** Sister Vale. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-01`. **Reward:** Court Letter + XP.
**Objectives:** Recover a Hollow Court letter; leave a response at the root shrine.
**Story consequence:** Mareth offered to return the lost dead if the grove would lend her its memory.
**Requires all:** BRD-06. 
**Quest acceptance:** In Briarwild Deepgrove, Sister Vale needs you to recover a Hollow Court letter.
**Turn-in dialogue:** Mareth offered to return the lost dead if the grove would lend her its memory.
**Completion flag:** `completed.BRD-07` (grant reward once; persist before UI reward acknowledgment).

### BRD-08 — The Child in the Bark
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-02`. **Reward:** Child's Testimony + XP.
**Objectives:** Speak with an echo child; promise not to decide her future without asking.
**Story consequence:** Eda's echo refuses to be used as a banner by either side.
**Requires all:** BRD-07. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to speak with an echo child.
**Turn-in dialogue:** Eda's echo refuses to be used as a banner by either side.
**Completion flag:** `completed.BRD-08` (grant reward once; persist before UI reward acknowledgment).

### BRD-09 — Leaves for All Witnesses
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-03`. **Reward:** Briarwild arc flag + XP.
**Objectives:** Open the root archive to outsiders; travel to Velthraen Reach.
**Story consequence:** The grove abandons the old assumption that only one people can hold its truth.
**Requires all:** BRD-08. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to open the root archive to outsiders.
**Turn-in dialogue:** The grove abandons the old assumption that only one people can hold its truth.
**Completion flag:** `completed.BRD-09` (grant reward once; persist before UI reward acknowledgment).

## Velthraen Reach: The Missing Star
**Location:** Velthraen Reach  |  **Levels:** 31–38  |  **Quests:** 9  |  **Type:** zone

### VEL-01 — The Observatory Road
**Giver:** Glidewarden Ires. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-01`. **Reward:** Lift access + XP.
**Objectives:** Repair the mountain lift; survey three cliff beacons.
**Story consequence:** An eighth-and-one-half chime reveals a concealed sky station.
**Requires all:** None. **Requires any:** TID-09 OR BRD-09.
**Quest acceptance:** In Velthraen Reach, Glidewarden Ires needs you to repair the mountain lift.
**Turn-in dialogue:** An eighth-and-one-half chime reveals a concealed sky station.
**Completion flag:** `completed.VEL-01` (grant reward once; persist before UI reward acknowledgment).

### VEL-02 — A Map of Absences
**Giver:** Astromer Neris Sol. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-02`. **Reward:** Missing-Star Chart + XP.
**Objectives:** Align three star charts; name the missing constellation.
**Story consequence:** The sky charts were altered when the mortal Keepers began passing themselves off as interpreters of the Old Gods.
**Requires all:** VEL-01. 
**Quest acceptance:** In Velthraen Reach, Astromer Neris Sol needs you to align three star charts.
**Turn-in dialogue:** The sky charts were altered when the mortal Keepers began passing themselves off as interpreters of the Old Gods.
**Completion flag:** `completed.VEL-02` (grant reward once; persist before UI reward acknowledgment).

### VEL-03 — The Skyborn Accord
**Giver:** Magister Leth Sen. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-03`. **Reward:** Veilbound favor + XP.
**Objectives:** Interview two order delegates; present one dissenting record.
**Story consequence:** The Veylori designed a clause forbidding permanent ownership of the truth.
**Requires all:** VEL-02. 
**Quest acceptance:** In Velthraen Reach, Magister Leth Sen needs you to interview two order delegates.
**Turn-in dialogue:** The Veylori designed a clause forbidding permanent ownership of the truth.
**Completion flag:** `completed.VEL-03` (grant reward once; persist before UI reward acknowledgment).

### VEL-04 — Windharps and Warnings
**Giver:** Glidewarden Ires. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-04`. **Reward:** Windward Mantle + XP.
**Objectives:** Tune four windharps; avoid a collapsing bridge pulse.
**Story consequence:** The impending breach can be heard before it appears.
**Requires all:** VEL-03. 
**Quest acceptance:** In Velthraen Reach, Glidewarden Ires needs you to tune four windharps.
**Turn-in dialogue:** The impending breach can be heard before it appears.
**Completion flag:** `completed.VEL-04` (grant reward once; persist before UI reward acknowledgment).

### VEL-05 — The Price of Prediction
**Giver:** Astromer Neris Sol. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-05`. **Reward:** Lens Upgrade + XP.
**Objectives:** Review a prophecy board; reject one false certainty.
**Story consequence:** The alleged prophecy of apocalypse is a projected memory of an earlier choice.
**Requires all:** VEL-04. 
**Quest acceptance:** In Velthraen Reach, Astromer Neris Sol needs you to review a prophecy board.
**Turn-in dialogue:** The alleged prophecy of apocalypse is a projected memory of an earlier choice.
**Completion flag:** `completed.VEL-05` (grant reward once; persist before UI reward acknowledgment).

### VEL-06 — The Court Among Clouds
**Giver:** Keeper Sen Arlo. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-06`. **Reward:** Vault Records + XP.
**Objectives:** Infiltrate an eyrie vault; retrieve two stolen resonance lenses.
**Story consequence:** Court scholars have gathered enough to imitate one Accord station.
**Requires all:** VEL-05. 
**Quest acceptance:** In Velthraen Reach, Keeper Sen Arlo needs you to infiltrate an eyrie vault.
**Turn-in dialogue:** Court scholars have gathered enough to imitate one Accord station.
**Completion flag:** `completed.VEL-06` (grant reward once; persist before UI reward acknowledgment).

### VEL-07 — The Unseen Ninth
**Giver:** Sister Vale. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-01`. **Reward:** Witness Inscription + XP.
**Objectives:** Visit the hidden observatory; read its last keeper inscription.
**Story consequence:** The Accord was signed by nine living keepers; the existence and will of the older Nine remain unresolved.
**Requires all:** VEL-06. 
**Quest acceptance:** In Velthraen Reach, Sister Vale needs you to visit the hidden observatory.
**Turn-in dialogue:** The Accord was signed by nine living keepers; the existence and will of the older Nine remain unresolved.
**Completion flag:** `completed.VEL-07` (grant reward once; persist before UI reward acknowledgment).

### VEL-08 — Who Gets to Publish
**Giver:** Magister Leth Sen. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-02`. **Reward:** Council Standing + XP.
**Objectives:** Host an open hearing; protect dissenters from three echo attacks.
**Story consequence:** Truth must remain discussable; public spectacle must not become coercion.
**Requires all:** VEL-07. 
**Quest acceptance:** In Velthraen Reach, Magister Leth Sen needs you to host an open hearing.
**Turn-in dialogue:** Truth must remain discussable; public spectacle must not become coercion.
**Completion flag:** `completed.VEL-08` (grant reward once; persist before UI reward acknowledgment).

### VEL-09 — A Signal Toward Emberstone
**Giver:** Astromer Neris Sol. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-03`. **Reward:** Velthraen arc flag + XP.
**Objectives:** Activate two light relays; send a warning to Emberstone Bastion.
**Story consequence:** A new machine is being assembled in the Bastion's old bell foundry.
**Requires all:** VEL-08. 
**Quest acceptance:** In Velthraen Reach, Astromer Neris Sol needs you to activate two light relays.
**Turn-in dialogue:** A new machine is being assembled in the Bastion's old bell foundry.
**Completion flag:** `completed.VEL-09` (grant reward once; persist before UI reward acknowledgment).

## Emberstone Bastion: The Engine of Mercy
**Location:** Emberstone Bastion  |  **Levels:** 38–45  |  **Quests:** 9  |  **Type:** zone

### BAS-01 — Gates of the Forge
**Giver:** Marshal Oren Flint. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Bastion Permit + XP.
**Objectives:** Speak to the Bastion wardens; clear three blocked supply points.
**Story consequence:** The city is refusing passage to refugees in the name of protection.
**Requires all:** VEL-09. 
**Quest acceptance:** In Emberstone Bastion, Marshal Oren Flint needs you to speak to the Bastion wardens.
**Turn-in dialogue:** The city is refusing passage to refugees in the name of protection.
**Completion flag:** `completed.BAS-01` (grant reward once; persist before UI reward acknowledgment).

### BAS-02 — Hammer and Witness
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Forge Blueprint + XP.
**Objectives:** Inspect the central forge; gather three damaged resonance bolts.
**Story consequence:** A stolen Accord engine is being rebuilt by honest workers under false orders.
**Requires all:** BAS-01. 
**Quest acceptance:** In Emberstone Bastion, Mason Yurra Flint-Eye needs you to inspect the central forge.
**Turn-in dialogue:** A stolen Accord engine is being rebuilt by honest workers under false orders.
**Completion flag:** `completed.BAS-02` (grant reward once; persist before UI reward acknowledgment).

### BAS-03 — The Warden's Ultimatum
**Giver:** Regent Nala Vorn. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-03`. **Reward:** Union and Council trust + XP.
**Objectives:** Choose to share evidence with the union or council first; meet the other afterward.
**Story consequence:** Both sides fear losing the jobs that feed the city.
**Requires all:** BAS-02. 
**Quest acceptance:** In Emberstone Bastion, Regent Nala Vorn needs you to choose to share evidence with the union or council first.
**Turn-in dialogue:** Both sides fear losing the jobs that feed the city.
**Completion flag:** `completed.BAS-03` (grant reward once; persist before UI reward acknowledgment).

### BAS-04 — A Chain of Names
**Giver:** Sister Vale. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-04`. **Reward:** Resonant Breaker + XP.
**Objectives:** Free three captive echoes from power conduits; stabilize the furnace.
**Story consequence:** The engine burns unspoken memories as fuel.
**Requires all:** BAS-03. 
**Quest acceptance:** In Emberstone Bastion, Sister Vale needs you to free three captive echoes from power conduits.
**Turn-in dialogue:** The engine burns unspoken memories as fuel.
**Completion flag:** `completed.BAS-04` (grant reward once; persist before UI reward acknowledgment).

### BAS-05 — The Woman Who Hired Them
**Giver:** Quartermaster Dren. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-05`. **Reward:** Contracts + XP.
**Objectives:** Read Mareth's contracts; interview two workers who believed her promise.
**Story consequence:** Mareth has promised to return erased families rather than conquer the Bastion.
**Requires all:** BAS-04. 
**Quest acceptance:** In Emberstone Bastion, Quartermaster Dren needs you to read Mareth's contracts.
**Turn-in dialogue:** Mareth has promised to return erased families rather than conquer the Bastion.
**Completion flag:** `completed.BAS-05` (grant reward once; persist before UI reward acknowledgment).

### BAS-06 — No More Volunteers
**Giver:** Marshal Oren Flint. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-06`. **Reward:** Guardian Crest + XP.
**Objectives:** Rescue two workers trapped in a test cell; disable the consent override.
**Story consequence:** A voluntary sacrifice becomes coercive when a rescuer locks the door.
**Requires all:** BAS-05. 
**Quest acceptance:** In Emberstone Bastion, Marshal Oren Flint needs you to rescue two workers trapped in a test cell.
**Turn-in dialogue:** A voluntary sacrifice becomes coercive when a rescuer locks the door.
**Completion flag:** `completed.BAS-06` (grant reward once; persist before UI reward acknowledgment).

### BAS-07 — The Furnace Witness
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Forged Testimony + XP.
**Objectives:** Activate three emergency vents; face the Bellforged Sentinel.
**Story consequence:** The sentinel protects a testimony coil that names early Accord signatories.
**Requires all:** BAS-06. 
**Quest acceptance:** In Emberstone Bastion, Mira the Forgekeeper needs you to activate three emergency vents.
**Turn-in dialogue:** The sentinel protects a testimony coil that names early Accord signatories.
**Completion flag:** `completed.BAS-07` (grant reward once; persist before UI reward acknowledgment).

### BAS-08 — Mareth at the Crucible
**Giver:** Regent Mareth Sable. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Mareth's Statement + XP.
**Objectives:** Confront Mareth; listen to Eda's recording; refuse her forced activation.
**Story consequence:** Mareth admits she can recover her daughter only by taking thousands of others.
**Requires all:** BAS-07. 
**Quest acceptance:** In Emberstone Bastion, Regent Mareth Sable needs you to confront Mareth.
**Turn-in dialogue:** Mareth admits she can recover her daughter only by taking thousands of others.
**Completion flag:** `completed.BAS-08` (grant reward once; persist before UI reward acknowledgment).

### BAS-09 — The Cost Written Down
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-03`. **Reward:** Bastion arc flag + XP.
**Objectives:** Place a full public list of costs in the forge; travel to Glassmere.
**Story consequence:** The Court escapes with the last lens but its central falsehood is exposed.
**Requires all:** BAS-08. 
**Quest acceptance:** In Emberstone Bastion, Mason Yurra Flint-Eye needs you to place a full public list of costs in the forge.
**Turn-in dialogue:** The Court escapes with the last lens but its central falsehood is exposed.
**Completion flag:** `completed.BAS-09` (grant reward once; persist before UI reward acknowledgment).

## Glassmere Archive: The Mirror Does Not Lie
**Location:** Glassmere Archive  |  **Levels:** 45–52  |  **Quests:** 9  |  **Type:** zone

### GLA-01 — An Archive of Empty Books
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-01`. **Reward:** Catalog Key + XP.
**Objectives:** Find three books with blank titles; read their paper grains.
**Story consequence:** The missing years are stored as pressure in the archive walls.
**Requires all:** BAS-09. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to find three books with blank titles.
**Turn-in dialogue:** The missing years are stored as pressure in the archive walls.
**Completion flag:** `completed.GLA-01` (grant reward once; persist before UI reward acknowledgment).

### GLA-02 — The Woman in the Margin
**Giver:** Sister Vale. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-02`. **Reward:** Vale Confession + XP.
**Objectives:** Search two marginalia trails; compare Vale's handwriting to an old Court transcript.
**Story consequence:** Vale helped design the first Court receiver, then fled when used against mourners.
**Requires all:** GLA-01. 
**Quest acceptance:** In Glassmere Archive, Sister Vale needs you to search two marginalia trails.
**Turn-in dialogue:** Vale helped design the first Court receiver, then fled when used against mourners.
**Completion flag:** `completed.GLA-02` (grant reward once; persist before UI reward acknowledgment).

### GLA-03 — A City in a Mirror
**Giver:** Magister Leth Sen. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-03`. **Reward:** Mirror Key + XP.
**Objectives:** Align three mirror stations; enter a playable reconstruction of the vanished ward.
**Story consequence:** The missing district was not destroyed; its witnesses were forcibly severed from recollection.
**Requires all:** GLA-02. 
**Quest acceptance:** In Glassmere Archive, Magister Leth Sen needs you to align three mirror stations.
**Turn-in dialogue:** The missing district was not destroyed; its witnesses were forcibly severed from recollection.
**Completion flag:** `completed.GLA-03` (grant reward once; persist before UI reward acknowledgment).

### GLA-04 — The Consent That Never Was
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-04`. **Reward:** Unaltered Accord + XP.
**Objectives:** Hear the testimony of two signatories; reveal the altered consent clause.
**Story consequence:** The original Accord allowed people to withdraw from the pact; that clause was deleted.
**Requires all:** GLA-03. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to hear the testimony of two signatories.
**Turn-in dialogue:** The original Accord allowed people to withdraw from the pact; that clause was deleted.
**Completion flag:** `completed.GLA-04` (grant reward once; persist before UI reward acknowledgment).

### GLA-05 — Eda Speaks
**Giver:** Eda Sable (Echo). **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-05`. **Reward:** Eda's Wish + XP.
**Objectives:** Ask Eda three questions; leave one question unanswered when she refuses.
**Story consequence:** Eda is not Mareth's possession; she wants the missing people to choose for themselves.
**Requires all:** GLA-04. 
**Quest acceptance:** In Glassmere Archive, Eda Sable (Echo) needs you to ask Eda three questions.
**Turn-in dialogue:** Eda is not Mareth's possession; she wants the missing people to choose for themselves.
**Completion flag:** `completed.GLA-05` (grant reward once; persist before UI reward acknowledgment).

### GLA-06 — The Archivist's Trial
**Giver:** Sister Vale. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-06`. **Reward:** Truthkeeper Sigil + XP.
**Objectives:** Defend the archive from three Court incursions; publicly confess the experiment.
**Story consequence:** Vale offers evidence rather than requesting automatic forgiveness.
**Requires all:** GLA-05. 
**Quest acceptance:** In Glassmere Archive, Sister Vale needs you to defend the archive from three Court incursions.
**Turn-in dialogue:** Vale offers evidence rather than requesting automatic forgiveness.
**Completion flag:** `completed.GLA-06` (grant reward once; persist before UI reward acknowledgment).

### GLA-07 — The Mirror Accords
**Giver:** Magister Leth Sen. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-01`. **Reward:** Accord Draft + XP.
**Objectives:** Reconstruct the nine clauses; compare them to four cultural witnesses.
**Story consequence:** Only a council of living and surviving echoes can legitimately rewrite the breach rules.
**Requires all:** GLA-06. 
**Quest acceptance:** In Glassmere Archive, Magister Leth Sen needs you to reconstruct the nine clauses.
**Turn-in dialogue:** Only a council of living and surviving echoes can legitimately rewrite the breach rules.
**Completion flag:** `completed.GLA-07` (grant reward once; persist before UI reward acknowledgment).

### GLA-08 — Doors Without Chains
**Giver:** Keeper Sen Arlo. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-02`. **Reward:** Privacy Oath + XP.
**Objectives:** Open two prisoner records; release their names without revealing their private confessions.
**Story consequence:** Public accountability and personal privacy must coexist.
**Requires all:** GLA-07. 
**Quest acceptance:** In Glassmere Archive, Keeper Sen Arlo needs you to open two prisoner records.
**Turn-in dialogue:** Public accountability and personal privacy must coexist.
**Completion flag:** `completed.GLA-08` (grant reward once; persist before UI reward acknowledgment).

### GLA-09 — The Last Page Has No Author
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-03`. **Reward:** Glassmere arc flag + XP.
**Objectives:** Take the missing last page; begin the ascent to the Ninth Veil.
**Story consequence:** The final instruction is written as a question: “Who will witness the witness?”
**Requires all:** GLA-08. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to take the missing last page.
**Turn-in dialogue:** The final instruction is written as a question: “Who will witness the witness?”
**Completion flag:** `completed.GLA-09` (grant reward once; persist before UI reward acknowledgment).

## The Ninth Veil: The Witnesses Assemble
**Location:** The Ninth Veil  |  **Levels:** 52–60  |  **Quests:** 9  |  **Type:** zone

### VEI-01 — A Threshold Without a Key
**Giver:** Sister Vale. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-01`. **Reward:** Veil travel flag + XP.
**Objectives:** Bring four consent tokens; open the gate without sacrificing a companion.
**Story consequence:** The station was built for agreement, not brute force.
**Requires all:** GLA-09. 
**Quest acceptance:** In The Ninth Veil, Sister Vale needs you to bring four consent tokens.
**Turn-in dialogue:** The station was built for agreement, not brute force.
**Completion flag:** `completed.VEI-01` (grant reward once; persist before UI reward acknowledgment).

### VEI-02 — The Eight Who Remained
**Giver:** Magister Leth Sen. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-02`. **Reward:** Four Echo Marks + XP.
**Objectives:** Visit four witness echoes; complete their nonviolent tests.
**Story consequence:** Each clause addresses a failure of the original keepers.
**Requires all:** VEI-01. 
**Quest acceptance:** In The Ninth Veil, Magister Leth Sen needs you to visit four witness echoes.
**Turn-in dialogue:** Each clause addresses a failure of the original keepers.
**Completion flag:** `completed.VEI-02` (grant reward once; persist before UI reward acknowledgment).

### VEI-03 — The Silence We Inherited
**Giver:** Keeper Sen Arlo. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-03`. **Reward:** Silence Mark + XP.
**Objectives:** Follow an invisible causeway; read the hidden Ninth inscription.
**Story consequence:** Silence protected the vulnerable until leaders used it to hide guilt.
**Requires all:** VEI-02. 
**Quest acceptance:** In The Ninth Veil, Keeper Sen Arlo needs you to follow an invisible causeway.
**Turn-in dialogue:** Silence protected the vulnerable until leaders used it to hide guilt.
**Completion flag:** `completed.VEI-03` (grant reward once; persist before UI reward acknowledgment).

### VEI-04 — Mareth's Grief
**Giver:** Regent Mareth Sable. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-04`. **Reward:** Mareth Memory + XP.
**Objectives:** Witness the day Eda disappeared; resist the demand to rewrite the scene.
**Story consequence:** The catastrophe hurt real people, and neither romanticizing it nor erasing it heals them.
**Requires all:** VEI-03. 
**Quest acceptance:** In The Ninth Veil, Regent Mareth Sable needs you to witness the day Eda disappeared.
**Turn-in dialogue:** The catastrophe hurt real people, and neither romanticizing it nor erasing it heals them.
**Completion flag:** `completed.VEI-04` (grant reward once; persist before UI reward acknowledgment).

### VEI-05 — Eda's Choice
**Giver:** Eda Sable (Echo). **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-05`. **Reward:** Eda Choice Flag + XP.
**Objectives:** Bring Eda a free testimony form; listen to her decision.
**Story consequence:** Eda wishes to exist as a witness if that is possible without consuming another life.
**Requires all:** VEI-04. 
**Quest acceptance:** In The Ninth Veil, Eda Sable (Echo) needs you to bring Eda a free testimony form.
**Turn-in dialogue:** Eda wishes to exist as a witness if that is possible without consuming another life.
**Completion flag:** `completed.VEI-05` (grant reward once; persist before UI reward acknowledgment).

### VEI-06 — The Trial of Nine Voices
**Giver:** The Ninth Witness. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-06`. **Reward:** Accord Seal + XP.
**Objectives:** Complete nine short witness checks; have every people represented by player or NPC surrogate.
**Story consequence:** The Accord can be renewed as a federation of freely chosen vows.
**Requires all:** VEI-05. 
**Quest acceptance:** In The Ninth Veil, The Ninth Witness needs you to complete nine short witness checks.
**Turn-in dialogue:** The Accord can be renewed as a federation of freely chosen vows.
**Completion flag:** `completed.VEI-06` (grant reward once; persist before UI reward acknowledgment).

### VEI-07 — The Court's Last Engine
**Giver:** Marshal Oren Flint. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-01`. **Reward:** Endgame gear + XP.
**Objectives:** Disable three siphons; defeat the Memory Engine manifestation.
**Story consequence:** The echo tide becomes survivable when freed from a single controlling apparatus.
**Requires all:** VEI-06. 
**Quest acceptance:** In The Ninth Veil, Marshal Oren Flint needs you to disable three siphons.
**Turn-in dialogue:** The echo tide becomes survivable when freed from a single controlling apparatus.
**Completion flag:** `completed.VEI-07` (grant reward once; persist before UI reward acknowledgment).

### VEI-08 — The Ninth Was Us
**Giver:** Sister Vale. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-02`. **Reward:** Ending codex + Choice cosmetic.
**Objectives:** Choose open witnessing or guarded stewardship as your public policy; confirm that no memory is forcibly erased.
**Story consequence:** The ending preserves one canonical world state with two accountable community approaches.
**Requires all:** VEI-07. 
**Quest acceptance:** In The Ninth Veil, Sister Vale needs you to choose open witnessing or guarded stewardship as your public policy.
**Turn-in dialogue:** The ending preserves one canonical world state with two accountable community approaches.
**Completion flag:** `completed.VEI-08` (grant reward once; persist before UI reward acknowledgment).

### VEI-09 — Lanterns for the Unnamed
**Giver:** Gatekeeper Elric. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-03`. **Reward:** Campaign complete + Season-one title.
**Objectives:** Return to Lantern's Reach; add nine names to the memorial; attend the bell ceremony.
**Story consequence:** The first season closes with the world changed but still imperfect and inhabitable.
**Requires all:** VEI-08. 
**Quest acceptance:** In The Ninth Veil, Gatekeeper Elric needs you to return to Lantern's Reach.
**Turn-in dialogue:** The first season closes with the world changed but still imperfect and inhabitable.
**Completion flag:** `completed.VEI-09` (grant reward once; persist before UI reward acknowledgment).

## Hollowcrypt: The Candle Warden
**Location:** The Hollowcrypt  |  **Levels:** 17–21  |  **Quests:** 4  |  **Type:** dungeon

### DHC-01 — The Unlit Vestibule
**Giver:** Sister Vale. **Zone:** The Hollowcrypt. **Atlas point:** `THEHA2C9-01`. **Reward:** Dungeon entrance flag + XP.
**Objectives:** Enter Hollowcrypt in story projection or tested 2–4-player instance; light three unclaimed candles.
**Story consequence:** The old index demands names, but never explains what it does with them.
**Requires all:** Q008, EQU-09. 
**Quest acceptance:** In The Hollowcrypt, Sister Vale needs you to enter Hollowcrypt in story projection or tested 2–4-player instance.
**Turn-in dialogue:** The old index demands names, but never explains what it does with them.
**Completion flag:** `completed.DHC-01` (grant reward once; persist before UI reward acknowledgment).

### DHC-02 — The Pages Who Walk
**Giver:** Gatekeeper Elric. **Zone:** The Hollowcrypt. **Atlas point:** `THEHA2C9-02`. **Reward:** Index Fragment + XP.
**Objectives:** Defeat three inkbound archivists; recover two torn census strips.
**Story consequence:** The strips name families erased when the town surrendered responsibility for them.
**Requires all:** DHC-01. 
**Quest acceptance:** In The Hollowcrypt, Gatekeeper Elric needs you to defeat three inkbound archivists.
**Turn-in dialogue:** The strips name families erased when the town surrendered responsibility for them.
**Completion flag:** `completed.DHC-02` (grant reward once; persist before UI reward acknowledgment).

### DHC-03 — The Candle Warden
**Giver:** The Candle Warden. **Zone:** The Hollowcrypt. **Atlas point:** `THEHA2C9-03`. **Reward:** Dungeon seal + equipment cache.
**Objectives:** Avoid three telegraphed sweeps; break the sigil ring; defeat the Candle Warden.
**Story consequence:** The Warden was created to protect witnesses from forcible interrogation, then given the opposite command.
**Requires all:** DHC-02. 
**Quest acceptance:** In The Hollowcrypt, The Candle Warden needs you to avoid three telegraphed sweeps.
**Turn-in dialogue:** The Warden was created to protect witnesses from forcible interrogation, then given the opposite command.
**Completion flag:** `completed.DHC-03` (grant reward once; persist before UI reward acknowledgment).

### DHC-04 — A Flame Returned
**Giver:** Sister Vale. **Zone:** The Hollowcrypt. **Atlas point:** `THEHA2C9-04`. **Reward:** Candle Warden Codex + XP.
**Objectives:** Release two echo testimonies; restore the Warden's original command; exit safely.
**Story consequence:** The dungeon proves a coerced defense can be repaired without obliterating its witness.
**Requires all:** DHC-03. 
**Quest acceptance:** In The Hollowcrypt, Sister Vale needs you to release two echo testimonies.
**Turn-in dialogue:** The dungeon proves a coerced defense can be repaired without obliterating its witness.
**Completion flag:** `completed.DHC-04` (grant reward once; persist before UI reward acknowledgment).

## Drowned Bell: Choir Under the Water
**Location:** Sorrowfen Sunken Chapel  |  **Levels:** 23–27  |  **Quests:** 4  |  **Type:** dungeon

### DSB-01 — Beneath the Marsh Floor
**Giver:** Marsh Guide Pell. **Zone:** Sorrowfen Sunken Chapel. **Atlas point:** `SORRF6BC-01`. **Reward:** Underwater route + XP.
**Objectives:** Open the pump gate; escort a wisp through the flooded stairs.
**Story consequence:** Water carries the names of an entire displaced quarter.
**Requires all:** SOR-06. 
**Quest acceptance:** In Sorrowfen Sunken Chapel, Marsh Guide Pell needs you to open the pump gate.
**Turn-in dialogue:** Water carries the names of an entire displaced quarter.
**Completion flag:** `completed.DSB-01` (grant reward once; persist before UI reward acknowledgment).

### DSB-02 — The Mouth of the Mire
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen Sunken Chapel. **Atlas point:** `SORRF6BC-02`. **Reward:** Wisp Chorus Piece + XP.
**Objectives:** Defeat two corrupted reed sentries; open three air pockets.
**Story consequence:** A trapped spirit is singing a lullaby rather than a battle cry.
**Requires all:** DSB-01. 
**Quest acceptance:** In Sorrowfen Sunken Chapel, Reedkeeper Iona Sedge needs you to defeat two corrupted reed sentries.
**Turn-in dialogue:** A trapped spirit is singing a lullaby rather than a battle cry.
**Completion flag:** `completed.DSB-02` (grant reward once; persist before UI reward acknowledgment).

### DSB-03 — Choirmother Without Choir
**Giver:** Wisp Tender Kele. **Zone:** Sorrowfen Sunken Chapel. **Atlas point:** `SORRF6BC-03`. **Reward:** Dungeon equipment + XP.
**Objectives:** Disrupt the tethering chords; defeat the Choirmother projection.
**Story consequence:** The boss was a caretaker repurposed as a power source.
**Requires all:** DSB-02. 
**Quest acceptance:** In Sorrowfen Sunken Chapel, Wisp Tender Kele needs you to disrupt the tethering chords.
**Turn-in dialogue:** The boss was a caretaker repurposed as a power source.
**Completion flag:** `completed.DSB-03` (grant reward once; persist before UI reward acknowledgment).

### DSB-04 — One Song for the Living
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen Sunken Chapel. **Atlas point:** `SORRF6BC-04`. **Reward:** Marsh faction reward + shortcut.
**Objectives:** Return the stolen melody to the memorial; open the dry escape path.
**Story consequence:** Releasing the choir reduces hostility in the surface marsh.
**Requires all:** DSB-03. 
**Quest acceptance:** In Sorrowfen Sunken Chapel, Reedkeeper Iona Sedge needs you to return the stolen melody to the memorial.
**Turn-in dialogue:** Releasing the choir reduces hostility in the surface marsh.
**Completion flag:** `completed.DSB-04` (grant reward once; persist before UI reward acknowledgment).

## Root Archive: Orchard Below
**Location:** Briarwild Deepgrove  |  **Levels:** 29–33  |  **Quests:** 4  |  **Type:** dungeon

### DRT-01 — Door in the Trunk
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-01`. **Reward:** Root elevator + XP.
**Objectives:** Unlock the root elevator; guide a living seed without crushing it.
**Story consequence:** The orchard records communal promises and the people who contested them.
**Requires all:** BRD-06. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to unlock the root elevator.
**Turn-in dialogue:** The orchard records communal promises and the people who contested them.
**Completion flag:** `completed.DRT-01` (grant reward once; persist before UI reward acknowledgment).

### DRT-02 — The Orchard That Counts
**Giver:** Grove Singer Ell. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-02`. **Reward:** Grove Codex + XP.
**Objectives:** Solve three living glyph puzzles; protect a fragile witness branch.
**Story consequence:** A former Keeper counted people as assets in a crisis.
**Requires all:** DRT-01. 
**Quest acceptance:** In Briarwild Deepgrove, Grove Singer Ell needs you to solve three living glyph puzzles.
**Turn-in dialogue:** A former Keeper counted people as assets in a crisis.
**Completion flag:** `completed.DRT-02` (grant reward once; persist before UI reward acknowledgment).

### DRT-03 — The Thorn Custodian
**Giver:** Tamsin the Ranger. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-03`. **Reward:** Boss equipment + XP.
**Objectives:** Disable bellglass thorns; defeat the Thorn Custodian.
**Story consequence:** It attacks anyone carrying a false oath, including Court and council members.
**Requires all:** DRT-02. 
**Quest acceptance:** In Briarwild Deepgrove, Tamsin the Ranger needs you to disable bellglass thorns.
**Turn-in dialogue:** It attacks anyone carrying a false oath, including Court and council members.
**Completion flag:** `completed.DRT-03` (grant reward once; persist before UI reward acknowledgment).

### DRT-04 — No Fruit for the Crown
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-04`. **Reward:** Root Archive Sigil + XP.
**Objectives:** Plant the archive kernel in an open glade; escort it to daylight.
**Story consequence:** The orchard will share records with all communities instead of one leader.
**Requires all:** DRT-03. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to plant the archive kernel in an open glade.
**Turn-in dialogue:** The orchard will share records with all communities instead of one leader.
**Completion flag:** `completed.DRT-04` (grant reward once; persist before UI reward acknowledgment).

## Bell Foundry: Engine of Mercy
**Location:** Emberstone Bastion  |  **Levels:** 43–48  |  **Quests:** 4  |  **Type:** dungeon

### DBF-01 — The Furnace Lock
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Foundry key + XP.
**Objectives:** Disable three pressure vents; protect trapped workers.
**Story consequence:** A Court engine is running on the voices of imprisoned echoes.
**Requires all:** BAS-07. 
**Quest acceptance:** In Emberstone Bastion, Mira the Forgekeeper needs you to disable three pressure vents.
**Turn-in dialogue:** A Court engine is running on the voices of imprisoned echoes.
**Completion flag:** `completed.DBF-01` (grant reward once; persist before UI reward acknowledgment).

### DBF-02 — The Uncounted Shift
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Worker testimony + XP.
**Objectives:** Free two echo-workers; recover the original safety order.
**Story consequence:** The first keepers knew the engine could not be operated ethically at scale.
**Requires all:** DBF-01. 
**Quest acceptance:** In Emberstone Bastion, Mason Yurra Flint-Eye needs you to free two echo-workers.
**Turn-in dialogue:** The first keepers knew the engine could not be operated ethically at scale.
**Completion flag:** `completed.DBF-02` (grant reward once; persist before UI reward acknowledgment).

### DBF-03 — The Bellforged Sentinel
**Giver:** Marshal Oren Flint. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-03`. **Reward:** Boss equipment + XP.
**Objectives:** Defeat the sentinel using clear interrupt and safe-zone signals.
**Story consequence:** A broken command, not malice, drives the sentinel.
**Requires all:** DBF-02. 
**Quest acceptance:** In Emberstone Bastion, Marshal Oren Flint needs you to defeat the sentinel using clear interrupt and safe-zone signals.
**Turn-in dialogue:** A broken command, not malice, drives the sentinel.
**Completion flag:** `completed.DBF-03` (grant reward once; persist before UI reward acknowledgment).

### DBF-04 — An Engine Without a Master
**Giver:** Sister Vale. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-04`. **Reward:** Foundry Seal + XP.
**Objectives:** Shut down the central siphon; rescue two living engineers.
**Story consequence:** Disabling the machine proves rescue can be attempted without sacrificing bystanders.
**Requires all:** DBF-03. 
**Quest acceptance:** In Emberstone Bastion, Sister Vale needs you to shut down the central siphon.
**Turn-in dialogue:** Disabling the machine proves rescue can be attempted without sacrificing bystanders.
**Completion flag:** `completed.DBF-04` (grant reward once; persist before UI reward acknowledgment).

## Mirror Hall: The Unwritten Room
**Location:** Glassmere Archive  |  **Levels:** 50–55  |  **Quests:** 4  |  **Type:** dungeon

### DMR-01 — The Reflecting Stair
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-01`. **Reward:** Mirror entrance + XP.
**Objectives:** Align three mirrors; prevent a memory loop from closing.
**Story consequence:** The stairs turn guilt into repetition until someone names the act honestly.
**Requires all:** GLA-06. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to align three mirrors.
**Turn-in dialogue:** The stairs turn guilt into repetition until someone names the act honestly.
**Completion flag:** `completed.DMR-01` (grant reward once; persist before UI reward acknowledgment).

### DMR-02 — The Double That Denies
**Giver:** Sister Vale. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-02`. **Reward:** Mirror witness + XP.
**Objectives:** Challenge two reflected testimonies; choose the truthful sequence.
**Story consequence:** Each party member confronts an omission from their origin.
**Requires all:** DMR-01. 
**Quest acceptance:** In Glassmere Archive, Sister Vale needs you to challenge two reflected testimonies.
**Turn-in dialogue:** Each party member confronts an omission from their origin.
**Completion flag:** `completed.DMR-02` (grant reward once; persist before UI reward acknowledgment).

### DMR-03 — Curator Without a Face
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-03`. **Reward:** Boss equipment + XP.
**Objectives:** Defeat the Faceless Cataloguer; keep the archive lamps lit.
**Story consequence:** The Cataloguer hid evidence to spare its authors exposure.
**Requires all:** DMR-02. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to defeat the Faceless Cataloguer.
**Turn-in dialogue:** The Cataloguer hid evidence to spare its authors exposure.
**Completion flag:** `completed.DMR-03` (grant reward once; persist before UI reward acknowledgment).

### DMR-04 — The Unredacted Page
**Giver:** Magister Leth Sen. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-04`. **Reward:** Ninth clause + XP.
**Objectives:** Carry the unaltered Ninth clause from the mirror hall.
**Story consequence:** The final Accord cannot be signed in the absence of those affected.
**Requires all:** DMR-03. 
**Quest acceptance:** In Glassmere Archive, Magister Leth Sen needs you to carry the unaltered Ninth clause from the mirror hall.
**Turn-in dialogue:** The final Accord cannot be signed in the absence of those affected.
**Completion flag:** `completed.DMR-04` (grant reward once; persist before UI reward acknowledgment).

## Season-One Finale: Assembly of the Ninth
**Location:** Ninth Veil Assembly  |  **Levels:** 60  |  **Quests:** 5  |  **Type:** dungeon

### RAC-01 — The Gathering of Delegates
**Giver:** Magister Leth Sen. **Zone:** Ninth Veil Assembly. **Atlas point:** `THEN5FC1-01`. **Reward:** Assembly Banner + XP.
**Objectives:** Invite six living delegations and three echo delegates; confirm consent.
**Story consequence:** A raid encounter begins as an assembly, not a conquest.
**Requires all:** VEI-09. 
**Quest acceptance:** In Ninth Veil Assembly, Magister Leth Sen needs you to invite six living delegations and three echo delegates.
**Turn-in dialogue:** A raid encounter begins as an assembly, not a conquest.
**Completion flag:** `completed.RAC-01` (grant reward once; persist before UI reward acknowledgment).

### RAC-02 — Nine Seats, None a Throne
**Giver:** The Ninth Witness. **Zone:** Ninth Veil Assembly. **Atlas point:** `THEN5FC1-02`. **Reward:** Witness Star + XP.
**Objectives:** Complete nine coordinated station mechanics; never assign one player permanent control.
**Story consequence:** Power is distributed by design.
**Requires all:** RAC-01. 
**Quest acceptance:** In Ninth Veil Assembly, The Ninth Witness needs you to complete nine coordinated station mechanics.
**Turn-in dialogue:** Power is distributed by design.
**Completion flag:** `completed.RAC-02` (grant reward once; persist before UI reward acknowledgment).

### RAC-03 — Against the Memory Engine
**Giver:** Regent Mareth Sable. **Zone:** Ninth Veil Assembly. **Atlas point:** `THEN5FC1-03`. **Reward:** Boss loot + Season-one achievement.
**Objectives:** Fight the unleashed Memory Engine through three phases: siphons, echo tide, arbitration.
**Story consequence:** Mareth aids its shutdown after realizing her daughter refuses coerced return.
**Requires all:** RAC-02. 
**Quest acceptance:** In Ninth Veil Assembly, Regent Mareth Sable needs you to fight the unleashed Memory Engine through three phases: siphons, echo tide, arbitration.
**Turn-in dialogue:** Mareth aids its shutdown after realizing her daughter refuses coerced return.
**Completion flag:** `completed.RAC-03` (grant reward once; persist before UI reward acknowledgment).

### RAC-04 — The Hearing After Victory
**Giver:** Sister Vale. **Zone:** Ninth Veil Assembly. **Atlas point:** `THEN5FC1-04`. **Reward:** Ending banner cosmetic + Codex.
**Objectives:** Listen to three victims; record public restitution promises.
**Story consequence:** Saving the world does not erase the guilt of past rulers or absolve Mareth.
**Requires all:** RAC-03. 
**Quest acceptance:** In Ninth Veil Assembly, Sister Vale needs you to listen to three victims.
**Turn-in dialogue:** Saving the world does not erase the guilt of past rulers or absolve Mareth.
**Completion flag:** `completed.RAC-04` (grant reward once; persist before UI reward acknowledgment).

### RAC-05 — The Bell at First Light
**Giver:** Gatekeeper Elric. **Zone:** Ninth Veil Assembly. **Atlas point:** `THEN5FC1-05`. **Reward:** Season-one epilogue unlock.
**Objectives:** Attend the open remembrance ceremony; choose a commemorative crest.
**Story consequence:** The Nine now means a civic promise made and remade by the living.
**Requires all:** RAC-04. 
**Quest acceptance:** In Ninth Veil Assembly, Gatekeeper Elric needs you to attend the open remembrance ceremony.
**Turn-in dialogue:** The Nine now means a civic promise made and remade by the living.
**Completion flag:** `completed.RAC-05` (grant reward once; persist before UI reward acknowledgment).

## Lantern's Reach: Ordinary Lives
**Location:** Lantern's Reach  |  **Levels:** 6–12  |  **Quests:** 2  |  **Type:** side

### SLN-01 — Bread Before Prophecy
**Giver:** Quartermaster Dren. **Zone:** Lantern's Reach. **Atlas point:** `LANT1E2B-01`. **Reward:** Coins + City favor.
**Objectives:** Deliver three loaves to workers; learn their names.
**Story consequence:** Every epic campaign must show who survives between battles.
**Requires all:** None. 
**Quest acceptance:** In Lantern's Reach, Quartermaster Dren needs you to deliver three loaves to workers.
**Turn-in dialogue:** Every epic campaign must show who survives between battles.
**Completion flag:** `completed.SLN-01` (grant reward once; persist before UI reward acknowledgment).

### SLN-02 — A Tavern Full of Rumors
**Giver:** Innkeeper Maela. **Zone:** Lantern's Reach. **Atlas point:** `LANT1E2B-02`. **Reward:** Rumor board unlock.
**Objectives:** Hear three conflicting rumors; record uncertainty rather than choose a false certainty.
**Story consequence:** The tavern becomes a repeatable rumor hub after completion.
**Requires all:** SLN-01. 
**Quest acceptance:** In Lantern's Reach, Innkeeper Maela needs you to hear three conflicting rumors.
**Turn-in dialogue:** The tavern becomes a repeatable rumor hub after completion.
**Completion flag:** `completed.SLN-02` (grant reward once; persist before UI reward acknowledgment).

## Briarwild: Voices of the Grove
**Location:** Briarwild  |  **Levels:** 10–19  |  **Quests:** 2  |  **Type:** side

### SBR-01 — A Child's Bell
**Giver:** Grove Singer Ell. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-01`. **Reward:** Grove favor.
**Objectives:** Locate a missing toy bell; ask the child whether it may be kept in the archive.
**Story consequence:** Even a small object is not automatically communal property.
**Requires all:** None. 
**Quest acceptance:** In Briarwild, Grove Singer Ell needs you to locate a missing toy bell.
**Turn-in dialogue:** Even a small object is not automatically communal property.
**Completion flag:** `completed.SBR-01` (grant reward once; persist before UI reward acknowledgment).

### SBR-02 — The Safe Wolf
**Giver:** Tamsin the Ranger. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-02`. **Reward:** Nature craft material.
**Objectives:** Treat a snared wolf; remove two bellglass traps.
**Story consequence:** The player can solve a wildlife threat without a kill quest.
**Requires all:** SBR-01. 
**Quest acceptance:** In Briarwild, Tamsin the Ranger needs you to treat a snared wolf.
**Turn-in dialogue:** The player can solve a wildlife threat without a kill quest.
**Completion flag:** `completed.SBR-02` (grant reward once; persist before UI reward acknowledgment).

## Emberstone: Worker Stories
**Location:** Emberstone Quarry  |  **Levels:** 13–19  |  **Quests:** 2  |  **Type:** side

### SEQ-01 — A Miner's Lunch
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-01`. **Reward:** Cooking XP.
**Objectives:** Cook three hearty meals; deliver them during shift change.
**Story consequence:** Work crews speak more honestly outside council chambers.
**Requires all:** None. 
**Quest acceptance:** In Emberstone Quarry, Mason Yurra Flint-Eye needs you to cook three hearty meals.
**Turn-in dialogue:** Work crews speak more honestly outside council chambers.
**Completion flag:** `completed.SEQ-01` (grant reward once; persist before UI reward acknowledgment).

### SEQ-02 — The Apprentice's Signature
**Giver:** Quarry Foreman Kiv. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-02`. **Reward:** Forge favor.
**Objectives:** Locate an apprentice's contract; help correct two false time entries.
**Story consequence:** A signature without understanding should never bind another life.
**Requires all:** SEQ-01. 
**Quest acceptance:** In Emberstone Quarry, Quarry Foreman Kiv needs you to locate an apprentice's contract.
**Turn-in dialogue:** A signature without understanding should never bind another life.
**Completion flag:** `completed.SEQ-02` (grant reward once; persist before UI reward acknowledgment).

## Sorrowfen: The Wisp Keeper
**Location:** Sorrowfen  |  **Levels:** 18–25  |  **Quests:** 2  |  **Type:** side

### SSF-01 — Lanterns Without Chains
**Giver:** Wisp Tender Kele. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-01`. **Reward:** Wisp lantern decorative.
**Objectives:** Build two open-sided memorial lanterns; release two wisps.
**Story consequence:** Not every spirit must be bound to be guided.
**Requires all:** None. 
**Quest acceptance:** In Sorrowfen, Wisp Tender Kele needs you to build two open-sided memorial lanterns.
**Turn-in dialogue:** Not every spirit must be bound to be guided.
**Completion flag:** `completed.SSF-01` (grant reward once; persist before UI reward acknowledgment).

### SSF-02 — A Reed for Every Door
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-02`. **Reward:** Reedwoven cloak.
**Objectives:** Gather four reeds; weave two neighbor markers.
**Story consequence:** Marsh villages survive by recording whose help they need.
**Requires all:** SSF-01. 
**Quest acceptance:** In Sorrowfen, Reedkeeper Iona Sedge needs you to gather four reeds.
**Turn-in dialogue:** Marsh villages survive by recording whose help they need.
**Completion flag:** `completed.SSF-02` (grant reward once; persist before UI reward acknowledgment).

## Tideglass: Small Harbors
**Location:** Tideglass Coast  |  **Levels:** 25–32  |  **Quests:** 2  |  **Type:** side

### STD-01 — Fish for the Returning
**Giver:** Netmaker Sari. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-01`. **Reward:** Fishing XP.
**Objectives:** Catch three fish; prepare a feast for survivors.
**Story consequence:** Not every sailor makes it back, and survivors need ordinary care.
**Requires all:** None. 
**Quest acceptance:** In Tideglass Coast, Netmaker Sari needs you to catch three fish.
**Turn-in dialogue:** Not every sailor makes it back, and survivors need ordinary care.
**Completion flag:** `completed.STD-01` (grant reward once; persist before UI reward acknowledgment).

### STD-02 — The Lighthouse Apprentice
**Giver:** Shellkeeper Ruun. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-02`. **Reward:** Lighthouse favor.
**Objectives:** Show a novice how to tend two lenses.
**Story consequence:** Maintenance becomes a social encounter rather than just a button press.
**Requires all:** STD-01. 
**Quest acceptance:** In Tideglass Coast, Shellkeeper Ruun needs you to show a novice how to tend two lenses.
**Turn-in dialogue:** Maintenance becomes a social encounter rather than just a button press.
**Completion flag:** `completed.STD-02` (grant reward once; persist before UI reward acknowledgment).

## Briarwild Deepgrove: Living Paths
**Location:** Briarwild Deepgrove  |  **Levels:** 25–32  |  **Quests:** 2  |  **Type:** side

### SBD-01 — The Tree That Needed Space
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-01`. **Reward:** Shortcut access.
**Objectives:** Move two roots away from the road; grow a footbridge.
**Story consequence:** The forest and travelers can negotiate instead of one overruling the other.
**Requires all:** None. 
**Quest acceptance:** In Briarwild Deepgrove, Elder Fenna Rootwake needs you to move two roots away from the road.
**Turn-in dialogue:** The forest and travelers can negotiate instead of one overruling the other.
**Completion flag:** `completed.SBD-01` (grant reward once; persist before UI reward acknowledgment).

### SBD-02 — The Old Gardener's Regret
**Giver:** Grove Singer Ell. **Zone:** Briarwild Deepgrove. **Atlas point:** `BRIA23C3-02`. **Reward:** Seed bank access.
**Objectives:** Find one lost trowel; return it without publishing its owner's private confession.
**Story consequence:** Remembrance can allow privacy.
**Requires all:** SBD-01. 
**Quest acceptance:** In Briarwild Deepgrove, Grove Singer Ell needs you to find one lost trowel.
**Turn-in dialogue:** Remembrance can allow privacy.
**Completion flag:** `completed.SBD-02` (grant reward once; persist before UI reward acknowledgment).

## Velthraen: The Windharp Festival
**Location:** Velthraen Reach  |  **Levels:** 32–39  |  **Quests:** 2  |  **Type:** side

### SVR-01 — Festival of Unfinished Songs
**Giver:** Star Reader Otho. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-01`. **Reward:** Emote: Windharp.
**Objectives:** Tune four windharps; perform an incomplete tune.
**Story consequence:** Dissent and unfinished work are part of the region's identity.
**Requires all:** None. 
**Quest acceptance:** In Velthraen Reach, Star Reader Otho needs you to tune four windharps.
**Turn-in dialogue:** Dissent and unfinished work are part of the region's identity.
**Completion flag:** `completed.SVR-01` (grant reward once; persist before UI reward acknowledgment).

### SVR-02 — The Apprentice Atlas
**Giver:** Glidewarden Ires. **Zone:** Velthraen Reach. **Atlas point:** `VELTD712-02`. **Reward:** Atlas cosmetic.
**Objectives:** Show two new scouts the safe routes; reject a dangerous shortcut.
**Story consequence:** Paths should be judged by who can traverse them.
**Requires all:** SVR-01. 
**Quest acceptance:** In Velthraen Reach, Glidewarden Ires needs you to show two new scouts the safe routes.
**Turn-in dialogue:** Paths should be judged by who can traverse them.
**Completion flag:** `completed.SVR-02` (grant reward once; persist before UI reward acknowledgment).

## Emberstone Bastion: The Union Table
**Location:** Emberstone Bastion  |  **Levels:** 39–46  |  **Quests:** 2  |  **Type:** side

### SBF-01 — A Seat at the Table
**Giver:** Regent Nala Vorn. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Guild favor.
**Objectives:** Speak with three laborers and one councilor; record each demand.
**Story consequence:** Competing interests become specific human stakes.
**Requires all:** None. 
**Quest acceptance:** In Emberstone Bastion, Regent Nala Vorn needs you to speak with three laborers and one councilor.
**Turn-in dialogue:** Competing interests become specific human stakes.
**Completion flag:** `completed.SBF-01` (grant reward once; persist before UI reward acknowledgment).

### SBF-02 — The Shift Ends Here
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Safety emblem cosmetic.
**Objectives:** Repair two safety vents; escort three workers home.
**Story consequence:** The city can replace an extractive system without abandoning its people.
**Requires all:** SBF-01. 
**Quest acceptance:** In Emberstone Bastion, Mason Yurra Flint-Eye needs you to repair two safety vents.
**Turn-in dialogue:** The city can replace an extractive system without abandoning its people.
**Completion flag:** `completed.SBF-02` (grant reward once; persist before UI reward acknowledgment).

## Glassmere: Private Histories
**Location:** Glassmere Archive  |  **Levels:** 46–53  |  **Quests:** 2  |  **Type:** side

### SGA-01 — The Borrowed Diary
**Giver:** Curator Ossa. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-01`. **Reward:** Archive favor.
**Objectives:** Find one diary; ask permission before quoting from it.
**Story consequence:** Not all memories belong in a public archive.
**Requires all:** None. 
**Quest acceptance:** In Glassmere Archive, Curator Ossa needs you to find one diary.
**Turn-in dialogue:** Not all memories belong in a public archive.
**Completion flag:** `completed.SGA-01` (grant reward once; persist before UI reward acknowledgment).

### SGA-02 — A Letter Never Sent
**Giver:** Keeper Sen Arlo. **Zone:** Glassmere Archive. **Atlas point:** `GLASA846-02`. **Reward:** Private correspondence tab.
**Objectives:** Deliver a sealed letter to its named recipient; do not read it.
**Story consequence:** The player learns to preserve another person's private ending.
**Requires all:** SGA-01. 
**Quest acceptance:** In Glassmere Archive, Keeper Sen Arlo needs you to deliver a sealed letter to its named recipient.
**Turn-in dialogue:** The player learns to preserve another person's private ending.
**Completion flag:** `completed.SGA-02` (grant reward once; persist before UI reward acknowledgment).

## Ninth Veil: The Work After
**Location:** The Ninth Veil  |  **Levels:** 55–60  |  **Quests:** 2  |  **Type:** side

### SVI-01 — Stones That Stay
**Giver:** Magister Leth Sen. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-01`. **Reward:** Civic reputation.
**Objectives:** Repair three waystones; let citizens choose inscriptions.
**Story consequence:** Restitution requires ongoing labor and shared authority.
**Requires all:** None. 
**Quest acceptance:** In The Ninth Veil, Magister Leth Sen needs you to repair three waystones.
**Turn-in dialogue:** Restitution requires ongoing labor and shared authority.
**Completion flag:** `completed.SVI-01` (grant reward once; persist before UI reward acknowledgment).

### SVI-02 — A Place for the Unnamed
**Giver:** Gatekeeper Elric. **Zone:** The Ninth Veil. **Atlas point:** `THEN5FC1-02`. **Reward:** Remembrance housing item.
**Objectives:** Light nine memorial lamps; leave one empty for those who decline recognition.
**Story consequence:** The silence of a survivor can be respected rather than erased.
**Requires all:** SVI-01. 
**Quest acceptance:** In The Ninth Veil, Gatekeeper Elric needs you to light nine memorial lamps.
**Turn-in dialogue:** The silence of a survivor can be respected rather than erased.
**Completion flag:** `completed.SVI-02` (grant reward once; persist before UI reward acknowledgment).

## Prospector’s Ledger
**Location:** Emberstone Quarry  |  **Levels:** 12–20  |  **Quests:** 9  |  **Type:** profession

### PRM-01 — An Honest Strike
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Survey three safe copper seams.
**Story consequence:** Prospecting starts by identifying safe rock rather than chasing rare ore.
**Requires all:** None. 
**Quest acceptance:** Mason Yurra Flint-Eye: “An Honest Strike. Survey three safe copper seams. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Prospecting starts by identifying safe rock rather than chasing rare ore.”
**Completion flag:** `completed.PRM-01` (grant reward once; persist before UI reward acknowledgment).

### PRM-02 — The Bent Pick
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Repair a novice miner’s damaged pick.
**Story consequence:** Tool durability is a question of safety, not just expense.
**Requires all:** PRM-01. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Bent Pick. Repair a novice miner’s damaged pick. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Tool durability is a question of safety, not just expense.”
**Completion flag:** `completed.PRM-02` (grant reward once; persist before UI reward acknowledgment).

### PRM-03 — The Dust in the Lantern
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Collect dust samples without entering the sealed shaft.
**Story consequence:** The bellglass dust sings even when the source is out of sight.
**Requires all:** PRM-02. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Dust in the Lantern. Collect dust samples without entering the sealed shaft. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The bellglass dust sings even when the source is out of sight.”
**Completion flag:** `completed.PRM-03` (grant reward once; persist before UI reward acknowledgment).

### PRM-04 — Three Witness Marks
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-04`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Photograph or sketch three old chisel inscriptions.
**Story consequence:** The erased crew marked the route to their air shaft.
**Requires all:** PRM-03. 
**Quest acceptance:** Mason Yurra Flint-Eye: “Three Witness Marks. Photograph or sketch three old chisel inscriptions. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The erased crew marked the route to their air shaft.”
**Completion flag:** `completed.PRM-04` (grant reward once; persist before UI reward acknowledgment).

### PRM-05 — An Unpaid Shift
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-05`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Bring six meal parcels to the union hall.
**Story consequence:** Families still leave food for miners missing from the official roll.
**Requires all:** PRM-04. 
**Quest acceptance:** Mason Yurra Flint-Eye: “An Unpaid Shift. Bring six meal parcels to the union hall. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Families still leave food for miners missing from the official roll.”
**Completion flag:** `completed.PRM-05` (grant reward once; persist before UI reward acknowledgment).

### PRM-06 — The Careful Blast
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-06`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Set warnings and evacuate NPC workers before clearing rubble.
**Story consequence:** A foreman’s old blasting code prioritized shipments over lives.
**Requires all:** PRM-05. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Careful Blast. Set warnings and evacuate NPC workers before clearing rubble. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “A foreman’s old blasting code prioritized shipments over lives.”
**Completion flag:** `completed.PRM-06` (grant reward once; persist before UI reward acknowledgment).

### PRM-07 — Cart of Ordinary Stone
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Escort a lawful ore cart to the lower forge.
**Story consequence:** The forge can function without harvesting human testimony.
**Requires all:** PRM-06. 
**Quest acceptance:** Mason Yurra Flint-Eye: “Cart of Ordinary Stone. Escort a lawful ore cart to the lower forge. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The forge can function without harvesting human testimony.”
**Completion flag:** `completed.PRM-07` (grant reward once; persist before UI reward acknowledgment).

### PRM-08 — What the Quarry Owes
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Choose a worker representative to receive safety records.
**Story consequence:** Worker councils will inspect all future bellglass contracts.
**Requires all:** PRM-07. 
**Quest acceptance:** Mason Yurra Flint-Eye: “What the Quarry Owes. Choose a worker representative to receive safety records. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Worker councils will inspect all future bellglass contracts.”
**Completion flag:** `completed.PRM-08` (grant reward once; persist before UI reward acknowledgment).

### PRM-09 — The Open Shaft Register
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Quarry. **Atlas point:** `EMBE2DE0-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Publish safe seams and mark forbidden ones on the public map.
**Story consequence:** Knowledge shared openly becomes an economic tool for everyone.
**Requires all:** PRM-08. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Open Shaft Register. Publish safe seams and mark forbidden ones on the public map. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Knowledge shared openly becomes an economic tool for everyone.”
**Completion flag:** `completed.PRM-09` (grant reward once; persist before UI reward acknowledgment).

## Woodland Stewardship
**Location:** Briarwild  |  **Levels:** 7–19  |  **Quests:** 9  |  **Type:** profession

### PRW-01 — Fallen Not Felled
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Harvest only wind-fallen branches.
**Story consequence:** Living root tunnels protect the glade from flood.
**Requires all:** None. 
**Quest acceptance:** Elder Fenna Rootwake: “Fallen Not Felled. Harvest only wind-fallen branches. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Living root tunnels protect the glade from flood.”
**Completion flag:** `completed.PRW-01` (grant reward once; persist before UI reward acknowledgment).

### PRW-02 — Bark Has Memory
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Identify four tree species by bark and leaf.
**Story consequence:** The oldest grove holds a map of forgotten migration.
**Requires all:** PRW-01. 
**Quest acceptance:** Elder Fenna Rootwake: “Bark Has Memory. Identify four tree species by bark and leaf. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The oldest grove holds a map of forgotten migration.”
**Completion flag:** `completed.PRW-02` (grant reward once; persist before UI reward acknowledgment).

### PRW-03 — The Forester’s Axe
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Repair a woodcutter’s chipped axe.
**Story consequence:** Resource gathering needs care and steady tools.
**Requires all:** PRW-02. 
**Quest acceptance:** Elder Fenna Rootwake: “The Forester’s Axe. Repair a woodcutter’s chipped axe. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Resource gathering needs care and steady tools.”
**Completion flag:** `completed.PRW-03` (grant reward once; persist before UI reward acknowledgment).

### PRW-04 — Where Sap Runs Blue
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-04`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Inspect a tree wounded by glass wire.
**Story consequence:** Bellglass resonance is spreading through lumber routes.
**Requires all:** PRW-03. 
**Quest acceptance:** Elder Fenna Rootwake: “Where Sap Runs Blue. Inspect a tree wounded by glass wire. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Bellglass resonance is spreading through lumber routes.”
**Completion flag:** `completed.PRW-04` (grant reward once; persist before UI reward acknowledgment).

### PRW-05 — A Home for the Owls
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-05`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Build three nesting frames outside the logging area.
**Story consequence:** Displaced animals are fleeing the ringing traps.
**Requires all:** PRW-04. 
**Quest acceptance:** Elder Fenna Rootwake: “A Home for the Owls. Build three nesting frames outside the logging area. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Displaced animals are fleeing the ringing traps.”
**Completion flag:** `completed.PRW-05` (grant reward once; persist before UI reward acknowledgment).

### PRW-06 — Bridge of Split Cedar
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-06`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Gather materials for a safe footbridge.
**Story consequence:** A shortcut is useful only when strangers can trust it.
**Requires all:** PRW-05. 
**Quest acceptance:** Elder Fenna Rootwake: “Bridge of Split Cedar. Gather materials for a safe footbridge. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “A shortcut is useful only when strangers can trust it.”
**Completion flag:** `completed.PRW-06` (grant reward once; persist before UI reward acknowledgment).

### PRW-07 — Replant the Abandoned Road
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Place saplings beside the old village path.
**Story consequence:** Tree roots are identifying an erased road.
**Requires all:** PRW-06. 
**Quest acceptance:** Elder Fenna Rootwake: “Replant the Abandoned Road. Place saplings beside the old village path. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Tree roots are identifying an erased road.”
**Completion flag:** `completed.PRW-07` (grant reward once; persist before UI reward acknowledgment).

### PRW-08 — The Winter Woodlot
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Set a gathering quota after speaking with three households.
**Story consequence:** Sustainability is a political choice, not merely a skill bar.
**Requires all:** PRW-07. 
**Quest acceptance:** Elder Fenna Rootwake: “The Winter Woodlot. Set a gathering quota after speaking with three households. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Sustainability is a political choice, not merely a skill bar.”
**Completion flag:** `completed.PRW-08` (grant reward once; persist before UI reward acknowledgment).

### PRW-09 — Keepers of the Green Mark
**Giver:** Elder Fenna Rootwake. **Zone:** Briarwild. **Atlas point:** `BRIA78C9-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Train an NPC gatherer and turn in the growth map.
**Story consequence:** The grove permits continued woodcutting under shared stewardship.
**Requires all:** PRW-08. 
**Quest acceptance:** Elder Fenna Rootwake: “Keepers of the Green Mark. Train an NPC gatherer and turn in the growth map. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The grove permits continued woodcutting under shared stewardship.”
**Completion flag:** `completed.PRW-09` (grant reward once; persist before UI reward acknowledgment).

## River and Tide
**Location:** Tideglass Coast  |  **Levels:** 24–32  |  **Quests:** 9  |  **Type:** profession

### PRF-01 — The River’s First Catch
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Catch three river fish without netting spawning beds.
**Story consequence:** A careful fisher leaves enough for spring.
**Requires all:** None. 
**Quest acceptance:** Pilot Sena Wavebound: “The River’s First Catch. Catch three river fish without netting spawning beds. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “A careful fisher leaves enough for spring.”
**Completion flag:** `completed.PRF-01` (grant reward once; persist before UI reward acknowledgment).

### PRF-02 — Salt on the Line
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Repair the breakwater’s fishing nets.
**Story consequence:** An abandoned boat carried a signal from the lost fleet.
**Requires all:** PRF-01. 
**Quest acceptance:** Pilot Sena Wavebound: “Salt on the Line. Repair the breakwater’s fishing nets. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “An abandoned boat carried a signal from the lost fleet.”
**Completion flag:** `completed.PRF-02` (grant reward once; persist before UI reward acknowledgment).

### PRF-03 — Weather Before Bait
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Read three tide gauges before sailing.
**Story consequence:** Current patterns bend toward a harbor not on maps.
**Requires all:** PRF-02. 
**Quest acceptance:** Pilot Sena Wavebound: “Weather Before Bait. Read three tide gauges before sailing. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “Current patterns bend toward a harbor not on maps.”
**Completion flag:** `completed.PRF-03` (grant reward once; persist before UI reward acknowledgment).

### PRF-04 — The Shimmering Shoal
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-04`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Photograph an unusual silver school of fish.
**Story consequence:** The fish travel across an impossible inland current.
**Requires all:** PRF-03. 
**Quest acceptance:** Pilot Sena Wavebound: “The Shimmering Shoal. Photograph an unusual silver school of fish. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The fish travel across an impossible inland current.”
**Completion flag:** `completed.PRF-04` (grant reward once; persist before UI reward acknowledgment).

### PRF-05 — A Meal for Travelers
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-05`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Cook and distribute four safe portions.
**Story consequence:** Fishing is also a supply network for refugees.
**Requires all:** PRF-04. 
**Quest acceptance:** Pilot Sena Wavebound: “A Meal for Travelers. Cook and distribute four safe portions. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “Fishing is also a supply network for refugees.”
**Completion flag:** `completed.PRF-05` (grant reward once; persist before UI reward acknowledgment).

### PRF-06 — The Deepwater Hook
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-06`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Recover a lost hook from the harbor bottom.
**Story consequence:** The hook belonged to a boat erased from the register.
**Requires all:** PRF-05. 
**Quest acceptance:** Pilot Sena Wavebound: “The Deepwater Hook. Recover a lost hook from the harbor bottom. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The hook belonged to a boat erased from the register.”
**Completion flag:** `completed.PRF-06` (grant reward once; persist before UI reward acknowledgment).

### PRF-07 — Lighthouse Sounding
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Use a shell to mark safe channels.
**Story consequence:** The song must point to exits as well as arrivals.
**Requires all:** PRF-06. 
**Quest acceptance:** Pilot Sena Wavebound: “Lighthouse Sounding. Use a shell to mark safe channels. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The song must point to exits as well as arrivals.”
**Completion flag:** `completed.PRF-07` (grant reward once; persist before UI reward acknowledgment).

### PRF-08 — An Honest Market Price
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Audit a fish merchant’s scales and receipts.
**Story consequence:** A vanished supplier is still owed wages.
**Requires all:** PRF-07. 
**Quest acceptance:** Pilot Sena Wavebound: “An Honest Market Price. Audit a fish merchant’s scales and receipts. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “A vanished supplier is still owed wages.”
**Completion flag:** `completed.PRF-08` (grant reward once; persist before UI reward acknowledgment).

### PRF-09 — The Tide’s Permission
**Giver:** Pilot Sena Wavebound. **Zone:** Tideglass Coast. **Atlas point:** `TIDE37C7-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Offer the recovered log to the harbor council.
**Story consequence:** The harbor chooses which names are publicly displayed.
**Requires all:** PRF-08. 
**Quest acceptance:** Pilot Sena Wavebound: “The Tide’s Permission. Offer the recovered log to the harbor council. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The harbor chooses which names are publicly displayed.”
**Completion flag:** `completed.PRF-09` (grant reward once; persist before UI reward acknowledgment).

## The Blacksmith’s Oath
**Location:** Emberstone Bastion  |  **Levels:** 38–48  |  **Quests:** 9  |  **Type:** profession

### PRS-01 — Coals Before Steel
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Light a forge and cool a blade correctly.
**Story consequence:** Correct heat protects the next person who holds the weapon.
**Requires all:** None. 
**Quest acceptance:** Mira the Forgekeeper: “Coals Before Steel. Light a forge and cool a blade correctly. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “Correct heat protects the next person who holds the weapon.”
**Completion flag:** `completed.PRS-01` (grant reward once; persist before UI reward acknowledgment).

### PRS-02 — The Worn Rivet
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Replace buckles on working armor.
**Story consequence:** Workers’ gear has been allowed to fail to cut costs.
**Requires all:** PRS-01. 
**Quest acceptance:** Mira the Forgekeeper: “The Worn Rivet. Replace buckles on working armor. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “Workers’ gear has been allowed to fail to cut costs.”
**Completion flag:** `completed.PRS-02` (grant reward once; persist before UI reward acknowledgment).

### PRS-03 — A Fair Measure
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Compare three ingots against a public standard.
**Story consequence:** The guild’s premium metal uses undocumented bellglass.
**Requires all:** PRS-02. 
**Quest acceptance:** Mira the Forgekeeper: “A Fair Measure. Compare three ingots against a public standard. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “The guild’s premium metal uses undocumented bellglass.”
**Completion flag:** `completed.PRS-03` (grant reward once; persist before UI reward acknowledgment).

### PRS-04 — Hammer Song
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-04`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Craft a practice blade using ordinary ore.
**Story consequence:** Metal can hold purpose without holding stolen memory.
**Requires all:** PRS-03. 
**Quest acceptance:** Mira the Forgekeeper: “Hammer Song. Craft a practice blade using ordinary ore. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “Metal can hold purpose without holding stolen memory.”
**Completion flag:** `completed.PRS-04` (grant reward once; persist before UI reward acknowledgment).

### PRS-05 — The Helmet for a Stranger
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-05`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Forge a helm for an unnamed volunteer.
**Story consequence:** Aid should not depend on papers or pedigree.
**Requires all:** PRS-04. 
**Quest acceptance:** Mira the Forgekeeper: “The Helmet for a Stranger. Forge a helm for an unnamed volunteer. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “Aid should not depend on papers or pedigree.”
**Completion flag:** `completed.PRS-05` (grant reward once; persist before UI reward acknowledgment).

### PRS-06 — A Cracked Guild Seal
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-06`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Inspect a defective trade stamp.
**Story consequence:** The old guild hid losses in favorable ledgers.
**Requires all:** PRS-05. 
**Quest acceptance:** Mira the Forgekeeper: “A Cracked Guild Seal. Inspect a defective trade stamp. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “The old guild hid losses in favorable ledgers.”
**Completion flag:** `completed.PRS-06` (grant reward once; persist before UI reward acknowledgment).

### PRS-07 — The Night of Cold Forges
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Help transition a quarter to safe older furnaces.
**Story consequence:** The city can endure less power while reforming its economy.
**Requires all:** PRS-06. 
**Quest acceptance:** Mira the Forgekeeper: “The Night of Cold Forges. Help transition a quarter to safe older furnaces. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “The city can endure less power while reforming its economy.”
**Completion flag:** `completed.PRS-07` (grant reward once; persist before UI reward acknowledgment).

### PRS-08 — Tools of Witness
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Craft three simple chisels for public memorial workers.
**Story consequence:** Every witness can leave a durable mark.
**Requires all:** PRS-07. 
**Quest acceptance:** Mira the Forgekeeper: “Tools of Witness. Craft three simple chisels for public memorial workers. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “Every witness can leave a durable mark.”
**Completion flag:** `completed.PRS-08` (grant reward once; persist before UI reward acknowledgment).

### PRS-09 — The Maker’s Signature
**Giver:** Mira the Forgekeeper. **Zone:** Emberstone Bastion. **Atlas point:** `EMBEECE4-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Sign the community forge charter.
**Story consequence:** A master smith accepts public scrutiny of their tools.
**Requires all:** PRS-08. 
**Quest acceptance:** Mira the Forgekeeper: “The Maker’s Signature. Sign the community forge charter. The community needs this done carefully.”
**Turn-in dialogue:** Mira the Forgekeeper: “A master smith accepts public scrutiny of their tools.”
**Completion flag:** `completed.PRS-09` (grant reward once; persist before UI reward acknowledgment).

## Apothecary of Reeds
**Location:** Sorrowfen  |  **Levels:** 20–31  |  **Quests:** 9  |  **Type:** profession

### PRA-01 — Moonpetal at Dawn
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Collect herbs without uprooting living beds.
**Story consequence:** Several remedies grow near safe wisp paths.
**Requires all:** None. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Moonpetal at Dawn. Collect herbs without uprooting living beds. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Several remedies grow near safe wisp paths.”
**Completion flag:** `completed.PRA-01` (grant reward once; persist before UI reward acknowledgment).

### PRA-02 — The Clean Flask
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Sanitize equipment at the refuge.
**Story consequence:** Healing requires patient repetition, not rare spectacle.
**Requires all:** PRA-01. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Clean Flask. Sanitize equipment at the refuge. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Healing requires patient repetition, not rare spectacle.”
**Completion flag:** `completed.PRA-02` (grant reward once; persist before UI reward acknowledgment).

### PRA-03 — False Cure, Real Need
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Compare ingredients in a peddler’s tonic.
**Story consequence:** A merchant sells bottled whispers as medicine.
**Requires all:** PRA-02. 
**Quest acceptance:** Reedkeeper Iona Sedge: “False Cure, Real Need. Compare ingredients in a peddler’s tonic. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “A merchant sells bottled whispers as medicine.”
**Completion flag:** `completed.PRA-03` (grant reward once; persist before UI reward acknowledgment).

### PRA-04 — A Remedy for Fog Fever
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-04`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Prepare a harmless demonstration infusion.
**Story consequence:** Rest and safe water matter more than magical promises.
**Requires all:** PRA-03. 
**Quest acceptance:** Reedkeeper Iona Sedge: “A Remedy for Fog Fever. Prepare a harmless demonstration infusion. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Rest and safe water matter more than magical promises.”
**Completion flag:** `completed.PRA-04` (grant reward once; persist before UI reward acknowledgment).

### PRA-05 — The Toxic Bank
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-05`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Identify contaminated reeds near an engine outflow.
**Story consequence:** Bellglass waste is affecting the marsh.
**Requires all:** PRA-04. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Toxic Bank. Identify contaminated reeds near an engine outflow. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Bellglass waste is affecting the marsh.”
**Completion flag:** `completed.PRA-05` (grant reward once; persist before UI reward acknowledgment).

### PRA-06 — Two Cups of Tea
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-06`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Deliver comfort supplies and listen to mourners.
**Story consequence:** Not every grief requires a spell.
**Requires all:** PRA-05. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Two Cups of Tea. Deliver comfort supplies and listen to mourners. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Not every grief requires a spell.”
**Completion flag:** `completed.PRA-06` (grant reward once; persist before UI reward acknowledgment).

### PRA-07 — The Quiet Label
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-01`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Write accurate contraindication labels.
**Story consequence:** Clear information prevents accidental harm.
**Requires all:** PRA-06. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Quiet Label. Write accurate contraindication labels. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Clear information prevents accidental harm.”
**Completion flag:** `completed.PRA-07` (grant reward once; persist before UI reward acknowledgment).

### PRA-08 — A Ward Without a Cage
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-02`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Dispel a dangerous wisp trap without trapping the light.
**Story consequence:** Protection is not the same thing as captivity.
**Requires all:** PRA-07. 
**Quest acceptance:** Reedkeeper Iona Sedge: “A Ward Without a Cage. Dispel a dangerous wisp trap without trapping the light. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Protection is not the same thing as captivity.”
**Completion flag:** `completed.PRA-08` (grant reward once; persist before UI reward acknowledgment).

### PRA-09 — The Refuge Dispensary
**Giver:** Reedkeeper Iona Sedge. **Zone:** Sorrowfen. **Atlas point:** `SORRF6BC-03`. **Reward:** Profession XP + materials + reputation.
**Objectives:** Train the assistant and restock the public shelf.
**Story consequence:** The marsh opens its first community-run apothecary.
**Requires all:** PRA-08. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Refuge Dispensary. Train the assistant and restock the public shelf. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “The marsh opens its first community-run apothecary.”
**Completion flag:** `completed.PRA-09` (grant reward once; persist before UI reward acknowledgment).

## The Missing Neighbors
**Location:** Lantern Ward  |  **Levels:** 2–13  |  **Quests:** 9  |  **Type:** community

### CIV-01 — The Street That Ended
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Inspect a lane with a missing house number.
**Story consequence:** A ledger entry outlived the building it describes.
**Requires all:** None. 
**Quest acceptance:** Gatekeeper Elric: “The Street That Ended. Inspect a lane with a missing house number. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “A ledger entry outlived the building it describes.”
**Completion flag:** `completed.CIV-01` (grant reward once; persist before UI reward acknowledgment).

### CIV-02 — Soap at Number Eleven
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Help a family clean the wall after a storm.
**Story consequence:** Old chalk drawings reveal the missing door.
**Requires all:** CIV-01. 
**Quest acceptance:** Gatekeeper Elric: “Soap at Number Eleven. Help a family clean the wall after a storm. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “Old chalk drawings reveal the missing door.”
**Completion flag:** `completed.CIV-02` (grant reward once; persist before UI reward acknowledgment).

### CIV-03 — The Baker’s Second Receipt
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Find the duplicate delivery note.
**Story consequence:** The note was signed by an unregistered child.
**Requires all:** CIV-02. 
**Quest acceptance:** Gatekeeper Elric: “The Baker’s Second Receipt. Find the duplicate delivery note. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “The note was signed by an unregistered child.”
**Completion flag:** `completed.CIV-03` (grant reward once; persist before UI reward acknowledgment).

### CIV-04 — Chairs at the Meeting
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Set fifteen chairs for a meeting of fourteen families.
**Story consequence:** A seat appears for someone nobody can name.
**Requires all:** CIV-03. 
**Quest acceptance:** Gatekeeper Elric: “Chairs at the Meeting. Set fifteen chairs for a meeting of fourteen families. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “A seat appears for someone nobody can name.”
**Completion flag:** `completed.CIV-04` (grant reward once; persist before UI reward acknowledgment).

### CIV-05 — The Bell Pull
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Recover the brass handle without breaking the wall.
**Story consequence:** The door was built to open from inside.
**Requires all:** CIV-04. 
**Quest acceptance:** Gatekeeper Elric: “The Bell Pull. Recover the brass handle without breaking the wall. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “The door was built to open from inside.”
**Completion flag:** `completed.CIV-05` (grant reward once; persist before UI reward acknowledgment).

### CIV-06 — A Window for the Waiting
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Hang a safe signal lamp beside the sealed brick.
**Story consequence:** The echo recognizes help that cannot force it.
**Requires all:** CIV-05. 
**Quest acceptance:** Gatekeeper Elric: “A Window for the Waiting. Hang a safe signal lamp beside the sealed brick. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “The echo recognizes help that cannot force it.”
**Completion flag:** `completed.CIV-06` (grant reward once; persist before UI reward acknowledgment).

### CIV-07 — Debts Without Names
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Compare merchant accounts for erased families.
**Story consequence:** The missing households continued paying taxes.
**Requires all:** CIV-06. 
**Quest acceptance:** Gatekeeper Elric: “Debts Without Names. Compare merchant accounts for erased families. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “The missing households continued paying taxes.”
**Completion flag:** `completed.CIV-07` (grant reward once; persist before UI reward acknowledgment).

### CIV-08 — A Petition with Spaces
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Gather five signed witness statements.
**Story consequence:** People are willing to record uncertainty publicly.
**Requires all:** CIV-07. 
**Quest acceptance:** Gatekeeper Elric: “A Petition with Spaces. Gather five signed witness statements. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “People are willing to record uncertainty publicly.”
**Completion flag:** `completed.CIV-08` (grant reward once; persist before UI reward acknowledgment).

### CIV-09 — Neighbors Count Again
**Giver:** Gatekeeper Elric. **Zone:** Lantern Ward. **Atlas point:** `LANTF147-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Read the petition before the town council.
**Story consequence:** The council agrees to investigate without erasing the claim.
**Requires all:** CIV-08. 
**Quest acceptance:** Gatekeeper Elric: “Neighbors Count Again. Read the petition before the town council. The community needs this done carefully.”
**Turn-in dialogue:** Gatekeeper Elric: “The council agrees to investigate without erasing the claim.”
**Completion flag:** `completed.CIV-09` (grant reward once; persist before UI reward acknowledgment).

## The Orchard’s Children
**Location:** Rootwake Glade  |  **Levels:** 3–14  |  **Quests:** 9  |  **Type:** community

### CIW-01 — Five Fingers in Soil
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Observe the hand-shaped root without touching it.
**Story consequence:** The root asks for water rather than blood.
**Requires all:** None. 
**Quest acceptance:** Elder Fenna Rootwake: “Five Fingers in Soil. Observe the hand-shaped root without touching it. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The root asks for water rather than blood.”
**Completion flag:** `completed.CIW-01` (grant reward once; persist before UI reward acknowledgment).

### CIW-02 — The Child’s Water Bowl
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Carry clean water from the upper spring.
**Story consequence:** One memory responds to kindness.
**Requires all:** CIW-01. 
**Quest acceptance:** Elder Fenna Rootwake: “The Child’s Water Bowl. Carry clean water from the upper spring. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “One memory responds to kindness.”
**Completion flag:** `completed.CIW-02` (grant reward once; persist before UI reward acknowledgment).

### CIW-03 — Lost Orchard Labels
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Restore five broken tree plaques.
**Story consequence:** A migration branch was deliberately omitted.
**Requires all:** CIW-02. 
**Quest acceptance:** Elder Fenna Rootwake: “Lost Orchard Labels. Restore five broken tree plaques. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “A migration branch was deliberately omitted.”
**Completion flag:** `completed.CIW-03` (grant reward once; persist before UI reward acknowledgment).

### CIW-04 — Thorns at School
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Clear safe paths for children.
**Story consequence:** Briarwolf traps lie beside the play area.
**Requires all:** CIW-03. 
**Quest acceptance:** Elder Fenna Rootwake: “Thorns at School. Clear safe paths for children. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Briarwolf traps lie beside the play area.”
**Completion flag:** `completed.CIW-04` (grant reward once; persist before UI reward acknowledgment).

### CIW-05 — A Song Half Sung
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Learn the first verse from a grove singer.
**Story consequence:** The final verse names a vanished road.
**Requires all:** CIW-04. 
**Quest acceptance:** Elder Fenna Rootwake: “A Song Half Sung. Learn the first verse from a grove singer. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The final verse names a vanished road.”
**Completion flag:** `completed.CIW-05` (grant reward once; persist before UI reward acknowledgment).

### CIW-06 — A Boundary That Bends
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Survey the orchard edge with two witnesses.
**Story consequence:** The map changes if drawn by one hand alone.
**Requires all:** CIW-05. 
**Quest acceptance:** Elder Fenna Rootwake: “A Boundary That Bends. Survey the orchard edge with two witnesses. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The map changes if drawn by one hand alone.”
**Completion flag:** `completed.CIW-06` (grant reward once; persist before UI reward acknowledgment).

### CIW-07 — The Frost Before Winter
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Shield young trees from an impossible cold.
**Story consequence:** Bellglass infection moves through the root network.
**Requires all:** CIW-06. 
**Quest acceptance:** Elder Fenna Rootwake: “The Frost Before Winter. Shield young trees from an impossible cold. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Bellglass infection moves through the root network.”
**Completion flag:** `completed.CIW-07` (grant reward once; persist before UI reward acknowledgment).

### CIW-08 — A Name Held Privately
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Deliver a sealed note to Fenna.
**Story consequence:** Care means sometimes keeping a witness hidden.
**Requires all:** CIW-07. 
**Quest acceptance:** Elder Fenna Rootwake: “A Name Held Privately. Deliver a sealed note to Fenna. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “Care means sometimes keeping a witness hidden.”
**Completion flag:** `completed.CIW-08` (grant reward once; persist before UI reward acknowledgment).

### CIW-09 — The Festival of Returning Leaves
**Giver:** Elder Fenna Rootwake. **Zone:** Rootwake Glade. **Atlas point:** `ROOT2375-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Reopen the grove safely.
**Story consequence:** The Thren celebrate questions without demanding answers.
**Requires all:** CIW-08. 
**Quest acceptance:** Elder Fenna Rootwake: “The Festival of Returning Leaves. Reopen the grove safely. The community needs this done carefully.”
**Turn-in dialogue:** Elder Fenna Rootwake: “The Thren celebrate questions without demanding answers.”
**Completion flag:** `completed.CIW-09` (grant reward once; persist before UI reward acknowledgment).

## The Miner’s Dinner
**Location:** Emberstone Cradle  |  **Levels:** 2–15  |  **Quests:** 9  |  **Type:** community

### CIS-01 — One Extra Lunch Tin
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Inventory lunch tins from the sealed shaft.
**Story consequence:** An unclaimed tin remains warm.
**Requires all:** None. 
**Quest acceptance:** Mason Yurra Flint-Eye: “One Extra Lunch Tin. Inventory lunch tins from the sealed shaft. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “An unclaimed tin remains warm.”
**Completion flag:** `completed.CIS-01` (grant reward once; persist before UI reward acknowledgment).

### CIS-02 — A Shift Without Wages
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Read the work board and find unpaid hours.
**Story consequence:** The erased crew was never discharged.
**Requires all:** CIS-01. 
**Quest acceptance:** Mason Yurra Flint-Eye: “A Shift Without Wages. Read the work board and find unpaid hours. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The erased crew was never discharged.”
**Completion flag:** `completed.CIS-02` (grant reward once; persist before UI reward acknowledgment).

### CIS-03 — The Families at the Kiln
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Speak with three households.
**Story consequence:** Each recalls an older miner in dreams.
**Requires all:** CIS-02. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Families at the Kiln. Speak with three households. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Each recalls an older miner in dreams.”
**Completion flag:** `completed.CIS-03` (grant reward once; persist before UI reward acknowledgment).

### CIS-04 — A Quiet Air Shaft
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Inspect vents for trapped voices.
**Story consequence:** Old safety systems were sealed during an emergency.
**Requires all:** CIS-03. 
**Quest acceptance:** Mason Yurra Flint-Eye: “A Quiet Air Shaft. Inspect vents for trapped voices. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Old safety systems were sealed during an emergency.”
**Completion flag:** `completed.CIS-04` (grant reward once; persist before UI reward acknowledgment).

### CIS-05 — The Foreman’s Ink
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Compare two signed notices.
**Story consequence:** The official closure was fraudulent.
**Requires all:** CIS-04. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Foreman’s Ink. Compare two signed notices. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The official closure was fraudulent.”
**Completion flag:** `completed.CIS-05` (grant reward once; persist before UI reward acknowledgment).

### CIS-06 — Rations Before Contracts
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Deliver food during a short safety strike.
**Story consequence:** The community can organize outside the Guild.
**Requires all:** CIS-05. 
**Quest acceptance:** Mason Yurra Flint-Eye: “Rations Before Contracts. Deliver food during a short safety strike. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The community can organize outside the Guild.”
**Completion flag:** `completed.CIS-06` (grant reward once; persist before UI reward acknowledgment).

### CIS-07 — Stone Made Public
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Help engrave six recovered names.
**Story consequence:** Evidence is preserved even when painful.
**Requires all:** CIS-06. 
**Quest acceptance:** Mason Yurra Flint-Eye: “Stone Made Public. Help engrave six recovered names. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “Evidence is preserved even when painful.”
**Completion flag:** `completed.CIS-07` (grant reward once; persist before UI reward acknowledgment).

### CIS-08 — The Listening Wall Vigil
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Stand watch as workers recount what they heard.
**Story consequence:** The miners choose who witnesses the record.
**Requires all:** CIS-07. 
**Quest acceptance:** Mason Yurra Flint-Eye: “The Listening Wall Vigil. Stand watch as workers recount what they heard. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The miners choose who witnesses the record.”
**Completion flag:** `completed.CIS-08` (grant reward once; persist before UI reward acknowledgment).

### CIS-09 — A Better Morning Shift
**Giver:** Mason Yurra Flint-Eye. **Zone:** Emberstone Cradle. **Atlas point:** `EMBED524-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Post a new safety charter.
**Story consequence:** The quarry changes management rather than fleeing responsibility.
**Requires all:** CIS-08. 
**Quest acceptance:** Mason Yurra Flint-Eye: “A Better Morning Shift. Post a new safety charter. The community needs this done carefully.”
**Turn-in dialogue:** Mason Yurra Flint-Eye: “The quarry changes management rather than fleeing responsibility.”
**Completion flag:** `completed.CIS-09` (grant reward once; persist before UI reward acknowledgment).

## A Fleet That Waits
**Location:** Breakwater Strand  |  **Levels:** 2–15  |  **Quests:** 9  |  **Type:** community

### CIT-01 — The Inland Beacon
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Sketch the lighthouse’s impossible beam.
**Story consequence:** Its light points to a vanished harbor.
**Requires all:** None. 
**Quest acceptance:** Pilot Sena Wavebound: “The Inland Beacon. Sketch the lighthouse’s impossible beam. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “Its light points to a vanished harbor.”
**Completion flag:** `completed.CIT-01` (grant reward once; persist before UI reward acknowledgment).

### CIT-02 — A Child’s Dry Shell
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Carry a shell without opening its seal.
**Story consequence:** A voice asks whether home still exists.
**Requires all:** CIT-01. 
**Quest acceptance:** Pilot Sena Wavebound: “A Child’s Dry Shell. Carry a shell without opening its seal. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “A voice asks whether home still exists.”
**Completion flag:** `completed.CIT-02` (grant reward once; persist before UI reward acknowledgment).

### CIT-03 — The Second Harbor Chart
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Copy an incomplete coastline.
**Story consequence:** An entire quay is missing from maps.
**Requires all:** CIT-02. 
**Quest acceptance:** Pilot Sena Wavebound: “The Second Harbor Chart. Copy an incomplete coastline. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “An entire quay is missing from maps.”
**Completion flag:** `completed.CIT-03` (grant reward once; persist before UI reward acknowledgment).

### CIT-04 — Sails Over Apples
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Photograph the spectral fleet at dusk.
**Story consequence:** The ships are displaced, not drowned.
**Requires all:** CIT-03. 
**Quest acceptance:** Pilot Sena Wavebound: “Sails Over Apples. Photograph the spectral fleet at dusk. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The ships are displaced, not drowned.”
**Completion flag:** `completed.CIT-04` (grant reward once; persist before UI reward acknowledgment).

### CIT-05 — The Captain’s Oath
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Find an original navigation verse.
**Story consequence:** The old captains were promised safe return.
**Requires all:** CIT-04. 
**Quest acceptance:** Pilot Sena Wavebound: “The Captain’s Oath. Find an original navigation verse. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The old captains were promised safe return.”
**Completion flag:** `completed.CIT-05` (grant reward once; persist before UI reward acknowledgment).

### CIT-06 — The Rope on the Hill
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Recover a mooring line from dry land.
**Story consequence:** The phantom port has material echoes.
**Requires all:** CIT-05. 
**Quest acceptance:** Pilot Sena Wavebound: “The Rope on the Hill. Recover a mooring line from dry land. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The phantom port has material echoes.”
**Completion flag:** `completed.CIT-06` (grant reward once; persist before UI reward acknowledgment).

### CIT-07 — Names the Tide Kept
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Interview relatives privately.
**Story consequence:** Memory recovery must protect survivors.
**Requires all:** CIT-06. 
**Quest acceptance:** Pilot Sena Wavebound: “Names the Tide Kept. Interview relatives privately. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “Memory recovery must protect survivors.”
**Completion flag:** `completed.CIT-07` (grant reward once; persist before UI reward acknowledgment).

### CIT-08 — Sail Toward the Door
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Mark a safe path to the lighthouse.
**Story consequence:** The new route is open to everyone.
**Requires all:** CIT-07. 
**Quest acceptance:** Pilot Sena Wavebound: “Sail Toward the Door. Mark a safe path to the lighthouse. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “The new route is open to everyone.”
**Completion flag:** `completed.CIT-08` (grant reward once; persist before UI reward acknowledgment).

### CIT-09 — Watch the Sea Again
**Giver:** Pilot Sena Wavebound. **Zone:** Breakwater Strand. **Atlas point:** `BREA57E6-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Restore the lantern seaward.
**Story consequence:** Coastal navigation and old testimony can coexist.
**Requires all:** CIT-08. 
**Quest acceptance:** Pilot Sena Wavebound: “Watch the Sea Again. Restore the lantern seaward. The community needs this done carefully.”
**Turn-in dialogue:** Pilot Sena Wavebound: “Coastal navigation and old testimony can coexist.”
**Completion flag:** `completed.CIT-09` (grant reward once; persist before UI reward acknowledgment).

## The Reedhaven Vigil
**Location:** Reedhaven Refuge  |  **Levels:** 1–15  |  **Quests:** 9  |  **Type:** community

### CIR-01 — One Loose Strand
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Untangle an altered memorial braid.
**Story consequence:** An unknown family name has returned.
**Requires all:** None. 
**Quest acceptance:** Reedkeeper Iona Sedge: “One Loose Strand. Untangle an altered memorial braid. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “An unknown family name has returned.”
**Completion flag:** `completed.CIR-01` (grant reward once; persist before UI reward acknowledgment).

### CIR-02 — The Unclaimed Cup
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Prepare tea for a wandering mourner.
**Story consequence:** Hospitality precedes investigation.
**Requires all:** CIR-01. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Unclaimed Cup. Prepare tea for a wandering mourner. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Hospitality precedes investigation.”
**Completion flag:** `completed.CIR-02` (grant reward once; persist before UI reward acknowledgment).

### CIR-03 — Lights Without Jars
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Observe wisps at a safe distance.
**Story consequence:** The lights choose their own paths.
**Requires all:** CIR-02. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Lights Without Jars. Observe wisps at a safe distance. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “The lights choose their own paths.”
**Completion flag:** `completed.CIR-03` (grant reward once; persist before UI reward acknowledgment).

### CIR-04 — The Old Ferry Post
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Trace a missing evacuation route.
**Story consequence:** A census boat stopped before the archive.
**Requires all:** CIR-03. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The Old Ferry Post. Trace a missing evacuation route. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “A census boat stopped before the archive.”
**Completion flag:** `completed.CIR-04` (grant reward once; persist before UI reward acknowledgment).

### CIR-05 — Child of the Pool
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Listen to a mother’s testimony.
**Story consequence:** Her daughter has an unfinished record.
**Requires all:** CIR-04. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Child of the Pool. Listen to a mother’s testimony. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Her daughter has an unfinished record.”
**Completion flag:** `completed.CIR-05` (grant reward once; persist before UI reward acknowledgment).

### CIR-06 — Under the Boardwalk
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Recover a bundled reed record.
**Story consequence:** The names were stored, not destroyed.
**Requires all:** CIR-05. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Under the Boardwalk. Recover a bundled reed record. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “The names were stored, not destroyed.”
**Completion flag:** `completed.CIR-06` (grant reward once; persist before UI reward acknowledgment).

### CIR-07 — Two Keys for One Box
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Set up a two-witness privacy chest.
**Story consequence:** Records can be kept without public exposure.
**Requires all:** CIR-06. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Two Keys for One Box. Set up a two-witness privacy chest. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Records can be kept without public exposure.”
**Completion flag:** `completed.CIR-07` (grant reward once; persist before UI reward acknowledgment).

### CIR-08 — The First Memorial Walk
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Escort two grieving families safely.
**Story consequence:** A path becomes a ritual of remembrance.
**Requires all:** CIR-07. 
**Quest acceptance:** Reedkeeper Iona Sedge: “The First Memorial Walk. Escort two grieving families safely. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “A path becomes a ritual of remembrance.”
**Completion flag:** `completed.CIR-08` (grant reward once; persist before UI reward acknowledgment).

### CIR-09 — Vigil Without a Cage
**Giver:** Reedkeeper Iona Sedge. **Zone:** Reedhaven Refuge. **Atlas point:** `REEDAE5C-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Leave the refuge lights unconfined.
**Story consequence:** Reedbound consent practice becomes regional policy.
**Requires all:** CIR-08. 
**Quest acceptance:** Reedkeeper Iona Sedge: “Vigil Without a Cage. Leave the refuge lights unconfined. The community needs this done carefully.”
**Turn-in dialogue:** Reedkeeper Iona Sedge: “Reedbound consent practice becomes regional policy.”
**Completion flag:** `completed.CIR-09` (grant reward once; persist before UI reward acknowledgment).

## The Sky That Forgot
**Location:** Starfall Eyrie  |  **Levels:** 1–14  |  **Quests:** 9  |  **Type:** community

### CIVY-01 — Eight Lights Above
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Chart the visible night stations.
**Story consequence:** The brass chart insists there are nine.
**Requires all:** None. 
**Quest acceptance:** Astromer Neris Sol: “Eight Lights Above. Chart the visible night stations. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The brass chart insists there are nine.”
**Completion flag:** `completed.CIVY-01` (grant reward once; persist before UI reward acknowledgment).

### CIVY-02 — A Lens with a Scratch
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Repair an old refractor.
**Story consequence:** The flaw is deliberate and shaped like a door.
**Requires all:** CIVY-01. 
**Quest acceptance:** Astromer Neris Sol: “A Lens with a Scratch. Repair an old refractor. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The flaw is deliberate and shaped like a door.”
**Completion flag:** `completed.CIVY-02` (grant reward once; persist before UI reward acknowledgment).

### CIVY-03 — Harps in Crosswind
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Tune three windharps before the storm.
**Story consequence:** Their notes echo the missing bell.
**Requires all:** CIVY-02. 
**Quest acceptance:** Astromer Neris Sol: “Harps in Crosswind. Tune three windharps before the storm. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “Their notes echo the missing bell.”
**Completion flag:** `completed.CIVY-03` (grant reward once; persist before UI reward acknowledgment).

### CIVY-04 — A Star Measured Twice
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-04`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Repeat observations with an independent witness.
**Story consequence:** Evidence persists only when shared.
**Requires all:** CIVY-03. 
**Quest acceptance:** Astromer Neris Sol: “A Star Measured Twice. Repeat observations with an independent witness. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “Evidence persists only when shared.”
**Completion flag:** `completed.CIVY-04` (grant reward once; persist before UI reward acknowledgment).

### CIVY-05 — The Empty Coordinate
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-05`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Project the absent point onto stone.
**Story consequence:** The ninth mark is a seat not a fixed star.
**Requires all:** CIVY-04. 
**Quest acceptance:** Astromer Neris Sol: “The Empty Coordinate. Project the absent point onto stone. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The ninth mark is a seat not a fixed star.”
**Completion flag:** `completed.CIVY-05` (grant reward once; persist before UI reward acknowledgment).

### CIVY-06 — Bridge Beneath Cloud
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-06`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Guide travelers using the corrected lens.
**Story consequence:** Safe passage requires open information.
**Requires all:** CIVY-05. 
**Quest acceptance:** Astromer Neris Sol: “Bridge Beneath Cloud. Guide travelers using the corrected lens. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “Safe passage requires open information.”
**Completion flag:** `completed.CIVY-06` (grant reward once; persist before UI reward acknowledgment).

### CIVY-07 — The Unmarked Courier
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-01`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Challenge an identity checkpoint respectfully.
**Story consequence:** The gate bars people the maps do not count.
**Requires all:** CIVY-06. 
**Quest acceptance:** Astromer Neris Sol: “The Unmarked Courier. Challenge an identity checkpoint respectfully. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The gate bars people the maps do not count.”
**Completion flag:** `completed.CIVY-07` (grant reward once; persist before UI reward acknowledgment).

### CIVY-08 — Atlas with a Question
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-02`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Publish the revised constellation drawing.
**Story consequence:** The observatory admits uncertainty.
**Requires all:** CIVY-07. 
**Quest acceptance:** Astromer Neris Sol: “Atlas with a Question. Publish the revised constellation drawing. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The observatory admits uncertainty.”
**Completion flag:** `completed.CIVY-08` (grant reward once; persist before UI reward acknowledgment).

### CIVY-09 — A Festival of Nine Lamps
**Giver:** Astromer Neris Sol. **Zone:** Starfall Eyrie. **Atlas point:** `STARC3FE-03`. **Reward:** Local reputation + supplies + discovery XP.
**Objectives:** Light the final lamp for absent voices.
**Story consequence:** The eyrie celebrates humility as an act of knowledge.
**Requires all:** CIVY-08. 
**Quest acceptance:** Astromer Neris Sol: “A Festival of Nine Lamps. Light the final lamp for absent voices. The community needs this done carefully.”
**Turn-in dialogue:** Astromer Neris Sol: “The eyrie celebrates humility as an act of knowledge.”
**Completion flag:** `completed.CIVY-09` (grant reward once; persist before UI reward acknowledgment).
