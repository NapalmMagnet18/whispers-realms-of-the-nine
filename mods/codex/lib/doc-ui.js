// Codex — UI. HUD, menus, panels, diegetic screens, input surfaces.
// One file per top tab. Written by Savi only; the panel never writes.
export const PAGES = [
  {
    "id": "ui-1",
    "title": "Visual language",
    "body": "Dark charcoal tinted glass with restrained parchment and aged brass; clean modern readability over ornate framing. The creator's Kenney-style frame kit is tinted brass for dialogs, action slots, tooltips and banners. Palette: Charcoal #181C22 (backing), Forest #344F42, Parchment #D6C49A (headings, map text), Aged brass #AF8951 (frames, selected tabs), Spectral teal #5AAFA7 (magic, portals), Danger crimson #B64B52 (warnings), Off-white #F1EEE8 (primary text). Readable sans-serif for numbers and menus; a restrained serif only for titles and lore. Never rely on colour alone."
  },
  {
    "id": "ui-2",
    "title": "Gameplay HUD",
    "body": "Upper-left: portrait, health and resource bars; party frames below. Upper-right: minimap with the region name and entry banner. Right side: quest tracker. Lower-left: compact chat. Bottom centre: eight-slot hotbar with numeric cooldowns and visible key presses, then HP and mana. Bottom bar: social, journal, map, XP bar, bag, character, skills, menu. A target frame (name and HP) up top. Minimal intrusion over ornament."
  },
  {
    "id": "ui-3",
    "title": "Front door screens",
    "body": "Main menu, realm roster (name, type, population from realm_pulse, notes such as PvP and RP), character select (6 per realm), character creation (name, race with its starting zone shown, class), settings and the pause menu. No loading screen."
  },
  {
    "id": "ui-4",
    "title": "Quest dialog and tracker",
    "body": "Talking to a giver opens the brass dialog: text, objectives, reward preview, Accept / Decline; turn-in shows the reward plate. The tracker lists active objectives with counts (e.g. Briar Wolves 1/3, Logs 2/5) and survives reconnect."
  },
  {
    "id": "ui-5",
    "title": "Inventory (I)",
    "body": "24-slot starting bag in the bible (30 in the current build), clear stack numbers, tooltips comparing equipment, click to equip, sort, transfer, discard with confirmation; merchant and bank panels beside it when near."
  },
  {
    "id": "ui-6",
    "title": "Character and equipment (K)",
    "body": "Avatar with gear slots around it, a short stat list and equipped-item comparison; no unused endgame stats."
  },
  {
    "id": "ui-7",
    "title": "Skills (F1)",
    "body": "Tiles per profession showing level, XP, next unlock, tool needs and linked recipes."
  },
  {
    "id": "ui-8",
    "title": "Journal (J) and map (M)",
    "body": "Journal: active, available and completed tabs with objective, location hint, counts and reward preview. Map: place names with fog of discovery, shape-coded landmarks, tracked-quest pins, legend and scale; no promise of a full dynamic map before the geometry exists."
  },
  {
    "id": "ui-9",
    "title": "Crafting and vendors",
    "body": "Ingredients, owned counts, cost, result, and the reason something can't be made. A purchase reports coin shortage or full bag and never spends partial coin. Prices in copper/silver/gold."
  },
  {
    "id": "ui-10",
    "title": "Chat and party",
    "body": "Readable sender labels, optional tabs, spam limits, mute/block where the platform allows, party names and HP. Chat never steals movement focus unexpectedly."
  },
  {
    "id": "ui-11",
    "title": "Accessibility and acceptance",
    "body": "UI scale, reduced flashes and effects, camera sensitivity, sound sliders, remappable keys if supported (otherwise accurate labels). Ability icons clear at 1366x768 and tested at 1920x1080. E prompt appears in range and disappears out of it. Hazards use shape and motion as well as red. Phones get their own layout later: swipe camera, joystick, 4–6 context buttons, large targets."
  }
];
