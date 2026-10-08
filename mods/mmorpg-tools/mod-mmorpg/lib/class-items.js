// Class-specific starting items for MMORPG Tools Mod
// One entry for "Vanguard" with a generic sword and robes
// Export interface matches scripts/lib/class-items.js exactly

var CLASS_STARTING_ITEMS = {
  'Vanguard': [
    { id: 'starter-sword', name: 'Sword', icon: '/cdn/icon-fantasy-generic-sword.png', slot: 'mainHand', stats: { damage: { min: 4, max: 10 } } },
    { id: 'starter-robes', name: 'Robes', icon: '/cdn/icon-fantasy-generic-robes.png', slot: 'chest', stats: { defence: 6 } },
  ],
};

// Universal starter items (fallback)
var STARTER_ITEMS = {
  'starter-black-sword': {
    id: 'starter-black-sword', name: 'Black Sword',
    icon: '/cdn/icon-fantasy-generic-black-sword.png',
    slot: 'mainHand',
    stats: { damage: { min: 4, max: 10 } },
  },
  'starter-basic-robes': {
    id: 'starter-basic-robes', name: 'Basic Robes',
    icon: '/cdn/icon-fantasy-generic-dark-robes.png',
    slot: 'chest',
    stats: { defence: 10 },
  },
};

// Build flat lookup: itemId → item definition
var ITEM_LOOKUP = {};
var classKeys = Object.keys(CLASS_STARTING_ITEMS);
for (var ci = 0; ci < classKeys.length; ci++) {
  var items = CLASS_STARTING_ITEMS[classKeys[ci]];
  for (var ii = 0; ii < items.length; ii++) {
    ITEM_LOOKUP[items[ii].id] = items[ii];
  }
}
// Add starter items to lookup
var starterKeys = Object.keys(STARTER_ITEMS);
for (var si = 0; si < starterKeys.length; si++) {
  ITEM_LOOKUP[starterKeys[si]] = STARTER_ITEMS[starterKeys[si]];
}

// Add shop items to lookup so equip system can resolve slots/stats
try {
  var { SHOP_INVENTORIES } = require('./shop-data.js');
  var shopBuildingKeys = Object.keys(SHOP_INVENTORIES);
  for (var sbi = 0; sbi < shopBuildingKeys.length; sbi++) {
    var shopItems = SHOP_INVENTORIES[shopBuildingKeys[sbi]];
    for (var sii = 0; sii < shopItems.length; sii++) {
      ITEM_LOOKUP[shopItems[sii].id] = shopItems[sii];
    }
  }
} catch(e) { /* shop-data not yet loaded — fine */ }

module.exports = { CLASS_STARTING_ITEMS: CLASS_STARTING_ITEMS, STARTER_ITEMS: STARTER_ITEMS, ITEM_LOOKUP: ITEM_LOOKUP };
