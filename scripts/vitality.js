// Health, food, death/rising, PvP zones and the Blood Pact, loaded on first need (scripts/lib/lazy.js): the logic lives in
// scripts/vitality-core.js, kept off the main menu's boot. It only acts in a PLAY place, where it is warmed on arrival.
import { lazyBehavior } from './lib/lazy.js';
import { isPlay } from './lib/places.js';
const L = lazyBehavior(() => import('./vitality-core.js'));
const want = (ctx) => isPlay(ctx.self.place) && ctx.self.state.characterCreated;
const warm = (ctx) => { if (want(ctx)) L.load().catch((e) => ctx.log('vitality load failed', String((e && e.message) || e))); };
const fwdInput = L.fwd('onInput');
export const bloodEnds = L.fwd('bloodEnds');
export const blessEnds = L.fwd('blessEnds');
export const updateSchedule = { every: { seconds: 0.25 } };
export function onInput(ctx, input) { const m = L.get(); if (m) return m.onInput(ctx, input); if (want(ctx)) return fwdInput(ctx, input); }
export function update(ctx, dt) { const m = L.get(); if (m) return m.update(ctx, dt); warm(ctx); }
