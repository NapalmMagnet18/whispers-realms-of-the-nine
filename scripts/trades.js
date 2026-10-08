// Thin door to scripts/trades-core.js: gathering, crafting and the auction house load on a hero's first
// tick in main, never in the menu or character creation, so the front door's boot stays light.
let core = null, loading = false;
const ready = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
function load() { if (core || loading) return; loading = true; import('./trades-core.js').then((m) => { core = m; }, () => { loading = false; }); }
export function onInput(ctx, input) { if (!ready(ctx)) return; if (core) return core.onInput(ctx, input); load(); }
export function update(ctx, dt) { if (!ready(ctx)) return; if (core) return core.update(ctx, dt); load(); }
