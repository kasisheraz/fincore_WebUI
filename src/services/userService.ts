import apiService from './apiService';
import { User, CreateUserDTO, UpdateUserDTO, UserSearchParams } from '../types/user.types';
import { PaginatedResponse, PaginationParams } from '../types/common.types';
import { normalizePaginatedResponse } from '../utils/paginationUtils';

class UserService {
  private readonly BASE_PATH = '/users';

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<any>(this.BASE_PATH, { params });
    return normalizePaginatedResponse<User>(response.data);
  }

  async getById(id: number): Promise<User> {
    const response = await apiService.get<User>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const response = await apiService.post<User>(this.BASE_PATH, data);
    return response.data;
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const response = await apiService.put<User>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async updateStatus(id: number, status: string): Promise<User> {
    const response = await apiService.patch<User>(`${this.BASE_PATH}/${id}/status`, { status });
    return response.data;
  }

  async search(searchParams: UserSearchParams, paginationParams?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<any>(this.BASE_PATH, {
      params: { ...searchParams, ...paginationParams }
    });
    return normalizePaginatedResponse<User>(response.data);
  }
}

const userService = new UserService();
export default userService;
