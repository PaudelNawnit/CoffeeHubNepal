import mongoose from 'mongoose';
import { User, UserDocument, UserRole } from '../models/User.js';
import { escapeRegex } from '../utils/sanitize.js';

export interface UserFilters {
  role?: UserRole;
  verified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllUsers = async (filters?: UserFilters) => {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 20, 50);
  const skip = (page - 1) * limit;

  const query: any = {};
  
  if (filters?.role) {
    query.role = filters.role;
  }
  
  if (filters?.verified !== undefined) {
    query.verified = filters.verified;
  }
  
  if (filters?.search) {
    const safeSearch = escapeRegex(filters.search);
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash -failedLogins -lockUntil')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  const user = await User.findById(id).select('-passwordHash -failedLogins -lockUntil');
  return user;
};

export const updateUserRole = async (
  userId: string,
  newRole: UserRole,
  adminId: string
): Promise<UserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const validRoles: UserRole[] = ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'];
  if (!validRoles.includes(newRole)) {
    throw new Error('INVALID_ROLE');
  }

  // Don't update if role is the same
  if (user.role === newRole) {
    return user;
  }

  // Clear role change request if it exists
  if (user.roleChangeRequest) {
    user.roleChangeRequest = undefined;
  }

  // Update the role
  user.role = newRole;
  
  // Save and verify the change was persisted
  const savedUser = await user.save();
  
  // Verify the save was successful
  if (savedUser.role !== newRole) {
    throw new Error('FAILED_TO_UPDATE_ROLE');
  }

  console.log(`[Admin] User role updated: ${user.email} (${userId}) from ${user.role} to ${newRole} by admin ${adminId}`);
  
  return savedUser;
};

/**
 * Delete a user (admin only)
 * Cannot delete admin users or self
 */
export const deleteUser = async (
  userId: string,
  adminId: string
): Promise<void> => {
  // Prevent self-deletion
  if (userId === adminId) {
    throw new Error('CANNOT_DELETE_SELF');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Prevent deletion of admin users (extra safety)
  if (user.role === 'admin') {
    throw new Error('CANNOT_DELETE_ADMIN');
  }

  await User.findByIdAndDelete(userId);
  console.log(`[Admin] User deleted: ${user.email} (${userId}) by admin ${adminId}`);
};

export const getPendingVerifications = async () => {
  // Return users with verified: false, null, or undefined (not verified)
  // This ensures we catch all unverified users regardless of how the field was set
  const users = await User.find({
    $or: [
      { verified: false },
      { verified: { $exists: false } },
      { verified: null }
    ]
  })
    .select('-passwordHash -failedLogins -lockUntil')
    .sort({ createdAt: -1 })
    .lean();

  return users;
};

export const verifyUser = async (
  userId: string,
  adminId: string
): Promise<UserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.verified) {
    return user; // Already verified
  }

  user.verified = true;
  const savedUser = await user.save();

  console.log(`[Admin] User verified: ${user.email} (${userId}) by admin ${adminId}`);
  
  return savedUser;
};

export const rejectVerification = async (
  userId: string,
  adminId: string,
  reason?: string
): Promise<UserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // For rejection, we could either:
  // 1. Keep verified: false (do nothing)
  // 2. Add a rejection reason field
  // For now, we'll just log it
  console.log(`[Admin] Verification rejected for user: ${user.email} (${userId}) by admin ${adminId}. Reason: ${reason || 'No reason provided'}`);
  
  return user;
};

export const getPendingRoleChangeRequests = async () => {
  const users = await User.find({ roleChangeRequest: { $exists: true } })
    .select('-passwordHash -failedLogins -lockUntil')
    .sort({ 'roleChangeRequest.requestedAt': -1 })
    .lean();

  return users;
};

export const getUserStats = async () => {
  const [totalUsers, verifiedUsers, pendingVerifications, pendingRoleChanges] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ verified: true }),
    User.countDocuments({
      $or: [
        { verified: false },
        { verified: { $exists: false } },
        { verified: null }
      ]
    }),
    User.countDocuments({ roleChangeRequest: { $exists: true } })
  ]);

  // Count users by role
  const roleCounts = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const roleDistribution: Record<string, number> = {};
  roleCounts.forEach((item: { _id: string; count: number }) => {
    roleDistribution[item._id] = item.count;
  });

  return {
    totalUsers,
    verifiedUsers,
    pendingVerifications,
    pendingRoleChanges,
    roleDistribution
  };
};

