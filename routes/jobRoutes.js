const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const protect = require('../middleware/authMiddleware');

// Create a Job (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const { jobTitle, location, description } = req.body;
    if (!jobTitle || !location || !description) {
      return res.status(400).json({ message: 'JobTitle, Location, and Description are required' });
    }
    const newJob = new Job({ jobTitle, location, description });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all Jobs (Public)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Job Details (Protected)
// Instead of using a dynamic URL, use POST with a body containing the jobId.
router.post('/details', protect, async (req, res) => {
  try {
    const { jobId } = req.body; // Use jobId to match your client payload
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update a Job (Protected)
// Endpoint: PUT /jobs/update with body { jobId, jobTitle, location, description }
router.put('/update', protect, async (req, res) => {
  try {
    const { jobId, jobTitle, location, description } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.jobTitle = jobTitle || job.jobTitle;
    job.location = location || job.location;
    job.description = description || job.description;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Job (Protected)
// Endpoint: DELETE /jobs/delete with body { jobId }
router.delete('/delete', protect, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    res.json({ message: 'Job removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
