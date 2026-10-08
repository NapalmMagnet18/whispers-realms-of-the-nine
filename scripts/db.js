// WHISPERS database. One per world and mode (dev / live). Every statement here is idempotent.
// characters: the live save of every hero, one row per (player, realm, slot), rewritten the moment the bag, purse or level changes.
// realm_pulse: each realm's room writes its population here once a minute; the realm list reads it.
// realm_firsts: the first hero on each realm to finish a chain or reach a level band; the realm list and the herald read it.
// ledger: every coin that moves (quest reward, vendor buy/sell, loot), one row each, copper as an integer.
export async function migrate(sql) {
  await sql`CREATE TABLE IF NOT EXISTS characters (
    user_id TEXT NOT NULL, realm TEXT NOT NULL, slot INTEGER NOT NULL,
    name TEXT NOT NULL, race TEXT NOT NULL, class TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1,
    copper INTEGER NOT NULL DEFAULT 0, inventory TEXT NOT NULL DEFAULT '[]', equipment TEXT NOT NULL DEFAULT '{}',
    data TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, realm, slot))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS characters_name ON characters (realm, name COLLATE NOCASE)`;
  await sql`CREATE TABLE IF NOT EXISTS realm_pulse (realm TEXT PRIMARY KEY, players INTEGER NOT NULL, at INTEGER NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS realm_firsts (realm TEXT NOT NULL, feat TEXT NOT NULL, label TEXT NOT NULL, char_name TEXT NOT NULL, class TEXT, level INTEGER, at INTEGER NOT NULL, PRIMARY KEY (realm, feat))`;
  await sql`CREATE TABLE IF NOT EXISTS ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, realm TEXT NOT NULL, char_name TEXT, delta INTEGER NOT NULL, reason TEXT NOT NULL, balance INTEGER NOT NULL, at INTEGER NOT NULL)`;
  await sql`CREATE INDEX IF NOT EXISTS ledger_user ON ledger (user_id, at)`;
  // auctions: the Lantern Exchange, one realm per room; status active|sold|cancelled|expired, settled = the seller has their coin or goods back
  await sql`CREATE TABLE IF NOT EXISTS auctions (id INTEGER PRIMARY KEY AUTOINCREMENT, realm TEXT NOT NULL, seller TEXT NOT NULL, seller_name TEXT,
    item TEXT NOT NULL, item_id TEXT NOT NULL, item_name TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, price INTEGER NOT NULL,
    created INTEGER NOT NULL, expires INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', buyer TEXT, buyer_name TEXT, sold_at INTEGER, settled INTEGER NOT NULL DEFAULT 0)`;
  await sql`CREATE INDEX IF NOT EXISTS auctions_browse ON auctions (realm, status, expires)`;
  await sql`CREATE INDEX IF NOT EXISTS auctions_seller ON auctions (seller, realm, settled)`;
}
