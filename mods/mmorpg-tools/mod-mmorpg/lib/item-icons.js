// WHISPERS item art, cut from the creator's item sheet. Keyed by item id; the inventory draws these over any older icon.
// 2026-10-08: the creator's painted RPG icon set replaces sheet cuts where it has a match.
// UI_ICONS: the same set for windows, buttons and portraits.
var UI_ICONS = { bag: '/cdn/icon-bag-u4xuwt85v.webp', journal: '/cdn/icon-book-u7a5b5oly.webp', spellbook: '/cdn/icon-bookholy-u1eqmu24i.webp', character: '/cdn/icon-helmet-u9bjftt8q.webp', gold: '/cdn/icon-goldcoins-u5s6b5n1n.webp', yes: '/cdn/icon-yes-u7wpo9kik.webp', no: '/cdn/icon-no-u8c9x5k6e.webp', go: '/cdn/icon-go-u3btdaqbv.webp', wolf: '/cdn/icon-bigcatwhite-u36ftl15e.webp', dragon: '/cdn/icon-dragon-u7aezrayn.webp', orc: '/cdn/icon-orc-u3xe7yu0d.webp', bird: '/cdn/icon-birdblue-u3gqn02ts.webp', elite: '/cdn/icon-aurared-u1ui80s8e.webp', fireball: '/cdn/icon-fireball-u1ns0jvs9.webp', frostball: '/cdn/icon-frostball-u6cleszd4.webp' };
var ITEM_ICONS = {
  'log': '/cdn/value.faa1caa9a0cf6fd75763ae18532eca3400495074fe6c2b5fcfaf7c4bdb246e88.png',
  'coins': '/cdn/icon-goldcoins-u5s6b5n1n.webp',
  'health-potion': '/cdn/icon-potionred-u3kz16gx0.webp',
  'mana-potion': '/cdn/icon-potionblue-u0c1x893y.webp',
  'iron-sword': '/cdn/icon-sword-u16jp5yx9.webp',
  'wooden-shield': '/cdn/icon-shield-u3qgy9lfm.webp',
  'arcane-staff': '/cdn/value.e888191a88a3025d84a42626603061f882f819fcbc299e5983b5490f2a09c0af.png',
  'bow-quiver': '/cdn/icon-crossbow-u18wj7tj2.webp',
  'copper-ore': '/cdn/value.facf72cb90f9b9d8b747c33c1a4048bfd1a8440ab0fe1314635237deecd0865f.png',
  'timber-logs': '/cdn/value.faa1caa9a0cf6fd75763ae18532eca3400495074fe6c2b5fcfaf7c4bdb246e88.png',
  'fish': '/cdn/value.bdf0bea42150499a5f972fffec39aaeaa9ef43d673fe12a95f1931e3dc9224b4.png',
  'herbs': '/cdn/value.1efbc26fa2fbc80628ed2b6d545ebc0cd67451818b56a74c70700b79897cac5c.png',
  'quest-scroll': '/cdn/value.33a9fb3951d15ff650163a4c13080e3122cd336e4f4a66623242e1fa6e47c183.png',
  'treasure-chest': '/cdn/icon-chest-u39cvkyxi.webp',
  'lantern': '/cdn/value.3ff5682c08fdb5afc3a2a0a3f20711554e4381677aa3088cf8bfabca7a027433.png',
  'empty-vial': '/cdn/icon-potionempty-u99eojpn5.webp',
  'starter-sword': '/cdn/icon-sword-u16jp5yx9.webp',
  'starter-black-sword': '/cdn/icon-swordblood-u1d0q7ruq.webp',
  'skull-shield': '/cdn/icon-shield2-u7ym8ql7u.webp',
  'leather-armor': '/cdn/icon-armor-u6sh4udrk.webp',
  'starter-robes': '/cdn/icon-armor-u6sh4udrk.webp',
  'starter-basic-robes': '/cdn/icon-armor-u6sh4udrk.webp',
  'gilded-cuirass': '/cdn/icon-armorgold-u8a59gm9a.webp',
  'iron-helm': '/cdn/icon-helmet-u9bjftt8q.webp',
  'iron-boots': '/cdn/icon-boots-u93i261td.webp',
  'iron-gauntlets': '/cdn/icon-glove-u01jhmrh8.webp',
  'iron-greaves': '/cdn/icon-legarmor-u1z2ehbh1.webp',
  'battle-axe': '/cdn/icon-axe-u8trhlxsf.webp',
  'war-hammer': '/cdn/icon-hammerheavy-u5ndnaxuu.webp',
  'crossbow': '/cdn/icon-crossbow-u18wj7tj2.webp',
  'ember-ring': '/cdn/icon-ringmagic-u6z0dou5e.webp',
  'tome': '/cdn/icon-book-u7a5b5oly.webp',
  'holy-tome': '/cdn/icon-bookholy-u1eqmu24i.webp',
  'bag': '/cdn/icon-bag-u4xuwt85v.webp',
};
function iconFor(item) { return (item && ITEM_ICONS[item.id]) || (item && item.icon) || null; }
module.exports = { ITEM_ICONS: ITEM_ICONS, UI_ICONS: UI_ICONS, iconFor: iconFor };
