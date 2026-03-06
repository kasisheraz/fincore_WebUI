import apiService from './apiService';
import { User, CreateUserDTO, UpdateUserDTO, UserSearchParams } from '../types/user.types';
import { PaginatedResponse, PaginationParams, Status } from '../types/common.types';

class UserService {
  private readonly BASE_PATH = '/users';

  /**
   * Get all users with pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<PaginatedResponse<User>>(
      this.BASE_PATH,
      params
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await apiService.get<User>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDTO): Promise<User> {
    const response = await apiService.post<User>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const response = await apiService.put<User>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, status: Status): Promise<User> {
    const response = await apiService.patch<User>(
      `${this.BASE_PATH}/${id}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Search users
   */
  async search(searchParams: UserSearchParams, paginationParams?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<PaginatedResponse<User>>(
      `${this.BASE_PATH}/search`,
      { ...searchParams, ...paginationParams }
    );
    return response.data;
  }
}

const userService = new UserService();
export default userService;
