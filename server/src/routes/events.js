const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/events
router.get(
  '/',
  [
    query('month').optional().isInt({ min: 1, max: 12 }).toInt(),
    query('year').optional().isInt({ min: 2020, max: 2035 }).toInt(),
    query('category').optional().isString().trim(),
    query('upcoming').optional().isBoolean().toBoolean(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { month, year, category, upcoming, limit = 50 } = req.query;
    const db = getDb();

    let where = [];
    let params = [];

    if (month) {
      where.push("strftime('%m', date) = ?");
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      where.push("strftime('%Y', date) = ?");
      params.push(String(year));
    }
    if (category) {
      where.push('LOWER(category) = LOWER(?)');
      params.push(category);
    }
    if (upcoming) {
      where.push("date >= date('now')");
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = db.prepare(
      `SELECT * FROM events ${whereClause} ORDER BY date ASC LIMIT ?`
    ).all([...params, limit]);

    res.json({ data: rows, meta: { total: rows.length } });
  }
);

// GET /api/events/categories
router.get('/categories', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM events ORDER BY category').all();
  res.json({ data: rows.map(r => r.category) });
});

// GET /api/events/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Event not found' });
  res.json({ data: row });
});

// POST /api/events
router.post('/', express.json(), (req, res) => {
  const { title, date, time, location, category, logo, description, registration_url, is_virtual } = req.body;
  
  if (!title || !date || !time || !location || !category) {
    return res.status(400).json({ error: 'Missing required fields: title, date, time, location, category' });
  }

  try {
    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO events (title, date, time, location, category, logo, description, registration_url, is_virtual)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(
      title, 
      date, 
      time, 
      location, 
      category, 
      logo || '📅', 
      description || null, 
      registration_url || null, 
      is_virtual ? 1 : 0
    );

    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully', 
      data: { id: info.lastInsertRowid, ...req.body } 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error while creating event' });
  }
});

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', express.json(), (req, res) => {
  const { name, email, company } = req.body;
  const eventId = req.params.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields: name, email' });
  }

  try {
    const db = getDb();
    // Verify event exists
    const eventRow = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!eventRow) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const insertInfo = db.prepare('INSERT INTO event_rsvps (event_id, name, email, company) VALUES (?, ?, ?, ?)').run(eventId, name, email, company || null);
    res.status(201).json({ success: true, message: 'RSVP confirmed', rsvp_id: insertInfo.lastInsertRowid });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ error: 'Internal server error while processing RSVP' });
  }
});

module.exports = router;
