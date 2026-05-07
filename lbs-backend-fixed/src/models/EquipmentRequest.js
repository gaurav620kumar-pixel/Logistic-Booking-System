const { Schema, model } = require('mongoose');
module.exports = model('EquipmentRequest', new Schema({
  id:          { type: String, required: true, unique: true },
  facultyId:   { type: String, required: true },
  facultyName: { type: String, default: '' },
  venueId:     { type: String, required: true },
  venueName:   { type: String, default: '' },
  staffId:     { type: String, default: '' },
  items:       { type: [String], required: true },
  date:        { type: String, default: '' },
  timeSlot:    { type: String, default: '' },
  status:      { type: String, enum: ['pending','acknowledged','ready'], default: 'pending' },
  notes:       { type: String, default: '' },
  createdAt:   { type: String, default: () => new Date().toISOString() },
}));
