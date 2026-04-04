/**
 * database.js — sql.js (pure WASM SQLite) with better-sqlite3 API compatibility.
 * Routes require ZERO changes — same .prepare().get()/.all()/.run() interface.
 */
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(process.env.DB_PATH || './data/uphyd.db');
let wrappedDb;

// ── Compatibility Layer ─────────────────────────────────────────────────────
class StatementCompat {
  constructor(rawDb, sql) {
    this._db = rawDb;
    this._sql = sql.replace(/@(\w+)/g, '$$$1'); // @name -> $name for sql.js
  }

  _normalizeParams(args) {
    if (!args || args.length === 0) return undefined;
    if (args.length === 1) {
      const p = args[0];
      if (p === undefined || p === null) return undefined;
      if (Array.isArray(p)) return p.length === 0 ? undefined : p;
      if (typeof p === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(p)) out[`$${k}`] = v;
        return out;
      }
      return [p];
    }
    return [...args];
  }

  all(...args) {
    const params = this._normalizeParams(args);
    const stmt = this._db.prepare(this._sql);
    try {
      if (params) stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  get(...args) {
    return this.all(...args)[0] || undefined;
  }

  run(...args) {
    const params = this._normalizeParams(args);
    if (params) this._db.run(this._sql, params);
    else this._db.run(this._sql);
    const r = this._db.exec('SELECT last_insert_rowid() as id');
    return {
      lastInsertRowid: r.length ? r[0].values[0][0] : 0,
      changes: this._db.getRowsModified(),
    };
  }
}

class DbCompat {
  constructor(rawDb) { this._db = rawDb; }
  pragma(s) { try { this._db.run(`PRAGMA ${s}`); } catch (_) {} }
  exec(sql) { this._db.run(sql); }
  prepare(sql) { return new StatementCompat(this._db, sql); }
  transaction(fn) {
    const db = this._db;
    return (...a) => {
      db.run('BEGIN');
      try { const r = fn(...a); db.run('COMMIT'); return r; }
      catch (e) { db.run('ROLLBACK'); throw e; }
    };
  }
}

function getDb() {
  if (!wrappedDb) throw new Error('Database not initialised. Call initDb() first.');
  return wrappedDb;
}

// ── Init (async because sql.js needs WASM init) ────────────────────────────
async function initDb() {
  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let rawDb;
  const isNew = !fs.existsSync(DB_PATH);

  if (!isNew) {
    const buf = fs.readFileSync(DB_PATH);
    rawDb = new SQL.Database(buf);
    console.log(`📂  Database loaded from ${DB_PATH}`);
  } else {
    rawDb = new SQL.Database();
    console.log('📦  New database created — seeding data...');
  }

  wrappedDb = new DbCompat(rawDb);
  wrappedDb.pragma('journal_mode = WAL');
  wrappedDb.pragma('foreign_keys = ON');

  createTables();
  if (isNew) { seedData(); console.log('✅  Seed complete.'); }

  // Persist to disk
  const data = rawDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  return wrappedDb;
}

// ── Schema ──────────────────────────────────────────────────────────────────
function createTables() {
  wrappedDb.exec(`
    CREATE TABLE IF NOT EXISTS startups (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      sector          TEXT    NOT NULL,
      stage           TEXT    NOT NULL,
      location        TEXT    NOT NULL,
      size            TEXT    NOT NULL CHECK(size IN ('Small','Medium','Large')),
      logo            TEXT    NOT NULL,
      description     TEXT    NOT NULL,
      founding_year   INTEGER NOT NULL,
      website         TEXT,
      valuation       TEXT,
      total_raised    TEXT,
      investors       TEXT,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS events (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      date            TEXT    NOT NULL,
      time            TEXT    NOT NULL,
      location        TEXT    NOT NULL,
      category        TEXT    NOT NULL,
      logo            TEXT    NOT NULL,
      description     TEXT,
      registration_url TEXT,
      is_virtual      INTEGER DEFAULT 0,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS hubs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      x               REAL    NOT NULL,
      y               REAL    NOT NULL,
      description     TEXT    NOT NULL,
      type            TEXT    NOT NULL,
      location        TEXT    NOT NULL,
      website         TEXT,
      established     INTEGER,
      highlights      TEXT
    );
    CREATE TABLE IF NOT EXISTS resource_categories (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      icon_name       TEXT    NOT NULL,
      description     TEXT    NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resources (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id     INTEGER NOT NULL REFERENCES resource_categories(id),
      name            TEXT    NOT NULL,
      type            TEXT    NOT NULL,
      location        TEXT    NOT NULL,
      logo            TEXT    NOT NULL,
      website         TEXT,
      description     TEXT
    );
    CREATE TABLE IF NOT EXISTS neighbourhoods (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      personality     TEXT    NOT NULL,
      best_for        TEXT    NOT NULL,
      rent_1bhk_min   INTEGER,
      rent_1bhk_max   INTEGER,
      rent_2bhk_min   INTEGER,
      rent_2bhk_max   INTEGER,
      insider_tip     TEXT,
      area_type       TEXT,
      price_per_sqft_min INTEGER,
      price_per_sqft_max INTEGER
    );
    CREATE TABLE IF NOT EXISTS stats (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      key             TEXT    UNIQUE NOT NULL,
      value           TEXT    NOT NULL,
      label           TEXT    NOT NULL,
      source          TEXT,
      category        TEXT
    );
    CREATE TABLE IF NOT EXISTS news (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      date            TEXT    NOT NULL,
      tag             TEXT    NOT NULL,
      image_url       TEXT,
      description     TEXT    NOT NULL,
      source_url      TEXT,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      email           TEXT    UNIQUE NOT NULL,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      email           TEXT    NOT NULL,
      company         TEXT,
      message         TEXT    NOT NULL,
      type            TEXT    DEFAULT 'general',
      created_at      TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cost_of_living (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      category        TEXT    NOT NULL,
      item            TEXT    NOT NULL,
      cost_min        INTEGER,
      cost_max        INTEGER,
      unit            TEXT    DEFAULT 'per month',
      notes           TEXT
    );
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, area TEXT, cuisine TEXT, category TEXT NOT NULL, rating TEXT, price_for_two INTEGER, specialty TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS breweries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, area TEXT NOT NULL, signature_beers TEXT, highlights TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS nightlife (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, area TEXT, type TEXT NOT NULL, highlights TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS coworking_spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT, type TEXT, price_min INTEGER, price_max INTEGER, unit TEXT DEFAULT 'per month', notes TEXT, website TEXT
    );
    CREATE TABLE IF NOT EXISTS healthcare (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT, national_rank TEXT, score TEXT, specialty TEXT, type TEXT, emergency_number TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS mega_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, investment TEXT, timeline TEXT, status TEXT, description TEXT, category TEXT
    );
    CREATE TABLE IF NOT EXISTS weather (
      id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT NOT NULL, avg_high REAL, avg_low REAL, avg_temp REAL, rainfall_mm REAL, humidity_pct INTEGER, season TEXT, advice TEXT
    );
    CREATE TABLE IF NOT EXISTS weekend_getaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, distance_km INTEGER, drive_time TEXT, best_for TEXT, best_season TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS people_to_follow (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, handle TEXT, platform TEXT NOT NULL, role TEXT, why_follow TEXT
    );
    CREATE TABLE IF NOT EXISTS practical_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, priority INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, company TEXT NOT NULL, title TEXT NOT NULL, location TEXT NOT NULL, type TEXT NOT NULL, salary TEXT, equity TEXT, link TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES events(id), name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ── Seed Data ───────────────────────────────────────────────────────────────
function seedData() {
  const db = wrappedDb;

  // Startups
  const insertStartup = db.prepare(`
    INSERT INTO startups (name, sector, stage, location, size, logo, description, founding_year, website, valuation, total_raised, investors)
    VALUES (@name, @sector, @stage, @location, @size, @logo, @description, @founding_year, @website, @valuation, @total_raised, @investors)
  `);

  const startups = [
    { name: 'Skyroot Aerospace',  sector: 'SpaceTech',  stage: 'Series B',   location: 'T-Hub 2.0',       size: 'Medium', logo: 'https://logo.clearbit.com/skyroot.in', description: "India's first private space launch vehicle company. Launched Vikram-S in November 2022.", founding_year: 2018, website: 'https://skyroot.in',         valuation: '~$489M',  total_raised: '$95M+',   investors: 'Temasek, Graph Ventures, Sherpalo' },
    { name: 'Darwinbox',          sector: 'HR Tech',    stage: 'Unicorn',    location: 'Madhapur',         size: 'Large',  logo: 'https://logo.clearbit.com/darwinbox.com', description: 'Cloud-based HR management platform powered by AI. Processing 500M+ data points.',    founding_year: 2015, website: 'https://darwinbox.com',     valuation: '$1B+',    total_raised: '$307M+',  investors: 'KKR, Partners Group, Microsoft, Peak XV, Lightspeed, Salesforce' },
    { name: 'Zenoti',             sector: 'SaaS',       stage: 'Unicorn',    location: 'Gachibowli',       size: 'Large',  logo: 'https://logo.clearbit.com/zenoti.com', description: 'SaaS platform for beauty, wellness and fitness industry powering 12,000+ businesses.',              founding_year: 2010, website: 'https://www.zenoti.com',    valuation: '$1.5B+',  total_raised: '$250M+',  investors: 'Advent International, Tiger Global, Steadview' },
    { name: 'HighRadius',         sector: 'FinTech',    stage: 'Unicorn',    location: 'Gachibowli',       size: 'Large',  logo: 'https://logo.clearbit.com/highradius.com', description: 'AI-powered Order-to-Cash and Treasury Management SaaS for Fortune 1000.',        founding_year: 2006, website: 'https://www.highradius.com', valuation: '$1B+',    total_raised: '$475M+',  investors: 'Iconiq Capital, Tiger Global, Citi' },
    { name: 'Bharat Biotech',     sector: 'BioTech',    stage: 'Established',location: 'Genome Valley',    size: 'Large',  logo: 'https://logo.clearbit.com/bharatbiotech.com', description: 'Leading vaccine manufacturer. Producer of Covaxin, supplier of 1/3 of global vaccine supply.',      founding_year: 1996, website: 'https://www.bharatbiotech.com',valuation: null,      total_raised: null,      investors: null },
    { name: 'T-Hub',              sector: 'Ecosystem',  stage: 'Government', location: 'Raidurg',          size: 'Large',  logo: 'https://logo.clearbit.com/t-hub.co', description: "India's largest startup incubator — 600,000 sq ft, 1,000 startups simultaneously.",founding_year: 2015, website: 'https://t-hub.co',          valuation: null,      total_raised: null,      investors: 'Govt. of Telangana, IIIT-H, ISB, NALSAR' },
    { name: 'NephroPlus',         sector: 'HealthTech', stage: 'Series C',   location: 'Banjara Hills',    size: 'Large',  logo: 'https://logo.clearbit.com/nephroplus.com', description: "India's largest dialysis network with 400+ centres across South Asia.",                  founding_year: 2009, website: 'https://nephroplus.com',     valuation: '~$250M',  total_raised: '$199M',   investors: 'Bessemer, Abraaj, Investcorp' },
    { name: 'Recykal',            sector: 'CleanTech',  stage: 'Series B',   location: 'Kondapur',         size: 'Medium', logo: 'https://logo.clearbit.com/recykal.com', description: 'Digital marketplace connecting waste generators and recyclers. 1M+ tonnes annually.',     founding_year: 2017, website: 'https://recykal.com',        valuation: null,      total_raised: '$37M',    investors: 'Circulate Capital, Sequoia Surge' },
    { name: 'Credgenics',         sector: 'FinTech',    stage: 'Series B',   location: 'Hitech City',      size: 'Medium', logo: 'https://logo.clearbit.com/credgenics.com', description: 'AI-powered debt resolution and collections platform for banks and NBFCs.',               founding_year: 2018, website: 'https://credgenics.com',     valuation: '~$340M',  total_raised: '$78M',    investors: 'Westbridge, Accel, Beams Fintech' },
    { name: 'Jeh Aerospace',      sector: 'SpaceTech',  stage: 'Series A',   location: 'T-Hub 2.0',        size: 'Small',  logo: 'https://ui-avatars.com/api/?name=Jeh+Aerospace&background=random', description: 'Defence and aerospace startup building next-gen unmanned aerial systems.',               founding_year: 2021, website: null,                        valuation: null,      total_raised: null,       investors: 'General Catalyst' },
    { name: 'Fourth Partner Energy',sector:'CleanTech', stage: 'Series C',   location: 'Gachibowli',       size: 'Large',  logo: 'https://logo.clearbit.com/fourthpartner.co', description: "Commercial & industrial solar energy developer. India's largest for enterprises.",       founding_year: 2010, website: 'https://fourthpartner.co',  valuation: null,      total_raised: '$710M+',  investors: 'IFC, ADB, DEG' },
    { name: 'Marut Drones',       sector: 'DeepTech',   stage: 'Series A',   location: 'T-Hub 2.0',        size: 'Medium', logo: 'https://logo.clearbit.com/marutdrones.com', description: 'AgriTech drone company delivering precision agriculture solutions across India.',      founding_year: 2019, website: 'https://marutdrones.com',    valuation: null,      total_raised: '$10M+',   investors: null },
    { name: 'Dhruva Space',       sector: 'SpaceTech',  stage: 'Series A',   location: 'Raidurg',          size: 'Small',  logo: 'https://logo.clearbit.com/dhruvaspace.com', description: 'Full-stack space tech — satellites, launch services, and ground station networks.',                       founding_year: 2012, website: 'https://dhruvaspace.com',    valuation: null,      total_raised: '$44M',    investors: 'Bayern Kapital, US DFC, Mitsui' },
    { name: 'BrightChamps',       sector: 'EdTech',     stage: 'Series C',   location: 'Madhapur',         size: 'Large',  logo: 'https://logo.clearbit.com/brightchamps.com', description: 'Global ed-tech teaching coding and financial literacy to kids aged 6-16.',              founding_year: 2020, website: 'https://brightchamps.com',   valuation: '~$650M',  total_raised: '$63M',    investors: 'PremjiInvest, GSV Ventures, BEENEXT' },
    { name: 'Swipe',              sector: 'SaaS',       stage: 'Series A',   location: 'Hitech City',      size: 'Medium', logo: 'https://logo.clearbit.com/swipe.pe', description: 'SMB billing, invoicing and inventory management for 600,000+ businesses.',       founding_year: 2020, website: 'https://swipe.pe',           valuation: null,      total_raised: '$10M+',   investors: null },
    { name: 'Smartron',           sector: 'DeepTech',   stage: 'Series B',   location: 'Gachibowli',       size: 'Medium', logo: 'https://logo.clearbit.com/smartron.com', description: 'Hardware and IoT company creating smart devices with proprietary tronX OS.',  founding_year: 2014, website: 'https://smartron.com',       valuation: '$200-250M',total_raised: '~$16M',   investors: 'GEM Group, TAQNIA' },
    { name: 'Apollo 24|7',        sector: 'HealthTech', stage: 'Established',location: 'Jubilee Hills',    size: 'Large',  logo: 'https://logo.clearbit.com/apollo247.com', description: "Apollo's digital health — teleconsultations, e-pharmacy, diagnostics.", founding_year: 2020, website: 'https://apollo247.com',      valuation: null,      total_raised: null,      investors: 'Apollo Hospitals Group' },
    { name: 'MyGate',             sector: 'PropTech',   stage: 'Series B',   location: 'Kondapur',         size: 'Large',  logo: 'https://logo.clearbit.com/mygate.com', description: 'Security and community management for 5M+ households across 25,000+ societies.',    founding_year: 2016, website: 'https://mygate.com',         valuation: null,      total_raised: '$107M',   investors: 'Tiger Global, JS Capital, Y Combinator' },
    { name: 'Brightcom Group',    sector: 'AdTech',     stage: 'Public',     location: 'Kondapur',         size: 'Large',  logo: 'https://ui-avatars.com/api/?name=Brightcom+Group&background=random', description: 'Global programmatic advertising solutions provider in 50+ markets.',             founding_year: 1999, website: null,                        valuation: null,      total_raised: null,      investors: null },
  ];
  for (const s of startups) insertStartup.run(s);

  // Events
  const insertEvent = db.prepare(`
    INSERT INTO events (title, date, time, location, category, logo, description, registration_url, is_virtual)
    VALUES (@title, @date, @time, @location, @category, @logo, @description, @registration_url, @is_virtual)
  `);
  const events = [
    { title: 'BioAsia 2026',                    date: '2026-02-10', time: '09:00', location: 'HICC, Madhapur',           category: 'Conference',  logo: '🧬', description: "Asia's premier life sciences forum with 20,000+ attendees.",                   registration_url: 'https://bioasia.in',       is_virtual: 0 },
    { title: 'TiE50 Hyderabad',                  date: '2026-04-15', time: '10:00', location: 'ISB, Gachibowli',          category: 'Competition', logo: '🏆', description: 'Top 50 Hyderabad startups from ~400 applications.',             registration_url: 'https://tiehyderabad.org', is_virtual: 0 },
    { title: 'Founders Meetup: Scaling SaaS',    date: '2026-04-12', time: '18:00', location: 'T-Hub 2.0, Raidurg',       category: 'Networking',  logo: '🤝', description: 'Monthly founder gathering focusing on SaaS scaling.',           registration_url: null,                       is_virtual: 0 },
    { title: 'DeepTech Summit 2026',             date: '2026-04-22', time: '09:00', location: 'HICC, Madhapur',           category: 'Conference',  logo: '🤖', description: 'Deep tech ecosystem summit featuring AI, SpaceTech, and robotics.',                  registration_url: null,                       is_virtual: 0 },
    { title: 'Pitch Day: Series A Ready',         date: '2026-04-28', time: '14:00', location: 'Virtual',                  category: 'Funding',     logo: '💰', description: 'Curated pitch sessions before 15+ VCs and angel investors.',              registration_url: null,                       is_virtual: 1 },
    { title: 'AI & Ethics Workshop',             date: '2026-05-06', time: '11:00', location: 'IIT Hyderabad, Kandi',     category: 'Workshop',    logo: '🧠', description: 'Workshop on responsible AI design and bias detection.',         registration_url: null,                       is_virtual: 0 },
    { title: 'NMDC Hyderabad Marathon 2026',     date: '2026-08-23', time: '05:00', location: 'Necklace Road',            category: 'Social',      logo: '🏃', description: 'India\'s fastest-growing marathon with 28,300+ runners.',             registration_url: null,                       is_virtual: 0 },
    { title: 'ET Soonicorns Sundowner Hyd',      date: '2026-07-15', time: '17:00', location: 'Financial District',       category: 'Conference',  logo: '📊', description: 'ET x Tracxn annual report launch on soonicorns and minicorns.',             registration_url: null,                       is_virtual: 0 },
    { title: 'WE-Hub Digital Women Awards',      date: '2026-11-29', time: '18:00', location: 'WE Hub, Jubilee Hills',    category: 'Award',       logo: '👩‍💼', description: 'Annual celebration of women entrepreneurs in tech.',                               registration_url: 'https://wehub.telangana.gov.in', is_virtual: 0 },
    { title: 'CIE IIITH GenAI Summit',           date: '2026-03-20', time: '09:00', location: 'IIIT Hyderabad',           category: 'Conference',  logo: '⚡', description: 'Generative AI summit showcasing research spinoffs.',           registration_url: 'https://cie.iiit.ac.in',  is_virtual: 0 },
    { title: 'Hyderabad Startup Cricket League', date: '2026-04-19', time: '07:00', location: 'Gymkhana Ground',          category: 'Social',      logo: '🏏', description: 'Annual cricket tournament for founders, VCs and ecosystem builders.',     registration_url: null,                       is_virtual: 0 },
    { title: 'AI4TG Grand Challenge Demo Day',   date: '2026-05-20', time: '10:00', location: 'T-AIM Center, HITEC City', category: 'Competition', logo: '🎯', description: 'Finals across 6 public problem statements. Rs 15L prize each.', registration_url: 'https://aim.gov.in',       is_virtual: 0 },
  ];
  for (const e of events) insertEvent.run(e);

  // Hubs
  const insertHub = db.prepare(`INSERT INTO hubs (name, x, y, description, type, location, website, established, highlights) VALUES (@name, @x, @y, @description, @type, @location, @website, @established, @highlights)`);
  const hubs = [
    { name: 'T-Hub 2.0',      x: 45, y: 55, description: "India's largest startup incubator — 600,000 sqft, 2,000+ startups supported.",              type: 'Incubator',    location: 'Raidurgam',  website: 'https://t-hub.co',           established: 2015, highlights: '2000+ startups, $1.9B raised' },
    { name: 'WE Hub',         x: 62, y: 38, description: "India's first state-led incubator for women entrepreneurs.",                                                                                          type: 'Incubator',    location: 'Jubilee Hills', website: 'https://wehub.telangana.gov.in', established: 2018, highlights: 'Women-only, Govt backed' },
    { name: 'IMAGE CoE',      x: 50, y: 28, description: 'Centre of Excellence for Gaming, Animation, VFX and digital media.',                                                  type: 'CoE',          location: 'Hitech City',website: null,                         established: 2018, highlights: 'India largest gaming/VFX hub' },
    { name: 'Genome Valley',  x: 82, y: 18, description: "India's first Life Sciences R&D cluster. Bharat Biotech, Dr Reddy's as anchors.",                         type: 'BioTech Hub',  location: 'Shamirpet',  website: null,                         established: 1999, highlights: '300+ acres, 1 lakh+ jobs' },
    { name: 'IIT Hyderabad',  x: 18, y: 72, description: 'Premier research institution — AI, materials science, entrepreneurship.',                               type: 'Academic Hub', location: 'Kandi',      website: 'https://iith.ac.in',         established: 2008, highlights: 'NIRF rank #9, 50+ labs' },
    { name: 'IIIT Hyderabad', x: 48, y: 65, description: "World-class AI/ML research institute. Home to CVIT, RRC, Precog labs.",                                type: 'Academic Hub', location: 'Gachibowli', website: 'https://iiit.ac.in',         established: 1998, highlights: '450+ startups, CIE incubator' },
    { name: 'ISB DLabs',      x: 52, y: 60, description: "ISB's startup incubator — 36+ portfolio startups, 3 exits.",                                type: 'Incubator',    location: 'Gachibowli', website: 'https://isbdlabs.org',       established: 2013, highlights: '$53.6M exit (Sirona)' },
    { name: 'T-Works',        x: 55, y: 45, description: "India's largest prototyping centre at 78,000 sqft.",                                             type: 'CoE',          location: 'Raidurgam',  website: 'https://t-works.io',         established: 2019, highlights: '78,000 sqft, open access' },
    { name: 'AI City Hyd',    x: 30, y: 80, description: '200-acre AI innovation district. NTT Data 25,000-GPU cluster as anchor.',                                          type: 'Mega Project', location: 'Mucherla',   website: null,                         established: 2025, highlights: 'Rs 10,500 Cr, 25,000 GPUs' },
    { name: 'CIE IIIT-H',    x: 46, y: 63, description: "India's largest academic incubator — 450+ startups, Rs 250 Cr+ funding.",                      type: 'Incubator',    location: 'Gachibowli', website: 'https://cie.iiit.ac.in',     established: 2007, highlights: 'India largest academic incubator' },
  ];
  for (const h of hubs) insertHub.run(h);

  // Resource Categories & Resources
  const insertCat = db.prepare(`INSERT INTO resource_categories (title, icon_name, description) VALUES (@title, @icon_name, @description)`);
  const insertRes = db.prepare(`INSERT INTO resources (category_id, name, type, location, logo, website, description) VALUES (@category_id, @name, @type, @location, @logo, @website, @description)`);

  const categories = [
    { title: 'Incubators & Hubs',     icon_name: 'Building2',  description: 'World-class spaces to build, grow and scale.' },
    { title: 'Funding & Grants',      icon_name: 'Coins',      description: 'Capital from local VCs, angel networks, and government grants.' },
    { title: 'Startup Playbook',      icon_name: 'BookOpen',   description: 'Guides, templates, and legal resources.' },
    { title: 'Mentor Network',        icon_name: 'Users',      description: 'Industry veterans, domain experts, serial founders.' },
    { title: 'Government Programs',   icon_name: 'Shield',     description: 'State and national level schemes and incentives.' },
    { title: 'Co-working Spaces',     icon_name: 'Layout',     description: 'Premium flexible workspaces across the IT corridor.' },
  ];

  const resourceMap = {
    'Incubators & Hubs': [
      { name: 'T-Hub 2.0', type: 'Incubator', location: 'Raidurgam', logo: '🏢', website: 'https://t-hub.co', description: "India's largest startup incubator" },
      { name: 'WE Hub', type: 'Women-focused', location: 'Jubilee Hills', logo: '👩‍💼', website: 'https://wehub.telangana.gov.in', description: "India's first state-led women incubator" },
      { name: 'T-Works', type: 'Prototyping', location: 'Raidurgam', logo: '🔧', website: 'https://t-works.io', description: "India's largest hardware prototyping centre" },
      { name: 'CIE IIIT-H', type: 'Academic', location: 'Gachibowli', logo: '🎓', website: 'https://cie.iiit.ac.in', description: "India's largest academic incubator" },
      { name: 'ISB DLabs', type: 'B-School Incubator', location: 'Gachibowli', logo: '📈', website: 'https://isbdlabs.org', description: 'ISB incubator with 36+ portfolio startups' },
    ],
    'Funding & Grants': [
      { name: 'T-Fund (Rs 1000 Cr)', type: 'Govt Fund', location: 'State Govt', logo: '💰', website: null, description: 'CM startup fund for 100 unicorns by 2034' },
      { name: 'Hyderabad Angels Network', type: 'Angel Network', location: 'Banjara Hills', logo: '👼', website: 'https://hyderabadangels.in', description: '150+ investments, largest angel network' },
      { name: 'Endiya Partners', type: 'VC Firm', location: 'HITEC City', logo: '🏦', website: 'https://endiya.com', description: '~$225M AUM, enterprise tech and healthcare' },
      { name: 'Anthill Ventures', type: 'VC Firm', location: 'Jubilee Hills', logo: '🐜', website: null, description: 'Media, UrbanTech, HealthTech focus' },
      { name: 'HAF (Rs 100 Cr Fund)', type: 'Angel Fund', location: 'Hyderabad', logo: '🦅', website: null, description: 'GenAI, spacetech, gaming focus' },
    ],
    'Startup Playbook': [
      { name: 'SPICe+ Guide', type: 'Legal Guide', location: 'MCA Portal', logo: '⚖️', website: 'https://www.mca.gov.in', description: 'Free company incorporation via SPICe+' },
      { name: 'DPIIT Recognition', type: 'Govt Scheme', location: 'NSWS Portal', logo: '📜', website: 'https://www.nsws.gov.in', description: 'Free recognition for tax holidays' },
      { name: 'Section 80-IAC Tax Holiday', type: 'Tax Benefit', location: 'Startup India', logo: '💸', website: 'https://www.startupindia.gov.in', description: '100% tax deduction for 3 years' },
    ],
    'Mentor Network': [
      { name: 'Jayesh Ranjan', type: 'Policy Expert', location: 'Govt of Telangana', logo: '🏛️', website: null, description: 'IAS architect of Hyderabad startup boom' },
      { name: 'Sateesh Andra', type: 'VC Expert', location: 'Endiya Partners', logo: '💼', website: null, description: 'Founding Partner, deep tech VC veteran' },
      { name: 'Pawan Kumar Chandana', type: 'SpaceTech', location: 'Skyroot Aerospace', logo: '🚀', website: null, description: 'CEO Skyroot — first private rocket from Hyderabad' },
    ],
    'Government Programs': [
      { name: 'T-AIM (AI Mission)', type: 'AI Program', location: 'NASSCOM', logo: '🤖', website: null, description: 'State AI data exchange + subsidized GPU access' },
      { name: 'TS-iPASS', type: 'Clearance', location: 'Online Portal', logo: '🏭', website: 'https://ipass.telangana.gov.in', description: 'Single-window clearance, 15-day approval' },
      { name: 'Startup Telangana Portal', type: 'Portal', location: 'Online', logo: '🌐', website: 'https://startuptelangana.telangana.gov.in', description: 'Single dashboard for state incentives' },
    ],
    'Co-working Spaces': [
      { name: 'WeWork India', type: 'Premium', location: 'Mindspace, Gachibowli', logo: '🏙️', website: 'https://wework.in', description: 'Hot desks from Rs 12,000/month' },
      { name: '91springboard', type: 'Community', location: 'HITEC City', logo: '🌱', website: 'https://91springboard.com', description: 'Open flexi Rs 7,000-7,500/month' },
      { name: 'Awfis', type: 'Flexible', location: 'Multiple', logo: '🏢', website: 'https://awfis.com', description: 'Hot desks from Rs 4,500/month' },
      { name: 'iKeva', type: 'Premium', location: 'HITEC City', logo: '🔑', website: 'https://ikeva.com', description: 'Co-working Rs 5,000/month' },
    ],
  };

  for (const cat of categories) {
    const result = insertCat.run(cat);
    const catId = result.lastInsertRowid;
    const items = resourceMap[cat.title] || [];
    for (const item of items) insertRes.run({ category_id: catId, ...item });
  }

  // Neighbourhoods
  const insertN = db.prepare(`INSERT INTO neighbourhoods (name, personality, best_for, rent_1bhk_min, rent_1bhk_max, rent_2bhk_min, rent_2bhk_max, insider_tip, area_type, price_per_sqft_min, price_per_sqft_max) VALUES (@name, @personality, @best_for, @rent_1bhk_min, @rent_1bhk_max, @rent_2bhk_min, @rent_2bhk_max, @insider_tip, @area_type, @price_per_sqft_min, @price_per_sqft_max)`);
  const neighbourhoods = [
    { name: 'HITEC City / Madhapur', personality: 'The Silicon Epicentre. Google, Microsoft, Amazon all here.', best_for: 'Corporate MNC employees, GCC workers', rent_1bhk_min: 28000, rent_1bhk_max: 32000, rent_2bhk_min: 40000, rent_2bhk_max: 45000, insider_tip: 'Durgam Cheruvu is a hidden gem minutes from the tech corridor.', area_type: 'IT Corridor', price_per_sqft_min: 5000, price_per_sqft_max: 13000 },
    { name: 'Gachibowli', personality: 'Newer, more planned than HITEC City. DLF IT SEZ, RMZ Futura.', best_for: 'IT professionals wanting more space; families', rent_1bhk_min: 22000, rent_1bhk_max: 26000, rent_2bhk_min: 35000, rent_2bhk_max: 40000, insider_tip: 'Gachibowli Stadium has excellent sports infrastructure.', area_type: 'IT Corridor', price_per_sqft_min: 8000, price_per_sqft_max: 15000 },
    { name: 'Kondapur', personality: 'Best quality-of-life-to-cost ratio in the tech corridor.', best_for: 'IT proximity without full IT pricing; couples', rent_1bhk_min: 18000, rent_1bhk_max: 22000, rent_2bhk_min: 28000, rent_2bhk_max: 32000, insider_tip: 'Third Wave Coffee Kondapur is the go-to work cafe.', area_type: 'IT Corridor', price_per_sqft_min: 5200, price_per_sqft_max: 12000 },
    { name: 'Financial District / Kokapet', personality: "Hyderabad's next phase. Prestige Skytech, RMZ Ecoworld.", best_for: 'Those ahead of the curve; Financial District workers', rent_1bhk_min: 24000, rent_1bhk_max: 28000, rent_2bhk_min: 35000, rent_2bhk_max: 40000, insider_tip: 'Tansen and Beer Cartel are both here.', area_type: 'Emerging Corridor', price_per_sqft_min: 6500, price_per_sqft_max: 15000 },
    { name: 'Jubilee Hills / Banjara Hills', personality: 'Old money meets new tech money. Best nightlife and dining.', best_for: 'Senior professionals; founders who entertain', rent_1bhk_min: 30000, rent_1bhk_max: 40000, rent_2bhk_min: 50000, rent_2bhk_max: 55000, insider_tip: 'Road 45 pub crawl is the best evening activity.', area_type: 'Lifestyle Quarter', price_per_sqft_min: 10000, price_per_sqft_max: 22000 },
    { name: 'Miyapur / Kukatpally', personality: 'Most accessible zones for freshers. Red Line Metro.', best_for: 'Freshers, budget professionals, families', rent_1bhk_min: 14000, rent_1bhk_max: 20000, rent_2bhk_min: 22000, rent_2bhk_max: 28000, insider_tip: 'Kukatpally has Ironhill — largest microbrewery at 25,000 sqft.', area_type: 'Budget Zone', price_per_sqft_min: 2800, price_per_sqft_max: 8500 },
    { name: 'Secunderabad', personality: 'Twin city. Traditional, heritage character. Best rail connectivity.', best_for: 'Train commuters; heritage lovers; defence sector', rent_1bhk_min: 15000, rent_1bhk_max: 22000, rent_2bhk_min: 20000, rent_2bhk_max: 28000, insider_tip: 'Best Irani chai in the city.', area_type: 'Heritage Zone', price_per_sqft_min: 3500, price_per_sqft_max: 7000 },
    { name: 'Manikonda / Tolichowki', personality: 'Practical middle ground. Famous for food on a budget.', best_for: 'Value-conscious IT professionals; food lovers', rent_1bhk_min: 16000, rent_1bhk_max: 22000, rent_2bhk_min: 25000, rent_2bhk_max: 32000, insider_tip: 'Yousuf Tekri is the best street food zone for carnivores.', area_type: 'Value Zone', price_per_sqft_min: 4000, price_per_sqft_max: 9000 },
  ];
  for (const n of neighbourhoods) insertN.run(n);

  // Stats
  const insertStat = db.prepare(`INSERT INTO stats (key, value, label, source, category) VALUES (@key, @value, @label, @source, @category)`);
  const stats = [
    { key: 'total_startups',     value: '9,000+',    label: 'Total Startups',         source: 'Hyderabad Innovation Report 2025', category: 'ecosystem' },
    { key: 'unicorns',           value: '3',         label: 'Unicorns',               source: 'Inc42 2025',                       category: 'ecosystem' },
    { key: 'cumulative_funding', value: '$5.8B+',    label: 'Cumulative Funding',     source: 'Hyderabad Innovation Report 2025', category: 'ecosystem' },
    { key: 'gccs',               value: '355+',      label: 'GCCs',                   source: 'Zinnov 2025',                      category: 'ecosystem' },
    { key: 'it_jobs',            value: '9.33 Lakh+',label: 'Direct IT Jobs',         source: 'OneIndia 2025',                    category: 'economy' },
    { key: 'it_exports',         value: '₹3.13 Lakh Cr',label: 'IT Exports (FY25)',   source: 'The South First',                  category: 'economy' },
    { key: 'gsdp_growth',        value: '10.7%',     label: 'Telangana GSDP Growth',  source: 'ThePrint/PTI 2026',                category: 'economy' },
    { key: 'metro_population',   value: '11.6M',     label: 'Metro Population',       source: 'World Population Review 2026',     category: 'city' },
    { key: 'avg_sw_salary',      value: '₹32.9 LPA', label: 'Avg SW Engineer Salary', source: 'Levels.fyi March 2026',            category: 'talent' },
    { key: 'office_stock',       value: '110M sqft', label: 'Total Office Stock',     source: 'Realty Plus 2025',                 category: 'real_estate' },
    { key: 'qol_rank_india',     value: '#1',        label: 'Quality of Living (India)',source: 'Mercer 2024',                    category: 'liveability' },
  ];
  for (const s of stats) insertStat.run(s);

  // News
  const insertNews = db.prepare(`INSERT INTO news (title, date, tag, image_url, description, source_url) VALUES (@title, @date, @tag, @image_url, @description, @source_url)`);
  const news = [
    { title: 'Skyroot Aerospace raises Rs 100 Cr via NCDs from BlackRock',        date: '2026-03-28', tag: 'Funding',    image_url: 'https://picsum.photos/seed/skyroot2026/800/600',   description: 'Hyderabad space-tech company raises debt funding from BlackRock.',             source_url: null },
    { title: 'Darwinbox closes $40M round from Teachers Venture Growth',       date: '2026-03-15', tag: 'Funding',    image_url: 'https://picsum.photos/seed/darwinbox2026/800/600', description: 'HR-tech unicorn adds $40M. Global expansion accelerates.',             source_url: null },
    { title: 'Google for Startups Hub India opens at T-Hub Hyderabad',           date: '2025-12-10', tag: 'Ecosystem',  image_url: 'https://picsum.photos/seed/thub2026/800/600',      description: "India's first Google for Startups Hub launched at T-Hub.",                     source_url: 'https://x.com/THubHyd/status/2002974228451405875' },
    { title: 'Microsoft India South Central goes live in Hyderabad',             date: '2026-06-01', tag: 'Tech',       image_url: 'https://picsum.photos/seed/msft2026/800/600',      description: "Microsoft's largest hyperscale cloud region in India with 3 AZs.",           source_url: null },
    { title: 'Bharat Future City: Rs 5.75 lakh crore MoUs at Rising Summit',    date: '2025-12-09', tag: 'Policy',     image_url: 'https://picsum.photos/seed/bfc2026/800/600',       description: '30,000-acre greenfield smart city near Mucherla announced.',  source_url: null },
    { title: 'NTT Data: 25,000 GPU cluster coming to Hyderabad by 2027',        date: '2026-02-20', tag: 'Infrastructure',image_url:'https://picsum.photos/seed/gpu2026/800/600',    description: 'Rs 10,500 Cr investment bringing 25,000 GPUs to Hyderabad.',              source_url: null },
    { title: 'Hyderabad ranked #1 in India liveability — WeAreCity 2026',        date: '2026-01-20', tag: 'Liveability',image_url: 'https://picsum.photos/seed/live2026/800/600',      description: 'Hyderabad beats Bangalore and Mumbai across 15 liveability metrics.',      source_url: null },
  ];
  for (const n of news) insertNews.run(n);

  // Cost of Living (expanded)
  const insertCost = db.prepare(`INSERT INTO cost_of_living (category, item, cost_min, cost_max, unit, notes) VALUES (@category, @item, @cost_min, @cost_max, @unit, @notes)`);
  const costs = [
    { category: 'Rent', item: '1BHK (IT corridor)', cost_min: 15000, cost_max: 30000, unit: 'per month', notes: 'Kondapur-HITEC range' },
    { category: 'Rent', item: '1BHK (outside centre)', cost_min: 7500, cost_max: 15000, unit: 'per month', notes: 'Miyapur, Kukatpally area' },
    { category: 'Rent', item: '2BHK (IT corridor)', cost_min: 28000, cost_max: 45000, unit: 'per month', notes: 'Gachibowli-HITEC range' },
    { category: 'Rent', item: '2BHK (budget area)', cost_min: 18000, cost_max: 28000, unit: 'per month', notes: 'Miyapur, Chandanagar' },
    { category: 'Food', item: 'Meal at inexpensive restaurant', cost_min: 200, cost_max: 300, unit: 'per meal', notes: 'Numbeo March 2026' },
    { category: 'Food', item: 'Meal for two, mid-range', cost_min: 1200, cost_max: 1800, unit: 'per meal', notes: '3-course meal' },
    { category: 'Food', item: '1 litre milk', cost_min: 65, cost_max: 75, unit: 'per litre', notes: 'Numbeo March 2026' },
    { category: 'Food', item: '1 kg chicken', cost_min: 280, cost_max: 350, unit: 'per kg', notes: 'Numbeo March 2026' },
    { category: 'Transport', item: 'Monthly metro pass', cost_min: 1400, cost_max: 1400, unit: 'per month', notes: 'HMRL' },
    { category: 'Transport', item: 'One-way metro/bus ticket', cost_min: 30, cost_max: 60, unit: 'per trip', notes: null },
    { category: 'Utilities', item: 'Basic utilities (915 sqft)', cost_min: 3500, cost_max: 4500, unit: 'per month', notes: 'Electricity, water, gas' },
    { category: 'Utilities', item: 'Broadband (60+ Mbps)', cost_min: 700, cost_max: 800, unit: 'per month', notes: 'ACT/Jio Fiber' },
    { category: 'Utilities', item: 'Mobile plan (10GB+)', cost_min: 350, cost_max: 450, unit: 'per month', notes: 'Jio/Airtel' },
    { category: 'Entertainment', item: 'Cinema ticket', cost_min: 200, cost_max: 400, unit: 'per ticket', notes: 'PVR/INOX' },
    { category: 'Co-working', item: 'Hot desk', cost_min: 4000, cost_max: 8000, unit: 'per month', notes: 'Awfis, iSprout' },
    { category: 'Co-working', item: 'Dedicated desk', cost_min: 6000, cost_max: 12000, unit: 'per month', notes: '91springboard, WeWork' },
    { category: 'Co-working', item: 'Private cabin', cost_min: 8000, cost_max: 20000, unit: 'per month', notes: 'Per person or cabin' },
    { category: 'Budget', item: 'Single professional (IT corridor)', cost_min: 40000, cost_max: 60000, unit: 'per month', notes: 'Including rent' },
    { category: 'Budget', item: 'Single professional (budget area)', cost_min: 25000, cost_max: 40000, unit: 'per month', notes: 'Including rent' },
    { category: 'Budget', item: 'Family of four', cost_min: 52000, cost_max: 97000, unit: 'per month', notes: 'Including rent & school' },
    { category: 'Education', item: 'Private school (IT belt)', cost_min: 110000, cost_max: 600000, unit: 'per year', notes: 'CBSE/IGCSE tuition only' },
  ];
  for (const c of costs) insertCost.run(c);

  // ── Restaurants ──
  const insertRest = db.prepare(`INSERT INTO restaurants (name, area, cuisine, category, rating, price_for_two, specialty, description) VALUES (@name, @area, @cuisine, @category, @rating, @price_for_two, @specialty, @description)`);
  [
    { name:'Cafe Bahar', area:'Basheerbagh', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.5', price_for_two:500, specialty:'Dum Biryani', description:'Ranked #1 by local foodies. Old-school dum biryani with deep masala layering.' },
    { name:'Hotel Shadab', area:'Old City', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.4', price_for_two:700, specialty:'Chicken Biryani', description:'Near Charminar. Tender chicken biryani at Rs 350. Always crowded by 1 PM.' },
    { name:'Bawarchi (RTC X Roads)', area:'Himayatnagar', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.3', price_for_two:600, specialty:'Dum Biryani', description:'The OG since 1994. RTC X Roads branch is the original and best.' },
    { name:'Paradise Restaurant', area:'Secunderabad', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.3', price_for_two:700, specialty:'Aromatic Biryani', description:'Most iconic name in Hyd biryani. Huge portions, aromatic rice.' },
    { name:'Shah Ghouse', area:'Multiple', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.5', price_for_two:600, specialty:'Biryani & Kebabs', description:'4.5 community rating. Multiple outlets across the city.' },
    { name:'Pista House', area:'Multiple', cuisine:'Hyderabadi', category:'Biryani Legend', rating:'4.4', price_for_two:500, specialty:'Haleem', description:'Best Haleem in city — won Best Haleem Award 2025. Visit during Ramzan.' },
    { name:'Terrai', area:'Raidurgam', cuisine:'Neo-Telangana', category:'New & Trending', rating:'4.7', price_for_two:2500, specialty:'Pachi Pulusu Pani Puri', description:'Condé Nast 2025 Hot List. First Neo-Telangana restaurant in India.' },
    { name:'Tansen', area:'Financial District', cuisine:'Mughal Fine Dining', category:'Fine Dining', rating:'4.8', price_for_two:2000, specialty:'Live Sufi Music', description:'Fine Dine Restaurant of the Year 2026. Floating masterpiece concept.' },
    { name:'Yi Jing', area:'Banjara Hills', cuisine:'Chinese/Asian', category:'Fine Dining', rating:'5.0', price_for_two:2000, specialty:'Dim Sum', description:'780 TripAdvisor reviews. Extraordinary dumplings, best dim sum in city.' },
    { name:'Bidri', area:'Hyderabad', cuisine:'Indian', category:'Fine Dining', rating:'4.9', price_for_two:2000, specialty:'Innovative Starters', description:'977 TripAdvisor reviews. Excellent biryani + innovative starters.' },
    { name:'Mekong', area:'Hyderabad', cuisine:'Thai/Szechuan', category:'Fine Dining', rating:'4.9', price_for_two:2500, specialty:'Sushi', description:'Renowned for sushi and best Asian fusion in the city.' },
    { name:'Peshawri', area:'ITC Kohenur', cuisine:'NW Frontier', category:'Fine Dining', rating:'4.9', price_for_two:4000, specialty:'Tandoor', description:'ITC Kohenur. Flawless tandoor cuisine.' },
    { name:'Ada', area:'Taj Falaknuma Palace', cuisine:'Indian', category:'Fine Dining', rating:'4.9', price_for_two:5000, specialty:'Royal Cuisine', description:'Most regal dining setting in the city at the Taj Falaknuma Palace.' },
    { name:'SABHĀ Café', area:'Hyderabad', cuisine:'International', category:'New & Trending', rating:'4.5', price_for_two:1200, specialty:'Design Café', description:'Opened Sep 2025. Design-forward café on international listings.' },
    { name:'Lili', area:'Jubilee Hills', cuisine:'Cantonese', category:'New & Trending', rating:'4.5', price_for_two:2000, specialty:'Cantonese', description:'Opened Mar 2026. First dedicated Cantonese spot in Hyderabad.' },
    { name:'Sarvi Restaurant', area:'Mehdipatnam', cuisine:'Hyderabadi', category:'Local Gem', rating:'4.1', price_for_two:800, specialty:'Broasted Chicken', description:'Broasted chicken + biryani. Top-tier in locals view.' },
    { name:'Coal Spark', area:'Gachibowli', cuisine:'Hyderabadi', category:'Local Gem', rating:'4.3', price_for_two:700, specialty:'Biryani', description:'Highly rated IT corridor option for biryani lovers.' },
  ].forEach(r => insertRest.run(r));

  // ── Breweries ──
  const insertBrew = db.prepare(`INSERT INTO breweries (name, area, signature_beers, highlights, description) VALUES (@name, @area, @signature_beers, @highlights, @description)`);
  [
    { name:'The Hoppery', area:'Jubilee Hills', signature_beers:'Lager, Wheat, IPA, Stout, Cinnamon Ale', highlights:'Split-level glasshouse with Durgam Cheruvu lake views. Live music Thu & Sat.', description:'6 beers on tap with stunning lake views.' },
    { name:'Zythum Brewing Co.', area:'Jubilee Hills', signature_beers:'Belgian Witbier, Hefeweizen, Czech Pilsner, West Coast IPA, Mango Cider', highlights:'Grandest brewpub. 3-level seating around central atrium.', description:'Grand 3-level brewpub with Belgian-inspired craft beers.' },
    { name:'Prost Brewpub', area:'Jubilee Hills', signature_beers:'Wheat, Blonde, Vanilla Stout, Red Rice Ale', highlights:'First Hyderabad brewery (2016). Jet-setter crowd.', description:'Pioneer microbrewery since 2016 on Road 45.' },
    { name:'Forge Breu-Hous', area:'Jubilee Hills', signature_beers:'Wit, Lager, IPA, Pineapple Sour, Strawberry Cider', highlights:'Best outdoor section. Expert brewer team. 8 taps.', description:'8 taps with best outdoor seating on Road 45.' },
    { name:'Broadway The Brewery', area:'Jubilee Hills', signature_beers:'Wit, Hefeweizen, Chocolate Vanilla Stout, Winter Ale', highlights:'Walking distance from Prost and Forge — perfect pub crawl.', description:'Part of the iconic Road 45 pub crawl triangle.' },
    { name:'Zero40 Brewing', area:'Jubilee Hills + Financial District', signature_beers:'Tropical Lager, Rauchbier, 8 Signature + Seasonal', highlights:'Named after Hyderabad dialling code (+040).', description:'8 signature + seasonal beers across two locations.' },
    { name:'Red Rhino Craft Brewery', area:'HITEC City', signature_beers:'5 Signature + 3 Seasonal', highlights:'IT crowd favourite. All beers food-pairing-optimized.', description:'IT corridor craft brewery with food pairing focus.' },
    { name:'The Beer Cartel', area:'Raidurgam', signature_beers:'3 In-house + 4 Geist Brewing Co.', highlights:'Office-crowd favourite at Sattva Knowledge Park.', description:'Glass tower brewery at Sattva Knowledge Park.' },
    { name:'Ironhill Hyderabad', area:'Kukatpally', signature_beers:'Afterlife Ale, L.O.S.T. Lager, Sinnerman Stout', highlights:'25,000 sqft. First microbrewery in Kukatpally. Live music.', description:'City largest microbrewery at 25,000 sqft.' },
    { name:'MOB – Belgian Beer House', area:'Film Nagar', signature_beers:'6 Belgian Draught + 12 Bottled', highlights:'India first exclusively Belgian beer house.', description:'Unique Belgian-only beer house near Apollo Hospital.' },
  ].forEach(b => insertBrew.run(b));

  // ── Nightlife ──
  const insertNight = db.prepare(`INSERT INTO nightlife (name, area, type, highlights, description) VALUES (@name, @area, @type, @highlights, @description)`);
  [
    { name:'Prism Club & Kitchen', area:'Financial District', type:'Nightclub', highlights:'3-acre venue; Vegas-style lighting; largest dance floor; pools + lounges', description:'India No.1 club (self-described). 3-acre mega venue.' },
    { name:'Aqua, The Park', area:'Necklace Road', type:'Nightclub', highlights:'Poolside party; city skyline views; 4.5/5 TripAdvisor', description:'Premium poolside nightclub with Hussain Sagar views.' },
    { name:'Block 22', area:'Jubilee Hills', type:'Nightclub', highlights:'Known for light shows and DJ nights', description:'Premium light show and DJ experience.' },
    { name:'EXT', area:'Jubilee Hills', type:'Live Music + Club', highlights:'Weekly performances + DJ nights; Beats and Banter on Wednesdays', description:'Live performances + DJ nights, popular Wednesday sessions.' },
    { name:'Amnesia Sky Bar', area:'Jubilee Hills', type:'Rooftop Bar', highlights:'Panoramic views; 4.8 on VenueLook', description:'Rooftop bar with panoramic city views.' },
    { name:'The Street Comedy Club', area:'Drive In', type:'Comedy', highlights:'Solo shows, crowd work nights, open mics; via BookMyShow', description:'Hyderabad premier dedicated comedy room.' },
    { name:'Prasads IMAX', area:'NTR Marg', type:'Cinema', highlights:'Standalone IMAX; iconic landmark', description:'Iconic standalone IMAX cinema at Tank Bund.' },
    { name:'Hard Rock Cafe', area:'Banjara Hills', type:'Live Music', highlights:'International and Indian rock acts', description:'International rock venue with live performances.' },
    { name:'Lamakaan', area:'Banjara Hills', type:'Cultural Space', highlights:'Theatre, open mic, organic market Sundays', description:'City most important cultural space — theatre, music, discussions.' },
  ].forEach(n => insertNight.run(n));

  // ── Coworking Spaces ──
  const insertCW = db.prepare(`INSERT INTO coworking_spaces (name, location, type, price_min, price_max, unit, notes, website) VALUES (@name, @location, @type, @price_min, @price_max, @unit, @notes, @website)`);
  [
    { name:'WeWork India', location:'Krishe Emerald, Raheja Mindspace, Gachibowli', type:'Premium', price_min:12000, price_max:25000, unit:'per month', notes:'Grade A buildings; global network', website:'https://wework.in' },
    { name:'91springboard', location:'HITEC City, Madhapur, Kondapur', type:'Community', price_min:7000, price_max:11000, unit:'per month', notes:'27 hubs nationally; community-focused', website:'https://91springboard.com' },
    { name:'Awfis', location:'HITEC City, Begumpet, Banjara Hills', type:'Flexible', price_min:4500, price_max:12000, unit:'per month', notes:'150+ centres nationally', website:'https://awfis.com' },
    { name:'iKeva', location:'HITEC City, Kondapur, Banjara Hills', type:'Premium', price_min:5000, price_max:49000, unit:'per month', notes:'24x7; Hyderabad-focused', website:'https://ikeva.com' },
    { name:'Innov8', location:'Multiple', type:'Design-First', price_min:6000, price_max:15000, unit:'per month', notes:'Design-first approach', website:null },
    { name:'Smartworks', location:'Multiple', type:'Enterprise', price_min:10000, price_max:30000, unit:'per month', notes:'Enterprise managed offices', website:null },
    { name:'alt.f coworking', location:'Financial District, Begumpet, Gachibowli', type:'Startup', price_min:5000, price_max:15000, unit:'per month', notes:'18+ centres; startup-friendly', website:null },
  ].forEach(c => insertCW.run(c));

  // ── Healthcare ──
  const insertHealth = db.prepare(`INSERT INTO healthcare (name, location, national_rank, score, specialty, type, emergency_number, description) VALUES (@name, @location, @national_rank, @score, @specialty, @type, @emergency_number, @description)`);
  [
    { name:'Apollo Hospitals — Jubilee Hills', location:'Jubilee Hills', national_rank:'#31', score:'67.71%', specialty:'Cardiac, Oncology', type:'Private', emergency_number:'1860-500-1066', description:'Newsweek 2026 ranked. #79 in Asia for orthopedics.' },
    { name:'Apollo Hospitals — Secunderabad', location:'Secunderabad', national_rank:'#21', score:'68.34%', specialty:'Cardiac, Oncology', type:'Private', emergency_number:'1860-500-1066', description:'Highest scoring Hyderabad hospital in Newsweek 2026.' },
    { name:'Yashoda Hospitals — Somajiguda', location:'Somajiguda', national_rank:'#38', score:'65.02%', specialty:'Cardiac, Ortho', type:'Private', emergency_number:'040-4567-4567', description:'Top-ranked Yashoda campus in Newsweek 2026.' },
    { name:'CARE Hospitals — Banjara Hills', location:'Banjara Hills', national_rank:'#60', score:'63.93%', specialty:'Cardiac, Neuro', type:'Private', emergency_number:null, description:'One of Hyderabad most trusted hospital chains.' },
    { name:'Continental Hospitals', location:'Gachibowli', national_rank:'#74', score:'63.59%', specialty:'Emergency/Trauma', type:'Private', emergency_number:'040-6700-0000', description:'Best positioned for IT corridor emergency care.' },
    { name:'Medicover — Financial District', location:'Nanakramguda', national_rank:null, score:null, specialty:'Multi-specialty', type:'Private', emergency_number:'040-6833-4455', description:'India tallest hospital building. 550 beds, 25 storeys. Opened March 2026.' },
    { name:'LV Prasad Eye Institute', location:'Banjara Hills', national_rank:null, score:null, specialty:'Ophthalmology', type:'Research Hospital', emergency_number:null, description:'World-class ophthalmology. Founded 1987. Cross-subsidises care for the poor.' },
    { name:'NIMS', location:'Punjagutta', national_rank:null, score:null, specialty:'Government Referral', type:'Government', emergency_number:'040-2348-9000', description:'2,000-bed expansion. Primary government referral hospital.' },
    { name:'AIG Hospitals', location:'Gachibowli', national_rank:null, score:null, specialty:'Gastroenterology', type:'Private', emergency_number:null, description:'Among Asia best GI hospitals.' },
  ].forEach(h => insertHealth.run(h));

  // ── Mega Projects ──
  const insertMega = db.prepare(`INSERT INTO mega_projects (name, investment, timeline, status, description, category) VALUES (@name, @investment, @timeline, @status, @description, @category)`);
  [
    { name:'Bharat Future City (BFC)', investment:'₹5.75 Lakh Crore MoUs', timeline:'2025–2035', status:'Foundation Laid', description:'30,000-acre net-zero greenfield smart city near Mucherla. AI City, Health City, Green Pharma Hub.', category:'Smart City' },
    { name:'Hyderabad Pharma City', investment:'₹64,000 Crore', timeline:'2024–2032', status:'Phase 1 Active', description:'19,000+ acre — world largest integrated pharma park. 5.6 lakh+ expected jobs.', category:'Pharma' },
    { name:'Regional Ring Road (RRR)', investment:'₹37,000–40,000 Crore', timeline:'2026–2032', status:'Planning', description:'340 km, 100-metre-wide RRR connecting 7 districts, 163 revenue villages.', category:'Infrastructure' },
    { name:'Metro Phase II (A)', investment:'₹24,269 Crore', timeline:'2028–2030', status:'DPR Submitted', description:'76.4 km, 5 new corridors including Airport Metro and Kokapet extension.', category:'Metro' },
    { name:'Metro Phase II (B)', investment:'₹19,579 Crore', timeline:'2029–2033', status:'DPR Submitted', description:'86.1 km, 3 corridors including RGIA to Bharat Future City.', category:'Metro' },
    { name:'Microsoft India South Central', investment:'Part of $17.5B', timeline:'Mid-2026', status:'Going Live', description:'Microsoft largest hyperscale cloud region in India. 3 availability zones.', category:'Tech' },
    { name:'NTT DATA GPU Cluster', investment:'₹10,500 Crore', timeline:'2027', status:'MoU Signed', description:'400 MW, 25,000 GPUs — first 4,000 GPUs by 2027 at AI City.', category:'AI Infrastructure' },
    { name:'Musi River Rejuvenation', investment:'₹15,000+ Crore', timeline:'Phase 1: Apr 2026', status:'Launching', description:'62 STPs, 50m buffer zone. Gandhi Sarovar 200-acre centre with 123ft statue.', category:'Urban Renewal' },
    { name:'Airport Metro Express', investment:'₹6,250 Crore', timeline:'2026–2029', status:'Planned', description:'Raidurg to RGIA in ~30 minutes. 31 km rapid transit link.', category:'Metro' },
    { name:'GHMC Area Expansion', investment:null, timeline:'Nov 2025', status:'Completed', description:'GHMC expanded to 1,983 km² — India largest city by area. 1.69 crore population.', category:'Governance' },
  ].forEach(m => insertMega.run(m));

  // ── Weather ──
  const insertWeather = db.prepare(`INSERT INTO weather (month, avg_high, avg_low, avg_temp, rainfall_mm, humidity_pct, season, advice) VALUES (@month, @avg_high, @avg_low, @avg_temp, @rainfall_mm, @humidity_pct, @season, @advice)`);
  [
    { month:'January', avg_high:32.8, avg_low:11.1, avg_temp:21.6, rainfall_mm:8, humidity_pct:56, season:'Winter', advice:'Best month. Light jacket for mornings. Perfect for outdoor activities.' },
    { month:'February', avg_high:36.5, avg_low:13.7, avg_temp:24.8, rainfall_mm:6, humidity_pct:44, season:'Winter → Spring', advice:'Still ideal. SPF 50+ and sunglasses become essentials.' },
    { month:'March', avg_high:40.4, avg_low:17.2, avg_temp:28.8, rainfall_mm:15, humidity_pct:36, season:'Pre-Summer', advice:'Summer starts. Exercise before 7 AM or after sunset.' },
    { month:'April', avg_high:42.4, avg_low:21.1, avg_temp:31.9, rainfall_mm:22, humidity_pct:36, season:'Summer', advice:'Avoid outdoors 10 AM–4 PM. Carry ORS packets. AC is essential.' },
    { month:'May', avg_high:43.3, avg_low:23.8, avg_temp:33.1, rainfall_mm:35, humidity_pct:39, season:'Peak Summer', advice:'Hottest month. All-time record 45.5°C. Mango season peak.' },
    { month:'June', avg_high:39.7, avg_low:22.0, avg_temp:28.7, rainfall_mm:119, humidity_pct:63, season:'Monsoon Onset', advice:'Monsoon arrives first week. Keep umbrella in car. Check flood-prone areas.' },
    { month:'July', avg_high:34.0, avg_low:21.2, avg_temp:26.2, rainfall_mm:183, humidity_pct:76, season:'Peak Monsoon', advice:'Wettest period. Carry waterproof bags. Dengue precautions needed.' },
    { month:'August', avg_high:31.9, avg_low:20.8, avg_temp:25.3, rainfall_mm:187, humidity_pct:82, season:'Peak Monsoon', advice:'Most rain. Food hygiene critical. Road flooding adds 45-90 min to commutes.' },
    { month:'September', avg_high:31.2, avg_low:19.9, avg_temp:25.0, rainfall_mm:145, humidity_pct:83, season:'Late Monsoon', advice:'Highest humidity. Great for nearby waterfall trips. Ganesh Chaturthi traffic.' },
    { month:'October', avg_high:30.9, avg_low:16.1, avg_temp:23.9, rainfall_mm:87, humidity_pct:79, season:'Post-Monsoon', advice:'City is lush and green. Outdoor events resume. Watch for potholes.' },
    { month:'November', avg_high:30.4, avg_low:12.8, avg_temp:21.8, rainfall_mm:20, humidity_pct:73, season:'Winter Onset', advice:'Peak season returns. Perfect for tourism and outdoor dining.' },
    { month:'December', avg_high:30.2, avg_low:10.9, avg_temp:20.6, rainfall_mm:4, humidity_pct:64, season:'Winter', advice:'Best months. NYE reservations needed 4-6 weeks early. Fog possible on ORR.' },
  ].forEach(w => insertWeather.run(w));

  // ── Weekend Getaways ──
  const insertGetaway = db.prepare(`INSERT INTO weekend_getaways (name, distance_km, drive_time, best_for, best_season, description) VALUES (@name, @distance_km, @drive_time, @best_for, @best_season, @description)`);
  [
    { name:'Bhongir Fort', distance_km:50, drive_time:'1 hr', best_for:'Quick weekend trek', best_season:'Oct–Feb', description:'Monolithic rock fort by Chalukya rulers. Rope climbing and rappelling available.' },
    { name:'Rachakonda Fort', distance_km:60, drive_time:'1.5 hrs', best_for:'Heritage, rock trekking', best_season:'Monsoon & Winter', description:'Velama era fort with unique rock formations and panoramic valley views.' },
    { name:'Ananthagiri Hills', distance_km:85, drive_time:'2 hrs', best_for:'Nature, trekking, coffee', best_season:'Post-monsoon', description:'Birthplace of Musi River. Dense forests, ancient caves, coffee plantations.' },
    { name:'Warangal', distance_km:148, drive_time:'3 hrs', best_for:'UNESCO temple, heritage', best_season:'Oct–Feb', description:'Kakatiya capital. Ramappa Temple (UNESCO), Warangal Fort, 1000 Pillar Temple.' },
    { name:'Bidar (Karnataka)', distance_km:150, drive_time:'3 hrs', best_for:'Forts, Sikh history', best_season:'All year', description:'15th-century Bahmani fort, Bidriware craft, Gurudwara Nanak Jhira Sahib.' },
    { name:'Nagarjunasagar', distance_km:165, drive_time:'3.5 hrs', best_for:'Dam, Buddhist ruins', best_season:'Aug–Feb', description:'World largest masonry dam. Nagarjunakonda Buddhist island museum.' },
    { name:'Srisailam', distance_km:215, drive_time:'5 hrs', best_for:'Jyotirlinga, forest, dam', best_season:'Oct–Mar', description:'Mallikarjuna Jyotirlinga temple. Nallamala forest drive. Tiger reserve.' },
    { name:'Belum Caves (Kurnool)', distance_km:220, drive_time:'4.5 hrs', best_for:'Caves, waterfalls', best_season:'Jul–Nov', description:'Second-longest cave system in India at 3.2 km. Stalactites and stalagmites.' },
    { name:'Hampi (Karnataka)', distance_km:375, drive_time:'6–7 hrs', best_for:'UNESCO World Heritage', best_season:'Oct–Feb', description:'Vijayanagara ruins — 500+ monuments. Stone chariot, musical pillars.' },
  ].forEach(g => insertGetaway.run(g));

  // ── People to Follow ──
  const insertPeople = db.prepare(`INSERT INTO people_to_follow (name, handle, platform, role, why_follow) VALUES (@name, @handle, @platform, @role, @why_follow)`);
  [
    { name:'CM Revanth Reddy', handle:'@revanth_anumula', platform:'Twitter', role:'Chief Minister, Telangana', why_follow:'State-level policy, startup fund announcements' },
    { name:'KT Rama Rao', handle:'@KTRTRS', platform:'Twitter', role:'Former IT Minister', why_follow:'Tech ecosystem veteran, startup culture builder' },
    { name:'T-Hub Official', handle:'@THubHyd', platform:'Twitter', role:'India largest incubator', why_follow:'Programs, Google for Startups Hub updates' },
    { name:'Telangana AI Mission', handle:'@ai_telangana', platform:'Twitter', role:'State AI Program', why_follow:'TGDeX, AI4TG, compute infrastructure, AI policy' },
    { name:'RGIA Airport', handle:'@RGIAHyd', platform:'Twitter', role:'Airport Authority', why_follow:'New routes, terminal updates, traffic data' },
    { name:'Payal Jain', handle:'Payal Jain', platform:'LinkedIn', role:'Partner, LoEstro Advisors', why_follow:'Hyderabad Innovation Report author, ecosystem data' },
    { name:'Rathnakar Samavedam', handle:'Rathnakar Samavedam', platform:'LinkedIn', role:'CEO, Hyderabad Angels', why_follow:'Angel investing, VC landscape, funding data' },
    { name:'Sateesh Andra', handle:'Sateesh Andra', platform:'LinkedIn', role:'Founding Partner, Endiya Partners', why_follow:'Deep tech VC, Hyderabad portfolio builder' },
    { name:'Praveen Dorna', handle:'Praveen Dorna', platform:'LinkedIn', role:'Head, Founder Programs, T-Hub', why_follow:'Programs, founder community, ecosystem building' },
    { name:'Pawan Kumar Chandana', handle:'Pawan Kumar Chandana', platform:'LinkedIn', role:'CEO, Skyroot Aerospace', why_follow:'SpaceTech, deep tech inspiration' },
    { name:'TG10x', handle:'TG10x', platform:'LinkedIn', role:'Ecosystem accelerator', why_follow:'Best aggregator of Hyderabad founders and news' },
  ].forEach(p => insertPeople.run(p));

  // ── Practical Tips ──
  const insertTip = db.prepare(`INSERT INTO practical_tips (category, title, content, priority) VALUES (@category, @title, @content, @priority)`);
  [
    { category:'Water', title:'Do NOT drink tap water', content:'Use 20L Bisleri (₹70-80/can), install RO purifier. Water is hard and not potable.', priority:1 },
    { category:'Connectivity', title:'Get Airtel SIM', content:'Connectivity around HITEC City is better with Airtel than other networks.', priority:2 },
    { category:'Transport', title:'Auto bargaining', content:'Outside metro radius, negotiate with autos or use Ola/Uber Auto for fixed prices.', priority:3 },
    { category:'Food', title:'Biryani timing', content:'Go before 1:30 PM at Shadab and Bawarchi. They sell out and quality declines.', priority:4 },
    { category:'Culture', title:'Ramzan in Old City', content:'Single best time for Hyderabad food culture. Visit Old City evenings during Ramzan.', priority:5 },
    { category:'Housing', title:'PG first month', content:'Stay in a PG (₹7-12K/month) for first month while finding a flat. Don\'t commit to a 1-year lease before knowing the city.', priority:6 },
    { category:'Housing', title:'Use NoBroker', content:'Broker fees run 1-2 months rent. NoBroker has solid listings in IT corridor.', priority:7 },
    { category:'Summer', title:'Summer prep (Apr-Jun)', content:'40°C+ is normal. Budget ₹4-8K/month for AC electricity. Sunscreen is not optional.', priority:8 },
    { category:'Language', title:'Basic Telugu phrases', content:'Meeru ela unnaru? (How are you?) | Dhanyavaadalu (Thank you) | Idi enta? (How much?)', priority:9 },
    { category:'Emergency', title:'Emergency numbers', content:'Police: 100 | Ambulance: 108 | Fire: 101 | Cyberabad Police: 040-27852222', priority:10 },
    { category:'Apps', title:'Day 1 apps', content:'Ola/Uber/Rapido, Zomato/Swiggy, NoBroker, HMRL Metro App, PhonePe/GPay, BookMyShow', priority:11 },
    { category:'Driving', title:'ORR is good; Old City is not', content:'IT corridor roads are better than Bangalore. Old City has narrow roads and unpredictable traffic.', priority:12 },
  ].forEach(t => insertTip.run(t));

  // ── Expand Stats ──
  const insertStat2 = db.prepare(`INSERT OR IGNORE INTO stats (key, value, label, source, category) VALUES (@key, @value, @label, @source, @category)`);
  [
    { key:'gsdp_total', value:'₹17.82 Lakh Cr', label:'Telangana GSDP (2025-26)', source:'ThePrint/PTI', category:'economy' },
    { key:'per_capita_income', value:'₹4,18,931/yr', label:'Per Capita Income', source:'Deccan Chronicle', category:'economy' },
    { key:'airport_passengers', value:'31M', label:'Airport Passengers (2025)', source:'RGIA Twitter', category:'infrastructure' },
    { key:'metro_network', value:'69 km + Pink Line', label:'Metro Network', source:'HMRL', category:'infrastructure' },
    { key:'5g_stations', value:'19,563', label:'5G Base Stations', source:'Telecom Talk Jan 2026', category:'infrastructure' },
    { key:'numbeo_qol', value:'176.63', label:'Numbeo QoL Index', source:'Numbeo March 2026', category:'liveability' },
    { key:'world_best_cities', value:'#82 Globally', label:'World Best Cities 2026', source:'Economic Times', category:'liveability' },
    { key:'avg_monthly_salary', value:'₹1,04,371', label:'Avg Monthly Net Salary', source:'Numbeo', category:'talent' },
    { key:'purchasing_power', value:'188.42', label:'Purchasing Power Index', source:'Numbeo March 2026', category:'liveability' },
    { key:'property_price_income', value:'4.19', label:'Property Price to Income', source:'Numbeo', category:'real_estate' },
    { key:'dpiit_startups', value:'6,145', label:'DPIIT Recognized Startups', source:'Startup India SRF 2026', category:'ecosystem' },
    { key:'ecosystem_value', value:'$8.3B', label:'Ecosystem Value (2021-23)', source:'Telangana AI Mission', category:'ecosystem' },
    { key:'data_center_growth', value:'20.12% CAGR', label:'Data Center Growth', source:'W.media 2025', category:'infrastructure' },
    { key:'healthcare_index', value:'65.54', label:'Healthcare Index', source:'Numbeo', category:'liveability' },
    { key:'fiber_rank', value:'#2 in India', label:'Fiber Connectivity Rank', source:'LinkedIn/Chris Nunez', category:'infrastructure' },
  ].forEach(s => insertStat2.run(s));
  // Jobs
  const insertJob = db.prepare(`INSERT INTO jobs (company, title, location, type, salary, equity, link) VALUES (@company, @title, @location, @type, @salary, @equity, @link)`);
  const jobs = [
    { company: 'Skyroot Aerospace', title: 'Senior Avionics Engineer', location: 'On-site (T-Hub 2.0)', type: 'Full-time', salary: '₹35L - ₹50L', equity: 'Yes', link: 'https://skyroot.in/careers' },
    { company: 'Darwinbox', title: 'Product Manager - AI/ML', location: 'Hybrid (Madhapur)', type: 'Full-time', salary: '₹25L - ₹40L', equity: 'Yes', link: 'https://darwinbox.com/careers' },
    { company: 'Zenoti', title: 'Staff Frontend Engineer', location: 'Remote / Gachibowli', type: 'Full-time', salary: '₹40L - ₹65L', equity: 'Yes', link: 'https://zenoti.com/careers' },
    { company: 'Credgenics', title: 'Data Scientist', location: 'On-site (Hitech City)', type: 'Full-time', salary: '₹20L - ₹35L', equity: 'No', link: 'https://credgenics.com/careers' },
    { company: 'Marut Drones', title: 'UAV Hardware Technician', location: 'On-site (Raidurg)', type: 'Full-time', salary: '₹12L - ₹18L', equity: 'No', link: 'https://marutdrones.com/careers' }
  ];
  for (const j of jobs) insertJob.run(j);

  console.log('Seed data inserted successfully. All 34 guide sections loaded (with Jobs added).');
}
module.exports = { initDb, getDb };
