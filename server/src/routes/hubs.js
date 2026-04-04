const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/hubs — all innovation hubs, optionally filtered by type
router.get(
  '/',
  [query('type').optional().isString().trim()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type } = req.query;
    const db = getDb();

    const rows = type
      ? db.prepare('SELECT * FROM hubs WHERE LOWER(type) = LOWER(?) ORDER BY id').all(type)
      : db.prepare('SELECT * FROM hubs ORDER BY id').all();

    res.json({ data: rows, meta: { total: rows.length } });
  }
);

// GET /api/hubs/types
router.get('/types', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT type FROM hubs ORDER BY type').all();
  res.json({ data: rows.map(r => r.type) });
});

// GET /api/hubs/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM hubs WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Hub not found' });
  res.json({ data: row });
});

module.exports = router;
