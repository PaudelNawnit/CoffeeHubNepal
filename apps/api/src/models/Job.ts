import mongoose, { Document, Schema } from 'mongoose';

export interface JobDocument extends Document {
  title: string;
  farm: string;
  location: string;
  pay: string;
  type: string; // 'Full-time' | 'Part-time' | 'Seasonal' | 'Contract'
  description: string;
  requirements?: string;
  benefits?: string;
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    farm: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    pay: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Seasonal', 'Contract'],
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    requirements: {
      type: String,
      trim: true
    },
    benefits: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

// Performance indexes
jobSchema.index({ createdAt: -1 });
jobSchema.index({ location: 1, type: 1 });
jobSchema.index({ active: 1, createdAt: -1 });
// Compound index for location + role (type) + active + createdAt (recommended in suggestions)
jobSchema.index({ location: 1, type: 1, active: 1, createdAt: -1 });

export const Job = mongoose.model<JobDocument>('Job', jobSchema);

