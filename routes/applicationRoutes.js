const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const protect = require('../middleware/authMiddleware');



// Apply for a Job (Protected)
// Endpoint: POST /jobs/apply with body { jobId }
router.post('/jobs/apply', protect, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if the user has already applied for this job
    const existingApplication = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const application = new Application({ job: jobId, applicant: req.user._id });
    await application.save();
    
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jobs/applications (Protected)
// Returns all job applications with full details:
// jobId, jobTitle, location, description, createdOn, userId, username, email, appliedOn
router.get('/jobs/applications', protect, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('applicant');
      
    const formattedApplications = applications.map(app => ({
      jobId: app.job._id,
      jobTitle: app.job.jobTitle,
      location: app.job.location,
      description: app.job.description,
      createdOn: app.job.createdOn,
      userId: app.applicant._id,
      username: app.applicant.name,
      email: app.applicant.email,
      appliedOn: app.createdOn
    }));
    
    res.json(formattedApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jobs/applications/user (Protected)
// Returns the job applications for the current authenticated user with details:
// jobId, jobTitle, location, description, createdOn, appliedOn
router.get('/jobs/applications/user', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job');
      
    const formattedApplications = applications.map(app => ({
      jobId: app.job._id,
      jobTitle: app.job.jobTitle,
      location: app.job.location,
      description: app.job.description,
      createdOn: app.job.createdOn,
      appliedOn: app.createdOn
    }));
    
    res.json(formattedApplications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
