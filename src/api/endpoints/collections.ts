/**
 * Collection API Endpoints
 *
 * Pure functions for collection-related API calls
 * No React dependencies - can be used anywhere
 *
 * Responsibilities:
 * - Make HTTP requests to collection endpoints
 * - Transform request/response data if needed
 * - Return standardized APIResponse format
 *
 * Pattern: All functions return Promise<APIResponse<T>>
 */

import { apiClient } from "../client";
import type {
  APIResponse,
  CollectionResponse,
  CollectionDetailResponse,
  PaginationParams,
  PaginatedResponse,
} from "../types";

/**
 * Get all collections (paginated)
 *
 * @param params - Pagination parameters
 * @returns List of collections
 *
 * @example
 * const response = await collectionAPI.getAll({ page: 0, size: 20 });
 * if (response.success) {
 *   console.log(response.data);
 * }
 */
export async function getAll(
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<CollectionResponse>>> {
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
  const endpoint = `/api/v1/collections${query ? `?${query}` : ""}`;

  return apiClient.get<PaginatedResponse<CollectionResponse>>(endpoint);
}

/**
 * Get collection by ID
 *
 * @param id - Collection ID
 * @returns Collection details
 *
 * @example
 * const response = await collectionAPI.getById('123');
 * if (response.success) {
 *   console.log(response.data.title);
 * }
 */
export async function getById(
  id: string
): Promise<APIResponse<CollectionDetailResponse>> {
  console.log("[collectionAPI.getById] Fetching collection with ID:", id);
  const endpoint = `/api/v1/collections/${id}`;
  console.log("[collectionAPI.getById] Endpoint:", endpoint);

  const result = await apiClient.get<CollectionDetailResponse>(endpoint);
  console.log("[collectionAPI.getById] Result:", result);

  return result;
}

/**
 * Get collections by speaker ID
 *
 * @param speakerId - Speaker ID
 * @param params - Pagination parameters
 * @returns Collections for the speaker
 *
 * @example
 * const response = await collectionAPI.getBySpeaker('123', { limit: 10 });
 */
export async function getBySpeaker(
  speakerId: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<CollectionResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/api/v1/speakers/${speakerId}/collections${
    query ? `?${query}` : ""
  }`;

  console.log("[collectionAPI.getBySpeaker] Calling endpoint:", endpoint);
  const result = await apiClient.get<PaginatedResponse<CollectionResponse>>(
    endpoint
  );
  console.log("[collectionAPI.getBySpeaker] Result:", result);
  return result;
}

/**
 * Search collections by title
 *
 * @param query - Search query
 * @param params - Pagination parameters
 * @returns Matching collections
 *
 * @example
 * const response = await collectionAPI.search('react', { limit: 10 });
 */
export async function search(
  query: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<CollectionResponse>>> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  return apiClient.get<PaginatedResponse<CollectionResponse>>(
    `/api/v1/collections/search?${searchParams.toString()}`
  );
}

/**
 * Get featured collections
 *
 * @returns Featured collections
 *
 * @example
 * const response = await collectionAPI.getFeatured();
 */
export async function getFeatured(): Promise<
  APIResponse<PaginatedResponse<CollectionResponse>>
> {
  // Fallback: return all collections (backend can add featured endpoint later)
  return getAll({ limit: 20 });
}

/**
 * Collection API namespace
 * Organized export for cleaner imports
 */
export const collectionAPI = {
  getAll,
  getById,
  getBySpeaker,
  search,
  getFeatured,
} as const;
