/**
 * store.js — a tiny file-based datastore that replaces MySQL.
 *
 * Users are kept in data/users.json as an array of records. The whole file is
 * read/written on each operation, which is perfectly fine for a project of this
 * size and means there is NOTHING to install or configure — no database server.
 *
 * API mirrors the small set of operations the app needs:
 *   findByEmail(email)        -> user | null
 *   findById(id)              -> user | null
 *   create({ email, password })-> newUser
 *   update(id, fields)        -> updatedUser | null
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

// Ensure the data directory and file exist on first run.
function init() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], nextId: 1 }, null, 2));
}
init();

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    // If the file is somehow corrupt, start clean rather than crash.
    return { users: [], nextId: 1 };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Blank profile fields every user starts with.
const DEFAULT_FIELDS = {
  name: '',
  phone: '',
  address: '',
  profile_picture: '',
  bio: '',
  desired_position: '',
  preferred_location: '',
  experience_level: '',
  preferred_companies: '',
  resume_path: '',
  resume_name: '',
  card_holder_name: '',
  card_number: '',
  expiry_date: '',
  cvv: '',
};

const store = {
  findByEmail(email) {
    const db = readDb();
    return db.users.find(u => u.email === email) || null;
  },

  findById(id) {
    const db = readDb();
    return db.users.find(u => u.id === Number(id)) || null;
  },

  create({ email, password }) {
    const db = readDb();
    const user = { id: db.nextId, email, password, ...DEFAULT_FIELDS };
    db.users.push(user);
    db.nextId += 1;
    writeDb(db);
    return user;
  },

  update(id, fields) {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === Number(id));
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...fields };
    writeDb(db);
    return db.users[idx];
  },

  // Used by "no login required" mode: returns the single guest user,
  // creating it on first use. Everyone shares this one profile.
  getOrCreateGuest() {
    const existing = this.findByEmail('guest@local');
    if (existing) return existing;
    const db = readDb();
    const user = {
      id: db.nextId,
      email: 'guest@local',
      password: '',
      ...DEFAULT_FIELDS,
      name: 'Guest',
    };
    db.users.push(user);
    db.nextId += 1;
    writeDb(db);
    return user;
  },
};

module.exports = store;
