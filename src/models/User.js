const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  pushToken: { type: String },
  isAdmin: { type: Boolean, default: false }, // Admin flag
});

module.exports = mongoose.model('User', userSchema);