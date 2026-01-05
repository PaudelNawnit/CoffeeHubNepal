export interface Question {
  id: number;
  title: string;
  description: string;
  author: string;
  tags: string[];
  category: string;
  answers: number;
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  content: string;
  author: string;
  verified: boolean;
  isExpert: boolean;
  upvotes: number;
  createdAt: string;
}

export const qnaService = {
  async getQuestions(_filters?: { category?: string; search?: string }) {
    // TODO: Replace with actual API call
    return [];
  },

  async getQuestion(_id: number) {
    // TODO: Replace with actual API call
    return null;
  },

  async createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'answers'>) {
    // TODO: Replace with actual API call
    return { id: Date.now(), ...data, answers: 0, createdAt: new Date().toISOString() };
  },

  async getAnswers(_questionId: number) {
    // TODO: Replace with actual API call
    return [];
  },

  async createAnswer(questionId: number, content: string) {
    // TODO: Replace with actual API call
    return { id: Date.now(), questionId, content, author: 'Current User', verified: false, isExpert: false, upvotes: 0, createdAt: new Date().toISOString() };
  }
};

