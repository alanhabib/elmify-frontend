/**
 * Speaker API Endpoints
 *
 * Pure functions for speaker-related API calls
 * No React dependencies - can be used anywhere
 *
 * Responsibilities:
 * - Make HTTP requests to speaker endpoints
 * - Transform request/response data if needed
 * - Return standardized APIResponse format
 *
 * Pattern: All functions return Promise<APIResponse<T>>
 */

import { apiClient } from "../client";
import type {
  APIResponse,
  SpeakerResponse,
  SpeakerDetailResponse,
  PaginationParams,
  PaginatedResponse,
} from "../types";

export async function getAll(
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<SpeakerResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append("size", params.pageSize.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/speakers${query ? `?${query}` : ""}`;

  return apiClient.get<PaginatedResponse<SpeakerResponse>>(endpoint);
}

export async function getById(
  id: string
): Promise<APIResponse<SpeakerDetailResponse>> {
  return apiClient.get<SpeakerDetailResponse>(`/speakers/${id}`);
}

/**
 * Search speakers by name
 *
 * @param query - Search query
 * @param params - Pagination parameters
 * @returns Matching speakers
 *
 * @example
 * const response = await speakerAPI.search('jordan', { limit: 10 });
 */
export async function search(
  query: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<SpeakerResponse>>> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  return apiClient.get<PaginatedResponse<SpeakerResponse>>(
    `/speakers/search?${searchParams.toString()}`
  );
}

/**
 * Get featured speakers
 * Note: If backend doesn't have featured endpoint, this falls back to getAll()
 *
 * @returns Featured speakers
 *
 * @example
 * const response = await speakerAPI.getFeatured();
 */
export async function getFeatured(): Promise<
  APIResponse<PaginatedResponse<SpeakerResponse>>
> {
  // Fallback: return all speakers (backend can add featured endpoint later)
  return getAll({ limit: 20 });
}

/**
 * Speaker API namespace
 * Organized export for cleaner imports
 */
export const speakerAPI = {
  getAll,
  getById,
  search,
  getFeatured,
} as const;
