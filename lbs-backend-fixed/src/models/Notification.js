const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  userId:    { type: String, required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, default: 'system' },
  read:      { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
});
module.exports = mongoose.model('Notification', schema);
