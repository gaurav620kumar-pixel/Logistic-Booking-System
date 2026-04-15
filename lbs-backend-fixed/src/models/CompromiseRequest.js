const mongoose = require('mongoose');

const compromiseRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromFacultyId: { type: String, required: true },
  fromFacultyName: { type: String, required: true },
  toFacultyId: { type: String, required: true },
  toFacultyName: { type: String, required: true },
  bookingId: { type: String, default: '' },
  venueName: { type: String, default: '' },
  date: { type: String, default: '' },
  timeSlot: { type: String, default: '' },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model('CompromiseRequest', compromiseRequestSchema);
