import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  createApplication,
  getApplications,
  updateApplicationStatus
} from '../services/jobService.js';

const router = Router();

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  farm: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  pay: z.string().min(1).max(200),
  type: z.enum(['Full-time', 'Part-time', 'Seasonal', 'Contract']),
  description: z.string().min(1).max(3000),
  requirements: z.string().max(2000).optional(),
  benefits: z.string().max(2000).optional()
});

const createApplicationSchema = z.object({
  applicantName: z.string().min(1),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().optional(),
  message: z.string().max(1000).optional()
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected'])
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type as string | undefined,
      location: req.query.location as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      createdBy: req.query.createdBy as string | undefined
    };

    const result = await getJobs(filters);
    return res.json(result);
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_JOBS' });
  }
});

// Get single job
router.get('/:id', validateObjectId(), async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'JOB_NOT_FOUND' });
    }
    
    return res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_JOB' });
  }
});

// Create job (auth required)
router.post('/', authenticate, validate(createJobSchema), async (req: AuthRequest, res) => {
  try {
    const job = await createJob(req.userId!, req.body);
    return res.status(201).json(job);
  } catch (error: any) {
    console.error('Create job error:', error);
    return res.status(500).json({ 
      error: 'FAILED_TO_CREATE_JOB',
      message: error.message || 'Failed to create job'
    });
  }
});

// Update job (auth + owner check)
router.put('/:id', validateObjectId(), authenticate, validate(createJobSchema.partial()), async (req: AuthRequest, res) => {
  try {
    const job = await updateJob(req.params.id, req.userId!, req.body);
    
    if (!job) {
      return res.status(404).json({ error: 'JOB_NOT_FOUND' });
    }
    
    return res.json(job);
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return res.status(404).json({ error: 'JOB_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only edit your own jobs' });
    }
    console.error('Update job error:', error);
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_JOB' });
  }
});

// Delete job (auth + owner check)
router.delete('/:id', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    await deleteJob(req.params.id, req.userId!);
    return res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return res.status(404).json({ error: 'JOB_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only delete your own jobs' });
    }
    console.error('Delete job error:', error);
    return res.status(500).json({ error: 'FAILED_TO_DELETE_JOB' });
  }
});

// Apply to job (auth required)
router.post('/:id/apply', validateObjectId(), authenticate, validate(createApplicationSchema), async (req: AuthRequest, res) => {
  try {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.userId).lean();
    
    if (!user) {
      return res.status(401).json({ error: 'USER_NOT_FOUND' });
    }

    const application = await createApplication(req.params.id, req.userId!, {
      applicantName: req.body.applicantName || user.name || 'User',
      applicantEmail: req.body.applicantEmail || req.userEmail!,
      applicantPhone: req.body.applicantPhone || user.phone,
      message: req.body.message
    });
    
    return res.status(201).json(application);
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return res.status(404).json({ error: 'JOB_NOT_FOUND' });
    }
    if (error.message === 'ALREADY_APPLIED') {
      return res.status(409).json({ error: 'ALREADY_APPLIED', message: 'You have already applied to this job' });
    }
    console.error('Apply to job error:', error);
    return res.status(500).json({ error: 'FAILED_TO_APPLY' });
  }
});

// Get applications for a job (auth + owner check)
router.get('/:id/applications', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    const applications = await getApplications(req.params.id, req.userId!);
    return res.json(applications);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only view applications for your own jobs' });
    }
    console.error('Get applications error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_APPLICATIONS' });
  }
});

// Update application status (auth + owner check)
router.put('/:id/applications/:applicationId', validateObjectId(['id', 'applicationId']), authenticate, validate(updateApplicationStatusSchema), async (req: AuthRequest, res) => {
  try {
    const application = await updateApplicationStatus(
      req.params.applicationId,
      req.params.id,
      req.userId!,
      req.body.status
    );
    return res.json(application);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED' });
    }
    if (error.message === 'APPLICATION_NOT_FOUND') {
      return res.status(404).json({ error: 'APPLICATION_NOT_FOUND' });
    }
    console.error('Update application status error:', error);
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_APPLICATION' });
  }
});

export default router;

