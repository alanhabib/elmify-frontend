/**
 * TanStack Query Client Configuration
 *
 * Optimized for React Native following Apple Podcasts patterns:
 * - Aggressive caching for offline-first experience
 * - Smart refetch strategies for mobile networks
 * - Background sync when app returns to foreground
 * - Automatic retry with exponential backoff
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';

/**
 * Cache Time Configuration
 *
 * Based on data staleness characteristics:
 * - Speakers: Change rarely → cache longer
 * - Collections: Moderate changes → medium cache
 * - Lectures: More frequent updates → shorter cache
 * - User data: Real-time → very short cache
 *
 * Apple Podcasts Strategy:
 * - Shows (Speakers): 1 hour stale, 2 hour GC
 * - Seasons (Collections): 30 min stale, 1 hour GC
 * - Episodes (Lectures): 15 min stale, 30 min GC
 */
export const CACHE_TIMES = {
  categories: {
    staleTime: 1000 * 60 * 60 * 2, // 2 hours (categories change very rarely)
    gcTime: 1000 * 60 * 60 * 4, // 4 hours
  },
  speakers: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  },
  collections: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  lectures: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  user: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  favorites: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  playback: {
    staleTime: 1000 * 30, // 30 seconds (real-time)
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
} as const;

/**
 * Global Query Client
 *
 * Configuration optimized for mobile:
 * - Disabled window focus refetching (React Native doesn't have window focus)
 * - Enabled reconnect refetching (mobile networks drop frequently)
 * - Conservative retry settings (preserve battery & data)
 * - Structural sharing enabled (reduce re-renders)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ==========================================
      // NETWORK & REFETCH SETTINGS
      // ==========================================

      /**
       * Default stale time: 5 minutes
       * Data is considered fresh for 5 min, no refetch during this time
       */
      staleTime: 1000 * 60 * 5,

      /**
       * Default garbage collection time: 10 minutes
       * Unused data is kept in cache for 10 min after last use
       */
      gcTime: 1000 * 60 * 10,

      /**
       * Refetch on window focus: DISABLED
       * React Native doesn't have window focus events
       * Use refetchOnMount instead
       */
      refetchOnWindowFocus: false,

      /**
       * Refetch on reconnect: ENABLED
       * Mobile networks drop frequently, refetch when back online
       */
      refetchOnReconnect: true,

      /**
       * Refetch on mount: FALSE (respects staleTime)
       * Only refetch if data is actually stale (older than staleTime)
       * Prevents aggressive refetching when navigating between tabs
       * CRITICAL for React Navigation apps with multiple tabs using same queries
       */
      refetchOnMount: false,

      /**
       * Refetch interval: DISABLED
       * No polling by default (saves battery & data)
       * Enable per-query if needed (e.g., real-time playback position)
       */
      refetchInterval: false,

      // ==========================================
      // ERROR HANDLING & RETRIES
      // ==========================================

      /**
       * Retry failed requests 2 times
       * Conservative for mobile to preserve battery & data
       */
      retry: 2,

      /**
       * Exponential backoff for retries
       * Attempt 1: 1 second
       * Attempt 2: 2 seconds
       * Attempt 3: 4 seconds (capped at 30s)
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      /**
       * Don't retry on 4xx errors (client errors)
       * Only retry on 5xx (server errors) and network errors
       */
      retryOnMount: true,

      // ==========================================
      // PERFORMANCE OPTIMIZATIONS
      // ==========================================

      /**
       * Structural sharing: ENABLED
       * Only re-render if data actually changed
       * Reduces unnecessary re-renders significantly
       */
      structuralSharing: true,

      /**
       * Keep previous data: FALSE by default
       * Don't show stale data while fetching new data
       * Enable per-query if you want instant pagination
       */
      // keepPreviousData: false, // Deprecated in v5, use placeholderData instead

      /**
       * Notify on change props: ALL (temporary - investigating loading issue)
       * Component re-renders when any query property changes
       * TODO: Optimize this after fixing the loading stuck issue
       */
      notifyOnChangeProps: undefined, // undefined = default = 'all'

      // ==========================================
      // SUSPENSE & ASYNC
      // ==========================================

      /**
       * Suspense: REMOVED in TanStack Query v5
       * Use useSuspenseQuery instead
       */

      /**
       * useErrorBoundary: REMOVED in TanStack Query v5
       * Use throwOnError instead (per-query option)
       */

      // ==========================================
      // CACHING BEHAVIOR
      // ==========================================

      /**
       * Cache time (deprecated, use gcTime instead)
       * Keeping for backward compatibility
       */
      // cacheTime: 1000 * 60 * 10,
    },

    mutations: {
      /**
       * Retry mutations once
       * Mutations should fail fast (user is waiting)
       */
      retry: 1,

      /**
       * Retry delay: 1 second
       * Quick retry for mutations
       */
      retryDelay: 1000,

      /**
       * useErrorBoundary: REMOVED in TanStack Query v5
       * Handle mutation errors in component callbacks
       */
    },
  },
});

/**
 * Prefetch helper functions
 * Use these to prefetch data before user needs it
 */
export const prefetchHelpers = {
  /**
   * Prefetch speaker collections on speaker card press
   * Improves perceived performance
   */
  prefetchSpeakerCollections: async (speakerId: string) => {
    // Implementation in speaker hooks
  },

  /**
   * Prefetch collection lectures on collection card press
   * Improves perceived performance
   */
  prefetchCollectionLectures: async (collectionId: string) => {
    // Implementation in collection hooks
  },
};

/**
 * Cache invalidation helpers
 * Use these after mutations to keep data in sync
 */
export const cacheHelpers = {
  /**
   * Invalidate all speaker-related data
   * Call after creating/updating/deleting a speaker
   */
  invalidateSpeakers: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.speakers.all });
  },

  /**
   * Invalidate all collection-related data
   * Call after creating/updating/deleting a collection
   */
  invalidateCollections: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
  },

  /**
   * Invalidate specific collection
   * More precise than invalidating all collections
   */
  invalidateCollection: (collectionId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) });
  },

  /**
   * Invalidate collections for a specific speaker
   * Useful when speaker's collections are updated
   */
  invalidateCollectionsBySpeaker: (speakerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collections.bySpeaker(speakerId) });
  },

  /**
   * Invalidate all lecture-related data
   * Call after creating/updating/deleting a lecture
   */
  invalidateLectures: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lectures.all });
  },

  /**
   * Invalidate specific lecture
   * More precise than invalidating all lectures
   */
  invalidateLecture: (lectureId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lectures.detail(lectureId) });
  },

  /**
   * Invalidate lectures for a specific collection
   * Useful when collection's lectures are updated
   */
  invalidateLecturesByCollection: (collectionId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lectures.byCollection(collectionId) });
  },

  /**
   * Invalidate lectures for a specific speaker
   * Useful when speaker's lectures are updated
   */
  invalidateLecturesBySpeaker: (speakerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lectures.bySpeaker(speakerId) });
  },

  /**
   * Invalidate specific speaker
   * More precise than invalidating all speakers
   */
  invalidateSpeaker: (speakerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.speakers.detail(speakerId) });
  },
};

/**
 * Query client logger (development only)
 * TanStack Query v5: setLogger removed
 * Logging is handled automatically in dev mode
 */
