const sqlite3 = require('sqlite3').verbose();

function initDatabase(server_cfg) {
  const db = new sqlite3.Database(server_cfg.database);

  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS pixels (x INT, y INT, color TEXT)');

    db.get('PRAGMA table_info(pixels)', (err, row) => {
      if (!row || row.name !== 'userid') {
        db.run('ALTER TABLE pixels ADD COLUMN userid INT DEFAULT 0');
      }
    });
  });

  return db;
}

module.exports = initDatabase;
