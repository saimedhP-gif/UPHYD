const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/cost — all cost of living items, optionally by category
router.get(
  '/',
  [query('category').optional().isString().trim()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { category } = req.query;
    const db = getDb();

    const rows = category
      ? db.prepare('SELECT * FROM cost_of_living WHERE LOWER(category) = LOWER(?) ORDER BY id').all(category)
      : db.prepare('SELECT * FROM cost_of_living ORDER BY category, id').all();

    // Group by category
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push({
        ...row,
        display: row.cost_min === row.cost_max
          ? `₹${row.cost_min?.toLocaleString('en-IN')}`
          : `₹${row.cost_min?.toLocaleString('en-IN')}–₹${row.cost_max?.toLocaleString('en-IN')}`,
      });
    }

    res.json({ data: rows, grouped, meta: { total: rows.length } });
  }
);

// GET /api/cost/categories
router.get('/categories', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM cost_of_living ORDER BY category').all();
  res.json({ data: rows.map(r => r.category) });
});

// GET /api/cost/summary — budget scenarios
router.get('/summary', (req, res) => {
  res.json({
    data: {
      scenarios: [
        {
          label: 'Budget (PG, IT corridor commute)',
          total_min: 12000,
          total_max: 15000,
          description: 'PG double-sharing + mess food + metro commute',
        },
        {
          label: 'Single Professional (mid-range)',
          total_min: 40000,
          total_max: 60000,
          description: '1BHK in IT corridor + moderate lifestyle',
        },
        {
          label: 'Family of Four',
          total_min: 52000,
          total_max: 97000,
          description: '2BHK + private school + car + full family expenses',
        },
      ],
      purchasing_power_index: 188.42,
      vs_bangalore_col_diff: '-3%',
      vs_bangalore_rent_diff: '-32.1%',
      avg_monthly_net_salary: 104371,
      source: 'Numbeo March 2026, NoBroker 2026',
    }
  });
});

module.exports = router;
