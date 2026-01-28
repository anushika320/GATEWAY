// models/GatePass.js
const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true },               // e.g. NC-1234
    ownerType: { type: String, enum: ['university', 'staff'], required: true },
    ownerName: { type: String, required: true },                   // staff / unit
    purpose: { type: String, required: true },

    issueDate: { type: Date, default: Date.now, required: true },  // issue date
    validUntil: { type: Date, required: true },                    // final valid date

    // used for TTL index – when this time is reached the doc is deleted
    expireAt: { type: Date, required: true },

    issuedBy: { type: String, required: true },                    // admin username

    entries: [
      {
        time: { type: Date, default: Date.now },
        recordedBy: { type: String, required: true },              // officer username
      },
    ],
  },
  { timestamps: true }
);

// TTL index: delete document when expireAt time is reached
gatePassSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });  // MongoDB TTL[web:159][web:181]

module.exports = mongoose.model('GatePass', gatePassSchema);