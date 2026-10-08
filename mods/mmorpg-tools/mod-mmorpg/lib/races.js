// === RACE & CLASS DATA FOR MMORPG TOOLS MOD ===
// Four races (races.yml), three classes each; two shared models for now, static PNG portraits
// Export interface matches scripts/lib/races.js exactly

var CLASSES = ['Vanguard', 'Arcanist', 'Pathfinder', 'Shade'];

var CLASS_STATS = {
  'Vanguard': { str: 60, agi: 45, mag: 30, def: 60 },
  'Arcanist': { str: 30, agi: 45, mag: 70, def: 35 },
  'Pathfinder': { str: 40, agi: 70, mag: 40, def: 45 },
  'Shade': { str: 45, agi: 75, mag: 35, def: 35 },
};

var CLASS_ABILITIES = {
  'Vanguard': ['Strike', 'Heavy Strike', 'Guard'],
  'Arcanist': ['Firebolt', 'Frost Shard', 'Ward'],
  'Pathfinder': ['Arrow', 'Volley', 'Dodge Roll'],
  'Shade': ['Strike', 'Shadowstep', 'Veil'],
};

var RACE_DESCRIPTIONS = {
  'Marchborn': 'Folk of the Lantern March, raised under the beacon of Lantern\'s Reach. Steady hands, stubborn hearts.',
  'Briarkin': 'Wanderers from the deep Briarwild who hear the old whispers in the trees and follow them home.',
  'Emberforged': 'Stone-shouldered smiths of the red mesas of Cinderhold, warm as their forges and slow to anger.',
  'Saltborn': 'Tide-weathered sailors and net-menders of Gullrest on the Saltmere coast, at home in any storm.',
};

var CLASS_LORE = {
  'Vanguard': 'A shield-bearing guardian of the March. Strikes true, hits hard when it counts, and holds the line with Guard.',
  'Arcanist': 'A scholar of the old whispers. Hurls firebolts and frost shards from afar and wraps allies in a Ward.',
  'Pathfinder': 'A scout of the wild roads. Looses arrows and volleys at range and rolls clear of every bite.',
  'Shade': 'A keeper of quiet doors. Veils from sight, steps through shadow behind a foe, and strikes once, hard, from where no one is looking.',
};

var CLASS_ICONS = {
  'Vanguard': '/cdn/value.063462cc9e460847ae17aea8a9ba80fbdb90fd847808c9fe3e53c1122bc5975a.png',
  'Arcanist': '/cdn/icon-fantasy-generic-staff.png',
  'Pathfinder': '/cdn/icon-fantasy-generic-bow.png',
  'Shade': '/cdn/icon-fantasy-generic-dagger.png',
};

var CLASS_COLORS = {
  'Vanguard': '#AF8951',
  'Arcanist': '#7FA7D9',
  'Pathfinder': '#8FB35A',
  'Shade': '#9A7BC4',
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

var ALL_CLASSES = ['Vanguard', 'Arcanist', 'Pathfinder', 'Shade'];
// Four races, two shared bodies for now: Marchborn & Emberforged wear the warrior model, Briarkin & Saltborn the mage model.
// id / zone / start mirror scripts/lib/data/races.yml (the start point used on Enter World); tint = the body's skin wash.
function race(id, name, model, portrait, zone, tint, defaultSkin) {
  return { id: id, name: name, classes: ALL_CLASSES.slice(), zone: zone, tint: tint, defaultSkin: defaultSkin,
    malePortrait: portrait, femalePortrait: portrait, maleAnimatedPortrait: portrait, femaleAnimatedPortrait: portrait,
    maleModel: model, femaleModel: model };
}
var START = { marchborn: { x: -1, y: 1.6, z: -86 }, briarkin: { x: -720, y: 20.2, z: 70 }, emberforged: { x: 900, y: 41, z: -170 }, saltborn: { x: 244, y: 3.6, z: 1430 }, reedbound: { x: -426, y: 15, z: 574 }, veylori: { x: -200, y: 123, z: -1094 } };
var RACES = [
  race('marchborn', 'Marchborn', WARRIOR_MODEL, WARRIOR_PORTRAIT, "Lantern's Reach", '#e8cfae', 1),
  race('briarkin', 'Briarkin', MAGE_MODEL, MAGE_PORTRAIT, 'Thornhollow, Briarwild Deepwood', '#b8d0a0', 10),
  race('emberforged', 'Emberforged', WARRIOR_MODEL, WARRIOR_PORTRAIT, 'Cinderhold, Emberstone Highlands', '#d49a78', 12),
  race('saltborn', 'Saltborn', MAGE_MODEL, MAGE_PORTRAIT, 'Gullrest, Saltmere Coast', '#a9c4d6', 11),
  race('reedbound', 'Reedbound', MAGE_MODEL, '/cdn/value.c7d8f016563efa52e6a4b5d1a5c83f904d43ead86312830999296aedd938d914.png', 'Reedhaven Refuge, the Western Fen', '#a8b89a', 10),
  race('veylori', 'Veylori', WARRIOR_MODEL, '/cdn/value.72b25fe1393fbe5d1293fde14e53ff4c4360b7b9d2788ded9522c849b165ff94.png', 'Starfall Eyrie, the Greyspine', '#c4bcd8', 11),
];
RACES.forEach(function (r) { r.start = START[r.id]; });

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
