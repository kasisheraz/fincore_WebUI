import apiService from './apiService';
import {
  CustomerAnswer,
  CreateCustomerAnswerDTO,
  UpdateCustomerAnswerDTO,
  CustomerAnswerFilters,
  AnswerProgress
} from '../types/customerAnswer.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';

class CustomerAnswerService {
  private readonly BASE_PATH = '/customer-answers';

  /**
   * Get all answers with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<PaginatedResponse<CustomerAnswer>>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get answer by ID
   */
  async getById(id: number): Promise<CustomerAnswer> {
    const response = await apiService.get<CustomerAnswer>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get answers by user ID
   */
  async getByUserId(userId: number, params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<PaginatedResponse<CustomerAnswer>>(`${this.BASE_PATH}/user/${userId}`, { params });
    return response.data;
  }

  /**
   * Submit answer
   */
  async submit(data: CreateCustomerAnswerDTO): Promise<CustomerAnswer> {
    const formData = new FormData();
    formData.append('userId', data.userId.toString());
    formData.append('questionId', data.questionId.toString());
    if (data.answerText) formData.append('answerText', data.answerText);
    if (data.answerFile) formData.append('answerFile', data.answerFile);

    const response = await apiService.getAxiosInstance().post<CustomerAnswer>(this.BASE_PATH, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Update answer
   */
  async update(id: number, data: UpdateCustomerAnswerDTO): Promise<CustomerAnswer> {
    const formData = new FormData();
    if (data.answerText) formData.append('answerText', data.answerText);
    if (data.answerFile) formData.append('answerFile', data.answerFile);

    const response = await apiService.getAxiosInstance().put<CustomerAnswer>(`${this.BASE_PATH}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Delete answer
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get answer progress for user
   */
  async getProgress(userId: number): Promise<AnswerProgress> {
    const response = await apiService.get<AnswerProgress>(`${this.BASE_PATH}/progress/${userId}`);
    return response.data;
  }

  /**
   * Search answers with filters
   */
  async search(filters: CustomerAnswerFilters, params?: PaginationParams): Promise<PaginatedResponse<CustomerAnswer>> {
    const response = await apiService.get<PaginatedResponse<CustomerAnswer>>(`${this.BASE_PATH}/search`, {
      params: { ...filters, ...params }
    });
    return response.data;
  }
}

const customerAnswerService = new CustomerAnswerService();
export default customerAnswerService;
