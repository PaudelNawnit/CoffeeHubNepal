import mongoose, { Schema, Document } from 'mongoose';

export type ContactStatus = 'open' | 'pending' | 'closed';

export interface ContactDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  adminNotes?: string;
  assignedTo?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['open', 'pending', 'closed'], 
      default: 'open' 
    },
    adminNotes: { type: String },
    assignedTo: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: String }
  },
  { timestamps: true }
);

// Note: Indexes are managed in Azure Cosmos DB portal, not in code
// contactSchema.index({ status: 1, createdAt: -1 });
// contactSchema.index({ email: 1 });
// contactSchema.index({ createdAt: -1 });

export const Contact = mongoose.model<ContactDocument>('Contact', contactSchema);

