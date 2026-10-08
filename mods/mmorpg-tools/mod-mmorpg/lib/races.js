// === RACE & CLASS DATA FOR MMORPG TOOLS MOD ===
// Stripped version: 2 races, 1 class each, male-only models, static PNG portraits
// Export interface matches scripts/lib/races.js exactly

var CLASSES = [
  'Vanguard'
];

var CLASS_STATS = {
  'Vanguard': { str: 50, agi: 50, mag: 50, def: 50 },
};

var CLASS_ABILITIES = {
  'Vanguard': ['Strike', 'Heavy Strike', 'Guard'],
};

var RACE_DESCRIPTIONS = {
  'Marchborn': 'Folk of the Lantern March, raised under the beacon of Lantern\'s Reach. Steady hands, stubborn hearts.',
  'Briarkin': 'Wanderers from the deep Briarwild who hear the old whispers in the trees and follow them home.',
};

var CLASS_LORE = {
  'Vanguard': 'A shield-bearing guardian of the March. Strikes true, hits hard when it counts, and holds the line with Guard.',
};

var CLASS_ICONS = {
  'Vanguard': '/cdn/value.063462cc9e460847ae17aea8a9ba80fbdb90fd847808c9fe3e53c1122bc5975a.png',
};

var CLASS_COLORS = {
  'Vanguard': '#AF8951',
};

// 2 race backgrounds
var RACE_BACKGROUNDS = [
  '/cdn/image-fantasy-painted-background-warrior-castle-kingdom-sunny.png',
  '/cdn/image-fantasy-painted-background-mage-arcane-tower-night-sky.png',
];

// === CHARACTER CUSTOMIZATION OPTIONS (kept intact from original) ===

var SKIN_TONES = [
  '#FDDBC7', '#F5C9A8', '#E8B48A', '#D4956B', '#C07840',
  '#8D5524', '#5C3310', '#3B1E08', '#7B8D8E', '#5A7247',
  '#3D6B4F', '#7A9BB5', '#C4564A', '#9B7EC9', '#D4A86A',
];

var HAIR_COLORS = [
  '#1A1A1A', '#3B2314', '#6B3A2A', '#8C4B2D', '#C8874B',
  '#E8D5A3', '#B03020', '#F0F0F0', '#4A4A5A', '#2E1A47',
  '#1A4A3A', '#1E3A5F', '#C94040', '#D4A017', '#7A3B6A',
];

var FACE_OPTIONS = [
  'Rugged', 'Youthful', 'Scarred', 'Noble', 'Weathered',
  'Fierce', 'Gaunt', 'Round', 'Chiseled', 'Battle-Worn',
];

var HAIR_STYLES = [
  'Short', 'Long', 'Braided', 'Mohawk', 'Shaved',
  'Wild', 'Elegant', 'Dreadlocks', 'Ponytail', 'Flowing',
];

var FACIAL_HAIR = [
  'None', 'Stubble', 'Full Beard', 'Goatee', 'Mustache',
  'Braided Beard', 'Mutton Chops', 'Soul Patch', 'Handlebar', 'Shadow',
];

var WARRIOR_MODEL = '/cdn/model-humanoid-fantasy-warrior-male-black-robes.glb?animations=Idle,Walk,Run,Sprint,Jump,BeHit_FlyUp,Dead,Skill_01,Basic_Jump,Combat_Stance,Left_Slash,Reaping_Swing,Roll_Dodge_1';
var WARRIOR_PORTRAIT = '/cdn/value.c4c67311858819ab9e86ef81f51da99f69509138567a3eabdcc3d984547459f6.png';

var MAGE_MODEL = '/cdn/model-humanoid-fantasy-mage-male-dark-robes.glb?animations=Idle,Walk,Run,Sprint,Jump,BeHit_FlyUp,Dead,Skill_01,Basic_Jump,Combat_Stance,Left_Slash,Reaping_Swing,Roll_Dodge_1';
var MAGE_PORTRAIT = '/cdn/value.95a07d181d4a68b47e7b0a8bb46cf1769f5776bc254f0976ed6a10af4f5f9a4e.png';

var RACES = [
  {
    name: 'Marchborn',
    classes: ['Vanguard'],
    malePortrait: WARRIOR_PORTRAIT,
    femalePortrait: WARRIOR_PORTRAIT,
    maleAnimatedPortrait: WARRIOR_PORTRAIT,
    femaleAnimatedPortrait: WARRIOR_PORTRAIT,
    maleModel: WARRIOR_MODEL,
    femaleModel: WARRIOR_MODEL,
  },
  {
    name: 'Briarkin',
    classes: ['Vanguard'],
    malePortrait: MAGE_PORTRAIT,
    femalePortrait: MAGE_PORTRAIT,
    maleAnimatedPortrait: MAGE_PORTRAIT,
    femaleAnimatedPortrait: MAGE_PORTRAIT,
    maleModel: MAGE_MODEL,
    femaleModel: MAGE_MODEL,
  },
];

module.exports = {
  RACES: RACES,
  CLASSES: CLASSES,
  CLASS_STATS: CLASS_STATS,
  CLASS_ABILITIES: CLASS_ABILITIES,
  RACE_DESCRIPTIONS: RACE_DESCRIPTIONS,
  CLASS_LORE: CLASS_LORE,
  CLASS_ICONS: CLASS_ICONS,
  CLASS_COLORS: CLASS_COLORS,
  RACE_BACKGROUNDS: RACE_BACKGROUNDS,
  SKIN_TONES: SKIN_TONES,
  HAIR_COLORS: HAIR_COLORS,
  FACE_OPTIONS: FACE_OPTIONS,
  HAIR_STYLES: HAIR_STYLES,
  FACIAL_HAIR: FACIAL_HAIR,
};
