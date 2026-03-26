
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // This works in AI Studio Build environment
  projectId: firebaseConfig.projectId,
}, 'admin-app');

const db = admin.firestore(admin.app('admin-app'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Storage paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  try {
    // Verify Firebase ID Token
    const decodedToken = await admin.auth(admin.app('admin-app')).verifyIdToken(token);
    req.user = decodedToken;
    
    // Check if user is admin (either by email or by custom claim/role in DB)
    const isAdminEmail = decodedToken.email === "divineakenak2@gmail.com";
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const isDbAdmin = userDoc.exists && userDoc.data()?.role === 'admin';
    
    if (isAdminEmail || isDbAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
  } catch (err) {
    console.error("Auth Error:", err);
    res.sendStatus(403);
  }
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', server: 'Juasafety yako', time: new Date() });
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

      const reportId = uuidv4();
      const report = {
        id: reportId,
        trackingCode, type, location, description, 
        anonymousUserId: anonymousUserId || 'anon',
        phoneNumber,
        status, createdAt, attachments, 
        statusHistory: [{ status, timestamp: createdAt }],
        caseUpdates: []
      };

      await db.collection('reports').doc(reportId).set(report);

      res.status(201).json({ message: 'Submitted', trackingCode });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/gbv-report/:trackingCode', async (req, res) => {
    try {
        const snapshot = await db.collection('reports').where('trackingCode', '==', req.params.trackingCode).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ error: 'Not found' });
        res.json(snapshot.docs[0].data());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/reports', authenticateToken, async (req, res) => {
    try {
        const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
        const reports = snapshot.docs.map(doc => doc.data());
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.patch('/api/admin/reports/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status, note } = req.body;
        const docRef = db.collection('reports').doc(req.params.id);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            const statusHistory = data?.statusHistory || [];
            statusHistory.push({ status, timestamp: new Date().toISOString(), note });
            
            await docRef.update({
                status,
                statusHistory
            });
            res.json({ ...data, status, statusHistory });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/reports/:id/updates', authenticateToken, async (req, res) => {
    try {
        const { content, author } = req.body;
        const docRef = db.collection('reports').doc(req.params.id);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            const caseUpdates = data?.caseUpdates || [];
            const updateItem = { 
                id: uuidv4(), 
                content, 
                author: author || 'Case Worker',
                timestamp: new Date().toISOString()
            };
            caseUpdates.push(updateItem);
            await docRef.update({ caseUpdates });
            res.json(updateItem);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- CASEWORKERS API ---

app.get('/api/admin/caseworkers', authenticateToken, async (req, res) => {
    try {
        const snapshot = await db.collection('caseworkers').get();
        const workers = snapshot.docs.map(doc => doc.data());
        res.json(workers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/caseworkers', authenticateToken, async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const id = uuidv4();
        const newWorker = {
            id,
            name,
            phone,
            email,
            createdAt: new Date().toISOString()
        };
        await db.collection('caseworkers').doc(id).set(newWorker);
        res.status(201).json(newWorker);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/caseworkers/:id', authenticateToken, async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const docRef = db.collection('caseworkers').doc(req.params.id);
        const doc = await docRef.get();
        
        if (!doc.exists) return res.status(404).json({ error: 'Worker not found' });
        
        const updatedWorker = { ...doc.data(), name, phone, email };
        await docRef.set(updatedWorker);
        res.json(updatedWorker);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/caseworkers/:id', authenticateToken, async (req, res) => {
    try {
        await db.collection('caseworkers').doc(req.params.id).delete();
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
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
