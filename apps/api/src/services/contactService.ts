import { Contact, ContactDocument, ContactStatus } from '../models/Contact.js';

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export interface ContactFilters {
  status?: ContactStatus;
  email?: string;
  page?: number;
  limit?: number;
}

export interface UpdateContactData {
  status?: ContactStatus;
  adminNotes?: string;
  assignedTo?: string;
}

/**
 * Create a new contact submission
 */
export const createContact = async (data: CreateContactData): Promise<ContactDocument> => {
  const contact = new Contact({
    docType: 'contact', // Distinguish from blog reports in shared collection
    name: data.name,
    email: data.email,
    phone: data.phone || undefined, // Convert empty string/null to undefined
    subject: data.subject,
    message: data.message,
    status: 'open'
  });
  
  await contact.save();
  console.log(`[Contact] New contact submission from: ${data.email}, subject: ${data.subject}`);
  return contact;
};

/**
 * Get all contacts with filters (admin/moderator only)
 */
export const getContacts = async (filters?: ContactFilters) => {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 20, 50);
  const skip = (page - 1) * limit;

  // Always filter by docType to get only contact submissions from shared collection
  const query: any = { docType: 'contact' };
  
  if (filters?.status) {
    query.status = filters.status;
  }
  
  if (filters?.email) {
    query.email = filters.email;
  }

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Contact.countDocuments(query)
  ]);

  return {
    contacts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a single contact by ID
 */
export const getContactById = async (id: string): Promise<ContactDocument | null> => {
  return Contact.findOne({ _id: id, docType: 'contact' });
};

/**
 * Update contact status and notes (admin/moderator only)
 */
export const updateContact = async (
  id: string,
  data: UpdateContactData,
  userId: string
): Promise<ContactDocument> => {
  const contact = await Contact.findOne({ _id: id, docType: 'contact' });
  
  if (!contact) {
    throw new Error('CONTACT_NOT_FOUND');
  }

  if (data.status) {
    contact.status = data.status;
    
    // If closing, set responded info
    if (data.status === 'closed') {
      contact.respondedAt = new Date();
      contact.respondedBy = userId;
    }
  }
  
  if (data.adminNotes !== undefined) {
    contact.adminNotes = data.adminNotes;
  }
  
  if (data.assignedTo !== undefined) {
    contact.assignedTo = data.assignedTo;
  }

  await contact.save();
  console.log(`[Contact] Contact ${id} updated by ${userId}: status=${contact.status}`);
  return contact;
};

/**
 * Delete a contact (admin only)
 */
export const deleteContact = async (id: string): Promise<void> => {
  const contact = await Contact.findOne({ _id: id, docType: 'contact' });
  
  if (!contact) {
    throw new Error('CONTACT_NOT_FOUND');
  }

  await Contact.deleteOne({ _id: id, docType: 'contact' });
  console.log(`[Contact] Contact ${id} deleted`);
};

/**
 * Get contact stats for admin dashboard
 */
export const getContactStats = async () => {
  const baseQuery = { docType: 'contact' };
  
  const [open, pending, closed, total] = await Promise.all([
    Contact.countDocuments({ ...baseQuery, status: 'open' }),
    Contact.countDocuments({ ...baseQuery, status: 'pending' }),
    Contact.countDocuments({ ...baseQuery, status: 'closed' }),
    Contact.countDocuments(baseQuery)
  ]);

  return { open, pending, closed, total };
};

