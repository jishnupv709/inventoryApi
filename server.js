const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/mongo');
const swaggerDocs = require("./config/swagger");
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const protect = require('./middleware/authMiddleware');
const User = require('./models/users');

dotenv.config();
connectDB(); // Connect to MongoDB Atlas

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware: Manually set headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200','https://inventory-app-orcin-delta.vercel.app/');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.json());

// Authentication Routes
app.use('/auth', authRoutes);

// Job Routes (CRUD operations)
// Endpoints such as:
//  - POST /jobs                (create a job)
//  - GET /jobs                 (list all jobs)
//  - POST /jobs/details        (get details with { jobid } in body)
//  - PUT /jobs/update          (update a job with { jobid, ... } in body)
//  - DELETE /jobs/delete       (delete a job with { jobid } in body)
app.use('/jobs', jobRoutes);

// Application Routes (Job applications)
// Endpoints such as:
//  - POST /jobs/applications   (list applications for a job with { jobid } in body)
//  - POST /jobs/apply          (apply for a job with { jobid } in body)
//  - GET  /jobs/applications/user (list jobs applied by the current user)
app.use('/', applicationRoutes);

// Example User Endpoints (Protected)
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

app.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Swagger setup
swaggerDocs(app);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
  console.log("Swagger Docs available at /api-docs");
