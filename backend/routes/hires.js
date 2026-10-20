const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const hires = db.prepare('SELECT * FROM hires ORDER BY date DESC').all();
  res.json(hires);
});

router.post('/', (req, res) => {
  const {
    date,
    category,
    customer_name,
    customer_phone,
    from_location,
    to_location,
    start_km,
    end_km,
    amount,
    payment_status,
    referrer_name,
    commission
  } = req.body;

  const total_km = Number(end_km) - Number(start_km);

  const result = db.prepare(`
    INSERT INTO hires (
      date, category, customer_name, customer_phone,
      from_location, to_location, start_km, end_km,
      total_km, amount, payment_status, referrer_name, commission
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    date,
    category || null,
    customer_name,
    customer_phone,
    from_location,
    to_location,
    start_km,
    end_km,
    total_km,
    amount,
    payment_status || 'pending',
    referrer_name || null,
    Number(commission) || 0
  );

  res.json({ id: result.lastInsertRowid, message: 'Hire added successfully' });
});

router.put('/:id', (req, res) => {
  const {
    date,
    category,
    customer_name,
    customer_phone,
    from_location,
    to_location,
    start_km,
    end_km,
    amount,
    payment_status,
    referrer_name,
    commission
  } = req.body;

  const total_km = Number(end_km) - Number(start_km);

  db.prepare(`
    UPDATE hires SET
      date = ?,
      category = ?,
      customer_name = ?,
      customer_phone = ?,
      from_location = ?,
      to_location = ?,
      start_km = ?,
      end_km = ?,
      total_km = ?,
      amount = ?,
      payment_status = ?,
      referrer_name = ?,
      commission = ?
    WHERE id = ?
  `).run(
    date,
    category || null,
    customer_name,
    customer_phone,
    from_location,
    to_location,
    start_km,
    end_km,
    total_km,
    amount,
    payment_status,
    referrer_name || null,
    Number(commission) || 0,
    req.params.id
  );

  res.json({ message: 'Hire updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM hires WHERE id = ?').run(req.params.id);
  res.json({ message: 'Hire deleted' });
});

module.exports = router;