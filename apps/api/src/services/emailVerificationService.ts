import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { EmailVerificationToken } from '../models/EmailVerificationToken.js';
import { User } from '../models/User.js';
import { sendSignupVerificationLinkEmail } from './emailService.js';
import { env } from '../config/env.js';

const TOKEN_EXPIRY_MINUTES = 30;
// For local testing we want instant re-request; keep a cooldown in production
const RESEND_COOLDOWN_SECONDS = process.env.NODE_ENV === 'production' ? 60 : 0;

/**
 * Generate a secure random token for email verification
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for storage (similar to password hashing)
 */
const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, 10);
};

/**
 * Compare a plain token with a hashed token
 */
const compareToken = async (token: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(token, hash);
};

/**
 * Request signup verification link - generates token and sends email
 * Returns success even if email already exists (security best practice)
 */
export const requestSignupVerificationLink = async (
  email: string
): Promise<{ success: boolean; message: string; expiresIn: number }> => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for recent verification link (prevent spam)
  const recentToken = await EmailVerificationToken.findOne({
    type: 'verification-token',
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
    usedAt: null,
    createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) }
  });

  if (recentToken) {
    const waitTime = Math.ceil(
      (recentToken.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
    );
    throw new Error(`WAIT_${waitTime}_SECONDS`);
  }

  // Delete any existing unused tokens for this email
  await EmailVerificationToken.deleteMany({
    type: 'verification-token',
    email: normalizedEmail,
    usedAt: null
  });

  // Generate new token
  const plainToken = generateToken();
  const tokenHash = await hashToken(plainToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Save token to database
  await EmailVerificationToken.create({
    email: normalizedEmail,
    tokenHash,
    expiresAt,
    type: 'verification-token'
  });

  // Build verification link - ensure it has a protocol
  let baseUrl = env.clientOrigin;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    // If no protocol, assume http for localhost, https otherwise
    baseUrl = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') 
      ? `http://${baseUrl}` 
      : `https://${baseUrl}`;
  }
  const verificationLink = `${baseUrl}/complete-signup?token=${plainToken}`;

  // Send verification email
  try {
    await sendSignupVerificationLinkEmail(normalizedEmail, verificationLink, TOKEN_EXPIRY_MINUTES);
    console.log(`[Email Verification] Signup verification link sent to ${normalizedEmail}`);
  } catch (error) {
    console.error('[Email Verification] Email sending error:', error);
    // Delete the token if email sending fails
    await EmailVerificationToken.deleteOne({
      type: 'verification-token',
      email: normalizedEmail,
      tokenHash
    });
    throw new Error('FAILED_TO_SEND_EMAIL');
  }

  return {
    success: true,
    message: 'Verification link sent successfully',
    expiresIn: TOKEN_EXPIRY_MINUTES * 60
  };
};

/**
 * Validate verification token and mark as used
 */
export const validateVerificationToken = async (
  token: string
): Promise<{ email: string; valid: boolean }> => {
  // Find all unused tokens that haven't expired (filter by type to distinguish from OTPs)
  const tokens = await EmailVerificationToken.find({
    type: 'verification-token',
    usedAt: null,
    expiresAt: { $gt: new Date() }
  });

  // Compare token with each hash
  for (const tokenRecord of tokens) {
    const isValid = await compareToken(token, tokenRecord.tokenHash);
    if (isValid) {
      // Mark token as used
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();

      return {
        email: tokenRecord.email,
        valid: true
      };
    }
  }

  return {
    email: '',
    valid: false
  };
};

/**
 * Check if email has a valid unused verification token
 */
export const hasValidVerificationToken = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase().trim();

  const token = await EmailVerificationToken.findOne({
    type: 'verification-token',
    email: normalizedEmail,
    usedAt: null,
    expiresAt: { $gt: new Date() }
  });

  return !!token;
};

/**
 * Clean up used tokens for an email (after successful signup)
 */
export const cleanupVerificationTokens = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim();
  await EmailVerificationToken.deleteMany({ 
    type: 'verification-token',
    email: normalizedEmail 
  });
};
