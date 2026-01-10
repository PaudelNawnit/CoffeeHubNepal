import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User, UserDocument, UserRole } from '../models/User.js';
import { sendPasswordResetEmail } from './emailService.js';

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
  }, env.jwtSecret, { expiresIn: '2h' });

const isLocked = (user: UserDocument) => user.lockUntil && user.lockUntil > new Date();

export const signup = async (
  email: string, 
  password: string,
  name?: string,
  role?: string,
  phone?: string,
  location?: string
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('EMAIL_IN_USE');
  }
  if (!isPasswordStrong(password)) {
    throw new Error('WEAK_PASSWORD');
  }
  
  // Validate role if provided
  const validRoles = ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'];
  const userRole = role && validRoles.includes(role) ? role as UserRole : 'farmer';
  
  const passwordHash = await hashPassword(password);
  const user = await User.create({ 
    email, 
    passwordHash,
    name: name || undefined,
    role: userRole,
    phone: phone || undefined,
    location: location || undefined,
    verified: false
  });
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
  console.log(`[Auth Service] ===== Password Reset Request =====`);
  console.log(`[Auth Service] Input email: "${email}"`);
  console.log(`[Auth Service] Normalized email: "${normalizedEmail}"`);
  console.log(`[Auth Service] Looking up user in database...`);
  
  // Try multiple query approaches to debug
  let user = await User.findOne({ email: normalizedEmail });
  
  // If not found, try exact match without normalization
  if (!user) {
    console.log(`[Auth Service] User not found with normalized email. Trying exact match...`);
    const userExact = await User.findOne({ email: email });
    if (userExact) {
      console.log(`[Auth Service] Found user with exact email (not normalized): ${userExact.email}`);
      user = userExact; // Use the exact match user
    } else {
      // Still not found - log debug info
      console.log(`[Auth Service] User not found with exact email either.`);
      
      // Debug: Check if any similar emails exist (for troubleshooting)
      const similarUsers = await User.find({ 
        email: { $regex: normalizedEmail.split('@')[0], $options: 'i' } 
      }).limit(5).select('email');
      if (similarUsers.length > 0) {
        console.log(`[Auth Service] Found similar emails in database:`, similarUsers.map(u => u.email));
      }
      
      // Try to find by partial match
      const allUsers = await User.find({}).limit(10).select('email');
      console.log(`[Auth Service] Sample emails in database:`, allUsers.map(u => u.email));
      
      // Debug: Check database connection and collection
      console.log(`[Auth Service] Database name: ${mongoose.connection.db?.databaseName}`);
      console.log(`[Auth Service] Collection name: ${User.collection.name}`);
      console.log(`[Auth Service] MongoDB connection state: ${mongoose.connection.readyState} (1=connected)`);
      
      // Try finding by ObjectId if we have the ID from the database
      try {
        console.log(`[Auth Service] Attempting to find user by ObjectId: 695e4b4e77ec7a99ba77310a`);
        const userById = await User.findById('695e4b4e77ec7a99ba77310a');
        if (userById) {
          console.log(`[Auth Service] ✓ Found user by ID: ${userById.email}`);
          console.log(`[Auth Service] User email in DB: "${userById.email}"`);
          console.log(`[Auth Service] Email comparison: "${userById.email}" === "${normalizedEmail}" = ${userById.email === normalizedEmail}`);
          console.log(`[Auth Service] Email length comparison: ${userById.email.length} === ${normalizedEmail.length} = ${userById.email.length === normalizedEmail.length}`);
          // If found by ID, use this user
          user = userById;
        } else {
          console.log(`[Auth Service] User not found by ID - this confirms we're in the wrong database`);
          console.log(`[Auth Service] Current database: ${mongoose.connection.db?.databaseName}`);
          console.log(`[Auth Service] Expected database: coffeehubnepal`);
          console.log(`[Auth Service] ⚠️  FIX: Add /coffeehubnepal to your MONGO_URI in .env file`);
          console.log(`[Auth Service] Current format: mongodb://...@...:10255/?ssl=...`);
          console.log(`[Auth Service] Should be: mongodb://...@...:10255/coffeehubnepal?ssl=...`);
        }
      } catch (idError) {
        console.error(`[Auth Service] Error finding user by ID:`, idError);
      }
      
      console.log(`[Auth Service] Password reset requested for non-existent email: ${email}`);
      return;
    }
  }
  
  if (!user) {
    console.log(`[Auth Service] User still not found after all attempts`);
    return;
  }
  
  console.log(`[Auth Service] ✓ User found: ${user.email} (ID: ${user._id.toString()})`);

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
    console.log(`[Auth Service] Calling sendPasswordResetEmail for ${user.email}`);
    await sendPasswordResetEmail(user.email, resetToken);
    console.log(`[Auth Service] Password reset email sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`[Auth Service] Error sending password reset email to ${user.email}:`, error);
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
  
  console.log(`[Auth Service] Password reset successful for ${user.email}`);
};
