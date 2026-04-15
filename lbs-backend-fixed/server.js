require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',                require('./src/routes/auth'));
app.use('/api/users',               require('./src/routes/users'));
app.use('/api/venues',              require('./src/routes/venues'));
app.use('/api/bookings',            require('./src/routes/bookings'));
app.use('/api/notifications',       require('./src/routes/notifications'));
app.use('/api/equipment-requests',  require('./src/routes/equipmentRequests'));
app.use('/api/compromise-requests', require('./src/routes/compromiseRequests'));
app.use('/api/timeslots',           require('./src/routes/timeSlots'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LBS Backend running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/venues`);
  console.log(`   GET    /api/bookings`);
  console.log(`   GET    /api/bookings/check-conflict`);
  console.log(`   GET    /api/notifications`);
  console.log(`   GET    /api/equipment-requests`);
  console.log(`   GET    /api/compromise-requests`);
  console.log(`   GET    /api/timeslots`);
  console.log(`\n✅ Database: MongoDB\n`);
});
