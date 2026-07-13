require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Razorpay = require('razorpay');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads', 'apks');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'change_me'
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'indapp-store-local-backend' });
});

app.post('/api/register-developer', async (req, res) => {
  try {
    const { name, email, account_type, status = 'registered' } = req.body;
    if (!name || !email || !account_type) {
      return res.status(400).json({ error: 'name, email, and account_type are required.' });
    }

    const existingDeveloper = await getQuery(
      'SELECT * FROM developers WHERE email = ? ORDER BY id DESC LIMIT 1',
      [email]
    );

    if (existingDeveloper) {
      await runQuery(
        'UPDATE developers SET name = ?, account_type = ?, status = ? WHERE id = ?',
        [name, account_type, status, existingDeveloper.id]
      );

      return res.json({
        message: 'Developer profile updated successfully.',
        developer: { id: existingDeveloper.id, name, email, account_type, status }
      });
    }

    const result = await runQuery(
      'INSERT INTO developers (name, email, account_type, status) VALUES (?, ?, ?, ?)',
      [name, email, account_type, status]
    );

    res.status(201).json({
      message: 'Developer registered successfully.',
      developer: { id: result.lastID, name, email, account_type, status }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/record', async (req, res) => {
  try {
    const { developer_id, transaction_id, amount, status = 'completed' } = req.body;

    if (!developer_id || !transaction_id || !amount) {
      return res.status(400).json({ error: 'developer_id, transaction_id, and amount are required.' });
    }

    const result = await runQuery(
      'INSERT INTO payments (developer_id, transaction_id, amount, status) VALUES (?, ?, ?, ?)',
      [developer_id, transaction_id, amount, status]
    );

    await runQuery('UPDATE developers SET status = ? WHERE id = ?', ['paid', developer_id]);

    res.status(201).json({
      message: 'Payment recorded successfully.',
      payment: { id: result.lastID, developer_id, transaction_id, amount, status }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-app', upload.single('apk'), async (req, res) => {
  try {
    const { developer_id, title, category, description, is_suggested = 0 } = req.body;

    if (!developer_id || !title || !category || !description) {
      return res.status(400).json({ error: 'developer_id, title, category, and description are required.' });
    }

    const filename = req.file ? req.file.filename : null;
    const result = await runQuery(
      `INSERT INTO apps (developer_id, title, category, description, apk_filename, status, is_suggested)
       VALUES (?, ?, ?, ?, ?, 'pending_verification', ?)`,
      [developer_id, title, category, description, filename, Number(is_suggested) ? 1 : 0]
    );

    res.status(201).json({
      message: 'App uploaded successfully and sent for verification.',
      app: {
        id: result.lastID,
        developer_id: Number(developer_id),
        title,
        category,
        description,
        apk_filename: filename,
        status: 'pending_verification',
        is_suggested: Number(is_suggested) ? 1 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/apps/pending', async (_req, res) => {
  try {
    const rows = await allQuery(
      `SELECT apps.*, developers.name AS developer_name, developers.email AS developer_email
       FROM apps
       LEFT JOIN developers ON developers.id = apps.developer_id
       WHERE apps.status = 'pending_verification'
       ORDER BY apps.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apps/verify', async (req, res) => {
  try {
    const { appId } = req.body;
    if (!appId) {
      return res.status(400).json({ error: 'appId is required.' });
    }

    await runQuery('UPDATE apps SET status = ? WHERE id = ?', ['approved', appId]);
    res.json({ message: 'App approved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/apps/live', async (_req, res) => {
  try {
    const rows = await allQuery(
      `SELECT apps.*, developers.name AS developer_name
       FROM apps
       LEFT JOIN developers ON developers.id = apps.developer_id
       WHERE apps.status = 'approved'
       ORDER BY apps.is_suggested DESC, apps.created_at DESC`
    );
    res.json(rows.map((row) => ({
      ...row,
      download_url: row.apk_filename ? `/uploads/apks/${row.apk_filename}` : ''
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'change_me';

    if (!signature) {
      return res.status(400).json({ error: 'Missing Razorpay signature.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const payload = req.body;
    const paymentEntity = payload?.payload?.payment?.entity || {};
    const notes = paymentEntity.notes || {};
    const developerId = notes.developer_id || null;
    const transactionId = paymentEntity.id || `txn_${Date.now()}`;
    const amount = paymentEntity.amount || 0;
    const status = paymentEntity.status || 'completed';

    await runQuery(
      'INSERT INTO payments (developer_id, transaction_id, amount, status) VALUES (?, ?, ?, ?)',
      [developerId, transactionId, amount, status]
    );

    if (developerId) {
      await runQuery('UPDATE developers SET status = ? WHERE id = ?', ['paid', developerId]);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`indapp backend running on http://localhost:${PORT}`);
});