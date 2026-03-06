// Customer Answer Types

export interface CustomerAnswer {
  id: number;
  userId: number;
  userName?: string;
  questionId: number;
  questionText?: string;
  answerText?: string;
  answerFile?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface CreateCustomerAnswerDTO {
  userId: number;
  questionId: number;
  answerText?: string;
  answerFile?: File;
}

export interface UpdateCustomerAnswerDTO {
  answerText?: string;
  answerFile?: File;
}

export interface CustomerAnswerFilters {
  userId?: number;
  questionId?: number;
  submittedDateFrom?: string;
  submittedDateTo?: string;
}

export interface AnswerProgress {
  userId: number;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
}
