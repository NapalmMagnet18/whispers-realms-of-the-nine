// Profession data — empty by default, add your own professions here
// Keyed by building object ID. Each building that offers a profession is mapped here.

var PROFESSION_DATABASE = {};

export function getProfession(buildingId) {
  return PROFESSION_DATABASE[buildingId] || null;
}

export function getAllProfessions() {
  return PROFESSION_DATABASE;
}

module.exports = { PROFESSION_DATABASE: PROFESSION_DATABASE, getProfession: getProfession, getAllProfessions: getAllProfessions };
