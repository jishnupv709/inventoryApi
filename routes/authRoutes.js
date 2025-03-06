const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 📝 REGISTER User
router.post('/register', async (req, res) => {
  const { name, email, password, phone, userType } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    // Create new user. If userType is provided, use it; otherwise, default to 2.
    const newUser = new User({ name, email, password, phone, userType });
    await newUser.save();
    
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      userType: newUser.userType,
      token: generateToken(newUser._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔑 LOGIN User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
