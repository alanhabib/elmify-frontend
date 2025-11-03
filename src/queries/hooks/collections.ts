/**
 * Collection Query Hooks
 *
 * TanStack Query hooks for collection data
 * Following the same pattern as speakers hooks
 *
 * Hooks provided:
 * - useCollections() - List of all collections
 * - useCollection() - Single collection detail
 * - useCollectionsBySpeaker() - Collections for a specific speaker
 * - useFeaturedCollections() - Featured collections
 * - useSearchCollections() - Search collections
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/queries
 */

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { collectionAPI } from "@/api/endpoints/collections";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  CollectionResponse,
  CollectionDetailResponse,
  PaginationParams,
} from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for collection list queries
 */
interface UseCollectionsOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Options for single collection queries
 */
interface UseCollectionOptions {
  enabled?: boolean;
}

/**
 * Options for speaker collections queries
 */
interface UseCollectionsBySpeakerOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Search collection options
 */
interface UseSearchCollectionsOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all collections (paginated)
 *
 * Features:
 * - Automatic caching (30 minutes)
 * - Background refetch when stale
 * - Deduplication across components
 *
 * @example
 * ```tsx
 * function CollectionsScreen() {
 *   const { data: collections, isLoading, error } = useCollections();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage />;
 *
 *   return <CollectionList collections={collections} />;
 * }
 * ```
 */
export function useCollections(options: UseCollectionsOptions = {}) {
  const { enabled = true, params } = options;

  return useQuery({
    queryKey: queryKeys.collections.list(params as any),
    queryFn: async () => {
      const response = await collectionAPI.getAll(params);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch collections");
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.collections.staleTime,
    gcTime: CACHE_TIMES.collections.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    // Extract just the collections array
    select: (data) => data?.data || [],
  });
}

/**
 * Get single collection by ID
 *
 * Features:
 * - Optimistic: Checks cache first
 * - Falls back to API if not cached
 * - Automatic caching
 *
 * @example
 * ```tsx
 * function CollectionDetailScreen({ id }) {
 *   const { data: collection, isLoading } = useCollection(id);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <CollectionProfile collection={collection} />;
 * }
 * ```
 */
export function useCollection(
  id: string | undefined,
  options: UseCollectionOptions = {}
) {
  const { enabled = !!id } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.collections.detail(id!),
    queryFn: async () => {
      console.log('[useCollection] queryFn called for ID:', id);
      console.log('[useCollection] Enabled:', enabled);

      // Skip cache lookup and always fetch from API for now
      console.log('[useCollection] Fetching from API...');
      const response = await collectionAPI.getById(id!);
      console.log('[useCollection] API Response:', response);

      if (response.error || !response.success) {
        console.error('[useCollection] API Error:', response.error);
        throw new Error(response.error || "Collection not found");
      }

      if (!response.data) {
        console.error('[useCollection] No data in response');
        throw new Error("Collection not found");
      }

      console.log('[useCollection] Success! Collection data:', response.data);
      return response.data;
    },
    enabled,
    staleTime: CACHE_TIMES.collections.staleTime,
    gcTime: CACHE_TIMES.collections.gcTime,
  });
}

/**
 * Get collections by speaker ID
 *
 * @example
 * ```tsx
 * function SpeakerCollections({ speakerId }) {
 *   const { data: collections } = useCollectionsBySpeaker(speakerId);
 *
 *   return <CollectionsList collections={collections} />;
 * }
 * ```
 */
export function useCollectionsBySpeaker(
  speakerId: string | undefined,
  options: UseCollectionsBySpeakerOptions = {}
) {
  const { enabled = !!speakerId, params } = options;

  return useQuery({
    queryKey: queryKeys.collections.bySpeaker(speakerId!, params as any),
    queryFn: async () => {
      console.log('[useCollectionsBySpeaker] Fetching collections for speaker:', speakerId);
      console.log('[useCollectionsBySpeaker] Params:', params);

      try {
        const response = await collectionAPI.getBySpeaker(speakerId!, params);

        console.log('[useCollectionsBySpeaker] Response:', response);

        if (response.error || !response.success) {
          console.error('[useCollectionsBySpeaker] Failed to fetch speaker collections:', response.error);
          console.error('[useCollectionsBySpeaker] Full error response:', response);
          return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
        }

        console.log('[useCollectionsBySpeaker] Success! Collections data:', response.data);
        return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      } catch (error) {
        console.error('[useCollectionsBySpeaker] Exception caught:', error);
        throw error;
      }
    },
    enabled,
    staleTime: CACHE_TIMES.collections.staleTime,
    gcTime: CACHE_TIMES.collections.gcTime,
    // Extract just the collections array
    select: (data) => data.data,
  });
}

/**
 * Get featured collections
 *
 * @example
 * ```tsx
 * function DiscoveryScreen() {
 *   const { data: featured } = useFeaturedCollections();
 *
 *   return <FeaturedSection collections={featured} />;
 * }
 * ```
 */
export function useFeaturedCollections() {
  return useQuery({
    queryKey: queryKeys.collections.list({ featured: true }),
    queryFn: async () => {
      const response = await collectionAPI.getFeatured();

      if (response.error || !response.success) {
        console.warn("Failed to fetch featured collections:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    staleTime: CACHE_TIMES.collections.staleTime,
    gcTime: CACHE_TIMES.collections.gcTime,
    // Extract just the collections array
    select: (data) => data.data,
  });
}

/**
 * Search collections by title
 *
 * @example
 * ```tsx
 * function SearchScreen() {
 *   const [query, setQuery] = useState('');
 *   const { data: results, isLoading } = useSearchCollections(query, {
 *     enabled: query.length >= 3,
 *   });
 *
 *   return <SearchResults results={results} />;
 * }
 * ```
 */
export function useSearchCollections(
  query: string,
  options: UseSearchCollectionsOptions = {}
) {
  const { enabled = query.length >= 2, params } = options;

  return useQuery({
    queryKey: queryKeys.search.query(query, "collections"),
    queryFn: async () => {
      const response = await collectionAPI.search(query, params);

      if (response.error || !response.success) {
        console.warn("Search failed:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
    gcTime: 1000 * 60 * 10,
    // Extract just the collections array
    select: (data) => data.data,
  });
}

/**
 * Prefetch collection data
 *
 * @example
 * ```tsx
 * function CollectionCard({ collection }) {
 *   const prefetch = usePrefetchCollection();
 *
 *   return (
 *     <Pressable
 *       onPressIn={() => prefetch(collection.id)}
 *       onPress={() => navigate('/collection/' + collection.id)}
 *     >
 *       <Text>{collection.title}</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function usePrefetchCollection() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.collections.detail(id),
      queryFn: async () => {
        const response = await collectionAPI.getById(id);
        return response.data;
      },
      staleTime: CACHE_TIMES.collections.staleTime,
    });
  };
}

/**
 * Type exports for use in components
 */
export type {
  UseCollectionsOptions,
  UseCollectionOptions,
  UseCollectionsBySpeakerOptions,
  UseSearchCollectionsOptions,
};
