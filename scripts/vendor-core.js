// On every player's body: E near a vendor (tag vendor, state.shop) opens the vendor window (lib/ui-vendor.js);
// vendorBuy { itemId } / vendorSell { slot } / vendorTab { tab } / vendorClose land here. Coins move through scripts/lib/economy.js.
// The "coins" ear: any machine pays this player, ctx.emit("coins", { delta, reason }, { to: playerId }) (a chest, a bounty).
import E from './lib/data/economy.yml';
import TR from './lib/data/trainers.yml';
import { move, purse, formatText } from './lib/economy.js';
import { migrateCopper } from '../mods/mmorpg-tools/mod-mmorpg/lib/currency.js';
import { getShopItems, findShopItem, sellPrice } from '../mods/mmorpg-tools/mod-mmorpg/lib/shop-data.js';

const MNS = 'mmorpg-tools:'; // a button in the mod's ui.js arrives namespaced
const on1 = (input, n) => !!((input.pressed && input.pressed[n]) || (input.actions && input.actions[n]));
const on = (input, name) => on1(input, name) || on1(input, MNS + name);
const dataOf = (input, name) => (input.actionData && (input.actionData[name] || input.actionData[MNS + name])) || {};
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export const ears = {
  coins: (ctx, p) => coins_ear(ctx, p),
};
export function coins_ear(ctx, p) {
  const d = Math.trunc(Number(p && p.delta) || 0);
  if (d > 0) move(ctx, d, String((p && p.reason) || 'reward'));
}

function say(ctx, text, bad) { ctx.self.state.vendorMsg = { text, bad: !!bad, at: ctx.now() }; }

function nearVendor(ctx) {
  const rows = ctx.query({ tags: ['vendor'], radius: E.vendorReach });
  return rows && rows[0] ? rows[0] : null;
}

function open(ctx, v) {
  const st = ctx.self.state;
  st.vendorOpen = { npc: v.id, name: (v.state && v.state.npcName) || 'Vendor', shop: (v.state && v.state.shop) || 'general-shop', tab: 'buy' };
  st.vendorMsg = null;
  try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {}
  ctx.emit('playSound', { clip: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', position: ctx.self.feetPosition, volume: 0.35 }, { audience: { player: ctx.self.id } });
  ctx.emit('vendorGreet', { by: ctx.self.id }, { to: v.id });
}

function bag(st) {
  const inv = (st.inventory || []).slice();
  while (inv.length < E.bagSlots) inv.push(null);
  return inv;
}

function buy(ctx, itemId) {
  const st = ctx.self.state, vo = st.vendorOpen;
  if (!vo) return;
  const item = getShopItems(vo.shop).find((x) => x.id === itemId);
  if (!item) return;
  const inv = bag(st);
  let slot = item.stackable ? inv.findIndex((it) => it && it.id === item.id && (it.count || 1) < E.stackMax) : -1;
  const stack = slot >= 0;
  if (!stack) slot = inv.findIndex((it) => !it);
  if (slot < 0) return say(ctx, 'Your bag is full.', true);
  if (purse(st) < item.price) return say(ctx, 'Not enough money: ' + item.name + ' costs ' + formatText(item.price) + '.', true);
  if (move(ctx, -item.price, 'buy:' + item.id) === null) return say(ctx, 'Not enough money.', true);
  if (stack) inv[slot] = { ...inv[slot], count: (inv[slot].count || 1) + 1 };
  else { const { price, ...rest } = item; inv[slot] = item.stackable ? { ...rest, count: 1 } : rest; }
  st.inventory = inv;
  say(ctx, 'Bought ' + item.name + ' for ' + formatText(item.price) + '.');
}

function sell(ctx, slot) {
  const st = ctx.self.state;
  if (!st.vendorOpen) return;
  const inv = bag(st), it = inv[slot];
  if (!it) return;
  const each = sellPrice(it);
  if (!each) return say(ctx, 'The quartermaster won\'t buy ' + (it.name || 'that') + '.', true);
  const n = it.stackable ? (it.count || 1) : 1;
  inv[slot] = null;
  st.inventory = inv;
  move(ctx, each * n, 'sell:' + it.id + 'x' + n);
  say(ctx, 'Sold ' + (n > 1 ? n + ' × ' : '') + (it.name || it.id) + ' for ' + formatText(each * n) + '.');
}

// A discipline trainer (state.trainer): E learns the next rank if the level and the fee allow, else says what's missing.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const TRAIN_FX = `fx
pop motes burst=40 on=disc(.7) life=1..1.8 v=up(1.6..3.2)+sdir()*.3 size=.05..0.11 acc=curl(.6)+drag(.6) col=hdr(4,2.8,1)>hdr(1.6,.8,.2) a=0>.1:1>.7:.8>0 r=sprite(ember,add)
pop column burst=6 on=disc(.4) life=.9..1.3 v=up(2..3) size=.5..0.8 acc=drag(1) col=hdr(2.6,1.8,.6) a=0>.2:.6>1:0 sz=$size*(.6>1.6) r=sprite(soft-disc,add)
pop glow burst=1 life=1.2 at=disc(.1).c(1) r=light(<1,.8,.4>,8,6)`;
function train(ctx, v) {
  const st = ctx.self.state, cls = String(st.className || 'Hero'), rank = st.trained ?? 0, next = TR.ranks[rank];
  const at = { x: v.feetPosition.x, y: v.feetPosition.y + 2.3, z: v.feetPosition.z };
  const tell = (text, color) => ctx.emit('damageNumber', { position: at, text, color: color || '#e8d9b5', size: 1.1, lifetime: 2.6 }, { audience: { player: ctx.self.id } });
  const nm = (v.state && v.state.npcName) || 'Trainer';
  if (!next) return tell(nm + ': there is nothing left I can teach you.');
  if ((st.level ?? 1) < next.level) return tell(nm + ': come back at level ' + next.level + ' for ' + next.title + ' training.');
  if (purse(st) < next.copper || move(ctx, -next.copper, 'train:' + next.rank) === null) return tell(next.title + ' training costs ' + formatText(next.copper) + '.', '#ff8a70');
  st.trained = next.rank;
  const me = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 0.05, z: ctx.self.feetPosition.z };
  ctx.emit('fx', { position: me, script: TRAIN_FX }, { audience: { nearby: me, radius: 40 } });
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-class-trainer-rank-learned-choir-chime-swell.mp3', position: me, volume: 0.7 }, { audience: { nearby: me, radius: 30 } });
  ctx.emit('damageNumber', { position: { x: me.x, y: me.y + 2.4, z: me.z }, text: cls + ' ' + next.title + ' (Rank ' + ROMAN[next.rank] + '): +' + Math.round(next.rank * TR.bonus * 100) + '% damage', color: '#f2b04a', size: 1.4, lifetime: 3.2 }, { audience: { player: ctx.self.id } });
  ctx.emit('stat', { name: 'trained_rank_' + next.rank }, { audience: { player: ctx.self.id } });
}

// A banker (state.bank): E opens the vault. bankDeposit { slot } moves a bag slot in, bankWithdraw { slot } a vault slot out;
// stacks merge both ways. st.bank rides the character save (mods/mmorpg-tools/mod-mmorpg/player.js).
function vault(st) { const b = (st.bank || []).slice(0, E.bankSlots); while (b.length < E.bankSlots) b.push(null); return b; }
function shift(ctx, fromKey, toKey, slot, verb) {
  const st = ctx.self.state; if (!st.bankOpen || st.bankOpen.tab === 'guild') return;
  const from = fromKey === 'bank' ? vault(st) : bag(st), to = toKey === 'bank' ? vault(st) : bag(st), it = from[slot];
  if (!it) return;
  const all = it.stackable ? (it.count || 1) : 1;
  let left = all;
  if (it.stackable) for (let i = 0; i < to.length && left; i++) { const t = to[i]; if (t && t.id === it.id && (t.count || 1) < E.stackMax) { const n = Math.min(left, E.stackMax - (t.count || 1)); to[i] = { ...t, count: (t.count || 1) + n }; left -= n; } }
  if (left) {
    const free = to.findIndex((x) => !x);
    if (free < 0) { if (left === all) return say(ctx, (toKey === 'bank' ? 'Your vault' : 'Your bag') + ' is full.', true); from[slot] = { ...it, count: left }; }
    else { to[free] = it.stackable ? { ...it, count: left } : it; from[slot] = null; }
  } else from[slot] = null;
  st[fromKey === 'bank' ? 'bank' : 'inventory'] = from; st[toKey === 'bank' ? 'bank' : 'inventory'] = to; st._questSave = true;
  ctx.emit('playSound', { clip: verb === 'in' ? '/cdn/moodboard-painterly-fantasy/sfx-iron-vault-drawer-slide-shut.mp3' : '/cdn/moodboard-painterly-fantasy/sfx-leather-pouch-pick-up-coins-shift.mp3', volume: 0.45 }, { audience: { player: ctx.self.id } });
}
function openBank(ctx, v) {
  const st = ctx.self.state;
  st.bankOpen = { npc: v.id, name: (v.state && v.state.npcName) || 'Banker', tab: 'mine' }; st.vendorMsg = null;
  try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {}
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-heavy-vault-door-unlock-and-swing.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: { player: ctx.self.id } });
}

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'vendorClose')) { st.vendorOpen = null; st.vendorMsg = null; return; }
  if (on(input, 'bankClose')) { st.bankOpen = null; return; }
  if (on(input, 'bankDeposit')) return shift(ctx, 'inv', 'bank', Number(dataOf(input, 'bankDeposit').slot), 'in');
  if (on(input, 'bankWithdraw')) return shift(ctx, 'bank', 'inv', Number(dataOf(input, 'bankWithdraw').slot), 'out');
  if (on(input, 'vendorTab') && st.vendorOpen) { st.vendorOpen = { ...st.vendorOpen, tab: dataOf(input, 'vendorTab').tab === 'sell' ? 'sell' : 'buy' }; return; }
  if (on(input, 'vendorBuy')) return buy(ctx, dataOf(input, 'vendorBuy').itemId);
  if (on(input, 'vendorSell')) return sell(ctx, Number(dataOf(input, 'vendorSell').slot));
  if (on(input, 'interact') && !st.showQuestDialog && !st.showDoorPanel) {
    if (st.vendorOpen) { st.vendorOpen = null; return; }
    if (st.bankOpen) { st.bankOpen = null; return; }
    const v = nearVendor(ctx);
    if (v && v.state && v.state.trainer) return train(ctx, v);
    if (v && v.state && v.state.bank) return openBank(ctx, v);
    if (v && v.state && v.state.guildRegistrar) { st.showGuildPanel = true; st.guildError = null; try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {} ctx.emit('playSound', { clip: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', volume: 0.4 }, { audience: { player: ctx.self.id } }); return; }
    if (v) open(ctx, v);
  }
}

export function update(ctx) {
  const st = ctx.self.state;
  if (!ctx.session.econ) { // first tick of this visit: fold an old gold purse into copper once
    ctx.session.econ = true;
    const patch = migrateCopper(st);
    if (patch) { st.copper = patch.copper; delete st.gold; }
  }
  if (st.vendorOpen) {
    const v = ctx.getObject(st.vendorOpen.npc);
    if (!v || ctx.self.place !== 'main' || dist2(v.feetPosition, ctx.self.feetPosition) > E.vendorLeave ** 2) { st.vendorOpen = null; st.vendorMsg = null; }
  }
  if (st.vendorMsg && ctx.now() - (st.vendorMsg.at || 0) > 3500) st.vendorMsg = null;
}
