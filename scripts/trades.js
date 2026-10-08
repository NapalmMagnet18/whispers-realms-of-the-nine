// WHISPERS trades, on every player's body: gathering (Mining, Herblore), crafting at trade stations (Blacksmithing,
// Alchemy, smelting) and the realm's auction house. Numbers and recipes: scripts/lib/data/trades.yml.
// Nodes: tag gather-node, state.node (a trades.yml nodes key); depletedUntil is written here, shown by scripts/gather-node.js.
// Stations: tag trade-station, state.station "forge" | "alchemy". The auction: tag auctioneer.
// Auction rows live in SQL (scripts/db.js auctions), one realm per room: a sale is one conditional UPDATE, so two
// buyers can never both win a listing; the seller's coin waits in the row until they visit the house (settled = 0).
import T from './lib/data/trades.yml';
import E from './lib/data/economy.yml';
import V from './lib/data/vanguard.yml';
import { move, purse, formatText, realmOf } from './lib/economy.js';
import { findShopItem } from '../mods/mmorpg-tools/mod-mmorpg/lib/shop-data.js';
import * as icons from '../mods/mmorpg-tools/mod-mmorpg/lib/item-icons.js';

const MNS = 'mmorpg-tools:';
const on1 = (input, n) => !!((input.pressed && input.pressed[n]) || (input.actions && input.actions[n]));
const on = (input, name) => on1(input, name) || on1(input, MNS + name);
const dataOf = (input, name) => (input.actionData && (input.actionData[name] || input.actionData[MNS + name])) || {};
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const me = (ctx) => ({ audience: { player: ctx.self.id } });
const A = T.auction;
const RECIPES = T.recipes || [];

// ── items ──
export function itemDef(id) {
  const t = T.items[id];
  if (t) return { id, name: t.name, stackable: true, sell: t.sell, description: t.description, icon: icons.iconFor({ id }) || undefined };
  const s = findShopItem(id);
  if (s) { const { price, ...rest } = s; return { ...rest }; }
  return { id, name: id, stackable: true };
}
function bag(st) { const inv = (st.inventory || []).slice(); while (inv.length < E.bagSlots) inv.push(null); return inv; }
function countOf(inv, id) { let n = 0; for (const it of inv) if (it && it.id === id) n += it.stackable ? (it.count || 1) : 1; return n; }
function take(inv, id, n) {
  for (let i = inv.length - 1; i >= 0 && n > 0; i--) {
    const it = inv[i]; if (!it || it.id !== id) continue;
    const c = it.stackable ? (it.count || 1) : 1;
    if (c <= n) { inv[i] = null; n -= c; } else { inv[i] = { ...it, count: c - n }; n = 0; }
  }
  return n === 0;
}
// put n of an item (a whole def) into inv; false (inv untouched) when it won't fit
function give(inv, def, n) {
  const work = inv.slice();
  if (!def.stackable) { for (let k = 0; k < n; k++) { const i = work.findIndex((x) => !x); if (i < 0) return false; const { count, ...d } = def; work[i] = d; } }
  else {
    let left = n;
    for (let i = 0; i < work.length && left > 0; i++) { const it = work[i]; if (it && it.id === def.id && (it.count || 1) < E.stackMax) { const add = Math.min(left, E.stackMax - (it.count || 1)); work[i] = { ...it, count: (it.count || 1) + add }; left -= add; } }
    for (let i = 0; i < work.length && left > 0; i++) if (!work[i]) { const add = Math.min(left, E.stackMax); work[i] = { ...def, count: add }; left -= add; }
    if (left > 0) return false;
  }
  for (let i = 0; i < work.length; i++) inv[i] = work[i];
  return true;
}
function float(ctx, text, color) {
  const f = ctx.self.feetPosition;
  ctx.emit('damageNumber', { position: { x: f.x, y: f.y + 2.2, z: f.z }, text, color: color || 'oklch(0.85 0.12 85)', lifetime: 1.8 }, me(ctx));
}
function knows(st, trade) { return (st.professions || []).indexOf(trade) >= 0; }
function skill(st, trade) { return (st.tradeSkill && st.tradeSkill[trade]) || 0; }
function skillUp(ctx, trade, req) {
  const st = ctx.self.state, cur = skill(st, trade);
  if (cur >= T.maxSkill) return;
  const gap = cur - req; let p = 0;
  for (const [edge, odds] of T.skillBands) if (gap < edge) { p = odds; break; }
  if (p <= 0 || ctx.random() > p) return;
  st.tradeSkill = { ...(st.tradeSkill || {}), [trade]: cur + 1 };
  st._questSave = true;
  float(ctx, trade + ' ' + (cur + 1), 'oklch(0.78 0.14 230)');
  if ((cur + 1) % 25 === 0) ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-level-up-fanfare.mp3', position: ctx.self.feetPosition, volume: 0.35 }, me(ctx));
}
// the color a recipe or node reads in: orange, yellow, green, grey (the WoW skill bands)
export function band(cur, req) { const g = cur - req; return g < 0 ? 'red' : g < 25 ? 'orange' : g < 50 ? 'yellow' : g < 75 ? 'green' : 'grey'; }

// ── gathering ──
function nodeOf(ctx) {
  const rows = ctx.query({ tags: ['gather-node'], radius: T.reach });
  for (const r of rows || []) { const h = ctx.place.objects[r.id]; if (h && !((h.state.depletedUntil || 0) > ctx.now())) return h; }
  return null;
}
function startGather(ctx, node) {
  const st = ctx.self.state, N = T.nodes[node.state.node];
  if (!N) return;
  if (!knows(st, N.trade)) return say(ctx, 'Requires ' + N.trade + '. Learn it at a trade station in the Reach.', true);
  if (skill(st, N.trade) < N.req) return say(ctx, 'Requires ' + N.trade + ' ' + N.req + ' (you have ' + skill(st, N.trade) + ').', true);
  ctx.session.gather = { node: node.id, at: ctx.now(), swung: 0, from: { ...ctx.self.feetPosition } };
}
function stopGather(ctx) { ctx.session.gather = null; ctx.self.anim.action = null; }
function stepGather(ctx) {
  const g = ctx.session.gather, node = ctx.place.objects[g.node];
  const N = node && T.nodes[node.state.node];
  if (!N || (node.state.depletedUntil || 0) > ctx.now() || flat(ctx.self.feetPosition, g.from) > T.cancelMove) return stopGather(ctx);
  const t = (ctx.now() - g.at) / 1000, swings = 3, every = T.gatherSeconds / swings;
  if (g.swung < swings && t >= g.swung * every) {
    g.swung++;
    ctx.self.anim.action = { clip: V.strike.clip, weight: 1, loop: 'once', speed: N.trade === 'Mining' ? 1 : 0.7, blendIn: 0.08 };
    const p = node.feetPosition, at = { x: p.x, y: p.y + 0.5, z: p.z }, aud = { audience: { nearby: at, radius: 30 } };
    ctx.emit('playSound', { clip: N.sound, position: at, volume: 0.5, pitch: 0.9 + ctx.random() * 0.2 }, aud);
    ctx.emit('fx', { position: at, script: N.trade === 'Mining' ? CHIPS : LEAVES }, aud);
  }
  if (t < T.gatherSeconds) return;
  stopGather(ctx);
  const st = ctx.self.state, inv = bag(st), n = 1 + (ctx.random() < 0.45 ? 1 : 0) + (ctx.random() < 0.12 ? 1 : 0);
  const def = itemDef(N.item);
  if (!give(inv, def, n)) return say(ctx, 'Your bag is full.', true);
  st.inventory = inv; st._questSave = true;
  node.state.depletedUntil = ctx.now() + N.regrow * 1000;
  float(ctx, '+' + n + ' ' + def.name);
  ctx.emit('stat', { name: N.trade === 'Mining' ? 'ore mined' : 'herbs picked', value: n }, me(ctx));
  skillUp(ctx, N.trade, N.req);
}
const CHIPS = `fx
pop chips burst=10..14 life=.4..0.8 v=sdir()*(1.5..3)+up(1.5) size=.03..0.06 acc=grav() col=<.45,.42,.4> a=1>0 floor=bounce(.3) r=sprite(soft-disc,alpha)
pop spark burst=5 life=.15..0.3 v=sdir()*(3..5) size=.02 col=hdr(4,2.5,1) a=1>0 r=sprite(ember,add,velocity,.03)`;
const LEAVES = `fx
pop leaf burst=6..9 life=.6..1.1 v=sdir()*(.6..1.2)+up(1) size=.04..0.07 acc=grav()*.3+drag(1.5) col=<.45,.6,.25> a=1>0 rot=spin(3) r=sprite(soft-disc,alpha)`;

// ── trade stations: learn, unlearn, craft ──
function stationOf(ctx) { const r = ctx.query({ tags: ['trade-station'], radius: T.reach + 0.8 }); return r && r[0] ? ctx.place.objects[r[0].id] : null; }
function say(ctx, text, bad) {
  const st = ctx.self.state;
  if (st.tradeOpen) st.tradeOpen = { ...st.tradeOpen, msg: { text, bad: !!bad, at: ctx.now() } };
  else if (st.ahOpen) st.ahOpen = { ...st.ahOpen, msg: { text, bad: !!bad, at: ctx.now() } };
  else float(ctx, text, bad ? 'oklch(0.65 0.2 30)' : null);
}
function openStation(ctx, s) {
  const st = ctx.self.state;
  const station = s.state.station || 'forge';
  const crafts = Object.keys(T.trades).filter((k) => T.trades[k].station === station);
  st.tradeOpen = { id: s.id, station, title: s.state.title || (station === 'forge' ? 'The Trade Forge' : 'Alchemist\'s Bench'), tab: crafts.some((k) => knows(st, k)) ? 'craft' : 'trades', msg: null };
  st.ahOpen = null;
  try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {}
  ctx.emit('playSound', { clip: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', position: ctx.self.feetPosition, volume: 0.35 }, me(ctx));
}
function learn(ctx, trade) {
  const st = ctx.self.state, info = T.trades[trade];
  if (!info || knows(st, trade)) return;
  const have = st.professions || [];
  if (have.length >= T.maxTrades) return say(ctx, 'You know ' + T.maxTrades + ' trades already. Unlearn one first.', true);
  if (move(ctx, -T.learnCost, 'learn:' + trade) === null) return say(ctx, 'Learning ' + trade + ' costs ' + formatText(T.learnCost) + '.', true);
  st.professions = have.concat([trade]);
  st.tradeSkill = { ...(st.tradeSkill || {}), [trade]: Math.max(1, skill(st, trade)) };
  st._questSave = true;
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-level-up-fanfare.mp3', position: ctx.self.feetPosition, volume: 0.4 }, me(ctx));
  ctx.emit('milestone', { step: 1, name: 'learned a trade' });
  say(ctx, 'You are now an apprentice of ' + trade + '.');
}
function unlearn(ctx, trade) {
  const st = ctx.self.state;
  if (!knows(st, trade)) return;
  st.professions = (st.professions || []).filter((t) => t !== trade);
  const ts = { ...(st.tradeSkill || {}) }; delete ts[trade]; st.tradeSkill = ts;
  st._questSave = true;
  say(ctx, 'You set aside ' + trade + '. Its skill is forgotten.');
}
function craft(ctx, rid, times) {
  const st = ctx.self.state, to = st.tradeOpen, r = RECIPES.find((x) => x.id === rid);
  if (!to || !r || r.station !== to.station) return;
  if (!knows(st, r.trade)) return say(ctx, 'Requires ' + r.trade + '.', true);
  if (skill(st, r.trade) < r.req) return say(ctx, 'Requires ' + r.trade + ' ' + r.req + '.', true);
  let made = 0;
  for (let k = 0; k < times; k++) {
    const inv = bag(st);
    let ok = true;
    for (const id in r.in) if (countOf(inv, id) < r.in[id]) { ok = false; break; }
    if (!ok) { if (!made) say(ctx, 'Missing materials.', true); break; }
    for (const id in r.in) take(inv, id, r.in[id]);
    const def = r.gear ? { ...r.gear, crafted: st.charName || true } : itemDef(r.out.id);
    if (!give(inv, def, r.gear ? 1 : r.out.count || 1)) { if (!made) say(ctx, 'Your bag is full.', true); break; }
    st.inventory = inv; made++;
    skillUp(ctx, r.trade, r.req);
  }
  if (!made) return;
  st._questSave = true;
  const s = ctx.place.objects[to.id], p = s ? s.feetPosition : ctx.self.feetPosition, at = { x: p.x, y: p.y + 1, z: p.z }, aud = { audience: { nearby: at, radius: 30 } };
  ctx.emit('playSound', { clip: to.station === 'forge' ? '/cdn/moodboard-painterly-fantasy/sfx-anvil-hammer-strike.mp3' : '/cdn/moodboard-painterly-fantasy/sfx-potion-bubble-brew.mp3', position: at, volume: 0.6 }, aud);
  ctx.emit('fx', { position: at, script: to.station === 'forge' ? FORGE_SPARKS : BREW }, aud);
  const name = r.gear ? r.gear.name : itemDef(r.out.id).name;
  say(ctx, 'Made ' + (made > 1 ? made + ' × ' : '') + name + '.');
  ctx.emit('stat', { name: 'items crafted', value: made }, me(ctx));
}
const FORGE_SPARKS = `fx
pop spark burst=24..34 life=.3..0.7 v=sdir()*(2..4.5)+up(2) size=.02..0.035 acc=grav() col=hdr(5,2.6,.7)>hdr(2,.6,.1) a=1>0 floor=bounce(.4) r=sprite(ember,add,velocity,.03)
pop glow burst=1 life=.3 r=light(<1,.6,.3>,20>0,5)`;
const BREW = `fx
pop bub burst=14 on=disc(.15) life=.6..1.2 v=up(.8..1.6)+sdir()*.2 size=.04..0.08 acc=drag(1) col=hdr(.8,2.2,1.4)>hdr(.4,1,1.6) a=.9>0 r=sprite(soft-disc,add)
pop glow burst=1 life=.6 r=light(<.4,1,.7>,10>0,4)`;

// ── the auction house ──
async function ensureTables(ctx) {
  if (ctx.session.ahTables) return;
  await ctx.sql`CREATE TABLE IF NOT EXISTS auctions (id INTEGER PRIMARY KEY AUTOINCREMENT, realm TEXT NOT NULL, seller TEXT NOT NULL, seller_name TEXT,
    item TEXT NOT NULL, item_id TEXT NOT NULL, item_name TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, price INTEGER NOT NULL,
    created INTEGER NOT NULL, expires INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', buyer TEXT, buyer_name TEXT, sold_at INTEGER, settled INTEGER NOT NULL DEFAULT 0)`;
  await ctx.sql`CREATE INDEX IF NOT EXISTS auctions_browse ON auctions (realm, status, expires)`;
  await ctx.sql`CREATE INDEX IF NOT EXISTS auctions_seller ON auctions (seller, realm, settled)`;
  ctx.session.ahTables = true;
}
function catOf(id, item) {
  if (item && item.slot && item.slot !== 'bag') return 'gear';
  if (/ore|bar$/.test(id)) return 'metal';
  if (T.nodes[id] || ['sunleaf', 'briarroot', 'gravebloom'].indexOf(id) >= 0) return 'herbs';
  if (/potion|oil|elixir/.test(id)) return 'potions';
  return 'goods';
}
function ahPatch(ctx, patch) { const st = ctx.self.state; if (!st.ahOpen) return; st.ahOpen = { ...st.ahOpen, ...patch }; }
function ahMsg(ctx, text, bad) { ahPatch(ctx, { msg: { text, bad: !!bad, at: ctx.now() } }); }
async function ahBrowse(ctx) {
  const st = ctx.self.state; if (!st.ahOpen) return;
  const realm = realmOf(ctx), now = ctx.now(), cat = st.ahOpen.cat || 'all';
  ahPatch(ctx, { loading: true });
  try {
    await ensureTables(ctx);
    const r = await ctx.sql`SELECT id, item, item_id, item_name, count, price, seller_name, expires, seller = @caller AS mine FROM auctions WHERE realm = ${realm} AND status = 'active' AND expires > ${now} ORDER BY item_name, CAST(price AS REAL) / count LIMIT 200`;
    const rows = [];
    for (const x of r.rows || []) {
      let it = null; try { it = JSON.parse(x.item); } catch (e) {}
      if (cat !== 'all' && catOf(x.item_id, it) !== cat) continue;
      rows.push({ id: x.id, itemId: x.item_id, name: x.item_name, count: x.count, price: x.price, seller: x.seller_name, left: x.expires - now, mine: !!x.mine, icon: icons.iconFor(it) || null, slot: it && it.slot || null, stats: it && it.stats || null });
      if (rows.length >= A.pageSize) break;
    }
    ahPatch(ctx, { rows, loading: false });
  } catch (e) { ctx.log('ah browse failed', String(e && e.message || e)); ahPatch(ctx, { loading: false }); ahMsg(ctx, 'The house ledger is closed. Try again.', true); }
}
async function ahMine(ctx) {
  const st = ctx.self.state; if (!st.ahOpen) return;
  const realm = realmOf(ctx), now = ctx.now();
  try {
    await ensureTables(ctx);
    const r = await ctx.sql`SELECT id, item, item_id, item_name, count, price, status, expires FROM auctions WHERE realm = ${realm} AND seller = @caller AND settled = 0 ORDER BY created DESC LIMIT 40`;
    const mine = (r.rows || []).map((x) => { let it = null; try { it = JSON.parse(x.item); } catch (e) {} return { id: x.id, name: x.item_name, count: x.count, price: x.price, status: x.status === 'active' && x.expires <= now ? 'expired' : x.status, left: x.expires - now, icon: icons.iconFor(it) || null }; });
    ahPatch(ctx, { mine, owed: mine.filter((m) => m.status !== 'active').length });
  } catch (e) { ctx.log('ah mine failed', String(e && e.message || e)); }
}
// sold coin and expired goods come home: each row claimed once by a conditional UPDATE
async function ahCollect(ctx, quiet) {
  const realm = realmOf(ctx), now = ctx.now();
  try {
    await ensureTables(ctx);
    const r = await ctx.sql`SELECT id, item, item_name, count, price, status FROM auctions WHERE realm = ${realm} AND seller = @caller AND settled = 0 AND (status = 'sold' OR (status = 'active' AND expires <= ${now})) LIMIT 40`;
    let coin = 0, back = 0, full = false;
    for (const x of r.rows || []) {
      if (x.status === 'sold') {
        const u = await ctx.sql`UPDATE auctions SET settled = 1 WHERE id = ${x.id} AND settled = 0 AND status = 'sold'`;
        if (u.changes === 1) { const net = x.price - Math.floor(x.price * A.cutPct / 100); coin += net; }
      } else {
        let it = null; try { it = JSON.parse(x.item); } catch (e) {}
        const inv = bag(ctx.self.state);
        if (!it || !give(inv, it, it.stackable ? x.count : 1)) { full = true; continue; }
        const u = await ctx.sql`UPDATE auctions SET settled = 1, status = 'expired' WHERE id = ${x.id} AND settled = 0 AND status = 'active' AND expires <= ${now}`;
        if (u.changes === 1) { ctx.self.state.inventory = inv; ctx.self.state._questSave = true; back++; }
      }
    }
    if (coin) move(ctx, coin, 'auction:sales');
    if (coin || back) ahMsg(ctx, (coin ? 'Sales paid: ' + formatText(coin) + ' (after the house\'s ' + A.cutPct + '%).' : '') + (back ? ' ' + back + ' expired listing' + (back > 1 ? 's' : '') + ' returned.' : ''));
    else if (full) ahMsg(ctx, 'Your bag is full: expired goods wait here.', true);
    else if (!quiet) ahMsg(ctx, 'Nothing waiting for you.');
    await ahMine(ctx);
  } catch (e) { ctx.log('ah collect failed', String(e && e.message || e)); }
}
async function ahBuy(ctx, id) {
  const st = ctx.self.state; if (!st.ahOpen || ctx.session.ahBusy) return;
  const row = (st.ahOpen.rows || []).find((x) => x.id === id);
  if (!row) return;
  if (row.mine) return ahMsg(ctx, 'That listing is yours: cancel it under My Auctions.', true);
  if (purse(st) < row.price) return ahMsg(ctx, 'Not enough money: it costs ' + formatText(row.price) + '.', true);
  ctx.session.ahBusy = true;
  const realm = realmOf(ctx), now = ctx.now();
  try {
    const g = await ctx.sql`SELECT item, count FROM auctions WHERE id = ${id} AND realm = ${realm}`;
    const x = g.rows && g.rows[0]; let it = null; try { it = x && JSON.parse(x.item); } catch (e) {}
    if (!it) { ahMsg(ctx, 'That listing is gone.', true); return ahBrowse(ctx); }
    const inv = bag(ctx.self.state);
    if (!give(inv, it, it.stackable ? x.count : 1)) return ahMsg(ctx, 'Your bag is full.', true);
    const u = await ctx.sql`UPDATE auctions SET status = 'sold', buyer = @caller, buyer_name = ${st.charName || null}, sold_at = ${now} WHERE id = ${id} AND realm = ${realm} AND status = 'active' AND expires > ${now} AND seller <> @caller`;
    if (u.changes !== 1) { ahMsg(ctx, 'Someone bought it first.', true); return ahBrowse(ctx); }
    if (move(ctx, -row.price, 'auction:buy:' + row.itemId) === null) {
      await ctx.sql`UPDATE auctions SET status = 'active', buyer = NULL, buyer_name = NULL, sold_at = NULL WHERE id = ${id} AND buyer = @caller AND settled = 0`;
      return ahMsg(ctx, 'Not enough money.', true);
    }
    ctx.self.state.inventory = inv; ctx.self.state._questSave = true;
    ctx.emit('playSound', { clip: '/cdn/handle-coins-currency-pickup-phoc2e1u.mp3', position: ctx.self.feetPosition, volume: 0.4 }, me(ctx));
    ahMsg(ctx, 'Won: ' + (row.count > 1 ? row.count + ' × ' : '') + row.name + ' for ' + formatText(row.price) + '.');
    ctx.emit('stat', { name: 'auctions won' }, me(ctx));
    await ahBrowse(ctx);
  } catch (e) { ctx.log('ah buy failed', String(e && e.message || e)); ahMsg(ctx, 'The auctioneer lost the ledger. Try again.', true); }
  finally { ctx.session.ahBusy = false; }
}
function deposit(price) { return Math.max(1, Math.floor(price * A.depositPct / 100)); }
async function ahPick(ctx, slot) {
  const st = ctx.self.state; if (!st.ahOpen) return;
  const it = bag(st)[slot];
  if (!it) return ahPatch(ctx, { pick: null });
  if (it.quest || it.questItem || it.soulbound) return ahMsg(ctx, 'That cannot be sold.', true);
  const n = it.stackable ? (it.count || 1) : 1;
  const vendor = Math.max(1, (typeof it.sell === 'number' ? it.sell : 2) * n);
  ahPatch(ctx, { pick: { slot, id: it.id, name: it.name || it.id, count: n, icon: icons.iconFor(it) || null }, price: vendor * 3 });
  try { // a suggestion: undercut the cheapest of the same thing by a copper a unit
    const r = await ctx.sql`SELECT MIN(CAST(price AS REAL) / count) AS each FROM auctions WHERE realm = ${realmOf(ctx)} AND item_id = ${it.id} AND status = 'active' AND expires > ${ctx.now()} AND seller <> @caller`;
    const each = r.rows && r.rows[0] && r.rows[0].each;
    if (each && st.ahOpen && st.ahOpen.pick && st.ahOpen.pick.slot === slot) ahPatch(ctx, { price: Math.max(A.minPrice, Math.floor(each * n) - n), market: Math.round(each * n) });
    else ahPatch(ctx, { market: null });
  } catch (e) {}
}
async function ahList(ctx) {
  const st = ctx.self.state, ao = st.ahOpen; if (!ao || !ao.pick || ctx.session.ahBusy) return;
  const price = Math.trunc(ao.price || 0);
  if (price < A.minPrice || price > A.maxPrice) return ahMsg(ctx, 'Set a price between ' + formatText(A.minPrice) + ' and ' + formatText(A.maxPrice) + '.', true);
  const inv = bag(st), it = inv[ao.pick.slot];
  if (!it || it.id !== ao.pick.id) { ahPatch(ctx, { pick: null }); return ahMsg(ctx, 'That item moved. Pick it again.', true); }
  const n = it.stackable ? (it.count || 1) : 1, dep = deposit(price);
  if (purse(st) < dep) return ahMsg(ctx, 'The deposit is ' + formatText(dep) + '.', true);
  ctx.session.ahBusy = true;
  const realm = realmOf(ctx), now = ctx.now();
  try {
    await ensureTables(ctx);
    const c = await ctx.sql`SELECT COUNT(*) AS n FROM auctions WHERE realm = ${realm} AND seller = @caller AND status = 'active'`;
    if (((c.rows && c.rows[0] && c.rows[0].n) || 0) >= A.maxListings) return ahMsg(ctx, 'You have ' + A.maxListings + ' listings up already.', true);
    inv[ao.pick.slot] = null; st.inventory = inv; st._questSave = true; // off the bag first: a failed insert puts it back
    const item = { ...it }; if (!item.stackable) delete item.count;
    try {
      await ctx.sql`INSERT INTO auctions (realm, seller, seller_name, item, item_id, item_name, count, price, created, expires) VALUES (${realm}, @caller, ${st.charName || 'Unknown'}, ${JSON.stringify(item)}, ${it.id}, ${it.name || it.id}, ${n}, ${price}, ${now}, ${now + A.hours * 3600000})`;
    } catch (e) { const back = bag(ctx.self.state); give(back, it, n); ctx.self.state.inventory = back; throw e; }
    move(ctx, -dep, 'auction:deposit');
    ahPatch(ctx, { pick: null, market: null });
    ahMsg(ctx, 'Listed ' + (n > 1 ? n + ' × ' : '') + (it.name || it.id) + ' for ' + formatText(price) + '. Deposit ' + formatText(dep) + '.');
    ctx.emit('playSound', { clip: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', position: ctx.self.feetPosition, volume: 0.35 }, me(ctx));
    ctx.emit('stat', { name: 'auctions listed' }, me(ctx));
    await ahMine(ctx);
  } catch (e) { ctx.log('ah list failed', String(e && e.message || e)); ahMsg(ctx, 'The listing didn\'t take. Your item is back in your bag.', true); }
  finally { ctx.session.ahBusy = false; }
}
async function ahCancel(ctx, id) {
  const st = ctx.self.state; if (!st.ahOpen || ctx.session.ahBusy) return;
  const realm = realmOf(ctx);
  ctx.session.ahBusy = true;
  try {
    const g = await ctx.sql`SELECT item, count FROM auctions WHERE id = ${id} AND realm = ${realm} AND seller = @caller AND status = 'active' AND settled = 0`;
    const x = g.rows && g.rows[0]; let it = null; try { it = x && JSON.parse(x.item); } catch (e) {}
    if (!it) { ahMsg(ctx, 'That listing already sold or ended.', true); return ahMine(ctx); }
    const inv = bag(ctx.self.state);
    if (!give(inv, it, it.stackable ? x.count : 1)) return ahMsg(ctx, 'Your bag is full.', true);
    const u = await ctx.sql`UPDATE auctions SET status = 'cancelled', settled = 1 WHERE id = ${id} AND seller = @caller AND status = 'active' AND settled = 0`;
    if (u.changes !== 1) { ahMsg(ctx, 'Too late: it just sold.', true); return ahMine(ctx); }
    ctx.self.state.inventory = inv; ctx.self.state._questSave = true;
    ahMsg(ctx, 'Cancelled. ' + (it.name || 'The item') + ' is back in your bag; the deposit is kept.');
    await ahMine(ctx);
  } catch (e) { ctx.log('ah cancel failed', String(e && e.message || e)); }
  finally { ctx.session.ahBusy = false; }
}
function openAH(ctx, npc) {
  const st = ctx.self.state;
  st.ahOpen = { npc: npc.id, tab: 'browse', cat: 'all', rows: [], mine: [], pick: null, price: 0, msg: null, loading: true };
  st.tradeOpen = null; st.vendorOpen = null;
  try { if (ctx.self.camera) ctx.self.camera.pointerLock = false; } catch (e) {}
  ctx.emit('playSound', { clip: '/cdn/sfx-scroll-paper-unroll-magic-r41hu1b5.mp3', position: ctx.self.feetPosition, volume: 0.35 }, me(ctx));
  ahBrowse(ctx).then(() => ahCollect(ctx, true));
}

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'tradeClose')) { st.tradeOpen = null; return; }
  if (on(input, 'tradeTab') && st.tradeOpen) { st.tradeOpen = { ...st.tradeOpen, tab: dataOf(input, 'tradeTab').tab === 'trades' ? 'trades' : 'craft' }; return; }
  if (on(input, 'tradeLearn') && st.tradeOpen) return learn(ctx, String(dataOf(input, 'tradeLearn').trade || ''));
  if (on(input, 'tradeUnlearn') && st.tradeOpen) return unlearn(ctx, String(dataOf(input, 'tradeUnlearn').trade || ''));
  if (on(input, 'tradeCraft')) { const d = dataOf(input, 'tradeCraft'); return craft(ctx, String(d.recipe || ''), Math.max(1, Math.min(20, Number(d.times) || 1))); }
  if (on(input, 'ahClose')) { st.ahOpen = null; return; }
  if (st.ahOpen) {
    if (on(input, 'ahTab')) { const t = dataOf(input, 'ahTab').tab; const tab = t === 'sell' || t === 'mine' ? t : 'browse'; ahPatch(ctx, { tab, msg: null }); if (tab === 'browse') ahBrowse(ctx); else ahMine(ctx); return; }
    if (on(input, 'ahCat')) { ahPatch(ctx, { cat: String(dataOf(input, 'ahCat').cat || 'all') }); ahBrowse(ctx); return; }
    if (on(input, 'ahRefresh')) { ahBrowse(ctx); return; }
    if (on(input, 'ahBuy')) { ahBuy(ctx, Number(dataOf(input, 'ahBuy').id)); return; }
    if (on(input, 'ahPick')) { ahPick(ctx, Number(dataOf(input, 'ahPick').slot)); return; }
    if (on(input, 'ahPrice')) { const d = Number(dataOf(input, 'ahPrice').delta) || 0; ahPatch(ctx, { price: Math.max(A.minPrice, Math.min(A.maxPrice, (st.ahOpen.price || 0) + d)) }); return; }
    if (on(input, 'ahList')) { ahList(ctx); return; }
    if (on(input, 'ahCancel')) { ahCancel(ctx, Number(dataOf(input, 'ahCancel').id)); return; }
    if (on(input, 'ahCollect')) { ahCollect(ctx, false); return; }
  }
  if (on(input, 'interact') && !st.showQuestDialog && !st.showDoorPanel && !st.vendorOpen) {
    if (ctx.session.gather) return stopGather(ctx);
    if (st.tradeOpen) { st.tradeOpen = null; return; }
    if (st.ahOpen) { st.ahOpen = null; return; }
    const au = ctx.query({ tags: ['auctioneer'], radius: 3.6 });
    if (au && au[0]) return openAH(ctx, au[0]);
    const s = stationOf(ctx); if (s) return openStation(ctx, s);
    const n = nodeOf(ctx); if (n) return startGather(ctx, n);
  }
}

export function update(ctx) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (ctx.session.gather) stepGather(ctx);
  if (ctx.now() < (ctx.session.tNext || 0)) return;
  ctx.session.tNext = ctx.now() + 250;
  if (st.tradeOpen) {
    const s = ctx.place.objects[st.tradeOpen.id];
    if (!s || flat(s.feetPosition, ctx.self.feetPosition) > 7) st.tradeOpen = null;
    else if (st.tradeOpen.msg && ctx.now() - st.tradeOpen.msg.at > 4000) st.tradeOpen = { ...st.tradeOpen, msg: null };
  }
  if (st.ahOpen) {
    const n = ctx.place.objects[st.ahOpen.npc];
    if (!n || flat(n.feetPosition, ctx.self.feetPosition) > 8) st.ahOpen = null;
    else if (st.ahOpen.msg && ctx.now() - st.ahOpen.msg.at > 6000) ahPatch(ctx, { msg: null });
  }
  // the prompt: written only when nothing else claims the line (quest-core and vendor own theirs)
  let hint = null;
  if (ctx.session.gather) hint = 'Gathering…';
  else if (!st.tradeOpen && !st.ahOpen && !st.vendorOpen && !st.showQuestDialog) {
    if (ctx.query({ tags: ['auctioneer'], radius: 3.6 }).length) hint = 'E  Browse the Auction House';
    else { const s = stationOf(ctx); if (s) hint = 'E  Use ' + (s.state.title || 'Trade Station');
      else { const n = nodeOf(ctx), N = n && T.nodes[n.state.node]; if (N) hint = 'E  ' + N.verb + ' ' + N.title + (!knows(st, N.trade) ? ' (needs ' + N.trade + ')' : skill(st, N.trade) < N.req ? ' (needs ' + N.trade + ' ' + N.req + ')' : ''); } }
  }
  if (hint !== ctx.session.hint) {
    if (hint && (!st.interactHint || st.interactHint === ctx.session.hint)) st.interactHint = hint;
    else if (!hint && st.interactHint === ctx.session.hint) st.interactHint = null;
    ctx.session.hint = hint;
  }
}
