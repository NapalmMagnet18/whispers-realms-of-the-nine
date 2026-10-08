// Quest data module — MMORPG Tools Mod (empty)
// Export interface matches scripts/lib/quest-data.js exactly

var QUEST_DATABASE = {};

export function getAvailableQuests(npcId, playerState) {
  return [];
}

export function questToActiveFormat(quest) {
  return null;
}

module.exports = { QUEST_DATABASE: QUEST_DATABASE, getAvailableQuests: getAvailableQuests, questToActiveFormat: questToActiveFormat };
