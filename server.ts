
import express from "express";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'safevoice-super-secret-key';

// Storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const CASEWORKERS_FILE = path.join(DATA_DIR, 'caseworkers.json');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure directories and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, JSON.stringify([]));
if (!fs.existsSync(CASEWORKERS_FILE)) fs.writeFileSync(CASEWORKERS_FILE, JSON.stringify([]));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

const ADMIN_ACCOUNTS = [
    { email: 'admin@safevoice.org', password: 'password123' },
    { email: 'manager@safevoice.org', password: 'password123' }
];

const DB = {
    getReports() { return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8')); },
    saveReports(reports: any[]) { fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2)); },
    getCaseworkers() { return JSON.parse(fs.readFileSync(CASEWORKERS_FILE, 'utf-8')); },
    saveCaseworkers(workers: any[]) { fs.writeFileSync(CASEWORKERS_FILE, JSON.stringify(workers, null, 2)); }
};

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', server: 'SafeVoice-Central', time: new Date() });
});

// Submit GBV Report
app.post('/api/gbv-report', upload.array('attachments'), async (req, res) => {
  try {
      const { type, location, description, anonymousUserId, phoneNumber } = req.body;
      const trackingCode = `SV-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      const status = 'RECEIVED';
      const createdAt = new Date().toISOString();
      
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const attachments = (req.files as any[])?.map(f => {
        let type: 'image' | 'video' | 'audio' = 'image';
        if (f.mimetype.startsWith('video/')) type = 'video';
        else if (f.mimetype.startsWith('audio/')) type = 'audio';
        
        return {
          id: uuidv4(),
          name: f.originalname,
          type,
          url: `${serverBaseUrl}/uploads/${f.filename}` 
        };
      }) || [];

      const report = {
        id: uuidv4(),
        trackingCode, type, location, description, 
        anonymousUserId: anonymousUserId || 'anon',
        phoneNumber,
        status, createdAt, attachments, 
        statusHistory: [{ status, timestamp: createdAt }],
        caseUpdates: []
      };

      const reports = DB.getReports();
      reports.push(report);
      DB.saveReports(reports);

      res.status(201).json({ message: 'Submitted', trackingCode });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/gbv-report/:trackingCode', async (req, res) => {
    const reports = DB.getReports();
    const report = reports.find((r: any) => r.trackingCode === req.params.trackingCode);
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
});

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const validUser = ADMIN_ACCOUNTS.find(u => u.email === email && u.password === password);
    if (validUser) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/admin/reports', authenticateToken, async (req, res) => {
    const reports = DB.getReports();
    res.json(reports.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.patch('/api/admin/reports/:id/status', authenticateToken, async (req, res) => {
    const { status, note } = req.body;
    const reports = DB.getReports();
    const idx = reports.findIndex((r: any) => r.id === req.params.id);
    if (idx !== -1) {
        reports[idx].status = status;
        reports[idx].statusHistory.push({ status, timestamp: new Date().toISOString(), note });
        DB.saveReports(reports);
        res.json(reports[idx]);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.post('/api/admin/reports/:id/updates', authenticateToken, async (req, res) => {
    const { content, author } = req.body;
    const reports = DB.getReports();
    const idx = reports.findIndex((r: any) => r.id === req.params.id);
    if (idx !== -1) {
        const updateItem = { 
            id: uuidv4(), 
            content, 
            author: author || 'Case Worker',
            timestamp: new Date().toISOString()
        };
        if (!reports[idx].caseUpdates) reports[idx].caseUpdates = [];
        reports[idx].caseUpdates.push(updateItem);
        DB.saveReports(reports);
        res.json(updateItem);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// --- CASEWORKERS API ---

app.get('/api/admin/caseworkers', authenticateToken, (req, res) => {
    const workers = DB.getCaseworkers();
    res.json(workers);
});

app.post('/api/admin/caseworkers', authenticateToken, (req, res) => {
    const { name, phone, email } = req.body;
    const workers = DB.getCaseworkers();
    const newWorker = {
        id: uuidv4(),
        name,
        phone,
        email,
        createdAt: new Date().toISOString()
    };
    workers.push(newWorker);
    DB.saveCaseworkers(workers);
    res.status(201).json(newWorker);
});

app.put('/api/admin/caseworkers/:id', authenticateToken, (req, res) => {
    const { name, phone, email } = req.body;
    const workers = DB.getCaseworkers();
    const index = workers.findIndex((w: any) => w.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Worker not found' });
    
    workers[index] = { ...workers[index], name, phone, email };
    DB.saveCaseworkers(workers);
    res.json(workers[index]);
});

app.delete('/api/admin/caseworkers/:id', authenticateToken, (req, res) => {
    const workers = DB.getCaseworkers();
    const filtered = workers.filter((w: any) => w.id !== req.params.id);
    DB.saveCaseworkers(filtered);
    res.sendStatus(204);
});

// VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unified server running on http://localhost:${PORT}`);
  });
}

startServer();
