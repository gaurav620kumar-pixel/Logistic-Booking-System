const mongoose = require('mongoose');

const equipmentRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  venueId: { type: String, required: true },
  venueName: { type: String, required: true },
  staffId: { type: String, default: '' },
  items: { type: [String], required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'ready', 'completed'],
    default: 'pending',
  },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model('EquipmentRequest', equipmentRequestSchema);
