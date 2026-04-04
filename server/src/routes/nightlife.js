const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

router.get('/', (req, res) => {
  const db = getDb();
  const { type } = req.query;
  let sql = 'SELECT * FROM nightlife';
  const params = {};
  if (type) { sql += ' WHERE type = @type'; params.type = type; }
  sql += ' ORDER BY name';
  const rows = db.prepare(sql).all(params);
  res.json({ data: rows, total: rows.length });
});

module.exports = router;
