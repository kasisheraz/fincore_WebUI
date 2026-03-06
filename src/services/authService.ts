import apiService from './apiService';
import { OTPRequest, OTPResponse, OTPVerification, AuthResponse, User } from '../types/auth.types';
import { APP_CONFIG } from '../config/config';

class AuthService {
  private readonly BASE_PATH = '/auth';

  /**
   * Mock users for development mode
   */
  private readonly MOCK_USERS: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@fincore.com',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@fincore.com',
      phoneNumber: '9876543210',
      dateOfBirth: '1992-05-15',
      gender: 'FEMALE',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@fincore.com',
      phoneNumber: '5555555555',
      dateOfBirth: '1985-03-20',
      gender: 'OTHER',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  /**
   * Request OTP for phone number
   */
  async requestOTP(phoneNumber: string): Promise<OTPResponse> {
    // Mock mode: Accept any 10-digit phone number
    if (APP_CONFIG.MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return {
        message: `OTP sent successfully to ${phoneNumber}. Use 123456 to login.`,
        phoneNumber: phoneNumber
      };
    }

    const payload: OTPRequest = { phoneNumber };
    const response = await apiService.post<OTPResponse>(`${this.BASE_PATH}/request-otp`, payload);
    return response.data;
  }

  /**
   * Verify OTP and get authentication token
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
    // Mock mode: Accept OTP "123456" for any registered mock user
    if (APP_CONFIG.MOCK_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Find user by phone number
      const user = this.MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
      
      if (!user) {
        throw new Error('User not found. Use one of the test phone numbers.');
      }

      if (otp !== '123456') {
        throw new Error('Invalid OTP. Use 123456 for testing.');
      }

      const mockToken = `mock-jwt-token-${Date.now()}`;
      const authResponse: AuthResponse = {
        token: mockToken,
        user: user
      };

      // Store token in localStorage
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify(user));

      return authResponse;
    }

    const payload: OTPVerification = { phoneNumber, otp };
    const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/verify-otp`, payload);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(`${this.BASE_PATH}/me`);
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

const authService = new AuthService();
export default authService;
