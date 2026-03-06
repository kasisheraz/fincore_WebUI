import apiService from './apiService';
import {
  KYCVerification,
  CreateKYCVerificationDTO,
  UpdateKYCVerificationDTO,
  ApproveVerificationDTO,
  RejectVerificationDTO,
  KYCVerificationFilters,
  VerificationStatus
} from '../types/kycVerification.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';

class KYCVerificationService {
  private readonly BASE_PATH = '/kyc-verifications';

  /**
   * Get all verifications with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<KYCVerification>> {
    const response = await apiService.get<PaginatedResponse<KYCVerification>>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get verification by ID
   */
  async getById(id: number): Promise<KYCVerification> {
    const response = await apiService.get<KYCVerification>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get verification by user ID
   */
  async getByUserId(userId: number): Promise<KYCVerification> {
    const response = await apiService.get<KYCVerification>(`${this.BASE_PATH}/user/${userId}`);
    return response.data;
  }

  /**
   * Create new verification
   */
  async create(data: CreateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.post<KYCVerification>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update verification
   */
  async update(id: number, data: UpdateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.put<KYCVerification>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete verification
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update verification status
   */
  async updateStatus(id: number, status: VerificationStatus): Promise<KYCVerification> {
    const response = await apiService.patch<KYCVerification>(`${this.BASE_PATH}/${id}/status`, { status });
    return response.data;
  }

  /**
   * Approve verification
   */
  async approve(id: number, data: ApproveVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.post<KYCVerification>(`${this.BASE_PATH}/${id}/approve`, data);
    return response.data;
  }

  /**
   * Reject verification
   */
  async reject(id: number, data: RejectVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.post<KYCVerification>(`${this.BASE_PATH}/${id}/reject`, data);
    return response.data;
  }

  /**
   * Search verifications with filters
   */
  async search(filters: KYCVerificationFilters, params?: PaginationParams): Promise<PaginatedResponse<KYCVerification>> {
    const response = await apiService.get<PaginatedResponse<KYCVerification>>(`${this.BASE_PATH}/search`, {
      params: { ...filters, ...params }
    });
    return response.data;
  }
}

const kycVerificationService = new KYCVerificationService();
export default kycVerificationService;
