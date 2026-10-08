// === Third-person orbit camera — MMORPG Tools Mod ===
// Sphere-cast, single asymmetric spring, smooth FP blend
// Identical to Final Abyss camera — camera is already generic

// --- Constants ---
var DEFAULT_DIST = 7;
var MIN_DIST = 1.5;
var MAX_DIST = 20;
var FP_BLEND_DIST = 2.0;
var HIDE_PLAYER_DIST = 0.5;
var HEIGHT_OFFSET = 1.8;
var LOOK_OFFSET_Y = 1.5;
var MIN_PITCH = -1.05;
var MAX_PITCH = 1.22;
var SENSITIVITY = 5.5;
var ZOOM_SENS = 1.5;
var CAMERA_RADIUS = 0.25;
var COLLISION_PAD = 0.15;
var TERRAIN_SAMPLES = 6;
var EYE_HEIGHT = 1.8;

// Spring-arm: pull-in fast (wall appeared), push-out moderate
var PULL_IN_RATE = 20.0;
var PUSH_OUT_RATE = 4.0;
var PUSH_OUT_DEADBAND = 0.15;

// --- Math utilities ---
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function sphericalToDir(yaw, pitch) {
  var cp = Math.cos(pitch);
  return { x: Math.sin(yaw) * cp, y: Math.sin(pitch), z: Math.cos(yaw) * cp };
}

// --- Cinematic orbit constants ---
var CINEMATIC_RADIUS = 18;
var CINEMATIC_HEIGHT = 8;
var CINEMATIC_PERIOD = 90;
var CINEMATIC_LOOK_Y = 2.0;

// --- Input handler ---
export function onInput(api, input) {
  var s = api.getState();
  var ct = api.getControlTarget();
  // Skip ALL input during character creation — camera-creation.js handles it
  if (ct && ct.state && ct.state.phase === 'creating') return;
  // Skip all mouse input during cinematic orbit (main menu)
  if (ct && ct.state && ct.state._cinematicOrbit && ct.state.phase !== 'playing' && !ct.state.characterCreated) return;

  // Freeze camera orbit while interaction panels are open
  if (ct && ct.state && (ct.state.showDoorPanel || ct.state.showQuestDialog || ct.state.vampireDialog || ct.state.cursedItemDialog || ct.state.spellDragActive)) return;

  var lookX = input.axes.lookX || 0;
  var lookY = input.axes.lookY || 0;
  var bothMouse = (input.actions.mouseLeft && input.actions.mouseRight) ? 2.0 : 1.0;
  var sens = SENSITIVITY * bothMouse;
  var yaw = (typeof s.yaw === 'number' ? s.yaw : 0) - lookX * sens;
  var pitch = clamp(
    (typeof s.pitch === 'number' ? s.pitch : 0.3) + lookY * sens,
    MIN_PITCH,
    MAX_PITCH
  );
  var zoomDelta = input.axes.zoomIn || 0;
  var desiredDist = clamp(
    (typeof s.desiredDist === 'number' ? s.desiredDist : DEFAULT_DIST) - zoomDelta * ZOOM_SENS,
    MIN_DIST,
    MAX_DIST
  );
  api.patchState({ yaw: yaw, pitch: pitch, desiredDist: desiredDist });
}

// --- Update ---
export function update(api, dt) {
  var target = api.getControlTarget();

  // === CHARACTER CREATION — position camera to view preview model ===
  if (target && target.state && target.state.phase === 'creating') {
    var tp = target.feetPosition;
    api.setProperty('feetPosition', { x: tp.x - 3.5, y: 2.8, z: tp.z });
    api.lookAt({ x: tp.x + 1.3, y: 2.2, z: tp.z });
    api.patchState({ _hideLocalPlayer: true });
    return;
  }

  // === CINEMATIC ORBIT MODE ===
  var cinematicOrbit = target && target.state && target.state._cinematicOrbit;
  if (cinematicOrbit) {
    if (target.state.phase === 'playing' || target.state.characterCreated) {
      cinematicOrbit = false;
    }
  }
  if (cinematicOrbit) {
    var s = api.getState();
    var cTime = (typeof s._cinematicTime === 'number' ? s._cinematicTime : 0) + dt;
    var angle = (cTime / CINEMATIC_PERIOD) * 2 * Math.PI;
    var camX = Math.cos(angle) * CINEMATIC_RADIUS;
    var camZ = Math.sin(angle) * CINEMATIC_RADIUS;
    var camY = CINEMATIC_HEIGHT;

    api.setProperty('feetPosition', { x: camX, y: camY, z: camZ });
    api.lookAt({ x: 0, y: CINEMATIC_LOOK_Y, z: 0 });
    api.patchState({ _cinematicTime: cTime, _hideLocalPlayer: true });
    return;
  }

  if (!target) return;

  // === FORCED CAMERA ANGLE ===
  if (target.state && typeof target.state._forceCameraYaw === 'number') {
    api.patchState({
      yaw: target.state._forceCameraYaw,
      pitch: typeof target.state._forceCameraPitch === 'number' ? target.state._forceCameraPitch : 0.3
    });
  }

  var s = api.getState();
  var yaw = typeof s.yaw === 'number' ? s.yaw : 0;
  var pitch = typeof s.pitch === 'number' ? s.pitch : 0.3;
  var desiredDist = typeof s.desiredDist === 'number' ? s.desiredDist : DEFAULT_DIST;
  var currentDist = typeof s.currentDist === 'number' ? s.currentDist : desiredDist;

  var pos = target.feetPosition;
  var orbitX = pos.x;
  var orbitY = pos.y + HEIGHT_OFFSET;
  var orbitZ = pos.z;
  var dir = sphericalToDir(yaw, pitch);

  // === COLLISION ===
  var safeDist = desiredDist;

  var hit = api.raycast(
    { x: orbitX, y: orbitY, z: orbitZ },
    { x: dir.x, y: dir.y, z: dir.z },
    { maxDistance: desiredDist + CAMERA_RADIUS, radius: CAMERA_RADIUS }
  );
  if (hit) safeDist = Math.min(safeDist, Math.max(0, hit.distance - COLLISION_PAD));

  // Terrain sampling for upward-angled cameras
  if (dir.y >= -0.1) {
    for (var i = 1; i <= TERRAIN_SAMPLES; i++) {
      var t = (i / TERRAIN_SAMPLES) * desiredDist;
      var sY = orbitY + dir.y * t;
      var tY = api.getTerrainHeight(orbitX + dir.x * t, orbitZ + dir.z * t);
      if (sY < tY + COLLISION_PAD) {
        safeDist = Math.min(safeDist, Math.max(0, t - desiredDist / TERRAIN_SAMPLES));
        break;
      }
    }
  }

  // === SPRING-ARM ===
  var targetDist = safeDist;
  var pulling = targetDist < currentDist;

  if (!pulling && targetDist - currentDist < PUSH_OUT_DEADBAND) {
    targetDist = currentDist;
  }

  var rate = pulling ? PULL_IN_RATE : PUSH_OUT_RATE;
  currentDist = currentDist + (targetDist - currentDist) * (1.0 - Math.exp(-rate * dt));
  currentDist = Math.max(0, currentDist);

  // Floor cap: don't go below terrain
  if (dir.y < -0.1) {
    var gY = api.getTerrainHeight(orbitX, orbitZ) + CAMERA_RADIUS;
    if (orbitY > gY) currentDist = Math.min(currentDist, Math.max(0, (gY - orbitY) / dir.y));
  }

  // === POSITION + ORIENT ===
  var blend = 1.0 - clamp(currentDist / FP_BLEND_DIST, 0, 1);
  blend *= blend;
  var tpX = orbitX + dir.x * currentDist;
  var tpY = orbitY + dir.y * currentDist;
  var tpZ = orbitZ + dir.z * currentDist;
  var fpX = pos.x,
    fpY = pos.y + EYE_HEIGHT,
    fpZ = pos.z;
  var camX = tpX + (fpX - tpX) * blend;
  var camY = tpY + (fpY - tpY) * blend;
  var camZ = tpZ + (fpZ - tpZ) * blend;
  camY = Math.max(camY, api.getTerrainHeight(camX, camZ) + CAMERA_RADIUS);

  api.setProperty('feetPosition', { x: camX, y: camY, z: camZ });

  var tpLY = orbitY + LOOK_OFFSET_Y - HEIGHT_OFFSET;
  var fpLD = sphericalToDir(yaw, pitch);
  var lX = orbitX + (camX - fpLD.x * 10 - orbitX) * blend;
  var lY = tpLY + (camY - fpLD.y * 10 - tpLY) * blend;
  var lZ = orbitZ + (camZ - fpLD.z * 10 - orbitZ) * blend;
  api.lookAt({ x: lX, y: lY, z: lZ });

  api.patchState({
    currentDist: currentDist,
    _hideLocalPlayer: currentDist < HIDE_PLAYER_DIST,
  });
}
