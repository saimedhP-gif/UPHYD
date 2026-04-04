const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');

const router = express.Router();

// POST /api/contact/newsletter — subscribe to newsletter
router.post(
  '/newsletter',
  [
    body('email')
      .isEmail().withMessage('A valid email address is required.')
      .normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const db = getDb();

    // Check if already subscribed
    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'You are already subscribed to the newsletter.' });
    }

    db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);

    res.status(201).json({
      message: 'Successfully subscribed! Welcome to the UPHyd ecosystem newsletter.',
    });
  }
);

// POST /api/contact/submit — general contact / join form
router.post(
  '/submit',
  [
    body('name').notEmpty().trim().escape().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('message').notEmpty().trim().isLength({ min: 10 })
      .withMessage('Message must be at least 10 characters.'),
    body('company').optional().trim().escape(),
    body('type').optional().isIn(['startup', 'investor', 'mentor', 'partner', 'general'])
      .withMessage('Invalid contact type.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, company = null, message, type = 'general' } = req.body;
    const db = getDb();

    db.prepare(
      'INSERT INTO contact_submissions (name, email, company, message, type) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, company, message, type);

    res.status(201).json({
      message: `Thanks ${name}! Your message has been received. The UPHyd team will be in touch soon.`,
    });
  }
);

// GET /api/contact/stats — admin endpoint (submissions count)
router.get('/stats', (req, res) => {
  const db = getDb();
  const { total_subscribers } = db.prepare('SELECT COUNT(*) as total_subscribers FROM newsletter_subscribers').get();
  const { total_submissions } = db.prepare('SELECT COUNT(*) as total_submissions FROM contact_submissions').get();

  const byType = db.prepare(
    'SELECT type, COUNT(*) as count FROM contact_submissions GROUP BY type ORDER BY count DESC'
  ).all();

  res.json({
    data: { total_subscribers, total_submissions, by_type: byType }
  });
});

module.exports = router;
