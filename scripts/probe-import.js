// temporary probe: does a behavior's import() of a yml resolve?
export function onSpawn(ctx) { ctx.self.state.t0 = ctx.now(); import('./lib/data/quests.yml').then((m) => { const d = m.default || m; ctx.log('probe ok', { n: Object.keys(d).length, has: !!d['Q001'] }); }, (e) => ctx.log('probe fail', { e: String(e) })) }
