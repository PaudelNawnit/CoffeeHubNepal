import { API_BASE_URL } from '@/utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export interface Listing {
  _id: string;
  id?: string; // For backward compatibility
  title: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  location: string;
  sellerName: string;
  user?: string; // For backward compatibility
  verified: boolean;
  images: string[];
  createdAt: string;
  sellerId?: string;
  sellerPhone?: string | null;
  active?: boolean;
  sold?: boolean;
}

export interface ProductListResponse {
  products: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const marketplaceService = {
  async getListings(filters?: { category?: string; search?: string; location?: string; page?: number; limit?: number; sellerId?: string }): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sellerId) params.append('sellerId', filters.sellerId);

    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    // Add id and user for backward compatibility
    return {
      ...data,
      products: data.products.map((product: Listing) => ({ 
        ...product, 
        id: product._id,
        user: product.sellerName 
      }))
    };
  },

  async getListing(id: string): Promise<Listing | null> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    const product = await response.json();
    return { ...product, id: product._id, user: product.sellerName };
  },

  async createListing(data: Omit<Listing, '_id' | 'id' | 'createdAt' | 'user' | 'sellerName' | 'verified'>): Promise<Listing> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create listing';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const product = await response.json();
      return { ...product, id: product._id, user: product.sellerName };
    } catch (error: any) {
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error.message || 'Failed to create listing');
    }
  },

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update listing');
    }

    const product = await response.json();
    return { ...product, id: product._id, user: product.sellerName };
  },

  async deleteListing(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete listing');
    }

    return true;
  },

  async markAsSold(id: string): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/sold`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to mark as sold');
    }

    const product = await response.json();
    return { ...product, id: product._id, user: product.sellerName };
  }
};

