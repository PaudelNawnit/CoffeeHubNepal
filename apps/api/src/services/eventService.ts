import { Event, EventDocument } from '../models/Event.js';
import mongoose from 'mongoose';
import { escapeRegex } from '../utils/sanitize.js';

export interface CreateEventData {
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  address?: string;
  type: string;
  image?: string;
  organizer: string;
  contact?: string;
  maxAttendees?: number;
  agenda?: string[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  address?: string;
  type?: string;
  image?: string;
  organizer?: string;
  contact?: string;
  maxAttendees?: number;
  agenda?: string[];
}

export const createEvent = async (userId: string, data: CreateEventData): Promise<EventDocument> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const event = new Event({
    ...data,
    date: new Date(data.date),
    createdBy: new mongoose.Types.ObjectId(userId),
    active: true,
    attendees: 0
  });

  return await event.save();
};

export const getEvents = async (filters?: {
  type?: string;
  location?: string;
  page?: number;
  limit?: number;
  createdBy?: string;
  upcoming?: boolean; // Only show future events
}) => {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 20, 50);
  const skip = (page - 1) * limit;

  const query: any = { active: true };

  if (filters?.type) {
    query.type = filters.type;
  }

  if (filters?.location) {
    query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
  }

  if (filters?.createdBy) {
    query.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
  }

  // Filter for upcoming events only (date >= today)
  if (filters?.upcoming !== false) {
    query.date = { $gte: new Date() };
  }

  const [events, total] = await Promise.all([
    Event.find(query)
      .select('title description date time location address type image organizer contact maxAttendees attendees agenda createdBy active createdAt updatedAt')
      .populate('createdBy', 'name avatar')
      .sort({ date: 1 }) // Sort by date ascending (upcoming first)
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(query)
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getEventById = async (id: string): Promise<any> => {
  return await Event.findById(id)
    .select('title description date time location address type image organizer contact maxAttendees attendees agenda createdBy active createdAt updatedAt')
    .populate('createdBy', 'name avatar')
    .lean();
};

export const updateEvent = async (id: string, userId: string, data: UpdateEventData): Promise<any> => {
  const event = await Event.findById(id).lean();
  
  if (!event) {
    throw new Error('EVENT_NOT_FOUND');
  }

  if (event.createdBy.toString() !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  const updated = await Event.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).lean();

  return updated;
};

export const deleteEvent = async (id: string, userId: string): Promise<boolean> => {
  const event = await Event.findById(id).lean();
  
  if (!event) {
    throw new Error('EVENT_NOT_FOUND');
  }

  if (event.createdBy.toString() !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  await Event.findByIdAndUpdate(id, { active: false });
  return true;
};

export const registerForEvent = async (eventId: string, userId: string): Promise<any> => {
  const event = await Event.findById(eventId);
  
  if (!event || !event.active) {
    throw new Error('EVENT_NOT_FOUND');
  }

  // Check if event is in the past
  if (new Date(event.date) < new Date()) {
    throw new Error('EVENT_PAST');
  }

  // Check if max attendees reached
  if (event.maxAttendees && event.attendees >= event.maxAttendees) {
    throw new Error('EVENT_FULL');
  }

  // Increment attendees count
  const updated = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { attendees: 1 } },
    { new: true }
  ).lean();

  return updated;
};
