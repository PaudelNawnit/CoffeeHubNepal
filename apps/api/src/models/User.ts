import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  role: UserRole;
  phone?: string;
  location?: string;
  avatar?: string; // Base64 image or URL
  verified: boolean;
  roleChangeRequest?: {
    requestedRole: UserRole;
    requestedAt: Date;
    reason?: string;
  };
  failedLogins: number;
  lockUntil?: Date | null;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'],
      default: 'farmer'
    },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    avatar: { type: String }, // Base64 image or URL
    verified: { type: Boolean, default: false },
    roleChangeRequest: {
      requestedRole: { type: String, enum: ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'] },
      requestedAt: { type: Date },
      reason: { type: String }
    },
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

// Performance indexes
userSchema.index({ resetToken: 1 });
// Note: email already has unique index, no need for additional index
userSchema.index({ role: 1, verified: 1 }); // For admin queries
userSchema.index({ createdAt: -1 }); // For sorting

export const User = mongoose.model<UserDocument>('User', userSchema);
