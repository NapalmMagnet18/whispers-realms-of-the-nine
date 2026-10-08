import { isPlay } from './lib/places.js';
// On every player's body: the quest behavior, kept off the menu's boot. The logic (and quests.yml, townsfolk.yml,
// quest-data) lives in scripts/quest-core.js and is import()ed the first tick a created hero stands in main or the
// Hollowcrypt; until it lands (well under a second) a press is simply not handled yet. ears.kill needs no tables: here.
const inWorld = (ctx) => isPlay(ctx.self.place) && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
let core = null, pending = null;
function load() {
  if (core || pending) return;
  pending = import('./quest-core.js').then((m) => { core = m; }, () => { pending = null; });
}
export const ears = {
  kill: (ctx, k) => {
    const st = ctx.self.state, tk = String((k && k.tally) || ''), xp = Math.max(0, Math.trunc(Number(k && k.xp) || 0));
    if (tk) st.tally = { ...(st.tally || {}), [tk]: ((st.tally || {})[tk] || 0) + 1 };
    if (xp) st.xp = (typeof st.xp === 'number' ? st.xp : 0) + xp;
    st._questSave = true;
  },
};

export function onInput(ctx, input) {
  if (!inWorld(ctx)) return;
  if (!core) return load();
  return core.onInput(ctx, input);
}

export function update(ctx, dt) {
  if (!inWorld(ctx)) return;
  if (!core) return load();
  return core.update(ctx, dt);
}
