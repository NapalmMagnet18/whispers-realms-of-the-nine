// Player behavior — MMORPG Tools Mod
// Movement, panels, save/load, logout — generic RPG core
// Character creation is handled by scripts/character-select.js
// Multi-character roster stored under roster_<playerId>
// NOTE: char_<playerId> writes removed — roster_ is the single source of truth
// Active character index tracked in state as activeCharIdx

var { TRACKS } = require('./lib/music-tracks.js');
var { getPlaceMusic } = require('./lib/place-music.js');

// ─── PER-ENTITY MOVEMENT stored in state._mv ────────────────────
// Each player gets their own movement data via state, no shared vars.
export function getMv(objectApi) {
  var s = objectApi.getState();
  return s._mv || { ix: 0, iz: 0, sin: 0, cos: 1, sprint: false, jump: false, vy: 0, dbg: 0 };
}
export function setMv(objectApi, mv) {
  objectApi.patchState({ _mv: mv });
}

// GAME_CAMERA: just restore pointer lock for custom camera.js — 
// do NOT set kind: 'third-person' which would create a builtin camera
// that fights with the custom camera.js behavior.
var GAME_CAMERA = {
  pointerLock: true,
};

export function getGameplayCharacterProp(state) {
  var { RACES } = require('./lib/races.js');
  var race = RACES[state.raceIndex ?? 0];
  var modelId = race ? ((state.genderIndex ?? 0) === 0 ? race.maleModel : race.femaleModel) : null;
  if (!modelId) return null;
  return {
    modelId: modelId,
    walkThreshold: 0.8,
    runThreshold: 4.0,
    faceMovement: true,
    hideNameTag: true,
    animationNameMap: { Idle: 'Idle_11', Walk: 'Walk', Run: 'Run' },
  };
}

export function ensureGameplayAvatar(objectApi, state) {
  var expected = getGameplayCharacterProp(state);
  var current = objectApi.getProperty('animated3DCharacter');
  if (expected && (!current || current.modelId !== expected.modelId)) {
    objectApi.setProperty('animated3DCharacter', expected);
  }
  objectApi.setProperty('visible', true);
  objectApi.setProperty('scale', 1);
  objectApi.setProperty('text', null);
}

export function getRosterResumeCandidate(state) {
  var characters = Array.isArray(state.characters) ? state.characters : [];
  if (!characters.length) return null;

  var idx = 0;
  if (typeof state.activeCharIdx === 'number' && state.activeCharIdx >= 0 && state.activeCharIdx < characters.length) {
    idx = state.activeCharIdx;
  } else if (typeof state.selectedCharIdx === 'number' && state.selectedCharIdx >= 0 && state.selectedCharIdx < characters.length) {
    idx = state.selectedCharIdx;
  }

  var charData = characters[idx];
  if (!charData || charData.characterCreated !== true) return null;
  return { idx: idx, charData: charData };
}

export function restoreRosterCharacterState(objectApi, state, opts) {
  var resume = getRosterResumeCandidate(state);
  if (!resume) return false;

  var charData = resume.charData;
  var placeId = (opts && opts.placeId) || objectApi.getEntityPlace(objectApi.id) || charData.lastPlace || 'main';
  var keepCurrentPosition = !!(opts && opts.keepCurrentPosition);
  var currentPos = objectApi.getProperty('feetPosition') || { x: 0, y: 0.2, z: 0 };
  var savedPos = {
    x: charData.posX ?? currentPos.x ?? 0,
    y: charData.posY ?? currentPos.y ?? 0.2,
    z: charData.posZ ?? currentPos.z ?? 0,
  };
  var rIdx = charData.raceIndex ?? 0;
  var rep = charData.raceReputation || null;
  if (!rep) {
    rep = {};
    rep[rIdx] = 1000;
  }

  objectApi.patchState({
    inMainMenu: false,
    _leavingMenu: false,
    _redirectingToMenu: false,
    phase: 'playing',
    characterCreated: true,
    controlsHidden: false,
    charName: charData.charName || 'Unnamed',
    raceIndex: rIdx,
    genderIndex: charData.genderIndex ?? 0,
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
    _savedPosX: savedPos.x,
    _savedPosY: savedPos.y,
    _savedPosZ: savedPos.z,
    raceReputation: rep,
    reputation: charData.reputation ?? 0,
    copper: require('./lib/currency.js').purse(charData),
    inventoryTab: charData.inventoryTab ?? 'equipment',
    bagSlots: charData.bagSlots ?? [null, null, null, null, null],
    library: charData.library || [],
    keys: charData.keys || [],
    showKeyring: false,
    showMusic: false,
    currentTrack: charData.currentTrack ?? null,
    lastPlace: placeId,
    professions: charData.professions || [],
    activeQuests: charData.activeQuests || [],
    completedQuests: charData.completedQuests || [],
    tally: charData.tally || {},
    wraithDefeated: charData.wraithDefeated ?? false,
    activeCharIdx: resume.idx,
    selectedCharIdx: typeof state.selectedCharIdx === 'number' ? state.selectedCharIdx : resume.idx,
    playerKills: charData.playerKills ?? 0,
    guildName: charData.guildName || null,
    guildRole: charData.guildRole || null,
    loadingTimer: 0,
    loadingScreen: false,
    loadingProgress: 0,
    showLoadingScreen: false,
    showWelcome: false,
    _dataLoaded: true,
    _hasCharacter: true,
  });

  if (!keepCurrentPosition) {
    objectApi.setProperty('feetPosition', savedPos);
  }

  ensureGameplayAvatar(objectApi, objectApi.getState());
  objectApi.clearCamera();
  objectApi.setCamera(GAME_CAMERA);
  if (!state.musicMuted) {
    var worldVol = typeof state.musicVolume === 'number' ? state.musicVolume * 0.25 : 0.25;
    restorePlaceMusic(objectApi, 1.2, worldVol);
  }
  return true;
}

// ─── SAVE ────────────────────────────────────────────────────────
// Places that should NOT be saved as lastPlace — these are meta/UI places
var EXCLUDED_SAVE_PLACES = ['main-menu-land', 'main-menu', 'character-creation-land'];
var WORLD_SPATIAL_AUDIO = [];
export function getCurrentPlaceMusic(objectApi) {
  return getPlaceMusic(objectApi.getEntityPlace(objectApi.id));
}

export function restorePlaceMusic(objectApi, fade, volume) {
  var track = getCurrentPlaceMusic(objectApi);
  if (track) {
    objectApi.musicShift(track, { fade: fade, volume: volume, audience: { kind: 'player', id: objectApi.id } });
  } else {
    objectApi.musicShift(null, { fade: fade, audience: { kind: 'player', id: objectApi.id } });
  }
}

export function setWorldSpatialAudio(objectApi, muted) { /* no-op in mod */ }

export function buildCharData(objectApi) {
  var s = objectApi.getState();
  var pos = objectApi.getProperty('feetPosition');

  // Determine the current place, but only save it if it's a gameplay place
  var currentPlace = objectApi.getEntityPlace(objectApi.id);
  var lastPlace = s.lastPlace || 'main'; // keep previous value as fallback
  if (currentPlace && EXCLUDED_SAVE_PLACES.indexOf(currentPlace) === -1) {
    lastPlace = currentPlace;
  }

  return {
    characterCreated: true,
    charName: s.charName || 'Unnamed',
    raceIndex: s.raceIndex ?? 0,
    genderIndex: s.genderIndex ?? 0,
    classIndex: s.classIndex ?? 0,
    level: s.level ?? 1,
    health: s.health ?? 1000,
    maxHealth: s.maxHealth ?? 1000,
    mana: s.mana ?? 500,
    maxMana: s.maxMana ?? 500,
    talents: s.talents || {},
    talentPoints: s.talentPoints ?? 0,
    unlockedTalents: s.unlockedTalents || {},
    stats: s.stats || {},
    skinColor: s.skinColor ?? 0,
    hairColor: s.hairColor ?? 0,
    faceIndex: s.faceIndex ?? 0,
    hairStyleIndex: s.hairStyleIndex ?? 0,
    facialHairIndex: s.facialHairIndex ?? 0,
    posX: pos ? pos.x : 0,
    posY: pos ? pos.y : 0.2,
    posZ: pos ? pos.z : 0,
    lastPlace: lastPlace,
    equipment: s.equipment || {},
    inventory: s.inventory || [],
    spellBar: s.spellBar || [],
    buffs: s.buffs || [],
    xp: s.xp ?? 0,
    discoveredZones: s.discoveredZones || [],
    raceReputation: s.raceReputation || {},
    reputation: s.reputation ?? 0,
    copper: require('./lib/currency.js').purse(s),
    inventoryTab: s.inventoryTab || 'equipment',
    bagSlots: s.bagSlots || [null, null, null, null, null],
    library: s.library || [],
    keys: s.keys || [],
    currentTrack: s.currentTrack ?? null,
    runestoneLastUsed: s.runestoneLastUsed ?? 0,
    professions: s.professions || [],
    guildName: s.guildName || null,
    guildRole: s.guildRole || null,
    activeQuests: s.activeQuests || [],
    completedQuests: s.completedQuests || [],
    tally: s.tally || {},
    wraithDefeated: s.wraithDefeated || false,
    className: s.className || null,
    raceName: s.raceName || null,
  };
}

export function saveCharacter(objectApi, callback) {
  var s = objectApi.getState();
  if (s._saveInFlight) { if (callback) callback(); return; }
  // Don't save until storage roster has been loaded — prevents stale persisted
  // state from overwriting the real roster in storage
  if (!s._rosterLoaded) { if (callback) callback(); return; }
  objectApi.patchState({ _saveInFlight: true });
  var origCallback = callback;
  callback = function() { objectApi.patchState({ _saveInFlight: false }); if (origCallback) origCallback(); };
  var data = buildCharData(objectApi);
  var activeIdx = s.activeCharIdx;
  var characters = s.characters;
  try { require('./lib/realm-save.js').upsert(objectApi, typeof activeIdx === 'number' && activeIdx >= 0 ? activeIdx : 0, data); } catch (e) {}
  objectApi.patchState({ _saveSig: require('./lib/realm-save.js').signature(s), _saveAt: objectApi.now ? objectApi.now() : 0 });

  // Save to roster array if we have a valid roster and active index
  if (Array.isArray(characters) && typeof activeIdx === 'number' && activeIdx >= 0 && activeIdx < characters.length) {
    var roster = characters.slice();
    roster[activeIdx] = data;
    // Update in-memory characters array so subsequent saves stay current
    objectApi.patchState({ characters: roster, _menuRosterSnapshot: roster });
        try {
      objectApi.job('storage:set', { key: 'roster_' + objectApi.id, value: roster }, function() {
            if (callback) callback();
          });
    } catch(e) {
      // Storage not available in singleplayer — still call callback to continue the flow
      if (callback) callback();
    }
  } else {
    // Fallback: no roster yet — create one with a single entry
    var newRoster = [data];
    objectApi.patchState({ characters: newRoster, activeCharIdx: 0, _menuRosterSnapshot: newRoster });
        try {
      objectApi.job('storage:set', { key: 'roster_' + objectApi.id, value: newRoster }, function() {
            if (callback) callback();
          });
    } catch(e) {
      // Storage not available in singleplayer — still call callback to continue the flow
      if (callback) callback();
    }
  }
}

// ─── SPAWN ───────────────────────────────────────────────────────
// META_PLACES — places that are part of the menu/creation flow, not gameplay
var META_PLACES = ['main-menu-land', 'main-menu', 'character-creation-land'];

export function onSpawn(objectApi) {
  // ── Clear stale cooldowns on spawn ──
  // Old tick-based fields are zeroed for safety. New wallclock-based *Ms fields
  // survive sessions correctly, so we do NOT zero them — they expire naturally.
  // We only clear the old tick-based fields and the HUD display dict.
  objectApi.patchState({
    // Legacy tick-based (safe to zero — no longer written by spell scripts)
    novaCooldownUntil: 0,
    flurryCooldownUntil: 0,
    siphonCooldownUntil: 0,
    sgCooldownUntil: 0,
    crimsonCovenantCooldownUntil: 0,
    leechSwarmCooldownUntil: 0,
    racialCooldownUntil: 0,
    bannerCooldownUntil: 0,
    landmineCooldownUntil: 0,
    eldritchSmiteCooldownUntil: 0,
    runemasterBuffUntil: 0,
    slash1CooldownUntil: 0,
    attackCooldown: 0,
    classCooldowns: {},
    // HUD display — will be recomputed next tick from the *Ms fields
    classCooldownRemaining: {},
    racialCooldownRemaining: '',
    drownCooldown: 0,
    fallDeathCooldown: 0,
    casting: false,
    isCasting: false,
    // ── Close any persisted UI panels from previous session ──
    showDoorPanel: false,
    showNpcDialogue: false,
    showShop: false,
    showQuestDialog: false,
    vampireDialog: false,
    cursedItemDialog: false,
    sigilaraMode: false,
  });

  // ── Clear any stuck screen effects from previous session ──
  objectApi.vignette(0);
  objectApi.clearEffect(null);

  // ── ALWAYS redirect to main menu on fresh join ──
  // If the player is NOT already in a meta place (menu or creation), send them to
  // main-menu-land first.  This catches returning players whose defaultPlace or
  // persistence dropped them into 'main' or any gameplay place.
  var spawnPlace = objectApi.getEntityPlace(objectApi.id);
  var s = objectApi.getState();
  if (META_PLACES.indexOf(spawnPlace) === -1 && s.phase !== 'playing' && s.phase !== 'creating') {
    // If a roster character is already loaded in menu state, treat this as an
    // intentional gameplay transfer and restore the selected character instead
    // of bouncing the player back through the menu flow.
    if (restoreRosterCharacterState(objectApi, s, { placeId: spawnPlace, keepCurrentPosition: true })) {
      return;
    }

    // Mark state so update() doesn't self-heal into 'playing' before the
    // place transition completes
    objectApi.patchState({
      phase: 'mainMenu',
      inMainMenu: true,
      _redirectingToMenu: true,
    });
    objectApi.setProperty('visible', false);
    objectApi.enterPlace(objectApi.id, {
      placeId: 'main-menu-land',
      spawnPoint: 'default',
    });
    // Don't load storage here — main-menu-mgr.js onSpawn handles roster
    // loading once the player arrives in main-menu-land.
    return;
  }

  // If already in main-menu-land (e.g. defaultPlace on refresh), let main-menu-mgr.js
  // handle roster loading — don't fire storage:get that races with it.
  // BUT if persistence restored a playing character, don't force them back to menu.
  if (spawnPlace === 'main-menu-land') {
    if (s.characterCreated && s.phase === 'playing') {
      // Persistence restored a playing character but defaultPlace put them here.
      // Transport them to their last gameplay place (or main as fallback).
      var lastPlace = s.lastPlace || 'main';
      objectApi.patchState({ _dataLoaded: true, _hasCharacter: true, _rosterLoaded: true });
      // Re-apply character model so they don't T-pose
      var { RACES: _rpRaces } = require('./lib/races.js');
      var _rpRace = _rpRaces[s.raceIndex ?? 0];
      var _rpModel = _rpRace ? ((s.genderIndex ?? 0) === 0 ? _rpRace.maleModel : _rpRace.femaleModel) : null;
      if (_rpModel) {
        objectApi.setProperty('animated3DCharacter', {
          modelId: _rpModel,
          walkThreshold: 0.8,
          runThreshold: 4.0,
          faceMovement: true,
          hideNameTag: true,
          animationNameMap: { Idle: 'Idle_11', Walk: 'Walk', Run: 'Run' },
        });
      }
      objectApi.setProperty('visible', true);
      // Use saved roster position instead of 'last' — 'last' can be polluted by god mode
      var _savedX = s._savedPosX;
      var _savedY = s._savedPosY;
      var _savedZ = s._savedPosZ;
      var _hasPos = _savedX !== undefined && _savedY !== undefined && _savedZ !== undefined;
      objectApi.enterPlace(objectApi.id, {
        placeId: lastPlace,
        spawnPoint: _hasPos ? { x: _savedX, y: _savedY, z: _savedZ } : 'default',
      });
      return;
    } else {
      objectApi.patchState({ phase: 'mainMenu', inMainMenu: true });
      objectApi.setProperty('visible', false);
      return;
    }
  }

    try {
    objectApi.job('storage:get', { key: 'roster_' + objectApi.id }, function(res) {
        // If player is currently in creation mode, skip restoring saved data
        var currentState = objectApi.getState();
        if (currentState._forceCreation) {
                try {
            objectApi.job('storage:set', { key: 'roster_' + objectApi.id, value: [] }, function() {
                    objectApi.log('Save cleared by forceCreation');
                  });
          } catch(e) {
            // Storage not available in singleplayer — silently skip
          }
          objectApi.patchState({ _forceCreation: false });
          return;
        }
        if (currentState.phase === 'creating') {
          return;
        }
        // If character already created (e.g. place transition), mark data as loaded
        // so the loading timer can complete or the self-heal can fire properly
        if (currentState.characterCreated) {
          // Re-apply character model on place transition so it doesn't T-pose
          var { RACES: _transRaces } = require('./lib/races.js');
          var _transRace = _transRaces[currentState.raceIndex ?? 0];
          var _transModel = _transRace ? ((currentState.genderIndex ?? 0) === 0 ? _transRace.maleModel : _transRace.femaleModel) : null;
          if (_transModel) {
            objectApi.setProperty('animated3DCharacter', {
              modelId: _transModel,
              walkThreshold: 0.8,
              runThreshold: 4.0,
              faceMovement: true,
              hideNameTag: true,
              animationNameMap: { Idle: 'Idle_11', Walk: 'Walk', Run: 'Run' },
            });
          }
          objectApi.patchState({ _dataLoaded: true, _hasCharacter: true, _rosterLoaded: true });
          return;
        }
    
        // storage:get returns { data: { value: <actual_data> } }
        var data = res && res.data && res.data.value;
    
        if (data && data.characterCreated) {
          // Store loaded character data — don't transition yet, loading timer will handle it
          objectApi.patchState({
            _dataLoaded: true,
            _hasCharacter: true,
            _rosterLoaded: true,
            charName: data.charName || 'Unnamed',
            raceIndex: data.raceIndex ?? 0,
            genderIndex: data.genderIndex ?? 0,
            classIndex: data.classIndex ?? 0,
            level: data.level ?? 1,
            health: data.health ?? 1000,
            maxHealth: data.maxHealth ?? 1000,
            mana: data.mana ?? 500,
            maxMana: data.maxMana ?? 500,
            talents: data.talents || {},
            talentPoints: data.talentPoints ?? 0,
            unlockedTalents: data.unlockedTalents || {},
            stats: data.stats || {},
            skinColor: data.skinColor ?? 0,
            hairColor: data.hairColor ?? 0,
            faceIndex: data.faceIndex ?? 0,
            hairStyleIndex: data.hairStyleIndex ?? 0,
            facialHairIndex: data.facialHairIndex ?? 0,
            autoSaveTimer: 0,
            equipment: data.equipment || {},
            inventory: data.inventory || [],
            spellBar: data.spellBar || [],
            buffs: data.buffs || [],
            showSpellbook: false,
            spellbookSelected: 'attack',
            xp: data.xp ?? 0,
            discoveredZones: data.discoveredZones || [],
            _savedPosX: data.posX ?? 0,
            _savedPosY: data.posY ?? 0.2,
            _savedPosZ: data.posZ ?? 0,
            raceReputation: data.raceReputation || null,
            reputation: data.reputation ?? 0,
            copper: require('./lib/currency.js').purse(data),
            inventoryTab: data.inventoryTab ?? 'equipment',
            bagSlots: data.bagSlots ?? [null, null, null, null, null],
            library: data.library ?? [],
            keys: data.keys ?? [],
            showKeyring: false,
            showMusic: false,
            currentTrack: data.currentTrack ?? null,
            lastPlace: data.lastPlace || 'main',
            professions: data.professions || [],
            activeQuests: data.activeQuests || [],
            completedQuests: data.completedQuests || [],
            tally: data.tally || {},
            wraithDefeated: data.wraithDefeated ?? false,
          });
        } else {
          // No saved data — mark for creation after loading timer
          objectApi.patchState({
            _dataLoaded: true,
            _hasCharacter: false,
            _rosterLoaded: true,
          });
        }
      });
  } catch(e) {
    // Storage not available in singleplayer — silently skip
  }
}

// ─── UPDATE ──────────────────────────────────────────────────────
export function update(objectApi, dt) {
  var s = objectApi.getState();
  var currentPlace = objectApi.getEntityPlace(objectApi.id);
  var isMetaPlace = META_PLACES.indexOf(currentPlace) !== -1;

  // ── Quest / gathering save: scripts/quest-player.js raises _questSave after accept, claim, progress or a log ──
  if (s._questSave && !s._saveInFlight && s.characterCreated) {
    objectApi.patchState({ _questSave: false });
    saveCharacter(objectApi);
  }

  // ── Live save: bag, gear, purse, level or xp moved → one upsert, at most every 2 s ──
  if (s.characterCreated && s.phase === 'playing' && !isMetaPlace && !s._saveInFlight) {
    var nowMs = objectApi.now ? objectApi.now() : 0;
    if (nowMs - (s._saveAt || 0) >= 2000) {
      var sig = require('./lib/realm-save.js').signature(s);
      if (sig !== s._saveSig) saveCharacter(objectApi);
    }
  }

  // ── Continuously save position so CMD-R restores exact location ──
  if (!isMetaPlace && s.phase === 'playing') {
    var _tick = objectApi.getTick();
    if (_tick % 60 === 0) { // every ~2 seconds at 30 TPS
      var _pos = objectApi.getProperty('feetPosition');
      if (_pos && (Math.abs((_pos.x || 0) - (s._savedPosX || 0)) > 0.5 ||
                   Math.abs((_pos.y || 0) - (s._savedPosY || 0)) > 0.5 ||
                   Math.abs((_pos.z || 0) - (s._savedPosZ || 0)) > 0.5)) {
        objectApi.patchState({
          _savedPosX: _pos.x,
          _savedPosY: _pos.y,
          _savedPosZ: _pos.z,
          lastPlace: currentPlace,
        });
      }
    }
  }

  // ── Clear forced camera angle flags after one frame ──
  if (typeof s._forceCameraYaw === 'number') {
    objectApi.patchState({ _forceCameraYaw: null, _forceCameraPitch: null });
  }

  // ── HANG GLIDER — glider script owns position, skip gravity & move ──
  if (s.onGlider) {
    objectApi.patchState({ _mv: { ix: 0, iz: 0, sin: 0, cos: 1, sprint: false, jump: false, vy: 0, dbg: 0 } });
    // Call move(0,0,0) so animated3DCharacter sees zero speed → plays Idle animation
    objectApi.move(0, 0, 0);
    return;
  }

  // ── MAIN MENU — only freeze in actual meta places, not gameplay places carrying stale menu state ──
  if ((s.phase === 'mainMenu' || s.inMainMenu) && isMetaPlace) return;

  // ── LOADING TIMER — 5 second loading screen before transitioning ──
  // GUARD: Never enter loading flow if we're in a gameplay place and have character data.
  // This prevents transient state flickers from re-triggering the loading screen mid-game.
  var shouldLoad = s.phase === 'loading' || !s.phase;
  if (shouldLoad && !isMetaPlace && (s._hasCharacter || s._dataLoaded || s.characterCreated)) {
    // We're in a gameplay place with existing character data — skip loading, force playing
    if (!s.characterCreated) {
      restoreRosterCharacterState(objectApi, s, { placeId: currentPlace, keepCurrentPosition: true });
    } else {
      objectApi.patchState({ phase: 'playing' });
    }
    shouldLoad = false;
  }
  if (shouldLoad) {
    // If we're in main-menu-land, let main-menu-mgr.js handle the phase transition
    var currentPlaceForLoad = objectApi.getEntityPlace(objectApi.id);
    if (currentPlaceForLoad === 'main-menu-land') return;
    var lt = (s.loadingTimer ?? 0) + dt;
    objectApi.patchState({ loadingTimer: lt });
    // Safety valve: if stuck loading for >15s without _dataLoaded, redirect to main menu
    if (lt >= 15 && !s._dataLoaded) {
      objectApi.patchState({
        phase: 'mainMenu',
        inMainMenu: true,
        loadingTimer: 0,
        _dataLoaded: true,
        _redirectingToMenu: true,
      });
      objectApi.setProperty('visible', false);
      objectApi.enterPlace(objectApi.id, { placeId: 'main-menu-land', spawnPoint: 'default' });
      return;
    }
    if (lt >= 5 && s._dataLoaded) {
      if (s._hasCharacter) {
        // Apply saved character — set model, position, camera
        var { RACES } = require('./lib/races.js');
        var rIdx = s.raceIndex ?? 0;
        var gIdx = s.genderIndex ?? 0;
        var race = RACES[rIdx];
        var rModel = race ? (gIdx === 0 ? race.maleModel : race.femaleModel) : null;

        objectApi.patchState({
          phase: 'playing',
          characterCreated: true,
          controlsHidden: false,
        });

        objectApi.setProperty('feetPosition', {
          x: s._savedPosX ?? 0,
          y: s._savedPosY ?? 0.2,
          z: s._savedPosZ ?? 0,
        });

        if (rModel) {
          objectApi.setProperty('animated3DCharacter', {
            modelId: rModel,
            walkThreshold: 0.8,
            runThreshold: 4.0,
            faceMovement: true,
            hideNameTag: true,
            animationNameMap: { Idle: 'Idle_11', Walk: 'Walk', Run: 'Run' },
          });
        }

        if (!s.raceReputation) {
          var rep = {};
          rep[rIdx] = 1000;
          objectApi.patchState({ raceReputation: rep });
        }

        objectApi.setProperty('visible', true);
        objectApi.setProperty('scale', 1);
        objectApi.setProperty('text', null);
        objectApi.clearCamera();
        objectApi.setCamera(GAME_CAMERA);
        objectApi.patchState({ _cinematicOrbit: false, _cinematicTime: 0 });
      } else {
        // New player — go to character creation
        // Ensure player is in character-creation-land for creation screen
        var creationPlace = objectApi.getEntityPlace(objectApi.id);
        if (creationPlace !== 'character-creation-land') {
          objectApi.enterPlace(objectApi.id, { placeId: 'character-creation-land', spawnPoint: { x: 83.168, y: 1.229, z: 10.812 } });
        }
        objectApi.patchState({
          phase: 'creating',
          characterCreated: false,
          charName: '',
        });
        objectApi.setProperty('visible', false);
        // Character creation only works in 'character-creation-land'
        objectApi.enterPlace(objectApi.id, { placeId: 'character-creation-land', spawnPoint: { x: 83.168, y: 1.229, z: 10.812 } });
      }
    }
    return;
  }

  // Recover direct menu → gameplay transfers that skipped the normal Continue action.
  // In that case the player can land in a gameplay place with menu phase flags still set,
  // which makes the UI fall through to the generic loading screen.
  if (!isMetaPlace && !s.characterCreated && (s.phase === 'mainMenu' || s._redirectingToMenu) && restoreRosterCharacterState(objectApi, s, { placeId: currentPlace, keepCurrentPosition: true })) {
    return;
  }

  // Self-heal stale menu/loading/avatar state after gameplay place transitions or rollbacks.
  // Menu and creation scripts intentionally hide or strip the player. If those props leak into
  // a gameplay place while phase is already 'playing', the old phase-only heal never fires.
  var currentAvatarProp = objectApi.getProperty('animated3DCharacter');
  var currentScale = objectApi.getProperty('scale');
  var avatarScaleHidden = false;
  if (typeof currentScale === 'number') {
    avatarScaleHidden = currentScale < 0.5;
  } else if (currentScale && typeof currentScale === 'object') {
    avatarScaleHidden = (currentScale.x ?? 1) < 0.5 || (currentScale.y ?? 1) < 0.5 || (currentScale.z ?? 1) < 0.5;
  }
  var gameplayAvatarBroken = objectApi.getProperty('visible') !== true || avatarScaleHidden || !currentAvatarProp || !currentAvatarProp.modelId;
  if (s.characterCreated && !s.dying && !s.pvpDead && !isMetaPlace && (s.phase !== 'playing' || gameplayAvatarBroken || s.inMainMenu || s._cinematicOrbit || s._redirectingToMenu)) {
    ensureGameplayAvatar(objectApi, s);
    objectApi.clearCamera();
    objectApi.setCamera(GAME_CAMERA);
    objectApi.patchState({
      phase: 'playing',
      inMainMenu: false,
      _leavingMenu: false,
      _redirectingToMenu: false,
      controlsHidden: false,
      _cinematicOrbit: false,
      _cinematicTime: 0,
    });
  }

  // Skip movement during character creation or god mode
  if (!s.characterCreated) return;
  if (objectApi.isGodMode()) return;

  // Skip movement while dying or dead — death animation plays, no player control
  if (s.dying || s.pvpDead) return;

  // Build ONE state patch for the entire frame
  var patch = {};

  // Place name announcement — announce when place changes
  var currentPlace = objectApi.getEntityPlace(objectApi.id);
  var lastAnnounced = s._lastAnnouncedPlace || '';
  if (currentPlace && currentPlace !== lastAnnounced) {
    patch._lastAnnouncedPlace = currentPlace;
    // Never announce meta places (menu, creation, etc.)
    var isMetaPlace = currentPlace.indexOf('menu') !== -1 || currentPlace.indexOf('creation') !== -1;
    if (!isMetaPlace) {
      var PLACE_NAMES = {
        'main': "Lantern's Reach",
      };
      var displayName = PLACE_NAMES[currentPlace] || currentPlace;
      patch._zoneBanner = displayName;
      patch._zoneBannerTick = objectApi.getTick();
      objectApi.playSound('/cdn/sfx-brief-harp-strum-ethereal.mp3', { volume: 0.12 });
    }
  }

  // Auto-save every 60 seconds
  var timer = (s.autoSaveTimer ?? 0) + dt;
  if (timer >= 60) {
    timer = 0;
    saveCharacter(objectApi);
  }
  patch.autoSaveTimer = timer;

  // Realm clock ~every second
  var rtTimer = (s.realmTimeTimer ?? 0) + dt;
  if (rtTimer >= 1.0) {
    var now = objectApi.getWallClockTime();
    var hh = now.getUTCHours();
    var mm = now.getUTCMinutes();
    patch.realmTime = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
    patch.realmTimeTimer = 0;
  } else {
    patch.realmTimeTimer = rtTimer;
  }

  // Gravity + movement — uses per-entity _mv state
  var mv = getMv(objectApi);
  // Vitality speed bonus: +0.5% per point above 10
  var vitStats = (s.stats || {});
  var vitBonus = Math.max(0, ((vitStats.vitality || 10) - 10)) * 0.005;
  // Auto-attack is passive — never zero speed due to isAttacking
  var baseSpeed = (Number.isFinite(s.walkSpeed) ? s.walkSpeed : 6) * (1 + vitBonus);
  // Freeze movement during mine deploy
  if (s.isDeployingMine) baseSpeed = 0;
  var speed = mv.sprint ? baseSpeed * 1.5 : baseSpeed;
  var vx = (mv.cos * mv.ix - mv.sin * mv.iz) * speed;
  var vz = -(mv.sin * mv.ix + mv.cos * mv.iz) * speed;

  // Gravity — reset if grounded, then always apply gravity, then move
  var grounded = objectApi.isGrounded();
  var vy = mv.vy;
  if (grounded && vy < 0) {
    vy = 0;
  }
  // Spawn grace — hold vy at 0 for first 0.5s so runtime colliders can load
  var _spawnAge = (s._spawnAge ?? 0) + dt;
  if (_spawnAge < 0.5) { vy = 0; patch._spawnAge = _spawnAge; }
  else { patch._spawnAge = _spawnAge; }
  if (!Number.isFinite(vy)) vy = 0;
  vy += (Number.isFinite(s.gravity) ? s.gravity : -24) * dt;
  // Terminal velocity cap — prevent tunneling through thin geometry
  if (vy < -50) vy = -50;

  // Jump
  if (mv.jump) {
    if (grounded) {
      var jumpMult = (s.raceIndex === 2) ? 2.0 : 1.0;
      vy = (Number.isFinite(s.jumpSpeed) ? s.jumpSpeed : 9) * jumpMult;
    }
    mv.jump = false;
  }

  // Let the physics handle movement via move()
  objectApi.move(vx * dt, vy * dt, vz * dt);

  mv.vy = vy;
  // Merge _mv and velocity into a single patchState to reduce state thrash
  patch._mv = mv;
  patch.velocity = { x: vx, y: vy, z: vz };
  objectApi.patchState(patch);

  // ── FALL CATCH — never let anyone fall into the void ──
  var pos = objectApi.getProperty('feetPosition');
  if (pos && pos.y < -2) {
    var mvFall = getMv(objectApi);
    mvFall.vy = 0;
    setMv(objectApi, mvFall);
    var placeFall = objectApi.getEntityPlace(objectApi.id);
    if (placeFall === 'sanctum') {
      objectApi.setProperty('feetPosition', { x: 0, y: 1.5, z: 0 });
    } else {
      // main world — snap to terrain
      var th = objectApi.getTerrainHeight(pos.x, pos.z);
      objectApi.setProperty('feetPosition', { x: pos.x, y: (th || 0) + 1, z: pos.z });
    }
    objectApi.patchState({ velocity: { x: 0, y: 0, z: 0 } });
  }
}

// ─── INPUT ───────────────────────────────────────────────────────
// UI sounds from the creator's pack: parchment for the book-like panels, a soft click for every other button
var UI_SCROLL = ['toggleQuests', 'toggleSpellbook', 'toggleMap', 'toggleWorldMap', 'toggleTalents', 'toggleProfessions'];
var UI_SND = { scroll: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', click: '/cdn/sfx-menu-select-click-hxtrmn8i.mp3', toggle: '/cdn/sfx-toggle-switch-ui-click-uz2we2q1.mp3', equip: '/cdn/sfx-handle-small-leather-movement-rs0cnxf1.mp3', unequip: '/cdn/drop-leather-item-inventory-sound-g55w76vw.mp3', coins: '/cdn/handle-coins-currency-pickup-phoc2e1u.mp3', doorClose: '/cdn/sfx-door-close-mechanical-wood-2zwf6s21.mp3', draw: '/cdn/sfx-draw-knife-metal-blade-3xr007v1.mp3' };
function uiSound(objectApi, input) {
  var acts = input.actions || {};
  if (acts.equipItem) {
    var ei = input.actionData && input.actionData.equipItem, it = ei && (objectApi.getState().inventory || [])[ei.index];
    var blade = it && it.stats && (it.stats.damage || it.stats.attack);
    objectApi.playSound(blade ? UI_SND.draw : UI_SND.equip, { volume: 0.3 }); return;
  }
  if (acts.unequipItem) { objectApi.playSound(UI_SND.unequip, { volume: 0.3 }); return; }
  if (acts.buyShopItem || acts.sellItem) { objectApi.playSound(UI_SND.coins, { volume: 0.3 }); return; }
  if (acts.clearTarget && (objectApi.getState().showDoorPanel)) { objectApi.playSound(UI_SND.doorClose, { volume: 0.25 }); return; }
  for (var i = 0; i < UI_SCROLL.length; i++) if (acts[UI_SCROLL[i]]) { objectApi.playSound(UI_SND.scroll, { volume: 0.25 }); return; }
  for (var k in acts) {
    if (!acts[k]) continue;
    if (k.indexOf('toggle') === 0) { objectApi.playSound(UI_SND.toggle, { volume: 0.22 }); return; }
    if (input.actionData && input.actionData[k]) { objectApi.playSound(UI_SND.click, { volume: 0.2 }); return; }
  }
}
export function onInput(objectApi, input) {
  var s = objectApi.getState();
  uiSound(objectApi, input);

  // ── HANG GLIDER — glider script owns input, skip movement ──
  if (s.onGlider) return;

  // During menu / creation states, allow the settings/menu UI actions that the
  // title screen and main-menu-land rely on, then let character-select.js own the rest.
  if (s.phase === 'creating' || !s.characterCreated) {
    if (input.actions.setMenuTab && input.actionData && input.actionData.setMenuTab) {
      objectApi.patchState({ menuTab: input.actionData.setMenuTab.tab });
      return;
    }
    if (input.actions.toggleSettings) {
      objectApi.patchState({ menuTab: s.menuTab === 'settings' ? 'inventory' : 'settings' });
      return;
    }
    if (input.actions.toggleUiArt) {
      objectApi.patchState({ hideUiArt: !s.hideUiArt });
      return;
    }
    if (input.actions.goToMainMenu) {
      handleLogout(objectApi);
      return;
    }
    return;
  }

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
      var shopData = require('./lib/shop-data.js');
      var shopItems = shopData.getShopItems(s.interactingBuildingId);
      var item = shopItems[s.shopSelectedItem];
      if (!item) return;
      var playerGold = require('./lib/currency.js').purse(s);
      if (playerGold < item.price) {
        objectApi.toast('Not enough money! Need ' + require('./lib/currency.js').formatText(item.price), { duration: 2, color: 'oklch(0.55 0.26 27)' });
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
      var profData = require('./lib/profession-data.js');
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
      var cpGold = require('./lib/currency.js').purse(cpState);
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
        objectApi.toast('Not enough money! Need ' + require('./lib/currency.js').formatText(cpCost), { duration: 2, color: 'oklch(0.55 0.26 27)' });
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
    var { RACES: SAVE_RACES, CLASSES: SAVE_CLASSES } = require('./lib/races.js');
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
        var { ITEM_LOOKUP } = require('./lib/class-items.js');
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
    objectApi.enterPlace(objectApi.id, { placeId: 'character-creation-land', spawnPoint: { x: 83.168, y: 1.229, z: 10.812 } });
    return;
  }

  // ── Logout ──
  if (input.actions.logout) {
    handleLogout(objectApi);
    return;
  }

  // ── Main Menu (save & return to main-menu-land) ──
  if (input.actions.goToMainMenu) {
    handleLogout(objectApi);
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

  // ── Block movement when door panel is open ──

  // ── Movement — store raw input, update() handles velocity + move() ──
  var facingSin = input.axes.aimYawSin;
  var facingCos = input.axes.aimYawCos;
  if (facingSin === undefined || facingCos === undefined) {
    facingSin = 0;
    facingCos = 1;
  }

  var moveX = input.axes.moveX || 0;
  var moveZ = input.axes.moveZ || 0;

  // WoW-style: holding both mouse buttons = walk forward
  if (input.actions.mouseLeft && input.actions.mouseRight) {
    moveZ = Math.max(moveZ, 1);
  }

  // Block movement + jump when any interaction panel is open
  var panelOpen = s.showDoorPanel || s.showQuestDialog || s.vampireDialog || s.cursedItemDialog;
  if (panelOpen) {
    moveX = 0;
    moveZ = 0;
  }

  var mag = Math.hypot(moveX, moveZ);
  var nx = mag > 1 ? moveX / mag : moveX;
  var nz = mag > 1 ? moveZ / mag : moveZ;

  // Write to per-entity movement state
  var mvIn = getMv(objectApi);
  mvIn.ix = nx;
  mvIn.iz = nz;
  mvIn.sin = facingSin;
  mvIn.cos = facingCos;
  mvIn.sprint = panelOpen ? false : input.actions.sprint === true;

  if (input.actions.jump && !panelOpen) {
    mvIn.jump = true;
  }
  setMv(objectApi, mvIn);
}

// ─── DISCONNECT — final save on leave/disconnect ─────────────────
export function onDisconnect(objectApi) {
  var s = objectApi.getState();
  if (!s.characterCreated) return;
  saveCharacter(objectApi);
}

// ─── LOGOUT ──────────────────────────────────────────────────────
export function handleLogout(objectApi) {
  saveCharacter(objectApi, function() {
    // Stop music
    objectApi.musicShift(null, { fade: 0.5 });

    // Hide player
    objectApi.setProperty('visible', false);
    objectApi.setProperty('animated3DCharacter', null);
    objectApi.setProperty('model', null);

    // Re-read the updated characters array so the main menu roster panel can display them
    var latestState = objectApi.getState();
    var updatedChars = latestState.characters || [];

    // Go to main menu land (not character-creation-land)
    objectApi.enterPlace(objectApi.id, { placeId: 'main-menu-land', spawnPoint: 'default' });

    // Reset to main menu phase, keeping the characters array intact for the roster UI
    // IMPORTANT: Clear per-character gameplay flags so they don't bleed into the
    // next character loaded via buildCharData() reading shared state.
    objectApi.patchState({
      characterCreated: false,
      phase: 'mainMenu',
      inMainMenu: true,
      loadingTimer: 0,
      _dataLoaded: true,
      _hasCharacter: updatedChars.length > 0,
      characters: updatedChars,
      _menuRosterSnapshot: updatedChars,
      selectedCharIdx: latestState.activeCharIdx ?? 0,
      charName: '',
      controlsHidden: false,
      menuTab: 'inventory',
      menuPanelLocked: false,
      showSettings: false,
      showInventory: false,
      showCharacter: false,
      showMap: false,
      showQuests: false,
      showSpellbook: false,
      showMusic: false,
      loadingScreen: false,
      loadingProgress: 0,
      velocity: { x: 0, y: 0, z: 0 },
      worldMusicStarted: false,
      creationMusicStarted: false,
      _previewCleaned: false,
      _deleteConfirmIdx: null,
      _deleteConfirmName: '',
      // Clear per-character flags to prevent cross-character contamination
      wraithDefeated: false,
      activeQuests: [],
      completedQuests: [],
    });
  });
}



// the door: one last write of the hero as they stand
export function onLeave(objectApi) {
  var s = objectApi.getState();
  if (!s.characterCreated || !s._rosterLoaded) return;
  try { require('./lib/realm-save.js').upsert(objectApi, typeof s.activeCharIdx === 'number' ? s.activeCharIdx : 0, buildCharData(objectApi)); } catch (e) {}
}
