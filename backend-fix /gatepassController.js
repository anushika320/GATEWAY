// controllers/gatepassController.js
const GatePass = require('../models/GatePass');

// Admin: issue new gate pass (issueDate = now, validUntil from form)
async function createGatePass(req, res) {
  try {
    const { vehicleNumber, ownerType, ownerName, purpose, validUntil } = req.body;

    if (!vehicleNumber || !ownerType || !ownerName || !purpose || !validUntil) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const issueDate = new Date();             // now
    const validUntilDate = new Date(validUntil); // from input YYYY-MM-DD
    // expireAt = end of validUntil date
    const expireAt = new Date(validUntilDate);
    expireAt.setHours(23, 59, 59, 999);

    const pass = await GatePass.create({
      vehicleNumber,
      ownerType,
      ownerName,
      purpose,
      issueDate,
      validUntil: validUntilDate,
      expireAt,
      issuedBy: req.user.username, // admin username from JWT
    });

    res.status(201).json({ success: true, gatePass: pass });
  } catch (err) {
    console.error('createGatePass error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Officer: record vehicle entry for today (only if pass valid today)
async function recordEntry(req, res) {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) {
      return res.status(400).json({ message: 'Vehicle number required' });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Pass is valid if: issueDate <= today <= validUntil
    const pass = await GatePass.findOne({
      vehicleNumber,
      issueDate: { $lte: todayEnd },
      validUntil: { $gte: todayStart },
    });

    if (!pass) {
      return res.status(404).json({ message: 'No valid gate pass for today' });
    }

    pass.entries.push({
      time: now,
      recordedBy: req.user.username,
    });

    await pass.save();

    res.json({ success: true, gatePass: pass });
  } catch (err) {
    console.error('recordEntry error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Officer: get today’s entries (vehicles that entered today)
async function getTodayEntries(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const passes = await GatePass.find({
      'entries.time': { $gte: todayStart, $lte: todayEnd },
    }).select('-__v');

    res.json({ success: true, passes });
  } catch (err) {
    console.error('getTodayEntries error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin: get passes by validity date (for "check vehicle records")
async function getByDate(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query is required (YYYY-MM-DD)' });
    }

    const selected = new Date(date);
    const start = new Date(selected);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selected);
    end.setHours(23, 59, 59, 999);

    // passes whose validUntil date falls on this selected day
    const passes = await GatePass.find({
      validUntil: { $gte: start, $lte: end },
    }).select('-__v');

    res.json({ success: true, passes });
  } catch (err) {
    console.error('getByDate error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin: list all active (not expired) gate passes to show in dashboard
async function listActiveGatePasses(req, res) {
  try {
    const now = new Date();
    const passes = await GatePass.find({
      expireAt: { $gt: now },      // not yet deleted by TTL
    }).select('-__v');
    res.json({ success: true, passes });
  } catch (err) {
    console.error('listActiveGatePasses error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createGatePass,
  recordEntry,
  getTodayEntries,
  getByDate,
  listActiveGatePasses,
};
