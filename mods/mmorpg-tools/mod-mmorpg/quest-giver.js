// Quest Giver behaviour — reusable for any NPC tagged 'quest-giver'
// Expects state.quests to be populated (or reads from quest-data.js by NPC id)
// Handles: proximity highlight + prompt, interact to open dialog, floating quest diamond

var { getAvailableQuests } = require('./lib/quest-data.js');
var { distance } = require('builtin/vec3');
var { isNearestInteractable } = require('./lib/nearest-interactable.js');

var INTERACT_RANGE = 4;
var DIAMOND_BOB_SPEED = 2.5;
var DIAMOND_BOB_AMP = 0.2;
var DIAMOND_HEIGHT_OFFSET = 3.8;
var DIAMOND_SPIN_SPEED = 30;

export function onSpawn(objectApi) {
  objectApi.patchState({
    nearbyPlayers: {},
    diamondId: null,
    diamondTime: 0,
    lastQuestCount: -1
  });
}

export function update(objectApi, dt) {
  var s = objectApi.getState();
  var myPos = objectApi.getProperty('feetPosition');

  var players = objectApi.query({ tags: ['player'], radius: INTERACT_RANGE + 2 });
  var oldNearby = s.nearbyPlayers || {};
  var newNearby = {};

  for (var i = 0; i < players.length; i++) {
    var p = players[i];
    var dist = distance(
      [myPos.x, myPos.y, myPos.z],
      [p.feetPosition.x, p.feetPosition.y, p.feetPosition.z]
    );
    var isNear = dist <= INTERACT_RANGE;

    if (isNear) {
      newNearby[p.id] = true;

      var iAmNearest = isNearestInteractable(objectApi, objectApi.id, myPos, p.feetPosition, INTERACT_RANGE + 20);

      if (iAmNearest && !s._highlighted) {
        var pState = objectApi.getObjectState(p.id) || {};
        var available = getAvailableQuests(objectApi.id, pState);
        var hasActiveFromMe = false;
        var pActive = pState.activeQuests || [];
        for (var ai = 0; ai < pActive.length; ai++) {
          if (pActive[ai].giverNpcId === objectApi.id) {
            hasActiveFromMe = true;
            break;
          }
        }
        if (available.length > 0 || hasActiveFromMe) {
          objectApi.highlight(objectApi.id, {
            color: 'oklch(0.80 0.30 140)',
            style: 'glow'
          });
          objectApi.interactPrompt(objectApi.id, "Press 'E' to interact");
          objectApi.patchObjectState(p.id, { interactHint: "Press 'E' to interact" });
          objectApi.patchState({ _highlighted: true });
        }
      } else if (!iAmNearest && s._highlighted) {
        objectApi.highlight(objectApi.id, null);
        objectApi.interactPrompt(objectApi.id, null);
        var ps2 = objectApi.getObjectState(p.id);
        if (ps2 && ps2.interactHint) objectApi.patchObjectState(p.id, { interactHint: null });
        objectApi.patchState({ _highlighted: false });
      }
    }
  }

  var anyNearby = false;
  for (var pid in newNearby) { anyNearby = true; break; }
  var wasAnyNearby = false;
  for (var pid2 in oldNearby) { wasAnyNearby = true; break; }

  if (!anyNearby && wasAnyNearby) {
    objectApi.highlight(objectApi.id, null);
    objectApi.interactPrompt(objectApi.id, null);
    var allP = objectApi.query({ tags: ['player'], radius: INTERACT_RANGE + 8 });
    for (var k = 0; k < allP.length; k++) {
      var ps = objectApi.getObjectState(allP[k].id);
      if (ps && ps.interactHint) objectApi.patchObjectState(allP[k].id, { interactHint: null });
    }
    objectApi.patchState({ _highlighted: false });
  }

  objectApi.patchState({ nearbyPlayers: newNearby });

  // --- Floating quest diamond ---
  var diamondId = s.diamondId;
  var totalQuestsForAnyone = 0;
  var checkPlayers = objectApi.query({ tags: ['player'], radius: 100 });
  for (var ci = 0; ci < checkPlayers.length; ci++) {
    var cps = objectApi.getObjectState(checkPlayers[ci].id) || {};
    var cAvail = getAvailableQuests(objectApi.id, cps);
    totalQuestsForAnyone += cAvail.length;
    var cpActive = cps.activeQuests || [];
    for (var ca = 0; ca < cpActive.length; ca++) {
      if (cpActive[ca].giverNpcId === objectApi.id) totalQuestsForAnyone++;
    }
  }

  if (totalQuestsForAnyone > 0 && !diamondId) {
    var dId = objectApi.uniqueId('quest-diamond');
    objectApi.spawn(dId, {
      tags: ['quest-diamond', 'fx'],
      feetPosition: { x: myPos.x, y: myPos.y + DIAMOND_HEIGHT_OFFSET, z: myPos.z },
        primitive: { kind: 'octahedron', radius: 0.22 },
        material: {
          color: 'oklch(0.85 0.28 90)',
          emissive: 'oklch(0.75 0.25 85)',
          emissiveIntensity: 2.5,
          roughness: 0.2,
          metalness: 0.6
        },
        scale: { x: 0.7, y: 1.0, z: 0.7 },
        physics: 'none'
    });
    objectApi.patchState({ diamondId: dId, diamondTime: 0 });
  } else if (totalQuestsForAnyone === 0 && diamondId) {
    try { objectApi.destroy(diamondId); } catch(e) {}
    objectApi.patchState({ diamondId: null, diamondTime: 0, lastQuestCount: 0 });
  }

  if (totalQuestsForAnyone > 0 && (diamondId || objectApi.getState().diamondId)) {
    var did = objectApi.getState().diamondId;
    var t = (s.diamondTime || 0) + dt;
    var bobY = myPos.y + DIAMOND_HEIGHT_OFFSET + Math.sin(t * DIAMOND_BOB_SPEED) * DIAMOND_BOB_AMP;
    objectApi.setObjectProperty(did, 'feetPosition', { x: myPos.x, y: bobY, z: myPos.z });
    var spinYaw = (t * DIAMOND_SPIN_SPEED) % 360;
    objectApi.setObjectProperty(did, 'rotation', spinYaw);
    objectApi.patchState({ diamondTime: t });
  }
}

export function onInteract(objectApi, other) {
  if (!other.tags || !other.tags.includes('player')) return;

  var playerState = objectApi.getObjectState(other.id) || {};
  var available = getAvailableQuests(objectApi.id, playerState);
  if (available.length > 0) {
    var quest = available[0];
    objectApi.patchObjectState(other.id, {
      showQuestDialog: true,
      questDialogData: {
        id: quest.id,
        title: quest.title,
        giverName: quest.giverName,
        giverNpcId: quest.giverNpcId || objectApi.id,
        text: quest.text,
        objectives: quest.objectives,
        rewards: quest.rewards
      }
    });
    objectApi.playSound('cdn/sfx-parchment-scroll-open.mp3', {
      position: objectApi.getProperty('feetPosition'),
      volume: 0.3
    });
    return;
  }

  var activeQuests = playerState.activeQuests || [];
  for (var i = 0; i < activeQuests.length; i++) {
    if (activeQuests[i].giverNpcId === objectApi.id) {
      var aq = activeQuests[i];
      var progressLines = [];
      var allDone = true;
      for (var oi = 0; oi < aq.objectives.length; oi++) {
        var obj = aq.objectives[oi];
        var done = obj.current >= obj.target;
        if (!done) allDone = false;
        progressLines.push(obj.desc + ': ' + obj.current + '/' + obj.target + (done ? ' ✓' : ''));
      }

      if (allDone) {
        objectApi.patchObjectState(other.id, {
          showQuestDialog: true,
          questDialogData: {
            id: aq.questId,
            title: aq.title,
            giverName: aq.giverName || objectApi.getState().npcName || 'Quest Giver',
            giverNpcId: objectApi.id,
            text: 'You have done well. Your task is complete — claim your reward.',
            objectives: aq.objectives,
            rewards: aq.rewards,
            turnIn: true
          }
        });
        objectApi.playSound('cdn/sfx-parchment-scroll-open.mp3', {
          position: objectApi.getProperty('feetPosition'),
          volume: 0.3
        });
      } else {
        objectApi.toast(aq.title + '\n' + progressLines.join('\n'), {
          duration: 3,
          color: 'oklch(0.65 0.15 250)',
          audience: { kind: 'player', id: other.id }
        });
        objectApi.playSound('cdn/sfx-parchment-scroll-open.mp3', {
          position: objectApi.getProperty('feetPosition'),
          volume: 0.18
        });
      }
      return;
    }
  }

  objectApi.toast('No quests available.', {
    duration: 2,
    audience: { kind: 'player', id: other.id }
  });
}

export function onDestroy(objectApi) {
  var s = objectApi.getState();
  if (s.diamondId) {
    objectApi.destroy(s.diamondId);
  }
}
