const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/startups
router.get(
  '/',
  [
    query('search').optional().isString().trim().escape(),
    query('sector').optional().isString().trim(),
    query('size').optional().isIn(['Small', 'Medium', 'Large']),
    query('stage').optional().isString().trim(),
    query('sort').optional().isIn(['name-asc', 'name-desc', 'stage', 'year-desc', 'year-asc']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { search, sector, size, stage, sort = 'name-asc', page = 1, limit = 20 } = req.query;
    const db = getDb();

    let where = [];
    let params = [];

    if (search) {
      where.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(sector) LIKE ?)');
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }
    if (sector) {
      where.push('LOWER(sector) = LOWER(?)');
      params.push(sector);
    }
    if (size) {
      where.push('size = ?');
      params.push(size);
    }
    if (stage) {
      where.push('LOWER(stage) = LOWER(?)');
      params.push(stage);
    }

    const stagePriority = `CASE stage
      WHEN 'Unicorn'     THEN 1
      WHEN 'Public'      THEN 2
      WHEN 'Established' THEN 3
      WHEN 'Series C'    THEN 4
      WHEN 'Series B'    THEN 5
      WHEN 'Series A'    THEN 6
      WHEN 'Seed'        THEN 7
      WHEN 'Government'  THEN 8
      ELSE 9 END`;

    const orderMap = {
      'name-asc':  'name ASC',
      'name-desc': 'name DESC',
      'stage':     stagePriority,
      'year-desc': 'founding_year DESC',
      'year-asc':  'founding_year ASC',
    };
    const orderBy = orderMap[sort] || 'name ASC';

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM startups ${whereClause}`);
    const { total } = countStmt.get(params);

    const rows = db.prepare(
      `SELECT * FROM startups ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    ).all([...params, limit, offset]);

    // Parse investors string to array
    const startups = rows.map(s => ({
      ...s,
      investors: s.investors ? s.investors.split(',').map(i => i.trim()) : [],
    }));

    res.json({
      data: startups,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }
);

// GET /api/startups/sectors — list all sectors
router.get('/sectors', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT sector FROM startups ORDER BY sector').all();
  res.json({ data: rows.map(r => r.sector) });
});

// GET /api/startups/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM startups WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Startup not found' });

  res.json({
    data: {
      ...row,
      investors: row.investors ? row.investors.split(',').map(i => i.trim()) : [],
    }
  });
});

module.exports = router;
