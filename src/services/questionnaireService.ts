import apiService from './apiService';
import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionFilters,
  QuestionCategory,
} from '../types/questionnaire.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import { normalizePaginatedResponse } from '../utils/paginationUtils';

class QuestionnaireService {
  private readonly BASE_PATH = '/v1/questions';

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Question>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<Question>(response.data);
  }

  async getById(id: number): Promise<Question> {
    const response = await apiService.get<Question>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getActive(): Promise<Question[]> {
    const response = await apiService.get<Question[]>(`${this.BASE_PATH}/active`);
    return response.data;
  }

  async getByCategory(category: QuestionCategory): Promise<Question[]> {
    const response = await apiService.get<Question[]>(`${this.BASE_PATH}/category/${category}`);
    return response.data;
  }

  async countActive(): Promise<number> {
    const response = await apiService.get<number>(`${this.BASE_PATH}/active/count`);
    return response.data;
  }

  async create(data: CreateQuestionDTO): Promise<Question> {
    const response = await apiService.post<Question>(this.BASE_PATH, data);
    return response.data;
  }

  async update(id: number, data: UpdateQuestionDTO): Promise<Question> {
    const response = await apiService.put<Question>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async activate(id: number): Promise<Question> {
    const response = await apiService.patch<Question>(`${this.BASE_PATH}/${id}/activate`);
    return response.data;
  }

  async inactivate(id: number): Promise<Question> {
    const response = await apiService.patch<Question>(`${this.BASE_PATH}/${id}/inactivate`);
    return response.data;
  }

  async search(filters: QuestionFilters, params?: PaginationParams): Promise<PaginatedResponse<Question>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}`, {
      params: { ...filters, ...params }
    });
    return normalizePaginatedResponse<Question>(response.data);
  }
}

const questionnaireService = new QuestionnaireService();
export default questionnaireService;
