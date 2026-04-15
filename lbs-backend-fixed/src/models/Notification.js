const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['booking', 'request', 'equipment', 'cancellation', 'timetable'],
    default: 'booking',
  },
  read: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model('Notification', notificationSchema);
