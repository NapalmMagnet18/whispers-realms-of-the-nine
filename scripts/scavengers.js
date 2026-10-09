// Scavenger and raider camps load on first need: the camp manager lives in scripts/scavengers-core.js (lib/lazy.js),
// kept out of the Reach's arrival set. The first update starts the load; the camp wakes a tick later.
import { lazyBehavior } from './lib/lazy.js';
const L = lazyBehavior(() => import('./scavengers-core.js'));
const warm = (ctx) => L.load().catch((e) => ctx.log('scavengers load failed', String((e && e.message) || e)));
export function update(ctx, dt) { const m = L.get(); if (m) return m.update(ctx, dt); warm(ctx); }
