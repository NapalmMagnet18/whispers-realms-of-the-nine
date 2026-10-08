// Shops, trainers, bank and the "coins" ear, loaded on first need (scripts/lib/lazy.js): the logic lives in
// scripts/vendor-core.js, kept off the main menu's boot. A press made before it lands is replayed once it does.
import { lazyBehavior } from './lib/lazy.js';
const L = lazyBehavior(() => import('./vendor-core.js'));
const want = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
const warm = (ctx) => { if (want(ctx)) L.load().catch((e) => ctx.log('vendor load failed', String((e && e.message) || e))); };
const fwdInput = L.fwd('onInput');
export const ears = { coins: L.fwd('coins_ear') };
export function onInput(ctx, input) { const m = L.get(); if (m) return m.onInput(ctx, input); if (want(ctx)) return fwdInput(ctx, input); }
export function update(ctx, dt) { const m = L.get(); if (m) return m.update(ctx, dt); warm(ctx); ctx.sleep(1); }
