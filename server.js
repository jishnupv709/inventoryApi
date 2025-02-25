const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/mongo');
const authRoutes = require('./routes/authRoutes');
const protect = require('./middleware/authMiddleware');
const User = require('./models/users');

dotenv.config();
connectDB(); // Connect to MongoDB Atlas

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware: Manually set headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.json());

// Authentication Routes
app.use('/auth', authRoutes);

// 🚀 CREATE: Add a new user (Protected)
app.post('/users', protect, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const newUser = new User({ name });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📄 READ: Get all users (Protected)
app.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
