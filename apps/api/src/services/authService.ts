import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, UserDocument, UserRole } from '../models/User.js';
import { sendPasswordResetEmail } from './emailService.js';
import { hasVerifiedOTP, cleanupOTP } from './otpService.js';

const SALT_ROUNDS = 10;

const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const isPasswordStrong = (password: string) => passwordStrengthRegex.test(password);

export const hashPassword = async (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

const tokenForUser = (user: UserDocument) =>
  jwt.sign({ 
    sub: user._id.toString(), 
    email: user.email,
    role: user.role || 'farmer'
  }, env.jwtSecret, { expiresIn: '7d' });

const isLocked = (user: UserDocument) => user.lockUntil && user.lockUntil > new Date();

export const signup = async (
  email: string, 
  password: string,
  name?: string,
  role?: string,
  phone?: string,
  location?: string
) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email has verified OTP
  const otpVerified = await hasVerifiedOTP(normalizedEmail);
  if (!otpVerified) {
    throw new Error('OTP_NOT_VERIFIED');
  }
  
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error('EMAIL_IN_USE');
  }
  if (!isPasswordStrong(password)) {
    throw new Error('WEAK_PASSWORD');
  }
  
  // Validate role if provided - admin/moderator can only be assigned via admin panel
  const allowedSignupRoles = ['farmer', 'roaster', 'trader', 'exporter', 'expert'];
  const userRole = role && allowedSignupRoles.includes(role) ? role as UserRole : 'farmer';
  
  const passwordHash = await hashPassword(password);
  const user = await User.create({ 
    email: normalizedEmail, 
    passwordHash,
    name: name || undefined,
    role: userRole,
    phone: phone || undefined,
    location: location || undefined,
    verified: false
  });
  
  // Clean up the OTP after successful signup
  await cleanupOTP(normalizedEmail);
  
  return { token: tokenForUser(user), user };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  if (isLocked(user)) {
    throw new Error('ACCOUNT_LOCKED');
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    user.failedLogins += 1;
    if (user.failedLogins >= env.lockoutThreshold) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + env.lockoutWindowMinutes);
      user.lockUntil = lockUntil;
    }
    await user.save();
    throw new Error('INVALID_CREDENTIALS');
  }

  user.failedLogins = 0;
  user.lockUntil = null;
  await user.save();

  return { token: tokenForUser(user), user };
};

/**
 * Request password reset - generates reset token and sends email
 * Returns success even if email doesn't exist (security best practice)
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Look up user by email
  const user = await User.findOne({ email: normalizedEmail });
  
  // Don't reveal whether user exists - return silently
  if (!user) {
    return;
  }

  // Generate reset token (JWT with 1 hour expiry)
  const resetToken = jwt.sign(
    { 
      sub: user._id.toString(),
      email: user.email,
      type: 'password-reset'
    },
    env.jwtSecret,
    { expiresIn: `${env.resetTokenExpiryHours}h` }
  );

  // Calculate expiry date
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + env.resetTokenExpiryHours);

  // Save reset token to user
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    // Clear reset token if email sending fails
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    throw error;
  }
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // Verify and decode token
  let decoded: { sub: string; email: string; type?: string };
  try {
    decoded = jwt.verify(token, env.jwtSecret) as { sub: string; email: string; type?: string };
    
    // Verify it's a password reset token
    if (decoded.type !== 'password-reset') {
      throw new Error('INVALID_TOKEN_TYPE');
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_TOKEN');
    }
    throw new Error('INVALID_TOKEN');
  }

  // Find user by ID and verify reset token matches
  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Verify reset token matches and hasn't expired
  if (!user.resetToken || user.resetToken !== token) {
    throw new Error('INVALID_TOKEN');
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    // Clear expired token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    throw new Error('TOKEN_EXPIRED');
  }

  // Validate new password strength
  if (!isPasswordStrong(newPassword)) {
    throw new Error('WEAK_PASSWORD');
  }

  // Hash and update password
  user.passwordHash = await hashPassword(newPassword);
  
  // Clear reset token (one-time use)
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  
  // Reset failed logins and lock status
  user.failedLogins = 0;
  user.lockUntil = null;
  
  await user.save();
};
