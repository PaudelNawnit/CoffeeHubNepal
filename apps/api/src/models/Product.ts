import mongoose, { Document, Schema } from 'mongoose';

export interface ProductDocument extends Document {
  title: string;
  description: string;
  price: number;
  unit: string; // 'kg', 'pc', 'bag', etc.
  quantity: number;
  location: string;
  category: string; // 'Arabica', 'Robusta', 'Gear', 'Equipment', etc.
  images: string[];
  sellerId: mongoose.Types.ObjectId;
  sellerName: string;
  sellerEmail: string;
  verified: boolean; // Seller verification status
  active: boolean;
  sold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
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
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: 'kg'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    images: {
      type: [String],
      default: []
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sellerName: {
      type: String,
      required: true,
      trim: true
    },
    sellerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    verified: {
      type: Boolean,
      default: false,
      index: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    sold: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Performance indexes
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, active: 1, createdAt: -1 });
productSchema.index({ location: 1, category: 1 });
productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ active: 1, sold: 1, createdAt: -1 });
// Compound index for location + category + active + price (recommended in suggestions)
productSchema.index({ location: 1, category: 1, active: 1, price: 1 });

export const Product = mongoose.model<ProductDocument>('Product', productSchema);

