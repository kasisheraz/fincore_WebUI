import apiService from './apiService';
import {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationSearchParams,
  Address,
  CreateAddressDTO,
  UpdateAddressDTO,
  OrganizationStatus
} from '../types/organization.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';

class OrganizationService {
  private readonly BASE_PATH = '/organizations';
  private readonly ADDRESS_PATH = '/addresses';

  /**
   * Get all organizations with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.get<PaginatedResponse<Organization>>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Get organization by ID
   */
  async getById(id: number): Promise<Organization> {
    const response = await apiService.get<Organization>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create new organization
   */
  async create(data: CreateOrganizationDTO): Promise<Organization> {
    const response = await apiService.post<Organization>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update organization
   */
  async update(id: number, data: UpdateOrganizationDTO): Promise<Organization> {
    const response = await apiService.put<Organization>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete organization
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update organization status
   */
  async updateStatus(id: number, status: OrganizationStatus): Promise<Organization> {
    const response = await apiService.patch<Organization>(`${this.BASE_PATH}/${id}/status`, { status });
    return response.data;
  }

  /**
   * Search organizations with filters
   */
  async search(searchParams: OrganizationSearchParams, paginationParams?: PaginationParams): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.get<PaginatedResponse<Organization>>(`${this.BASE_PATH}/search`, {
      params: { ...searchParams, ...paginationParams }
    });
    return response.data;
  }

  /**
   * Get all organizations by type
   */
  async getByType(type: string, params?: PaginationParams): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.get<PaginatedResponse<Organization>>(`${this.BASE_PATH}/type/${type}`, { params });
    return response.data;
  }

  // Address Management Methods

  /**
   * Get all addresses with pagination
   */
  async getAllAddresses(params?: PaginationParams): Promise<PaginatedResponse<Address>> {
    const response = await apiService.get<PaginatedResponse<Address>>(this.ADDRESS_PATH, { params });
    return response.data;
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: number): Promise<Address> {
    const response = await apiService.get<Address>(`${this.ADDRESS_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get addresses by organization ID
   */
  async getAddressesByOrganization(organizationId: number): Promise<Address[]> {
    const response = await apiService.get<Address[]>(`${this.ADDRESS_PATH}/organization/${organizationId}`);
    return response.data;
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressDTO): Promise<Address> {
    const response = await apiService.post<Address>(this.ADDRESS_PATH, data);
    return response.data;
  }

  /**
   * Update address
   */
  async updateAddress(id: number, data: UpdateAddressDTO): Promise<Address> {
    const response = await apiService.put<Address>(`${this.ADDRESS_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete address
   */
  async deleteAddress(id: number): Promise<void> {
    await apiService.delete(`${this.ADDRESS_PATH}/${id}`);
  }
}

const organizationService = new OrganizationService();
export default organizationService;
