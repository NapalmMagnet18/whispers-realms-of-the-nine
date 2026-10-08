// Generic building interaction — shows the gothic building panel
// Reads buildingName, buildingGif, npcPortrait, npcName from object state

export function onSpawn(objectApi) {
  objectApi.patchState({ open: false });
}

export function openDoorPanel(playerId, objectApi) {
  var bs = objectApi.getState();

  objectApi.patchObjectState(playerId, {
    showQuestDialog: false,
    questDialogData: null,
    showDoorPanel: true,
    showNpcDialogue: false,
    npcDialogue: bs.npcDialogue || null,
    doorPanelX: 50,
    doorPanelY: 45,
    buildingName: bs.buildingName || 'Unknown Building',
    buildingGif: bs.buildingGif || '',
    npcPortrait: bs.npcPortrait || '',
    npcName: bs.npcName || 'Keeper',
    interactingBuildingId: objectApi.id,
  });
  objectApi.playSound('/cdn/sfx-door-open-wooden-creak-wye5sbik.mp3', {
    position: objectApi.getProperty('feetPosition'),
    volume: 0.24,
    audience: { kind: 'player', id: playerId },
  });
}

export function onInteract(objectApi, other) {
  if (!other.tags.includes('player')) return;

  var playerState = objectApi.getObjectState(other.id);
  if (playerState && playerState.showDoorPanel) {
    objectApi.patchObjectState(other.id, { showDoorPanel: false });
    return;
  }

  openDoorPanel(other.id, objectApi);
}
