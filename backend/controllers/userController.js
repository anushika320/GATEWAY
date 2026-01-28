// controllers/userController.js
const User = require('../models/User');
const nodemailer = require('nodemailer');

/**
 * Create a new user (admin or officer)
 * Password will be automatically hashed by the User model pre-save hook
 */
async function createUser(req, res) {
  try {
    const { fullName, username, email, telephone, password, role } = req.body;

    // Validate required fields
    if (!fullName || !username || !email || !telephone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    if (!['officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be officer or admin.' });
    }

    // Check for existing user
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'User with this username or email already exists' });
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const user = await User.create({
      fullName,
      username,
      email,
      telephone,
      password, // Plain text - will be hashed by model
      role,
    });

    // Send email with credentials
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: 'Security Gate Pass System - Your Credentials',
        html: `
          <h2>Welcome to Security Gate Pass System</h2>
          <p>Dear ${fullName},</p>
          <p>You have been registered in the Security Gate Pass Management System.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p><strong>Important:</strong> Please keep these credentials confidential and change your password after first login.</p>
          <p>Thank you.</p>
        `,
        text: `
Dear ${fullName},

You have been registered in the Security Gate Pass Management System.

Role: ${role}
Username: ${username}
Password: ${password}

Please keep these credentials confidential.

Thank you.
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      // Don't fail user creation if email fails
    }

    // Return safe user object (no password)
    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: safeUser,
      credentials: { username, password, role }, // Include for admin reference only
    });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Server error creating user' });
  }
}

/**
 * List all users (excludes password field)
 */
async function listUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
}

/**
 * Delete a user by ID
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: id });
    res.json({
      success: true,
      message: `User ${user.username} deleted successfully`,
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
}

/**
 * Update user profile (for future use)
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, email, telephone, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (telephone) user.telephone = telephone;
    if (role && ['officer', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ message: 'Server error updating user' });
  }
}

module.exports = {
  createUser,
  listUsers,
  deleteUser,
  updateUser,
};