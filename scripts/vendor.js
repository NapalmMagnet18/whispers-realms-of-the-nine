// On every player's body: E near a vendor (tag vendor, state.shop) opens the vendor window (lib/ui-vendor.js);
// vendorBuy { itemId } / vendorSell { slot } / vendorTab { tab } / vendorClose land here. Coins move through scripts/lib/economy.js.
// The "coins" ear: any machine pays this player, ctx.emit("coins", { delta, reason }, { to: playerId }) (a chest, a bounty).
import E from './lib/data/economy.yml';
import { move, purse, formatText } from './lib/economy.js';
import { migrateCopper } from '../mods/mmorpg-tools/mod-mmorpg/lib/currency.js';
import { getShopItems, findShopItem, sellPrice } from '../mods/mmorpg-tools/mod-mmorpg/lib/shop-data.js';

const on = (input, name) => !!((input.pressed && input.pressed[name]) || (input.actions && input.actions[name]));
const dataOf = (input, name) => (input.actionData && input.actionData[name]) || {};
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export const ears = {
  coins: (ctx, p) => {
    const d = Math.trunc(Number(p && p.delta) || 0);
    if (d > 0) move(ctx, d, String((p && p.reason) || 'reward'));
  },
};

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

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'vendorClose')) { st.vendorOpen = null; st.vendorMsg = null; return; }
  if (on(input, 'vendorTab') && st.vendorOpen) { st.vendorOpen = { ...st.vendorOpen, tab: dataOf(input, 'vendorTab').tab === 'sell' ? 'sell' : 'buy' }; return; }
  if (on(input, 'vendorBuy')) return buy(ctx, dataOf(input, 'vendorBuy').itemId);
  if (on(input, 'vendorSell')) return sell(ctx, Number(dataOf(input, 'vendorSell').slot));
  if (on(input, 'interact') && !st.showQuestDialog && !st.showDoorPanel) {
    if (st.vendorOpen) { st.vendorOpen = null; return; }
    const v = nearVendor(ctx);
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
