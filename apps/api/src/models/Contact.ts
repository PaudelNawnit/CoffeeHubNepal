import mongoose, { Schema, Document } from 'mongoose';

export type ContactStatus = 'open' | 'pending' | 'closed';

export interface ContactDocument extends Document {
  docType: 'contact';
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
    docType: { type: String, default: 'contact', required: true },
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

// Use the existing 'reports' collection to avoid exceeding Cosmos DB throughput limits
export const Contact = mongoose.model<ContactDocument>('Contact', contactSchema, 'reports');

