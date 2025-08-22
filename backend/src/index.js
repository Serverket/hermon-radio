import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL || '';
const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());

// Postgres pool (optional). If DATABASE_URL is missing, use in-memory state.
let pool = null;
if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

const app = express();
app.use(express.json());
app.use(cors({ origin: (origin, cb) => {
  if (!origin) return cb(null, true);
  if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) return cb(null, true);
  return cb(new Error('Not allowed by CORS'));
}, credentials: false }));

// Basic auth middleware for admin endpoints
function requireAdmin(req, res, next) {
  if (!ADMIN_USER || !ADMIN_PASS) return res.status(500).json({ error: 'Admin credentials not set' });
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return res.status(401).set('WWW-Authenticate', 'Basic').end();
  const [, b64] = auth.split(' ');
  const [u, p] = Buffer.from(b64, 'base64').toString('utf8').split(':');
  if (u === ADMIN_USER && p === ADMIN_PASS) return next();
  return res.status(403).json({ error: 'Forbidden' });
}

// Overlay state in-memory fallback
let overlay = {
  visible: false,
  type: 'image', // image | youtube | text
  url: '',       // http URL or youtube link
  position: 'inline', // inline | fullscreen
  fit: 'contain', // contain | cover
  source: 'url',  // url only for server-side state
  title: '',
  text: '',
  bgColor: '#2563eb',
  textColor: '#ffffff',
  updated_at: new Date().toISOString(),
};

async function initDb() {
  if (!pool) return; // in-memory mode
  await pool.query(`CREATE TABLE IF NOT EXISTS overlay_state (
    id INT PRIMARY KEY,
    visible BOOLEAN NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    position TEXT NOT NULL,
    fit TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    bg_color TEXT NOT NULL,
    text_color TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`);
  // Migration safety: ensure text column exists for existing deployments
  await pool.query("ALTER TABLE overlay_state ADD COLUMN IF NOT EXISTS text TEXT");
  await pool.query("ALTER TABLE overlay_state ADD COLUMN IF NOT EXISTS bg_color TEXT");
  await pool.query("ALTER TABLE overlay_state ADD COLUMN IF NOT EXISTS text_color TEXT");
  const { rowCount } = await pool.query('SELECT 1 FROM overlay_state WHERE id=1');
  if (rowCount === 0) {
    await pool.query('INSERT INTO overlay_state (id, visible, type, url, position, fit, source, title, text, bg_color, text_color, updated_at) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [overlay.visible, overlay.type, overlay.url, overlay.position, overlay.fit, overlay.source, overlay.title, overlay.text, overlay.bgColor, overlay.textColor, overlay.updated_at]);
  } else {
    const { rows } = await pool.query('SELECT * FROM overlay_state WHERE id=1');
    const r = rows[0];
    overlay = {
      visible: r.visible,
      type: r.type,
      url: r.url,
      position: r.position,
      fit: r.fit,
      source: r.source,
      title: r.title,
      text: r.text || '',
      bgColor: r.bg_color || '#2563eb',
      textColor: r.text_color || '#ffffff',
      updated_at: r.updated_at.toISOString(),
    };
    // Coerce unsupported types to a supported one
    const allowedTypes = ['image', 'youtube', 'text'];
    if (!allowedTypes.includes(overlay.type)) {
      overlay.type = 'image';
    }
  }
}

async function saveOverlay(newState) {
  overlay = { ...overlay, ...newState, updated_at: new Date().toISOString() };
  if (pool) {
    await pool.query('UPDATE overlay_state SET visible=$1, type=$2, url=$3, position=$4, fit=$5, source=$6, title=$7, text=$8, bg_color=$9, text_color=$10, updated_at=$11 WHERE id=1',
      [overlay.visible, overlay.type, overlay.url, overlay.position, overlay.fit, overlay.source, overlay.title, overlay.text, overlay.bgColor, overlay.textColor, overlay.updated_at]);
  }
  broadcast(overlay);
}

// SSE clients
const clients = new Set();

function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { /* drop on error */ }
  }
}

app.get('/overlay', async (req, res) => {
  res.json(overlay);
});

app.put('/overlay', requireAdmin, async (req, res) => {
  const b = req.body || {};
  // validate
  const allowedTypes = ['image', 'youtube', 'text'];
  const allowedPositions = ['inline', 'fullscreen'];
  const allowedFit = ['contain', 'cover'];
  const next = {
    visible: Boolean(b.visible),
    type: allowedTypes.includes(b.type) ? b.type : overlay.type,
    url: typeof b.url === 'string' ? b.url : overlay.url,
    position: allowedPositions.includes(b.position) ? b.position : overlay.position,
    fit: allowedFit.includes(b.fit) ? b.fit : overlay.fit,
    source: 'url',
    title: typeof b.title === 'string' ? b.title : overlay.title,
    text: typeof b.text === 'string' ? b.text : overlay.text,
    bgColor: typeof b.bgColor === 'string' ? b.bgColor : overlay.bgColor,
    textColor: typeof b.textColor === 'string' ? b.textColor : overlay.textColor,
  };
  await saveOverlay(next);
  res.json(overlay);
});

app.get('/overlay/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
  });
  res.write(`data: ${JSON.stringify(overlay)}\n\n`);
  clients.add(res);
  req.on('close', () => {
    clients.delete(res);
  });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend listening on :${PORT}`);
  });
}).catch((e) => {
  console.error('Failed to init DB', e);
  process.exit(1);
});
