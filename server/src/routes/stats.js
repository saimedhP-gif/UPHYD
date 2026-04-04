const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/stats — all stats, optionally filtered by category
router.get(
  '/',
  [query('category').optional().isString().trim()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { category } = req.query;
    const db = getDb();

    const rows = category
      ? db.prepare('SELECT * FROM stats WHERE LOWER(category) = LOWER(?) ORDER BY id').all(category)
      : db.prepare('SELECT * FROM stats ORDER BY id').all();

    // Group by category
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    }

    res.json({ data: rows, grouped, meta: { total: rows.length } });
  }
);

// GET /api/stats/categories
router.get('/categories', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM stats ORDER BY category').all();
  res.json({ data: rows.map(r => r.category) });
});

// GET /api/stats/:key
router.get('/:key', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM stats WHERE key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'Stat not found' });
  res.json({ data: row });
});

module.exports = router;
