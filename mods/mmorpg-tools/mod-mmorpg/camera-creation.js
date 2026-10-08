// Camera behavior overlay for character creation — MMORPG Tools Mod
// Works WITH camera.js — directly positions the camera via setProperty + lookAt
// so it stays locked on the preview model during creation.

// Locked creation camera values:
var CREATION_YAW = -1.57;       // radians — camera west of player, looking east
var CREATION_PITCH = 0.08;      // radians — slight upward tilt
var CREATION_DIST = 2.8;        // meters
var CREATION_HEIGHT_OFFSET = 1.05;

// Player position (camera orbits around this)
var PLAYER_X = 83.168;
var PLAYER_Y = 1.229;
var PLAYER_Z = 10.812;

export function isInCreationPhase(cameraApi) {
  var target = cameraApi.getControlTarget();
  if (!target || !target.state) return false;
  return target.state.phase === 'creating';
}

export function onInput(cameraApi, input) {
  // Block all input during creation — don't let mouse move the camera
  if (!isInCreationPhase(cameraApi)) return;
}

export function update(cameraApi, dt) {
  if (!isInCreationPhase(cameraApi)) return;

  // Orbit center is the player position + height offset
  var orbitX = PLAYER_X;
  var orbitY = PLAYER_Y + CREATION_HEIGHT_OFFSET;
  var orbitZ = PLAYER_Z;

  // Spherical offset from orbit center
  var cp = Math.cos(CREATION_PITCH);
  var dirX = Math.sin(CREATION_YAW) * cp;
  var dirY = Math.sin(CREATION_PITCH);
  var dirZ = Math.cos(CREATION_YAW) * cp;

  var camX = orbitX + dirX * CREATION_DIST;
  var camY = orbitY + dirY * CREATION_DIST;
  var camZ = orbitZ + dirZ * CREATION_DIST;

  cameraApi.setProperty('feetPosition', { x: camX, y: camY, z: camZ });
  cameraApi.lookAt({ x: orbitX, y: orbitY, z: orbitZ });
}
