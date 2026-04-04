require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initDb } = require('./db/database');

// Routes
const startupsRouter = require('./routes/startups');
const eventsRouter = require('./routes/events');
const resourcesRouter = require('./routes/resources');
const statsRouter = require('./routes/stats');
const neighbourhoodsRouter = require('./routes/neighbourhoods');
const newsRouter = require('./routes/news');
const contactRouter = require('./routes/contact');
const hubsRouter = require('./routes/hubs');
const costRouter = require('./routes/cost');
const restaurantsRouter = require('./routes/restaurants');
const breweriesRouter = require('./routes/breweries');
const nightlifeRouter = require('./routes/nightlife');
const healthcareRouter = require('./routes/healthcare');
const megaprojectsRouter = require('./routes/megaprojects');
const weatherRouter = require('./routes/weather');
const getawaysRouter = require('./routes/getaways');
const peopleRouter = require('./routes/people');
const tipsRouter = require('./routes/tips');
const coworkingRouter = require('./routes/coworking');
const jobsRouter = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'UPHyd API — Hyderabad Startup Ecosystem Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/startups',      startupsRouter);
app.use('/api/events',        eventsRouter);
app.use('/api/resources',     resourcesRouter);
app.use('/api/stats',         statsRouter);
app.use('/api/neighbourhoods',neighbourhoodsRouter);
app.use('/api/news',          newsRouter);
app.use('/api/contact',       contactRouter);
app.use('/api/hubs',          hubsRouter);
app.use('/api/cost',          costRouter);
app.use('/api/restaurants',   restaurantsRouter);
app.use('/api/breweries',     breweriesRouter);
app.use('/api/nightlife',     nightlifeRouter);
app.use('/api/healthcare',    healthcareRouter);
app.use('/api/megaprojects',  megaprojectsRouter);
app.use('/api/weather',       weatherRouter);
app.use('/api/getaways',      getawaysRouter);
app.use('/api/people',        peopleRouter);
app.use('/api/tips',          tipsRouter);
app.use('/api/coworking',     coworkingRouter);
app.use('/api/jobs',          jobsRouter);

// ── Serve Frontend in Production ────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// ── 404 & Error Handlers ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Bootstrap ───────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`\n🚀  UPHyd API running on http://localhost:${PORT}`);
      console.log(`📊  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍  Environment : ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
