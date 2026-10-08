// Shared stat calculation helpers — MMORPG Tools Mod
// Exact copy of scripts/lib/stat-calc.js — pure math, no game-specific content
// All bonuses apply only to points ABOVE 10 (the base)

var BASE_STAT = 10;
var BASE_ATTACK_POWER = 25;
var BASE_MAX_HEALTH = 1000;
var BASE_MAX_MANA = 500;
var BASE_WALK_SPEED = 9;

export function statBonus(statValue) {
  return Math.max(0, (statValue || BASE_STAT) - BASE_STAT);
}

export function strengthDamageBonus(stats) {
  return statBonus(stats.strength);
}

export function intelligenceManaBonus(stats) {
  return statBonus(stats.intelligence) * 10;
}

export function vitalitySpeedMultiplier(stats) {
  return 1 + statBonus(stats.vitality) * 0.005;
}

export function enduranceHealthBonus(stats) {
  return statBonus(stats.endurance) * 10;
}

export function spiritBonusMana(stats) {
  return statBonus(stats.spirit);
}

export function calcAttackPower(stats) {
  var str = stats.strength || BASE_STAT;
  var dex = stats.dexterity || BASE_STAT;
  return str * 2 + Math.floor(dex * 0.5);
}

export function attackPowerDamageBonus(stats) {
  return Math.max(0, calcAttackPower(stats) - BASE_ATTACK_POWER);
}

export function calcSpellPower(stats) {
  var intel = stats.intelligence || BASE_STAT;
  var spr = stats.spirit || BASE_STAT;
  return intel * 2 + Math.floor(spr * 0.5);
}

export function spellPowerDamageBonus(stats) {
  var baseSpellPower = BASE_STAT * 2 + Math.floor(BASE_STAT * 0.5);
  return Math.max(0, calcSpellPower(stats) - baseSpellPower);
}

export function calcCritChance(stats) {
  var luck = stats.luck || BASE_STAT;
  var dex = stats.dexterity || BASE_STAT;
  return Math.min(50, 5 + Math.floor(luck * 0.5 + dex * 0.25));
}

export function calcDodge(stats) {
  var dex = stats.dexterity || BASE_STAT;
  var luck = stats.luck || BASE_STAT;
  return Math.min(40, Math.floor(dex * 0.4 + luck * 0.2));
}

export function rollCrit(critChance, randomFn) {
  var roll = randomFn();
  if (roll < critChance / 100) {
    var superRoll = randomFn();
    if (superRoll < 0.1) return 3;
    return 2;
  }
  return 1;
}

export function rollDodge(dodgeChance, randomFn) {
  return randomFn() < dodgeChance / 100;
}

export function resistanceDamageReduction(resistances, magicType) {
  if (!magicType || !resistances) return 0;
  var resValue = resistances[magicType] || 0;
  return Math.max(0, resValue - BASE_STAT);
}

export function calcMaxHealth(stats) {
  return BASE_MAX_HEALTH + enduranceHealthBonus(stats);
}

export function calcMaxMana(stats) {
  return BASE_MAX_MANA + intelligenceManaBonus(stats);
}

module.exports = {
  BASE_STAT: BASE_STAT,
  BASE_ATTACK_POWER: BASE_ATTACK_POWER,
  BASE_MAX_HEALTH: BASE_MAX_HEALTH,
  BASE_MAX_MANA: BASE_MAX_MANA,
  BASE_WALK_SPEED: BASE_WALK_SPEED,
  statBonus: statBonus,
  strengthDamageBonus: strengthDamageBonus,
  intelligenceManaBonus: intelligenceManaBonus,
  vitalitySpeedMultiplier: vitalitySpeedMultiplier,
  enduranceHealthBonus: enduranceHealthBonus,
  spiritBonusMana: spiritBonusMana,
  calcAttackPower: calcAttackPower,
  attackPowerDamageBonus: attackPowerDamageBonus,
  calcSpellPower: calcSpellPower,
  spellPowerDamageBonus: spellPowerDamageBonus,
  calcCritChance: calcCritChance,
  calcDodge: calcDodge,
  rollCrit: rollCrit,
  rollDodge: rollDodge,
  resistanceDamageReduction: resistanceDamageReduction,
  calcMaxHealth: calcMaxHealth,
  calcMaxMana: calcMaxMana,
};

// Starting stats for a fresh character: Vanguard leans strength and endurance.
export function calcBaseStats(raceIndex, classIndex, level) {
  var lv = Math.max(1, level || 1);
  var s = { strength: 14, dexterity: 10, intelligence: 10, endurance: 13, spirit: 10, vitality: 12, luck: 10 };
  if (raceIndex === 1) { s.dexterity += 2; s.spirit += 1; s.strength -= 1; }
  for (var k in s) s[k] += lv - 1;
  return s;
}
