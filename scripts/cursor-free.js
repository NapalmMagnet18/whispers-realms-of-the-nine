// Frees the mouse cursor while a clickable panel is open (quest giver, turn-in, vendor, flight map),
// so a pointer-locked player can click Accept / Buy / a roost without pressing Esc first.
// It gives the lock back when the panel closes; the next click on the world re-locks.
export const updateSchedule = { every: 3 };

function panelOpen(st) {
  return !!(st.showQuestDialog || st.vendorOpen || st.flightMap);
}

export function update(ctx) {
  const self = ctx.self;
  if (!self.isLocal) return;
  const open = panelOpen(self.state || {});
  if (open === ctx.session._cursorFree) return;
  ctx.session._cursorFree = open;
  const cam = self.camera;
  if (!cam) return;
  cam.pointerLock = !open;
}
