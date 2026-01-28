// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, listUsers, deleteUser } = require('../controllers/userController');
const User = require('../models/User');
const { authMiddleware, adminOnly, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ---------- PUBLIC AUTH ROUTE ----------
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Check for env-based super admin
  const envAdmin = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  };

  // Environment admin login (for initial setup)
  if (username === envAdmin.username && password === envAdmin.password) {
    const token = jwt.sign(
      { username: envAdmin.username, role: envAdmin.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ success: true, role: envAdmin.role, token });
  }

  try {
    // Find user and include password field for comparison
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      role: user.role,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- OFFICER DASHBOARD (auth required) ----------
// GET /api/users/officer/dashboard
router.get('/officer/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    message: 'Security officer dashboard data',
    user: req.user.username,
    role: req.user.role,
  });
});

// ---------- ADMIN-ONLY ROUTES ----------

// Apply auth and admin middleware to all routes below
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