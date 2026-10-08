// Shop inventories for MMORPG Tools Mod — one generic shop
// Export interface matches scripts/lib/shop-data.js exactly
// Prices are copper (100c = 1s): price = buy, sell = 25% of buy (sellPrice). 'dren' is Quartermaster Dren's stall in Lantern's Reach.

var SHOP_INVENTORIES = {
  'general-shop': [
    {
      id: 'health-potion',
      name: 'Health Potion',
      icon: '/cdn/value.a1a947286a76456c3d3b2be345dd82dadb1847faa1300441dd45fd9c1a6a5428.png',
      slot: 'bag',
      price: 25,
      consumable: true,
      stackable: true,
      description: 'Restores 200 HP.',
      stats: { healAmount: 200 },
    },
    {
      id: 'mana-potion',
      name: 'Mana Potion',
      icon: '/cdn/value.92a77d9274fa1859e5728065999535fc5681d52e0dad8219d30c40a3fbe830ce.png',
      slot: 'bag',
      price: 25,
      consumable: true,
      stackable: true,
      description: 'Restores 200 Mana.',
      stats: { manaAmount: 200 },
    },
    {
      id: 'iron-sword',
      name: 'Iron Sword',
      icon: '/cdn/value.675433d075a3d17d74abb4ede67f738f67a9676c3b2b1b7cafc5a87c91a6029b.png',
      slot: 'mainHand',
      price: 120,
      description: 'A sturdy iron blade.',
      stats: { damage: { min: 6, max: 12 } },
    },
    {
      id: 'leather-armor',
      name: 'Leather Armor',
      icon: '/cdn/icon-fantasy-leather-armor-chest.png',
      slot: 'chest',
      price: 150,
      description: 'Basic leather protection.',
      stats: { defence: 10 },
    },
    {
      id: 'wooden-shield',
      name: 'Wooden Shield',
      icon: '/cdn/value.059e0a3c752a1f5677c284f9e44ecd1b50d6772be2de92a240b3e91a534361ef.png',
      slot: 'offHand',
      price: 90,
      description: 'Oak boards under an iron compass boss.',
      stats: { defence: 8 },
    },
  ],
};
SHOP_INVENTORIES['dren'] = SHOP_INVENTORIES['general-shop'];
// Hild Copperhand's arms table on Copperlane, east of the Reach: steel a step past the starter kit
SHOP_INVENTORIES['armsmith'] = [
  { id: 'iron-sword', name: 'Iron Sword', icon: '/cdn/value.675433d075a3d17d74abb4ede67f738f67a9676c3b2b1b7cafc5a87c91a6029b.png', slot: 'mainHand', price: 120, description: 'A sturdy iron blade.', stats: { damage: { min: 6, max: 12 } } },
  { id: 'copperlane-hand-axe', name: 'Copperlane Hand Axe', icon: '/cdn/icon-fantasy-generic-axe.png', slot: 'mainHand', price: 180, description: 'Bearded head, ash haft, honed on Hild\'s wheel.', stats: { damage: { min: 8, max: 14 } } },
  { id: 'paired-fangs', name: 'Paired Fangs', icon: '/cdn/icon-fantasy-generic-dagger.png', slot: 'mainHand', price: 200, description: 'Two short blades for a quick hand.', stats: { damage: { min: 7, max: 13 } } },
  { id: 'ashwood-longbow', name: 'Ashwood Longbow', icon: '/cdn/icon-fantasy-generic-bow.png', slot: 'mainHand', price: 220, description: 'Strung with waxed gut. Draws long and true.', stats: { damage: { min: 7, max: 15 }, range: 32 } },
  { id: 'runed-oak-staff', name: 'Runed Oak Staff', icon: '/cdn/icon-fantasy-generic-staff.png', slot: 'mainHand', price: 240, description: 'Oak cut under a lantern, its runes still warm.', stats: { damage: { min: 6, max: 12 }, magic: 10 } },
  { id: 'smiths-warhammer', name: 'Smith\'s Warhammer', icon: '/cdn/icon-fantasy-generic-hammer.png', slot: 'mainHand', price: 260, description: 'Heavy as a promise. Hits like one.', stats: { damage: { min: 10, max: 18 } } },
  { id: 'iron-rim-shield', name: 'Iron-Rim Shield', icon: '/cdn/value.059e0a3c752a1f5677c284f9e44ecd1b50d6772be2de92a240b3e91a534361ef.png', slot: 'offHand', price: 160, description: 'Oak boards bound in a hammered iron rim.', stats: { defence: 14 } },
];

// what a vendor pays for a bag good it never sells (copper)
var SELL_ONLY = { 'copper-ore': 5, 'log': 3, 'timber-logs': 3, 'empty-vial': 1 };
var SELL_RATE = 0.25;

var SHOP_BUILDINGS = Object.keys(SHOP_INVENTORIES);

export function hasShop(buildingId) {
  return !!SHOP_INVENTORIES[buildingId];
}

export function getShopItems(buildingId) {
  return SHOP_INVENTORIES[buildingId] || [];
}

export function findShopItem(itemId) {
  for (var bId in SHOP_INVENTORIES) {
    var items = SHOP_INVENTORIES[bId];
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === itemId) return items[i];
    }
  }
  return null;
}

export function buyPrice(itemId) {
  var it = findShopItem(itemId);
  return it ? it.price : 0;
}

// copper a vendor pays for ONE of this item; 0 = it won't buy it
export function sellPrice(item) {
  if (!item) return 0;
  var id = typeof item === 'string' ? item : item.id;
  if (typeof item === 'object' && typeof item.sell === 'number') return item.sell;
  if (SELL_ONLY[id] != null) return SELL_ONLY[id];
  var it = findShopItem(id);
  return it ? Math.max(1, Math.floor(it.price * SELL_RATE)) : 0;
}

module.exports = { SELL_ONLY: SELL_ONLY, SELL_RATE: SELL_RATE, buyPrice: buyPrice, sellPrice: sellPrice,  SHOP_INVENTORIES: SHOP_INVENTORIES, SHOP_BUILDINGS: SHOP_BUILDINGS, hasShop: hasShop, getShopItems: getShopItems, findShopItem: findShopItem };
