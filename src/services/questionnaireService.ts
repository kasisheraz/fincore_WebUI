import apiService from './apiService';
import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionFilters,
  QuestionStatus
} from '../types/questionnaire.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';

class QuestionnaireService {
  private readonly BASE_PATH = '/questions';

  /**
   * Get all questions with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Question>> {
    const response = await apiService.get<PaginatedResponse<Question>>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get question by ID
   */
  async getById(id: number): Promise<Question> {
    const response = await apiService.get<Question>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create new question
   */
  async create(data: CreateQuestionDTO): Promise<Question> {
    const response = await apiService.post<Question>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update question
   */
  async update(id: number, data: UpdateQuestionDTO): Promise<Question> {
    const response = await apiService.put<Question>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete question
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Activate question
   */
  async activate(id: number): Promise<Question> {
    const response = await apiService.patch<Question>(`${this.BASE_PATH}/${id}/activate`);
    return response.data;
  }

  /**
   * Deactivate question
   */
  async deactivate(id: number): Promise<Question> {
    const response = await apiService.patch<Question>(`${this.BASE_PATH}/${id}/deactivate`);
    return response.data;
  }

  /**
   * Search questions with filters
   */
  async search(filters: QuestionFilters, params?: PaginationParams): Promise<PaginatedResponse<Question>> {
    const response = await apiService.get<PaginatedResponse<Question>>(`${this.BASE_PATH}/search`, {
      params: { ...filters, ...params }
    });
    return response.data;
  }
}

const questionnaireService = new QuestionnaireService();
export default questionnaireService;
