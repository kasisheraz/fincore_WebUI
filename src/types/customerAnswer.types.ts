// Customer Answer Types

export interface CustomerAnswer {
  answerId: number;
  userId: number;
  questionId: number;
  answerText: string;
  answeredAt: string;
}

export interface CreateCustomerAnswerDTO {
  userId: number;
  questionId: number;
  answerText: string;
}

export interface UpdateCustomerAnswerDTO {
  userId: number;
  questionId: number;
  answerText: string;
}

export interface CustomerAnswerFilters {
  userId?: number;
  questionId?: number;
}

export interface AnswerProgress {
  userId: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
}
