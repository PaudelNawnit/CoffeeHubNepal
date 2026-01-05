export interface Job {
  id: number;
  title: string;
  farm: string;
  location: string;
  pay: string;
  type: string;
  description: string;
  requirements?: string;
  benefits?: string;
  createdAt: string;
}

export const jobService = {
  async getJobs(_filters?: { type?: string; location?: string }) {
    // TODO: Replace with actual API call
    return [];
  },

  async getJob(_id: number) {
    // TODO: Replace with actual API call
    return null;
  },

  async createJob(data: Omit<Job, 'id' | 'createdAt'>) {
    // TODO: Replace with actual API call
    return { id: Date.now(), ...data, createdAt: new Date().toISOString() };
  },

  async applyToJob(_jobId: number) {
    // TODO: Replace with actual API call
    return { success: true, message: 'Application submitted successfully' };
  }
};

