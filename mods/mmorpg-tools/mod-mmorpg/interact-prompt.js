// Shows green highlight + "Press E" prompt when a player is nearby
// CLOSEST-ONLY: coordinates with ALL other interactable objects so
// only the single nearest interactable to each player gets highlighted.
var { isNearestInteractable } = require('./lib/nearest-interactable.js');
var DEFAULT_PROMPT_RADIUS = 30;
var HIGHLIGHT_COLOR = 'oklch(0.80 0.30 140)';

export function onSpawn(api) {
  api.patchState({ promptShown: false, ringId: null });
}

export function update(api, dt) {
  if (api.getTick() % 4 !== 0) return;

  var s = api.getState();
  var radius = s.promptRadius || DEFAULT_PROMPT_RADIUS;
  var useRing = s.useGroundRing || false;
  var myPos = api.getProperty('feetPosition');
  var nearby = api.query({ tags: ['player'], radius: radius });

  if (s.promptShown && useRing && s.ringId) {
    var ringObj = api.getObject(s.ringId);
    if (!ringObj) {
      api.patchState({ promptShown: false, ringId: null });
      s = api.getState();
    }
  }

  var shouldHighlight = false;
  var playersInRange = [];

  for (var i = 0; i < nearby.length; i++) {
    var player = nearby[i];
    var playerPos = player.feetPosition;
    if (isNearestInteractable(api, api.id, myPos, playerPos, radius + 20)) {
      shouldHighlight = true;
      playersInRange.push(player);
    }
  }

  if (shouldHighlight && !s.promptShown) {
    api.highlight(api.id, { color: HIGHLIGHT_COLOR, style: 'outline' });

    if (useRing) {
      var pos = api.getProperty('feetPosition');
      var ringRadius = s.ringRadius || 4;
      var ringId = api.uniqueId('glow-ring');
      api.spawn(ringId, {
        tags: ['glow-ring', 'fx'],
        feetPosition: { x: pos.x, y: pos.y + 0.15, z: pos.z },
          primitive: { kind: 'ring', innerRadius: ringRadius - 0.35, outerRadius: ringRadius + 0.35 }, anchor: 'center', pivot: 'center',
          material: {
            color: HIGHLIGHT_COLOR,
            emissive: HIGHLIGHT_COLOR,
            emissiveIntensity: 3,
            opacity: 0.7,
            transparent: true,
            side: 'double',
            depthWrite: false
          },
          rotation: { pitch: 90 },
          physics: false
      });
      api.patchState({ ringId: ringId, promptShown: true });
    } else {
      api.patchState({ promptShown: true });
    }
    api.interactPrompt(api.id, "Press 'E' to interact");
    for (var k = 0; k < playersInRange.length; k++) {
      api.patchObjectState(playersInRange[k].id, { interactHint: "Press 'E' to interact" });
    }
  } else if (shouldHighlight && s.promptShown) {
    for (var m = 0; m < playersInRange.length; m++) {
      var pst = api.getObjectState(playersInRange[m].id);
      if (!pst || !pst.interactHint) {
        api.patchObjectState(playersInRange[m].id, { interactHint: "Press 'E' to interact" });
      }
    }
  } else if (!shouldHighlight && s.promptShown) {
    api.highlight(api.id, null);

    if (useRing) {
      var rId = s.ringId;
      if (rId) {
        try { api.destroy(rId); } catch(e) {}
        api.patchState({ ringId: null });
      }
    }
    api.interactPrompt(api.id, null);
    var allP = api.query({ tags: ['player'], radius: radius + 15 });
    for (var n = 0; n < allP.length; n++) {
      var ps = api.getObjectState(allP[n].id);
      if (ps && ps.interactHint) {
        api.patchObjectState(allP[n].id, { interactHint: null });
      }
    }
    api.patchState({ promptShown: false });
  }
}

export function onDestroy(api) {
  var s = api.getState();
  if (s.promptShown) {
    api.highlight(api.id, null);
    if (s.useGroundRing && s.ringId) {
      try { api.destroy(s.ringId); } catch(e) {}
    }
    var cleanRadius = (s.promptRadius || DEFAULT_PROMPT_RADIUS) + 8;
    var allP = api.query({ tags: ['player'], radius: cleanRadius });
    for (var j = 0; j < allP.length; j++) {
      var ps = api.getObjectState(allP[j].id);
      if (ps && ps.interactHint) api.patchObjectState(allP[j].id, { interactHint: null });
    }
  }
}
