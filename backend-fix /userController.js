// controllers/userController.js
const User = require('../models/User');
const nodemailer = require('nodemailer');

async function createUser(req, res) {
  try {
    const { fullName, username, email, telephone, password, role } = req.body;

    if (!fullName || !username || !email || !telephone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'User with this username or email already exists' });
    }

    const user = await User.create({
      fullName,
      username,
      email,
      telephone,
      password,
      role,
    });

    // Email credentials
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
      subject: 'Security Gate Pass System Credentials',
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

    transporter.sendMail(mailOptions).catch((err) => {
      console.error('Email send error', err);
    });

    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      user: safeUser,
      credentials: { username, password, role },
    });
  } catch (err) {
    console.error('createUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.deleteOne({ _id: id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createUser,
  listUsers,
  deleteUser,
};
