import apiService from './apiService';
import {
  Beneficiary,
  CreateBeneficiaryDTO,
  UpdateBeneficiaryDTO,
  BeneficiaryRejectionDTO,
  BeneficiaryCountResponse,
  BeneficiaryStatistics,
  BeneficiaryStatus
} from '../types/beneficiary.types';

/**
 * Service for Beneficiary API operations.
 * Handles CRUD operations and workflow management for beneficiaries.
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
class BeneficiaryService {
  private readonly BASE_PATH = '/beneficiaries';

  // ========================================
  // Business User Operations
  // ========================================

  /**
   * Get all beneficiaries for current user
   * @param status Optional status filter
   */
  async getAll(status?: BeneficiaryStatus): Promise<Beneficiary[]> {
    const params = status ? { status } : undefined;
    const response = await apiService.get<Beneficiary[]>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get beneficiary by ID
   */
  async getById(id: number): Promise<Beneficiary> {
    const response = await apiService.get<Beneficiary>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create new beneficiary
   */
  async create(data: CreateBeneficiaryDTO): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update beneficiary (only if status is PENDING)
   */
  async update(id: number, data: UpdateBeneficiaryDTO): Promise<Beneficiary> {
    const response = await apiService.put<Beneficiary>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete beneficiary (only if status is PENDING)
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Search beneficiaries by name
   */
  async search(query: string): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/search`, {
      params: { query }
    });
    return response.data;
  }

  /**
   * Filter beneficiaries by country
   */
  async getByCountry(country: string): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/by-country/${country}`);
    return response.data;
  }

  /**
   * Get all Counter Over Counter (C2C) beneficiaries
   */
  async getC2C(): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/c2c`);
    return response.data;
  }

  /**
   * Submit beneficiary for admin review
   * Changes status from PENDING to UNDER_REVIEW
   */
  async submitForReview(id: number): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(`${this.BASE_PATH}/${id}/submit`, {});
    return response.data;
  }

  /**
   * Get beneficiary count and limit info
   * Returns: { count, limit, remaining, canCreateMore }
   */
  async getCount(): Promise<BeneficiaryCountResponse> {
    const response = await apiService.get<BeneficiaryCountResponse>(`${this.BASE_PATH}/count`);
    return response.data;
  }

  // ========================================
  // Admin Operations
  // ========================================

  /**
   * Get all beneficiaries (admin view)
   */
  async getAllAdmin(): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/admin/all`);
    return response.data;
  }

  /**
   * Get pending approvals queue (admin)
   */
  async getPendingApprovals(): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/admin/pending`);
    return response.data;
  }

  /**
   * Approve beneficiary (admin only)
   */
  async approve(id: number): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(`${this.BASE_PATH}/admin/${id}/approve`, {});
    return response.data;
  }

  /**
   * Reject beneficiary (admin only)
   */
  async reject(id: number, rejection: BeneficiaryRejectionDTO): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(
      `${this.BASE_PATH}/admin/${id}/reject`,
      rejection
    );
    return response.data;
  }

  /**
   * Suspend beneficiary (admin only)
   */
  async suspend(id: number, suspension: BeneficiaryRejectionDTO): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(
      `${this.BASE_PATH}/admin/${id}/suspend`,
      suspension
    );
    return response.data;
  }

  /**
   * Reactivate suspended beneficiary (admin only)
   */
  async reactivate(id: number): Promise<Beneficiary> {
    const response = await apiService.post<Beneficiary>(`${this.BASE_PATH}/admin/${id}/reactivate`, {});
    return response.data;
  }

  /**
   * Admin search across all beneficiaries
   */
  async adminSearch(query: string): Promise<Beneficiary[]> {
    const response = await apiService.get<Beneficiary[]>(`${this.BASE_PATH}/admin/search`, {
      params: { query }
    });
    return response.data;
  }

  /**
   * Get beneficiary statistics (admin dashboard)
   */
  async getStatistics(): Promise<BeneficiaryStatistics> {
    const response = await apiService.get<BeneficiaryStatistics>(`${this.BASE_PATH}/admin/statistics`);
    return response.data;
  }
}

export default new BeneficiaryService();
