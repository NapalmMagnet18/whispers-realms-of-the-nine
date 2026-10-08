// =====================================================================
//  MENU CAMERA — MMORPG Tools Mod
//  Player behavior that activates cinematic orbit camera
//  when the player is in "main-menu-land" place.
//
//  Pattern: detect place in update(), call setCamera() with a state flag,
//  clearCamera() on exit. Also hides the player model while in the menu.
// =====================================================================

let inMenu = false;

export function update(api, dt) {
  const place = api.getEntityPlace(api.id);
  const nowInMenu = place === 'main-menu-land';

  if (nowInMenu && !inMenu) {
    // Entering main-menu-land — activate cinematic orbit
    inMenu = true;
    // Set flag on player state so camera behavior can read it
    api.patchState({ _cinematicOrbit: true, _cinematicTime: 0 });
    // Disable pointer lock for menu
    api.setCamera({ pointerLock: false });
    // Hide the player model and park at origin so physics doesn't drift
    api.setProperty('visible', false);
    api.setProperty('feetPosition', { x: 0, y: 0.1, z: 0 });
    api.patchState({ velocity: { x: 0, y: 0, z: 0 } });
  } else if (nowInMenu && inMenu) {
    // Already in menu — just keep player parked so character controller doesn't drift
    api.setProperty('feetPosition', { x: 0, y: 0.1, z: 0 });
    api.patchState({ velocity: { x: 0, y: 0, z: 0 } });
  } else if (!nowInMenu && inMenu) {
    // Leaving main-menu-land — restore normal camera
    inMenu = false;
    api.patchState({ _cinematicOrbit: false, _cinematicTime: 0 });
    api.clearCamera({ transition: { duration: 0.6, ease: 'easeInOut' } });
    // Show the player model again
    api.setProperty('visible', true);
  }
}
