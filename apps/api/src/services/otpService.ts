import crypto from 'crypto';
import { OTP, OTPDocument } from '../models/OTP.js';
import { User } from '../models/User.js';
import { sendOTPEmail } from './emailService.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP for email verification during signup
 */
export const sendSignupOTP = async (email: string): Promise<{ success: boolean; message: string; expiresIn: number }> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email is already registered
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('EMAIL_IN_USE');
  }

  // Check for recent OTP (prevent spam)
  const recentOTP = await OTP.findOne({
    email: normalizedEmail,
    purpose: 'signup',
    createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) }
  });

  if (recentOTP) {
    const waitTime = Math.ceil((recentOTP.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
    throw new Error(`WAIT_${waitTime}_SECONDS`);
  }

  // Delete any existing OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'signup' });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Save OTP to database
  await OTP.create({
    email: normalizedEmail,
    otp,
    purpose: 'signup',
    expiresAt,
    attempts: 0,
    verified: false
  });

  // Send OTP via email
  try {
    await sendOTPEmail(normalizedEmail, otp, OTP_EXPIRY_MINUTES);
    console.log(`[OTP Service] Signup OTP sent to ${normalizedEmail}`);
  } catch (error) {
    // Delete the OTP if email sending fails
    await OTP.deleteOne({ email: normalizedEmail, purpose: 'signup', otp });
    throw new Error('FAILED_TO_SEND_OTP');
  }

  return {
    success: true,
    message: 'OTP sent successfully',
    expiresIn: OTP_EXPIRY_MINUTES * 60
  };
};

/**
 * Verify OTP for signup
 */
export const verifySignupOTP = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Find the OTP record
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    purpose: 'signup',
    verified: false
  });

  if (!otpRecord) {
    throw new Error('OTP_NOT_FOUND');
  }

  // Check if OTP has expired
  if (otpRecord.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error('OTP_EXPIRED');
  }

  // Check max attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error('MAX_ATTEMPTS_EXCEEDED');
  }

  // Increment attempts
  otpRecord.attempts += 1;
  await otpRecord.save();

  // Verify OTP
  if (otpRecord.otp !== otp) {
    const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts;
    if (remainingAttempts <= 0) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new Error('MAX_ATTEMPTS_EXCEEDED');
    }
    throw new Error(`INVALID_OTP_${remainingAttempts}_REMAINING`);
  }

  // Mark as verified
  otpRecord.verified = true;
  await otpRecord.save();

  console.log(`[OTP Service] Signup OTP verified for ${normalizedEmail}`);

  return {
    success: true,
    message: 'OTP verified successfully'
  };
};

/**
 * Check if email has a verified OTP (for completing signup)
 */
export const hasVerifiedOTP = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  const verifiedOTP = await OTP.findOne({
    email: normalizedEmail,
    purpose: 'signup',
    verified: true,
    expiresAt: { $gt: new Date() }
  });

  return !!verifiedOTP;
};

/**
 * Clean up verified OTP after successful signup
 */
export const cleanupOTP = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim();
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'signup' });
};

/**
 * Resend OTP for signup
 */
export const resendSignupOTP = async (email: string): Promise<{ success: boolean; message: string; expiresIn: number }> => {
  return sendSignupOTP(email);
};

