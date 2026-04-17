import apiService from './apiService';
import {
  KYCDocument,
  CreateKYCDocumentDTO,
  UpdateKYCDocumentDTO,
  KYCDocumentFilters,
  DocumentStatus
} from '../types/kycDocument.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import { normalizePaginatedResponse } from '../utils/paginationUtils';
import { MOCK_KYC_DOCUMENTS, createMockPaginatedResponse } from './mockData';

class KYCDocumentService {
  private readonly BASE_PATH = '/kyc-documents';

  /**
   * Get all KYC documents with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<KYCDocument>(response.data);
  }

  /**
   * Get KYC document by ID
   */
  async getById(id: number): Promise<KYCDocument> {
    const response = await apiService.get<KYCDocument>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get KYC documents by user ID
   */
  async getByUserId(userId: number, params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    const response = await apiService.get<PaginatedResponse<KYCDocument>>(`${this.BASE_PATH}/user/${userId}`, { params });
    return response.data;
  }

  /**
   * Upload KYC document
   */
  async upload(data: CreateKYCDocumentDTO): Promise<KYCDocument> {
    // Backend expects JSON with specific fields only
    const payload = {
      organisationId: data.organisationId,
      documentType: data.documentType,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      verificationIdentifier: data.verificationIdentifier,
      sumsubDocumentIdentifier: data.sumsubDocumentIdentifier
    };

    const response = await apiService.post<KYCDocument>(this.BASE_PATH, payload);
    return response.data;
  }

  /**
   * Update KYC document
   */
  async update(id: number, data: UpdateKYCDocumentDTO): Promise<KYCDocument> {
    const response = await apiService.put<KYCDocument>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete KYC document
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update document status
   */
  async updateStatus(id: number, status: DocumentStatus, rejectionReason?: string): Promise<KYCDocument> {
    const response = await apiService.patch<KYCDocument>(`${this.BASE_PATH}/${id}/status`, {
      status,
      rejectionReason
    });
    return response.data;
  }

  /**
   * Download document
   */
  async download(id: number): Promise<Blob> {
    const response = await apiService.get(`${this.BASE_PATH}/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Search documents with filters
   */
  async search(filters: KYCDocumentFilters, params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    try {
      const response = await apiService.get<PaginatedResponse<KYCDocument>>(`${this.BASE_PATH}`, {
        params: { ...filters, ...params }
      });
      return response.data;
    } catch (error) {
      console.log('API unavailable, using mock data for KYC documents');
      // Return mock data when API is unavailable
      const page = params?.page || 0;
      const size = params?.size || 10;
      return createMockPaginatedResponse(MOCK_KYC_DOCUMENTS, page, size);
    }
  }
}

const kycDocumentService = new KYCDocumentService();
export default kycDocumentService;
