// The world's doorway (world.config.yaml engine.behaviors): onArrive fires for every way a player
// lands here (first join, rejoin, a portal in), and onLeave for every way they go.
export function onArrive(ctx, player) {
  try { ctx.log('arrive', { place: player.place, arrival: player.arrival, phase: player.state && player.state.phase }); } catch (e) {}
}

export function onLeave(ctx, player) {}
