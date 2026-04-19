const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id:         { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['admin','faculty','staff'], required: true },
  department: { type: String, default: '' },
  phone:      { type: String, default: '' },
});
module.exports = mongoose.model('User', schema);
