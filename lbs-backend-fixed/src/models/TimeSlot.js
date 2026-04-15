const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  label: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
