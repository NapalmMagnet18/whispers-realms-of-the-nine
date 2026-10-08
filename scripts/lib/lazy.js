// A behavior that waits to load: the real module comes by import() the first time it is needed, so it stays out of
// every arrival set (the main menu above all). The cache below is code, not state: each machine loads its own copy.
export function lazyBehavior(importer) {
  let mod = null, p = null;
  const load = () => (mod ? Promise.resolve(mod) : (p = p || importer().then((m) => (mod = m), (e) => { p = null; throw e; })));
  const fwd = (name) => (ctx, ...a) => (mod ? mod[name]?.(ctx, ...a) : load().then((m) => m[name]?.(ctx, ...a)));
  return { get: () => mod, load, fwd };
}
