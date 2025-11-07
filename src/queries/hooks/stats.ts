/**
 * Stats Query Hooks
 *
 * TanStack Query hooks for listening statistics
 * All hooks require authentication
 *
 * Hooks provided:
 * - useDailySummary() - Get today's listening progress
 * - useStreaks() - Get current and best streaks
 * - useWeeklyProgress() - Get last 7 days progress
 * - useTrackListening() - Mutation to track listening activity
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as statsAPI from "@/api/endpoints/stats";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  DailySummaryResponse,
  StreakResponse,
  WeeklyProgressResponse,
  TrackListeningRequest,
} from "@/api/endpoints/stats";

// ============================================================================
// TYPES
// ============================================================================

interface UseDailySummaryOptions {
  enabled?: boolean;
}

interface UseStreaksOptions {
  enabled?: boolean;
}

interface UseWeeklyProgressOptions {
  enabled?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get daily summary for authenticated user
 * Returns today's listening progress toward daily goal
 *
 * Refreshes every 60 seconds while component is mounted
 */
export function useDailySummary(options: UseDailySummaryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.stats.dailySummary(),
    queryFn: async () => {
      const response = await statsAPI.getDailySummary();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch daily summary");
      }

      return response.data!;
    },
    enabled,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Get user's current and best streaks
 * Streaks are calculated based on consecutive days meeting goals
 */
export function useStreaks(options: UseStreaksOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.stats.streaks(),
    queryFn: async () => {
      const response = await statsAPI.getStreaks();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch streaks");
      }

      return response.data!;
    },
    enabled,
    staleTime: CACHE_TIMES.playback.staleTime,
    gcTime: CACHE_TIMES.playback.gcTime,
  });
}

/**
 * Get weekly progress (last 7 days)
 * Returns day-by-day listening progress
 */
export function useWeeklyProgress(options: UseWeeklyProgressOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.stats.weeklyProgress(),
    queryFn: async () => {
      const response = await statsAPI.getWeeklyProgress();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch weekly progress");
      }

      return response.data!;
    },
    enabled,
    staleTime: CACHE_TIMES.playback.staleTime,
    gcTime: CACHE_TIMES.playback.gcTime,
  });
}

/**
 * Track listening activity
 * Should be called periodically by the audio player (e.g., every 30 seconds)
 *
 * Optimistically updates all stats queries
 */
export function useTrackListening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TrackListeningRequest) => {
      const response = await statsAPI.trackListening(data);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to track listening");
      }
    },
    onSuccess: () => {
      // Invalidate all stats queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all() });
    },
    // Silently fail tracking errors to not disrupt playback
    onError: (error) => {
      // Track listening error - non-critical
    },
  });
}

/**
 * Type exports
 */
export type {
  UseDailySummaryOptions,
  UseStreaksOptions,
  UseWeeklyProgressOptions,
  DailySummaryResponse,
  StreakResponse,
  WeeklyProgressResponse,
};
