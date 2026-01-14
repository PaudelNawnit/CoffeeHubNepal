import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrModerator } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getPendingVerifications,
  getPendingRoleChangeRequests,
  getUserStats,
  verifyUser,
  rejectVerification
} from '../services/adminService.js';
import {
  createReport,
  getReports,
  updateReportStatus,
  getReportsByPost
} from '../services/reportService.js';
import { User, UserRole } from '../models/User.js';
import { ReportStatus, ReportType } from '../models/Report.js';
import { createPost } from '../services/blogService.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Get all users (admin/moderator)
router.get('/users', requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const filters = {
      role: req.query.role as UserRole | undefined,
      verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    const result = await getAllUsers(filters);
    return res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_USERS' });
  }
});

// Get user by ID (admin/moderator)
router.get('/users/:id', validateObjectId(), requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_USER' });
  }
});

// Update user role (admin can assign any role, moderator can only assign non-admin/moderator roles)
const updateRoleSchema = z.object({
  role: z.enum(['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'])
});

// Roles that moderators are allowed to assign
const MODERATOR_ASSIGNABLE_ROLES = ['farmer', 'roaster', 'trader', 'exporter', 'expert'];

router.put('/users/:id/role', validateObjectId(), requireAdminOrModerator, validate(updateRoleSchema), async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    // Get the requesting user to check their role
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User not found' });
    }
    
    // Get the target user to check their current role
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }
    
    const isAdmin = requestingUser.role === 'admin';
    const isModerator = requestingUser.role === 'moderator';
    
    // Moderator restrictions
    if (isModerator && !isAdmin) {
      // Moderators cannot modify admin or moderator users
      if (targetUser.role === 'admin' || targetUser.role === 'moderator') {
        return res.status(403).json({ 
          error: 'PERMISSION_DENIED', 
          message: 'Moderators cannot modify admin or moderator users' 
        });
      }
      // Moderators cannot assign admin or moderator roles
      if (!MODERATOR_ASSIGNABLE_ROLES.includes(role)) {
        return res.status(403).json({ 
          error: 'PERMISSION_DENIED', 
          message: 'Moderators can only assign farmer, roaster, trader, exporter, or expert roles' 
        });
      }
    }
    
    console.log(`[Admin Route] Updating user ${userId} role to ${role} by ${requestingUser.role} ${req.userId}`);
    
    const user = await updateUserRole(userId, role, req.userId!);
    
    // Verify the role was actually updated
    const updatedUser = await User.findById(userId);
    if (!updatedUser || updatedUser.role !== role) {
      console.error(`[Admin Route] Role update verification failed for user ${userId}`);
      return res.status(500).json({ error: 'FAILED_TO_UPDATE_ROLE', message: 'Role update did not persist' });
    }
    
    return res.json({
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      location: user.location,
      verified: user.verified
    });
  } catch (error) {
    const err = (error as Error).message;
    console.error('[Admin Route] Update role error:', error);
    
    if (err === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }
    if (err === 'INVALID_ROLE') {
      return res.status(400).json({ error: 'INVALID_ROLE', message: 'Invalid role specified' });
    }
    if (err === 'FAILED_TO_UPDATE_ROLE') {
      return res.status(500).json({ error: 'FAILED_TO_UPDATE_ROLE', message: 'Failed to persist role update' });
    }
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_ROLE', message: err || 'Unknown error occurred' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', validateObjectId(), requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    await deleteUser(userId, req.userId!);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    const err = (error as Error).message;
    console.error('[Admin Route] Delete user error:', error);
    
    if (err === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }
    if (err === 'CANNOT_DELETE_SELF') {
      return res.status(400).json({ error: 'CANNOT_DELETE_SELF', message: 'You cannot delete your own account' });
    }
    if (err === 'CANNOT_DELETE_ADMIN') {
      return res.status(403).json({ error: 'CANNOT_DELETE_ADMIN', message: 'Cannot delete admin users' });
    }
    return res.status(500).json({ error: 'FAILED_TO_DELETE_USER', message: err || 'Unknown error occurred' });
  }
});

// Get dashboard statistics (admin/moderator)
router.get('/stats', requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const stats = await getUserStats();
    return res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_STATS' });
  }
});

// Get pending verifications (admin/moderator)
router.get('/pending-verifications', requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const verifications = await getPendingVerifications();
    return res.json(verifications);
  } catch (error) {
    console.error('Get verifications error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_VERIFICATIONS' });
  }
});

// Verify a user (admin/moderator)
router.post('/users/:id/verify', validateObjectId(), requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const user = await verifyUser(userId, req.userId!);
    return res.json({
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      location: user.location,
      verified: user.verified
    });
  } catch (error) {
    const err = (error as Error).message;
    console.error('Verify user error:', error);
    
    if (err === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return res.status(500).json({ error: 'FAILED_TO_VERIFY_USER', message: err || 'Unknown error occurred' });
  }
});

// Reject a user verification (admin/moderator)
const rejectVerificationSchema = z.object({
  reason: z.string().optional()
});

router.post('/users/:id/reject-verification', validateObjectId(), requireAdminOrModerator, validate(rejectVerificationSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    const user = await rejectVerification(userId, req.userId!, reason);
    return res.json({
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      location: user.location,
      verified: user.verified
    });
  } catch (error) {
    const err = (error as Error).message;
    console.error('Reject verification error:', error);
    
    if (err === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return res.status(500).json({ error: 'FAILED_TO_REJECT_VERIFICATION', message: err || 'Unknown error occurred' });
  }
});

// Get pending role change requests (admin/moderator)
router.get('/pending-role-changes', requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const requests = await getPendingRoleChangeRequests();
    return res.json(requests);
  } catch (error) {
    console.error('Get role change requests error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_ROLE_CHANGE_REQUESTS' });
  }
});

// Get all reports (admin/moderator)
router.get('/reports', requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const filters = {
      status: req.query.status as ReportStatus | undefined,
      type: req.query.type as ReportType | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    const result = await getReports(filters);
    return res.json(result);
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_REPORTS' });
  }
});

// Update report status (admin/moderator)
const updateReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'dismissed', 'resolved'])
});

router.put('/reports/:id', validateObjectId(), requireAdminOrModerator, validate(updateReportSchema), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const report = await updateReportStatus(req.params.id, status, req.userId!);
    return res.json(report);
  } catch (error) {
    const err = (error as Error).message;
    if (err === 'REPORT_NOT_FOUND') {
      return res.status(404).json({ error: 'REPORT_NOT_FOUND' });
    }
    console.error('Update report error:', error);
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_REPORT' });
  }
});

// Get reports by post (admin/moderator)
router.get('/reports/post/:postId', validateObjectId(['postId']), requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const reports = await getReportsByPost(req.params.postId);
    return res.json(reports);
  } catch (error) {
    console.error('Get reports by post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_REPORTS' });
  }
});

// Create an official notice (admin/moderator only). Notices are stored in the BlogPost collection.
const createNoticeSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  type: z.enum(['Training', 'Govt', 'Event', 'Alert', 'Other']).optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  location: z.string().max(200).optional(),
  deadline: z.string().max(100).optional()
});

router.post(
  '/notices',
  requireAdminOrModerator,
  validate(createNoticeSchema),
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User not authenticated' });
      }

      const { title, body, type, priority, location, deadline } = req.body as z.infer<
        typeof createNoticeSchema
      >;

      const author = await User.findById(req.userId).lean();
      if (!author) {
        return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'Author not found' });
      }

      // Encode notice metadata in tags so we can later filter via /blog endpoint
      const tags: string[] = ['notice'];
      if (type) tags.push(`type:${type}`);
      if (priority) tags.push(`priority:${priority}`);
      if (location) tags.push(`location:${location}`);
      if (deadline) tags.push(`deadline:${deadline}`);

      const post = await createPost(req.userId, {
        title,
        content: body,
        category: 'notice',
        tags,
        images: [],
        authorName: author.name || 'Admin',
        authorEmail: author.email
      });

      return res.status(201).json({
        id: post._id.toString(),
        title: post.title,
        body: post.content,
        createdAt: post.createdAt,
        date: post.createdAt,
        type: type || 'Alert',
        priority: (priority || 'Medium') as 'High' | 'Medium' | 'Low',
        location: location || undefined,
        deadline: deadline || undefined
      });
    } catch (error) {
      console.error('Create notice error:', error);
      return res.status(500).json({
        error: 'FAILED_TO_CREATE_NOTICE',
        message: (error as Error).message || 'Unknown error occurred'
      });
    }
  }
);

export default router;

