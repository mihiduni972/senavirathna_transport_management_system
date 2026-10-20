const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const totalIncome = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM hires'
  ).get().total;

  const totalFuel = db.prepare(
    'SELECT COALESCE(SUM(cost), 0) as total FROM fuel'
  ).get().total;

  const totalRepairs = db.prepare(
    'SELECT COALESCE(SUM(cost), 0) as total FROM repairs'
  ).get().total;

  const totalOther = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
  ).get().total;

  const totalCommission = db.prepare(
    'SELECT COALESCE(SUM(commission), 0) as total FROM hires'
  ).get().total;

  // Net = Income - (Fuel + Repairs + Other + Commission)
  const totalExpenses = totalFuel + totalRepairs + totalOther + totalCommission;
  const profit = totalIncome - totalExpenses;
  const hireCount = db.prepare('SELECT COUNT(*) as count FROM hires').get().count;

  res.json({
    // Dashboard uses these keys
    income: totalIncome,
    expenses: totalExpenses,
    profit,
    hireCount,

    // Detailed breakdown
    totalIncome,
    totalFuel,
    totalRepairs,
    totalOther,
    totalCommission,
    totalExpenses
  });
});

// Monthly data for chart
router.get('/monthly', (req, res) => {
  const income = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total
    FROM hires
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all();

  const commission = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(commission), 0) as total
    FROM hires
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all();

  const fuel = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(cost), 0) as total
    FROM fuel
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all();

  const repairs = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(cost), 0) as total
    FROM repairs
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all();

  const other = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total
    FROM expenses
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `).all();

  const monthSet = new Set([
    ...income.map((i) => i.month),
    ...commission.map((c) => c.month),
    ...fuel.map((f) => f.month),
    ...repairs.map((r) => r.month),
    ...other.map((o) => o.month)
  ]);

  const months = [...monthSet].filter(Boolean).sort();

  const data = months.map((month) => {
    const inc = income.find((i) => i.month === month)?.total || 0;
    const com = commission.find((c) => c.month === month)?.total || 0;
    const f = fuel.find((x) => x.month === month)?.total || 0;
    const r = repairs.find((x) => x.month === month)?.total || 0;
    const o = other.find((x) => x.month === month)?.total || 0;
    const exp = f + r + o + com;

    return {
      month,
      income: inc,
      expenses: exp,
      profit: inc - exp
    };
  });

  res.json(data);
});

module.exports = router;