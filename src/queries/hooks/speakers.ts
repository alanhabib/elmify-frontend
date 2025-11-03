/**
 * Speaker Query Hooks
 *
 * TanStack Query hooks for speaker data
 * Following Apple Podcasts patterns with React Native optimizations
 *
 * Hooks provided:
 * - useSpeakers() - List of all speakers
 * - useSpeaker() - Single speaker detail
 * - useFeaturedSpeakers() - Featured speakers
 * - useSearchSpeakers() - Search speakers
 * - useSpeakerWithCollections() - Speaker + collections (composed)
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/queries
 */

import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { speakerAPI } from "@/api/endpoints/speakers";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  SpeakerResponse,
  SpeakerDetailResponse,
  PaginationParams,
  APIResponse,
} from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for speaker list queries
 */
interface UseSpeakersOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Options for single speaker queries
 */
interface UseSpeakerOptions {
  enabled?: boolean;
}

/**
 * Search speaker options
 */
interface UseSearchSpeakersOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all speakers (paginated)
 *
 * Features:
 * - Automatic caching (1 hour)
 * - Automatic refetch on mount
 * - Background refetch when stale
 * - Deduplication (multiple components can use same query)
 *
 * @example
 * ```tsx
 * function SpeakersScreen() {
 *   const { data: speakers, isLoading, error } = useSpeakers();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage />;
 *
 *   return <SpeakerList speakers={speakers} />;
 * }
 * ```
 */
export function useSpeakers(options: UseSpeakersOptions = {}) {
  const { enabled = true, params } = options;

  return useQuery({
    queryKey: queryKeys.speakers.list(params as any),
    queryFn: async () => {
      const response = await speakerAPI.getAll(params);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch speakers");
      }

      // Return paginated response with data and pagination metadata
      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.speakers.staleTime,
    gcTime: CACHE_TIMES.speakers.gcTime,
    retry: 2,
    refetchOnMount: false, // Fixed: Don't refetch if data is still fresh (staleTime)
    refetchOnReconnect: true,
    refetchOnWindowFocus: false, // Disabled for React Native
    // Transform data to extract speakers array for backward compatibility
    // Structural sharing is enabled by default, so this should maintain reference stability
    select: (data) => data?.data || [],
  });
}

/**
 * Get single speaker by ID
 *
 * Features:
 * - Optimistic: Checks cache first
 * - Falls back to API if not cached
 * - Automatic caching
 *
 * @example
 * ```tsx
 * function SpeakerDetailScreen({ id }) {
 *   const { data: speaker, isLoading } = useSpeaker(id);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <SpeakerProfile speaker={speaker} />;
 * }
 * ```
 */
export function useSpeaker(
  id: string | undefined,
  options: UseSpeakerOptions = {}
) {
  const { enabled = !!id } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.speakers.detail(id!),
    queryFn: async () => {
      console.log('[useSpeaker] Fetching speaker with id:', id);

      try {
        // Fetch from API directly (skip cache optimization for now)
        console.log('[useSpeaker] Fetching from API...');
        const response = await speakerAPI.getById(id!);

        console.log('[useSpeaker] API Response:', response);

        if (response.error || !response.success) {
          console.error('[useSpeaker] API Error:', response.error);
          console.error('[useSpeaker] Full error response:', response);
          throw new Error(response.error || "Speaker not found");
        }

        if (!response.data) {
          console.error('[useSpeaker] No data in response');
          throw new Error("Speaker not found");
        }

        console.log('[useSpeaker] Success! Speaker data:', response.data);
        return response.data;
      } catch (error) {
        console.error('[useSpeaker] Exception caught:', error);
        throw error;
      }
    },
    enabled,
    staleTime: CACHE_TIMES.speakers.staleTime,
    gcTime: CACHE_TIMES.speakers.gcTime,
  });
}

/**
 * Get featured speakers
 *
 * @example
 * ```tsx
 * function DiscoveryScreen() {
 *   const { data: featured } = useFeaturedSpeakers();
 *
 *   return <FeaturedSection speakers={featured} />;
 * }
 * ```
 */
export function useFeaturedSpeakers() {
  return useQuery({
    queryKey: queryKeys.speakers.list({ featured: true }),
    queryFn: async () => {
      const response = await speakerAPI.getFeatured();

      if (response.error || !response.success) {
        console.warn("Failed to fetch featured speakers:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    staleTime: CACHE_TIMES.speakers.staleTime,
    gcTime: CACHE_TIMES.speakers.gcTime,
    // Extract just the speakers array
    select: (data) => data.data,
  });
}

/**
 * Search speakers by name
 *
 * Features:
 * - Debounced search (implement in component)
 * - Cached results per query
 * - Can be disabled when query is empty
 *
 * @example
 * ```tsx
 * function SearchScreen() {
 *   const [query, setQuery] = useState('');
 *   const { data: results, isLoading } = useSearchSpeakers(query, {
 *     enabled: query.length >= 3,
 *   });
 *
 *   return <SearchResults results={results} />;
 * }
 * ```
 */
export function useSearchSpeakers(
  query: string,
  options: UseSearchSpeakersOptions = {}
) {
  const { enabled = query.length >= 2, params } = options;

  return useQuery({
    queryKey: queryKeys.search.query(query, "speakers"),
    queryFn: async () => {
      const response = await speakerAPI.search(query, params);

      if (response.error || !response.success) {
        console.warn("Search failed:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
    gcTime: 1000 * 60 * 10,
    // Extract just the speakers array
    select: (data) => data.data,
  });
}

/**
 * Prefetch speaker data
 *
 * Use this to prefetch speaker before user navigates
 * Improves perceived performance
 *
 * @example
 * ```tsx
 * function SpeakerCard({ speaker }) {
 *   const prefetch = usePrefetchSpeaker();
 *
 *   return (
 *     <Pressable
 *       onPressIn={() => prefetch(speaker.id)} // Prefetch on touch
 *       onPress={() => navigate('/speaker/' + speaker.id)}
 *     >
 *       <Text>{speaker.name}</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function usePrefetchSpeaker() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.speakers.detail(id),
      queryFn: async () => {
        const response = await speakerAPI.getById(id);
        return response.data;
      },
      staleTime: CACHE_TIMES.speakers.staleTime,
    });
  };
}

// ============================================================================
// COMPOSED HOOKS (Advanced)
// ============================================================================

/**
 * Get speaker with collections
 *
 * This is a composed hook that will be fully implemented
 * when we migrate collections in the next phase.
 *
 * For now, it just returns the speaker data.
 *
 * @example
 * ```tsx
 * function SpeakerDetailScreen({ id }) {
 *   const { speaker, collections, isLoading } = useSpeakerWithCollections(id);
 *
 *   return (
 *     <View>
 *       <SpeakerHeader speaker={speaker} />
 *       <CollectionsList collections={collections} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useSpeakerWithCollections(id: string | undefined) {
  const speakerQuery = useSpeaker(id);

  // TODO: Add collections query when we migrate collections
  // const collectionsQuery = useCollectionsBySpeaker(id);

  return {
    speaker: speakerQuery.data,
    collections: [], // Will be populated after collections migration
    isLoading: speakerQuery.isLoading,
    isError: speakerQuery.isError,
    error: speakerQuery.error,
  };
}

/**
 * Type exports for use in components
 */
export type { UseSpeakersOptions, UseSpeakerOptions, UseSearchSpeakersOptions };
