const sqlite3 = require('sqlite3').verbose();

function initDatabase(server_cfg) {
  const db = new sqlite3.Database(server_cfg.database);

  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS pixels (x INT, y INT, color TEXT)');
  });

  return db;
}

module.exports = initDatabase;
