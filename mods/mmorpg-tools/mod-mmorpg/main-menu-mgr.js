// Main Menu Manager — MMORPG Tools Mod
// Player behavior for main-menu-land
// Sets inMainMenu flag, handles menu button actions (Continue, Create Character)
// Multi-character roster: loads/saves array of characters to roster_<playerId>
var RS = require('./lib/realm-save.js'); // the live save: lib/realm-save.js (characters table)

var { getPlaceMusic } = require('./lib/place-music.js');

export function getMenuRoster(state) {
  var roster = Array.isArray(state.characters) ? state.characters.filter(Boolean) : [];
  if (!roster.length && Array.isArray(state._menuRosterSnapshot)) {
    roster = state._menuRosterSnapshot.filter(Boolean);
  }
  return roster;
}

export function getSelectedRosterIndex(state, rosterLength) {
  if (rosterLength <= 0) return 0;
  var idx = state.selectedCharIdx;
  if (typeof idx !== 'number' || idx < 0 || idx >= rosterLength) {
    idx = state.activeCharIdx;
  }
  if (typeof idx !== 'number' || idx < 0 || idx >= rosterLength) idx = 0;
  return idx;
}

export function hydrateMenuRoster(api, state) {
  var roster = getMenuRoster(state);
  var patch = {};

  if (roster.length > 0) {
    if (!Array.isArray(state.characters) || state.characters.length !== roster.length) {
      patch.characters = roster;
    }
    var selectedIdx = getSelectedRosterIndex(state, roster.length);
    if (state.selectedCharIdx !== selectedIdx) patch.selectedCharIdx = selectedIdx;
    if (state._hasCharacter !== true) patch._hasCharacter = true;
    if (state._dataLoaded !== true) patch._dataLoaded = true;
    if (!Array.isArray(state._menuRosterSnapshot) || state._menuRosterSnapshot.length !== roster.length) {
      patch._menuRosterSnapshot = roster;
    }
  } else {
    if (!Array.isArray(state.characters)) patch.characters = [];
    if (state.selectedCharIdx !== 0) patch.selectedCharIdx = 0;
    if (state._hasCharacter !== false) patch._hasCharacter = false;
    if (state._dataLoaded !== true) patch._dataLoaded = true;
  }

  if (Object.keys(patch).length > 0) {
    api.patchState(patch);
  }
}

export function update(api, dt) {
  var place = api.getEntityPlace(api.id);
  var s = api.getState();
  var isMenu = place === 'main-menu-land';

  if (isMenu) {
    // an Enter World that never left (the cross failed or the page reloaded mid-way) leaves _leavingMenu stuck: 15 s on, it's the title again
    var _nowM = api.now ? api.now() : 0;
    if (s._leavingMenu && _nowM) {
      if (!s._leavingSince) api.patchState({ _leavingSince: _nowM });
      else if (_nowM - s._leavingSince > 15000) {
        api.patchState({ _leavingMenu: false, _leavingSince: null, characterCreated: false, menuView: 'title' });
        s = api.getState();
      }
    } else if (s._leavingSince) api.patchState({ _leavingSince: null });
    if (!s.inMainMenu && !s._leavingMenu && s.phase !== 'creating') {
      var patch = {
        inMainMenu: true,
        phase: 'mainMenu',
        _zoneBanner: null,
        _zoneBannerTick: null,
      };
      if (s.characters && s.characters.length > 0) {
        patch._hasCharacter = true;
        patch._dataLoaded = true;
      } else if (s.characterCreated === true) {
        patch._hasCharacter = true;
        patch._dataLoaded = true;
      }
      api.patchState(patch);
      // Start menu music
      if (!s.musicMuted) {
        var menuVol = typeof s.musicVolume === 'number' ? s.musicVolume * 0.3 : 0.3;
        api.musicShift('/cdn/music-instrumental-fantasy-adventure-orchestral.mp3', {
          fade: 2, volume: menuVol, audience: { kind: 'player', id: api.id }
        });
      }
      // Hide player, disable pointer lock for menu
      api.setProperty('visible', false);
    }

    // at the gate the hero is a roster row, not a body in play: a characterCreated left over from the last session drew the game HUD over the title
    var menuState = api.getState();
    if (menuState.characterCreated === true && !menuState._leavingMenu && menuState.phase !== 'creating' && menuState.phase !== 'playing') {
      api.patchState({ characterCreated: false, _hasCharacter: true, _dataLoaded: true, menuView: menuState.menuView || 'title' });
      menuState = api.getState();
    }
    if (menuState.inMainMenu && menuState.characterCreated !== true) {
      hydrateMenuRoster(api, menuState);
    }
  } else if (s.inMainMenu) {
    api.patchState({ inMainMenu: false, _leavingMenu: false });
  } else if (s._leavingMenu) {
    api.patchState({ _leavingMenu: false });
  }
}

export function onSpawn(api) {
  // the realm's characters table first; the old storage roster only when the table has none (imported once into realm main)
  RS.loadRoster(api, function (rows) {
    if (rows && rows.length) {
      var s0 = api.getState();
      api.patchState({ characters: rows, _menuRosterSnapshot: rows, selectedCharIdx: Math.min(s0.selectedCharIdx ?? 0, rows.length - 1), _hasCharacter: true, _dataLoaded: true, _rosterLoaded: true, realmName: realmName(api) });
    } else {
      legacyLoad(api);
    }
    var sv = api.getState();
    if (!sv._realmSeen) api.patchState({ _realmSeen: true, realmListOpen: true });
    RS.refreshRealmList(api);
  });
}
function realmName(api) { var cur = RS.realmOf(api); var r = RS.REALMS.find(function (x) { return x.room === cur; }); return r ? r.name : cur; }

function legacyLoad(api) {
  // Load roster from storage on spawn
  try {
    api.job('storage:get', { key: 'roster_' + api.id }, function(res) {
      var roster = (res && res.data && res.data.value) ? res.data.value : null;
      var s = api.getState();

      if (roster && Array.isArray(roster) && roster.length > 0) {
        if (RS.realmOf(api) !== 'main') roster = []; // the old roster belongs to realm main
      }
      if (roster && Array.isArray(roster) && roster.length > 0) {
        RS.importLegacy(api, roster);
        api.patchState({
          characters: roster,
          _menuRosterSnapshot: roster,
          selectedCharIdx: s.selectedCharIdx ?? 0,
          _hasCharacter: true,
          _dataLoaded: true,
          _rosterLoaded: true,
        });
      } else {
        // Check legacy single-character save
        try {
          api.job('storage:get', { key: 'char_' + api.id }, function(charRes) {
            var charData = (charRes && charRes.data && charRes.data.value) ? charRes.data.value : null;
            if (charData && charData.characterCreated) {
              var rosterArr = [charData];
              api.patchState({
                characters: rosterArr,
                selectedCharIdx: 0,
                _hasCharacter: true,
                _dataLoaded: true,
                _rosterLoaded: true,
                charName: charData.charName,
                raceIndex: charData.raceIndex,
                genderIndex: charData.genderIndex,
                classIndex: charData.classIndex,
                level: charData.level,
              });
              try {
                api.job('storage:set', { key: 'roster_' + api.id, value: rosterArr }, function() {
                  api.log('Legacy character migrated to roster');
                });
              } catch(e) {}
            } else {
              api.patchState({
                characters: [],
                selectedCharIdx: 0,
                _hasCharacter: false,
                _dataLoaded: true,
                _rosterLoaded: true,
              });
            }
          });
        } catch(e) {
          hydrateMenuRoster(api, api.getState());
        }
      }
    });
  } catch(e) {
    var fs = api.getState();
    if (fs.characters && fs.characters.length > 0) {
      api.patchState({
        _hasCharacter: true,
        _dataLoaded: true,
        _rosterLoaded: true,
        selectedCharIdx: fs.selectedCharIdx ?? 0,
      });
    } else {
      api.patchState({
        characters: [],
        _hasCharacter: false,
        _dataLoaded: true,
        _rosterLoaded: true,
      });
    }
  }
}

export function onInput(api, input) {
  var s = api.getState();
  if (!s.inMainMenu) return;

  if (input.actions.setMenuView && input.actionData && input.actionData.setMenuView) { api.patchState({ menuView: input.actionData.setMenuView.view || 'title' }); return; }
  // ─── REALM LIST ───
  if (input.actions.openRealmList) { api.patchState({ realmListOpen: true, realmPick: RS.realmOf(api) }); RS.refreshRealmList(api); return; }
  if (input.actions.closeRealmList) { api.patchState({ realmListOpen: false }); return; }
  if (input.actions.pickRealm && input.actionData && input.actionData.pickRealm) { api.patchState({ realmPick: input.actionData.pickRealm.room }); return; }
  if (input.actions.joinRealm) {
    var pick = s.realmPick || RS.realmOf(api);
    if (pick === RS.realmOf(api) || !RS.REALMS.some(function (r) { return r.room === pick; })) { api.patchState({ realmListOpen: false }); return; }
    api.patchState({ realmListOpen: false });
    var out = api.cross(api.self || api.id, 'world:' + api.world.id + '/room:' + pick + '+main-menu-land');
    if (out && out.crossed === false) api.patchState({ realmError: 'The way to that realm is shut. Try again.' });
    return;
  }

  // ─── SELECT CHARACTER ───
  if (input.actions.selectCharacter && input.actionData && input.actionData.selectCharacter) {
    var selIdx = input.actionData.selectCharacter.index;
    var chars = s.characters || [];
    if (selIdx >= 0 && selIdx < chars.length) {
      api.patchState({ selectedCharIdx: selIdx });
    }
    return;
  }

  // ─── DELETE CHARACTER (show confirmation) ───
  if (input.actions.deleteCharacter && input.actionData && input.actionData.deleteCharacter) {
    var delData = input.actionData.deleteCharacter;
    api.patchState({
      _deleteConfirmIdx: delData.index, _deleteError: null,
      _deleteConfirmName: delData.name || 'Unknown',
    });
    return;
  }

  // ─── CONFIRM DELETE ───
  if (input.actions.confirmDeleteChar || input.actions.confirmDeleteCharacter) {
    var delIdx = s._deleteConfirmIdx;
    var typed = (input.actionData && (input.actionData.confirmDeleteChar || input.actionData.confirmDeleteCharacter) || {}).typed;
    if (String(typed || '').trim().toLowerCase() !== String(s._deleteConfirmName || '').toLowerCase()) { api.patchState({ _deleteError: 'Type the name to confirm.' }); return; }
    if (typeof delIdx === 'number') RS.removeSlot(api, delIdx);
    var chars = s.characters ? s.characters.slice() : [];
    if (delIdx !== null && delIdx !== undefined && delIdx >= 0 && delIdx < chars.length) {
      var deletedChar = chars[delIdx];

      // Remove from name registry
      if (deletedChar.charName) {
        try {
          api.job('storage:get', { key: 'name-registry' }, function(regRes) {
            var registry = (regRes.ok && regRes.data && regRes.data.value) ? regRes.data.value : {};
            var nameKey = deletedChar.charName.toLowerCase();
            if (registry[nameKey]) {
              delete registry[nameKey];
              try {
                api.job('storage:set', { key: 'name-registry', value: registry }, function() {
                  api.log('Name unregistered: ' + deletedChar.charName);
                });
              } catch(e) {}
            }
          });
        } catch(e) {}
      }

      // Remove from roster
      chars.splice(delIdx, 1);
      var newSelIdx = s.selectedCharIdx ?? 0;
      if (newSelIdx >= chars.length) newSelIdx = Math.max(0, chars.length - 1);

      api.patchState({
        characters: chars,
        selectedCharIdx: newSelIdx,
        _deleteConfirmIdx: null,
        _deleteConfirmName: '',
        _hasCharacter: chars.length > 0,
      });

      // Save updated roster to storage
      try {
        api.job('storage:set', { key: 'roster_' + api.id, value: chars }, function() {
          api.log('Character deleted, roster saved');
        });
      } catch(e) {}
    } else {
      api.patchState({ _deleteConfirmIdx: null, _deleteConfirmName: '' });
    }
    return;
  }

  // ─── CANCEL DELETE ───
  if (input.actions.cancelDeleteChar || input.actions.cancelDeleteCharacter) {
    api.patchState({ _deleteConfirmIdx: null, _deleteConfirmName: '' });
    return;
  }

  // ─── CREATE A CHARACTER ───
  if (input.actions.startCharacterCreation) {
    api.musicShift(null, { fade: 1.5, audience: { kind: 'player', id: api.id } });
    api.patchState({
      inMainMenu: false,
      _leavingMenu: true,
      phase: 'creating',
      characterCreated: false,
      creationMusicStarted: false,
      creationMusicKilled: false,
      charName: '',
      _hasCharacter: s.characters && s.characters.length > 0,
      _deleteConfirmIdx: null,
      _deleteConfirmName: '',
      _previewCleaned: false,
      _previewSpawned: false,
      previewModelId: null,
      previewLightId: null,
    });
    api.enterPlace(api.id, {
      placeId: 'character-creation-land',
      spawnPoint: { x: 83.168, y: 1.229, z: 10.812 },
    });
    return;
  }

  // ─── CONTINUE GAME ───
  if (input.actions.continueGame) {
    var chars = s.characters || [];
    var selIdx = s.selectedCharIdx ?? 0;
    if (selIdx < 0 || selIdx >= chars.length) return;
    if (!s._dataLoaded) return;

    var charData = chars[selIdx];

    // Fade menu music into the destination place music
    var worldVol = typeof s.musicVolume === 'number' ? s.musicVolume * 0.25 : 0.25;
    var destinationTrack = getPlaceMusic(charData.lastPlace || 'main');
    if (!s.musicMuted && destinationTrack) {
      api.musicShift(destinationTrack, {
        fade: 1.5, volume: worldVol, audience: { kind: 'player', id: api.id }
      });
    } else {
      api.musicShift(null, { fade: 1.5, audience: { kind: 'player', id: api.id } });
    }

    api.patchState({
      _musicPlace: charData.lastPlace || 'main',
      _worldMusicTrack: destinationTrack || null,
      _worldMusicVerified: false,
      worldMusicStarted: !!destinationTrack,
      celloMuted: false,
    });

    // Apply saved character data to player state
    var { RACES } = require('./lib/races.js');
    var rIdx = charData.raceIndex ?? 0;
    var gIdx = charData.genderIndex ?? 0;
    var race = RACES[rIdx];
    var rModel = race ? (gIdx === 0 ? race.maleModel : race.femaleModel) : null;

    // Restore all character state fields
    api.patchState({
      inMainMenu: false,
      _leavingMenu: true,
      phase: 'playing',
      characterCreated: true,
      controlsHidden: false,
      charName: charData.charName || 'Unnamed',
      raceIndex: rIdx,
      genderIndex: gIdx,
      classIndex: charData.classIndex ?? 0,
      level: charData.level ?? 1,
      health: charData.health ?? 1000,
      maxHealth: charData.maxHealth ?? 1000,
      mana: charData.mana ?? 500,
      maxMana: charData.maxMana ?? 500,
      talents: charData.talents || {},
      talentPoints: charData.talentPoints ?? 0,
      unlockedTalents: charData.unlockedTalents || {},
      stats: charData.stats || {},
      skinColor: charData.skinColor ?? 0,
      hairColor: charData.hairColor ?? 0,
      faceIndex: charData.faceIndex ?? 0,
      hairStyleIndex: charData.hairStyleIndex ?? 0,
      facialHairIndex: charData.facialHairIndex ?? 0,
      autoSaveTimer: 0,
      equipment: charData.equipment || {},
      inventory: charData.inventory || [],
      spellBar: charData.spellBar || [],
      buffs: charData.buffs || [],
      showSpellbook: false,
      spellbookSelected: 'attack',
      xp: charData.xp ?? 0,
      discoveredZones: charData.discoveredZones || [],
      _savedPosX: charData.posX ?? 0,
      _savedPosY: charData.posY ?? 0.2,
      _savedPosZ: charData.posZ ?? 0,
      raceReputation: charData.raceReputation || null,
      inventoryTab: charData.inventoryTab ?? 'equipment',
      bagSlots: charData.bagSlots ?? [null, null, null, null, null],
      library: charData.library || [],
      keys: charData.keys || [],
      showKeyring: false,
      showMusic: false,
      currentTrack: charData.currentTrack ?? null,
      lastPlace: charData.lastPlace || 'main',
      professions: charData.professions || [],
      activeQuests: charData.activeQuests || [],
      completedQuests: charData.completedQuests || [],
      activeCharIdx: selIdx,
      playerKills: charData.playerKills ?? 0,
      guildName: charData.guildName || null,
      guildRole: charData.guildRole || null,
      _deleteConfirmIdx: null,
      _deleteConfirmName: '',
    });

    // Restore saved position
    var targetPos = {
      x: charData.posX ?? 0,
      y: charData.posY ?? 0.2,
      z: charData.posZ ?? 0,
    };

    // Set up model
    if (rModel) {
      api.setProperty('animated3DCharacter', {
        modelId: rModel,
        walkThreshold: 0.8,
        runThreshold: 4.0,
        faceMovement: true,
        hideNameTag: true,
        animationNameMap: { Idle: 'Idle_11', Walk: 'Walk', Run: 'Run' },
      });
    }

    api.setProperty('visible', true);
    api.setProperty('scale', 1);
    api.setProperty('text', null);

    // Set up race reputation if missing
    if (!charData.raceReputation) {
      var rep = {};
      rep[rIdx] = 1000;
      api.patchState({ raceReputation: rep });
    }

    // Figure out which place to enter
    var savedPlace = charData.lastPlace || 'main';
    var metaPlaces = ['main-menu-land', 'character-creation-land'];
    if (metaPlaces.indexOf(savedPlace) !== -1) savedPlace = 'main';
    var allPlaces = Object.keys(api.getSpec('places') || {});
    if (allPlaces.indexOf(savedPlace) === -1) savedPlace = 'main';

    var currentPlace = api.getEntityPlace(api.id);
    if (currentPlace !== savedPlace) {
      var hasRealPos = (charData.posX !== 0 || charData.posZ !== 0) && charData.lastPlace;
      api.patchState({ _worldEnterAt: api.now ? api.now() : 0 });
      api.enterPlace(api.id, {
        placeId: savedPlace,
        spawnPoint: hasRealPos ? { x: charData.posX, y: charData.posY ?? 0.2, z: charData.posZ } : 'default',
      });
    } else {
      api.setProperty('feetPosition', targetPos);
    }

    // Clear cinematic orbit flag
    api.patchState({ _cinematicOrbit: false, _cinematicTime: 0 });
    api.clearCamera();
    api.setCamera({ pointerLock: true });
    return;
  }
}
