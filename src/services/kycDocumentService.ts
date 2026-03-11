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
    const formData = new FormData();
    formData.append('userId', data.userId.toString());
    formData.append('organisationId', data.organisationId.toString());
    formData.append('documentType', data.documentType);
    formData.append('documentNumber', data.documentNumber);
    if (data.file) formData.append('file', data.file);
    if (data.issuingCountry) formData.append('issuingCountry', data.issuingCountry);
    if (data.issueDate) formData.append('issueDate', data.issueDate);
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
    if (data.notes) formData.append('notes', data.notes);
    if (data.status) formData.append('status', data.status);

    const response = await apiService.getAxiosInstance().post<KYCDocument>(this.BASE_PATH, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    const response = await apiService.get<PaginatedResponse<KYCDocument>>(`${this.BASE_PATH}`, {
      params: { ...filters, ...params }
    });
    return response.data;
  }
}

const kycDocumentService = new KYCDocumentService();
export default kycDocumentService;
