// Quest data module — MMORPG Tools Mod. The quests themselves live in scripts/lib/data/quests.yml.
// getAvailableQuests / questToActiveFormat keep the interface quest-giver.js reads; questProgress / questStatus serve the tracker.
import QDATA from '../../../../scripts/lib/data/quests.yml';

var QUEST_DATABASE = {};
for (var k in QDATA) { if (QDATA[k] && QDATA[k].objectives) QUEST_DATABASE[k] = QDATA[k]; }

function has(list, id) { return Array.isArray(list) && list.indexOf(id) !== -1; }
// The roadmap's eligibility: every id in requires done, and at least one of requiresAny when it is set.
function eligible(q, ps) {
  var done = (ps && ps.completedQuests) || [];
  var req = q.requires || [], any = q.requiresAny || [];
  // origin gate: a hero of that race (raceIndex) finishes their origin chain first; every other people passes.
  // Old saves with the quest already done or active never reach here (getAvailableQuests filters them first).
  if (typeof q.race === 'number' && ((ps && ps.raceIndex) || 0) !== q.race) return false; // an origin chain is its own people's
  if (q.minLevel && ((ps && ps.level) || 1) < q.minLevel) return false; // a level-banded area's quests wait for the hero to grow into it
  if (q.cls && String((ps && ps.className) || 'vanguard').toLowerCase() !== q.cls) return false; // a class path is its own class's
  var og = q.origin ? (Array.isArray(q.origin) ? q.origin : [q.origin]) : [];
  for (var k = 0; k < og.length; k++) if (((ps && ps.raceIndex) || 0) === og[k].race && done.indexOf(og[k].quest) === -1) return false;
  for (var i = 0; i < req.length; i++) if (done.indexOf(req[i]) === -1) return false;
  if (!any.length) return true;
  for (var j = 0; j < any.length; j++) if (done.indexOf(any[j]) !== -1) return true;
  return false;
}
function activeOf(ps, id) { var a = (ps && ps.activeQuests) || []; for (var i = 0; i < a.length; i++) if (a[i] && a[i].questId === id) return a[i]; return null; }

export function getAvailableQuests(npcId, playerState) {
  var out = [];
  for (var id in QUEST_DATABASE) {
    var q = QUEST_DATABASE[id];
    if (q.giverNpcId !== npcId) continue;
    if (has(playerState && playerState.completedQuests, id) || activeOf(playerState, id)) continue;
    if (!eligible(q, playerState)) continue;
    out.push(q);
  }
  return out;
}

// The active-quest row: objectives carry current/target (the menu panel reads them); baseline = tally at accept.
export function questToActiveFormat(quest, playerState) {
  if (!quest) return null;
  var tally = (playerState && playerState.tally) || {};
  var baseline = {};
  var objs = [];
  for (var i = 0; i < quest.objectives.length; i++) {
    var o = quest.objectives[i];
    baseline[o.key] = tally[o.key] || 0;
    objs.push({ key: o.key, desc: o.desc, target: o.target, current: 0 });
  }
  return { questId: quest.id, title: quest.title, giverNpcId: quest.giverNpcId, giverName: quest.giverName, turnInNpcId: quest.turnInNpcId || quest.giverNpcId, turnInName: quest.turnInName || quest.giverName, objectives: objs, rewards: quest.rewards, baseline: baseline };
}

// Fresh objective counts from the tally: min(target, tally − baseline).
export function questProgress(aq, playerState) {
  var tally = (playerState && playerState.tally) || {};
  var base = aq.baseline || {};
  var objs = [];
  var done = true;
  for (var i = 0; i < aq.objectives.length; i++) {
    var o = aq.objectives[i];
    var cur = Math.max(0, Math.min(o.target, (tally[o.key] || 0) - (base[o.key] || 0)));
    if (cur < o.target) done = false;
    objs.push({ key: o.key, desc: o.desc, target: o.target, current: cur });
  }
  return { objectives: objs, done: done };
}

// What an NPC means to this player: 'ready' (?), 'available' (!), 'active', 'done' or null.
// A quest may be turned in to another NPC (turnInNpcId): that NPC shows its '?', the giver its '!'.
export function questStatus(npcId, playerState) {
  var any = null, avail = false;
  for (var id in QUEST_DATABASE) {
    var q = QUEST_DATABASE[id], giver = q.giverNpcId, taker = q.turnInNpcId || giver;
    if (giver !== npcId && taker !== npcId) continue;
    var aq = activeOf(playerState, id);
    if (aq) { if (taker === npcId && questProgress(aq, playerState).done) return 'ready'; any = 'active'; continue; }
    if (giver !== npcId) continue;
    if (has(playerState && playerState.completedQuests, id)) { if (!any) any = 'done'; continue; }
    if (eligible(q, playerState)) avail = true;
  }
  return avail ? 'available' : any;
}

export { eligible };
export function getQuest(id) { return QUEST_DATABASE[id] || null; }

module.exports = { QUEST_DATABASE: QUEST_DATABASE, getAvailableQuests: getAvailableQuests, questToActiveFormat: questToActiveFormat, questProgress: questProgress, questStatus: questStatus, getQuest: getQuest, eligible: eligible };
