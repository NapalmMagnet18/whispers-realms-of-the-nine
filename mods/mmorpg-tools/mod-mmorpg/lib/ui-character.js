// Character sheet — MMORPG Tools Mod
const { renderInventory } = require('./ui-inventory.js');

export function renderCharacter(localPlayer) { return renderInventory(localPlayer); }
module.exports = { renderCharacter: renderCharacter };
