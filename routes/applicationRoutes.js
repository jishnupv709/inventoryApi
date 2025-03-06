const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const protect = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job-related API endpoints
 */

/**
 * @swagger
 * /jobs/apply:
 *   post:
 *     summary: Apply for a job
 *     description: Allows an authenticated user to apply for a job by providing a job ID.
 *     security:
 *       - BearerAuth: []
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: The ID of the job to apply for.
 *     responses:
 *       201:
 *         description: Application successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Application ID
 *       400:
 *         description: Job ID is required or the user has already applied.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Server error.
 */
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

/**
 * @swagger
 * /jobs/applications:
 *   get:
 *     summary: Get all job applications
 *     description: Returns all job applications with details about jobs and applicants. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: A list of job applications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   jobId:
 *                     type: string
 *                   jobTitle:
 *                     type: string
 *                   location:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdOn:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   appliedOn:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error.
 */
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

/**
 * @swagger
 * /jobs/applications/user:
 *   get:
 *     summary: Get job applications for the authenticated user
 *     description: Fetches all job applications submitted by the currently authenticated user.
 *     security:
 *       - BearerAuth: []
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: A list of job applications for the current user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   jobId:
 *                     type: string
 *                   jobTitle:
 *                     type: string
 *                   location:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdOn:
 *                     type: string
 *                     format: date-time
 *                   appliedOn:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error.
 */
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
