// On every player's body: E talks to Gatekeeper Elric and chops timber oaks; the quest dialog's Accept / Complete
// buttons land here; the active quests' objective counts follow player.state.tally. All numbers: scripts/lib/data/quests.yml.
// Writes only this body's own state (and a felled oak's logsLeft / depletedUntil); the mod's player.js saves the
// character when state._questSave is raised (buildCharData carries activeQuests, completedQuests, tally, copper, xp, inventory).
import Q from './lib/data/quests.yml';
import TF from './lib/data/townsfolk.yml';
import { move, formatText } from './lib/economy.js';
import V from './lib/data/vanguard.yml';
import { getAvailableQuests, questToActiveFormat, questProgress, getQuest } from '../mods/mmorpg-tools/mod-mmorpg/lib/quest-data.js';

const W = Q.woodcutting, N = Q.npc, R = Q.reading || { reach: 2.6, length: 11 };
const ELRIC = 'gatekeeper-elric';
const CHIPS = `fx
pop chips burst=10..16 life=.5..0.9 v=<%normal|0,1,0>*(2..3.5)+up(1.5)+sdir()*(.6..1.2) size=.05..0.1 spin=-8..8 acc=grav()+drag(1.2) col=<.62,.45,.26> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=3..5 life=.4..0.8 v=up(.4..0.8)+sdir()*.4 size=.2..0.35 acc=buoy(.3)+drag(1.4) col=<.6,.52,.4> a=0>.3:.3>.7:.15>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)`;

const on = (input, name) => !!((input.pressed && input.pressed[name]) || (input.actions && input.actions[name]));
const dataOf = (input, name) => (input.actionData && input.actionData[name]) || {};
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';

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
  if (id === ELRIC) return say(ctx, getQuest('Q002').doneText, id);
  const mine = Object.values(Q).find((q) => q && q.giverNpcId === id && (st.completedQuests || []).includes(q.id));
  say(ctx, (mine && mine.doneText) || (npc.state && npc.state.line) || '...', id);
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
  say(ctx, q.doneText, q.turnInNpcId || q.giverNpcId);
  const head = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.2, z: ctx.self.feetPosition.z };
  ctx.emit('damageNumber', { position: head, text: `+${formatText(q.rewards.copper || 0)}  +${q.rewards.xp} XP`, color: 'oklch(0.86 0.15 85)', size: 1.3, lifetime: 2.2 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: 'cdn/sfx-reward.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: '/cdn/moodboard-painterly-fantasy/sfx-coins-clink.mp3', position: ctx.self.feetPosition, volume: 0.6 }, { audience: { player: ctx.self.id } });
  ctx.emit('milestone', { step: questId === 'Q002' ? 2 : 1, name: questId + ' complete' });
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
  if (input.actionData && Object.keys(input.actionData).length) ctx.log('qdbg', { p: playing(ctx), ad: Object.keys(input.actionData), pr: Object.keys(input.pressed || {}), place: ctx.self.place });
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'acceptQuest')) return accept(ctx, dataOf(input, 'acceptQuest').questId);
  if (on(input, 'completeQuest')) return complete(ctx, dataOf(input, 'completeQuest').questId);
  if (on(input, 'declineQuest') || on(input, 'closeQuestDialog')) { st.showQuestDialog = false; st.questDialogData = null; return; }
  if (!on(input, 'interact') || st.showQuestDialog || st.showDoorPanel) return;
  if (ctx.session.chop) return stopChop(ctx);
  { const qn = near(ctx, 'quest-npc', N.talkReach); if (qn) return talk(ctx, qn); }
  const folk = near(ctx, 'talker', N.talkReach);
  if (folk) return chat(ctx, folk);
  const page = near(ctx, 'readable', R.reach);
  if (page) return read(ctx, page);
  const cache = nearCache(ctx);
  if (cache) return openCache(ctx, cache);
  const tree = near(ctx, 'timber', W.reach);
  if (tree && !felled(ctx, tree)) startChop(ctx, tree);
}

export function update(ctx) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (ctx.session.chop) stepChop(ctx);
  if (st.npcSay && ctx.now() > (ctx.session.sayUntil || 0)) st.npcSay = null;
  if (ctx.now() < (ctx.session.nextScan || 0)) return;
  ctx.session.nextScan = ctx.now() + 200;
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
