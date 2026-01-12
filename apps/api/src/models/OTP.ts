import mongoose, { Document, Schema } from 'mongoose';

export interface OTPDocument extends Document {
  email: string;
  otp: string;
  purpose: 'signup' | 'password-reset';
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<OTPDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['signup', 'password-reset'],
      default: 'signup'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster lookups
otpSchema.index({ email: 1, purpose: 1, verified: 1 });

export const OTP = mongoose.model<OTPDocument>('OTP', otpSchema);

