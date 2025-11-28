/**
 * Category API Endpoints
 *
 * Pure functions for category-related API calls
 * No React dependencies - can be used anywhere
 *
 * Responsibilities:
 * - Make HTTP requests to category endpoints
 * - Transform request/response data if needed
 * - Return standardized APIResponse format
 *
 * Pattern: All functions return Promise<APIResponse<T>>
 */

import { apiClient } from "../client";
import type {
  APIResponse,
  CategoryResponse,
  CategoryDetailResponse,
  CollectionResponse,
  LectureResponse,
  PaginationParams,
  PaginatedResponse,
} from "../types";

export async function getAll(): Promise<APIResponse<CategoryResponse[]>> {
  return apiClient.get<CategoryResponse[]>("/categories");
}

export async function getFeatured(): Promise<APIResponse<CategoryResponse[]>> {
  return apiClient.get<CategoryResponse[]>("/categories/featured");
}

export async function getBySlug(
  slug: string
): Promise<APIResponse<CategoryDetailResponse>> {
  return apiClient.get<CategoryDetailResponse>(`/categories/${slug}`);
}

/**
 * Get subcategories of a category
 *
 * @param slug - Parent category slug
 * @returns List of subcategories
 *
 * @example
 * const response = await categoryAPI.getSubcategories('quran');
 */
export async function getSubcategories(
  slug: string
): Promise<APIResponse<CategoryResponse[]>> {
  return apiClient.get<CategoryResponse[]>(`/categories/${slug}/subcategories`);
}

/**
 * Get collections by category (paginated)
 *
 * @param slug - Category slug
 * @param params - Pagination parameters
 * @returns Paginated collections in the category
 *
 * @example
 * const response = await categoryAPI.getCollections('quran', { page: 0, pageSize: 20 });
 */
export async function getCollections(
  slug: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<CollectionResponse>>> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.pageSize !== undefined) {
    searchParams.append("size", params.pageSize.toString());
  }

  const query = searchParams.toString();
  const endpoint = `/categories/${slug}/collections${query ? `?${query}` : ""}`;

  return apiClient.get<PaginatedResponse<CollectionResponse>>(endpoint);
}

/**
 * Get lectures by category (paginated)
 *
 * @param slug - Category slug
 * @param params - Pagination parameters
 * @returns Paginated lectures in the category
 *
 * @example
 * const response = await categoryAPI.getLectures('quran', { page: 0, pageSize: 20 });
 */
export async function getLectures(
  slug: string,
  params?: PaginationParams
): Promise<APIResponse<PaginatedResponse<LectureResponse>>> {
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
  const endpoint = `/categories/${slug}/lectures${query ? `?${query}` : ""}`;

  return apiClient.get<PaginatedResponse<LectureResponse>>(endpoint);
}

/**
 * Exported API object for easier imports
 */
export const categoryAPI = {
  getAll,
  getFeatured,
  getBySlug,
  getSubcategories,
  getCollections,
  getLectures,
};
