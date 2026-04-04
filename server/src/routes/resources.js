const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

// GET /api/resources — all categories with their items
router.get('/', (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM resource_categories ORDER BY id').all();

  const result = categories.map(cat => {
    const items = db.prepare(
      'SELECT * FROM resources WHERE category_id = ? ORDER BY id'
    ).all(cat.id);
    return { ...cat, items };
  });

  res.json({ data: result });
});

// GET /api/resources/categories/:id — single category with items
router.get('/categories/:id', (req, res) => {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM resource_categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const items = db.prepare('SELECT * FROM resources WHERE category_id = ? ORDER BY id').all(cat.id);
  res.json({ data: { ...cat, items } });
});

// GET /api/resources/items/:id — single resource item
router.get('/items/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Resource not found' });
  res.json({ data: row });
});

// POST /api/resources/items
router.post('/items', express.json(), (req, res) => {
  const { category_id, name, type, location, logo, website, description } = req.body;

  if (!category_id || !name || !type) {
    return res.status(400).json({ error: 'Missing required fields: category_id, name, type' });
  }

  try {
    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO resources (category_id, name, type, location, logo, website, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insert.run(
      category_id, 
      name, 
      type, 
      location || 'Online', 
      logo || '🔗', 
      website || null,
      description || null
    );

    res.status(201).json({ 
      success: true, 
      message: 'Resource added successfully', 
      data: { id: info.lastInsertRowid, ...req.body } 
    });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Internal server error while adding resource' });
  }
});

module.exports = router;
