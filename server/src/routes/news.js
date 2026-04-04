const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/news
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM news ORDER BY date DESC').all();
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/news
router.post('/', express.json(), (req, res) => {
  const { title, date, tag, image_url, description, source_url } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing required fields: title, description' });
  }

  try {
    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO news (title, date, tag, image_url, description, source_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // We default date to today if not provided
    const today = new Date().toISOString().split('T')[0];
    
    const info = insert.run(
      title, 
      date || today, 
      tag || 'Update', 
      image_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80', 
      description, 
      source_url || null
    );

    res.status(201).json({ 
      success: true, 
      message: 'News added successfully', 
      data: { id: info.lastInsertRowid, ...req.body } 
    });
  } catch (error) {
    console.error('Error adding news:', error);
    res.status(500).json({ error: 'Internal server error while adding news' });
  }
});

module.exports = router;
