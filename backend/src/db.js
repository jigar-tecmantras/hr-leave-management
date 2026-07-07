const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'hr-leave.db');
const db = new Database(dbFile);

db.pragma('journal_mode = WAL');

defaults();

function defaults() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('hr','employee')),
      annual_quota INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS leave_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      days_per_year INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_requested INTEGER NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(leave_type_id) REFERENCES leave_types(id)
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leave_request_id INTEGER NOT NULL,
      changed_by INTEGER NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(leave_request_id) REFERENCES leave_requests(id),
      FOREIGN KEY(changed_by) REFERENCES users(id)
    )`
  ).run();
}

function initDb() {
  seedUsers();
  seedLeaveTypes();
}

function seedUsers() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('hr@example.com');
  if (existing) {
    return;
  }

  const insert = db.prepare('INSERT INTO users (name, email, role, annual_quota) VALUES (?, ?, ?, ?)');
  insert.run('HR Admin', 'hr@example.com', 'hr', 0);
  insert.run('Alice Engineer', 'alice@example.com', 'employee', 20);
  insert.run('Bob Marketer', 'bob@example.com', 'employee', 15);
}

function seedLeaveTypes() {
  const existing = db.prepare('SELECT id FROM leave_types LIMIT 1').get();
  if (existing) {
    return;
  }

  const insert = db.prepare('INSERT INTO leave_types (name, description, days_per_year) VALUES (?, ?, ?)');
  insert.run('Annual Leave', 'Annual leave bundle for planned vacations', 20);
  insert.run('Sick Leave', 'Unplanned medical absence', 10);
  insert.run('Personal Day', 'Short personal time off', 5);
}

function getUserByEmail(email) {
  if (!email) {
    return null;
  }
  return db
    .prepare('SELECT id, name, email, role, annual_quota FROM users WHERE lower(email) = lower(?)')
    .get(email.toLowerCase());
}

module.exports = {
  db,
  initDb,
  getUserByEmail
};
