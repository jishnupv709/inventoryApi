const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
require('dotenv').config();

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 📝 REGISTER User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
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
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
