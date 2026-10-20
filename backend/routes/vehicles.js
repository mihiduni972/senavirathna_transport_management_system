const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const data = db.prepare('SELECT * FROM vehicles ORDER BY number').all();
  res.json(data);
});

router.post('/', (req, res) => {
  const { number, model, notes } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO vehicles (number, model, notes) VALUES (?, ?, ?)
    `).run(number, model, notes);
    res.json({ id: result.lastInsertRowid, message: 'Vehicle added' });
  } catch (e) {
    res.status(400).json({ error: 'Vehicle number already exists' });
  }
});

router.put('/:id', (req, res) => {
  const { number, model, notes } = req.body;
  db.prepare(`
    UPDATE vehicles SET number = ?, model = ?, notes = ? WHERE id = ?
  `).run(number, model, notes, req.params.id);
  res.json({ message: 'Vehicle updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  res.json({ message: 'Vehicle deleted' });
});

module.exports = router;