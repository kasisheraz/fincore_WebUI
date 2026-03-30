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
import { normalizePaginatedResponse } from '../utils/paginationUtils';

class KYCVerificationService {
  private readonly BASE_PATH = '/v1/kyc-verification';

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<KYCVerification>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<KYCVerification>(response.data);
  }

  async getById(id: number): Promise<KYCVerification> {
    const response = await apiService.get<KYCVerification>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getByUserId(userId: number): Promise<KYCVerification> {
    const response = await apiService.get<KYCVerification>(`${this.BASE_PATH}/user/${userId}`);
    return response.data;
  }

  async getExpired(): Promise<KYCVerification[]> {
    const response = await apiService.get<KYCVerification[]>(`${this.BASE_PATH}/expired`);
    return response.data;
  }

  async getByStatus(status: VerificationStatus): Promise<KYCVerification[]> {
    const response = await apiService.get<KYCVerification[]>(`${this.BASE_PATH}/status/${status}`);
    return response.data;
  }

  async countByStatus(status: VerificationStatus): Promise<number> {
    const response = await apiService.get<number>(`${this.BASE_PATH}/count/${status}`);
    return response.data;
  }

  async isApproved(userId: number): Promise<boolean> {
    const response = await apiService.get<boolean>(`${this.BASE_PATH}/approved/${userId}`);
    return response.data;
  }

  async submit(data: CreateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.post<KYCVerification>(`${this.BASE_PATH}/submit`, data);
    return response.data;
  }

  async create(data: CreateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.post<KYCVerification>(`${this.BASE_PATH}/submit`, data);
    return response.data;
  }

  async update(id: number, data: UpdateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.put<KYCVerification>(`${this.BASE_PATH}/${id}/status`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async updateStatus(id: number, data: UpdateKYCVerificationDTO): Promise<KYCVerification> {
    const response = await apiService.put<KYCVerification>(`${this.BASE_PATH}/${id}/status`, data);
    return response.data;
  }

  async approve(id: number, data: ApproveVerificationDTO): Promise<KYCVerification> {
    const updateData: UpdateKYCVerificationDTO = {
      status: 'APPROVED',
      riskLevel: data.riskLevel,
      approvalReason: data.approvalReason,
      reviewerComments: data.reviewerComments,
    };
    const response = await apiService.put<KYCVerification>(`${this.BASE_PATH}/${id}/status`, updateData);
    return response.data;
  }

  async reject(id: number, data: RejectVerificationDTO): Promise<KYCVerification> {
    const updateData: UpdateKYCVerificationDTO = {
      status: 'REJECTED',
      reviewerComments: data.reviewerComments,
      approvalReason: data.approvalReason,
    };
    const response = await apiService.put<KYCVerification>(`${this.BASE_PATH}/${id}/status`, updateData);
    return response.data;
  }

  async search(filters: KYCVerificationFilters, params?: PaginationParams): Promise<PaginatedResponse<KYCVerification>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}`, {
      params: { ...filters, ...params }
    });
    return normalizePaginatedResponse<KYCVerification>(response.data);
  }
}

const kycVerificationService = new KYCVerificationService();
export default kycVerificationService;
