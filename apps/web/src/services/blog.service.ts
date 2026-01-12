import { API_BASE_URL } from '@/utils/constants';
import { getCached, setCached, clearCache } from '@/utils/cache';

// Populated author data from User model (current user info)
export interface PopulatedAuthor {
  _id: string;
  name?: string;
  avatar?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: string | PopulatedAuthor; // Can be string (ID) or populated object
  authorName: string; // Stored at creation time (fallback)
  authorEmail: string;
  category: string;
  tags: string[];
  images: string[];
  likes: string[];
  comments: Comment[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper to get current author name (populated data takes priority)
export const getAuthorName = (post: BlogPost): string => {
  if (typeof post.author === 'object' && post.author?.name) {
    return post.author.name;
  }
  return post.authorName; // Fallback to stored name
};

// Helper to get current author avatar (from populated data)
export const getAuthorAvatar = (post: BlogPost): string | null => {
  if (typeof post.author === 'object' && post.author?.avatar) {
    return post.author.avatar;
  }
  return null;
};

// Helper to get author ID
export const getAuthorId = (post: BlogPost): string => {
  if (typeof post.author === 'object' && post.author?._id) {
    return post.author._id;
  }
  return post.author as string;
};

export interface Comment {
  _id: string;
  author: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  images?: string[];
  authorName: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  images?: string[];
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const blogService = {
  async getPosts(filters?: {
    category?: string;
    tags?: string[];
    author?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters?.author) params.append('author', filters.author);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const cacheKey = `blog-posts-${params.toString()}`;
    
    // Check cache first (only for GET requests without page filters for now)
    if (!filters?.page || filters.page === 1) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const response = await fetch(`${API_BASE_URL}/blog?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    const data = await response.json();
    
    // Cache the response
    if (!filters?.page || filters.page === 1) {
      setCached(cacheKey, data);
    }
    
    return data;
  },

  async getPostById(id: string): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error('Failed to fetch blog post');
    }
    return response.json();
  },

  async createPost(data: CreatePostData): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to create blog posts');
      }
      if (response.status === 400 && result.details) {
        // Format validation errors
        const errorMessages = Object.entries(result.details)
          .map(([field, errors]: [string, any]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            return `${fieldName}: ${Array.isArray(errors) ? errors.join(', ') : errors}`;
          })
          .join('\n');
        throw new Error(errorMessages || result.message || 'Validation failed');
      }
      if (response.status === 500) {
        // Check for specific error messages
        if (result.error === 'COLLECTION_NOT_FOUND') {
          throw new Error('Blog collection not found. Please create the "blogposts" collection in Azure Portal. See AZURE_COLLECTION_SETUP.md for instructions.');
        }
        if (result.error === 'IMAGE_TOO_LARGE') {
          throw new Error('Image(s) are too large. Please reduce image size or use fewer images.');
        }
      }
      throw new Error(result.message || result.error || 'Failed to create blog post');
    }

    // Clear cache after creating post
    clearCache('blog-posts');
    
    return result;
  },

  async updatePost(id: string, data: UpdatePostData): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You can only edit your own posts');
      }
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(result.message || 'Failed to update blog post');
    }

    // Clear cache after updating post
    clearCache('blog-posts');
    clearCache(`blog-post-${id}`);
    
    return result;
  },

  async deletePost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const result = await response.json();
      if (response.status === 403) {
        throw new Error('You can only delete your own posts');
      }
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(result.message || 'Failed to delete blog post');
    }

    // Clear cache after deleting post
    clearCache('blog-posts');
    clearCache(`blog-post-${id}`);
  },

  async likePost(id: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await fetch(`${API_BASE_URL}/blog/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to like posts');
      }
      throw new Error('Failed to like post');
    }

    const result = await response.json();
    
    // Clear cache after liking post
    clearCache(`blog-post-${id}`);
    
    return result;
  },

  async addComment(postId: string, content: string, authorName: string): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, authorName })
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to comment');
      }
      throw new Error(result.message || 'Failed to add comment');
    }

    // Clear cache after adding comment
    clearCache(`blog-post-${postId}`);
    
    return result;
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blog/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const result = await response.json();
      if (response.status === 403) {
        throw new Error('You can only delete your own comments');
      }
      throw new Error(result.message || 'Failed to delete comment');
    }
  }
};

