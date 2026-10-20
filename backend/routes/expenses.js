const express = require('express');
const db = require('../db/database');

const router = express.Router();

// ========== Repairs ==========
router.get('/repairs', (req, res) => {
  const data = db.prepare('SELECT * FROM repairs ORDER BY date DESC').all();
  res.json(data);
});

router.post('/repairs', (req, res) => {
  const { date, vehicle, description, workshop, cost, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO repairs (date, vehicle, description, workshop, cost, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(date, vehicle, description, workshop, cost, notes);
  res.json({ id: result.lastInsertRowid, message: 'Repair added' });
});

router.put('/repairs/:id', (req, res) => {
  const { date, vehicle, description, workshop, cost, notes } = req.body;
  db.prepare(`
    UPDATE repairs SET date = ?, vehicle = ?, description = ?, workshop = ?, cost = ?, notes = ?
    WHERE id = ?
  `).run(date, vehicle, description, workshop, cost, notes, req.params.id);
  res.json({ message: 'Repair updated' });
});

router.delete('/repairs/:id', (req, res) => {
  db.prepare('DELETE FROM repairs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Repair deleted' });
});

// ========== Other Expenses ==========
router.get('/other', (req, res) => {
  const data = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  res.json(data);
});

router.post('/other', (req, res) => {
  const { date, category, amount, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO expenses (date, category, amount, notes) VALUES (?, ?, ?, ?)
  `).run(date, category, amount, notes);
  res.json({ id: result.lastInsertRowid, message: 'Expense added' });
});

router.put('/other/:id', (req, res) => {
  const { date, category, amount, notes } = req.body;
  db.prepare(`
    UPDATE expenses SET date = ?, category = ?, amount = ?, notes = ? WHERE id = ?
  `).run(date, category, amount, notes, req.params.id);
  res.json({ message: 'Expense updated' });
});

router.delete('/other/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Expense deleted' });
});

module.exports = router;