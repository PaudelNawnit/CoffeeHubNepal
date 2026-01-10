import { API_BASE_URL } from '@/utils/constants';

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'closed';
  adminNotes?: string;
  assignedTo?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContactStats {
  open: number;
  pending: number;
  closed: number;
  total: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const contactService = {
  // Submit a contact form (public)
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send message');
    }

    return result;
  },

  // Get all contacts (admin/moderator)
  async getContacts(filters?: {
    status?: 'open' | 'pending' | 'closed';
    email?: string;
    page?: number;
    limit?: number;
  }): Promise<ContactListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/contacts?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch contacts');
    }

    return response.json();
  },

  // Get contact stats (admin/moderator)
  async getContactStats(): Promise<ContactStats> {
    const response = await fetch(`${API_BASE_URL}/contacts/stats`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact stats');
    }

    return response.json();
  },

  // Get single contact (admin/moderator)
  async getContact(id: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contact not found');
      }
      throw new Error('Failed to fetch contact');
    }

    return response.json();
  },

  // Update contact (admin/moderator)
  async updateContact(id: string, data: {
    status?: 'open' | 'pending' | 'closed';
    adminNotes?: string;
    assignedTo?: string;
  }): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update contact');
    }

    return result;
  },

  // Delete contact (admin/moderator)
  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Failed to delete contact');
    }
  }
};

