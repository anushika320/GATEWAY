/// routes/gatePassRoute.js
const express = require('express');
const jwt = require('jsonwebtoken');
const {
  createGatePass,
  recordEntry,
  getTodayEntries,
  getByDate,
  listActiveGatePasses,
} = require('../controllers/gatepassController');
       
const router = express.Router();
    
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function authMiddleware(req, res, next)
{
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  }
  )
  ;
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

function officerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

// Admin: issue gate pass (period).
router.post('/', authMiddleware, adminOnly, createGatePass);

// Admin: check passes by validUntil date
router.get('/by-date', authMiddleware, adminOnly, getByDate);

// Admin: list all active passes
router.get('/active', authMiddleware, adminOnly, listActiveGatePasses);

// Officer: record entry for a vehicle number
router.post('/entries', authMiddleware, officerOnly, recordEntry);

// Officer: get today’s entries
router.get('/today', authMiddleware, officerOnly, getTodayEntries);

module.exports = router;
