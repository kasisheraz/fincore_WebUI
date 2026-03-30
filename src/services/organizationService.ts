import apiService from './apiService';
import {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationSearchDTO,
  Address,
  CreateAddressDTO,
  UpdateAddressDTO,
  OrganizationStatus
} from '../types/organization.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import { normalizePaginatedResponse } from '../utils/paginationUtils';

class OrganizationService {
  private readonly BASE_PATH = '/organisations';
  private readonly ADDRESS_PATH = '/addresses';

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<Organization>(response.data);
  }

  async getById(id: number): Promise<Organization> {
    const response = await apiService.get<Organization>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getByOwner(ownerId: number): Promise<Organization[]> {
    const response = await apiService.get<Organization[]>(`${this.BASE_PATH}/owner/${ownerId}`);
    return response.data;
  }

  async getByStatus(status: OrganizationStatus): Promise<Organization[]> {
    const response = await apiService.get<Organization[]>(`${this.BASE_PATH}/status/${status}`);
    return response.data;
  }

  async checkRegistrationExists(regNo: string): Promise<boolean> {
    const response = await apiService.get<boolean>(`${this.BASE_PATH}/exists/registration/${regNo}`);
    return response.data;
  }

  async create(data: CreateOrganizationDTO): Promise<Organization> {
    const response = await apiService.post<Organization>(this.BASE_PATH, data);
    return response.data;
  }

  async update(id: number, data: UpdateOrganizationDTO): Promise<Organization> {
    const response = await apiService.put<Organization>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async updateStatus(id: number, status: OrganizationStatus, reason?: string): Promise<Organization> {
    const response = await apiService.patch<Organization>(
      `${this.BASE_PATH}/${id}/status`,
      null,
      { params: { status, reason } }
    );
    return response.data;
  }

  async search(searchParams: OrganizationSearchDTO): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.post<any>(`${this.BASE_PATH}/search`, searchParams);
    return normalizePaginatedResponse<Organization>(response.data);
  }

  async getByType(type: string, params?: PaginationParams): Promise<PaginatedResponse<Organization>> {
    const response = await apiService.get<any>(`${this.BASE_PATH}/type/${type}`, { params });
    return normalizePaginatedResponse<Organization>(response.data);
  }

  // Address Management

  async getAllAddresses(params?: PaginationParams): Promise<PaginatedResponse<Address>> {
    const response = await apiService.get<any>(this.ADDRESS_PATH, { params });
    return normalizePaginatedResponse<Address>(response.data);
  }

  async getAddressById(id: number): Promise<Address> {
    const response = await apiService.get<Address>(`${this.ADDRESS_PATH}/${id}`);
    return response.data;
  }

  async getAddressesByType(typeCode: number): Promise<Address[]> {
    const response = await apiService.get<Address[]>(`${this.ADDRESS_PATH}/type/${typeCode}`);
    return response.data;
  }

  async getAddressesByCountry(country: string): Promise<Address[]> {
    const response = await apiService.get<Address[]>(`${this.ADDRESS_PATH}/country/${country}`);
    return response.data;
  }

  async createAddress(data: CreateAddressDTO): Promise<Address> {
    const response = await apiService.post<Address>(this.ADDRESS_PATH, data);
    return response.data;
  }

  async updateAddress(id: number, data: UpdateAddressDTO): Promise<Address> {
    const response = await apiService.put<Address>(`${this.ADDRESS_PATH}/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: number): Promise<void> {
    await apiService.delete(`${this.ADDRESS_PATH}/${id}`);
  }
}

const organizationService = new OrganizationService();
export default organizationService;
