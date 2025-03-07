const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const protect = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job CRUD Operations
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobTitle, location, description]
 *             properties:
 *               jobTitle:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all jobs
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /jobs/new:
 *   get:
 *     summary: Get new jobs (jobs not applied by the user)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of new jobs
 *       500:
 *         description: Server error
 */
router.get('/new', protect, async (req, res) => {
  try {
    // Get the logged-in user's ID from the authentication middleware
    const userId = req.user._id;

    // Retrieve all applications made by this user
    const appliedApplications = await Application.find({ applicant: userId }).select('job');

    // Extract the job IDs that the user has applied for
    const appliedJobIds = appliedApplications.map(application => application.job);

    // Find jobs that are not in the list of applied job IDs
    const newJobs = await Job.find({ _id: { $nin: appliedJobIds } });

    res.json(newJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /jobs/details:
 *   post:
 *     summary: Get job details
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       400:
 *         description: Job ID is required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/details', protect, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /jobs/update:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Job ID is required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /jobs/delete:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job removed successfully
 *       400:
 *         description: Job ID is required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
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
