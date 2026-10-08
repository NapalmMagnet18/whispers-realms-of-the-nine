// The flight behavior, loaded on first need (scripts/lib/lazy.js): the kit itself lives in scripts/flight-core.js.
import { lazyBehavior } from './lib/lazy.js';
import { isPlay } from './lib/places.js';
const L = lazyBehavior(() => import('./flight-core.js'));
const want = (ctx) => isPlay(ctx.self.place) && ctx.self.state.phase !== 'creating';
const warm = (ctx) => { if (want(ctx)) L.load().catch((e) => ctx.log('flight load failed', String((e && e.message) || e))); };
export function onInput(ctx, input) { const m = L.get(); if (m) return m.onInput?.(ctx, input); warm(ctx); }
export const updateSchedule = { every: { seconds: 0.5 } };
export function update(ctx, dt) { const m = L.get(); if (m) return m.update?.(ctx, dt); warm(ctx); }
