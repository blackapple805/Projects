// SQLite via Node's built-in node:sqlite — no database server,
// no npm package, no .env. The whole database is one file.
// Delete bread-store.db to start completely fresh.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '..', 'bread-store.db'));
db.exec('PRAGMA journal_mode = WAL;');

// Create tables on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS breads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    purchase_date TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// Seed starter breads if the shop is empty
const breadCount = db.prepare('SELECT COUNT(*) AS n FROM breads').get().n;
if (breadCount === 0) {
  const insert = db.prepare('INSERT INTO breads (name, price) VALUES (?, ?)');
  [
    ['Sourdough Loaf', 6.5],
    ['Baguette', 3.25],
    ['Rye Bread', 5.75],
    ['Ciabatta', 4.0],
    ['Croissant', 2.8],
    ['Whole Wheat', 5.0],
  ].forEach(([name, price]) => insert.run(name, price));
  console.log('Seeded starter breads.');
}

// Migration: add an image column for real photos (safe to re-run).
// To give a bread a photo: put the file in frontend/public/images/
// and run e.g. UPDATE breads SET image = '/images/sourdough.jpg' WHERE id = 1;
const breadCols = db.prepare('PRAGMA table_info(breads)').all();
if (!breadCols.some((c) => c.name === 'image')) {
  db.exec('ALTER TABLE breads ADD COLUMN image TEXT');
  console.log('Added image column to breads.');
}

console.log('Connected to the SQLite database (bread-store.db).');

module.exports = db;
