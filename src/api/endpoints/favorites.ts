/**
 * Favorites API Endpoints
 *
 * Pure functions for favorites-related API calls
 * All endpoints require authentication
 */

import { apiClient } from '../client';
import type {
  APIResponse,
  FavoriteResponse,
  FavoriteCheckResponse,
  FavoriteCountResponse,
  PaginatedResponse,
  PaginationParams,
} from '../types';

/**
 * Get all favorites for the authenticated user
 */
export async function getAll(
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<FavoriteResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append('size', params.pageSize.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/api/v1/favorites${query ? `?${query}` : ''}`;

  return apiClient.get<PaginatedResponse<FavoriteResponse>>(endpoint);
}

/**
 * Check if a lecture is favorited
 */
export async function checkFavorite(
  lectureId: string
): Promise<APIResponse<FavoriteCheckResponse>> {
  return apiClient.get<FavoriteCheckResponse>(`/api/v1/favorites/check/${lectureId}`);
}

/**
 * Add a lecture to favorites
 */
export async function addFavorite(
  lectureId: string
): Promise<APIResponse<FavoriteResponse>> {
  return apiClient.post<FavoriteResponse>(`/api/v1/favorites/${lectureId}`, {});
}

/**
 * Remove a lecture from favorites
 */
export async function removeFavorite(
  lectureId: string
): Promise<APIResponse<void>> {
  return apiClient.delete<void>(`/api/v1/favorites/${lectureId}`);
}

/**
 * Get total favorites count
 */
export async function getCount(): Promise<APIResponse<FavoriteCountResponse>> {
  return apiClient.get<FavoriteCountResponse>('/api/v1/favorites/count');
}

/**
 * Favorites API namespace
 */
export const favoritesAPI = {
  getAll,
  checkFavorite,
  addFavorite,
  removeFavorite,
  getCount,
} as const;
