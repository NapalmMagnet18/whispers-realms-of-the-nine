// Player behavior — MMORPG Tools Mod
// Movement, panels, save/load, logout — generic RPG core
// Character creation is handled by scripts/character-select.js
// Multi-character roster stored under roster_<playerId>
// NOTE: char_<playerId> writes removed — roster_ is the single source of truth
// Active character index tracked in state as activeCharIdx
var RS = require('./lib/realm-save.js'); // the live save: lib/realm-save.js (characters table)

var { TRACKS } = require('./lib/music-tracks.js');
var { getPlaceMusic } = require('./lib/place-music.js');


// ─── Lazy in-world panel input (see lib/player-panel-input.js) ───
var _panelM = null, _panelP = null;
function _loadPanels() { return _panelM ? Promise.resolve(_panelM) : (_panelP = _panelP || import('./lib/player-panel-input.js').then(function (m) { _panelM = m; return m; }, function (e) { _panelP = null; throw e; })); }
function _panelMod() { return _panelM; }
function _anyPress(input) { var a = input.actions || {}; for (var k in a) { if (a[k] && k !== 'sprint' && k !== 'jump' && k !== 'mouseLeft' && k !== 'mouseRight') return true; } return false; }
function _req(p) {
  switch (p) {
    case './lib/currency.js': return require('./lib/currency.js');
    case './lib/races.js': return require('./lib/races.js');
    case './lib/class-items.js': return require('./lib/class-items.js');
  }
  throw new Error('panel input: unknown lib ' + p);
}
var _PANEL_H = { req: _req, TRACKS: TRACKS,
  saveCharacter: function () { return saveCharacter.apply(null, arguments); }, setWorldSpatialAudio: function () { return setWorldSpatialAudio.apply(null, arguments); },
  restorePlaceMusic: function () { return restorePlaceMusic.apply(null, arguments); }, handleLogout: function () { return handleLogout.apply(null, arguments); } };

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
  objectApi.patchState({ _worldEnterAt: objectApi.now ? objectApi.now() : 0 });

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
    trained: charData.trained ?? 0,
    bank: charData.bank || [],
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
    roosts: charData.roosts || [],
    tally: charData.tally || {},
    marks: charData.marks || {},
    questFlags: charData.questFlags || {},
    caches: charData.caches || {},
    owedItems: charData.owedItems || [],
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
    trained: s.trained ?? 0,
    bank: s.bank || [],
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
    tradeSkill: s.tradeSkill || {},
    guildName: s.guildName || null,
    guildRole: s.guildRole || null,
    activeQuests: s.activeQuests || [],
    completedQuests: s.completedQuests || [],
    roosts: s.roosts || [],
    tally: s.tally || {},
    marks: s.marks || {},
    questFlags: s.questFlags || {},
    caches: s.caches || {},
    owedItems: s.owedItems || [],
    wraithDefeated: s.wraithDefeated || false,
    className: s.className || null,
    raceName: s.raceName || null,
  };
}

export function saveCharacter(objectApi, callback) {
  var s = objectApi.getState();
  if (s._saveInFlight) { if (callback) callback(false); return; }
  // Don't save until storage roster has been loaded — prevents stale persisted
  // state from overwriting the real roster in storage
  if (!s._rosterLoaded) { if (callback) callback(); return; }
  objectApi.patchState({ _saveInFlight: true });
  var data = buildCharData(objectApi);
  var savedSig = RS.signature(s);
  var sqlDone = typeof objectApi.sql !== 'function', sqlOk = sqlDone;
  var storageDone = false, finished = false;
  var origCallback = callback;
  function finish() {
    if (finished || !sqlDone || !storageDone) return;
    finished = true;
    var now = objectApi.now ? objectApi.now() : 0;
    var patch = { _saveInFlight: false, _saveAt: now, _saveRetryAt: sqlOk ? 0 : now + 2000 };
    if (sqlOk) patch._saveSig = savedSig;
    else patch._questSave = true;
    objectApi.patchState(patch);
    if (origCallback) origCallback(sqlOk);
  }
  callback = function() { storageDone = true; finish(); };
  var activeIdx = s.activeCharIdx;
  var characters = s.characters;
  if (!sqlDone) {
    try {
      RS.upsert(objectApi, typeof activeIdx === 'number' && activeIdx >= 0 ? activeIdx : 0, data, function(ok) {
        sqlDone = true; sqlOk = ok; finish();
      });
    } catch (e) { sqlDone = true; sqlOk = false; finish(); }
  }

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
    _saveInFlight: false,
    _saveRetryAt: 0,
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
  var _nowJ = objectApi.now ? objectApi.now() : 0;
  var _fresh = !(s._worldEnterAt && _nowJ && _nowJ - s._worldEnterAt < 20000);
  if (_fresh && META_PLACES.indexOf(spawnPlace) === -1 && s.characterCreated && s._rosterLoaded) {
    // a reload or a new visit while a hero was out in the world: their spot is saved, then the title screen
    try { saveCharacter(objectApi, function () {}); } catch (e) {}
  }
  if (_fresh && (s.phase === 'playing' || s.characterCreated)) {
    objectApi.patchState({ phase: 'mainMenu', characterCreated: false, menuView: 'title', realmListOpen: false });
    s = objectApi.getState();
  }
  if (META_PLACES.indexOf(spawnPlace) === -1 && s.phase !== 'playing' && s.phase !== 'creating') {
    // If a roster character is already loaded in menu state, treat this as an
    // intentional gameplay transfer and restore the selected character instead
    // of bouncing the player back through the menu flow.
    if (!_fresh && restoreRosterCharacterState(objectApi, s, { placeId: spawnPlace, keepCurrentPosition: true })) {
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
      place: 'main-menu-land',
      at: 'default',
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
        place: lastPlace,
        at: _hasPos ? { x: _savedX, y: _savedY, z: _savedZ } : 'default',
      });
      return;
    } else {
      objectApi.patchState({ phase: 'mainMenu', inMainMenu: true });
      objectApi.setProperty('visible', false);
      // the hidden menu body wears no hero model: its 1.8 MB clip set would load before the menu's first picture.
      // Enter World (main-menu-mgr.js) and the playing-restore path above put the model back.
      try { objectApi.setProperty('animated3DCharacter', null); } catch (e) {}
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
            trained: data.trained ?? 0,
            bank: data.bank || [],
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
            tradeSkill: data.tradeSkill || {},
            activeQuests: data.activeQuests || [],
            completedQuests: data.completedQuests || [],
            roosts: data.roosts || [],
            tally: data.tally || {},
            marks: data.marks || {},
            questFlags: data.questFlags || {},
            caches: data.caches || {},
            owedItems: data.owedItems || [],
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
  if (!isMetaPlace && s.characterCreated && !_panelM && !_panelP) _loadPanels().catch(function () {}); // warm the panels as the hero stands

  // ── Quest / gathering save: scripts/quest-player.js raises _questSave after accept, claim, progress or a log ──
  if (s._questSave && !s._saveInFlight && s.characterCreated &&
      (objectApi.now ? objectApi.now() : 0) >= (s._saveRetryAt || 0)) {
    objectApi.patchState({ _questSave: false });
    saveCharacter(objectApi);
  }

  // ── Live save: bag, gear, purse, level or xp moved → one upsert, at most every 2 s ──
  if (s.characterCreated && s.phase === 'playing' && !isMetaPlace && !s._saveInFlight) {
    var nowMs = objectApi.now ? objectApi.now() : 0;
    if (nowMs - (s._saveAt || 0) >= 2000) {
      var sig = RS.signature(s);
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
      objectApi.enterPlace(objectApi.id, { place: 'main-menu-land', at: 'default' });
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
          objectApi.enterPlace(objectApi.id, { place: 'character-creation-land', at: { x: 83.168, y: 1.229, z: 10.812 } });
        }
        objectApi.patchState({
          phase: 'creating',
          characterCreated: false,
          charName: '',
          _creationEnterAt: objectApi.now ? objectApi.now() : 0,
        });
        objectApi.setProperty('visible', false);
        // Character creation only works in 'character-creation-land'
        objectApi.enterPlace(objectApi.id, { place: 'character-creation-land', at: { x: 83.168, y: 1.229, z: 10.812 } });
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
      // on the March the HUD's regional banner (ui-hud.js) names where the hero actually stands; this one named every arrival Lantern's Reach
      if (currentPlace !== 'main') {
        patch._zoneBanner = PLACE_NAMES[currentPlace] || currentPlace;
        patch._zoneBannerTick = objectApi.getTick();
      }
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
// Diablo-style: every kind of gear has its own sound going on
var EQUIP_SND = { weapon: '/cdn/moodboard-painterly-fantasy/sfx-equip-weapon-steel-sword-drawn-ringing-scrape.mp3', offHand: '/cdn/moodboard-painterly-fantasy/sfx-equip-heavy-wooden-shield-strapped-on-thunk-buckle.mp3',
  head: '/cdn/moodboard-painterly-fantasy/sfx-equip-iron-helmet-set-down-metal-clank-chainmail-jingle.mp3', chest: '/cdn/moodboard-painterly-fantasy/sfx-equip-plate-armour-chest-heavy-metal-clank-straps-cinched.mp3', armor: '/cdn/moodboard-painterly-fantasy/sfx-equip-plate-armour-chest-heavy-metal-clank-straps-cinched.mp3',
  legs: '/cdn/moodboard-painterly-fantasy/sfx-equip-chainmail-leggings-rustle-metal-rings-jingle.mp3', feet: '/cdn/moodboard-painterly-fantasy/sfx-equip-armoured-boots-stomp-buckle-leather-creak.mp3', hands: '/cdn/moodboard-painterly-fantasy/sfx-equip-leather-gauntlets-pulled-on-creak-metal-tap.mp3',
  ring1: '/cdn/moodboard-painterly-fantasy/sfx-equip-gold-ring-small-bright-metal-clink-sparkle.mp3', ring2: '/cdn/moodboard-painterly-fantasy/sfx-equip-gold-ring-small-bright-metal-clink-sparkle.mp3', ring3: '/cdn/moodboard-painterly-fantasy/sfx-equip-gold-ring-small-bright-metal-clink-sparkle.mp3',
  amulet: '/cdn/moodboard-painterly-fantasy/sfx-equip-amulet-chain-jingle-gem-chime.mp3', belt: '/cdn/moodboard-painterly-fantasy/sfx-equip-leather-belt-buckle-cinched.mp3' };
function uiSound(objectApi, input) {
  var acts = input.actions || {};
  if (acts.equipItem) {
    var ei = input.actionData && input.actionData.equipItem, it = ei && (objectApi.getState().inventory || [])[ei.index];
    var blade = it && it.stats && (it.stats.damage || it.stats.attack);
    var sl = it && it.slot, clip = blade || sl === 'mainHand' ? EQUIP_SND.weapon : EQUIP_SND[sl] || UI_SND.equip;
    objectApi.playSound(clip, { volume: 0.4 }); return;
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

  // ── In-world panels live in lib/player-panel-input.js, loaded after the hero stands (kept off the menu's boot) ──
  var PI = _panelMod();
  if (PI) { if (PI.panelInput(objectApi, input, s, _PANEL_H) !== PI.FALL) return; }
  else if (_anyPress(input)) { _loadPanels().then(function (m) { try { m.panelInput(objectApi, input, objectApi.getState(), _PANEL_H); } catch (e) { objectApi.log && objectApi.log('panel input', String(e)); } }); }

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
export function handleLogout(objectApi, screen) {
  saveCharacter(objectApi, function(saved) {
    if (saved === false) return; // Keep the hero active until the authoritative save succeeds.
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
    objectApi.enterPlace(objectApi.id, { place: 'main-menu-land', at: 'default' });

    // Reset to main menu phase, keeping the characters array intact for the roster UI
    // IMPORTANT: Clear per-character gameplay flags so they don't bleed into the
    // next character loaded via buildCharData() reading shared state.
    objectApi.patchState({
      characterCreated: false,
      phase: 'mainMenu',
      inMainMenu: true,
      menuView: screen === 'select' || screen === 'realms' ? 'select' : 'title',
      realmListOpen: screen === 'realms',
      _worldEnterAt: 0,
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
      tally: {},
      marks: {},
      questFlags: {},
      caches: {},
      owedItems: [],
      roosts: [],
    });
  });
}



// the door: one last write of the hero as they stand
export function onLeave(objectApi) {
  var s = objectApi.getState();
  if (!s.characterCreated || !s._rosterLoaded) return;
  try { RS.upsert(objectApi, typeof s.activeCharIdx === 'number' ? s.activeCharIdx : 0, buildCharData(objectApi)); } catch (e) {}
}
