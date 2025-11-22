/**
 * Query Key Factory
 *
 * Centralized query key management following TanStack Query best practices
 *
 * Benefits:
 * - Type-safe query keys
 * - Consistent naming across the app
 * - Easy cache invalidation
 * - Hierarchical structure for granular control
 *
 * Pattern:
 * ['entity'] → Root level (invalidates ALL entity data)
 * ['entity', 'list'] → All lists
 * ['entity', 'list', { filters }] → Specific filtered list
 * ['entity', 'detail'] → All details
 * ['entity', 'detail', id] → Specific detail
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

import type { PaginationParams } from '@/api/types';

/**
 * Query Keys Factory
 *
 * Usage:
 * ```ts
 * // In a hook
 * queryKey: queryKeys.speakers.list()
 * queryKey: queryKeys.speakers.detail('123')
 *
 * // Invalidation
 * queryClient.invalidateQueries({ queryKey: queryKeys.speakers.all })
 * queryClient.invalidateQueries({ queryKey: queryKeys.speakers.detail('123') })
 * ```
 */
export const queryKeys = {
  // ==========================================================================
  // CATEGORIES
  // ==========================================================================

  categories: {
    /**
     * Root key for all category queries
     * Invalidating this invalidates ALL category data
     */
    all: ['categories'] as const,

    /**
     * All category lists
     */
    lists: () => [...queryKeys.categories.all, 'list'] as const,

    /**
     * All top-level categories
     */
    list: () => [...queryKeys.categories.lists(), 'all'] as const,

    /**
     * Featured categories
     */
    featured: () => [...queryKeys.categories.lists(), 'featured'] as const,

    /**
     * All category details
     */
    details: () => [...queryKeys.categories.all, 'detail'] as const,

    /**
     * Specific category detail by slug
     * @example
     * queryKeys.categories.detail('quran')
     */
    detail: (slug: string) => [...queryKeys.categories.details(), slug] as const,

    /**
     * Subcategories of a category
     * @example
     * queryKeys.categories.subcategories('quran')
     */
    subcategories: (slug: string) =>
      [...queryKeys.categories.detail(slug), 'subcategories'] as const,

    /**
     * Lectures in a category
     * @example
     * queryKeys.categories.lectures('quran')
     */
    lectures: (slug: string, params?: PaginationParams) =>
      [...queryKeys.categories.detail(slug), 'lectures', params || {}] as const,
  },

  // ==========================================================================
  // SPEAKERS
  // ==========================================================================

  speakers: {
    /**
     * Root key for all speaker queries
     * Invalidating this invalidates ALL speaker data
     */
    all: ['speakers'] as const,

    /**
     * All speaker lists (various filters/pagination)
     */
    lists: () => [...queryKeys.speakers.all, 'list'] as const,

    /**
     * Specific speaker list with filters
     * @example
     * queryKeys.speakers.list({ page: 1, limit: 20 })
     * queryKeys.speakers.list({ featured: true })
     */
    list: (params?: PaginationParams & Record<string, unknown>) =>
      [...queryKeys.speakers.lists(), params || {}] as const,

    /**
     * All speaker details
     */
    details: () => [...queryKeys.speakers.all, 'detail'] as const,

    /**
     * Specific speaker detail
     * @example
     * queryKeys.speakers.detail('123')
     */
    detail: (id: string) => [...queryKeys.speakers.details(), id] as const,

    /**
     * Speaker with nested collections
     * For composed queries
     * @example
     * queryKeys.speakers.withCollections('123')
     */
    withCollections: (id: string) =>
      [...queryKeys.speakers.detail(id), 'collections'] as const,
  },

  // ==========================================================================
  // COLLECTIONS
  // ==========================================================================

  collections: {
    /**
     * Root key for all collection queries
     */
    all: ['collections'] as const,

    /**
     * All collection lists
     */
    lists: () => [...queryKeys.collections.all, 'list'] as const,

    /**
     * Specific collection list
     */
    list: (params?: PaginationParams & Record<string, unknown>) =>
      [...queryKeys.collections.lists(), params || {}] as const,

    /**
     * Collections by speaker
     * Common query pattern
     * @example
     * queryKeys.collections.bySpeaker('123')
     * queryKeys.collections.bySpeaker('123', { page: 0 })
     */
    bySpeaker: (speakerId: string, params?: PaginationParams) =>
      [...queryKeys.collections.lists(), 'speaker', speakerId, params || {}] as const,

    /**
     * All collection details
     */
    details: () => [...queryKeys.collections.all, 'detail'] as const,

    /**
     * Specific collection detail
     */
    detail: (id: string) => [...queryKeys.collections.details(), id] as const,

    /**
     * Collection with nested lectures
     * For composed queries
     */
    withLectures: (id: string) =>
      [...queryKeys.collections.detail(id), 'lectures'] as const,
  },

  // ==========================================================================
  // LECTURES
  // ==========================================================================

  lectures: {
    /**
     * Root key for all lecture queries
     */
    all: ['lectures'] as const,

    /**
     * All lecture lists
     */
    lists: () => [...queryKeys.lectures.all, 'list'] as const,

    /**
     * Specific lecture list
     */
    list: (params?: PaginationParams & Record<string, unknown>) =>
      [...queryKeys.lectures.lists(), params || {}] as const,

    /**
     * Lectures by collection
     * Most common query pattern
     * @example
     * queryKeys.lectures.byCollection('456')
     */
    byCollection: (collectionId: string) =>
      [...queryKeys.lectures.lists(), 'collection', collectionId] as const,

    /**
     * Lectures by speaker (across all collections)
     * Less common but useful for speaker page
     */
    bySpeaker: (speakerId: string) =>
      [...queryKeys.lectures.lists(), 'speaker', speakerId] as const,

    /**
     * All lecture details
     */
    details: () => [...queryKeys.lectures.all, 'detail'] as const,

    /**
     * Specific lecture detail
     */
    detail: (id: string) => [...queryKeys.lectures.details(), id] as const,

    /**
     * Trending lectures
     * Special list for discovery
     */
    trending: (limit?: number) =>
      [...queryKeys.lectures.lists(), 'trending', { limit }] as const,

    /**
     * Recent lectures
     * Special list for discovery
     */
    recent: (limit?: number) =>
      [...queryKeys.lectures.lists(), 'recent', { limit }] as const,
  },

  // ==========================================================================
  // USER FEATURES - FAVORITES
  // ==========================================================================

  favorites: {
    /**
     * Root key for all favorites
     */
    all: ['favorites'] as const,

    /**
     * All favorite lists
     */
    lists: () => [...queryKeys.favorites.all, 'list'] as const,

    /**
     * Specific favorite list with pagination
     * @example
     * queryKeys.favorites.list({ page: 0, size: 20 })
     */
    list: (params?: PaginationParams & Record<string, unknown>) =>
      [...queryKeys.favorites.lists(), params || {}] as const,

    /**
     * Check if a lecture is favorited
     * @example
     * queryKeys.favorites.check('123')
     */
    check: (lectureId: string) =>
      [...queryKeys.favorites.all, 'check', lectureId] as const,

    /**
     * Total favorites count
     */
    count: () => [...queryKeys.favorites.all, 'count'] as const,
  },

  // ==========================================================================
  // USER FEATURES - PLAYBACK
  // ==========================================================================

  playback: {
    /**
     * Root key for all playback data
     */
    all: ['playback'] as const,

    /**
     * All playback positions
     */
    positions: () => [...queryKeys.playback.all, 'positions'] as const,

    /**
     * Playback position for specific lecture
     * @example
     * queryKeys.playback.position('789')
     */
    position: (lectureId: string) =>
      [...queryKeys.playback.positions(), lectureId] as const,

    /**
     * Play history
     */
    history: () => [...queryKeys.playback.all, 'history'] as const,

    /**
     * Continue listening (lectures in progress)
     */
    continueListening: () =>
      [...queryKeys.playback.all, 'continue-listening'] as const,

    /**
     * Recent lectures (most recently played)
     * @example
     * queryKeys.playback.recent(10)
     */
    recent: (limit?: number) =>
      [...queryKeys.playback.all, 'recent', { limit }] as const,
  },

  // ==========================================================================
  // SEARCH
  // ==========================================================================

  search: {
    /**
     * Root key for all search queries
     */
    all: ['search'] as const,

    /**
     * Search results
     * @example
     * queryKeys.search.query('jordan peterson', 'all')
     */
    query: (query: string, type?: 'speakers' | 'collections' | 'lectures' | 'all') =>
      [...queryKeys.search.all, { query, type }] as const,
  },

  // ==========================================================================
  // USER
  // ==========================================================================

  user: {
    /**
     * Root key for all user data
     */
    all: ['user'] as const,

    /**
     * Current user profile
     */
    profile: () => [...queryKeys.user.all, 'profile'] as const,

    /**
     * User settings
     */
    settings: () => [...queryKeys.user.all, 'settings'] as const,

    /**
     * User preferences
     */
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },

  // ==========================================================================
  // STATS (Listening Statistics)
  // ==========================================================================

  stats: {
    /**
     * Root key for all stats data
     */
    all: () => ['stats'] as const,

    /**
     * Daily summary (today's progress)
     */
    dailySummary: () => [...queryKeys.stats.all(), 'daily-summary'] as const,

    /**
     * Streaks (current and best)
     */
    streaks: () => [...queryKeys.stats.all(), 'streaks'] as const,

    /**
     * Weekly progress (last 7 days)
     */
    weeklyProgress: () => [...queryKeys.stats.all(), 'weekly-progress'] as const,

    /**
     * Total listening time
     */
    totalTime: () => [...queryKeys.stats.all(), 'total-time'] as const,
  },

  // ==========================================================================
  // STREAMING (MinIO)
  // ==========================================================================

  streaming: {
    /**
     * Root key for all streaming URLs
     */
    all: ['streaming'] as const,

    /**
     * Audio stream URLs (presigned URLs for lecture audio)
     * @example
     * queryKeys.streaming.audio('123')
     */
    audio: (lectureId: string) =>
      [...queryKeys.streaming.all, 'audio', lectureId] as const,

    /**
     * Image stream URLs (presigned URLs for images)
     * @example
     * queryKeys.streaming.image('speaker', '123')
     * queryKeys.streaming.image('collection', '456')
     */
    image: (type: 'speaker' | 'collection' | 'lecture', id: string) =>
      [...queryKeys.streaming.all, 'image', type, id] as const,
  },
} as const;

/**
 * Type helpers for better TypeScript support
 */
export type QueryKeys = typeof queryKeys;

/**
 * Extract query key types for type-safe hooks
 * Fixed: Only use function properties for ReturnType
 */
export type SpeakerQueryKey =
  | ReturnType<typeof queryKeys.speakers.lists>
  | ReturnType<typeof queryKeys.speakers.list>
  | ReturnType<typeof queryKeys.speakers.details>
  | ReturnType<typeof queryKeys.speakers.detail>;

export type CollectionQueryKey =
  | ReturnType<typeof queryKeys.collections.lists>
  | ReturnType<typeof queryKeys.collections.list>
  | ReturnType<typeof queryKeys.collections.details>
  | ReturnType<typeof queryKeys.collections.detail>;

export type LectureQueryKey =
  | ReturnType<typeof queryKeys.lectures.lists>
  | ReturnType<typeof queryKeys.lectures.list>
  | ReturnType<typeof queryKeys.lectures.details>
  | ReturnType<typeof queryKeys.lectures.detail>;

/**
 * Utility function to create custom query keys following the pattern
 * Use this if you need entity-specific keys not covered above
 *
 * @example
 * const customKey = createQueryKey('analytics', 'dashboard', { period: '30d' });
 */
export function createQueryKey<T extends readonly unknown[]>(...parts: T): T {
  return parts;
}
