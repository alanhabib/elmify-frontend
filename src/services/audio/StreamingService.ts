/**
 * StreamingService - Authenticated audio streaming
 *
 * Handles audio URL generation with authentication for secure streaming from MinIO.
 * Uses the new streaming API for presigned URL generation.
 */

import { AuthManager } from "@/services/auth/authManager";
import { UILecture } from "@/types/ui";
import { streamingAPI } from "@/api/endpoints/streaming";

export interface StreamingOptions {
  quality?: "low" | "medium" | "high";
  useCache?: boolean;
  timeout?: number;
}

export class StreamingService {
  /**
   * Get authenticated streaming URL for a lecture from MinIO
   *
   * Fetches a presigned URL from the backend that grants temporary access
   * to the audio file stored in MinIO.
   */
  static async getStreamingUrl(
    lecture: UILecture,
    options: StreamingOptions = {}
  ): Promise<string | null> {
    try {
      console.log('🎵 StreamingService: Getting stream URL for lecture:', lecture.id);

      // Check cache first if enabled
      if (options.useCache) {
        const cachedUrl = this.getCachedUrl(lecture.id.toString());
        if (cachedUrl) {
          console.log('🎵 StreamingService: Using cached URL');
          return cachedUrl;
        }
      }

      // Use new streaming API to get presigned URL from MinIO
      const response = await streamingAPI.getAudioStreamUrl(lecture.id.toString());

      if (!response.success || !response.data?.url) {
        console.error('🎵 StreamingService: Failed to get streaming URL:', response.error);

        // Handle authentication errors
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          console.error('🎵 StreamingService: Authentication failed - token may be expired');
          await AuthManager.handleAuthError(new Error('401 Unauthorized'));
        }

        return null;
      }

      const streamUrl = response.data.url;
      console.log('🎵 StreamingService: Successfully retrieved streaming URL');

      // Cache the URL if enabled
      if (options.useCache) {
        this.setCachedUrl(lecture.id.toString(), streamUrl);
      }

      return streamUrl;
    } catch (error) {
      console.error('🎵 StreamingService error:', error);
      return null;
    }
  }

  /**
   * Get authenticated headers for streaming requests
   */
  static async getStreamingHeaders(): Promise<Record<string, string>> {
    try {
      const headers = await AuthManager.getAuthHeaders();

      return {
        ...headers,
        Accept: "audio/*",
        Range: "bytes=0-", // Enable range requests for seeking
      };
    } catch (error) {
      console.warn("Failed to get streaming headers:", error);
      return {
        Accept: "audio/*",
        Range: "bytes=0-",
      };
    }
  }

  /**
   * Create authenticated fetch options for audio requests
   */
  static async createAudioFetchOptions(
    options: StreamingOptions = {}
  ): Promise<RequestInit> {
    const headers = await this.getStreamingHeaders();

    return {
      method: "GET",
      headers,
      // Add signal for timeout if specified
      ...(options.timeout && {
        signal: AbortSignal.timeout(options.timeout),
      }),
    };
  }

  /**
   * Validate if audio URL is accessible
   */
  static async validateAudioUrl(url: string): Promise<boolean> {
    try {
      const fetchOptions = await this.createAudioFetchOptions({
        timeout: 5000,
      });

      // Use HEAD request to check availability without downloading
      const response = await fetch(url, {
        ...fetchOptions,
        method: "HEAD",
      });

      return response.ok;
    } catch (error) {
      console.warn(`Audio URL validation failed for: ${url}`, error);
      return false;
    }
  }

  /**
   * Get cached audio URL if available
   */
  static getCachedUrl(lectureId: string): string | null {
    // TODO: Implement caching logic
    return null;
  }

  /**
   * Cache audio URL for future use
   */
  static setCachedUrl(lectureId: string, url: string): void {
    // TODO: Implement caching logic
  }

  // Helper methods
  private static isFullUrl(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  private static cleanPath(path: string): string {
    // Remove leading slash if present
    return path.startsWith("/") ? path.slice(1) : path;
  }
}
