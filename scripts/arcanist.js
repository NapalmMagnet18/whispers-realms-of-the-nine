// The arcanist behavior, loaded on first need (scripts/lib/lazy.js): the kit itself lives in scripts/arcanist-core.js.
import { lazyBehavior } from './lib/lazy.js';
import { isPlay } from './lib/places.js';
const L = lazyBehavior(() => import('./arcanist-core.js'));
const want = (ctx) => isPlay(ctx.self.place) && ctx.self.state.phase !== 'creating' && String(ctx.self.state.className || 'vanguard').toLowerCase() === 'arcanist';
const warm = (ctx) => { if (want(ctx)) L.load().catch((e) => ctx.log('arcanist load failed', String((e && e.message) || e))); };
export function onInput(ctx, input) { const m = L.get(); if (m) return m.onInput?.(ctx, input); warm(ctx); }
export function update(ctx, dt) { const m = L.get(); if (m) { if (m.update) return m.update(ctx, dt); ctx.sleep(30); return; } warm(ctx); ctx.sleep(1); }
export const release = L.fwd('release');
export const wardEnd = L.fwd('wardEnd');
export const endAction = L.fwd('endAction');
export const callStar = L.fwd('callStar');
export const starLands = L.fwd('starLands');
