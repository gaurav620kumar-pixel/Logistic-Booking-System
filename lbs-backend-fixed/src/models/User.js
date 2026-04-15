const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },   // keep legacy string id (f1, s1, a1 …)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['faculty', 'staff', 'admin'], required: true },
  department: { type: String, required: true },
  phone: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
