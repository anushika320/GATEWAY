// middleware/auth.js
// Shared authentication middleware for all routes
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware to verify JWT token
 * Attaches decoded user to req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token format invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

/**
 * Middleware to restrict access to admin users only
 * Must be used AFTER authMiddleware
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
}

/**
 * Middleware to restrict access to officers only
 * Must be used AFTER authMiddleware
 */
function officerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Access denied. Officer only.' });
  }
  next();
}

/**
 * Middleware to allow both admin and officer
 * Must be used AFTER authMiddleware
 */
function adminOrOfficer(req, res, next) {
  if (!req.user || !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminOnly,
  officerOnly,
  adminOrOfficer,
  JWT_SECRET,
};
