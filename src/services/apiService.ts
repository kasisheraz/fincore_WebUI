import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  public put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  public patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data);
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

const apiService = new ApiService();
export default apiService;