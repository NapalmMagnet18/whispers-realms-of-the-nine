// Spellbook Panel — MMORPG Tools Mod
// Empty spellbook with gothic frame styling
// module.exports = { renderSpellbook, renderSpellbookTab, getKnownSpells, getSpellById, resolveGlobalClassIndex }

var { ATTACK_SPELL, RACIAL_ABILITIES, CLASS_SPELLS, CLASS_EXTRA_SPELLS } = require('./racial-abilities.js');
var { RACES, CLASSES } = require('./races.js');

export function resolveGlobalClassIndex(raceIndex, localClassIndex) {
  var race = RACES[raceIndex];
  if (!race) return -1;
  var raceClasses = race.classes || [];
  var className = raceClasses[localClassIndex];
  if (!className) return -1;
  for (var ci = 0; ci < CLASSES.length; ci++) {
    if (CLASSES[ci] === className) return ci;
  }
  return -1;
}

export function getKnownSpells(raceIndex, localClassIndex) {
  // Mod: return empty — no spells
  return [];
}

export function getSpellById(spellId, raceIndex, localClassIndex) {
  if (spellId === 'attack') return ATTACK_SPELL;
  return null;
}

export function renderSpellbookTab(s) {
  return renderSpellbook({ state: s });
}

export function renderSpellbook(localPlayer) {
  var s = localPlayer.state || localPlayer;

  return ''
    + '<style>'
    + "@font-face {font-family:'Cinzel';src:url('/cdn/font-cinzel-regular.woff2') format('woff2');font-weight:400;font-display:swap}"
    + "@font-face {font-family:'Cinzel';src:url('/cdn/font-cinzel-bold.woff2') format('woff2');font-weight:700;font-display:swap}"
    + '</style>'
    + '<div style="'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'min-height:200px;padding:40px 20px;'
    + 'font-family:Cinzel,Palatino,Georgia,serif;'
    + '">'
    + '<div style="font-size:20px;color:rgba(180,155,100,0.6);letter-spacing:2px;text-align:center;margin-bottom:12px;">SPELLBOOK</div>'
    + '<div style="height:1px;width:60%;background:linear-gradient(90deg,transparent,rgba(80,65,40,0.4),transparent);margin-bottom:20px;"></div>'
    + '<div style="font-size:18px;color:rgba(150,130,100,0.5);text-align:center;font-style:italic;line-height:1.6;">'
    + 'No abilities learned yet.<br/>Your grimoire awaits its first inscription.'
    + '</div>'
    + '</div>';
}

module.exports = { renderSpellbook: renderSpellbook, renderSpellbookTab: renderSpellbookTab, getKnownSpells: getKnownSpells, getSpellById: getSpellById, resolveGlobalClassIndex: resolveGlobalClassIndex };
