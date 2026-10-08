// On every player's body: E talks to Gatekeeper Elric and chops timber oaks; the quest dialog's Accept / Complete
// buttons land here; the active quests' objective counts follow player.state.tally. All numbers: scripts/lib/data/quests.yml.
// Writes only this body's own state (and a felled oak's logsLeft / depletedUntil); the mod's player.js saves the
// character when state._questSave is raised (buildCharData carries activeQuests, completedQuests, tally, gold, xp, inventory).
import Q from './lib/data/quests.yml';
import V from './lib/data/vanguard.yml';
import { getAvailableQuests, questToActiveFormat, questProgress, getQuest } from '../mods/mmorpg-tools/mod-mmorpg/lib/quest-data.js';
import { ITEM_ICONS } from '../mods/mmorpg-tools/mod-mmorpg/lib/item-icons.js';

const W = Q.woodcutting, N = Q.npc;
const ELRIC = 'gatekeeper-elric';
const CHIPS = `fx
pop chips burst=10..16 life=.5..0.9 v=<%normal|0,1,0>*(2..3.5)+up(1.5)+sdir()*(.6..1.2) size=.05..0.1 spin=-8..8 acc=grav()+drag(1.2) col=<.62,.45,.26> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=3..5 life=.4..0.8 v=up(.4..0.8)+sdir()*.4 size=.2..0.35 acc=buoy(.3)+drag(1.4) col=<.6,.52,.4> a=0>.3:.3>.7:.15>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)`;

const on = (input, name) => !!((input.pressed && input.pressed[name]) || (input.actions && input.actions[name]));
const dataOf = (input, name) => (input.actionData && input.actionData[name]) || {};
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const playing = (ctx) => ctx.self.place === 'main' && ctx.self.state.characterCreated && ctx.self.state.phase !== 'creating';

function say(ctx, text) {
  ctx.self.state.npcSay = { text, id: ctx.now() };
  ctx.session.sayUntil = ctx.now() + N.sayLength * 1000;
}
function near(ctx, tag, reach) {
  const me = ctx.self.feetPosition;
  let best = null, bd = reach;
  for (const r of ctx.query({ tags: [tag], radius: reach + 2 })) { const d = flat(r.feetPosition, me); if (d <= bd) { bd = d; best = r; } }
  return best;
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
    inv[i] = { ...Q.items.log, icon: ITEM_ICONS['log'], count: 1 };
  }
  st.inventory = inv;
  return true;
}

function talk(ctx) {
  const st = ctx.self.state;
  const q = getQuest('Q002');
  const avail = getAvailableQuests(ELRIC, st);
  const pos = ctx.place.objects[ELRIC]?.feetPosition ?? ctx.self.feetPosition;
  if (avail.length) {
    const a = avail[0];
    st.questDialogData = { id: a.id, title: a.title, giverName: a.giverName, giverNpcId: ELRIC, text: a.text, objectives: a.objectives, rewards: a.rewards };
    st.showQuestDialog = true;
    ctx.emit('playSound', { clip: '/cdn/question-prompt-chime-notification-jtcgt1r9.mp3', position: pos, volume: 0.3 }, { audience: { player: ctx.self.id } });
    return;
  }
  const aq = (st.activeQuests || []).find((x) => x && x.questId === q.id);
  if (aq) {
    const p = questProgress(aq, st);
    if (p.done) {
      st.questDialogData = { id: q.id, title: q.title, giverName: q.giverName, giverNpcId: ELRIC, text: q.turnInText, objectives: p.objectives, rewards: q.rewards, turnIn: true };
      st.showQuestDialog = true;
      ctx.emit('playSound', { clip: '/cdn/sfx-scroll-open-magic-parchment-yk3iu4k0.mp3', position: pos, volume: 0.3 }, { audience: { player: ctx.self.id } });
    } else say(ctx, q.progressText);
    return;
  }
  say(ctx, q.doneText);
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
  st.gold = (st.gold || 0) + (q.rewards.gold || 0);
  st.xp = (st.xp || 0) + (q.rewards.xp || 0);
  st._questSave = true;
  say(ctx, q.doneText);
  const head = { x: ctx.self.feetPosition.x, y: ctx.self.feetPosition.y + 2.2, z: ctx.self.feetPosition.z };
  ctx.emit('damageNumber', { position: head, text: `+${q.rewards.gold} Gold  +${q.rewards.xp} XP`, color: 'oklch(0.86 0.15 85)', size: 1.3, lifetime: 2.2 }, { audience: { player: ctx.self.id } });
  ctx.emit('playSound', { clip: 'cdn/sfx-reward.mp3', position: ctx.self.feetPosition, volume: 0.5 }, { audience: { player: ctx.self.id } });
  ctx.emit('milestone', { step: 2, name: 'Q002 complete' });
}

function startChop(ctx, tree) {
  if (felled(ctx, tree)) return;
  ctx.session.chop = { tree: tree.id, at: ctx.now(), swung: 0, from: { ...ctx.self.feetPosition } };
  ctx.self.state.interactHint = 'Chopping…';
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
  stopChop(ctx);
  if (left > 0) startChop(ctx, tree); // keep swinging while E was the ask and the tree still stands? no: one press, one log
  stopChop(ctx);
}

export function onInput(ctx, input) {
  if (!playing(ctx)) return;
  const st = ctx.self.state;
  if (on(input, 'acceptQuest')) return accept(ctx, dataOf(input, 'acceptQuest').questId);
  if (on(input, 'completeQuest')) return complete(ctx, dataOf(input, 'completeQuest').questId);
  if (on(input, 'declineQuest') || on(input, 'closeQuestDialog')) { st.showQuestDialog = false; st.questDialogData = null; return; }
  if (!on(input, 'interact') || st.showQuestDialog || st.showDoorPanel) return;
  if (ctx.session.chop) return stopChop(ctx);
  if (near(ctx, 'quest-npc', N.talkReach)) return talk(ctx);
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
  // the prompt: the mod HUD draws state.interactHint; this script clears only the hint it wrote
  let hint = null;
  if (ctx.session.chop) hint = 'Chopping…';
  else if (!st.showQuestDialog && near(ctx, 'quest-npc', N.talkReach)) hint = 'E  Talk to Elric';
  else { const t = near(ctx, 'timber', W.reach); if (t) hint = felled(ctx, t) ? 'Felled · regrowing' : 'E  Chop Oak'; }
  if (hint !== ctx.session.hint) {
    if (hint) st.interactHint = hint;
    else if (st.interactHint === ctx.session.hint) st.interactHint = null;
    ctx.session.hint = hint;
  }
}
