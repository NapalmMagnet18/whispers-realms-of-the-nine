// The wolf packs load on first need: the den manager lives in scripts/wolves-core.js (lib/lazy.js), kept out of the
// Reach's arrival set. The first update starts the load; the pack wakes a tick later.
import { lazyBehavior } from './lib/lazy.js';
const L = lazyBehavior(() => import('./wolves-core.js'));
const warm = (ctx) => L.load().catch((e) => ctx.log('wolves load failed', String((e && e.message) || e)));
export function update(ctx, dt) { const m = L.get(); if (m) return m.update(ctx, dt); warm(ctx); }
