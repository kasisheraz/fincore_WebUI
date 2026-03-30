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

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<KYCDocument>(response.data);
  }

  async getById(id: number): Promise<KYCDocument> {
    const response = await apiService.get<KYCDocument>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getByOrganisation(orgId: number): Promise<KYCDocument[]> {
    const response = await apiService.get<KYCDocument[]>(`${this.BASE_PATH}/organisation/${orgId}`);
    return response.data;
  }

  async getByOrganisationPaged(orgId: number, params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}/organisation/${orgId}/paged`, { params });
    return normalizePaginatedResponse<KYCDocument>(response.data);
  }

  async getByStatus(status: DocumentStatus): Promise<KYCDocument[]> {
    const response = await apiService.get<KYCDocument[]>(`${this.BASE_PATH}/status/${status}`);
    return response.data;
  }

  async getPending(): Promise<KYCDocument[]> {
    const response = await apiService.get<KYCDocument[]>(`${this.BASE_PATH}/pending`);
    return response.data;
  }

  async getByOrganisationAndType(orgId: number, type: string): Promise<KYCDocument[]> {
    const response = await apiService.get<KYCDocument[]>(`${this.BASE_PATH}/organisation/${orgId}/type/${type}`);
    return response.data;
  }

  async countVerifiedByOrganisation(orgId: number): Promise<number> {
    const response = await apiService.get<number>(`${this.BASE_PATH}/organisation/${orgId}/verified/count`);
    return response.data;
  }

  async upload(data: CreateKYCDocumentDTO): Promise<KYCDocument> {
    const response = await apiService.post<KYCDocument>(this.BASE_PATH, data);
    return response.data;
  }

  async verify(id: number, verifierId: number, status: DocumentStatus, reason?: string): Promise<KYCDocument> {
    const response = await apiService.post<KYCDocument>(
      `${this.BASE_PATH}/${id}/verify`,
      null,
      { params: { verifierId, status, reason } }
    );
    return response.data;
  }

  async update(id: number, data: UpdateKYCDocumentDTO): Promise<KYCDocument> {
    const response = await apiService.put<KYCDocument>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async download(id: number): Promise<Blob> {
    const response = await apiService.get(`${this.BASE_PATH}/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async search(filters: KYCDocumentFilters, params?: PaginationParams): Promise<PaginatedResponse<KYCDocument>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}`, {
      params: { ...filters, ...params }
    });
    return normalizePaginatedResponse<KYCDocument>(response.data);
  }
}

const kycDocumentService = new KYCDocumentService();
export default kycDocumentService;
