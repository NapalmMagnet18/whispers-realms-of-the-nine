// Loaded on first need by scripts/guild.js (the thin stub on every body).
// On every player's body: the guild system. Guilds and their shared vault live in SQL, one realm per room:
//   guilds (realm, name_key) with vault JSON + ver (every vault write is one conditional UPDATE on ver, so two
//   members moving the same stack at once can never duplicate it); guild_members (realm, user_id, char_name).
// Actions (mod ui): createGuild {guildName}, confirmJoinGuild {name}, guildInvite {targetName}, guildAcceptInvite,
// guildDeclineInvite, leaveGuild/guildLeave, guildKick {targetName}, openGuildJoin, closeGuildJoin, closeGuildPanel,
// toggleGuildInviteInput, toggleGuildCreation; the banker's guild tab: bankTab {tab}, guildVaultDeposit {slot}, guildVaultWithdraw {slot}.
// State it writes: guildName, guildRole, guildRoster [{name, role}], guildError, pendingGuildInvite, bankOpen.tab/guild.
import E from './data/economy.yml';
import { move, purse, formatText, realmOf } from './economy.js';

const MNS = 'mmorpg-tools:';
const on1 = (input, n) => !!((input.pressed && input.pressed[n]) || (input.actions && input.actions[n]));
const on = (input, name) => on1(input, name) || on1(input, MNS + name);
const dataOf = (input, name) => (input.actionData && (input.actionData[name] || input.actionData[MNS + name])) || {};
const keyOf = (n) => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ');
const me = (ctx) => String(ctx.self.state.charName || ctx.self.state.characterName || 'Unnamed');

async function tables(ctx) {
  if (ctx.session.guildTables) return;
  await ctx.sql`CREATE TABLE IF NOT EXISTS guilds (realm TEXT NOT NULL, name_key TEXT NOT NULL, name TEXT NOT NULL, leader_user TEXT, leader_name TEXT,
    created INTEGER NOT NULL, vault TEXT NOT NULL DEFAULT '[]', ver INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (realm, name_key))`;
  await ctx.sql`CREATE TABLE IF NOT EXISTS guild_members (realm TEXT NOT NULL, name_key TEXT NOT NULL, user_id TEXT NOT NULL, char_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', joined INTEGER NOT NULL, PRIMARY KEY (realm, user_id, char_name))`;
  await ctx.sql`CREATE INDEX IF NOT EXISTS guild_members_by_guild ON guild_members (realm, name_key)`;
  ctx.session.guildTables = true;
}
const err = (ctx, text) => { ctx.self.state.guildError = text; tellSelf(ctx, text, '#ff8a70'); };
function tellSelf(ctx, text, color) {
  const p = ctx.self.feetPosition;
  ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.4, z: p.z }, text, color: color || '#c9a0ff', size: 1, lifetime: 2.8 }, { audience: { player: ctx.self.id } });
}
function chime(ctx, clip) { ctx.emit('playSound', { clip, position: ctx.self.feetPosition, volume: 0.55 }, { audience: { player: ctx.self.id } }); }
const JOIN_SFX = '/cdn/moodboard-painterly-fantasy/sfx-guild-banner-unfurl-horn-swell.mp3';
const run = (ctx, p) => { p.catch((e) => { ctx.log('guild failed', String(e && e.message || e)); err(ctx, 'The guild ledger is closed. Try again.'); }); };

function enter(ctx, name, role) {
  const st = ctx.self.state;
  st.guildName = name; st.guildRole = role; st.guildError = null; st.showGuildJoinModal = false; st.showGuildCreation = false;
  st.pendingGuildInvite = null; st._questSave = true;
  chime(ctx, JOIN_SFX);
  tellSelf(ctx, (role === 'leader' ? 'You founded ' : 'You joined ') + '<' + name + '>', '#f2b04a');
  ctx.session.rosterAt = 0;
}
function exit(ctx, why) {
  const st = ctx.self.state;
  st.guildName = null; st.guildRole = null; st.guildRoster = null; st._questSave = true;
  if (st.bankOpen && st.bankOpen.tab === 'guild') st.bankOpen = { ...st.bankOpen, tab: 'mine', guild: null };
  if (why) tellSelf(ctx, why);
}

async function create(ctx, raw) {
  const st = ctx.self.state, name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (st.guildName) return err(ctx, 'Leave <' + st.guildName + '> first.');
  if (!/^[A-Za-z][A-Za-z' ]{2,23}$/.test(name)) return err(ctx, 'A guild name is 3 to 24 letters.');
  if (purse(st) < E.guildFee) return err(ctx, 'A guild charter costs ' + formatText(E.guildFee) + '.');
  await tables(ctx);
  const realm = realmOf(ctx), now = ctx.now(), k = keyOf(name);
  const r = await ctx.sql`INSERT OR IGNORE INTO guilds (realm, name_key, name, leader_user, leader_name, created) VALUES (${realm}, ${k}, ${name}, @caller, ${me(ctx)}, ${now})`;
  if (r.changes !== 1) return err(ctx, 'A guild named ' + name + ' already stands on this realm.');
  if (move(ctx, -E.guildFee, 'guild:charter') === null) { await ctx.sql`DELETE FROM guilds WHERE realm = ${realm} AND name_key = ${k} AND leader_user = @caller`; return err(ctx, 'Not enough money.'); }
  await ctx.sql`INSERT OR REPLACE INTO guild_members (realm, name_key, user_id, char_name, role, joined) VALUES (${realm}, ${k}, @caller, ${me(ctx)}, 'leader', ${now})`;
  enter(ctx, name, 'leader');
}
async function join(ctx, raw) {
  const st = ctx.self.state;
  if (st.guildName) return err(ctx, 'Leave <' + st.guildName + '> first.');
  await tables(ctx);
  const realm = realmOf(ctx), g = (await ctx.sql`SELECT name, name_key FROM guilds WHERE realm = ${realm} AND name_key = ${keyOf(raw)}`).rows[0];
  if (!g) return err(ctx, 'No guild by that name on this realm.');
  await ctx.sql`INSERT OR REPLACE INTO guild_members (realm, name_key, user_id, char_name, role, joined) VALUES (${realm}, ${g.name_key}, @caller, ${me(ctx)}, 'member', ${ctx.now()})`;
  enter(ctx, g.name, 'member');
}
async function leave(ctx) {
  const st = ctx.self.state; if (!st.guildName) return;
  await tables(ctx);
  const realm = realmOf(ctx), k = keyOf(st.guildName);
  const others = (await ctx.sql`SELECT user_id, char_name FROM guild_members WHERE realm = ${realm} AND name_key = ${k} AND NOT (user_id = @caller AND char_name = ${me(ctx)}) ORDER BY joined LIMIT 1`).rows;
  if (!others.length) {
    const g = (await ctx.sql`SELECT vault FROM guilds WHERE realm = ${realm} AND name_key = ${k}`).rows[0];
    let items = []; try { items = JSON.parse((g && g.vault) || '[]'); } catch (e) {}
    if (items.some(Boolean)) return err(ctx, 'You are the last member: empty the guild vault first.');
    await ctx.sql`DELETE FROM guild_members WHERE realm = ${realm} AND name_key = ${k}; DELETE FROM guilds WHERE realm = ${realm} AND name_key = ${k}`;
    return exit(ctx, '<' + st.guildName + '> is disbanded.');
  }
  if (st.guildRole === 'leader') await ctx.sql`UPDATE guild_members SET role = 'leader' WHERE realm = ${realm} AND user_id = ${others[0].user_id} AND char_name = ${others[0].char_name}`;
  await ctx.sql`DELETE FROM guild_members WHERE realm = ${realm} AND user_id = @caller AND char_name = ${me(ctx)}`;
  exit(ctx, 'You left <' + st.guildName + '>.');
}
async function kick(ctx, target) {
  const st = ctx.self.state; if (!st.guildName) return;
  if (st.guildRole !== 'leader') return err(ctx, 'Only the guild leader can remove members.');
  if (keyOf(target) === keyOf(me(ctx))) return err(ctx, 'Use Leave to step down.');
  await tables(ctx);
  const r = await ctx.sql`DELETE FROM guild_members WHERE realm = ${realmOf(ctx)} AND name_key = ${keyOf(st.guildName)} AND lower(char_name) = ${keyOf(target)} AND role <> 'leader'`;
  if (!r.changes) return err(ctx, 'No member named ' + target + '.');
  for (const p of ctx.world.players) if (keyOf(p.state && p.state.charName) === keyOf(target) && p.state.guildName === st.guildName) { p.state.guildName = null; p.state.guildRole = null; p.state._questSave = true; }
  tellSelf(ctx, target + ' was removed from the guild.'); ctx.session.rosterAt = 0;
}
function invite(ctx, target) {
  const st = ctx.self.state; if (!st.guildName) return err(ctx, 'You are not in a guild.');
  const p = ctx.world.players.find((x) => x.id !== ctx.self.id && keyOf(x.state && x.state.charName) === keyOf(target));
  if (!p) return err(ctx, 'No hero named ' + target + ' is online here.');
  if (p.state.guildName) return err(ctx, p.state.charName + ' is already in <' + p.state.guildName + '>.');
  p.state.pendingGuildInvite = { guildName: st.guildName, inviterName: me(ctx), at: ctx.now() };
  st.showGuildInviteInput = false;
  tellSelf(ctx, 'Invited ' + p.state.charName + ' to <' + st.guildName + '>.');
}
async function roster(ctx) {
  const st = ctx.self.state; if (!st.guildName) return;
  await tables(ctx);
  const rows = (await ctx.sql`SELECT user_id, char_name, role FROM guild_members WHERE realm = ${realmOf(ctx)} AND name_key = ${keyOf(st.guildName)} ORDER BY joined LIMIT 200`).rows;
  if (!ctx.self.state.guildName) return;
  const mine = rows.find((r) => r.char_name === me(ctx));
  if (!mine) return exit(ctx, 'You are no longer in <' + st.guildName + '>.');
  if (mine.role !== st.guildRole) st.guildRole = mine.role;
  st.guildRoster = rows.map((r) => { const p = ctx.world.players.find((x) => x.state && x.state.charName === r.char_name); return { name: r.char_name, role: r.role, id: p ? p.id : 'off:' + r.char_name }; });
}

// ── the guild vault (the banker's second tab) ──
function bagOf(st) { const b = (st.inventory || []).slice(); while (b.length < E.bagSlots) b.push(null); return b; }
function padV(v) { v = (v || []).slice(0, E.guildVaultSlots); while (v.length < E.guildVaultSlots) v.push(null); return v; }
function put(list, it) { // merges stacks, else a free slot; returns the count that did not fit
  let left = it.stackable ? (it.count || 1) : 1;
  if (it.stackable) for (let i = 0; i < list.length && left; i++) { const t = list[i]; if (t && t.id === it.id && (t.count || 1) < E.stackMax) { const n = Math.min(left, E.stackMax - (t.count || 1)); list[i] = { ...t, count: (t.count || 1) + n }; left -= n; } }
  while (left) { const f = list.findIndex((x) => !x); if (f < 0) break; const n = it.stackable ? Math.min(left, E.stackMax) : 1; list[f] = it.stackable ? { ...it, count: n } : it; left -= n; }
  return left;
}
async function loadVault(ctx) {
  const st = ctx.self.state; if (!st.guildName || !st.bankOpen) return null;
  await tables(ctx);
  const g = (await ctx.sql`SELECT vault, ver FROM guilds WHERE realm = ${realmOf(ctx)} AND name_key = ${keyOf(st.guildName)}`).rows[0];
  if (!g) return null;
  let v = []; try { v = JSON.parse(g.vault); } catch (e) {}
  if (ctx.self.state.bankOpen) ctx.self.state.bankOpen = { ...ctx.self.state.bankOpen, guild: padV(v), loading: false };
  return { v: padV(v), ver: g.ver };
}
async function vaultMove(ctx, dir, slot) {
  const st = ctx.self.state; if (!st.guildName || !st.bankOpen || st.bankOpen.tab !== 'guild') return;
  const realm = realmOf(ctx), k = keyOf(st.guildName);
  for (let tries = 0; tries < 3; tries++) {
    const cur = await loadVault(ctx); if (!cur) return;
    const v = cur.v.slice(), inv = bagOf(ctx.self.state);
    const src = dir === 'in' ? inv : v, dst = dir === 'in' ? v : inv, it = src[slot];
    if (!it) return;
    if (dir === 'in' && it.soulbound) return err(ctx, (it.name || 'That') + ' is bound to you.');
    const all = it.stackable ? (it.count || 1) : 1, left = put(dst, it);
    if (left === all) return err(ctx, dir === 'in' ? 'The guild vault is full.' : 'Your bag is full.');
    src[slot] = left ? { ...it, count: left } : null;
    const u = await ctx.sql`UPDATE guilds SET vault = ${JSON.stringify(v)}, ver = ver + 1 WHERE realm = ${realm} AND name_key = ${k} AND ver = ${cur.ver}`;
    if (u.changes !== 1) continue; // another member moved first: read again
    ctx.self.state.inventory = inv; ctx.self.state._questSave = true;
    if (ctx.self.state.bankOpen) ctx.self.state.bankOpen = { ...ctx.self.state.bankOpen, guild: v };
    ctx.emit('playSound', { clip: dir === 'in' ? '/cdn/moodboard-painterly-fantasy/sfx-iron-vault-drawer-slide-shut.mp3' : '/cdn/moodboard-painterly-fantasy/sfx-leather-pouch-pick-up-coins-shift.mp3', volume: 0.45 }, { audience: { player: ctx.self.id } });
    return;
  }
  err(ctx, 'The vault is busy. Try again.');
}

export function onInput(ctx, input) {
  const st = ctx.self.state;
  if (!st.characterCreated) return;
  if (on(input, 'createGuild')) return run(ctx, create(ctx, dataOf(input, 'createGuild').guildName || dataOf(input, 'createGuild').name));
  if (on(input, 'confirmJoinGuild')) return run(ctx, join(ctx, dataOf(input, 'confirmJoinGuild').name));
  if (on(input, 'guildAcceptInvite')) { const inv = st.pendingGuildInvite; st.pendingGuildInvite = null; if (inv) run(ctx, join(ctx, inv.guildName)); return; }
  if (on(input, 'guildDeclineInvite')) { st.pendingGuildInvite = null; return; }
  if (on(input, 'leaveGuild') || on(input, 'guildLeave')) return run(ctx, leave(ctx));
  if (on(input, 'guildKick')) return run(ctx, kick(ctx, String(dataOf(input, 'guildKick').targetName || '')));
  if (on(input, 'guildInvite')) return invite(ctx, String(dataOf(input, 'guildInvite').targetName || ''));
  if (on(input, 'openGuildJoin')) { st.showGuildJoinModal = true; st.guildError = null; return; }
  if (on(input, 'closeGuildJoin')) { st.showGuildJoinModal = false; st.guildError = null; return; }
  if (on(input, 'closeGuildPanel')) { st.showGuildPanel = false; return; }
  if (on(input, 'toggleGuildInviteInput')) { st.showGuildInviteInput = !st.showGuildInviteInput; return; }
  if (on(input, 'toggleGuildCreation')) { st.showGuildCreation = !st.showGuildCreation; return; }
  if (on(input, 'bankTab') && st.bankOpen) {
    const tab = dataOf(input, 'bankTab').tab === 'guild' && st.guildName ? 'guild' : 'mine';
    st.bankOpen = { ...st.bankOpen, tab, loading: tab === 'guild' };
    if (tab === 'guild') run(ctx, loadVault(ctx));
    return;
  }
  if (on(input, 'guildVaultDeposit')) return run(ctx, vaultMove(ctx, 'in', Number(dataOf(input, 'guildVaultDeposit').slot)));
  if (on(input, 'guildVaultWithdraw')) return run(ctx, vaultMove(ctx, 'out', Number(dataOf(input, 'guildVaultWithdraw').slot)));
}


export function update(ctx) {
  const st = ctx.self.state;
  if (!st.characterCreated || !st.guildName) return;
  const now = ctx.now();
  if (now - (ctx.session.rosterAt || 0) > 20000) { ctx.session.rosterAt = now; run(ctx, roster(ctx)); }
  if (st.pendingGuildInvite && now - st.pendingGuildInvite.at > 60000) st.pendingGuildInvite = null;
}
