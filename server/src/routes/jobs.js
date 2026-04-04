const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/jobs
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
