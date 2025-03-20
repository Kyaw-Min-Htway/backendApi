const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  req.user = jwt.verify(token, 'secret_key');
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, 'secret_key');
  res.json({ token });
});

router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { name, phone, address, pushToken } = req.body;
  await User.findByIdAndUpdate(req.user.userId, { name, phone, address, pushToken });
  res.json({ message: 'Profile updated' });
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;