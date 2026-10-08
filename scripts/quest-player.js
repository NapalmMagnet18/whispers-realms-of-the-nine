// On every player's body: E talks to Gatekeeper Elric and chops timber oaks; the quest dialog's Accept / Complete
// buttons land here; the active quests' objective counts follow player.state.tally. All numbers: scripts/lib/data/quests.yml.
// Writes only this body's own state (and a felled oak's logsLeft / depletedUntil); the mod's player.js saves the
// character when state._questSave is raised (buildCharData carries activeQuests, completedQuests, tally, copper, xp, inventory).
import Q from './lib/data/quests.yml';
import { raycast } from 'builtin/physics';
import TF from './lib/data/townsfolk.yml';
import { move, formatText } from './lib/economy.js';
import { levelInfo, statsFor } from './lib/leveling.js';
import V from './lib/data/vanguard.yml';
import { getAvailableQuests, questToActiveFormat, questProgress, getQuest } from '../mods/mmorpg-tools/mod-mmorpg/lib/quest-data.js';

const W = Q.woodcutting, N = Q.npc, R = Q.reading || { reach: 2.6, length: 11 }, M = Q.marks || { reach: 3.2, cooldown: 6 };
const ELRIC = 'gatekeeper-elric';
const CHIPS = `fx
pop chips burst=10..16 life=.5..0.9 v=<%normal|0,1,0>*(2..3.5)+up(1.5)+sdir()*(.6..1.2) size=.05..0.1 spin=-8..8 acc=grav()+drag(1.2) col=<.62,.45,.26> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=3..5 life=.4..0.8 v=up(.4..0.8)+sdir()*.4 size=.2..0.35 acc=buoy(.3)+drag(1.4) col=<.6,.52,.4> a=0>.3:.3>.7:.15>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)`;

// a button in the mod's ui.js arrives namespaced (mmorpg-tools:acceptQuest); a key binding arrives bare
const MNS = 'mmorpg-tools:';
const on1 = (input, n) => !!((input.pressed && input.pressed[n]) || (input.actions && input.actions[n]));
const on = (input, name) => on1(input, name) || on1(input, MNS + name);
const dataOf = (input, name) => (input.actionData && (input.actionData[name] || input.actionData[MNS + name])) || {};
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const playing = (ctx) => (ctx.self.place === 'main' || ctx.self.place === 'hollowcrypt') && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';

function say(ctx, text, anchor) {
  ctx.self.state.npcSay = anchor && anchor !== ELRIC ? { text, id: ctx.now(), anchor, offset: '0 2.35 0' } : { text, id: ctx.now() };
  ctx.session.sayUntil = ctx.now() + N.sayLength * 1000;
}
function near(ctx, tag, reach) {
  const me = ctx.self.feetPosition;
  let best = null, bd = reach;
  for (const r of ctx.query({ tags: [tag], radius: reach + 2 })) { const h = r.id.includes('/') ? ctx.place.objects[r.id] : null; const at = (h && h.worldFeetPosition) || r.feetPosition; const d = flat(at, me); if (d <= bd) { bd = d; best = r; } }
  return best;
}
// anything tagged 'readable' (a journal, a plaque) carries state { title, text }: E floats its page over it
function read(ctx, r) {
  const s = r.state || {};
  ctx.self.state.npcSay = { text: (s.title ? '<b>' + s.title + '</b><br>' : '') + (s.text || ''), id: ctx.now(), anchor: r.id, offset: s.offset || '0 1.4 0' };
  ctx.session.sayUntil = ctx.now() + R.length * 1000;
}
// a townsfolk resident (tag talker, state.who = a townsfolk.yml row): each press the next of their lines, over their head
function chat(ctx, r) {
  const row = TF[r.state && r.state.who]; if (!row) return;
  const seen = ctx.session.talkSeen || (ctx.session.talkSeen = {});
  const i = seen[r.id] ?? 0; seen[r.id] = (i + 1) % row.lines.length;
  ctx.self.state.npcSay = { text: '<b>' + row.name + '</b><br>' + row.lines[i], id: ctx.now(), anchor: r.id, offset: '0 2.35 0' };
  ctx.session.sayUntil = ctx.now() + (TF.sayLength || 7) * 1000;
}
// anything tagged 'cache' (a hidden chest) carries state { cache, gold, title, lid? }: E opens it once per player
function nearCache(ctx) {
  const c = near(ctx, 'cache', R.reach);
  return c && Math.abs(c.feetPosition.y - ctx.self.feetPosition.y) < 1.6 ? c : null;
}
function openCache(ctx, c) {
  const st = ctx.self.state, cs = c.state || {}, key = cs.cache || c.id, found = st.caches || {};
  const head = { x: c.feetPosition.x, y: c.feetPosition.y + 1, z: c.feetPosition.z };
  const live = ctx.place.objects[c.id];
  if (live) live.state.openUntil = ctx.now() + 6000;
  if (found[key]) { ctx.emit('damageNumber', { position: head, text: 'Empty. You took this one.', color: 'oklch(0.8 0.02 80)', size: 1, lifetime: 1.8 }, { audience: { player: ctx.self.id } }); return; }
  st.caches = { ...found, [key]: ctx.now() };
  st.gold = (st.gold || 0) + (cs.gold || 0);
  st._questSave = true;
  ctx.emit('damageNumber', { position: head, text: `${cs.title || 'Hidden cache'}  +${cs.gold || 0} Gold`, color: 'oklch(0.86 0.15 85)', size: 1.3, lifetime: 2.4 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-chest-open-coins.mp3', position: head, volume: 0.8 });
  ctx.emit('milestone', { step: 'cache-' + key, name: cs.title || 'Found a hidden cache' }, { audience: { player: ctx.self.id } });
}
const felled = (ctx, tree) => (tree.state.depletedUntil || 0) > ctx.now();

// one quest reward into the bag: the first empty slot; a full bag keeps it owed in st.owedItems, paid when a slot frees
function addItem(st, item) {
  const inv = (st.inventory || []).slice();
  while (inv.length < W.bagSlots) inv.push(null);
  const i = inv.findIndex((it) => !it);
  if (i < 0) { st.owedItems = [...(st.owedItems || []), item.id]; return false; }
  inv[i] = { ...item, count: 1 };
  st.inventory = inv;
  return true;
}
// one log into the mod's 30-slot inventory: stacks on a log stack under stackMax, else the first empty slot; false = full
function addLog(st) {
  const inv = (st.inventory || []).slice();
  while (inv.length < W.bagSlots) inv.push(null);
  let i = inv.findIndex((it) => it && it.id === 'log' && (it.count || 1) < W.stackMax);
  if (i >= 0) inv[i] = { ...inv[i], count: (inv[i].count || 1) + 1 };
  else {
    i = inv.findIndex((it) => !it);
    if (i < 0) return false;
    inv[i] = { ...Q.items.log, count: 1 }; // its icon: item-icons.js ITEM_ICONS.log
  }
  st.inventory = inv;
  return true;
}

// any quest-npc: a ready turn-in first, then a quest on offer, then progress talk, then their own line
const npcName = (npc) => (npc.state && npc.state.npcName) || (npc.id === ELRIC ? 'Elric' : 'them');
function talk(ctx, npc) {
  const st = ctx.self.state, id = npc.id;
  const pos = ctx.place.objects[id]?.feetPosition ?? ctx.self.feetPosition;
  const actives = (st.activeQuests || []).filter(Boolean);
  for (const aq of actives) {
    const q = getQuest(aq.questId); if (!q || (q.turnInNpcId || q.giverNpcId) !== id) continue;
    const p = questProgress(aq, st);
    if (p.done) {
      st.questDialogData = { id: q.id, title: q.title, giverName: q.turnInName || q.giverName, giverNpcId: id, text: q.turnInText, objectives: p.objectives, rewards: q.rewards, turnIn: true };
      st.showQuestDialog = true;
      ctx.emit('playSound', { clip: '/cdn/sfx-scroll-open-magic-parchment-yk3iu4k0.mp3', position: pos, volume: 0.3 }, { audience: { player: ctx.self.id } });
      return;
    }
  }
  const avail = getAvailableQuests(id, st);
  if (avail.length) {
    const a = avail[0];
    st.questDialogData = { id: a.id, title: a.title, giverName: a.giverName, giverNpcId: id, text: a.text, objectives: a.objectives, rewards: a.rewards };
    st.showQuestDialog = true;
    ctx.emit('playSound', { clip: '/cdn/question-prompt-chime-notification-jtcgt1r9.mp3', position: pos, volume: 0.3 }, { audience: { player: ctx.self.id } });
    return;
  }
  for (const aq of actives) {
    const q = getQuest(aq.questId); if (!q) continue;
    if ((q.turnInNpcId || q.giverNpcId) === id || q.giverNpcId === id) return say(ctx, q.progressText, id);
  }
  if (npc.state && npc.state.who && TF[npc.state.who]) return chat(ctx, npc); // a townsfolk giver with nothing to offer talks as themselves
  const mine = Object.values(Q).filter((q) => q && q.giverNpcId === id && (st.completedQuests || []).includes(q.id)).pop();
  say(ctx, (mine && mine.doneText) || (npc.state && npc.state.line) || 'Walk safe out there.', id);
}

function accept(ctx, questId) {
  const st = ctx.self.state;
  const q = getQuest(questId);
  st.showQuestDialog = false; st.questDialogData = null;
  if (!q || !getAvailableQuests(q.giverNpcId, st).some((x) => x.id === questId)) return; // done or already active: nothing
  st.activeQuests = [...(st.activeQuests || []), questToActiveFormat(q, st)];
  st._questSave = true;
  ctx.emit('playSound', { clip: '/cdn/question-prompt-chime-notification-jtcgt1r9.mp3', position: ctx.self.feetPosition, volume: 0.35, pitch: 1.2 }, { audience: { player: ctx.self.id } });
}

// The claim: the completed flag lands FIRST; a second press, a stale dialog or a reconnect finds it and pays nothing.
function complete(ctx, questId) {
  const st = ctx.self.state;
  const q = getQuest(questId);
  st.showQuestDialog = false; st.questDialogData = null;
  if (!q) return;
  if ((st.completedQuests || []).includes(questId)) { say(ctx, q.refusedText); return; }
  const aq = (st.activeQuests || []).find((x) => x && x.questId === questId);
  if (!aq || !questProgress(aq, st).done) { if (aq) say(ctx, q.progressText); return; }
  st.completedQuests = [...(st.completedQuests || []), questId];
  st.activeQuests = (st.activeQuests || []).filter((x) => x && x.questId !== questId);
  st.xp = (st.xp || 0) + (q.rewards.xp || 0);
  st._questSave = true;
  if (q.rewards.copper) move(ctx, q.rewards.copper, 'quest:' + questId, { feedback: false });
  for (const k of q.rewards.items || []) if (Q.items && Q.items[k]) addItem(st, Q.items[k]); // after the completed flag: paid once
  say(ctx, q.doneText, q.turnInNpcId || q.giverNpcId);
  const head = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.2, z: ctx.self.feetPosition.z };
  ctx.emit('damageNumber', { position: head, text: `+${formatText(q.rewards.copper || 0)}  +${q.rewards.xp} XP`, color: 'oklch(0.86 0.15 85)', size: 1.3, lifetime: 2.2 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: 'cdn/sfx-reward.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-coins-clink.mp3', position: ctx.self.feetPosition, volume: 0.6 }, { audience: { player: ctx.self.id } });
  ctx.emit('milestone', { step: /^Q00\d$/.test(questId) ? 8 + Number(questId.slice(3)) : /^MAR-0\d$/.test(questId) ? Number(questId.slice(4)) : 1, name: questId + ' complete' });
}

// A quest mark (tag quest-mark): state { mark: tally key, quest: the quest it serves, verb, title, after?: an objective key
// that must be full first, repeat?: true = pulls on a cooldown (ore, fish), else once per hero, say?: the line it floats }.
// It answers only while its quest is active and that objective is short, so the world never pays a tally nobody asked for.
function markFor(ctx, r) {
  const ms = r.state || {}, st = ctx.self.state;
  const aq = (st.activeQuests || []).find((x) => x && x.questId === ms.quest); if (!aq) return null;
  const p = questProgress(aq, st);
  const obj = p.objectives.find((o) => o.key === ms.mark); if (!obj || obj.current >= obj.target) return null;
  if (!ms.repeat && (st.marks || {})[r.id]) return null;
  return { aq, p, obj };
}
function nearMark(ctx) {
  const me = ctx.self.feetPosition;
  let best = null, bd = M.reach, waiting = null;
  for (const r of ctx.query({ tags: ['quest-mark'], radius: M.reach + 2 })) {
    const d = flat(r.feetPosition, me); if (d > bd || Math.abs(r.feetPosition.y - me.y) > 3) continue;
    const m = markFor(ctx, r); if (!m) continue;
    const pre = r.state && r.state.after && m.p.objectives.find((o) => o.key === r.state.after);
    if (pre && pre.current < pre.target) { if (!best && d <= bd) { waiting = r; } continue; } // a step still waiting on an earlier one yields to its neighbours
    bd = d; best = r;
  }
  return best || waiting; // alone, the waiting step still answers with its 'First: …' line
}
function useMark(ctx, r) {
  const st = ctx.self.state, ms = r.state || {}, m = markFor(ctx, r); if (!m) return;
  const head = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.1, z: ctx.self.feetPosition.z };
  const tell = (text, col) => ctx.emit('damageNumber', { position: head, text, color: col || 'oklch(0.8 0.02 80)', size: 1.1, lifetime: 1.8 }, { audience: { player: ctx.self.id } });
  if (ms.after) { const pre = m.p.objectives.find((o) => o.key === ms.after); if (pre && pre.current < pre.target) return tell(ms.afterText || ('First: ' + pre.desc)); }
  const cd = ctx.session.markCd || (ctx.session.markCd = {});
  if (ms.repeat && ctx.now() < (cd[r.id] || 0)) return tell(ms.waitText || 'Nothing yet. Try again in a moment.');
  cd[r.id] = ctx.now() + M.cooldown * 1000;
  st.tally = { ...(st.tally || {}), [ms.mark]: ((st.tally || {})[ms.mark] || 0) + 1 };
  if (!ms.repeat) st.marks = { ...(st.marks || {}), [r.id]: ctx.now() };
  if (ms.flag) st.questFlags = { ...(st.questFlags || {}), [ms.flag]: true }; // a choice the story remembers (MAR-08's memorial)
  st._questSave = true;
  ctx.self.anim.action = { clip: V.strike.clip, weight: 1, loop: 'once', speed: V.strike.speed, blendIn: 0.08 };
  tell(ms.gain || ('+1 ' + m.obj.desc), 'oklch(0.86 0.15 85)');
  if (ms.burstFx) ctx.emit('fx', { position: { x: r.feetPosition.x, y: r.feetPosition.y + (ms.burstAt || 1), z: r.feetPosition.z }, script: ms.burstFx }, { audience: { nearby: r.feetPosition, radius: 60 } }); // a mark that answers with a flare (a lamp catching, a buoy ringing)
  if (ms.say) { ctx.self.state.npcSay = { text: (ms.title ? '<b>' + ms.title + '</b><br>' : '') + ms.say, id: ctx.now(), anchor: r.id, offset: '0 1.6 0' }; ctx.session.sayUntil = ctx.now() + R.length * 1000; }
  ctx.emit('playSound', { clip: ms.sound || '/cdn/moodboard-painterly-fantasy/sfx-quest-objective-chime.mp3', position: r.feetPosition, volume: 0.55 }, { audience: { player: ctx.self.id } });
  if (ms.travel) { ctx.emit('screenFlash', { color: '#cfe6ff', duration: 0.6, intensity: 0.6 }, { audience: { player: ctx.self.id } }); ctx.self.velocity = { x: 0, y: 0, z: 0 }; ctx.self.feetPosition = { ...ms.travel }; ctx.session.sayUntil = 0; } // a ride (TID-09's relay skiff): the hero steps off at the far shore
}

function startChop(ctx, tree) {
  if (felled(ctx, tree)) return;
  ctx.session.chop = { tree: tree.id, at: ctx.now(), swung: 0, from: { ...ctx.self.feetPosition } };
}
function stopChop(ctx) {
  ctx.session.chop = null;
  ctx.self.anim.action = null;
  ctx.session.hint = null;
}

function stepChop(ctx) {
  const c = ctx.session.chop;
  const tree = ctx.place.objects[c.tree];
  if (!tree || felled(ctx, tree) || flat(ctx.self.feetPosition, c.from) > W.cancelMove) return stopChop(ctx);
  const t = (ctx.now() - c.at) / 1000;
  const every = W.chopSeconds / W.swings;
  if (c.swung < W.swings && t >= c.swung * every) {
    c.swung++;
    ctx.self.anim.action = { clip: V.strike.clip, weight: 1, loop: 'once', speed: V.strike.speed, blendIn: 0.08 };
    const me = ctx.self.feetPosition, tp = tree.feetPosition;
    const dx = me.x - tp.x, dz = me.z - tp.z, l = Math.hypot(dx, dz) || 1;
    const hit = { x: tp.x + (dx / l) * 0.45, y: tp.y + 1.1, z: tp.z + (dz / l) * 0.45 };
    const aud = { audience: { nearby: hit, radius: 30 } };
    ctx.emit('playSound', { clip: W.chopSound, position: hit, volume: 0.55, pitch: 0.92 + ctx.random() * 0.16 }, aud);
    ctx.emit('fx', { position: hit, script: CHIPS, params: { normal: { x: dx / l, y: 0.3, z: dz / l } } }, aud);
    ctx.emit('shake', { target: tree.id, intensity: 0.05, duration: 0.18 }, aud);
  }
  if (t < W.chopSeconds) return;
  const st = ctx.self.state;
  const head = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.1, z: ctx.self.feetPosition.z };
  if (!addLog(st)) {
    ctx.emit('damageNumber', { position: head, text: 'Bag full', color: 'oklch(0.65 0.2 30)', lifetime: 1.6 }, { audience: { player: ctx.self.id } });
    return stopChop(ctx);
  }
  st.tally = { ...(st.tally || {}), log: ((st.tally && st.tally.log) || 0) + 1 };
  const left = (tree.state.logsLeft ?? W.logsPerTree) - 1;
  if (left <= 0) { tree.state.logsLeft = 0; tree.state.depletedUntil = ctx.now() + W.regrowSeconds * 1000; tree.state.fellFrom = { x: ctx.self.feetPosition.x, z: ctx.self.feetPosition.z }; }
  else tree.state.logsLeft = left;
  ctx.emit('damageNumber', { position: head, text: '+1 Log', color: 'oklch(0.82 0.12 75)', lifetime: 1.6 }, { audience: { player: ctx.self.id } });
  ctx.emit('stat', { name: 'logs' }, { audience: { player: ctx.self.id } });
  stopChop(ctx); // one press, one log
}

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'acceptQuest')) return accept(ctx, dataOf(input, 'acceptQuest').questId);
  if (on(input, 'completeQuest')) return complete(ctx, dataOf(input, 'completeQuest').questId);
  if (on(input, 'declineQuest') || on(input, 'closeQuestDialog')) { st.showQuestDialog = false; st.questDialogData = null; return; }
  if (!on(input, 'interact') || st.showQuestDialog || st.showDoorPanel) return;
  if (ctx.session.chop) return stopChop(ctx);
  { const qn = near(ctx, 'quest-npc', N.talkReach); if (qn) return talk(ctx, qn); }
  { const mk = nearMark(ctx); if (mk) return useMark(ctx, mk); }
  const folk = near(ctx, 'talker', N.talkReach);
  if (folk) return chat(ctx, folk);
  const page = near(ctx, 'readable', R.reach);
  if (page) return read(ctx, page);
  const cache = nearCache(ctx);
  if (cache) return openCache(ctx, cache);
  const tree = near(ctx, 'timber', W.reach);
  if (tree && !felled(ctx, tree)) startChop(ctx, tree);
}

// Level follows total XP from any source (quests, wolves, scavengers, the Warden): read here, written only when it moves.
function syncLevel(ctx, st) {
  const li = levelInfo(st.xp || 0), was = st.level || 1;
  if (st.xpInto !== li.into || st.xpToLevel !== li.need) { st.xpInto = li.into; st.xpToLevel = li.need; }
  if (li.level === was && st.maxHealth) return;
  const S = statsFor(li.level);
  st.level = li.level; st.maxHealth = S.maxHealth; st.maxMana = S.maxMana;
  st._questSave = true;
  if (li.level > was && ctx.session.levelSeen) { // a real gain this session, not a load of an old hero
    st.health = S.maxHealth; st.mana = S.maxMana;
    const fp = ctx.self.feetPosition, me = { audience: { player: ctx.self.id } };
    ctx.emit('damageNumber', { position: { x: fp.x, y: fp.y + 2.6, z: fp.z }, text: 'LEVEL ' + li.level, color: 'oklch(0.88 0.16 85)', size: 2, lifetime: 3 }, me);
    ctx.emit('screenFlash', { color: '#f2d38a', duration: 0.5, intensity: 0.35 }, me);
    ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-level-up-fanfare.mp3', position: fp, volume: 0.7 }, me);
    ctx.emit('fx', { position: fp, script: LEVEL_FX }, { audience: { nearby: fp, radius: 60 } });
    ctx.emit('milestone', { step: li.level, name: 'level ' + li.level });
  }
  ctx.session.levelSeen = true;
}
const LEVEL_FX = `fx
pop ring burst=1 life=1.1 pos=<0,.1,0> size=1 sz=$size*(.3>3.2) col=hdr(3,2.2,.8) a=.9>0 r=sprite(soft-disc,add)
pop rise burst=40 on=disc(.7) life=.9..1.6 v=up(2.5..4.5) size=.05..0.1 acc=drag(.6) col=hdr(4,2.8,1)>hdr(1.6,.8,.2) a=1>0 r=sprite(ember,add,velocity,.03)
pop glow burst=1 life=1 pos=<0,1,0> r=light(<1,.8,.4>,25>0,8)`;

export function update(ctx) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (ctx.session.chop) stepChop(ctx);
  if (st.npcSay && ctx.now() > (ctx.session.sayUntil || 0)) st.npcSay = null;
  if (ctx.now() < (ctx.session.nextScan || 0)) return;
  ctx.session.nextScan = ctx.now() + 200;
  syncLevel(ctx, st);
  // nameplates: an NPC behind a wall loses its plate (the HUD reads st.npcHidden); written only when the set changes
  if (ctx.now() > (ctx.session.nextSight || 0)) {
    ctx.session.nextSight = ctx.now() + 500;
    const me = ctx.self.feetPosition, eye = { x: me.x, y: me.y + 1.7, z: me.z };
    const hid = [];
    for (const n of ctx.query({ anyTags: ['npc'], radius: 45 })) {
      const h = { x: n.feetPosition.x, y: n.feetPosition.y + 1.7, z: n.feetPosition.z };
      const d = { x: h.x - eye.x, y: h.y - eye.y, z: h.z - eye.z }, L = Math.hypot(d.x, d.y, d.z);
      if (L < 4) continue;
      const r = raycast(ctx, eye, { x: d.x / L, y: d.y / L, z: d.z / L }, { distance: L - 1, bodies: 'static', physicsOnly: true });
      if (r && r.id !== n.id) hid.push(n.id);
    }
    const key = hid.sort().join('|');
    if (key !== (ctx.session.hidKey || '')) { ctx.session.hidKey = key; st.npcHidden = hid; }
  }
  // objective counts follow the tally: written only when one moved
  const aqs = st.activeQuests || [];
  let moved = false;
  const next = aqs.map((aq) => {
    if (!aq || !aq.baseline) return aq;
    const p = questProgress(aq, st);
    if (p.objectives.some((o, i) => o.current !== (aq.objectives[i] && aq.objectives[i].current))) { moved = true; return { ...aq, objectives: p.objectives }; }
    return aq;
  });
  if (moved) { st.activeQuests = next; st._questSave = true; }
  // each walk into Lantern's Reach counts once (the greeter quests' objective)
  const fp = ctx.self.feetPosition, inReach = Math.abs(fp.x) < 70 && Math.abs(fp.z) < 70;
  if (inReach && !ctx.session.inReach) { st.tally = { ...(st.tally || {}), reach_visits: ((st.tally || {}).reach_visits || 0) + 1 }; st._questSave = true; }
  ctx.session.inReach = inReach;
  // the prompt: the mod HUD draws state.interactHint; this script clears only the hint it wrote
  let hint = null;
  if (ctx.session.chop) hint = 'Chopping…';
  else if (!st.showQuestDialog && near(ctx, 'quest-npc', N.talkReach)) hint = 'E  Talk to ' + npcName(near(ctx, 'quest-npc', N.talkReach));
  else if (!st.showQuestDialog && nearMark(ctx)) { const mk = nearMark(ctx); hint = 'E  ' + (mk.state.verb || 'Use') + ' ' + (mk.state.title || ''); }
  else if (!st.showQuestDialog && near(ctx, 'talker', N.talkReach)) { const f = near(ctx, 'talker', N.talkReach); hint = 'E  Talk to ' + ((TF[f.state && f.state.who] || {}).name || 'them'); }
  else if (near(ctx, 'readable', R.reach)) { const r = near(ctx, 'readable', R.reach); hint = 'E  Read ' + ((r.state && r.state.title) || 'note'); }
  else if (nearCache(ctx)) { const c = nearCache(ctx); hint = (st.caches || {})[c.state.cache || c.id] ? 'Empty chest' : 'E  Open ' + (c.state.title || 'chest'); }
  else { const t = near(ctx, 'timber', W.reach); if (t) hint = felled(ctx, t) ? 'Felled · regrowing' : 'E  Chop Oak'; }
  if (hint !== ctx.session.hint) {
    if (hint) st.interactHint = hint;
    else if (st.interactHint === ctx.session.hint) st.interactHint = null;
    ctx.session.hint = hint;
  }
}
