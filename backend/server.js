/**
 * SafeVoice Backend API (Hybrid: MariaDB + JSON Fallback)
 * Capable of receiving reports from 100+ devices via LAN or Internet
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const mariadb = require('mariadb');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'safevoice-super-secret-key';
const JSON_DB_FILE = path.join(__dirname, 'reports.json');

// --- 1. SETUP STORAGE ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors()); // Allow all devices
app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.use('/admin', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

// 5 VALID ADMIN ACCOUNTS
const ADMIN_ACCOUNTS = [
    { email: 'admin@safevoice.org', password: '3' },
    { email: 'manager@safevoice.org', password: 'safevoice2025' },
    { email: 'supervisor@safevoice.org', password: 'super123' },
    { email: 'coord@safevoice.org', password: 'coord456' },
    { email: 'director@safevoice.org', password: 'director789' }
];

// --- 2. HYBRID DATABASE LAYER ---

let dbMode = 'json'; // Default to JSON, try upgrade to SQL
let pool = null;

async function initDB() {
    try {
        pool = mariadb.createPool({
            host: process.env.DB_HOST || 'localhost', 
            user: process.env.DB_USER || 'root', 
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'safevoice_db',
            connectionLimit: 50,
            connectTimeout: 5000 // 5s timeout
        });
        const conn = await pool.getConnection();
        await conn.query("SELECT 1"); // Test connection
        conn.release();
        dbMode = 'sql';
        console.log('✅ DATABASE: Connected to MariaDB (SQL Mode)');
    } catch (e) {
        console.log('⚠️ DATABASE: MariaDB unreachable. Switching to File Storage (JSON Mode).');
        dbMode = 'json';
        if (!fs.existsSync(JSON_DB_FILE)) {
            fs.writeFileSync(JSON_DB_FILE, JSON.stringify([]));
        }
    }
}
initDB();

// --- REPOSITORY PATTERN (Abstracts SQL vs JSON) ---

const DB = {
    async saveReport(report) {
        if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                const query = `INSERT INTO reports (id, tracking_code, type, location, description, anonymous_user_id, status, created_at, attachments, status_history, case_updates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                await conn.query(query, [
                    report.id, report.trackingCode, report.type, report.location, report.description, 
                    report.anonymousUserId, report.status, new Date(report.createdAt), 
                    JSON.stringify(report.attachments), JSON.stringify(report.statusHistory), JSON.stringify(report.caseUpdates)
                ]);
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            reports.push(report);
            fs.writeFileSync(JSON_DB_FILE, JSON.stringify(reports, null, 2));
        }
    },

    async getReportByCode(code) {
        if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                const rows = await conn.query("SELECT * FROM reports WHERE tracking_code = ?", [code]);
                return rows.length > 0 ? formatSQLRow(rows[0]) : null;
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            return reports.find(r => r.trackingCode === code) || null;
        }
    },

    async getAllReports() {
        if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                const rows = await conn.query("SELECT * FROM reports ORDER BY created_at DESC");
                return rows.map(formatSQLRow);
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    async getReportById(id) {
         if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                const rows = await conn.query("SELECT * FROM reports WHERE id = ?", [id]);
                return rows.length > 0 ? formatSQLRow(rows[0]) : null;
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            return reports.find(r => r.id === id) || null;
        }
    },

    async updateStatus(id, status, historyItem) {
        if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                // Fetch current history first to append
                const rows = await conn.query("SELECT status_history FROM reports WHERE id = ?", [id]);
                let history = [];
                if(rows.length > 0) history = typeof rows[0].status_history === 'string' ? JSON.parse(rows[0].status_history) : rows[0].status_history;
                
                history.push(historyItem);
                await conn.query("UPDATE reports SET status = ?, status_history = ? WHERE id = ?", [status, JSON.stringify(history), id]);
                return history;
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            const idx = reports.findIndex(r => r.id === id);
            if (idx !== -1) {
                reports[idx].status = status;
                reports[idx].statusHistory.push(historyItem);
                fs.writeFileSync(JSON_DB_FILE, JSON.stringify(reports, null, 2));
                return reports[idx].statusHistory;
            }
            throw new Error('Not found');
        }
    },

    async addCaseUpdate(id, updateItem) {
        if (dbMode === 'sql') {
            const conn = await pool.getConnection();
            try {
                const rows = await conn.query("SELECT case_updates FROM reports WHERE id = ?", [id]);
                let updates = [];
                if(rows.length > 0) updates = typeof rows[0].case_updates === 'string' ? JSON.parse(rows[0].case_updates) : rows[0].case_updates;
                
                updates.push(updateItem);
                await conn.query("UPDATE reports SET case_updates = ? WHERE id = ?", [JSON.stringify(updates), id]);
            } finally { conn.release(); }
        } else {
            const reports = JSON.parse(fs.readFileSync(JSON_DB_FILE));
            const idx = reports.findIndex(r => r.id === id);
            if (idx !== -1) {
                if (!reports[idx].caseUpdates) reports[idx].caseUpdates = [];
                reports[idx].caseUpdates.push(updateItem);
                fs.writeFileSync(JSON_DB_FILE, JSON.stringify(reports, null, 2));
            } else {
                throw new Error('Not found');
            }
        }
    }
};

// Helper: Normalize SQL Row to Object
const formatSQLRow = (row) => ({
  id: row.id,
  trackingCode: row.tracking_code,
  type: row.type,
  location: row.location,
  description: row.description,
  anonymousUserId: row.anonymous_user_id,
  status: row.status,
  createdAt: row.created_at,
  attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || []),
  statusHistory: typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || []),
  caseUpdates: typeof row.case_updates === 'string' ? JSON.parse(row.case_updates) : (row.case_updates || [])
});

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- DATA CONSTANTS ---
const EDUCATION_MODULES = [
  { id: '1', title: 'What is GBV?', description: 'Understanding the basics.', imageUrl: 'https://picsum.photos/400/200?random=1', content: `Gender-Based Violence (GBV) refers to harmful acts directed at an individual based on their gender.` },
  { id: '2', title: 'Warning Signs', description: 'Early signs of abuse.', imageUrl: 'https://picsum.photos/400/200?random=2', content: `Abuse isn't always physical. Look for isolation, control, and jealousy.` },
  { id: '3', title: 'Legal Rights', description: 'Protection under law.', imageUrl: 'https://picsum.photos/400/200?random=3', content: `You have the right to free medical care and police protection.` }
];
const HOTLINES = [
  { id: '1', name: 'National GBV Helpline', number: '1195', category: 'Emergency' },
  { id: '2', name: 'Police Emergency', number: '999', category: 'Emergency' },
];
const SUPPORT_CENTRES = [
  { id: '1', name: 'GVRC - Nairobi Women\'s Hospital', address: 'Hurlingham, Nairobi', type: 'Medical', lat: -1.2921, lng: 36.8219 },
  { id: '2', name: 'Kenyatta National Hospital', address: 'Upper Hill', type: 'Medical', lat: -1.3032, lng: 36.8070 },
];

// --- API ROUTES ---

// HEALTH CHECK (For Frontend Connectivity Testing)
app.get('/', (req, res) => {
  res.json({ status: 'Online', server: 'SafeVoice-Central', time: new Date() });
});

app.get('/api/education', (req, res) => res.json(EDUCATION_MODULES));
app.get('/api/hotlines', (req, res) => res.json(HOTLINES));
app.get('/api/support-centres', (req, res) => res.json(SUPPORT_CENTRES));

app.post('/api/gbv-report', upload.array('attachments'), async (req, res) => {
  try {
      const { type, location, description, anonymousUserId, incidentDate } = req.body;
      
      const id = uuidv4();
      const trackingCode = `SV-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      const status = 'Received';
      const createdAt = new Date().toISOString();
      
      // Merge Incident Date into description for admin visibility
      let finalDesc = description;
      if (incidentDate) finalDesc = `[INCIDENT TIME: ${new Date(incidentDate).toLocaleString()}]\n\n${description}`;

      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const attachments = req.files ? req.files.map(f => ({
        name: f.originalname,
        type: f.mimetype.split('/')[0],
        url: `${serverBaseUrl}/uploads/${f.filename}` 
      })) : [];

      const report = {
        id, trackingCode, type, location, description: finalDesc, anonymousUserId: anonymousUserId || uuidv4(),
        status, createdAt, attachments, 
        statusHistory: [{ status: 'Received', timestamp: createdAt }],
        caseUpdates: []
      };

      await DB.saveReport(report);
      console.log(`[New Report] ${trackingCode} from ${req.ip}`);
      res.status(201).json({ message: 'Submitted', trackingCode });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/gbv-report/:trackingCode', async (req, res) => {
    try {
        const report = await DB.getReportByCode(req.params.trackingCode);
        if (!report) return res.status(404).json({ error: 'Not found' });
        res.json(report);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check against list of 5 valid accounts
    const validUser = ADMIN_ACCOUNTS.find(u => u.email === email && u.password === password);
    
    if (validUser) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '12h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/admin/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await DB.getAllReports();
        res.json(reports);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/admin/reports/:id', authenticateToken, async (req, res) => {
    try {
        const report = await DB.getReportById(req.params.id);
        if(!report) return res.status(404).json({error:'Not found'});
        res.json(report);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.patch('/api/admin/reports/:id', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const history = await DB.updateStatus(req.params.id, status, { status, timestamp: new Date().toISOString() });
        res.json({ id: req.params.id, status, statusHistory: history });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/admin/reports/:id/message', authenticateToken, async (req, res) => {
    try {
        const updateItem = { id: uuidv4(), content: req.body.content, timestamp: new Date().toISOString(), author: 'Case Worker' };
        await DB.addCaseUpdate(req.params.id, updateItem);
        res.json(updateItem);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n===================================================`);
    console.log(`✅ LOCAL SERVER ONLINE: http://0.0.0.0:${PORT}`);
    console.log(`---------------------------------------------------`);
    console.log(`🌍 TO ENABLE INTERNET ACCESS (ANY DEVICE):`);
    console.log(`   1. Install ngrok (https://ngrok.com)`);
    console.log(`   2. Run: 'ngrok http ${PORT}'`);
    console.log(`   3. Copy the 'https://....ngrok-free.app' URL`);
    console.log(`   4. Paste into App > Admin Login > Settings`);
    console.log(`===================================================\n`);
});