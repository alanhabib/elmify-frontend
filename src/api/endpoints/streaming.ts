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
    console.log(
      "[streamingAPI.getAudioStreamUrl] Fetching audio URL for lecture:",
      lectureId
    );

    try {
      const result = await apiClient.get<StreamUrlResponse>(
        `/api/v1/lectures/${lectureId}/stream-url`
      );

      console.log("[streamingAPI.getAudioStreamUrl] Result:", result);
      return result;
    } catch (error) {
      console.error("[streamingAPI.getAudioStreamUrl] Error:", error);
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
   * - GET /api/v1/speakers/{id}/image-url
   * - GET /api/v1/collections/{id}/image-url
   * - GET /api/v1/lectures/{id}/thumbnail-url
   */
  async getImageStreamUrl(
    type: "speaker" | "collection" | "lecture",
    id: string
  ): Promise<APIResponse<StreamUrlResponse>> {
    console.log(
      `[streamingAPI.getImageStreamUrl] Fetching ${type} image URL for ID:`,
      id
    );

    try {
      const endpoint =
        type === "lecture"
          ? `/api/v1/lectures/${id}/thumbnail-url`
          : `/api/v1/${type}s/${id}/image-url`;

      const result = await apiClient.get<StreamUrlResponse>(endpoint);

      console.log(
        `[streamingAPI.getImageStreamUrl] ${type} image result:`,
        result
      );
      return result;
    } catch (error) {
      console.warn(
        `[streamingAPI.getImageStreamUrl] Error fetching ${type} image:`,
        error
      );
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
