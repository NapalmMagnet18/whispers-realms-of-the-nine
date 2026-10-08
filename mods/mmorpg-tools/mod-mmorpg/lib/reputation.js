// Reputation system — MMORPG Tools Mod (stubs with same interface)
// Export interface matches scripts/lib/reputation.js exactly

var REP_CAP = 3000;

var REP_TIERS = [
  { name: 'Friendly',   min: 0,    max: 999  },
  { name: 'Well-Liked', min: 1000, max: 1999 },
  { name: 'Esteemed',   min: 2000, max: 2999 },
  { name: 'Celebrity',  min: 3000, max: 3000 },
];

export function getTierIndex(rep) {
  if (rep >= 3000) return 3;
  if (rep >= 2000) return 2;
  if (rep >= 1000) return 1;
  return 0;
}

export function getTierName(rep) {
  return REP_TIERS[getTierIndex(rep)].name;
}

export function getProgressInTier(rep) {
  if (rep >= 3000) return { current: 1000, max: 1000 };
  var tierBase = Math.floor(rep / 1000) * 1000;
  return { current: rep - tierBase, max: 1000 };
}

export function awardReputation(currentRep, amount) {
  var oldTierIdx = getTierIndex(currentRep);
  var newRep = Math.min(currentRep + amount, REP_CAP);
  var awarded = newRep - currentRep;
  var newTierIdx = getTierIndex(newRep);
  return {
    newRep: newRep,
    awarded: awarded,
    tierChanged: newTierIdx > oldTierIdx,
    newTierName: REP_TIERS[newTierIdx].name,
  };
}

module.exports = { REP_CAP: REP_CAP, REP_TIERS: REP_TIERS, getTierIndex: getTierIndex, getTierName: getTierName, getProgressInTier: getProgressInTier, awardReputation: awardReputation };
