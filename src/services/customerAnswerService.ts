import apiService from './apiService';
import {
  CustomerAnswer,
  CreateCustomerAnswerDTO,
  UpdateCustomerAnswerDTO,
  CustomerAnswerFilters,
  AnswerProgress
} from '../types/customerAnswer.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import { normalizePaginatedResponse } from '../utils/paginationUtils';

class CustomerAnswerService {
  private readonly BASE_PATH = '/v1/answers';

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<CustomerAnswer>(response.data);
  }

  async getById(id: number): Promise<CustomerAnswer> {
    const response = await apiService.get<CustomerAnswer>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getByUserId(userId: number, params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}/user/${userId}`, { params });
    return normalizePaginatedResponse<CustomerAnswer>(response.data);
  }

  async getCompleted(): Promise<CustomerAnswer[]> {
    const response = await apiService.get<CustomerAnswer[]>(`${this.BASE_PATH}/completed`);
    return response.data;
  }

  async getByUserAndQuestion(userId: number, questionId: number): Promise<CustomerAnswer> {
    const response = await apiService.get<CustomerAnswer>(
      `${this.BASE_PATH}/user/${userId}/question/${questionId}`
    );
    return response.data;
  }

  async isAnswered(userId: number, questionId: number): Promise<boolean> {
    const response = await apiService.get<boolean>(`${this.BASE_PATH}/answered`, {
      params: { userId, questionId }
    });
    return response.data;
  }

  async countByUser(userId: number): Promise<number> {
    const response = await apiService.get<number>(`${this.BASE_PATH}/user/${userId}/count`);
    return response.data;
  }

  async getCompletionRate(userId: number, totalQuestions: number): Promise<number> {
    const response = await apiService.get<number>(
      `${this.BASE_PATH}/completion-rate/${totalQuestions}`,
      { params: { userId } }
    );
    return response.data;
  }

  async submit(data: CreateCustomerAnswerDTO): Promise<CustomerAnswer> {
    const response = await apiService.post<CustomerAnswer>(this.BASE_PATH, data);
    return response.data;
  }

  async update(id: number, data: UpdateCustomerAnswerDTO): Promise<CustomerAnswer> {
    const response = await apiService.put<CustomerAnswer>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async deleteAllForUser(userId: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/user/${userId}`);
  }

  async getProgress(userId: number): Promise<AnswerProgress> {
    const response = await apiService.get<AnswerProgress>(`${this.BASE_PATH}/progress/${userId}`);
    return response.data;
  }

  async search(filters: CustomerAnswerFilters, params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}`, {
      params: { ...filters, ...params }
    });
    return normalizePaginatedResponse<CustomerAnswer>(response.data);
  }
}

const customerAnswerService = new CustomerAnswerService();
export default customerAnswerService;
