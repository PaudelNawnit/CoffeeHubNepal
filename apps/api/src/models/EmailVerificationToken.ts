import mongoose, { Document, Schema } from 'mongoose';

export interface EmailVerificationTokenDocument extends Document {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  type: 'verification-token'; // Discriminator to distinguish from OTP documents
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    type: {
      type: String,
      default: 'verification-token',
      required: true
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

// Use the existing 'otp' collection to avoid creating a new collection (Cosmos DB throughput limits)
export const EmailVerificationToken = mongoose.model<EmailVerificationTokenDocument>(
  'EmailVerificationToken',
  emailVerificationTokenSchema,
  'otp' // Use the existing 'otp' collection
);
