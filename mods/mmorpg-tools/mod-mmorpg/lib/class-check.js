// Resolve class name from player state using mod race data
// Returns the string class name or null
// Export interface matches scripts/lib/class-check.js exactly

var { RACES } = require('./races.js');

export function getClassName(state) {
  var race = RACES[state.raceIndex ?? 0];
  if (!race) return null;
  var classes = race.classes || [];
  return classes[state.classIndex ?? 0] || null;
}

// All class-specific checks return false (stubs)
export function isBloodKnight(state) { return false; }
export function isCultist(state) { return false; }
export function isDruid(state) { return false; }
export function isNecromancer(state) { return false; }
export function isEngineer(state) { return false; }

module.exports = { getClassName: getClassName, isBloodKnight: isBloodKnight, isCultist: isCultist, isDruid: isDruid, isNecromancer: isNecromancer, isEngineer: isEngineer };
