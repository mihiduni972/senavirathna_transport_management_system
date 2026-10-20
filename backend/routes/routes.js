const express = require('express');
const db = require('../db/database');

const router = express.Router();

// සියලු routes ගන්න
router.get('/', (req, res) => {
  const data = db.prepare('SELECT * FROM routes ORDER BY to_location').all();
  res.json(data);
});

// From + To එකෙන් distance ගන්න
router.get('/distance', (req, res) => {
  const { from, to } = req.query;
  const route = db.prepare(
    'SELECT * FROM routes WHERE from_location = ? AND to_location = ?'
  ).get(from, to);

  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  const amount = route.distance_km * 120;
  res.json({
    from_location: route.from_location,
    to_location: route.to_location,
    distance_km: route.distance_km,
    amount: amount
  });
});

module.exports = router;