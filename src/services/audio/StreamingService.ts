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

interface CachedUrl {
  url: string;
  timestamp: number;
}

export class StreamingService {
  // In-memory cache for streaming URLs
  // URLs expire after 50 minutes (R2 presigned URLs typically last 1 hour)
  private static urlCache: Map<string, CachedUrl> = new Map();
  private static CACHE_EXPIRATION_MS = 50 * 60 * 1000; // 50 minutes
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
      // Check cache first if enabled
      if (options.useCache) {
        const cachedUrl = this.getCachedUrl(lecture.id.toString());
        if (cachedUrl) {
          console.log('[StreamingService] Using cached URL for lecture:', lecture.id);
          return cachedUrl;
        }
      }

      // Use new streaming API to get proxy stream URL
      const response = await streamingAPI.getAudioStreamUrl(lecture.id.toString());

      if (!response.success || !response.data?.url) {
        console.error('[StreamingService] Failed to get streaming URL:', {
          lectureId: lecture.id,
          error: response.error,
        });

        // Handle authentication errors
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          await AuthManager.handleAuthError(new Error('401 Unauthorized'));
        }

        return null;
      }

      let streamUrl = response.data.url;

      // Direct R2 CDN URLs are returned as-is (already full HTTPS URLs)
      // No token needed since R2 bucket is public via cdn.elmify.store
      console.log('[StreamingService] Got streaming URL:', {
        lectureId: lecture.id,
        urlLength: streamUrl.length,
        urlPreview: streamUrl.substring(0, 80) + '...',
      });

      // CRITICAL FIX: Properly encode URLs with spaces for TrackPlayer/iOS AVPlayer
      // Safari handles unencoded spaces, but native iOS AVPlayer requires proper encoding
      streamUrl = encodeURI(streamUrl);

      console.log('🎵 StreamingService: Received URL from backend:', response.data.url);
      console.log('🎵 StreamingService: Encoded URL:', streamUrl);
      console.log('🎵 StreamingService: URL starts with https://', streamUrl.startsWith('https://'));
      console.log('🎵 StreamingService: URL contains cdn.elmify.store:', streamUrl.includes('cdn.elmify.store'));

      // Cache the URL if enabled
      if (options.useCache) {
        this.setCachedUrl(lecture.id.toString(), streamUrl);
      }

      console.log('🎵 StreamingService: Final URL being returned:', streamUrl);
      return streamUrl;
    } catch (error) {
      console.error('[StreamingService] Exception getting streaming URL:', {
        lectureId: lecture.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get streaming headers for audio requests
   * Note: R2 CDN URLs are public, so no authentication needed.
   * Range headers are managed by TrackPlayer internally for proper buffering.
   */
  static getStreamingHeaders(): Record<string, string> {
    return {
      Accept: "audio/*",
      // No Range header - TrackPlayer manages this internally for optimal buffering
    };
  }

  /**
   * Create fetch options for audio requests
   */
  static createAudioFetchOptions(
    options: StreamingOptions = {}
  ): RequestInit {
    const headers = this.getStreamingHeaders();

    const fetchOptions: RequestInit = {
      method: "GET",
      headers,
    };

    // Add timeout using AbortController (React Native compatible)
    if (options.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), options.timeout);
      fetchOptions.signal = controller.signal;
    }

    return fetchOptions;
  }

  /**
   * Validate if audio URL is accessible
   */
  static async validateAudioUrl(url: string): Promise<boolean> {
    try {
      const fetchOptions = this.createAudioFetchOptions({
        timeout: 5000,
      });

      // Use HEAD request to check availability without downloading
      const response = await fetch(url, {
        ...fetchOptions,
        method: "HEAD",
      });

      return response.ok;
    } catch (error) {
      console.error('[StreamingService] URL validation failed:', {
        url: url.substring(0, 80) + '...',
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get cached audio URL if available and not expired
   */
  static getCachedUrl(lectureId: string): string | null {
    const cached = this.urlCache.get(lectureId);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_EXPIRATION_MS) {
      console.log('[StreamingService] Cache expired for lecture:', lectureId);
      this.urlCache.delete(lectureId);
      return null;
    }

    return cached.url;
  }

  /**
   * Cache audio URL for future use
   */
  static setCachedUrl(lectureId: string, url: string): void {
    this.urlCache.set(lectureId, {
      url,
      timestamp: Date.now(),
    });
    console.log('[StreamingService] Cached URL for lecture:', lectureId);
  }

  /**
   * Clear all cached URLs
   */
  static clearCache(): void {
    this.urlCache.clear();
    console.log('[StreamingService] Cache cleared');
  }

  /**
   * Clear expired URLs from cache
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [lectureId, cached] of this.urlCache.entries()) {
      if (now - cached.timestamp > this.CACHE_EXPIRATION_MS) {
        this.urlCache.delete(lectureId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log('[StreamingService] Removed', removedCount, 'expired URLs from cache');
    }
  }
}
