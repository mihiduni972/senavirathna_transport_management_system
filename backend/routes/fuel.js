const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const data = db.prepare(`
    SELECT fuel.*, hires.customer_name, hires.from_location, hires.to_location
    FROM fuel
    LEFT JOIN hires ON fuel.hire_id = hires.id
    ORDER BY fuel.date DESC
  `).all();
  res.json(data);
});

router.post('/', (req, res) => {
  const { date, liters, cost, odometer, hire_id } = req.body;

  const result = db.prepare(`
    INSERT INTO fuel (date, liters, cost, odometer, hire_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(date, liters, cost, odometer, hire_id || null);

  res.json({ id: result.lastInsertRowid, message: 'Fuel record added' });
});

router.put('/:id', (req, res) => {
  const { date, liters, cost, odometer, hire_id } = req.body;

  db.prepare(`
    UPDATE fuel SET date = ?, liters = ?, cost = ?, odometer = ?, hire_id = ?
    WHERE id = ?
  `).run(date, liters, cost, odometer, hire_id || null, req.params.id);

  res.json({ message: 'Fuel record updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM fuel WHERE id = ?').run(req.params.id);
  res.json({ message: 'Fuel record deleted' });
});

module.exports = router;