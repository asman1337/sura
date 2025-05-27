import { StorageClient } from './storage-client';

// Interfaces to match backend DTOs
interface LoginDto {
  username: string;
  password: string;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  officer: OfficerInfo;
}

// Define the officer info with nested relations
export interface OfficerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
  userType: string;
  gender?: string;
  profilePhotoUrl?: string;
  rank?: {
    id: string;
    name: string;
    abbreviation: string;
    level: number;
  } | null;
  organization?: {
    id: string;
    name: string;
    code: string;
    type: string;
  } | null;
  primaryUnit?: {
    id: string;
    name: string;
    code: string;
    type: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Authentication service for handling tokens and auth state
 */
export class AuthService {
  private authToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private tokenInitialized: boolean = false;
  private apiBaseUrl: string;
  private currentUser: OfficerInfo | null = null;
  private authStateListeners: Set<() => void> = new Set();
  
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
      this.currentUser = await this.storage.getItem<OfficerInfo>('user_profile') || null;
      this.tokenInitialized = true;
    } catch (error) {
      console.error('Failed to load authentication tokens:', error);
      this.authToken = null;
      this.refreshTokenValue = null;
      this.currentUser = null;
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
      this.currentUser = data.officer;
      await this.storage.setItem('user_profile', this.currentUser);
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
    
    // Notify components that auth state has changed
    this.notifyAuthStateChange();
  }
  
  /**
   * Clear tokens on logout
   */
  async clearTokens(): Promise<void> {
    this.authToken = null;
    this.refreshTokenValue = null;
    this.currentUser = null;
    
    await this.storage.removeItem('auth_token');
    await this.storage.removeItem('refresh_token');
    await this.storage.removeItem('user_profile');
    
    // Notify components that auth state has changed
    this.notifyAuthStateChange();
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
      if (data.officer) {
        this.currentUser = data.officer;
        await this.storage.setItem('user_profile', this.currentUser);
      }
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

  /**
   * Get the current user profile
   */
  getCurrentUser(): OfficerInfo | null {
    return this.currentUser;
  }

  /**
   * Fetch the current user profile from the API
   */
  async fetchUserProfile(): Promise<OfficerInfo | null> {
    if (!this.authToken) {
      return null;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/officers/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData: OfficerInfo = await response.json();
      this.currentUser = userData;
      await this.storage.setItem('user_profile', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Decode JWT token to get basic user information
   */
  decodeToken(): { sub: string; email: string; type: string; primaryUnitId: string } | null {
    if (!this.authToken) {
      return null;
    }

    try {
      const base64Url = this.authToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Update the user profile data (partial update)
   */
  async updateProfile(profileData: Partial<OfficerInfo>): Promise<OfficerInfo | null> {
    if (!this.authToken) {
      return null;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/officers/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      
      const updatedUser: OfficerInfo = await response.json();
      this.currentUser = updatedUser;
      await this.storage.setItem('user_profile', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Update user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.authToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/officers/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to change password');
      }
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  /**
   * Add a listener for auth state changes
   */
  addAuthStateListener(listener: () => void): () => void {
    this.authStateListeners.add(listener);
    // Return cleanup function
    return () => {
      this.authStateListeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners that auth state has changed
   */
  private notifyAuthStateChange(): void {
    this.authStateListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
}