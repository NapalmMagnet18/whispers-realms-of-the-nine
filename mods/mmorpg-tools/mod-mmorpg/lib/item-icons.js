// WHISPERS item art, cut from the creator's item sheet. Keyed by item id; the inventory draws these over any older icon.
var ITEM_ICONS = {
  'coins': '/cdn/value.2549e625a14795332e467d4542081035322aa70cc52ad63e3e823737f7b2c4d0.png',
  'health-potion': '/cdn/value.a1a947286a76456c3d3b2be345dd82dadb1847faa1300441dd45fd9c1a6a5428.png',
  'mana-potion': '/cdn/value.92a77d9274fa1859e5728065999535fc5681d52e0dad8219d30c40a3fbe830ce.png',
  'iron-sword': '/cdn/value.675433d075a3d17d74abb4ede67f738f67a9676c3b2b1b7cafc5a87c91a6029b.png',
  'wooden-shield': '/cdn/value.059e0a3c752a1f5677c284f9e44ecd1b50d6772be2de92a240b3e91a534361ef.png',
  'arcane-staff': '/cdn/value.e888191a88a3025d84a42626603061f882f819fcbc299e5983b5490f2a09c0af.png',
  'bow-quiver': '/cdn/value.bb0d828d852050a8d33b537fabab54a50df17b1a6af326f14cdf8c338524ce48.png',
  'copper-ore': '/cdn/value.facf72cb90f9b9d8b747c33c1a4048bfd1a8440ab0fe1314635237deecd0865f.png',
  'timber-logs': '/cdn/value.faa1caa9a0cf6fd75763ae18532eca3400495074fe6c2b5fcfaf7c4bdb246e88.png',
  'fish': '/cdn/value.bdf0bea42150499a5f972fffec39aaeaa9ef43d673fe12a95f1931e3dc9224b4.png',
  'herbs': '/cdn/value.1efbc26fa2fbc80628ed2b6d545ebc0cd67451818b56a74c70700b79897cac5c.png',
  'quest-scroll': '/cdn/value.33a9fb3951d15ff650163a4c13080e3122cd336e4f4a66623242e1fa6e47c183.png',
  'treasure-chest': '/cdn/value.75daaa703d1a9e4d9e9f40a81c8974b3726e36b8822d0ac7090e50c78f61e5a1.png',
  'lantern': '/cdn/value.3ff5682c08fdb5afc3a2a0a3f20711554e4381677aa3088cf8bfabca7a027433.png',
};
function iconFor(item) { return (item && ITEM_ICONS[item.id]) || (item && item.icon) || null; }
module.exports = { ITEM_ICONS: ITEM_ICONS, iconFor: iconFor };
