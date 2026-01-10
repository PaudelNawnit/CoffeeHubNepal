import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdminOrModerator } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats
} from '../services/contactService.js';

const router = Router();

// Schema for creating a contact
const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(5, 'Message must be at least 5 characters').max(5000)
});

// Schema for updating a contact
const updateContactSchema = z.object({
  status: z.enum(['open', 'pending', 'closed']).optional(),
  adminNotes: z.string().max(2000).optional(),
  assignedTo: z.string().optional()
});

// Create a new contact submission (public)
router.post('/', validate(createContactSchema), async (req, res) => {
  try {
    const contact = await createContact(req.body);
    return res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      id: contact._id.toString()
    });
  } catch (error: any) {
    console.error('Create contact error:', error);
    return res.status(500).json({ 
      error: 'FAILED_TO_CREATE_CONTACT', 
      message: 'Failed to send message. Please try again.' 
    });
  }
});

// Get all contacts (admin/moderator only)
router.get('/', authenticate, requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const filters = {
      status: req.query.status as 'open' | 'pending' | 'closed' | undefined,
      email: req.query.email as string | undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };
    
    const result = await getContacts(filters);
    return res.json(result);
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_CONTACTS' });
  }
});

// Get contact stats (admin/moderator only)
router.get('/stats', authenticate, requireAdminOrModerator, async (req: AuthRequest, res) => {
  try {
    const stats = await getContactStats();
    return res.json(stats);
  } catch (error: any) {
    console.error('Get contact stats error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_STATS' });
  }
});

// Get a single contact (admin/moderator only)
router.get('/:id', authenticate, requireAdminOrModerator, validateObjectId, async (req: AuthRequest, res: Response) => {
  try {
    const contact = await getContactById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'CONTACT_NOT_FOUND', message: 'Contact not found' });
    }
    
    return res.json(contact);
  } catch (error: any) {
    console.error('Get contact error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_CONTACT' });
  }
});

// Update a contact (admin/moderator only)
router.put('/:id', authenticate, requireAdminOrModerator, validateObjectId, validate(updateContactSchema), async (req: AuthRequest, res: Response) => {
  try {
    const contact = await updateContact(req.params.id, req.body, req.userId!);
    return res.json({
      _id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
      adminNotes: contact.adminNotes,
      assignedTo: contact.assignedTo,
      respondedAt: contact.respondedAt,
      respondedBy: contact.respondedBy,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    });
  } catch (error: any) {
    const err = error.message;
    console.error('Update contact error:', error);
    
    if (err === 'CONTACT_NOT_FOUND') {
      return res.status(404).json({ error: 'CONTACT_NOT_FOUND', message: 'Contact not found' });
    }
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_CONTACT', message: err });
  }
});

// Delete a contact (admin only)
router.delete('/:id', authenticate, requireAdminOrModerator, validateObjectId, async (req: AuthRequest, res: Response) => {
  try {
    await deleteContact(req.params.id);
    return res.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    const err = error.message;
    console.error('Delete contact error:', error);
    
    if (err === 'CONTACT_NOT_FOUND') {
      return res.status(404).json({ error: 'CONTACT_NOT_FOUND', message: 'Contact not found' });
    }
    return res.status(500).json({ error: 'FAILED_TO_DELETE_CONTACT', message: err });
  }
});

export default router;

