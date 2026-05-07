const { Schema, model } = require('mongoose');
module.exports = model('Booking', new Schema({
  id:              { type: String, required: true, unique: true },
  venueId:         { type: String, required: true },
  venueName:       { type: String, default: '' },
  facultyId:       { type: String, required: true },
  facultyName:     { type: String, default: '' },
  date:            { type: String, required: true },
  timeSlotId:      { type: String, required: true },
  timeSlotLabel:   { type: String, default: '' },
  purpose:         { type: String, required: true },
  notes:           { type: String, default: '' },
  equipmentNeeded: { type: [String], default: [] },
  status:          { type: String, enum: ['confirmed','pending','approved','rejected','cancelled'], default: 'confirmed' },
  createdAt:       { type: String, default: () => new Date().toISOString() },
}));
