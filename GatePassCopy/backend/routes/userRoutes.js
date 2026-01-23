// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, listUsers, deleteUser } = require('../controllers/userController');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ---------- helper middleware ----------

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

// ---------- PUBLIC AUTH ROUTE ----------
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const envAdmin = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  };

  // env admin
  if (username === envAdmin.username && password === envAdmin.password) {
    const token = jwt.sign(
      { username: envAdmin.username, role: envAdmin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ success: true, role: envAdmin.role, token });
  }

  try {
    const user = await User.findOne({ username }).select('+password');
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ success: true, role: user.role, token });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- OFFICER DASHBOARD (auth only, not admin) ----------
// GET /api/users/officer/dashboard
router.get('/officer/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    message: 'Security officer dashboard data',
    user: req.user.username,
  });
});

// ---------- ADMIN-ONLY ROUTES ----------

router.use(authMiddleware, adminOnly);

// POST   /api/users        → create user (admin or officer)
router.post('/', createUser);

// GET    /api/users        → list all users
router.get('/', listUsers);

// DELETE /api/users/:id    → delete user
router.delete('/:id', deleteUser);

// GET    /api/users/dashboard → admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const officerCount = await User.countDocuments({ role: 'officer' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const users = await User.find().select('-password');
    res.json({
      message: 'Admin dashboard data',
      totalOfficers: officerCount,
      totalAdmins: adminCount,
      users,
    });
  } catch (err) {
    console.error('dashboard error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;