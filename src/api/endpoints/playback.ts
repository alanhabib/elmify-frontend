/**
 * Playback Position API Endpoints
 *
 * Pure functions for playback position-related API calls
 * All endpoints require authentication
 */

import { apiClient } from '../client';
import type {
  APIResponse,
  PlaybackPositionResponse,
  PlaybackPositionWithLectureResponse,
} from '../types';

/**
 * Get playback position for a specific lecture
 */
export async function getPosition(
  lectureId: string
): Promise<APIResponse<PlaybackPositionResponse>> {
  return apiClient.get<PlaybackPositionResponse>(`/playback/${lectureId}`);
}

/**
 * Get all playback positions for the authenticated user
 */
export async function getAllPositions(): Promise<APIResponse<PlaybackPositionResponse[]>> {
  return apiClient.get<PlaybackPositionResponse[]>('/playback');
}

/**
 * Get lectures to continue listening
 * Returns positions where currentPosition > 0 and < duration
 */
export async function getContinueListening(): Promise<APIResponse<PlaybackPositionResponse[]>> {
  return apiClient.get<PlaybackPositionResponse[]>('/playback/continue-listening');
}

/**
 * Get recent lectures (most recently played)
 * Returns playback positions with full lecture details
 */
export async function getRecentLectures(
  limit: number = 10
): Promise<APIResponse<PlaybackPositionWithLectureResponse[]>> {
  return apiClient.get<PlaybackPositionWithLectureResponse[]>(
    `/playback/recent?limit=${limit}`
  );
}

/**
 * Update playback position for a lecture
 */
export async function updatePosition(
  lectureId: string,
  currentPosition: number
): Promise<APIResponse<PlaybackPositionResponse>> {
  return apiClient.put<PlaybackPositionResponse>(
    `/playback/${lectureId}`,
    { currentPosition }
  );
}

/**
 * Delete playback position for a lecture
 */
export async function deletePosition(
  lectureId: string
): Promise<APIResponse<void>> {
  return apiClient.delete<void>(`/playback/${lectureId}`);
}

/**
 * Playback Position API namespace
 */
export const playbackAPI = {
  getPosition,
  getAllPositions,
  getContinueListening,
  getRecentLectures,
  updatePosition,
  deletePosition,
} as const;
