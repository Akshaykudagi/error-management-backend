const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const { sendErrorEmail } = require('./emailService');

const app = express();
const port = 5000;

// 🛡 Fix CORS completely
app.use(express.json());


const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // 👈 Ensure OPTIONS is handled






// DB connection & routes below...


// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ErrorLog'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ✅ Save error to DB + send email
app.post('/api/log-error', (req, res) => {
  const { type, message, page, timestamp } = req.body;

  console.log('📦 Received error from client:', req.body); // 👈 Log received data

const sql = 'INSERT INTO error_logs (type, message, page, created_at) VALUES (?, ?, ?, ?)';
  db.query(sql, [type, message, page, new Date(timestamp)], (err, result) => {
    if (err) {
      console.error('❌ MySQL Insert Error:', err); // 👈 Log DB error
      return res.status(500).json({ success: false, message: 'Database insert failed' });
    }

    console.log('✅ Error stored in DB, ID:', result.insertId);
    sendErrorEmail({ type, message, page, timestamp });
    res.json({ success: true });
  });
});
// ✅ Fetch all error logs
// Get all error logs
app.get('/api/errors', (req, res) => {
  const sql = 'SELECT * FROM error_logs ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch errors from DB:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch errors' });
    }
    res.json({ success: true, errors: results });
  });
});


process.on('uncaughtException', err => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('💥 Unhandled Rejection:', err);
});


app.listen(port, () => {
  console.log(`🚀 API running on http://localhost:${port}`);
});
