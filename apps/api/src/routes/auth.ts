import { Router } from 'express';
import { appendFileSync } from 'fs';
import { z } from 'zod';
import { captchaCheck } from '../middleware/captcha.js';
import { accountRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { isPasswordStrong, login, signup, requestPasswordReset, resetPassword } from '../services/authService.js';
import { sendSignupOTP, verifySignupOTP, resendSignupOTP } from '../services/otpService.js';
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
  // Only allow regular user roles during signup - admin/moderator must be assigned via admin panel
  role: z.enum(['farmer', 'roaster', 'trader', 'exporter', 'expert']).optional(),
  phone: z.string().optional(),
  location: z.string().optional()
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const sendOTPSchema = z.object({
  email: emailSchema
});

const verifyOTPSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits')
});

const forgotPasswordSchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema
});

// Send OTP for signup email verification
router.post(
  '/send-otp',
  accountRateLimiter,
  captchaCheck,
  validate(sendOTPSchema),
  async (req, res) => {
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'auth.ts:58',message:'send-otp route handler entry',data:{email:req.body?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})+'\n');}catch(e){}
    // #endregion
    const { email } = req.body;
    try {
      console.log('[Auth Route] Sending OTP to:', email);
      // #region agent log
      try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'auth.ts:61',message:'calling sendSignupOTP',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');}catch(e){}
      // #endregion
      const result = await sendSignupOTP(email);
      console.log('[Auth Route] OTP sent successfully');
      // #region agent log
      try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'auth.ts:63',message:'sendSignupOTP success',data:{success:result.success},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');}catch(e){}
      // #endregion
      return res.json(result);
    } catch (error: any) {
      // #region agent log
      try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'auth.ts:65',message:'send-otp catch block',data:{errorMessage:error?.message,errorType:error?.constructor?.name,headersSent:res.headersSent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');}catch(e){}
      // #endregion
      const err = error?.message || String(error);
      console.error('[Auth Route] Send OTP error:', error);
      console.error('[Auth Route] Error message:', err);
      console.error('[Auth Route] Error stack:', error?.stack);
      console.error('[Auth Route] Error type:', error?.constructor?.name);
      
      // Ensure we always send a response
      if (!res.headersSent) {
        if (err === 'EMAIL_IN_USE') {
          return res.status(409).json({ 
            error: 'EMAIL_IN_USE', 
            code: 'EMAIL_IN_USE',
            message: 'This email is already registered. Please log in instead.'
          });
        }
        if (err && typeof err === 'string' && err.startsWith('WAIT_')) {
          const seconds = err.replace('WAIT_', '').replace('_SECONDS', '');
          return res.status(429).json({ 
            error: 'TOO_MANY_REQUESTS', 
            code: 'TOO_MANY_REQUESTS',
            message: `Please wait ${seconds} seconds before requesting another OTP.`,
            waitTime: parseInt(seconds) || 60
          });
        }
        if (err === 'FAILED_TO_SEND_OTP' || err === 'FAILED_TO_CREATE_OTP') {
          return res.status(500).json({ 
            error: 'FAILED_TO_SEND_OTP', 
            code: 'FAILED_TO_SEND_OTP',
            message: 'Failed to send verification code. Please try again.'
          });
        }
        if (err === 'DATABASE_ERROR') {
          return res.status(500).json({ 
            error: 'DATABASE_ERROR', 
            code: 'DATABASE_ERROR',
            message: 'Database connection error. Please try again later.'
          });
        }
        // Log unexpected errors for debugging
        console.error('[Auth Route] Unexpected error type:', {
          errorMessage: err,
          errorType: error?.constructor?.name,
          errorStack: error?.stack,
          errorDetails: error
        });
        return res.status(500).json({ 
          error: 'SEND_OTP_FAILED',
          code: 'SEND_OTP_FAILED',
          message: err || 'Failed to send verification code. Please try again.'
        });
      } else {
        // Headers already sent, log the error but can't send response
        console.error('[Auth Route] Error occurred but headers already sent:', {
          errorMessage: err,
          errorType: error?.constructor?.name,
          errorStack: error?.stack
        });
      }
    }
  }
);

// Verify OTP for signup
router.post(
  '/verify-otp',
  accountRateLimiter,
  validate(verifyOTPSchema),
  async (req, res) => {
    const { email, otp } = req.body;
    try {
      const result = await verifySignupOTP(email, otp);
      return res.json(result);
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'OTP_NOT_FOUND') {
        return res.status(404).json({ 
          error: 'OTP_NOT_FOUND', 
          code: 'OTP_NOT_FOUND',
          message: 'No verification code found. Please request a new one.'
        });
      }
      if (err === 'OTP_EXPIRED') {
        return res.status(400).json({ 
          error: 'OTP_EXPIRED', 
          code: 'OTP_EXPIRED',
          message: 'Verification code has expired. Please request a new one.'
        });
      }
      if (err === 'MAX_ATTEMPTS_EXCEEDED') {
        return res.status(429).json({ 
          error: 'MAX_ATTEMPTS_EXCEEDED', 
          code: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Too many incorrect attempts. Please request a new verification code.'
        });
      }
      if (err.startsWith('INVALID_OTP_')) {
        const remaining = err.replace('INVALID_OTP_', '').replace('_REMAINING', '');
        return res.status(400).json({ 
          error: 'INVALID_OTP', 
          code: 'INVALID_OTP',
          message: `Invalid verification code. ${remaining} attempts remaining.`,
          remainingAttempts: parseInt(remaining)
        });
      }
      console.error('Verify OTP error:', error);
      return res.status(500).json({ error: 'VERIFY_OTP_FAILED' });
    }
  }
);

// Resend OTP for signup
router.post(
  '/resend-otp',
  accountRateLimiter,
  captchaCheck,
  validate(sendOTPSchema),
  async (req, res) => {
    const { email } = req.body;
    try {
      const result = await resendSignupOTP(email);
      return res.json(result);
    } catch (error) {
      const err = (error as Error).message;
      if (err === 'EMAIL_IN_USE') {
        return res.status(409).json({ 
          error: 'EMAIL_IN_USE', 
          code: 'EMAIL_IN_USE',
          message: 'This email is already registered.'
        });
      }
      if (err.startsWith('WAIT_')) {
        const seconds = err.replace('WAIT_', '').replace('_SECONDS', '');
        return res.status(429).json({ 
          error: 'TOO_MANY_REQUESTS', 
          code: 'TOO_MANY_REQUESTS',
          message: `Please wait ${seconds} seconds before requesting another OTP.`,
          waitTime: parseInt(seconds)
        });
      }
      console.error('Resend OTP error:', error);
      return res.status(500).json({ error: 'RESEND_OTP_FAILED' });
    }
  }
);

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
      if (err === 'OTP_NOT_VERIFIED') {
        return res.status(403).json({ 
          error: 'OTP_NOT_VERIFIED', 
          code: 'OTP_NOT_VERIFIED',
          message: 'Please verify your email with OTP before completing registration.'
        });
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
      // For Cosmos DB, we need to keep avatars small (~400KB base64 max)
      if (avatar !== undefined && avatar !== null && avatar !== '') {
        // Base64 string length check (~400KB base64 = ~300KB image)
        // Base64 is ~33% larger, so 400KB base64 ≈ 300KB actual
        if (avatar.length > 550000) { // ~400KB base64 (roughly 300KB image)
          return res.status(400).json({ 
            error: 'AVATAR_TOO_LARGE', 
            message: 'Image is too large. Please use a smaller image (max ~300KB after compression).' 
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

export default router;

