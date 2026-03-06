// Questionnaire Types

export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'DATE' | 'NUMBER' | 'FILE';
export type QuestionStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface Question {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
  status: QuestionStatus;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDTO {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
  category?: string;
  description?: string;
  status?: QuestionStatus;
}

export interface UpdateQuestionDTO {
  questionText?: string;
  questionType?: QuestionType;
  options?: string[];
  isRequired?: boolean;
  orderIndex?: number;
  status?: QuestionStatus;
  category?: string;
  description?: string;
}

export interface QuestionFilters {
  questionType?: QuestionType;
  status?: QuestionStatus;
  category?: string;
  isRequired?: boolean;
}
