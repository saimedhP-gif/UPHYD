const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/neighbourhoods
router.get(
  '/',
  [query('area_type').optional().isString().trim()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { area_type } = req.query;
    const db = getDb();

    const rows = area_type
      ? db.prepare('SELECT * FROM neighbourhoods WHERE LOWER(area_type) = LOWER(?) ORDER BY id').all(area_type)
      : db.prepare('SELECT * FROM neighbourhoods ORDER BY id').all();

    // Format rent ranges
    const formatted = rows.map(n => ({
      ...n,
      rent_1bhk: n.rent_1bhk_min && n.rent_1bhk_max
        ? `₹${n.rent_1bhk_min.toLocaleString('en-IN')}–₹${n.rent_1bhk_max.toLocaleString('en-IN')}/mo`
        : null,
      rent_2bhk: n.rent_2bhk_min && n.rent_2bhk_max
        ? `₹${n.rent_2bhk_min.toLocaleString('en-IN')}–₹${n.rent_2bhk_max.toLocaleString('en-IN')}/mo`
        : null,
    }));

    res.json({ data: formatted, meta: { total: formatted.length } });
  }
);

// GET /api/neighbourhoods/types
router.get('/types', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT area_type FROM neighbourhoods ORDER BY area_type').all();
  res.json({ data: rows.map(r => r.area_type) });
});

// GET /api/neighbourhoods/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM neighbourhoods WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Neighbourhood not found' });

  res.json({
    data: {
      ...row,
      rent_1bhk: row.rent_1bhk_min && row.rent_1bhk_max
        ? `₹${row.rent_1bhk_min.toLocaleString('en-IN')}–₹${row.rent_1bhk_max.toLocaleString('en-IN')}/mo`
        : null,
      rent_2bhk: row.rent_2bhk_min && row.rent_2bhk_max
        ? `₹${row.rent_2bhk_min.toLocaleString('en-IN')}–₹${row.rent_2bhk_max.toLocaleString('en-IN')}/mo`
        : null,
    }
  });
});

module.exports = router;
