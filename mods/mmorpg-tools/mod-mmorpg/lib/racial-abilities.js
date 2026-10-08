// ============================================================================
// RACIAL ABILITIES — MMORPG Tools Mod (stripped)
// No spells, no abilities. Spellbar starts completely empty.
// Export interface matches scripts/lib/racial-abilities.js exactly
// ============================================================================

// Attack spell stub — kept for interface compatibility but not placed on spellbar
var ATTACK_SPELL = {
  id: 'attack',
  name: 'Attack',
  icon: '/cdn/icon-generic-melee-slash.png',
  description: 'Melee strike dealing physical damage based on Strength.',
  shortDesc: 'Melee Strike',
  type: 'attack',
  raceIndex: -1,
  statBuff: null,
  buffDuration: 0,
  effectDuration: 0,
  cooldown: 0.5,
  speedMod: null,
  damageMod: null,
  special: null,
  vfx: null,
  sfx: '/cdn/sfx-sword-slash-metal-swing.mp3'
};

// No racial abilities — empty object
var RACIAL_ABILITIES = {};

// No class spells — empty array
var CLASS_SPELLS = {};

// No extra class spells — empty object
var CLASS_EXTRA_SPELLS = {};

module.exports = { ATTACK_SPELL: ATTACK_SPELL, RACIAL_ABILITIES: RACIAL_ABILITIES, CLASS_SPELLS: CLASS_SPELLS, CLASS_EXTRA_SPELLS: CLASS_EXTRA_SPELLS };
