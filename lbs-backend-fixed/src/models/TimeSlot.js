const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  label:     { type: String, required: true },
});
module.exports = mongoose.model('TimeSlot', schema);
