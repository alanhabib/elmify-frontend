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
  const endpoint = `/collections${query ? `?${query}` : ""}`;

  return apiClient.get<PaginatedResponse<CollectionResponse>>(endpoint);
}

export async function getById(
  id: string
): Promise<APIResponse<CollectionDetailResponse>> {
  const endpoint = `/collections/${id}`;

  const result = await apiClient.get<CollectionDetailResponse>(endpoint);

  return result;
}

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
  const endpoint = `/speakers/${speakerId}/collections${
    query ? `?${query}` : ""
  }`;

  const result = await apiClient.get<PaginatedResponse<CollectionResponse>>(
    endpoint
  );
  return result;
}

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
    `/collections/search?${searchParams.toString()}`
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
