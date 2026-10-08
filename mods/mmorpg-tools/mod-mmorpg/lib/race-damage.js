// Race damage multipliers — MMORPG Tools Mod (all return 1.0)
// Export interface matches scripts/lib/race-damage.js exactly

var RACE_DAMAGE_MULTIPLIERS = {};

export function getRaceDamageMultiplier(raceIndex) {
  return 1.0;
}

export function getCasterDamageMultiplier(objectApi) {
  return 1.0;
}

export function getOwnerDamageMultiplier(objectApi, ownerId) {
  return 1.0;
}

module.exports = { getRaceDamageMultiplier: getRaceDamageMultiplier, getCasterDamageMultiplier: getCasterDamageMultiplier, getOwnerDamageMultiplier: getOwnerDamageMultiplier, RACE_DAMAGE_MULTIPLIERS: RACE_DAMAGE_MULTIPLIERS };
