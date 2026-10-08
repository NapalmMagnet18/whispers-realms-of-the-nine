// Shop inventories for MMORPG Tools Mod — one generic shop
// Export interface matches scripts/lib/shop-data.js exactly

var SHOP_INVENTORIES = {
  'general-shop': [
    {
      id: 'health-potion',
      name: 'Health Potion',
      icon: '/cdn/icon-fantasy-health-potion-red.png',
      slot: 'bag',
      price: 50,
      consumable: true,
      stackable: true,
      description: 'Restores 200 HP.',
      stats: { healAmount: 200 },
    },
    {
      id: 'mana-potion',
      name: 'Mana Potion',
      icon: '/cdn/icon-fantasy-mana-potion-blue.png',
      slot: 'bag',
      price: 50,
      consumable: true,
      stackable: true,
      description: 'Restores 200 Mana.',
      stats: { manaAmount: 200 },
    },
    {
      id: 'iron-sword',
      name: 'Iron Sword',
      icon: '/cdn/icon-fantasy-iron-sword-simple.png',
      slot: 'mainHand',
      price: 200,
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
  ],
};

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

module.exports = { SHOP_INVENTORIES: SHOP_INVENTORIES, SHOP_BUILDINGS: SHOP_BUILDINGS, hasShop: hasShop, getShopItems: getShopItems, findShopItem: findShopItem };
