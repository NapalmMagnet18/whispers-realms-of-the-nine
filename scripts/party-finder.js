// A Party Finder board's face (child panel with the ui). A QUEUE click toggles the presser in world.state.lfg[dungeon];
// places/main/sim.js matches the queues and carries groups in. The board only joins and leaves; it never crosses anyone.
import F from "./lib/data/finder.yml";
function tell(ctx, pid, text, color) {
  const p = ctx.self.worldFeetPosition ?? ctx.self.feetPosition;
  ctx.emit("damageNumber", { position: { x: p.x, y: p.y + 1.6, z: p.z }, text, color: color || "#e8d9b5", size: 1.1, lifetime: 2.6 }, { audience: { player: pid } });
}
export function onSpawn(ctx) {
  for (const d of F.dungeons) ctx.on("ui:q-" + d.id, (ctx, { by }) => {
    const hero = by && ctx.getObject(by);
    if (!hero) return;
    const s = hero.state || {};
    if (!s.characterCreated) return;
    const lfg = (ctx.world.state.lfg ??= {});
    const q = { ...(lfg[d.id] || {}) };
    if (q[by]) { delete q[by]; lfg[d.id] = q; return tell(ctx, by, "Left the queue for " + d.name + "."); }
    if ((s.level || 1) < d.minLevel) return tell(ctx, by, d.name + " needs level " + d.minLevel + ".", "#ff8a70");
    for (const k of Object.keys(lfg)) if (lfg[k] && lfg[k][by]) { const o = { ...lfg[k] }; delete o[by]; lfg[k] = o; } // one queue at a time
    q[by] = ctx.now(); lfg[d.id] = q;
    ctx.emit("playSound", { clip: "/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3", position: hero.feetPosition, volume: 0.4 }, { audience: { player: by } });
    tell(ctx, by, "Queued for " + d.name + " (" + Object.keys(q).length + "/" + d.size + ")", "#f2b04a");
  });
}
