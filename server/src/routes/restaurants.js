const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

router.get('/', (req, res) => {
  const db = getDb();
  const { category, cuisine, area } = req.query;
  let sql = 'SELECT * FROM restaurants WHERE 1=1';
  const params = {};
  if (category) { sql += ' AND category = @category'; params.category = category; }
  if (cuisine) { sql += ' AND cuisine = @cuisine'; params.cuisine = cuisine; }
  if (area) { sql += ' AND area = @area'; params.area = area; }
  sql += ' ORDER BY CAST(rating AS REAL) DESC';
  const rows = db.prepare(sql).all(params);
  res.json({ data: rows, total: rows.length });
});

module.exports = router;
