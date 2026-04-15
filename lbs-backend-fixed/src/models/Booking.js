const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  venueId: { type: String, required: true },
  venueName: { type: String, required: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  date: { type: String, required: true },          // "YYYY-MM-DD" string kept for API compat
  timeSlotId: { type: String, required: true },
  timeSlotLabel: { type: String, default: '' },
  purpose: { type: String, required: true },
  notes: { type: String, default: '' },
  equipmentNeeded: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model('Booking', bookingSchema);
