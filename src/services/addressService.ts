import apiService from './apiService';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../types/organization.types';

/**
 * Address Service - Handles address-related API calls
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
class AddressService {
  private readonly BASE_PATH = '/addresses';

  /**
   * Get address by ID
   */
  async getById(id: number): Promise<Address> {
    const response = await apiService.get<Address>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create new address
   */
  async create(data: CreateAddressDTO): Promise<Address> {
    const response = await apiService.post<Address>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update existing address
   */
  async update(id: number, data: UpdateAddressDTO): Promise<Address> {
    const response = await apiService.put<Address>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete address
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

const addressService = new AddressService();
export default addressService;
