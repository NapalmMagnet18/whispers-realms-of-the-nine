// Weapon data — MMORPG Tools Mod (stub)
// Export interface matches scripts/lib/weapon-data.js exactly

var classItems = require('mod-mmorpg/lib/class-items.js');
var ITEM_LOOKUP = classItems.ITEM_LOOKUP;

var UNARMED_MIN = 1;
var UNARMED_MAX = 3;
var COMBO_BONUS = 5;

export function getWeaponDamage(equippedItem) {
  if (!equippedItem) return { min: UNARMED_MIN, max: UNARMED_MAX };

  var stats = equippedItem.stats;
  if (stats && stats.damage && typeof stats.damage.min === 'number' && typeof stats.damage.max === 'number') {
    return { min: stats.damage.min, max: stats.damage.max };
  }

  var lookup = ITEM_LOOKUP[equippedItem.id];
  if (lookup && lookup.stats && lookup.stats.damage && typeof lookup.stats.damage.min === 'number' && typeof lookup.stats.damage.max === 'number') {
    return { min: lookup.stats.damage.min, max: lookup.stats.damage.max };
  }

  if (stats && typeof stats.attack === 'number') {
    return { min: stats.attack, max: stats.attack };
  }
  if (lookup && lookup.stats && typeof lookup.stats.attack === 'number') {
    return { min: lookup.stats.attack, max: lookup.stats.attack };
  }

  return { min: UNARMED_MIN, max: UNARMED_MAX };
}

export function calcHitDamage(range, comboCount) {
  var bonus = Math.max(0, (comboCount - 1)) * COMBO_BONUS;
  return { min: range.min, max: range.max, bonus: bonus };
}

module.exports = {
  UNARMED_MIN: UNARMED_MIN,
  UNARMED_MAX: UNARMED_MAX,
  COMBO_BONUS: COMBO_BONUS,
  ITEM_LOOKUP: ITEM_LOOKUP,
  getWeaponDamage: getWeaponDamage,
  calcHitDamage: calcHitDamage,
};
