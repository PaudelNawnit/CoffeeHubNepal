export interface Notice {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  location?: string;
  deadline?: string;
  date: string;
  createdAt: string;
}

export const noticeService = {
  async getNotices(_filters?: { type?: string; priority?: string }) {
    // TODO: Replace with actual API call
    return [];
  },

  async getNotice(_id: number) {
    // TODO: Replace with actual API call
    return null;
  },

  async createNotice(data: Omit<Notice, 'id' | 'createdAt' | 'date'>) {
    // TODO: Replace with actual API call
    return { id: Date.now(), ...data, date: new Date().toLocaleDateString(), createdAt: new Date().toISOString() };
  }
};

