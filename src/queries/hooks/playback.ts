/**
 * Playback Position Query Hooks
 *
 * TanStack Query hooks for playback positions
 * All hooks require authentication
 *
 * Hooks provided:
 * - usePlaybackPosition() - Get position for specific lecture
 * - useContinueListening() - Get lectures to continue listening
 * - useUpdatePosition() - Mutation to update position
 * - useDeletePosition() - Mutation to delete position
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { playbackAPI } from "@/api/endpoints/playback";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type { PlaybackPositionResponse, PlaybackPositionWithLectureResponse } from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

interface UsePlaybackPositionOptions {
  enabled?: boolean;
}

interface UseContinueListeningOptions {
  enabled?: boolean;
}

interface UseRecentLecturesOptions {
  enabled?: boolean;
  limit?: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get playback position for a specific lecture
 */
export function usePlaybackPosition(
  lectureId: string | undefined,
  options: UsePlaybackPositionOptions = {}
) {
  const { enabled = !!lectureId } = options;

  return useQuery({
    queryKey: queryKeys.playback.position(lectureId!),
    queryFn: async () => {
      const response = await playbackAPI.getPosition(lectureId!);

      if (response.error || !response.success) {
        // Return null if no position found (404 is expected)
        if (response.status === 404) {
          return null;
        }
        throw new Error(response.error || "Failed to fetch playback position");
      }

      return response.data || null;
    },
    enabled,
    staleTime: CACHE_TIMES.playback.staleTime,
    gcTime: CACHE_TIMES.playback.gcTime,
  });
}

/**
 * Get lectures to continue listening
 */
export function useContinueListening(options: UseContinueListeningOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.playback.continueListening(),
    queryFn: async () => {
      const response = await playbackAPI.getContinueListening();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch continue listening");
      }

      return response.data || [];
    },
    enabled,
    staleTime: CACHE_TIMES.playback.staleTime,
    gcTime: CACHE_TIMES.playback.gcTime,
  });
}

/**
 * Get recent lectures (most recently played)
 * Returns lectures with full details and progress information
 */
export function useRecentLectures(options: UseRecentLecturesOptions = {}) {
  const { enabled = true, limit = 10 } = options;

  return useQuery({
    queryKey: queryKeys.playback.recent(limit),
    queryFn: async () => {
      const response = await playbackAPI.getRecentLectures(limit);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch recent lectures");
      }

      return response.data || [];
    },
    enabled,
    staleTime: CACHE_TIMES.playback.staleTime,
    gcTime: CACHE_TIMES.playback.gcTime,
  });
}

/**
 * Update playback position for a lecture
 * Optimistically updates the cache
 */
export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lectureId,
      currentPosition,
    }: {
      lectureId: string;
      currentPosition: number;
    }) => {
      const response = await playbackAPI.updatePosition(lectureId, currentPosition);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to update playback position");
      }

      return response.data;
    },
    onMutate: async ({ lectureId, currentPosition }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.playback.position(lectureId) });

      // Snapshot previous value
      const previousPosition = queryClient.getQueryData<PlaybackPositionResponse>(
        queryKeys.playback.position(lectureId)
      );

      // Optimistically update
      queryClient.setQueryData<PlaybackPositionResponse>(
        queryKeys.playback.position(lectureId),
        (old) => ({
          userId: old?.userId || "",
          lectureId: parseInt(lectureId),
          currentPosition,
          lastUpdated: new Date().toISOString(),
        })
      );

      return { previousPosition };
    },
    onError: (_err, { lectureId }, context) => {
      // Rollback on error
      if (context?.previousPosition) {
        queryClient.setQueryData(
          queryKeys.playback.position(lectureId),
          context.previousPosition
        );
      }
    },
    onSuccess: (_, { lectureId }) => {
      // Invalidate continue listening (position update may add/remove from list)
      queryClient.invalidateQueries({ queryKey: queryKeys.playback.continueListening() });
    },
  });
}

/**
 * Delete playback position for a lecture
 */
export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      const response = await playbackAPI.deletePosition(lectureId);

      if (response.error) {
        throw new Error(response.error || "Failed to delete playback position");
      }
    },
    onSuccess: (_, lectureId) => {
      // Remove from cache
      queryClient.setQueryData(queryKeys.playback.position(lectureId), null);

      // Invalidate continue listening
      queryClient.invalidateQueries({ queryKey: queryKeys.playback.continueListening() });
    },
  });
}

/**
 * Type exports
 */
export type {
  UsePlaybackPositionOptions,
  UseContinueListeningOptions,
  UseRecentLecturesOptions,
};
