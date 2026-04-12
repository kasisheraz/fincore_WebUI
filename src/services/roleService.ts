import apiService from './apiService';

export interface Role {
  id: number;
  name: string;
  description: string;
}

/**
 * Service for role-related API calls
 */
class RoleService {
  /**
   * Get all available roles from the backend
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      console.log('[RoleService] Fetching all roles from API');
      const response = await apiService.get<Role[]>('/roles');
      console.log('[RoleService] Received roles:', response.data);
      return response.data;
    } catch (error) {
      console.error('[RoleService] Error fetching roles:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
export default roleService;
