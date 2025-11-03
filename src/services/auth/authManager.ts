/**
 * AuthManager - Centralized authentication management
 *
 * Handles Clerk token management for both React components and API services
 * Provides token refresh, storage, and error handling
 */

export interface AuthTokens {
  accessToken: string | null;
  refreshToken?: string | null;
  expiresAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  tokens: AuthTokens;
}

/**
 * Global authentication manager
 * Can be used by both React components and API services
 */
class AuthManagerClass {
  private tokens: AuthTokens = { accessToken: null };
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  // Token getter function - set by React hook
  private tokenGetter: (() => Promise<string | null>) | null = null;

  // User getter function - set by React hook
  private userGetter: (() => any | null) | null = null;

  // Auth state getter - set by React hook
  private authStateGetter:
    | (() => { isSignedIn: boolean; isLoaded: boolean })
    | null = null;

  /**
   * Initialize with Clerk hooks (called by React hook)
   */
  initialize(
    getToken: () => Promise<string | null>,
    getUser: () => any | null,
    getAuthState: () => { isSignedIn: boolean; isLoaded: boolean }
  ) {
    this.tokenGetter = getToken;
    this.userGetter = getUser;
    this.authStateGetter = getAuthState;
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // If we're already refreshing, wait for that to complete
      if (this.isRefreshing && this.refreshPromise) {
        return await this.refreshPromise;
      }

      // Try to get fresh token from Clerk
      if (this.tokenGetter) {
        const token = await this.tokenGetter();

        if (token) {
          this.tokens.accessToken = token;
          return token;
        } else {
          console.warn("⚠️ AuthManager: No JWT token received from Clerk");
        }
      } else {
        console.warn("⚠️ AuthManager: No token getter available");
      }

      // Only fall back to demo token in development when no token getter is available
      if (__DEV__ && !this.tokenGetter) {
        this.tokens.accessToken = "demo-token";
        return "demo-token";
      }

      return this.tokens.accessToken;
    } catch (error) {
      console.error("Failed to get access token:", error);

      // Return demo token in development as fallback only if no token getter
      if (__DEV__ && !this.tokenGetter) {
        return "demo-token";
      }

      return null;
    }
  }

  /**
   * Refresh the access token
   */
  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      if (this.tokenGetter) {
        const token = await this.tokenGetter();

        if (token) {
          this.tokens.accessToken = token;
          this.notifyListeners();
          return token;
        }
      }

      // Clear invalid tokens
      this.tokens.accessToken = null;
      this.notifyListeners();
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.tokens.accessToken = null;
      this.notifyListeners();
      return null;
    }
  }

  /**
   * Get auth headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = await this.getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.authStateGetter) {
      const { isSignedIn, isLoaded } = this.authStateGetter();
      return isLoaded && isSignedIn;
    }

    // Fallback: check if we have a valid token
    return !!this.tokens.accessToken;
  }

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    if (this.userGetter) {
      return this.userGetter();
    }
    return null;
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    const authState = this.authStateGetter?.() || {
      isSignedIn: false,
      isLoaded: true,
    };

    return {
      isAuthenticated: this.isAuthenticated(),
      isLoading: !authState.isLoaded,
      user: this.getCurrentUser(),
      tokens: { ...this.tokens },
    };
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    this.tokens = { accessToken: null };
    this.notifyListeners();
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("Auth listener error:", error);
      }
    });
  }

  /**
   * Handle authentication errors (like 401 responses)
   */
  async handleAuthError(error: any): Promise<void> {
    console.warn("Authentication error occurred:", error);

    // Try to refresh token once
    const newToken = await this.refreshAccessToken();

    if (!newToken) {
      // If refresh fails, clear tokens and notify listeners
      this.clearTokens();
    }
  }

  /**
   * Manual token refresh (for React components)
   */
  async forceRefresh(): Promise<string | null> {
    this.tokens.accessToken = null; // Clear current token to force refresh
    return await this.refreshAccessToken();
  }
}

// Export singleton instance
export const AuthManager = new AuthManagerClass();

// Export types
export type AuthManager = AuthManagerClass;
