// The world's doorway (world.config.yaml engine.behaviors): onArrive fires for every way a player
// lands here (first join, rejoin, a realm link, a portal in), and onLeave for every way they go.
// The rule (creator, 2026-10-08): everyone who joins, from any link or place, starts on the realm gate
// main menu every time. The only ways past it are the menu's own: Enter World stamps _worldEnterAt,
// Create stamps _creationEnterAt; an arrival in a play place without a fresh stamp goes back to the gate.
const MENU = 'main-menu-land';
const GRACE = 20000;

export function onArrive(ctx, player) {
  if (!player || player.place === MENU) return;
  const s = player.state || {};
  const now = ctx.now();
  const viaEnter = s._worldEnterAt && now - s._worldEnterAt < GRACE;
  const viaCreate = player.place === 'character-creation-land' && s._creationEnterAt && now - s._creationEnterAt < GRACE;
  if (viaEnter || viaCreate) return;
  s.phase = 'mainMenu';
  s.characterCreated = false;
  s.menuView = 'title';
  s.realmListOpen = false;
  s.inMainMenu = true;
  try {
    const r = ctx.cross(player, MENU);
    if (r && r.crossed === false) ctx.log('menu redirect refused', { place: player.place, verdict: r.verdict });
  } catch (e) { ctx.log('menu redirect failed', { error: String(e && e.message || e) }); }
}

export function onLeave(ctx, player) {}
