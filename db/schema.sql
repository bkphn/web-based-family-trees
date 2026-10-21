CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  birth_date TEXT,
  pos_x REAL DEFAULT 150,
  pos_y REAL DEFAULT 150
);

CREATE TABLE IF NOT EXISTS relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_from INTEGER NOT NULL,
  person_to INTEGER NOT NULL,
  relation_type TEXT NOT NULL, -- 'parent' lub 'spouse'
  FOREIGN KEY (person_from) REFERENCES persons(id) ON DELETE CASCADE,
  FOREIGN KEY (person_to) REFERENCES persons(id) ON DELETE CASCADE
);