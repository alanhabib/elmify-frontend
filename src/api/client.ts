/**
 * API Client - Single Source of Truth for HTTP Communications
 *
 * Responsibilities:
 * - HTTP requests (GET, POST, PUT, DELETE)
 * - Authentication headers
 * - Retry logic with exponential backoff
 * - Error handling
 * - Request/Response interceptors
 *
 * Based on your existing APIClient with React Native optimizations
 */

import { AuthManager } from "@/services/auth/authManager";
import { API_BASE_URL } from "@/config/env";

/**
 * Standard API response wrapper
 * All endpoints return this format for consistency
 */
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  status: number;
}

/**
 * Configuration for API client instances
 */
export interface APIConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
}

/**
 * Main API Client Class
 * Handles all HTTP communication with the backend
 */
export class APIClient {
  public readonly baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config: APIConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000; // 10s default
    this.retries = config.retries || 3;
  }

  /**
   * Get authentication headers from AuthManager
   * Centralizes auth logic in one place
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      return await AuthManager.getAuthHeaders();
    } catch (error) {
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Core request method with retry logic
   * Implements exponential backoff for failed requests
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        // Get fresh auth headers for each attempt
        const headers = await this.getAuthHeaders();

        const config: RequestInit = {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        };

        // Timeout controller (React Native compatible)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-OK responses
        if (!response.ok) {
          // Special handling for auth errors
          if (response.status === 401) {
            if (attempt === 0) {
              // Try refreshing token once
              await AuthManager.handleAuthError(
                new Error(`HTTP ${response.status}: ${response.statusText}`)
              );
              continue; // Retry with refreshed token
            }
          }

          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${response.statusText} - ${
              errorText || "No error details"
            }`
          );
        }

        // Parse response based on content type
        const contentType = response.headers.get("content-type");
        let data: T | null = null;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else if (
          contentType &&
          (contentType.includes("text/") ||
            contentType.includes("application/xml"))
        ) {
          data = (await response.text()) as unknown as T;
        }

        return {
          data: data as T,
          success: true,
          status: response.status,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors (except 401)
        if (error instanceof Error && "status" in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 401) {
            break; // Client error, no point retrying
          }
        }

        // Last attempt failed
        if (attempt === this.retries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    return {
      error: lastError?.message || "Unknown error occurred",
      success: false,
      status: 0,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "DELETE",
    });
  }
}

/**
 * Environment-specific configurations
 */
export const API_CONFIG: Record<string, APIConfig> = {
  development: {
    baseURL: "http://localhost:8081",
    timeout: 10000, // 10s for dev
    retries: 2,
  },
  production: {
    baseURL: API_BASE_URL,
    timeout: 8000, // 8s for prod
    retries: 3,
  },
};

/**
 * Default API client instance
 * Use this throughout your app
 *
 * @example
 * import { apiClient } from '@/api/client';
 * const response = await apiClient.get('/speakers');
 */
export const apiClient = new APIClient(
  API_CONFIG[__DEV__ ? "development" : "production"]
);
