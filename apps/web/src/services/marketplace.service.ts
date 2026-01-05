export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  location: string;
  user: string;
  verified: boolean;
  images: string[];
  createdAt: string;
}

export const marketplaceService = {
  async getListings(_filters?: { category?: string; search?: string; location?: string }) {
    // TODO: Replace with actual API call
    return [];
  },

  async getListing(_id: number) {
    // TODO: Replace with actual API call
    return null;
  },

  async createListing(data: Omit<Listing, 'id' | 'createdAt'>) {
    // TODO: Replace with actual API call
    return { id: Date.now(), ...data, createdAt: new Date().toISOString() };
  },

  async updateListing(id: number, data: Partial<Listing>) {
    // TODO: Replace with actual API call
    return { id, ...data };
  },

  async deleteListing(_id: number) {
    // TODO: Replace with actual API call
    return true;
  }
};

