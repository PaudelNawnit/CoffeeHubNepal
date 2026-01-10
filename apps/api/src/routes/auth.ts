import { Router } from 'express';
import { z } from 'zod';
import { captchaCheck } from '../middleware/captcha.js';
import { accountRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { isPasswordStrong, login, signup, requestPasswordReset, resetPassword } from '../services/authService.js';
import { User } from '../models/User.js';

const router = Router();

const emailSchema = z.string().email();
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => isPasswordStrong(val), 'Password must contain upper, lower, number');

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
  role: z.enum(['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator']).optional(),
  phone: z.string().optional(),
  location: z.string().optional()
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema
});

router.post(
  '/signup',
  accountRateLimiter,
  captchaCheck,
  validate(signupSchema),
  async (req, res) => {
    const { email, password, name, role, phone, location } = req.body;
    try {
      const result = await signup(email, password, name, role, phone, location);
      return res.status(201).json({
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          phone: result.user.phone,
          location: result.user.location,
          avatar: result.user.avatar,
          verified: result.user.verified
        }
      });
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'EMAIL_IN_USE') {
        return res.status(409).json({ error: 'EMAIL_IN_USE', code: 'EMAIL_IN_USE' });
      }
      if (err === 'WEAK_PASSWORD') {
        return res.status(400).json({ error: 'WEAK_PASSWORD', code: 'WEAK_PASSWORD' });
      }
      return res.status(500).json({ error: 'SIGNUP_FAILED' });
    }
  }
);

router.post(
  '/login',
  accountRateLimiter,
  captchaCheck,
  validate(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await login(email, password);
      return res.json({
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          phone: result.user.phone,
          location: result.user.location,
          avatar: result.user.avatar,
          verified: result.user.verified
        }
      });
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'ACCOUNT_LOCKED') {
        // Get the user to calculate unlock time
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user && user.lockUntil) {
          const unlocksInMs = Math.max(0, user.lockUntil.getTime() - Date.now());
          return res.status(423).json({ 
            error: 'ACCOUNT_LOCKED', 
            code: 'ACCOUNT_LOCKED',
            unlocksInMs: unlocksInMs
          });
        }
        return res.status(423).json({ error: 'ACCOUNT_LOCKED', code: 'ACCOUNT_LOCKED' });
      }
      if (err === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS', code: 'INVALID_CREDENTIALS' });
      }
      return res.status(500).json({ error: 'LOGIN_FAILED' });
    }
  }
);

// Forgot password - request password reset
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  captchaCheck,
  validate(forgotPasswordSchema),
  async (req, res) => {
    const { email } = req.body;
    try {
      await requestPasswordReset(email);
      // Always return success (don't reveal if email exists)
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        success: true
      });
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'FAILED_TO_SEND_EMAIL') {
        return res.status(500).json({ 
          error: 'FAILED_TO_SEND_EMAIL',
          message: 'Failed to send password reset email. Please try again later.'
        });
      }
      console.error('Forgot password error:', error);
      // Still return success to prevent email enumeration
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        success: true
      });
    }
  }
);

// Reset password - set new password using reset token
router.post(
  '/reset-password',
  accountRateLimiter,
  captchaCheck,
  validate(resetPasswordSchema),
  async (req, res) => {
    const { token, password } = req.body;
    try {
      await resetPassword(token, password);
      return res.json({ 
        message: 'Password has been reset successfully. You can now log in with your new password.',
        success: true
      });
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'TOKEN_EXPIRED') {
        return res.status(400).json({ 
          error: 'TOKEN_EXPIRED',
          message: 'This password reset link has expired. Please request a new one.'
        });
      }
      if (err === 'INVALID_TOKEN' || err === 'INVALID_TOKEN_TYPE') {
        return res.status(400).json({ 
          error: 'INVALID_TOKEN',
          message: 'Invalid or expired password reset link. Please request a new one.'
        });
      }
      if (err === 'USER_NOT_FOUND') {
        return res.status(404).json({ 
          error: 'USER_NOT_FOUND',
          message: 'User not found.'
        });
      }
      if (err === 'WEAK_PASSWORD') {
        return res.status(400).json({ 
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number.'
        });
      }
      console.error('Reset password error:', error);
      return res.status(500).json({ 
        error: 'RESET_PASSWORD_FAILED',
        message: 'Failed to reset password. Please try again.'
      });
    }
  }
);

// Update profile endpoint
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  avatar: z.string().optional() // Base64 image string
});

router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User not authenticated' });
      }

      const { name, phone, location, avatar } = req.body;
      
      // Validate avatar size if provided (base64 strings are ~33% larger than original)
      if (avatar !== undefined && avatar !== null && avatar !== '') {
        // Base64 string length check (2MB image = ~2.67MB base64)
        if (avatar.length > 3000000) { // ~2.2MB base64 (roughly 1.65MB image)
          return res.status(400).json({ 
            error: 'AVATAR_TOO_LARGE', 
            message: 'Image is too large. Please use an image smaller than 2MB.' 
          });
        }
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
      }

      // Check if user can update name (only before verification, except mods/admins)
      const isModOrAdmin = user.role === 'admin' || user.role === 'moderator';
      const canUpdateName = !user.verified || isModOrAdmin;

      // Update fields
      if (name !== undefined && canUpdateName) {
        user.name = name;
      } else if (name !== undefined && !canUpdateName) {
        return res.status(403).json({ 
          error: 'NAME_UPDATE_RESTRICTED', 
          message: 'Name can only be updated before verification. Please contact support if you need to change your name after verification.' 
        });
      }

      if (phone !== undefined) {
        user.phone = phone;
      }
      if (location !== undefined) {
        user.location = location;
      }
      if (avatar !== undefined) {
        user.avatar = avatar || null; // Allow empty string to remove avatar
      }

      await user.save();

      return res.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          location: user.location,
          avatar: user.avatar,
          verified: user.verified
        }
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Handle validation errors
      if (error?.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'VALIDATION_ERROR',
          message: error.message || 'Invalid data provided'
        });
      }
      
      // Handle MongoDB errors
      if (error?.name === 'MongoError' || error?.code === 11000) {
        return res.status(400).json({ 
          error: 'DATABASE_ERROR',
          message: 'Database error occurred. Please try again.'
        });
      }
      
      return res.status(500).json({ 
        error: 'UPDATE_PROFILE_FAILED',
        message: error?.message || 'Failed to update profile. Please try again.' 
      });
    }
  }
);

// Test email endpoint (for debugging - remove in production)
router.post(
  '/test-email',
  async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const { sendPasswordResetEmail } = await import('../services/emailService.js');
      // Generate a dummy token for testing
      const testToken = 'test-token-' + Date.now();
      await sendPasswordResetEmail(email, testToken);
      return res.json({ 
        message: 'Test email sent successfully. Check your inbox and server logs.',
        success: true
      });
    } catch (error: any) {
      console.error('Test email error:', error);
      return res.status(500).json({ 
        error: 'FAILED_TO_SEND_EMAIL',
        message: error.message || 'Failed to send test email',
        details: error.response || error.code
      });
    }
  }
);

export default router;

