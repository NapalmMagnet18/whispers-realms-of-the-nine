// Character creation behavior — MMORPG Tools Mod
// Race/class/gender selection, colors, confirm
// Stripped: no voice lines, no sword preview, empty spellbar
var RS = require('./lib/realm-save.js'); // the live save: lib/realm-save.js (characters table)

const { RACES, CLASSES, CLASS_COLORS, SKIN_TONES, HAIR_COLORS, FACE_OPTIONS, HAIR_STYLES, FACIAL_HAIR } = require('./lib/races.js');
const { CLASS_STARTING_ITEMS } = require('./lib/class-items.js');

// No-op stub — voice lines removed for mod
export function playRaceVoice(objectApi, raceIndex, genderIndex) {}

// GAME_CAMERA: just restore pointer lock for custom camera.js
const GAME_CAMERA = {
  pointerLock: true,
};

export function wrapIndex(value, max) {
  if (value < 0) return max - 1;
  if (value >= max) return 0;
  return value;
}

export function getModelUrl(raceIndex, genderIndex) {
  const race = RACES[raceIndex ?? 0];
  return (genderIndex ?? 0) === 0 ? race.maleModel : race.femaleModel;
}

export function getIdleClip(raceIndex, genderIndex) {
  const race = RACES[raceIndex ?? 0];
  if ((genderIndex ?? 0) === 0) {
    return race.maleIdleClip || 'Idle';
  }
  return race.femaleIdleClip || 'Idle';
}

export function getPreviewModelUrl(raceIndex, genderIndex) {
  return getModelUrl(raceIndex, genderIndex);
}

export function updatePreviewModel(objectApi, raceIndex, genderIndex) {
  const s = objectApi.getState();
  const modelUrl = getPreviewModelUrl(raceIndex, genderIndex);
  const idleClip = getIdleClip(raceIndex, genderIndex);

  if (s.previewModelId) {
    try { objectApi.destroy(s.previewModelId); } catch(e) {}
  }
  var orphans = objectApi.query({ tags: ['preview-model'] });
  for (var oi = 0; oi < orphans.length; oi++) {
    try { objectApi.destroy(orphans[oi].id); } catch(e) {}
  }

  var MODEL_X = 84.5;
  var MODEL_Z = 10.812;
  const previewId = objectApi.uniqueId('preview-char');
  objectApi.spawn(previewId, {
    tags: ['preview-model'],
    place: 'character-creation-land',
    feetPosition: { x: MODEL_X, y: 1.14, z: MODEL_Z },
      yaw: 95,
      scale: 1.4,
      animated3DCharacter: {
        modelId: modelUrl,
        walkThreshold: 0.8,
        runThreshold: 4,
        faceMovement: false,
        hideNameTag: true,
        animationNameMap: { Idle: idleClip },
      },
      text: null,
      mixer: { idle: { clip: idleClip, weight: 1, loop: 'loop' } },
  });
  objectApi.patchState({ previewModelId: previewId });
}

export function updatePreviewLight(objectApi, classIndex, raceIndex) {
  const s = objectApi.getState();
  const race = RACES[raceIndex ?? 0];
  let clsIdx = classIndex ?? 0;
  if (clsIdx >= race.classes.length) clsIdx = 0;
  const className = race.classes[clsIdx];
  const color = (CLASS_COLORS && CLASS_COLORS[className]) || '#ffffff';

  if (s.previewLightId) {
    try { objectApi.destroy(s.previewLightId); } catch(e) {}
  }
  var orphans = objectApi.query({ tags: ['preview-light'] });
  for (var oi = 0; oi < orphans.length; oi++) {
    try { objectApi.destroy(orphans[oi].id); } catch(e) {}
  }

  var MODEL_Z = 10.812;
  const lightId = objectApi.uniqueId('preview-light');
  objectApi.spawn(lightId, {
    tags: ['preview-light'],
    place: 'character-creation-land',
    feetPosition: { x: 84.5, y: 4, z: MODEL_Z - 1.0 },
      light: { kind: 'point', color: color, intensity: 12, distance: 40, decay: 1 },
  });
  objectApi.patchState({ previewLightId: lightId });
}

export function destroyPreview(objectApi) {
  const s = objectApi.getState();
  if (s.previewModelId) {
    try { objectApi.destroy(s.previewModelId); } catch(e) {}
  }
  if (s.previewLightId) {
    try { objectApi.destroy(s.previewLightId); } catch(e) {}
  }
  objectApi.patchState({ previewModelId: null, previewLightId: null });
}

export function onSpawn(objectApi) {
  const s = objectApi.getState();

  if (s.characterCreated) return;
  if (s.charName && s.charName !== '' && s.charName !== 'Unnamed' && s.phase !== 'creating') return;
  if (s.characters && s.characters.length > 0 && s.phase !== 'creating') return;

  objectApi.runInSeconds(1.0, function() {
    var currentState = objectApi.getState();
    if (currentState.characterCreated) return;
    if (currentState.charName && currentState.charName !== '' && currentState.charName !== 'Unnamed' && currentState.phase !== 'creating') return;
    if (currentState.characters && currentState.characters.length > 0 && currentState.phase !== 'creating') return;
    if (currentState.phase !== 'creating') return;
    var currentPlace = objectApi.getEntityPlace(objectApi.id);
    if (currentPlace !== 'character-creation-land') return;
    spawnPreviewIfCreating(objectApi);
  });
}

export function spawnPreviewIfCreating(objectApi) {
  if (objectApi.getEntityPlace(objectApi.id) !== 'character-creation-land') return;
  const s = objectApi.getState();
  const raceIndex = s.raceIndex ?? 0;
  const genderIndex = s.genderIndex ?? 0;
  const classIndex = s.classIndex ?? 0;
  const modelUrl = getPreviewModelUrl(raceIndex, genderIndex);
  const idleClip = getIdleClip(raceIndex, genderIndex);

  if (s.previewModelId) { try { objectApi.destroy(s.previewModelId); } catch(e) {} }
  if (s.previewLightId) { try { objectApi.destroy(s.previewLightId); } catch(e) {} }

  var MODEL_X = 84.5;
  var MODEL_Z = 10.812;

  const previewId = objectApi.uniqueId('preview-char');
  objectApi.spawn(previewId, {
    tags: ['preview-model'],
    place: 'character-creation-land',
    feetPosition: { x: MODEL_X, y: 1.14, z: MODEL_Z },
      yaw: 95,
      scale: 1.4,
      animated3DCharacter: {
        modelId: modelUrl,
        walkThreshold: 0.8,
        runThreshold: 4,
        faceMovement: false,
        hideNameTag: true,
        animationNameMap: { Idle: idleClip },
      },
      text: null,
      mixer: { idle: { clip: idleClip, weight: 1, loop: 'loop' } },
  });

  const race = RACES[raceIndex];
  let clsIdx = classIndex;
  if (clsIdx >= race.classes.length) clsIdx = 0;
  const className = race.classes[clsIdx];
  const color = (CLASS_COLORS && CLASS_COLORS[className]) || '#ffffff';
  const lightId = objectApi.uniqueId('preview-light');
  objectApi.spawn(lightId, {
    tags: ['preview-light'],
    place: 'character-creation-land',
    feetPosition: { x: 84.5, y: 4, z: MODEL_Z - 1.0 },
      light: { kind: 'point', color: color, intensity: 12, distance: 40, decay: 1 },
  });

  // No sword preview in mod version

  objectApi.patchState({ previewModelId: previewId, previewLightId: lightId });

  objectApi.setProperty('visible', false);
  objectApi.setProperty('scale', 0.001);
  objectApi.setProperty('feetPosition', { x: 83.168, y: 1.229, z: 10.812 });
  objectApi.setProperty('yaw', 0);
  objectApi.setProperty('animated3DCharacter', null);
  objectApi.setProperty('model', null);
  objectApi.setProperty('text', null);

  objectApi.setCamera({
    kind: 'third-person',
    distance: 2.8,
    heightOffset: 1.05,
    initialYaw: -1.57,
    initialPitch: 0.08,
    pointerLock: false,
    cursorVisible: true,
    allowRotation: false,
    sensitivity: 0.001,
    zoomSensitivity: 0,
    minDistance: 2.8,
    maxDistance: 2.8,
    minPitch: -1.4,
    maxPitch: 1.4,
    terrainCollision: false,
    behavior: 'mods/mmorpg-tools/mod-mmorpg/camera-creation.js',
  });
}

export function update(objectApi, dt) {
  const s = objectApi.getState();
  if (s.phase === 'mainMenu' || s.inMainMenu) return;
  // a second hero is made with characterCreated still true from the first: the creation dais hides this body all the same
  if (s.phase === 'creating' && objectApi.getEntityPlace(objectApi.id) === 'character-creation-land' && objectApi.getProperty('visible') !== false) {
    objectApi.setProperty('visible', false);
    objectApi.setProperty('scale', 0.001);
    objectApi.setProperty('animated3DCharacter', null);
    objectApi.setProperty('model', null);
  }
  if (s.characterCreated && s._previewCleaned && s.phase !== 'creating') return;
  if (s.characterCreated) {
    objectApi.patchState({ _previewCleaned: true, previewModelId: null, previewLightId: null });
    return;
  }

  objectApi.setProperty('feetPosition', { x: 83.168, y: 1.229, z: 10.812 });
  objectApi.setProperty('yaw', 0);

  var previewModels = objectApi.query({ tags: ['preview-model'] });
  if (previewModels.length === 0 && !s.previewModelId && objectApi.getEntityPlace(objectApi.id) === 'character-creation-land') {
    spawnPreviewIfCreating(objectApi);
  }

  var previewModels = objectApi.query({ tags: ['preview-model'] });
  for (var pm = 0; pm < previewModels.length; pm++) {
    objectApi.setObjectProperty(previewModels[pm].id, 'feetPosition', { x: 84.5, y: 1.14, z: 10.812 });
    objectApi.setObjectProperty(previewModels[pm].id, 'yaw', 95);
  }
  var previewLights = objectApi.query({ tags: ['preview-light'] });
  for (var pl = 0; pl < previewLights.length; pl++) {
    objectApi.setObjectProperty(previewLights[pl].id, 'feetPosition', { x: 84.5, y: 4, z: 9.812 });
  }

  objectApi.setCamera({
    kind: 'third-person',
    distance: 2.8,
    heightOffset: 1.05,
    initialYaw: -1.57,
    initialPitch: 0.08,
    pointerLock: false,
    cursorVisible: true,
    allowRotation: false,
    sensitivity: 0.001,
    zoomSensitivity: 0,
    minDistance: 2.8,
    maxDistance: 2.8,
    minPitch: -1.4,
    maxPitch: 1.4,
    terrainCollision: false,
    behavior: 'mods/mmorpg-tools/mod-mmorpg/camera-creation.js',
  });

  // --- Loading screen progress ---
  if (s.loadingScreen) {
    const progress = (s.loadingProgress ?? 0) + dt * 20;
    if (progress >= 100) {
      const raceIdx = s.raceIndex ?? 0;
      const race = RACES[raceIdx];
      const genderIdx = s.genderIndex ?? 0;
      let classIdx = s.classIndex ?? 0;
      if (classIdx >= race.classes.length) classIdx = 0;
      const className = race.classes[classIdx];
      const modelUrl = getModelUrl(raceIdx, genderIdx);
      const idleClip = getIdleClip(raceIdx, genderIdx);

      destroyPreview(objectApi);

      objectApi.setProperty('visible', true);
      objectApi.setProperty('scale', 1);
      objectApi.setProperty('animated3DCharacter', {
        modelId: modelUrl,
        walkThreshold: 0.5,
        runThreshold: 1.5,
        faceMovement: true,
        hideNameTag: true,
        yOffset: -0.16,
        animationNameMap: { Idle: idleClip, Walk: 'Walk', Run: 'Run' },
      });
      objectApi.setProperty('text', null);

      objectApi.clearCamera();
      objectApi.setCamera(GAME_CAMERA);
      objectApi.patchState({ _cameraSetForCreation: false, _cinematicOrbit: false, _cinematicTime: 0 });

      // Starting equipment — generic starter gear
      var startingEquipment = {};
      var startingInventory = [];
      for (var si = 0; si < 30; si++) startingInventory.push(null);
      // class starter kit: worn on creation (weapon + chest), from lib/class-items.js
      var { RACES: RACES_C } = require('./lib/races.js');
      var raceDef = RACES_C[raceIdx] || RACES_C[0];
      var classNameC = (raceDef.classes && raceDef.classes[classIdx]) || 'Vanguard';
      try {
        var { CLASS_STARTING_ITEMS } = require('./lib/class-items.js');
        (CLASS_STARTING_ITEMS[classNameC] || []).forEach(function (it) {
          var key = it.slot === 'chest' ? 'armor' : it.slot;
          startingEquipment[key] = Object.assign({}, it);
        });
      } catch (e) {}
      var raceStart = raceDef.start || { x: 0, y: 4.6, z: 8 };

      // Empty spellbar — 12 null slots. Creators add spells later.
      var initialSpellBar = [];
      for (var i = 0; i < 12; i++) initialSpellBar.push(null);

      // Base stats
      var { calcBaseStats } = require('./lib/stat-calc.js');
      var baseStats = calcBaseStats(raceIdx, classIdx, 1);

      // Reputation init
      var raceRep = {};
      raceRep[raceIdx] = 1000;

      var charData = {
        characterCreated: true,
        charName: s.charName || 'Unnamed',
        raceIndex: raceIdx,
        genderIndex: genderIdx,
        classIndex: classIdx,
        level: 1,
        health: 1000,
        maxHealth: 1000,
        mana: 500,
        maxMana: 500,
        talents: {},
        talentPoints: 0,
        unlockedTalents: {},
        stats: baseStats,
        skinColor: s.skinColor ?? 0,
        hairColor: s.hairColor ?? 0,
        faceIndex: s.faceIndex ?? 0,
        hairStyleIndex: s.hairStyleIndex ?? 0,
        facialHairIndex: s.facialHairIndex ?? 0,
        posX: raceStart.x,
        posY: raceStart.y,
        posZ: raceStart.z,
        lastPlace: 'main',
        className: classNameC.toLowerCase(),
        raceName: raceDef.name,
        copper: 0,
        equipment: startingEquipment,
        inventory: startingInventory,
        spellBar: initialSpellBar,
        buffs: [],
        xp: 0,
        discoveredZones: [],
        raceReputation: raceRep,
        reputation: 0,
        gold: 0,
        inventoryTab: 'equipment',
        bagSlots: [null, null, null, null, null],
        library: [],
        keys: [],
        currentTrack: null,
        professions: [],
        guildName: null,
        guildRole: null,
        activeQuests: [],
        completedQuests: [],
        playerKills: 0,
      };

      // Add to roster
      var characters = s.characters ? s.characters.slice() : [];
      var newIdx = characters.length;
      characters.push(charData);

      objectApi.patchState({
        characterCreated: true,
        phase: 'playing',
        controlsHidden: false,
        charName: charData.charName,
        raceIndex: raceIdx,
        genderIndex: genderIdx,
        classIndex: classIdx,
        level: 1,
        health: 1000,
        maxHealth: 1000,
        mana: 500,
        maxMana: 500,
        talents: {},
        talentPoints: 0,
        unlockedTalents: {},
        stats: baseStats,
        equipment: startingEquipment,
        inventory: startingInventory,
        spellBar: initialSpellBar,
        buffs: [],
        xp: 0,
        gold: 0,
        discoveredZones: [],
        raceReputation: raceRep,
        reputation: 0,
        inventoryTab: 'equipment',
        bagSlots: [null, null, null, null, null],
        library: [],
        keys: [],
        professions: [],
        guildName: null,
        guildRole: null,
        activeQuests: [],
        completedQuests: [],
        activeCharIdx: newIdx,
        className: classNameC.toLowerCase(),
        raceName: raceDef.name,
        copper: 0,
        characters: characters,
        _menuRosterSnapshot: characters,
        _hasCharacter: true,
        _dataLoaded: true,
        _savedPosX: raceStart.x,
        _savedPosY: raceStart.y,
        _savedPosZ: raceStart.z,
        lastPlace: 'main',
        loadingScreen: false,
        loadingProgress: 0,
        playerKills: 0,
      });

      // Save roster to storage
      try {
        objectApi.job('storage:set', { key: 'roster_' + objectApi.id, value: characters }, function() {
          objectApi.log('New character roster saved');
        });
      } catch(e) {}

      // the realm's table row, then the race's own starting zone
      RS.upsert(objectApi, newIdx, charData);
      objectApi.patchState({ _worldEnterAt: objectApi.now ? objectApi.now() : 0 });
      objectApi.enterPlace(objectApi.id, {
        place: 'main',
        at: { x: raceStart.x, y: raceStart.y, z: raceStart.z },
      });
    } else {
      objectApi.patchState({ loadingProgress: progress });
    }
  }

  // Force preview models to face camera
  var previewModelsInput = objectApi.query({ tags: ['preview-model'] });
  if (previewModelsInput.length > 0) {
    var MODEL_X = 84.5;
    var MODEL_Z = 10.812;
    var cam = objectApi.getCamera();
    if (cam) {
      var dx = cam.position.x - MODEL_X;
      var dz = cam.position.z - MODEL_Z;
      var faceCamYaw = Math.atan2(-dx, -dz) * (180 / Math.PI);
      for (var pmi = 0; pmi < previewModelsInput.length; pmi++) {
        objectApi.setObjectProperty(previewModelsInput[pmi].id, 'yaw', faceCamYaw);
      }
    }
  }
}

export function onInput(objectApi, input) {
  const s = objectApi.getState();

  if (s.loadingScreen) return;

  // ── Main Menu from character creation ──
  if (input.actions.goToMainMenu) {
    objectApi.enterPlace(objectApi.id, { place: 'main-menu-land', at: 'default' });
    return;
  }

  // --- Select race directly ---
  if (input.actions.selectRace && input.actionData?.selectRace) {
    const { index } = input.actionData.selectRace;
    if (index >= 0 && index < RACES.length) {
      const s = objectApi.getState();
      const genderIndex = s.genderIndex ?? 0;
      objectApi.patchState({ raceIndex: index, classIndex: 0 });
      updatePreviewModel(objectApi, index, genderIndex);
      updatePreviewLight(objectApi, 0, index);
      playRaceVoice(objectApi, index, genderIndex);
    }
  }

  // --- Select class directly ---
  if (input.actions.selectClass && input.actionData?.selectClass) {
    const { index } = input.actionData.selectClass;
    const s = objectApi.getState();
    const raceIndex = s.raceIndex ?? 0;
    const race = RACES[raceIndex];
    if (index >= 0 && index < race.classes.length) {
      objectApi.patchState({ classIndex: index });
      updatePreviewModel(objectApi, raceIndex, s.genderIndex ?? 0);
      updatePreviewLight(objectApi, index, raceIndex);
    }
  }

  // --- Select gender ---
  if (input.actions.selectGender && input.actionData?.selectGender) {
    const { index } = input.actionData.selectGender;
    if (index === 0 || index === 1) {
      const s = objectApi.getState();
      const raceIndex = s.raceIndex ?? 0;
      objectApi.patchState({ genderIndex: index });
      updatePreviewModel(objectApi, raceIndex, index);
      playRaceVoice(objectApi, raceIndex, index);
    }
  }

  // --- Cycle appearance option ---
  if (input.actions.cycleOption && input.actionData?.cycleOption) {
    const { category, direction } = input.actionData.cycleOption;
    const s = objectApi.getState();

    if (category === 'race') {
      const current = s.raceIndex ?? 0;
      const next = wrapIndex(current + direction, RACES.length);
      const genderIndex = s.genderIndex ?? 0;
      objectApi.patchState({ raceIndex: next, classIndex: 0 });
      updatePreviewModel(objectApi, next, genderIndex);
      updatePreviewLight(objectApi, 0, next);
    } else if (category === 'skin') {
      const current = s.skinColor ?? 0;
      const next = wrapIndex(current + direction, SKIN_TONES.length);
      objectApi.patchState({ skinColor: next });
    } else if (category === 'hair') {
      const current = s.hairColor ?? 0;
      const next = wrapIndex(current + direction, HAIR_COLORS.length);
      objectApi.patchState({ hairColor: next });
    } else if (category === 'face') {
      const current = s.faceIndex ?? 0;
      const next = wrapIndex(current + direction, FACE_OPTIONS.length);
      objectApi.patchState({ faceIndex: next });
    } else if (category === 'hairStyle') {
      const current = s.hairStyleIndex ?? 0;
      const next = wrapIndex(current + direction, HAIR_STYLES.length);
      objectApi.patchState({ hairStyleIndex: next });
    } else if (category === 'facialHair') {
      const current = s.facialHairIndex ?? 0;
      const next = wrapIndex(current + direction, FACIAL_HAIR.length);
      objectApi.patchState({ facialHairIndex: next });
    }
  }

  // --- Select color swatch ---
  if (input.actions.selectColor && input.actionData?.selectColor) {
    const { category, index } = input.actionData.selectColor;
    const colorKeyMap = { skin: 'skinColor', hair: 'hairColor', accent: 'accentColor' };
    const stateKey = colorKeyMap[category];
    if (!stateKey) return;
    objectApi.patchState({ [stateKey]: index });
  }

  // --- Randomize race + class ---
  if (input.actions.randomizeAppearance) {
    let raceIdx = Math.floor(objectApi.random() * RACES.length);
    var race = RACES[raceIdx];
    let classIdx = 0;
    if (race.classes.length > 1) {
      classIdx = Math.floor(objectApi.random() * race.classes.length);
    }
    const genderFinal = Math.floor(objectApi.random() * 2);
    objectApi.patchState({
      raceIndex: raceIdx,
      classIndex: classIdx,
      genderIndex: genderFinal,
    });
    updatePreviewModel(objectApi, raceIdx, genderFinal);
    updatePreviewLight(objectApi, classIdx, raceIdx);
    playRaceVoice(objectApi, raceIdx, genderFinal);
  }

  // --- Set character name ---
  if (input.actions.setCharName && input.actionData?.setCharName) {
    var _prevState = objectApi.getState();
    var _prevPatch = { charName: input.actionData.setCharName.name || '', nameError: null };
    if (_prevState.charName && _prevState.charName !== '' && _prevState.charName !== 'Unnamed' && _prevState._previousCharName == null) {
      _prevPatch._previousCharName = _prevState.charName;
    }
    objectApi.patchState(_prevPatch);
  }

  // --- Confirm character creation ---
  if (input.actions.confirmCharacter) {
    const s = objectApi.getState();

    if (s.characterCreated || s.loadingScreen) return;
    if (s._nameCheckPending) return;

    var chosenName = (s.charName || '').trim();

    if (!chosenName) {
      objectApi.patchState({ nameError: 'Please choose a name before continuing.' });
      return;
    }

    objectApi.patchState({ _nameCheckPending: true, nameError: null });

    var rIdx = s.raceIndex ?? 0;
    var race = RACES[rIdx];
    var cIdx = s.classIndex ?? 0;
    if (cIdx >= race.classes.length) cIdx = 0;
    var clsName = race.classes[cIdx];

    // Safety timeout
    var _nameCheckTimedOut = false;
    var _nameCheckTimeoutId = objectApi.runInSeconds(10, function() {
      _nameCheckTimedOut = true;
      objectApi.patchState({ _nameCheckPending: false, nameError: 'Name check timed out. Please try again.' });
    });

    // gate: Spawn's filter on the words, then the realm's unique (realm, name) in the characters table
    var _claimRegistry = function () {
    try {
      objectApi.job('storage:get', { key: 'name-registry' }, function(getResult) {
        try {
          if (_nameCheckTimedOut) return;
          objectApi.cancelTimer(_nameCheckTimeoutId);

          if (!getResult.ok) {
            // registry unreachable: let the wayfarer in rather than trap them on this screen
            objectApi.patchState({ _nameCheckPending: false, activeCharId: objectApi.uniqueId('char'), charCreatedAt: objectApi.getWallClockTimestamp(), loadingScreen: true, loadingProgress: 0 });
            return;
          }

          var registry = (getResult.data && getResult.data.value && typeof getResult.data.value === 'object') ? getResult.data.value : {};
          var nameLower = chosenName.toLowerCase();

          if (registry[nameLower] && registry[nameLower].playerId !== objectApi.id) {
            objectApi.patchState({ nameError: 'That name has already been claimed.', _nameCheckPending: false });
            return;
          }

          // Remove old name from registry if player had a previous character
          var _currentState = objectApi.getState();
          var _oldCharName = _currentState._previousCharName;
          if (_oldCharName && _oldCharName.toLowerCase() !== nameLower) {
            var oldNameLower = _oldCharName.toLowerCase();
            if (registry[oldNameLower] && registry[oldNameLower].playerId === objectApi.id) {
              delete registry[oldNameLower];
            }
          }

          registry[nameLower] = { playerId: objectApi.id, charName: chosenName, raceName: race.name, className: clsName, level: 1 };

          var _setTimedOut = false;
          var _setTimeoutId = objectApi.runInSeconds(10, function() {
            _setTimedOut = true;
            objectApi.patchState({ _nameCheckPending: false, nameError: 'Name claim timed out. Please try again.' });
          });

          try {
            objectApi.job('storage:set', { key: 'name-registry', value: registry }, function(setResult) {
              try {
                if (_setTimedOut) return;
                objectApi.cancelTimer(_setTimeoutId);

                if (!setResult.ok) {
                  objectApi.patchState({ _nameCheckPending: false, activeCharId: objectApi.uniqueId('char'), charCreatedAt: objectApi.getWallClockTimestamp(), loadingScreen: true, loadingProgress: 0 });
                  return;
                }

                // Proceed with loading screen
                objectApi.patchState({
                  _nameCheckPending: false,
                  activeCharId: objectApi.uniqueId('char'),
                  charCreatedAt: objectApi.getWallClockTimestamp(),
                  loadingScreen: true,
                  loadingProgress: 0,
                });

                objectApi.playSound('/cdn/sfx-deep-ominous-thunder-boom-dark-fantasy-cinematic.mp3', { volume: 0.48 });
              } catch(setErr) {
                objectApi.patchState({ _nameCheckPending: false, nameError: 'Error: ' + String(setErr) });
              }
            });
          } catch(e) {
            objectApi.patchState({ _nameCheckPending: false, nameError: 'Storage unavailable.' });
          }
        } catch(getErr) {
          objectApi.patchState({ _nameCheckPending: false, nameError: 'Error: ' + String(getErr) });
        }
      });
    } catch(e) {
      // Storage not available — proceed directly
      objectApi.cancelTimer(_nameCheckTimeoutId);
      objectApi.patchState({
        _nameCheckPending: false,
        activeCharId: objectApi.uniqueId('char'),
        charCreatedAt: objectApi.getWallClockTimestamp(),
        loadingScreen: true,
        loadingProgress: 0,
      });
      objectApi.playSound('/cdn/sfx-deep-ominous-thunder-boom-dark-fantasy-cinematic.mp3', { volume: 0.48 });
    }
    };
    var _realmNow = RS.realmOf(objectApi);
    var _sqlGate = function () {
      if (typeof objectApi.sql !== 'function') { _claimRegistry(); return; }
      objectApi.sql`SELECT COUNT(*) AS n FROM characters WHERE realm = ${_realmNow} AND name = ${chosenName} COLLATE NOCASE AND user_id <> @caller`.then(function (r) {
        var taken = r && r.rows && r.rows[0] && r.rows[0].n > 0;
        if (taken) { objectApi.cancelTimer(_nameCheckTimeoutId); objectApi.patchState({ nameError: 'That name is taken on this realm.', _nameCheckPending: false }); return; }
        _claimRegistry();
      }, function () { _claimRegistry(); });
    };
    try {
      objectApi.job('text:check', { text: chosenName, purpose: 'name' }, function (r) {
        if (_nameCheckTimedOut) return;
        if (r && r.ok && r.data && r.data.ok === false) { objectApi.cancelTimer(_nameCheckTimeoutId); objectApi.patchState({ nameError: 'That name cannot be used. Choose another.', _nameCheckPending: false }); return; }
        _sqlGate();
      });
    } catch (e) { _sqlGate(); }
  }
}
