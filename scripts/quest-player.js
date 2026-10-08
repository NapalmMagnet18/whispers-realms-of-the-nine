import { isPlay } from './lib/places.js';
import GEAR from './lib/data/gear.yml';
import { statsFor } from './lib/leveling.js';
// On every player's body: the quest behavior, kept off the menu's boot. The logic (and quests.yml, townsfolk.yml,
// quest-data) lives in scripts/quest-core.js and is import()ed the first tick a created hero stands in main or the
// Hollowcrypt; until it lands (well under a second) a press is simply not handled yet. ears.kill needs no tables: here.
const inWorld = (ctx) => isPlay(ctx.self.place) && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
let core = null, pending = null;
function load() {
  if (core || pending) return;
  pending = import('./quest-core.js').then((m) => { core = m; }, () => { pending = null; });
}
export const ears = {
  kill: (ctx, k) => {
    const st = ctx.self.state, tk = String((k && k.tally) || ''), xp = Math.max(0, Math.trunc(Number(k && k.xp) || 0));
    if (tk) st.tally = { ...(st.tally || {}), [tk]: ((st.tally || {})[tk] || 0) + 1 };
    if (xp) st.xp = (typeof st.xp === 'number' ? st.xp : 0) + xp;
    if (k && k.loot) loot(ctx, String(k.loot));
    st._questSave = true;
  },
};
// one piece of boss gear per hero per boss per week (gear.yml); a full bag keeps it owed like a quest reward
function loot(ctx, boss) {
  const table = GEAR.loot?.[boss]; if (!table?.length) return;
  const st = ctx.self.state, week = Math.floor(ctx.now() / ((GEAR.lockoutDays || 7) * 86400000));
  const lk = st.lockouts || {};
  const at = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.6, z: ctx.self.feetPosition.z };
  if (lk[boss] === week) { ctx.emit('damageNumber', { position: at, text: 'Saved to this boss until the week turns', color: '#b8a888', size: 0.9, lifetime: 2.2 }, { audience: { player: ctx.self.id } }); return; }
  st.lockouts = { ...lk, [boss]: week };
  const id = table[Math.floor(ctx.random() * table.length) % table.length], def = GEAR.items[id];
  const item = { id, name: def.name, slot: def.slot, ilvl: def.ilvl, tier: def.tier, stats: def.stats, icon: def.icon, description: def.description, count: 1 };
  const inv = (st.inventory || []).slice(); while (inv.length < 30) inv.push(null);
  const i = inv.findIndex((x) => !x);
  if (i < 0) st.owedItems = [...(st.owedItems || []), id]; else { inv[i] = item; st.inventory = inv; }
  const tier = GEAR.tiers?.[def.tier] || {};
  ctx.emit('damageNumber', { position: at, text: `${def.name}  ·  ilvl ${def.ilvl}`, color: tier.color || '#c9a46a', size: 1.4, lifetime: 3.2 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-epic-loot-drop-chime.mp3', position: at, volume: 0.8 }, { audience: { player: ctx.self.id } });
  ctx.emit('screenFlash', { color: tier.color || '#c9a46a', duration: 0.35, intensity: 0.25 }, { audience: { player: ctx.self.id } });
  ctx.emit('stat', { name: 'raid-loot' }, { audience: { player: ctx.self.id } });
}
// worn gear's stamina (gear.yml) rides on top of the level's health; checked once a second, written only on change
function gearHealth(ctx) {
  const st = ctx.self.state, now = ctx.now();
  if (now < (ctx.session.gearAt || 0)) return; ctx.session.gearAt = now + 1000;
  let sta = 0; for (const it of Object.values(st.equipment || {})) sta += Number(it?.stats?.stamina) || 0;
  const want = statsFor(st.level || 1).maxHealth + sta;
  if (st.maxHealth !== want) { const was = st.maxHealth || want; st.maxHealth = want; if ((st.health ?? want) > want) st.health = want; else if (want > was && st.health != null && !st.dying) st.health = Math.min(want, st.health + (want - was)); }
}

export function onInput(ctx, input) {
  if (!inWorld(ctx)) return;
  if (!core) return load();
  return core.onInput(ctx, input);
}

export function update(ctx, dt) {
  if (!inWorld(ctx)) return;
  gearHealth(ctx);
  if (!core) return load();
  return core.update(ctx, dt);
}
