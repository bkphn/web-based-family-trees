const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.resolve(__dirname, '../db');
const dbPath = path.join(dbDir, 'database.db');
const schemaPath = path.join(dbDir, 'schema.sql');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd połączenia z bazą:', err.message);
    return;
  }
  
  console.log('Połączono z bazą SQLite w folderze db/.');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (schemaErr) => {
      if (schemaErr) console.error('Błąd schematu SQL:', schemaErr.message);
      else console.log('Struktura tabel została załadowana.');
    });
  } else {
    console.warn(`Ostrzeżenie: Plik ${schemaPath} nie istnieje!`);
  }
});

module.exports = db;