// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String, required: true },
    password: { type: String, required: true, select: false }, // TODO: hash later
    role: { type: String, enum: ['officer', 'admin'], default: 'officer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);