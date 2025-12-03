/**
 * SafeVoice Backend API (MariaDB Version)
 * 
 * Instructions:
 * 1. Install dependencies: npm install
 * 2. Setup MariaDB and run the SQL from schema.sql
 * 3. Configure .env with DB credentials
 * 4. Run: npm start
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const mariadb = require('mariadb');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'safevoice-super-secret-key';

// --- MariaDB Connection Pool ---
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'safevoice_db',
  connectionLimit: 5
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Admin Dashboard (Static Files)
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const ADMIN_CREDENTIALS = {
  email: 'admin@safevoice.org',
  password: 'admin123' 
};

// --- Middleware: Authenticate Admin ---
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

// --- Helper: Format DB Row to API Object ---
const formatReport = (row) => ({
  id: row.id,
  trackingCode: row.tracking_code,
  type: row.type,
  location: row.location,
  description: row.description,
  anonymousUserId: row.anonymous_user_id,
  status: row.status,
  // Parse JSON columns back to objects
  createdAt: row.created_at,
  attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments,
  statusHistory: typeof row.status_history === 'string' ? JSON.parse(row.status_history) : row.status_history,
});

// --- Routes ---

// 1. Submit Report (Anonymous)
app.post('/api/gbv-report', upload.array('attachments'), async (req, res) => {
  const { type, location, description, anonymousUserId } = req.body;
  
  if (!type || !location || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const trackingCode = `SV-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
  const userId = anonymousUserId || uuidv4();
  const status = 'Received';
  const createdAt = new Date();
  
  const attachments = req.files ? req.files.map(f => ({
    name: f.originalname,
    type: f.mimetype.split('/')[0],
    url: `/uploads/${f.filename}` 
  })) : [];

  const statusHistory = [{ status: 'Received', timestamp: createdAt.toISOString() }];

  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      INSERT INTO reports 
      (id, tracking_code, type, location, description, anonymous_user_id, status, created_at, attachments, status_history) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await conn.query(query, [
      id, 
      trackingCode, 
      type, 
      location, 
      description, 
      userId, 
      status, 
      createdAt, 
      JSON.stringify(attachments), 
      JSON.stringify(statusHistory)
    ]);

    console.log(`[MariaDB] New Report: ${trackingCode}`);
    res.status(201).json({ message: 'Report submitted', trackingCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// 2. Track Report (Public)
app.get('/api/gbv-report/:trackingCode', async (req, res) => {
  const { trackingCode } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM reports WHERE tracking_code = ?", [trackingCode]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    
    const report = formatReport(rows[0]);
    
    // Return privacy-safe data
    res.json({
      trackingCode: report.trackingCode,
      status: report.status,
      statusHistory: report.statusHistory,
      createdAt: report.createdAt,
      description: report.description 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// 3. Admin Login (Specific Route Requested)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '12h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 4. Admin: Get All Reports
app.get('/api/admin/reports', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM reports ORDER BY created_at DESC");
    const reports = rows.map(formatReport);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// 5. Admin: Get Single Report
app.get('/api/admin/reports/:id', authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM reports WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(formatReport(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

// 6. Admin: Update Status
app.patch('/api/admin/reports/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Get current history first
    const rows = await conn.query("SELECT status_history FROM reports WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    
    let history = typeof rows[0].status_history === 'string' ? JSON.parse(rows[0].status_history) : rows[0].status_history;
    if (!history) history = [];
    
    // Add new status
    history.push({ status, timestamp: new Date().toISOString() });

    // Update DB
    await conn.query(
      "UPDATE reports SET status = ?, status_history = ? WHERE id = ?", 
      [status, JSON.stringify(history), id]
    );

    res.json({ id, status, statusHistory: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`SafeVoice Backend running on http://localhost:${PORT}`);
  console.log(`Admin Dashboard available at http://localhost:${PORT}/admin/login.html`);
});