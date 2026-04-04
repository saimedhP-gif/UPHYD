const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM breweries ORDER BY name').all();
  res.json({ data: rows, total: rows.length });
});

module.exports = router;
