const app = require('../server/src/index.js');
const { initDb } = require('../server/src/db/database.js');

let isDBReady = false;

module.exports = async (req, res) => {
    if (!isDBReady) {
        // Vercel serverless functions are read-only except for /tmp
        process.env.DB_PATH = '/tmp/uphyd.db';
        await initDb();
        isDBReady = true;
    }
    return app(req, res);
};
