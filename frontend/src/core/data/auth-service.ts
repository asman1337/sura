/**
 * Authentication service for handling tokens and auth state
 */
export class AuthService {
  private authToken: string | null = null;
  private refreshTokenValue: string | null = null;
  
  constructor() {
    // Initialize tokens from storage if available
    this.authToken = localStorage.getItem('auth_token');
    this.refreshTokenValue = localStorage.getItem('refresh_token');
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
  setTokens(authToken: string, refreshToken: string): void {
    this.authToken = authToken;
    this.refreshTokenValue = refreshToken;
    
    // Save to local storage for persistence
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
  
  /**
   * Clear tokens on logout
   */
  clearTokens(): void {
    this.authToken = null;
    this.refreshTokenValue = null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
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
  async refreshToken(): Promise<void> {
    if (!this.refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/auth/refresh', {
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
      
      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
  
  /**
   * Log the user out
   */
  logout(): void {
    this.clearTokens();
    // Dispatch logout action or redirect to login page
    // This could be done via a callback passed to the constructor
  }
} 