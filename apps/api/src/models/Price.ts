import mongoose, { Document, Schema } from 'mongoose';

export type PriceTrend = 'up' | 'down' | 'stable';

export interface PriceDocument extends Document {
  variety: string; // e.g., "Arabica Cherry", "Robusta Parchment"
  price: number; // Price per kg in NPR
  previousPrice?: number; // Previous price for calculating change
  change?: string; // Percentage change, e.g., "+2.5%"
  trend: PriceTrend;
  image?: string; // Image URL (base64 or external URL)
  updatedBy: mongoose.Types.ObjectId; // Moderator who updated
  updatedByName: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const priceSchema = new Schema<PriceDocument>(
  {
    variety: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    previousPrice: {
      type: Number,
      min: 0
    },
    change: {
      type: String,
      trim: true
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
      index: true
    },
    image: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedByName: {
      type: String,
      required: true,
      trim: true
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
priceSchema.index({ active: 1, createdAt: -1 });
// Note: variety already has unique index, no need for additional index

export const Price = mongoose.model<PriceDocument>('Price', priceSchema);

