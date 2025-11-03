/**
 * Favorites Query Hooks
 *
 * TanStack Query hooks for user favorites
 * All hooks require authentication
 *
 * Hooks provided:
 * - useFavorites() - List of user's favorite lectures
 * - useFavoriteCheck() - Check if a lecture is favorited
 * - useAddFavorite() - Mutation to add a favorite
 * - useRemoveFavorite() - Mutation to remove a favorite
 * - useFavoriteCount() - Total count of user's favorites
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { favoritesAPI } from "@/api/endpoints/favorites";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  FavoriteResponse,
  PaginationParams,
} from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

interface UseFavoritesOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

interface UseFavoriteCheckOptions {
  enabled?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all favorites for the authenticated user
 */
export function useFavorites(options: UseFavoritesOptions = {}) {
  const { enabled = true, params } = options;

  return useQuery({
    queryKey: queryKeys.favorites.list(params as any),
    queryFn: async () => {
      const response = await favoritesAPI.getAll(params);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch favorites");
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.favorites.staleTime,
    gcTime: CACHE_TIMES.favorites.gcTime,
    select: (data) => data?.data || [],
  });
}

/**
 * Check if a specific lecture is favorited
 */
export function useFavoriteCheck(
  lectureId: string | undefined,
  options: UseFavoriteCheckOptions = {}
) {
  const { enabled = !!lectureId } = options;

  return useQuery({
    queryKey: queryKeys.favorites.check(lectureId!),
    queryFn: async () => {
      const response = await favoritesAPI.checkFavorite(lectureId!);

      if (response.error || !response.success) {
        return { isFavorited: false };
      }

      return response.data || { isFavorited: false };
    },
    enabled,
    staleTime: CACHE_TIMES.favorites.staleTime,
    gcTime: CACHE_TIMES.favorites.gcTime,
    select: (data) => data.isFavorited,
  });
}

/**
 * Add a lecture to favorites
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await favoritesAPI.addFavorite(lectureId);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to add favorite");
      }

      return response.data;
    },
    onSuccess: (_, lectureId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });

      // Update the check status for this specific lecture
      queryClient.setQueryData(
        queryKeys.favorites.check(lectureId),
        { isFavorited: true }
      );

      // Invalidate count
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
    },
  });
}

/**
 * Remove a lecture from favorites
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await favoritesAPI.removeFavorite(lectureId);

      if (response.error) {
        throw new Error(response.error || "Failed to remove favorite");
      }
    },
    onSuccess: (_, lectureId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.lists() });

      // Update the check status for this specific lecture
      queryClient.setQueryData(
        queryKeys.favorites.check(lectureId),
        { isFavorited: false }
      );

      // Invalidate count
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.count() });
    },
  });
}

/**
 * Get total count of user's favorites
 */
export function useFavoriteCount() {
  return useQuery({
    queryKey: queryKeys.favorites.count(),
    queryFn: async () => {
      const response = await favoritesAPI.getCount();

      if (response.error || !response.success) {
        return { count: 0 };
      }

      return response.data || { count: 0 };
    },
    staleTime: CACHE_TIMES.favorites.staleTime,
    gcTime: CACHE_TIMES.favorites.gcTime,
    select: (data) => data.count,
  });
}

/**
 * Type exports
 */
export type {
  UseFavoritesOptions,
  UseFavoriteCheckOptions,
};
