import { API_BASE_URL } from '@/utils/constants';

export interface Notice {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  location?: string;
  deadline?: string;
  date: string;
  createdAt: string;
}

type NoticeFilters = {
  type?: string;
  priority?: string;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const parseNoticeMeta = (tags: string[] = []): Pick<Notice, 'type' | 'priority' | 'location' | 'deadline'> => {
  let type: string | undefined;
  let priority: 'High' | 'Medium' | 'Low' | undefined;
  let location: string | undefined;
  let deadline: string | undefined;

  for (const tag of tags) {
    if (tag.startsWith('type:')) {
      type = tag.substring('type:'.length);
    } else if (tag.startsWith('priority:')) {
      const value = tag.substring('priority:'.length) as 'High' | 'Medium' | 'Low';
      if (value === 'High' || value === 'Medium' || value === 'Low') {
        priority = value;
      }
    } else if (tag.startsWith('location:')) {
      location = tag.substring('location:'.length);
    } else if (tag.startsWith('deadline:')) {
      deadline = tag.substring('deadline:'.length);
    }
  }

  return {
    type: type || 'Alert',
    priority: priority || 'Medium',
    location,
    deadline
  };
};

export const noticeService = {
  // Public: fetch notices from BlogPost collection (category=notice)
  async getNotices(filters?: NoticeFilters): Promise<Notice[]> {
    const params = new URLSearchParams();
    params.append('category', 'notice');
    params.append('limit', '50');

    // Optional filtering based on encoded tags
    const tagFilters: string[] = ['notice'];
    if (filters?.type) {
      tagFilters.push(`type:${filters.type}`);
    }
    if (filters?.priority) {
      tagFilters.push(`priority:${filters.priority}`);
    }
    if (tagFilters.length > 0) {
      params.append('tags', tagFilters.join(','));
    }

    const response = await fetch(`${API_BASE_URL}/blog?${params.toString()}`);

    if (!response.ok) {
      console.error('[NoticeService] Failed to fetch notices', response.status);
      return [];
    }

    const result = await response.json();
    const posts = Array.isArray(result.posts) ? result.posts : [];

    return posts.map((post: any) => {
      const meta = parseNoticeMeta(post.tags || []);
      const createdAt = post.createdAt || new Date().toISOString();
      const date = new Date(createdAt).toLocaleDateString();

      return {
        id: post._id?.toString() || String(post.id),
        title: post.title,
        body: post.content,
        type: meta.type,
        priority: meta.priority,
        location: meta.location,
        deadline: meta.deadline,
        date,
        createdAt
      } as Notice;
    });
  },

  // Public: fetch single notice by underlying blog post id
  async getNotice(id: string): Promise<Notice | null> {
    if (!id) return null;

    const response = await fetch(`${API_BASE_URL}/blog/${id}`);
    if (!response.ok) {
      console.error('[NoticeService] Failed to fetch notice', response.status);
      return null;
    }

    const post = await response.json();
    if (!post || post.category !== 'notice') {
      return null;
    }

    const meta = parseNoticeMeta(post.tags || []);
    const createdAt = post.createdAt || new Date().toISOString();
    const date = new Date(createdAt).toLocaleDateString();

    return {
      id: post._id?.toString() || String(post.id),
      title: post.title,
      body: post.content,
      type: meta.type,
      priority: meta.priority,
      location: meta.location,
      deadline: meta.deadline,
      date,
      createdAt
    };
  },

  // Admin/moderator: create a notice via admin API; stored in BlogPost collection
  async createNotice(data: {
    title: string;
    body: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    location?: string;
    deadline?: string;
  }): Promise<Notice> {
    const response = await fetch(`${API_BASE_URL}/admin/notices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    let result: any;
    try {
      result = await response.json();
    } catch (err) {
      console.error('[NoticeService] Failed to parse createNotice response', err);
      throw new Error('Invalid response from server while creating notice');
    }

    if (!response.ok) {
      const message =
        result?.message ||
        (response.status === 401
          ? 'Please log in to create notices'
          : response.status === 403
          ? 'Admin or moderator access required to create notices'
          : 'Failed to create notice');
      throw new Error(message);
    }

    const createdAt = result.createdAt || new Date().toISOString();
    const date = new Date(createdAt).toLocaleDateString();

    return {
      id: result.id?.toString() || '',
      title: result.title,
      body: result.body,
      type: result.type || data.type,
      priority: (result.priority as 'High' | 'Medium' | 'Low') || data.priority,
      location: result.location ?? data.location,
      deadline: result.deadline ?? data.deadline,
      date,
      createdAt
    };
  }
};

