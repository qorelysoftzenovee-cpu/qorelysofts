const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'indapp.db');
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Failed to connect to SQLite database:', error.message);
  } else {
    console.log(`SQLite connected at ${dbPath}`);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS developers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      account_type TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      developer_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      apk_filename TEXT,
      status TEXT DEFAULT 'pending_verification',
      rejection_reason TEXT,
      is_suggested INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES developers(id)
    )
  `);

  db.all(`PRAGMA table_info(apps)`, (error, rows) => {
    if (error) {
      console.error('Failed to inspect apps table:', error.message);
      return;
    }
    const hasRejectionReason = rows.some(row => row.name === 'rejection_reason');
    if (!hasRejectionReason) {
      db.run('ALTER TABLE apps ADD COLUMN rejection_reason TEXT', (alterError) => {
        if (alterError) {
          console.error('Failed to add rejection_reason column:', alterError.message);
        } else {
          console.log('Added rejection_reason column to apps table.');
        }
      });
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      developer_id INTEGER,
      transaction_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES developers(id)
    )
  `);
});

module.exports = db;