// Shop inventories for MMORPG Tools Mod — one generic shop
// Export interface matches scripts/lib/shop-data.js exactly
// Prices are copper (100c = 1s): price = buy, sell = 25% of buy (sellPrice). 'dren' is Quartermaster Dren's stall in Lantern's Reach.

var SHOP_INVENTORIES = {
  'general-shop': [
    { id: 'empty-vial', name: 'Empty Vial', icon: '/cdn/icon-potionempty-u99eojpn5.webp', slot: 'bag', price: 4, stackable: true, sell: 1, description: 'Stoppered glass. Alchemists need one per brew.' },
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

// Hask Brinewell's fish stall in Saltmere: cooked catch, the Saltborn health potion. Eaten from the bag (useFood, scripts/vitality.js):
// heals healOverTime HP across eatSeconds, broken by a hit
SHOP_INVENTORIES['hask'] = [
  { id: 'grilled-silverbelly', name: 'Grilled Silverbelly', icon: '/cdn/value.7d9b5ece69d3c22b6514a615191c76c6edf017b65f48d1f4e73302904b04c178.png', slot: 'bag', price: 15, stackable: true, consumable: true, description: 'Charred on a driftwood stick. Restores 300 health over 10 sec. Eating stops if you are struck.', stats: { healOverTime: 300, eatSeconds: 10 } },
  { id: 'red-snapper-steak', name: 'Red Snapper Steak', icon: '/cdn/value.6976256f86c25dae12b0aac525e76026730e4982c6a919bff75f0bd0369b574a.png', slot: 'bag', price: 40, stackable: true, consumable: true, description: 'Pan-seared with sea herbs. Restores 700 health over 12 sec. Eating stops if you are struck.', stats: { healOverTime: 700, eatSeconds: 12 } },
  { id: 'saltborn-fish-stew', name: 'Saltborn Fish Stew', icon: '/cdn/value.6f70b3531cdca8f325a168e649b5e0125b2c2b0b36fd10fa38e1ee2c22abbd1a.png', slot: 'bag', price: 90, stackable: true, consumable: true, description: 'Hask\'s grandmother\'s pot. Restores 1400 health over 15 sec. Eating stops if you are struck.', stats: { healOverTime: 1400, eatSeconds: 15 } },
];

// Mott Farwander's caravan (scripts/caravan-route.js swaps state.shop by the stop it stands at)
SHOP_INVENTORIES['mott-reach'] = [
  { id: 'mott-waybread', name: "Mott's Waybread", icon: '/cdn/value.da27050004cfd3d7a59925f477676b26297dcb98663be58be06d4659b108ed73.png', slot: 'bag', price: 10, stackable: true, consumable: true, description: "Baked in the Reach, three days ago. Still good. Mostly. Restores 200 health over 8 sec. Eating stops if you are struck.", stats: { healOverTime: 200, eatSeconds: 8 } },
  { id: 'mott-smoked-sausage', name: "Smoked Sausage Coil", icon: '/cdn/value.8d8e8e7b83ed8167e1914bb71573af62fefbae593da830520eb55cca9e83d9f3.png', slot: 'bag', price: 30, stackable: true, consumable: true, description: "Cured over applewood on the long road. Restores 450 health over 12 sec. Eating stops if you are struck.", stats: { healOverTime: 450, eatSeconds: 12 } },
];
SHOP_INVENTORIES['mott-fen'] = [
  { id: 'mott-myrtle-tea', name: "Bog-Myrtle Tea", icon: '/cdn/value.bf15ca9abbc166c1a5f7548006e86c429025517b089efcc37e77909cb6bb0ae9.png', slot: 'bag', price: 25, stackable: true, consumable: true, description: "Bitter, green, and it keeps the fen-chill out. Restores 350 health over 8 sec. Eating stops if you are struck.", stats: { healOverTime: 350, eatSeconds: 8 } },
  { id: 'mott-marsh-honeycomb', name: "Marsh Honeycomb", icon: '/cdn/value.00e2e23c067f445dbceadd74cc472ea874c09043628f42e056bb4e91894ee6f8.png', slot: 'bag', price: 60, stackable: true, consumable: true, description: "Cut from a reed-hive. Mott wears the stings proudly. Restores 700 health over 12 sec. Eating stops if you are struck.", stats: { healOverTime: 700, eatSeconds: 12 } },
];
SHOP_INVENTORIES['mott-reed'] = [
  { id: 'mott-reed-ricecake', name: "Reedhaven Rice Cake", icon: '/cdn/value.47acf3e56c201b22b952954752c278bd167127117d6cb2de45bd15c176a125da.png', slot: 'bag', price: 30, stackable: true, consumable: true, description: "Pressed in reed leaves by the Reedbound. Restores 400 health over 10 sec. Eating stops if you are struck.", stats: { healOverTime: 400, eatSeconds: 10 } },
  { id: 'mott-eel-skewer', name: "Lantern-Eel Skewer", icon: '/cdn/value.2c34dafd2c7a4f2088c6bf2c994715734c5697c7d1f6c9bc9595dcd1be231e7d.png', slot: 'bag', price: 95, stackable: true, consumable: true, description: "Glows faintly. So will you, for a minute. Restores 900 health over 14 sec. Eating stops if you are struck.", stats: { healOverTime: 900, eatSeconds: 14 } },
];

// Mott in a storm: the caravan parks wherever the rain catches it and the kettle goes on (scripts/caravan-route.js)
SHOP_INVENTORIES['mott-storm'] = [
  { id: 'mott-storm-tea', name: "Mott's Storm Tea", icon: '/cdn/value.3ca0b718b1c90150cef47c906a8542f396e22133cb3bf37208f61afa95d25da3.png', slot: 'bag', price: 5, stackable: true, consumable: true, description: "Poured hot from a dented kettle while the rain hammers the canvas. Cinnamon, bog-myrtle, a splash of something. Restores 400 health over 6 sec. Drinking stops if you are struck.", stats: { healOverTime: 400, eatSeconds: 6 } },
  { id: 'mott-waybread', name: "Mott's Waybread", icon: '/cdn/value.da27050004cfd3d7a59925f477676b26297dcb98663be58be06d4659b108ed73.png', slot: 'bag', price: 10, stackable: true, consumable: true, description: "Baked in the Reach, three days ago. Still good. Mostly. Restores 200 health over 8 sec. Eating stops if you are struck.", stats: { healOverTime: 200, eatSeconds: 8 } },
];

// what a vendor pays for a bag good it never sells (copper)
var SELL_ONLY = { 'iron-ore': 12, 'sunleaf': 4, 'briarroot': 10, 'gravebloom': 22, 'copper-bar': 14, 'iron-bar': 30, 'ghostlight-oil': 70, 'copper-ore': 5, 'log': 3, 'timber-logs': 3, 'empty-vial': 1 };
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
