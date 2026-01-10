import { API_BASE_URL } from '@/utils/constants';

export interface User {
  _id: string;
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator';
  phone?: string;
  location?: string;
  verified: boolean;
  roleChangeRequest?: {
    requestedRole: string;
    requestedAt: string;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  pendingRoleChanges: number;
  roleDistribution: Record<string, number>;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const adminService = {
  async getAllUsers(filters?: {
    role?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to access admin panel');
      }
      if (response.status === 403) {
        throw new Error('Admin or moderator access required');
      }
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  async updateUserRole(userId: string, newRole: string): Promise<User> {
    console.log(`[Admin Service] Updating user ${userId} role to ${newRole}`);
    
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole })
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('[Admin Service] Failed to parse response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error(`[Admin Service] Update role failed (${response.status}):`, result);
      if (response.status === 403) {
        throw new Error(result.message || 'Admin access required to change user roles');
      }
      if (response.status === 404) {
        throw new Error(result.message || 'User not found');
      }
      if (response.status === 400) {
        throw new Error(result.message || 'Invalid role specified');
      }
      throw new Error(result.message || result.error || 'Failed to update user role');
    }

    console.log(`[Admin Service] Role updated successfully:`, result);
    return result;
  },

  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Invalid or expired token. Please log in again.');
      }
      throw new Error('Failed to fetch admin statistics');
    }

    return response.json();
  },

  async getPendingVerifications(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/pending-verifications`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending verifications');
    }

    return response.json();
  },

  async getPendingRoleChangeRequests(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/pending-role-changes`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending role change requests');
    }

    return response.json();
  },

  async verifyUser(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('[Admin Service] Failed to parse response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error(`[Admin Service] Verify user failed (${response.status}):`, result);
      if (response.status === 404) {
        throw new Error(result.message || 'User not found');
      }
      if (response.status === 403) {
        throw new Error(result.message || 'Admin or moderator access required');
      }
      throw new Error(result.message || result.error || 'Failed to verify user');
    }

    console.log(`[Admin Service] User verified successfully:`, result);
    return result;
  },

  async rejectVerification(userId: string, reason?: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject-verification`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('[Admin Service] Failed to parse response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error(`[Admin Service] Reject verification failed (${response.status}):`, result);
      if (response.status === 404) {
        throw new Error(result.message || 'User not found');
      }
      if (response.status === 403) {
        throw new Error(result.message || 'Admin or moderator access required');
      }
      throw new Error(result.message || result.error || 'Failed to reject verification');
    }

    console.log(`[Admin Service] Verification rejected:`, result);
    return result;
  },

  async getReports(filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/admin/reports?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    return response.json();
  },

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update report status');
    }

    return response.json();
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error('Failed to delete user');
      }
      
      if (response.status === 404) {
        throw new Error(result.message || 'User not found');
      }
      if (response.status === 400) {
        throw new Error(result.message || 'Cannot delete this user');
      }
      if (response.status === 403) {
        throw new Error(result.message || 'Admin access required');
      }
      throw new Error(result.message || result.error || 'Failed to delete user');
    }
  }
};

