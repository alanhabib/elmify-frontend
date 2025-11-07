/**
 * Streaming API Endpoints
 *
 * Handles fetching presigned URLs for audio and images from MinIO storage.
 * These URLs are time-limited and require authentication for audio content.
 *
 * @module api/endpoints/streaming
 */

import { apiClient } from "@/api/client";
import type { APIResponse } from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Response containing a presigned streaming URL
 */
export interface StreamUrlResponse {
  url: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const streamingAPI = {
  /**
   * Get presigned URL for lecture audio streaming
   *
   * This endpoint fetches a secure, time-limited URL from MinIO storage
   * for streaming lecture audio. Requires authentication.
   *
   * @param lectureId - ID of the lecture
   * @returns Promise with presigned URL or error
   *
   * @example
   * ```typescript
   * const response = await streamingAPI.getAudioStreamUrl('123');
   * if (response.success) {
   *   const audioUrl = response.data.url;
   *   // Use audioUrl with audio player
   * }
   * ```
   */
  async getAudioStreamUrl(
    lectureId: string
  ): Promise<APIResponse<StreamUrlResponse>> {
    try {
      const result = await apiClient.get<StreamUrlResponse>(
        `/lectures/${lectureId}/stream-url`
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get audio stream URL",
      };
    }
  },

  /**
   * Get presigned URL for image streaming
   *
   * This endpoint will fetch presigned URLs for speaker avatars,
   * collection covers, and lecture thumbnails from MinIO.
   *
   * @param type - Type of image (speaker, collection, lecture)
   * @param id - ID of the resource
   * @returns Promise with presigned URL or error
   *
   * @example
   * ```typescript
   * const response = await streamingAPI.getImageStreamUrl('speaker', '123');
   * if (response.success) {
   *   const imageUrl = response.data.url;
   * }
   * ```
   *
   * @todo Backend needs to implement these endpoints:
   * - GET /speakers/{id}/image-url
   * - GET /collections/{id}/image-url
   * - GET /lectures/{id}/thumbnail-url
   */
  async getImageStreamUrl(
    type: "speaker" | "collection" | "lecture",
    id: string
  ): Promise<APIResponse<StreamUrlResponse>> {
    try {
      const endpoint =
        type === "lecture"
          ? `/lectures/${id}/thumbnail-url`
          : `/${type}s/${id}/image-url`;

      const result = await apiClient.get<StreamUrlResponse>(endpoint);

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get image stream URL",
      };
    }
  },
};
