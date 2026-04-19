const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id:              { type: String, required: true, unique: true },
  fromFacultyId:   { type: String, required: true },
  fromFacultyName: { type: String, default: '' },
  toFacultyId:     { type: String, required: true },
  toFacultyName:   { type: String, default: '' },
  bookingId:       { type: String, default: '' },
  venueId:         { type: String, default: '' },
  venueName:       { type: String, default: '' },
  date:            { type: String, default: '' },
  timeSlot:        { type: String, default: '' },
  timeSlotId:      { type: String, default: '' },
  reason:          { type: String, required: true },
  status:          { type: String, enum: ['pending','accepted','declined'], default: 'pending' },
  createdAt:       { type: String, default: () => new Date().toISOString() },
});
module.exports = mongoose.model('CompromiseRequest', schema);
