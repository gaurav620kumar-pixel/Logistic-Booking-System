const { Schema, model } = require('mongoose');
module.exports = model('TimeSlot', new Schema({
  id:        { type: String, required: true, unique: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  label:     { type: String, required: true },
}));
