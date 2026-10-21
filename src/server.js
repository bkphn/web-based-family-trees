const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Testowy endpoint sprawdzający stan serwera
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Pobieranie całego drzewa (węzły + relacje)
app.get('/api/tree', (req, res) => {
  db.all('SELECT * FROM persons', [], (err, nodes) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM relationships', [], (relErr, edges) => {
      if (relErr) return res.status(500).json({ error: relErr.message });
      res.json({ nodes, edges });
    });
  });
});

// Dodawanie nowej osoby do drzewa
app.post('/api/persons', (req, res) => {
  const { first_name, last_name, birth_date, pos_x, pos_y } = req.body;
  if (!first_name) return res.status(400).json({ error: 'Imię jest wymagane' });

  const sql = `INSERT INTO persons (first_name, last_name, birth_date, pos_x, pos_y) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [first_name, last_name, birth_date, pos_x || 150, pos_y || 150], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, first_name, last_name, pos_x, pos_y });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});