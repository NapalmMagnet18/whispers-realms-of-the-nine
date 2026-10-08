// In-world panel input for the MMORPG player (Escape, door panels, shops, professions, spellbar, music, settings…).
// Split out of player.js so the main menu boots without it: player.js imports this the moment a hero stands in the
// world and forwards every in-world press here. Returns FALL when the press is not a panel's, so movement runs.
export var FALL = 'fall';
export function panelInput(objectApi, input, s, H) {
  var saveCharacter = H.saveCharacter, TRACKS = H.TRACKS, setWorldSpatialAudio = H.setWorldSpatialAudio,
    restorePlaceMusic = H.restorePlaceMusic, handleLogout = H.handleLogout;
  // Block all input while dying or dead
  if (s.dying || s.pvpDead) return;

  // ── Universal Escape — close ANY open panel/dialog ──
  if (input.actions.clearTarget) {
    if (s.showDoorPanel) {
      objectApi.patchState({ showDoorPanel: false, showNpcDialogue: false, showShop: false, shopSelectedItem: null, showProfessionDialogue: false, profDialogueName: null, profDialogueCost: null, profDialogueText: null, profDialogueBuildingId: null });
      return;
    }
    if (s.showQuestDialog) {
      objectApi.patchState({ showQuestDialog: false, questDialogData: null });
      return;
    }
    if (s.vampireDialog) {
      objectApi.patchState({ vampireDialog: false, vampireDialogState: null });
      objectApi.playSound('cdn/sfx-parchment-scroll-close.mp3', { volume: 0.12 });
      return;
    }
    if (s.cursedItemDialog) {
      objectApi.patchState({ cursedItemDialog: false, cursedItemDialogState: null });
      objectApi.playSound('cdn/sfx-parchment-scroll-close.mp3', { volume: 0.12 });
      return;
    }
    // No panel open — fall through to let npc-target.js handle clearTarget
  }

  // ── Door panel — move / close / NPC dialogue toggle ──
  if (s.showDoorPanel) {
    if (input.actions.toggleNpcDialogue) {
      objectApi.patchState({ showNpcDialogue: !s.showNpcDialogue });
      return;
    }
    if (input.actions.toggleSigilara) {
      objectApi.patchState({ sigilaraMode: !s.sigilaraMode, showNpcDialogue: false });
      return;
    }
    if (input.actions.requestRunestone) {
      // Only works at magic shop
      if (s.interactingBuildingId !== 'magic-shop') return;
      // Check player doesn't already have one
      var rinv = s.inventory || [];
      var alreadyHas = false;
      for (var rsi = 0; rsi < rinv.length; rsi++) {
        if (rinv[rsi] && rinv[rsi].id === 'runestone') { alreadyHas = true; break; }
      }
      if (alreadyHas) return;
      // Find first empty slot
      var emptySlot = -1;
      for (var esi = 0; esi < rinv.length; esi++) {
        if (!rinv[esi]) { emptySlot = esi; break; }
      }
      if (emptySlot === -1) {
        objectApi.toast('Your inventory is full!', { duration: 2 });
        return;
      }
      // Insert the runestone
      var newInv = rinv.slice();
      newInv[emptySlot] = {
        id: 'runestone',
        name: 'Runestone of Return',
        icon: '/cdn/icon-dark-gothic-glowing-runestone.png',
        description: 'An ancient stone etched with forgotten runes. Teleports you back to the village spawn. Can only be used once per 24 hours.',
        cooldownUntil: 0
      };
      // Show Madame Nyx dialogue and give item
      objectApi.patchState({
        inventory: newInv,
        showNpcDialogue: true,
        npcDialogue: 'Ah, you seek the Runestone of Return... This ancient stone binds to your soul. Use it in your darkest hour, and it shall carry you back to safety. Use it wisely.'
      });
      objectApi.toast('Received Runestone of Return', { icon: '/cdn/icon-dark-gothic-glowing-runestone.png', color: 'oklch(0.5 0.2 300)' });
      objectApi.playSound('cdn/sfx-reward.mp3', { volume: 0.3 });
      return;
    }
    if (input.actions.requestWarBanner) {
      // Only works at magic shop
      if (s.interactingBuildingId !== 'magic-shop') return;
      // Check player doesn't already have one
      var wbInv = s.inventory || [];
      var wbHas = false;
      for (var wbi = 0; wbi < wbInv.length; wbi++) {
        if (wbInv[wbi] && wbInv[wbi].id === 'war-banner') { wbHas = true; break; }
      }
      if (wbHas) return;
      // Find first empty slot
      var wbSlot = -1;
      for (var wsi = 0; wsi < wbInv.length; wsi++) {
        if (!wbInv[wsi]) { wbSlot = wsi; break; }
      }
      if (wbSlot === -1) {
        objectApi.toast('Your inventory is full!', { duration: 2 });
        return;
      }
      // Insert the war banner
      var wbNewInv = wbInv.slice();
      wbNewInv[wbSlot] = {
        id: 'war-banner',
        name: 'War Banner',
        icon: '/cdn/icon-gothic-dark-war-banner-tattered.png',
        description: 'A battle-worn banner imbued with dark power. Plant it to rally your kin — all allies of your race within its shadow deal +25% damage.'
      };
      objectApi.patchState({
        inventory: wbNewInv,
        showNpcDialogue: true,
        npcDialogue: 'So... you seek the War Banner. This tattered cloth has drunk deep of bloodshed across a thousand battlefields. When you plant it in the earth, its dark resonance calls to those who share your bloodline — your kin will feel the old fury stir within them, their strikes falling harder, their purpose sharpened. But heed me well: the banner demands loyalty. Only those bound by the same cursed lineage will feel its power. Now take it, and let your enemies know that your house still stands.'
      });
      objectApi.toast('Received War Banner', { icon: '/cdn/icon-gothic-dark-war-banner-tattered.png', color: 'oklch(0.5 0.15 20)' });
      objectApi.playSound('cdn/sfx-reward.mp3', { volume: 0.3 });
      return;
    }
    if (input.actions.moveDoorPanel && input.actionData && input.actionData.moveDoorPanel) {
      var dp = input.actionData.moveDoorPanel;
      objectApi.patchState({ doorPanelX: dp.x, doorPanelY: dp.y });
      return;
    }
    if (input.actions.toggleShop) {
      var newShowShop = !s.showShop;
      objectApi.patchState({ showShop: newShowShop, shopSelectedItem: null, showNpcDialogue: false });
      return;
    }
    if (input.actions.shopSelectItem && input.actionData && input.actionData.shopSelectItem) {
      var selIdx = input.actionData.shopSelectItem.index;
      objectApi.patchState({ shopSelectedItem: (s.shopSelectedItem === selIdx) ? null : selIdx });
      return;
    }
    if (input.actions.buyShopItem) {
      if (s.shopSelectedItem == null) return;
      var shopData = H.req('./lib/shop-data.js');
      var shopItems = shopData.getShopItems(s.interactingBuildingId);
      var item = shopItems[s.shopSelectedItem];
      if (!item) return;
      var playerGold = H.req('./lib/currency.js').purse(s);
      if (playerGold < item.price) {
        objectApi.toast('Not enough money! Need ' + H.req('./lib/currency.js').formatText(item.price), { duration: 2, color: 'oklch(0.55 0.26 27)' });
        return;
      }
      // Find empty inventory slot
      var binv = s.inventory || [];
      var bslot = -1;
      for (var bi = 0; bi < binv.length; bi++) {
        if (!binv[bi]) { bslot = bi; break; }
      }
      if (bslot === -1) {
        objectApi.toast('Inventory is full!', { duration: 2, color: 'oklch(0.55 0.26 27)' });
        return;
      }
      var buyInv = binv.slice();
      var boughtItem = {};
      for (var bk in item) {
        if (bk !== 'price') boughtItem[bk] = item[bk];
      }
      buyInv[bslot] = boughtItem;
      objectApi.patchState({
        copper: Math.max(0, playerGold - item.price),
        inventory: buyInv,
        shopSelectedItem: null,
      });
      objectApi.toast('Purchased ' + item.name, { duration: 2, icon: item.icon, color: 'oklch(0.5 0.2 300)' });
      objectApi.playSound('/cdn/handle-coins-currency-pickup-phoc2e1u.mp3', { volume: 0.3 });
      return;
    }
    // ── Profession learning actions ──
    if (input.actions.learnProfession && input.actionData && input.actionData.learnProfession) {
      var lpData = input.actionData.learnProfession;
      var profData = H.req('./lib/profession-data.js');
      var prof = profData.getProfession(lpData.buildingId);
      if (prof) {
        objectApi.patchState({
          showProfessionDialogue: true,
          profDialogueName: prof.professionName,
          profDialogueCost: prof.cost,
          profDialogueText: prof.npcDialogue,
          profDialogueBuildingId: lpData.buildingId,
        });
      }
      return;
    }
    if (input.actions.confirmLearnProfession) {
      var cpState = objectApi.getState();
      var cpGold = H.req('./lib/currency.js').purse(cpState);
      var cpCost = cpState.profDialogueCost ?? 50;
      var cpName = cpState.profDialogueName || 'Unknown';
      var cpProfs = cpState.professions || [];
      if (cpProfs.length >= 2) {
        objectApi.toast('You can only learn 2 professions!', { duration: 2.5, color: 'oklch(0.55 0.26 27)' });
        return;
      }
      // Check if already learned
      var alreadyKnows = false;
      for (var pi = 0; pi < cpProfs.length; pi++) {
        if (cpProfs[pi] === cpName) { alreadyKnows = true; break; }
      }
      if (alreadyKnows) {
        objectApi.toast('You already know ' + cpName + '!', { duration: 2, color: 'oklch(0.55 0.26 27)' });
        return;
      }
      if (cpGold < cpCost) {
        objectApi.toast('Not enough money! Need ' + H.req('./lib/currency.js').formatText(cpCost), { duration: 2, color: 'oklch(0.55 0.26 27)' });
        return;
      }
      var newProfs = cpProfs.slice();
      newProfs.push(cpName);
      objectApi.patchState({
        copper: Math.max(0, cpGold - cpCost),
        professions: newProfs,
        showProfessionDialogue: false,
        profDialogueName: null,
        profDialogueCost: null,
        profDialogueText: null,
        profDialogueBuildingId: null,
      });
      objectApi.toast('You have learned ' + cpName + '!', { duration: 3, icon: '/cdn/icon-dark-gothic-painted-anvil-hammer.png', color: 'oklch(0.75 0.15 85)' });
      objectApi.playSound('cdn/sfx-reward.mp3', { volume: 0.36 });
      return;
    }
    if (input.actions.closeProfessionDialogue) {
      objectApi.patchState({
        showProfessionDialogue: false,
        profDialogueName: null,
        profDialogueCost: null,
        profDialogueText: null,
        profDialogueBuildingId: null,
      });
      return;
    }
    if (input.actions.clearTarget || input.actions.interact || input.actions.closeDoorPanel) {
      objectApi.patchState({ showDoorPanel: false, showNpcDialogue: false, showShop: false, shopSelectedItem: null, showProfessionDialogue: false, profDialogueName: null, profDialogueCost: null, profDialogueText: null, profDialogueBuildingId: null, sigilaraMode: false });
      return;
    }
  }
  if (input.actions.closeDoorPanel) {
    objectApi.patchState({ showDoorPanel: false, showNpcDialogue: false, showShop: false, shopSelectedItem: null, showProfessionDialogue: false, profDialogueName: null, profDialogueCost: null, profDialogueText: null, profDialogueBuildingId: null, sigilaraMode: false });
    return;
  }

  // ── Panel toggles ──
  // Unified menu panel — always visible, just switches tabs
  if (input.actions.setMenuTab && input.actionData && input.actionData.setMenuTab) {
    objectApi.patchState({ menuTab: input.actionData.setMenuTab.tab });
    return;
  }
  if (input.actions.setHighscoreFilter && input.actionData && input.actionData.setHighscoreFilter) {
    var hfData = input.actionData.setHighscoreFilter;
    var hfPatch = {};
    if (hfData.race !== undefined) hfPatch.highscoreFilterRace = hfData.race;
    if (hfData['class'] !== undefined) hfPatch.highscoreFilterClass = hfData['class'];
    objectApi.patchState(hfPatch);
    return;
  }
  if (input.actions.spellbookPage && input.actionData && input.actionData.spellbookPage) {
    objectApi.patchState({ spellbookPage: input.actionData.spellbookPage.page });
    return;
  }
  if (input.actions.spellbookPageLeft) {
    var prevPage = Math.max(0, (s.spellbookPage ?? 0) - 1);
    objectApi.patchState({ spellbookPage: prevPage });
    return;
  }
  if (input.actions.spellbookPageRight) {
    var nextPage = (s.spellbookPage ?? 0) + 1;
    objectApi.patchState({ spellbookPage: nextPage });
    return;
  }
  if (input.actions.toggleMenuLock) {
    objectApi.patchState({ menuPanelLocked: !s.menuPanelLocked });
    return;
  }
  if (input.actions.toggleUiArt) {
    objectApi.patchState({ hideUiArt: !s.hideUiArt });
    return;
  }

  // Keyboard shortcuts switch tabs in the always-visible panel
  if (input.actions.toggleSettings) {
    objectApi.patchState({ menuTab: s.menuTab === 'settings' ? 'inventory' : 'settings' });
    return;
  }
  if (input.actions.dismissWelcome) {
    objectApi.patchState({ showWelcome: false });
    return;
  }
  if (input.actions.toggleInventory) {
    objectApi.patchState({ menuTab: 'inventory' });
    return;
  }
  if (input.actions.toggleCharacter) {
    objectApi.patchState({ menuTab: 'character' });
    return;
  }
  if (input.actions.toggleMap) {
    objectApi.patchState({ showWorldMap: !s.showWorldMap });
    return;
  }
  if (input.actions.toggleWorldMap) {
    objectApi.patchState({ showWorldMap: !s.showWorldMap });
    return;
  }
  if (input.actions.toggleQuests) {
    objectApi.patchState({ menuTab: s.menuTab === 'quests' ? 'inventory' : 'quests' });
    return;
  }
  if (input.actions.toggleSpellbook) {
    objectApi.patchState({ menuTab: s.menuTab === 'spellbook' ? 'inventory' : 'spellbook' });
    return;
  }

  if (input.actions.toggleMusic) {
    objectApi.patchState({ menuTab: s.menuTab === 'music' ? 'inventory' : 'music' });
    return;
  }
  if (input.actions.toggleTalents) {
    objectApi.patchState({ menuTab: s.menuTab === 'talents' ? 'inventory' : 'talents' });
    return;
  }
  if (input.actions.toggleHighscores) {
    objectApi.patchState({ menuTab: s.menuTab === 'highscores' ? 'inventory' : 'highscores' });
    return;
  }
  if (input.actions.toggleProfessions) {
    objectApi.patchState({ menuTab: s.menuTab === 'professions' ? 'inventory' : 'professions' });
    return;
  }
  if (input.actions.toggleFriends) {
    objectApi.patchState({ menuTab: s.menuTab === 'friends' ? 'inventory' : 'friends' });
    return;
  }
  if (input.actions.toggleGuild) {
    objectApi.patchState({ menuTab: s.menuTab === 'guild' ? 'inventory' : 'guild' });
    return;
  }

  if (input.actions.hideControls) {
    objectApi.patchState({ controlsHidden: true });
    return;
  }

  // ── Talent spec tab switching ──
  if (input.actions.setTalentTab && input.actionData && input.actionData.setTalentTab) {
    objectApi.patchState({ talentSpecTab: input.actionData.setTalentTab.tab });
  }

  // ── Talent spending ──
  if (input.actions.spendTalent && input.actionData && input.actionData.spendTalent) {
    var tierNum = input.actionData.spendTalent.tier;
    var slotIdx = input.actionData.spendTalent.index;
    var tp = s.talentPoints ?? 0;
    var ut = Object.assign({}, s.unlockedTalents || {});

    // Tier layout: Tier 0 → [0,1,2], Tier 1 → [3,4], Tier 2 → [5,6,7], Tier 3 → [8,9]
    var TIER_LAYOUT = [[0,1,2],[3,4],[5,6,7],[8,9]];

    // Class-indexed talent stat data (must match UI CLASS_TALENTS exactly)
    var { RACES: SAVE_RACES, CLASSES: SAVE_CLASSES } = H.req('./lib/races.js');
    var pRace = SAVE_RACES[s.raceIndex ?? 0];
    var pRaceClasses = pRace ? pRace.classes : SAVE_CLASSES;
    var pClassName = pRaceClasses[s.classIndex ?? 0] || SAVE_CLASSES[s.classIndex ?? 0] || 'Blood Knight';

    // Inline talent stat table keyed by class → array of 10 { stat, amount, stat2?, amount2? }
    var CLASS_TALENT_STATS = {
      'Blood Knight': [
        { stat: 'strength', amount: 2 }, { stat: 'vitality', amount: 3 }, { stat: 'endurance', amount: 2 },
        { stat: 'strength', amount: 2, stat2: 'dexterity', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 1 },
        { stat: 'dexterity', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'strength', amount: 3, stat2: 'vitality', amount2: 2 }, { stat: 'spirit', amount: 2, stat2: 'luck', amount2: 2 },
      ],
      'Necromancer': [
        { stat: 'intelligence', amount: 2 }, { stat: 'vitality', amount: 3 }, { stat: 'spirit', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 }, { stat: 'endurance', amount: 2, stat2: 'vitality', amount2: 1 },
        { stat: 'wisdom', amount: 2 }, { stat: 'spirit', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
      ],
      'Warlock': [
        { stat: 'intelligence', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'spirit', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'luck', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'wisdom', amount: 2 }, { stat: 'intelligence', amount: 3 }, { stat: 'dexterity', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'vitality', amount2: 2 },
      ],
      'Cultist': [
        { stat: 'wisdom', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'intelligence', amount: 2 },
        { stat: 'wisdom', amount: 2, stat2: 'spirit', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'luck', amount2: 1 },
        { stat: 'spirit', amount: 2 }, { stat: 'wisdom', amount: 3 }, { stat: 'dexterity', amount: 2 },
        { stat: 'wisdom', amount: 3, stat2: 'intelligence', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
      ],
      'Ravager': [
        { stat: 'strength', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'vitality', amount: 2 },
        { stat: 'strength', amount: 2, stat2: 'dexterity', amount2: 1 }, { stat: 'endurance', amount: 2, stat2: 'vitality', amount2: 1 },
        { stat: 'dexterity', amount: 2 }, { stat: 'strength', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'strength', amount: 3, stat2: 'endurance', amount2: 2 }, { stat: 'vitality', amount: 2, stat2: 'wisdom', amount2: 2 },
      ],
      'Assassin': [
        { stat: 'dexterity', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'dexterity', amount: 2, stat2: 'luck', amount2: 1 }, { stat: 'endurance', amount: 2, stat2: 'wisdom', amount2: 1 },
        { stat: 'intelligence', amount: 2 }, { stat: 'dexterity', amount: 3 }, { stat: 'strength', amount: 2 },
        { stat: 'dexterity', amount: 3, stat2: 'luck', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
      ],
      'Cleric': [
        { stat: 'spirit', amount: 2 }, { stat: 'vitality', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'spirit', amount: 2, stat2: 'strength', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'intelligence', amount: 2 }, { stat: 'wisdom', amount: 3 }, { stat: 'endurance', amount: 2 },
        { stat: 'spirit', amount: 3, stat2: 'wisdom', amount2: 2 }, { stat: 'vitality', amount: 2, stat2: 'luck', amount2: 2 },
      ],
      'Witch': [
        { stat: 'intelligence', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'dexterity', amount2: 1 }, { stat: 'spirit', amount: 2, stat2: 'vitality', amount2: 1 },
        { stat: 'spirit', amount: 2 }, { stat: 'intelligence', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'wisdom', amount2: 2 }, { stat: 'endurance', amount: 2, stat2: 'spirit', amount2: 2 },
      ],
      'Inquisitor': [
        { stat: 'strength', amount: 2 }, { stat: 'vitality', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'strength', amount: 2, stat2: 'spirit', amount2: 1 }, { stat: 'endurance', amount: 2, stat2: 'wisdom', amount2: 1 },
        { stat: 'spirit', amount: 2 }, { stat: 'strength', amount: 3 }, { stat: 'intelligence', amount: 2 },
        { stat: 'strength', amount: 3, stat2: 'wisdom', amount2: 2 }, { stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 2 },
      ],
      'Runemaster': [
        { stat: 'intelligence', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'spirit', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'dexterity', amount: 2 }, { stat: 'intelligence', amount: 3 }, { stat: 'spirit', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'wisdom', amount2: 2 }, { stat: 'spirit', amount: 2, stat2: 'luck', amount2: 2 },
      ],
      'Druid': [
        { stat: 'wisdom', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'spirit', amount: 2 },
        { stat: 'dexterity', amount: 2, stat2: 'strength', amount2: 1 }, { stat: 'spirit', amount: 2, stat2: 'vitality', amount2: 1 },
        { stat: 'intelligence', amount: 2 }, { stat: 'wisdom', amount: 3 }, { stat: 'vitality', amount: 2 },
        { stat: 'wisdom', amount: 3, stat2: 'spirit', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'endurance', amount2: 2 },
      ],
      'Engineer': [
        { stat: 'intelligence', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'dexterity', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'spirit', amount: 2 }, { stat: 'strength', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'dexterity', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
      ],
      'Wizard': [
        { stat: 'intelligence', amount: 2 }, { stat: 'spirit', amount: 3 }, { stat: 'wisdom', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'luck', amount2: 1 }, { stat: 'vitality', amount: 2, stat2: 'spirit', amount2: 1 },
        { stat: 'strength', amount: 2 }, { stat: 'wisdom', amount: 3 }, { stat: 'dexterity', amount: 2 },
        { stat: 'intelligence', amount: 3, stat2: 'spirit', amount2: 2 }, { stat: 'wisdom', amount: 2, stat2: 'luck', amount2: 2 },
      ],
      'Thief': [
        { stat: 'dexterity', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'dexterity', amount: 2, stat2: 'wisdom', amount2: 1 }, { stat: 'luck', amount: 2, stat2: 'intelligence', amount2: 1 },
        { stat: 'strength', amount: 2 }, { stat: 'dexterity', amount: 3 }, { stat: 'intelligence', amount: 2 },
        { stat: 'dexterity', amount: 3, stat2: 'luck', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'wisdom', amount2: 2 },
      ],
      'Swashbuckler': [
        { stat: 'dexterity', amount: 2 }, { stat: 'endurance', amount: 3 }, { stat: 'strength', amount: 2 },
        { stat: 'dexterity', amount: 2, stat2: 'luck', amount2: 1 }, { stat: 'strength', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'wisdom', amount: 2 }, { stat: 'dexterity', amount: 3 }, { stat: 'luck', amount: 2 },
        { stat: 'dexterity', amount: 3, stat2: 'strength', amount2: 2 }, { stat: 'endurance', amount: 2, stat2: 'luck', amount2: 2 },
      ],
      'Shaman': [
        { stat: 'intelligence', amount: 2 }, { stat: 'vitality', amount: 3 }, { stat: 'spirit', amount: 2 },
        { stat: 'intelligence', amount: 2, stat2: 'wisdom', amount2: 1 }, { stat: 'spirit', amount: 2, stat2: 'endurance', amount2: 1 },
        { stat: 'strength', amount: 2 }, { stat: 'spirit', amount: 3 }, { stat: 'dexterity', amount: 2 },
        { stat: 'spirit', amount: 3, stat2: 'wisdom', amount2: 2 }, { stat: 'strength', amount: 2, stat2: 'vitality', amount2: 2 },
      ],
    };

    var talentList = CLASS_TALENT_STATS[pClassName] || CLASS_TALENT_STATS['Blood Knight'];

    // Validate tier and slot
    var validTier = typeof tierNum === 'number' && tierNum >= 0 && tierNum < TIER_LAYOUT.length;
    var tierSlots = validTier ? TIER_LAYOUT[tierNum] : [];
    var validSlot = typeof slotIdx === 'number' && slotIdx >= 0 && slotIdx < tierSlots.length;

    // Tier must be the next unlockable: previous tier must have a choice (or tier 0)
    var prevOk = (tierNum === 0) || (ut[tierNum - 1] !== undefined);
    // Must not already have a choice in this tier
    var notYetChosen = (ut[tierNum] === undefined);

    if (validTier && validSlot && tp > 0 && prevOk && notYetChosen) {
      ut[tierNum] = slotIdx;
      var talentIdx = tierSlots[slotIdx]; // index into the flat 10-talent array
      var td = talentList[talentIdx];
      if (td) {
        var st = Object.assign({}, s.stats || {});
        st[td.stat] = (st[td.stat] ?? 10) + td.amount;
        if (td.stat2) {
          st[td.stat2] = (st[td.stat2] ?? 10) + td.amount2;
        }
        objectApi.patchState({ unlockedTalents: ut, talentPoints: tp - 1, stats: st });
        objectApi.playSound('/cdn/sfx-dark-rune-unlock.mp3', { volume: 0.24 });
      }
    }
    return;
  }

  // ── Stats tab toggle ──
  if (input.actions.toggleStatsWindow) {
    objectApi.patchState({ menuTab: s.menuTab === 'stats' ? 'inventory' : 'stats' });
    return;
  }

  // Click inventory item to equip it
  if (input.actions.equipItem && input.actionData && input.actionData.equipItem) {
    var eqIdx = input.actionData.equipItem.index;
    var inv = (s.inventory || []).slice();
    while (inv.length < 30) inv.push(null);
    var bagItem = inv[eqIdx];
    if (bagItem && bagItem.id) {
      // Look up which equipment slot this item belongs in
      var rawSlot = null;
      try {
        var { ITEM_LOOKUP } = H.req('./lib/class-items.js');
        var def = ITEM_LOOKUP[bagItem.id];
        rawSlot = def ? def.slot : null;
      } catch(e) { rawSlot = null; }
      // Fallback: infer slot from item stats if lookup failed
      if (!rawSlot && bagItem.stats) {
        if (bagItem.stats.damage || bagItem.stats.attack) rawSlot = 'mainHand';
        else if (bagItem.stats.armour || bagItem.stats.armor || bagItem.stats.defence) rawSlot = 'chest';
      }
      // Also check if item itself has a slot field
      if (!rawSlot && bagItem.slot) rawSlot = bagItem.slot;
      if (rawSlot && rawSlot !== 'bag') {
        var EQUIP_SLOT_MAP = { chest: 'armor', mainHand: 'mainHand', offHand: 'offHand', head: 'head', hands: 'hands', belt: 'belt', feet: 'feet', ring1: 'ring1', ring2: 'ring2', ring3: 'ring3', amulet: 'amulet', trinket1: 'trinket1', trinket2: 'trinket2' };
        var eqKey = EQUIP_SLOT_MAP[rawSlot] || rawSlot;
        var eq = Object.assign({}, s.equipment || {});
        var oldItem = eq[eqKey] || null;
        eq[eqKey] = bagItem;
        inv[eqIdx] = oldItem;
        objectApi.patchState({ equipment: eq, inventory: inv });
        saveCharacter(objectApi);
      }
    }
    return;
  }

  // Click to unequip: move equipped item to first empty bag slot
  if (input.actions.unequipItem && input.actionData && input.actionData.unequipItem) {
    var rawSlot = input.actionData.unequipItem.slot;
    // Normalise UI slot names (Armour, MainHand, etc.) to state keys (armor, mainHand, etc.)
    var SLOT_MAP = { Armour: 'armor', MainHand: 'mainHand', OffHand: 'offHand', Head: 'head', Hands: 'hands', Belt: 'belt', Feet: 'feet', Ring1: 'ring1', Ring2: 'ring2', Ring3: 'ring3', Amulet: 'amulet', Trinket1: 'trinket1', Trinket2: 'trinket2' };
    var slot = SLOT_MAP[rawSlot] || rawSlot;
    var eq = s.equipment || {};
    var item = eq[slot];
    if (item) {
      var inv = (s.inventory || []).slice();
      // Ensure 30 slots
      while (inv.length < 30) inv.push(null);
      var emptyIdx = -1;
      for (var bi = 0; bi < inv.length; bi++) {
        if (!inv[bi]) { emptyIdx = bi; break; }
      }
      if (emptyIdx >= 0) {
        inv[emptyIdx] = item;
        var newEq = {};
        for (var ek in eq) { if (ek !== slot) newEq[ek] = eq[ek]; }
        objectApi.patchState({ equipment: newEq, inventory: inv });
        saveCharacter(objectApi);
      }
    }
    return;
  }
  if (input.actions.playTrack && input.actionData && input.actionData.playTrack) {
    var idx = input.actionData.playTrack.index;
    if (idx >= 0 && idx < TRACKS.length) {
      // Cancel any existing auto-advance timer
      var prevTimer = objectApi.getState()._trackTimer;
      if (prevTimer) objectApi.cancelTimer(prevTimer);
      // Stop ALL world music immediately — cello via musicShift, spatial via object audio
      objectApi.musicShift(TRACKS[idx].url, { fade: 0.5, volume: 0.15, audience: { kind: 'player', id: objectApi.id } });
      // Mute spatial audio objects
      setWorldSpatialAudio(objectApi, true);
      // Set auto-advance timer for next track
      var trackDuration = TRACKS[idx].duration || 200;
      var nextIdx = idx + 1;
      var timerId = null;
      if (nextIdx < TRACKS.length) {
        timerId = objectApi.runInSeconds(trackDuration, function() {
          var cs = objectApi.getState();
          // Only advance if still playing the same track (user didn't stop or switch)
          if (cs.activeTrack === idx) {
            objectApi.musicShift(TRACKS[nextIdx].url, { fade: 1, volume: 0.15, audience: { kind: 'player', id: objectApi.id } });
            objectApi.patchState({ activeTrack: nextIdx });
            // Chain the next auto-advance timer
            var nextDur = TRACKS[nextIdx].duration || 200;
            var followIdx = nextIdx + 1;
            if (followIdx < TRACKS.length) {
              var chainTimer = objectApi.runInSeconds(nextDur, function chainAdvance() {
                var cs2 = objectApi.getState();
                var curIdx = cs2.activeTrack;
                if (curIdx === null || curIdx === undefined) return;
                var nxt = curIdx + 1;
                if (nxt < TRACKS.length) {
                  objectApi.musicShift(TRACKS[nxt].url, { fade: 1, volume: 0.15, audience: { kind: 'player', id: objectApi.id } });
                  objectApi.patchState({ activeTrack: nxt });
                  var nxtDur = TRACKS[nxt].duration || 200;
                  if (nxt + 1 < TRACKS.length) {
                    var ct = objectApi.runInSeconds(nxtDur, chainAdvance);
                    objectApi.patchState({ _trackTimer: ct });
                  } else {
                    // Last track — set timer to stop after it finishes
                    var stopTimer = objectApi.runInSeconds(nxtDur, function() {
                      var fs = objectApi.getState();
                      if (fs.activeTrack === nxt) {
                        restorePlaceMusic(objectApi, 2, 0.12);
                        setWorldSpatialAudio(objectApi, false);
                        objectApi.patchState({ activeTrack: null, celloMuted: false, _trackTimer: null });
                      }
                    });
                    objectApi.patchState({ _trackTimer: stopTimer });
                  }
                } else {
                  // Reached end — restore world music
                  restorePlaceMusic(objectApi, 2, 0.12);
                  setWorldSpatialAudio(objectApi, false);
                  objectApi.patchState({ activeTrack: null, celloMuted: false, _trackTimer: null });
                }
              });
              objectApi.patchState({ _trackTimer: chainTimer });
            } else {
              // Only one track left after current — set end timer
              var endTimer = objectApi.runInSeconds(nextDur, function() {
                var es = objectApi.getState();
                if (es.activeTrack === nextIdx) {
                  restorePlaceMusic(objectApi, 2, 0.12);
                  setWorldSpatialAudio(objectApi, false);
                  objectApi.patchState({ activeTrack: null, celloMuted: false, _trackTimer: null });
                }
              });
              objectApi.patchState({ _trackTimer: endTimer });
            }
          }
        });
      } else {
        // Last track in list — set timer to stop when it ends
        timerId = objectApi.runInSeconds(trackDuration, function() {
          var es2 = objectApi.getState();
          if (es2.activeTrack === idx) {
            restorePlaceMusic(objectApi, 2, 0.12);
            setWorldSpatialAudio(objectApi, false);
            objectApi.patchState({ activeTrack: null, celloMuted: false, _trackTimer: null });
          }
        });
      }
      objectApi.patchState({ activeTrack: idx, celloMuted: true, worldMusicStarted: true, _trackTimer: timerId });
    }
    return;
  }
  if (input.actions.stopTrack) {
    // Cancel auto-advance timer
    var stopPrevTimer = objectApi.getState()._trackTimer;
    if (stopPrevTimer) objectApi.cancelTimer(stopPrevTimer);
    restorePlaceMusic(objectApi, 2, 0.12);
    // Restore spatial audio objects
    setWorldSpatialAudio(objectApi, false);
    objectApi.patchState({ activeTrack: null, celloMuted: false, _trackTimer: null });
    return;
  }
  if (input.actions.musicVolUp) {
    var vol = Math.min(1, (s.musicVolume ?? 0.5) + 0.1);
    objectApi.patchState({ musicVolume: vol, musicMuted: false });
    objectApi.musicShift(null, { volume: vol, audience: { kind: 'player', id: objectApi.id } });
    return;
  }
  if (input.actions.musicVolDown) {
    var vol = Math.max(0, (s.musicVolume ?? 0.5) - 0.1);
    objectApi.patchState({ musicVolume: vol });
    objectApi.musicShift(null, { volume: vol, audience: { kind: 'player', id: objectApi.id } });
    return;
  }
  if (input.actions.musicMute) {
    var muted = !s.musicMuted;
    objectApi.patchState({ musicMuted: muted });
    objectApi.musicShift(null, { volume: muted ? 0 : (s.musicVolume ?? 0.5), audience: { kind: 'player', id: objectApi.id } });
    return;
  }

  // ── Force reset to creation (dev tool) ──
  if (input.actions.forceCreation) {
        try {
      objectApi.job('storage:set', { key: 'roster_' + objectApi.id, value: [] }, function() {
            objectApi.log('Save cleared');
          });
    } catch(e) {
      // Storage not available in singleplayer — silently skip
    }
    objectApi.musicShift(null, { fade: 0.5 });
    objectApi.setProperty('visible', false);
    objectApi.setProperty('animated3DCharacter', null);
    objectApi.setProperty('model', null);
    objectApi.patchState({
      characterCreated: false,
      phase: 'loading',
      loadingTimer: 0,
      _dataLoaded: true,
      _hasCharacter: false,
      charName: '',
      showSettings: false,
      showInventory: false,
      showCharacter: false,
      showMap: false,
      showQuests: false,
      showSpellbook: false,
      showMusic: false,
      menuPanelLocked: false,
      velocity: { x: 0, y: 0, z: 0 },
      worldMusicStarted: false,
      creationMusicStarted: false,
      _previewCleaned: false,
      previewModelId: null,
      previewLightId: null,
    });
    // Character creation only works in 'character-creation-land'
    objectApi.enterPlace(objectApi.id, { place: 'character-creation-land', at: { x: 83.168, y: 1.229, z: 10.812 } });
    return;
  }

  // ── Logout ──
  if (input.actions.logout) {
    handleLogout(objectApi);
    return;
  }

  // ── Main Menu (save & return to main-menu-land) ──
  if (input.actions.goToMainMenu || input.actions.openRealmList) {
    handleLogout(objectApi, input.actions.openRealmList ? 'realms' : 'select');
    return;
  }

  // ── New character confirmation ──
  if (input.actions.showNewCharConfirm) {
    objectApi.patchState({ showNewCharConfirm: true });
    return;
  }
  if (input.actions.cancelNewChar) {
    objectApi.patchState({ showNewCharConfirm: false });
    return;
  }
  if (input.actions.confirmNewChar) {
    objectApi.patchState({ showNewCharConfirm: false });
    handleLogout(objectApi);
    return;
  }

  // ── Inventory tab switching ──
  if (input.actions.setInventoryTab && input.actionData?.setInventoryTab) {
    objectApi.patchState({ inventoryTab: input.actionData.setInventoryTab.tab });
    return;
  }

  // ── Keyring toggle ──
  if (input.actions.toggleKeyring) {
    objectApi.patchState({ showKeyring: !s.showKeyring });
    return;
  }

  // ── Gnome Tip Jar ──
  if (input.actions.toggleTipModal) {
    objectApi.patchState({ showTipModal: !s.showTipModal });
    return;
  }
  if (input.actions.tipDonate && input.actionData && input.actionData.tipDonate) {
    var tipBuyableId = input.actionData.tipDonate.buyableId;
    if (tipBuyableId) {
      objectApi.triggerPurchase(tipBuyableId, objectApi.id);
      objectApi.patchState({ showTipModal: false });
    }
    return;
  }
  if (input.actions.tipCustomDonate && input.actionData && input.actionData.tipCustomDonate) {
    var tipDollars = Math.round(input.actionData.tipCustomDonate.dollars || 0);
    if (tipDollars >= 1 && tipDollars <= 100) {
      var tipSpoins = tipDollars * 100;
      // Map to the matching buyable id
      var customBuyId;
      if (tipSpoins === 100) customBuyId = 'tip-small';
      else if (tipSpoins === 500) customBuyId = 'tip-medium';
      else if (tipSpoins === 1000) customBuyId = 'tip-large';
      else customBuyId = 'custom-tip-' + tipSpoins;
      objectApi.triggerPurchase(customBuyId, objectApi.id);
      objectApi.patchState({ showTipModal: false });
    }
    return;
  }

  // ── Spoins Shop ──
  if (input.actions.toggleSpoinsShop) {
    objectApi.patchState({ showSpoinsShop: !s.showSpoinsShop });
    return;
  }
  if (input.actions.purchaseSpoins && input.actionData && input.actionData.purchaseSpoins) {
    var spoinsPkg = input.actionData.purchaseSpoins.packageId;
    if (spoinsPkg) {
      objectApi.triggerPurchase(spoinsPkg, objectApi.id);
      objectApi.patchState({ showSpoinsShop: false });
    }
    return;
  }

  // ── Health Potion ──
  if (input.actions.useHealthPotion) {
    var hpInv = (s.inventory || []).slice();
    var hpIdx = -1;
    for (var hi = 0; hi < hpInv.length; hi++) {
      if (hpInv[hi] && hpInv[hi].id === 'health-potion') { hpIdx = hi; break; }
    }
    if (hpIdx === -1) {
      objectApi.toast('No health potions left!', { duration: 2, color: 'oklch(0.55 0.26 27)' });
      return;
    }
    var currentHp = s.health ?? 0;
    var maxHp = s.maxHealth ?? 1000;
    if (currentHp >= maxHp) {
      objectApi.toast('Already at full health', { duration: 1.5, color: 'oklch(0.65 0.15 140)' });
      return;
    }
    var healAmt = (hpInv[hpIdx].stats && hpInv[hpIdx].stats.healAmount) || 200;
    var newHp = Math.min(currentHp + healAmt, maxHp);
    var healed = newHp - currentHp;

    // Decrement or remove the potion
    var hpItem = hpInv[hpIdx];
    var hpCount = hpItem.count || 1;
    if (hpCount <= 1) {
      hpInv[hpIdx] = null;
    } else {
      var updItem = {};
      for (var hk in hpItem) updItem[hk] = hpItem[hk];
      updItem.count = hpCount - 1;
      hpInv[hpIdx] = updItem;
    }

    objectApi.patchState({ health: newHp, inventory: hpInv });

    // Heal effects — gentle crimson/green particles and calm chime
    var hpPos = objectApi.getProperty('feetPosition');
    objectApi.particleBurst(
      { x: hpPos.x, y: hpPos.y + 1, z: hpPos.z },
      'heal',
      { scale: 0.8, color: 'oklch(0.55 0.25 20)' }
    );
    objectApi.particleBurst(
      { x: hpPos.x, y: hpPos.y + 0.5, z: hpPos.z },
      'magic',
      { scale: 0.4, color: 'oklch(0.6 0.2 140)' }
    );
    objectApi.playSound('cdn/sfx-magic-chime-gentle.mp3', { volume: 0.12 });
    objectApi.screenFlash('oklch(0.4 0.15 140)', 0.15);
    objectApi.toast('Health restored! +' + healed + ' HP', {
      duration: 2,
      icon: '/cdn/icon-dark-gothic-health-potion-red.png',
      color: 'oklch(0.55 0.25 20)',
    });
    objectApi.damageNumber(
      { x: hpPos.x, y: hpPos.y + 2, z: hpPos.z },
      healed,
      { text: '+' + healed + ' Health', color: 'oklch(0.65 0.2 140)', size: 1.2 }
    );
    saveCharacter(objectApi);
    return;
  }

  // ── Runestone of Return ──
  if (input.actions.useRunestone || (input.actions.setMenuTab && input.actionData && input.actionData.setMenuTab && input.actionData.setMenuTab.tab === '__runestone__')) {
    // Check player actually has the runestone in inventory
    var inv = s.inventory || [];
    var hasRunestone = false;
    for (var ri = 0; ri < inv.length; ri++) {
      if (inv[ri] && inv[ri].id === 'runestone') { hasRunestone = true; break; }
    }
    if (!hasRunestone) return;

    // Teleport to origin
    var oldPos = objectApi.getProperty('feetPosition');

    // Purple particle burst at departure
    objectApi.particleBurst(oldPos, 'magic', { scale: 1.5, color: 'oklch(0.5 0.25 300)' });

    // Teleport to origin (0, terrain, 0)
    var terrainY = objectApi.getTerrainHeight(0, 0);
    objectApi.setProperty('feetPosition', { x: 0, y: terrainY + 0.5, z: 0 });
    objectApi.patchState({ velocity: { x: 0, y: 0, z: 0 } });

    // Purple particle burst at arrival
    objectApi.runInTicks(2, function() {
      objectApi.particleBurst({ x: 0, y: terrainY + 1, z: 0 }, 'magic', { scale: 1.5, color: 'oklch(0.5 0.25 300)' });
    });

    objectApi.playSound('cdn/sfx-magic-teleport.mp3', { volume: 0.36 });
    objectApi.toast('Runestone activated — returned to the origin', { icon: '/cdn/icon-dark-gothic-glowing-runestone.png', color: 'oklch(0.5 0.2 300)' });
    objectApi.screenFlash('oklch(0.4 0.2 300)', 0.2);

    // Save after teleport
    saveCharacter(objectApi);
    return;
  }

  // ── Spell bar lock toggle ──
  if (input.actions.toggleSpellBarLock) {
    // Fix: explicitly toggle between true and false (undefined counts as locked)
    var wasLocked = s.spellBarLocked !== false;
    objectApi.patchState({ spellBarLocked: !wasLocked, pendingBarSpell: wasLocked ? s.pendingBarSpell : null });
    return;
  }

  // ── Click-to-assign: select a spell from spellbook for bar assignment ──
  if (input.actions.selectSpellForBar && input.actionData && input.actionData.selectSpellForBar) {
    var pendingSpellId = input.actionData.selectSpellForBar.spellId;
    if (pendingSpellId) {
      // If same spell already pending, deselect it (toggle off)
      if (s.pendingBarSpell === pendingSpellId) {
        objectApi.patchState({ pendingBarSpell: null });
      } else {
        objectApi.patchState({ pendingBarSpell: pendingSpellId });
      }
    }
    return;
  }

  // ── Click-to-assign: assign pending spell to a spellbar slot ──
  if (input.actions.assignSpellToSlot && input.actionData && input.actionData.assignSpellToSlot) {
    // Lock only blocks removal, not adding spells
    var assignData = input.actionData.assignSpellToSlot;
    var assignSlot = assignData.slotIndex;
    var assignSpell = s.pendingBarSpell;
    if (typeof assignSlot !== 'number' || assignSlot < 0 || assignSlot >= 12) return;
    if (!assignSpell) return;

    var abar = (s.spellBar || []).slice();
    while (abar.length < 12) abar.push(null);
    abar[assignSlot] = { id: assignSpell };
    objectApi.patchState({ spellBar: abar, pendingBarSpell: null });
    return;
  }

  // ── Spell drag state for camera suppression ──
  if (input.actions.spellDragStart) {
    objectApi.patchState({ spellDragActive: true });
    return;
  }
  if (input.actions.spellDragEnd) {
    objectApi.patchState({ spellDragActive: false });
    return;
  }

  // ── Drag-and-drop fallback (kept for browsers where it works) ──
  if (input.actions.spellbarDrop && input.actionData && input.actionData.spellbarDrop) {
    // Lock only blocks removal, not adding spells
    var dropData = input.actionData.spellbarDrop;
    var dropSlot = dropData.slotIndex;
    var dropSpell = dropData.spellId;
    if (typeof dropSlot !== 'number' || dropSlot < 0 || dropSlot >= 12) return;
    if (!dropSpell) return;

    var bar = (s.spellBar || []).slice();
    while (bar.length < 12) bar.push(null);

    // Handle slot-to-slot rearrange (data prefixed with 'spellbar-remove:')
    if (typeof dropSpell === 'string' && dropSpell.indexOf('spellbar-remove:') === 0) {
      var sourceSlot = parseInt(dropSpell.split(':')[1], 10);
      if (!isNaN(sourceSlot) && sourceSlot >= 0 && sourceSlot < 12 && sourceSlot !== dropSlot) {
        var sourceSpell = bar[sourceSlot];
        bar[sourceSlot] = bar[dropSlot];
        bar[dropSlot] = sourceSpell;
        objectApi.patchState({ spellBar: bar });
      }
      return;
    }

    bar[dropSlot] = { id: dropSpell };
    objectApi.patchState({ spellBar: bar, pendingBarSpell: null });
    return;
  }
  if (input.actions.spellbarRemove && input.actionData && input.actionData.spellbarRemove) {
    if (s.spellBarLocked === true) return; // only block when explicitly locked
    var removeSlot = input.actionData.spellbarRemove.slotIndex;
    if (typeof removeSlot !== 'number' || removeSlot < 0 || removeSlot >= 12) return;
    var rbar = (s.spellBar || []).slice();
    while (rbar.length < 12) rbar.push(null);
    rbar[removeSlot] = null;
    objectApi.patchState({ spellBar: rbar });
    saveCharacter(objectApi);
    return;
  }

  return FALL;
}
