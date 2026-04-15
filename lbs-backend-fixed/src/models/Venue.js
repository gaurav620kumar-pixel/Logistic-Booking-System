const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['classroom', 'lab', 'hall'], default: 'classroom' },
  capacity: { type: Number, required: true },
  building: { type: String, required: true },
  floor: { type: Number, default: 0 },
  equipment: { type: [String], default: [] },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  assignedStaff: { type: String, default: '' },   // staff's legacy id (s1, s2 …)
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
