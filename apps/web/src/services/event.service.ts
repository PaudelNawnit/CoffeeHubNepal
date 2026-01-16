import { API_BASE_URL } from '@/utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export interface Event {
  _id: string;
  id?: string; // For backward compatibility
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  address?: string;
  type: 'Festival' | 'Workshop' | 'Training' | 'Conference' | 'Other';
  image?: string;
  organizer: string;
  contact?: string;
  maxAttendees?: number;
  attendees: number;
  agenda?: string[];
  createdBy?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const eventService = {
  async getEvents(filters?: {
    type?: string;
    location?: string;
    page?: number;
    limit?: number;
    upcoming?: boolean;
  }): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString());

    const response = await fetch(`${API_BASE_URL}/events?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return {
      ...data,
      events: data.events.map((event: Event) => ({ ...event, id: event._id }))
    };
  },

  async getEvent(id: string): Promise<Event | null> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch event');
    }
    const event = await response.json();
    return { ...event, id: event._id };
  },

  async createEvent(data: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    address?: string;
    type: string;
    image?: string;
    organizer: string;
    contact?: string;
    maxAttendees?: number;
    agenda?: string[];
  }): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    const event = await response.json();
    return { ...event, id: event._id };
  },

  async updateEvent(id: string, data: Partial<{
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    address?: string;
    type: string;
    image?: string;
    organizer: string;
    contact?: string;
    maxAttendees?: number;
    agenda?: string[];
  }>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    const event = await response.json();
    return { ...event, id: event._id };
  },

  async deleteEvent(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    return true;
  },

  async registerForEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register for event');
    }

    const data = await response.json();
    return { ...data.event, id: data.event._id };
  }
};
