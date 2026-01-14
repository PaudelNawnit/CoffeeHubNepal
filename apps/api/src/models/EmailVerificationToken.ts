import mongoose, { Document, Schema } from 'mongoose';

export interface EmailVerificationTokenDocument extends Document {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Auto-delete expired tokens
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster lookups
emailVerificationTokenSchema.index({ email: 1, expiresAt: 1 });

export const EmailVerificationToken = mongoose.model<EmailVerificationTokenDocument>(
  'EmailVerificationToken',
  emailVerificationTokenSchema
);
