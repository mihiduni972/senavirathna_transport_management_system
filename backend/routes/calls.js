const express = require('express');
const db = require('../db/database');

const router = express.Router();

// සියලු calls ගන්න
router.get('/', (req, res) => {
  const data = db.prepare('SELECT * FROM calls ORDER BY created_at DESC').all();
  res.json(data);
});

// Waiting calls විතරක්
router.get('/waiting', (req, res) => {
  const data = db.prepare("SELECT * FROM calls WHERE status = 'waiting' ORDER BY created_at DESC").all();
  res.json(data);
});

// අලුත් call එකක් එකතු කරන්න
router.post('/', (req, res) => {
  const { date, customer_name, customer_phone, from_location, to_location, distance_km, estimated_amount, notes } = req.body;

  const result = db.prepare(`
    INSERT INTO calls (date, customer_name, customer_phone, from_location, to_location, distance_km, estimated_amount, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting')
  `).run(date, customer_name, customer_phone, from_location, to_location, distance_km, estimated_amount, notes);

  res.json({ id: result.lastInsertRowid, message: 'Call added' });
});

// Call එකක් Hire එකට convert කරන්න
router.post('/:id/convert', (req, res) => {
  const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(req.params.id);
  if (!call) return res.status(404).json({ error: 'Call not found' });

  // Hire එකක් හදනවා
  const result = db.prepare(`
    INSERT INTO hires (date, customer_name, customer_phone, from_location, to_location, total_km, amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    call.date,
    call.customer_name,
    call.customer_phone,
    call.from_location,
    call.to_location,
    call.distance_km,
    call.estimated_amount
  );

  // Call status update කරනවා
  db.prepare("UPDATE calls SET status = 'hired' WHERE id = ?").run(req.params.id);

  res.json({ message: 'Converted to hire', hire_id: result.lastInsertRowid });
});

// Call එකක් delete කරන්න
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM calls WHERE id = ?').run(req.params.id);
  res.json({ message: 'Call deleted' });
});

module.exports = router;