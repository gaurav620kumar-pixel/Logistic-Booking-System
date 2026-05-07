const { Schema, model } = require('mongoose');
module.exports = model('Venue', new Schema({
  id:            { type: String, required: true, unique: true },
  name:          { type: String, required: true },
  type:          { type: String, default: 'classroom' },
  capacity:      { type: Number, default: 0 },
  building:      { type: String, required: true },
  floor:         { type: Number, default: 0 },
  equipment:     { type: [String], default: [] },
  status:        { type: String, enum: ['available','occupied','maintenance'], default: 'available' },
  assignedStaff: { type: String, default: '' },
}));
