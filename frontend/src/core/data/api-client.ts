import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Callback for getting authentication token
 */
export type TokenProvider = () => string | null;

/**
 * Callback for refreshing authentication token
 */
export type TokenRefresher = () => Promise<boolean>;

/**
 * Callback for handling logout
 */
export type LogoutHandler = () => Promise<void>;

/**
 * Core API client for making HTTP requests
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private tokenProvider: TokenProvider;
  private tokenRefresher: TokenRefresher;
  private logoutHandler: LogoutHandler;
  
  constructor(
    baseUrl: string, 
    tokenProvider: TokenProvider,
    tokenRefresher: TokenRefresher,
    logoutHandler: LogoutHandler
  ) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;
    this.tokenRefresher = tokenRefresher;
    this.logoutHandler = logoutHandler;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Request interceptor for auth tokens
    this.client.interceptors.request.use(config => {
      const token = this.tokenProvider();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      async error => {
        // Handle token refresh for 401 errors
        if (error.response?.status === 401) {
          try {
            // Try to refresh the token
            const refreshSuccess = await this.tokenRefresher();
            
            if (refreshSuccess) {
              // Retry the original request with new token
              const originalRequest = error.config;
              const token = this.tokenProvider();
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              }
            } else {
              // If refresh fails, logout the user
              await this.logoutHandler();
            }
          } catch (refreshError) {
            // If refresh throws an error, logout the user
            await this.logoutHandler();
          }
        }
        
        // Pass other errors through
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Make a GET request to the API
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(path, config);
    return response.data;
  }
  
  /**
   * Make a POST request to the API
   */
  async post<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(path, data, config);
    return response.data;
  }
  
  /**
   * Make a PUT request to the API
   */
  async put<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(path, data, config);
    return response.data;
  }
  
  /**
   * Make a PATCH request to the API
   */
  async patch<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(path, data, config);
    return response.data;
  }
  
  /**
   * Make a DELETE request to the API
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(path, config);
    return response.data;
  }
} 