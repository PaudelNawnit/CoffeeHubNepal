import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { logger } from '../utils/logger.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent
} from '../services/eventService.js';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  time: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  type: z.enum(['Festival', 'Workshop', 'Training', 'Conference', 'Other']),
  image: z.string().url().optional().or(z.literal('')),
  organizer: z.string().min(1).max(200),
  contact: z.string().max(100).optional(),
  maxAttendees: z.number().min(1).optional(),
  agenda: z.array(z.string()).optional()
});

const updateEventSchema = createEventSchema.partial();

// Get all events
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type as string | undefined,
      location: req.query.location as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      createdBy: req.query.createdBy as string | undefined,
      upcoming: req.query.upcoming !== 'false' // Default to true
    };

    const result = await getEvents(filters);
    return res.json(result);
  } catch (error) {
    logger.error('Get events error', { error, path: req.path });
    return res.status(500).json({ error: 'FAILED_TO_FETCH_EVENTS' });
  }
});

// Get single event
router.get('/:id', validateObjectId(), async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }
    
    return res.json(event);
  } catch (error) {
    logger.error('Get event error', { error, path: req.path });
    return res.status(500).json({ error: 'FAILED_TO_FETCH_EVENT' });
  }
});

// Create event (auth required)
router.post('/', authenticate, validate(createEventSchema), async (req: AuthRequest, res) => {
  try {
    const event = await createEvent(req.userId!, req.body);
    return res.status(201).json(event);
  } catch (error: any) {
    logger.error('Create event error', { error, path: req.path });
    return res.status(500).json({ 
      error: 'FAILED_TO_CREATE_EVENT',
      message: error.message || 'Failed to create event'
    });
  }
});

// Update event (auth + owner check)
router.put('/:id', validateObjectId(), authenticate, validate(updateEventSchema), async (req: AuthRequest, res) => {
  try {
    const event = await updateEvent(req.params.id, req.userId!, req.body);
    
    if (!event) {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }
    
    return res.json(event);
  } catch (error: any) {
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only edit your own events' });
    }
    logger.error('Update event error', { error, path: req.path });
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_EVENT' });
  }
});

// Delete event (auth + owner check)
router.delete('/:id', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    await deleteEvent(req.params.id, req.userId!);
    return res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only delete your own events' });
    }
    logger.error('Delete event error', { error, path: req.path });
    return res.status(500).json({ error: 'FAILED_TO_DELETE_EVENT' });
  }
});

// Register for event (auth required)
router.post('/:id/register', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    const event = await registerForEvent(req.params.id, req.userId!);
    return res.json({ message: 'Successfully registered for event', event });
  } catch (error: any) {
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'EVENT_NOT_FOUND' });
    }
    if (error.message === 'EVENT_PAST') {
      return res.status(400).json({ error: 'EVENT_PAST', message: 'Cannot register for past events' });
    }
    if (error.message === 'EVENT_FULL') {
      return res.status(400).json({ error: 'EVENT_FULL', message: 'Event is full' });
    }
    logger.error('Register for event error', { error, path: req.path });
    return res.status(500).json({ error: 'FAILED_TO_REGISTER' });
  }
});

export default router;
