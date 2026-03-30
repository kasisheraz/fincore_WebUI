// Questionnaire Types

export type QuestionCategory = 'PERSONAL_INFO' | 'FINANCIAL' | 'EMPLOYMENT' | 'IDENTIFICATION' | 'RISK_ASSESSMENT' | 'COMPLIANCE';
export type QuestionStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Question {
  questionId: number;
  questionText: string;
  questionCategory: QuestionCategory;
  displayOrder: number;
  status: QuestionStatus;
  createdBy?: number;
}

export interface CreateQuestionDTO {
  questionText: string;
  questionCategory: QuestionCategory;
  displayOrder: number;
}

export interface UpdateQuestionDTO {
  questionText?: string;
  questionCategory?: QuestionCategory;
  displayOrder?: number;
}

export interface QuestionFilters {
  questionCategory?: QuestionCategory;
  status?: QuestionStatus;
}
