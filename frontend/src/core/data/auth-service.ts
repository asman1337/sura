import { StorageClient } from './storage-client';

// Interfaces to match backend DTOs
interface LoginDto {
  username: string;
  password: string;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Authentication service for handling tokens and auth state
 */
export class AuthService {
  private authToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private tokenInitialized: boolean = false;
  private apiBaseUrl: string;
  
  constructor(
    private storage: StorageClient,
    apiBaseUrl: string = 'http://localhost:3000'
  ) {
    this.apiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  }
  
  /**
   * Initialize tokens from storage
   */
  async initialize(): Promise<void> {
    if (this.tokenInitialized) return;
    
    try {
      this.authToken = await this.storage.getItem<string>('auth_token') || null;
      this.refreshTokenValue = await this.storage.getItem<string>('refresh_token') || null;
      this.tokenInitialized = true;
    } catch (error) {
      console.error('Failed to load authentication tokens:', error);
      this.authToken = null;
      this.refreshTokenValue = null;
    }
  }
  
  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      // This would be a real API call using fetch in production
      // We don't use ApiClient here to avoid circular dependency
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data: AuthResponseDto = await response.json();
      await this.setTokens(data.accessToken, data.refreshToken || '');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return this.authToken;
  }
  
  /**
   * Set authentication tokens after successful login or token refresh
   */
  async setTokens(authToken: string, refreshToken: string): Promise<void> {
    this.authToken = authToken;
    this.refreshTokenValue = refreshToken;
    
    // Save to storage for persistence
    await this.storage.setItem('auth_token', authToken);
    await this.storage.setItem('refresh_token', refreshToken);
  }
  
  /**
   * Clear tokens on logout
   */
  async clearTokens(): Promise<void> {
    this.authToken = null;
    this.refreshTokenValue = null;
    
    await this.storage.removeItem('auth_token');
    await this.storage.removeItem('refresh_token');
  }
  
  /**
   * Check if we can attempt a token refresh
   */
  canRefreshToken(): boolean {
    return this.refreshTokenValue !== null;
  }
  
  /**
   * Attempt to refresh the auth token using the refresh token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.refreshTokenValue) {
      return false;
    }
    
    try {
      // This would be a real API call using fetch in production
      // We don't use ApiClient here to avoid circular dependency
      const response = await fetch(`${this.apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshTokenValue
        })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data: AuthResponseDto = await response.json();
      await this.setTokens(data.accessToken, data.refreshToken || '');
      return true;
    } catch (error) {
      await this.clearTokens();
      return false;
    }
  }
  
  /**
   * Log the user out
   */
  async logout(): Promise<void> {
    try {
      // This would attempt to call a logout endpoint if it exists
      // We just clear tokens for now
      await this.clearTokens();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear tokens even if API call fails
      await this.clearTokens();
    }
  }
} 