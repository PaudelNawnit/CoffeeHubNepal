import mongoose, { Document, Schema } from 'mongoose';

export interface EventDocument extends Document {
  title: string;
  description: string;
  date: Date;
  time: string; // e.g., "9:00 AM - 6:00 PM"
  location: string;
  address?: string;
  type: string; // 'Festival' | 'Workshop' | 'Training' | 'Conference' | 'Other'
  image?: string;
  organizer: string;
  contact?: string;
  maxAttendees?: number;
  attendees: number; // Count of registered attendees
  agenda?: string[]; // Array of agenda items
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
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
    address: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Festival', 'Workshop', 'Training', 'Conference', 'Other'],
      index: true
    },
    image: {
      type: String,
      trim: true
    },
    organizer: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    maxAttendees: {
      type: Number,
      min: 1
    },
    attendees: {
      type: Number,
      default: 0,
      min: 0
    },
    agenda: {
      type: [String],
      default: []
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
eventSchema.index({ date: 1, active: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ location: 1, type: 1 });
eventSchema.index({ active: 1, date: 1 });

export const Event = mongoose.model<EventDocument>('Event', eventSchema);
