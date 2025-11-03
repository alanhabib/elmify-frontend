/**
 * Lecture API Endpoints
 *
 * Pure functions for lecture-related API calls
 * No React dependencies - can be used anywhere
 *
 * Responsibilities:
 * - Make HTTP requests to lecture endpoints
 * - Transform request/response data if needed
 * - Return standardized APIResponse format
 *
 * Pattern: All functions return Promise<APIResponse<T>>
 */

import { apiClient } from '../client';
import type {
  APIResponse,
  LectureResponse,
  LectureDetailResponse,
  PaginationParams,
  PaginatedResponse,
} from '../types';

/**
 * Get all lectures (paginated)
 *
 * @param params - Pagination parameters
 * @returns List of lectures
 *
 * @example
 * const response = await lectureAPI.getAll({ page: 0, size: 20 });
 * if (response.success) {
 *   console.log(response.data);
 * }
 */
export async function getAll(
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append('size', params.pageSize.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/api/v1/lectures${query ? `?${query}` : ''}`;

  return apiClient.get<PaginatedResponse<LectureResponse>>(endpoint);
}

/**
 * Get lecture by ID
 *
 * @param id - Lecture ID
 * @returns Lecture details
 *
 * @example
 * const response = await lectureAPI.getById('123');
 * if (response.success) {
 *   console.log(response.data.title);
 * }
 */
export async function getById(
  id: string
): Promise<APIResponse<LectureDetailResponse>> {
  return apiClient.get<LectureDetailResponse>(`/api/v1/lectures/${id}`);
}

/**
 * Get lectures by collection ID
 *
 * @param collectionId - Collection ID
 * @param params - Pagination parameters
 * @returns Lectures in the collection
 *
 * @example
 * const response = await lectureAPI.getByCollection('456');
 * if (response.success) {
 *   console.log(response.data);
 * }
 */
export async function getByCollection(
  collectionId: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/api/v1/lectures/collection/${collectionId}${query ? `?${query}` : ''}`;

  return apiClient.get<PaginatedResponse<LectureResponse>>(endpoint);
}

/**
 * Get lectures by speaker ID (across all collections)
 *
 * @param speakerId - Speaker ID
 * @param params - Pagination parameters
 * @returns Lectures by the speaker
 *
 * @example
 * const response = await lectureAPI.getBySpeaker('123');
 */
export async function getBySpeaker(
  speakerId: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/api/v1/speakers/${speakerId}/lectures${query ? `?${query}` : ''}`;

  console.log('[lectureAPI.getBySpeaker] Calling endpoint:', endpoint);
  const result = await apiClient.get<PaginatedResponse<LectureResponse>>(endpoint);
  console.log('[lectureAPI.getBySpeaker] Result:', result);
  return result;
}

/**
 * Search lectures by title
 *
 * @param query - Search query
 * @param params - Pagination parameters
 * @returns Matching lectures
 *
 * @example
 * const response = await lectureAPI.search('psychology', { limit: 10 });
 */
export async function search(
  query: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  const searchParams = new URLSearchParams();
  searchParams.append('q', query);

  if (params?.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  return apiClient.get<PaginatedResponse<LectureResponse>>(
    `/api/v1/lectures/search?${searchParams.toString()}`
  );
}

/**
 * Get trending lectures
 * Based on play count, recent activity, etc.
 *
 * @param limit - Number of lectures to return
 * @returns Trending lectures
 *
 * @example
 * const response = await lectureAPI.getTrending(10);
 */
export async function getTrending(
  limit: number = 20
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  return apiClient.get<PaginatedResponse<LectureResponse>>(
    `/api/v1/lectures/trending?limit=${limit}`
  );
}

/**
 * Get recent lectures
 * Recently uploaded lectures
 *
 * @param limit - Number of lectures to return
 * @returns Recent lectures
 *
 * @example
 * const response = await lectureAPI.getRecent(10);
 */
export async function getRecent(
  limit: number = 20
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
  return apiClient.get<PaginatedResponse<LectureResponse>>(
    `/api/v1/lectures/recent?limit=${limit}`
  );
}

/**
 * Lecture API namespace
 * Organized export for cleaner imports
 */
export const lectureAPI = {
  getAll,
  getById,
  getByCollection,
  getBySpeaker,
  search,
  getTrending,
  getRecent,
} as const;
