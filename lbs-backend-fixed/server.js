require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./src/db/mongoose');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080', credentials: true }));
app.use(express.json());

app.use('/api/auth',                require('./src/routes/auth'));
app.use('/api/users',               require('./src/routes/users'));
app.use('/api/venues',              require('./src/routes/venues'));
app.use('/api/bookings',            require('./src/routes/bookings'));
app.use('/api/notifications',       require('./src/routes/notifications'));
app.use('/api/equipment-requests',  require('./src/routes/equipmentRequests'));
app.use('/api/compromise-requests', require('./src/routes/compromiseRequests'));
app.use('/api/timeslots',           require('./src/routes/timeSlots'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'MongoDB', time: new Date() }));

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LBS Backend running on http://localhost:${PORT}`);
  console.log(`✅ Database: MongoDB (${process.env.MONGO_URI})\n`);
});
