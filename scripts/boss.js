// Bosses load on first need (scripts/lib/lazy.js): the AI and bosses.yml live in scripts/boss-core.js, kept out of the
// Reach's arrival set. The first update starts the load; the boss wakes a tick later.
import { lazyBehavior } from './lib/lazy.js';
const L = lazyBehavior(() => import('./boss-core.js'));
const warm = (ctx) => L.load().catch((e) => ctx.log('boss load failed', String((e && e.message) || e)));
export const onSpawn = L.fwd('onSpawn');
export const decided = L.fwd('decided');
export function update(ctx, dt) { const m = L.get(); if (m) return m.update(ctx, dt); warm(ctx); }
