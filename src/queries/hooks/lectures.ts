/**
 * Lecture Query Hooks
 *
 * TanStack Query hooks for lecture data
 * Following the same pattern as speakers and collections hooks
 *
 * Hooks provided:
 * - useLectures() - List of all lectures
 * - useLecture() - Single lecture detail
 * - useLecturesByCollection() - Lectures in a collection
 * - useLecturesBySpeaker() - Lectures by a speaker (across all collections)
 * - useTrendingLectures() - Trending lectures
 * - useRecentLectures() - Recently added lectures
 * - useSearchLectures() - Search lectures
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/queries
 */

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { lectureAPI } from "@/api/endpoints/lectures";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  LectureResponse,
  LectureDetailResponse,
  PaginationParams,
} from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for lecture list queries
 */
interface UseLecturesOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Options for single lecture queries
 */
interface UseLectureOptions {
  enabled?: boolean;
}

/**
 * Options for collection lectures queries
 */
interface UseLecturesByCollectionOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Options for speaker lectures queries
 */
interface UseLecturesBySpeakerOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Search lecture options
 */
interface UseSearchLecturesOptions {
  enabled?: boolean;
  params?: PaginationParams;
}

/**
 * Trending/Recent lecture options
 */
interface UseTrendingLecturesOptions {
  limit?: number;
  enabled?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all lectures (paginated)
 *
 * Features:
 * - Automatic caching (15 minutes)
 * - Background refetch when stale
 * - Deduplication across components
 *
 * @example
 * ```tsx
 * function LecturesScreen() {
 *   const { data: lectures, isLoading, error } = useLectures();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage />;
 *
 *   return <LectureList lectures={lectures} />;
 * }
 * ```
 */
export function useLectures(options: UseLecturesOptions = {}) {
  const { enabled = true, params } = options;

  return useQuery({
    queryKey: queryKeys.lectures.list(params as any),
    queryFn: async () => {
      const response = await lectureAPI.getAll(params);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch lectures");
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    // Extract just the lectures array
    select: (data) => data?.data || [],
  });
}

/**
 * Get single lecture by ID
 *
 * Features:
 * - Optimistic: Checks cache first
 * - Falls back to API if not cached
 * - Automatic caching
 *
 * @example
 * ```tsx
 * function LectureDetailScreen({ id }) {
 *   const { data: lecture, isLoading } = useLecture(id);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <LecturePlayer lecture={lecture} />;
 * }
 * ```
 */
export function useLecture(
  id: string | undefined,
  options: UseLectureOptions = {}
) {
  const { enabled = !!id } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.lectures.detail(id!),
    queryFn: async () => {
      // Try to get from lectures list cache first (optimization)
      const allLecturesQueries = queryClient.getQueriesData<LectureResponse[]>({
        queryKey: queryKeys.lectures.lists(),
      });

      // Check if lecture exists in any cached list
      for (const [, lectures] of allLecturesQueries) {
        if (lectures && Array.isArray(lectures)) {
          const cachedLecture = lectures.find((l) => l.id.toString() === id);
          if (cachedLecture) {
            return cachedLecture as LectureDetailResponse;
          }
        }
      }

      // Not in cache, fetch from API
      console.log('[useLecture] Fetching lecture from API:', id);
      const response = await lectureAPI.getById(id!);
      console.log('[useLecture] API response:', response);

      if (response.error || !response.success) {
        console.error('[useLecture] Error:', response.error);
        throw new Error(response.error || "Lecture not found");
      }

      if (!response.data) {
        console.error('[useLecture] No data in response');
        throw new Error("Lecture not found");
      }

      console.log('[useLecture] Success! Lecture data:', response.data);
      return response.data;
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
  });
}

/**
 * Get lectures by collection ID
 *
 * @example
 * ```tsx
 * function CollectionLectures({ collectionId }) {
 *   const { data: lectures } = useLecturesByCollection(collectionId);
 *
 *   return <LecturesList lectures={lectures} />;
 * }
 * ```
 */
export function useLecturesByCollection(
  collectionId: string | undefined,
  options: UseLecturesByCollectionOptions = {}
) {
  const { enabled = !!collectionId, params } = options;

  return useQuery({
    queryKey: queryKeys.lectures.byCollection(collectionId!),
    queryFn: async () => {
      const response = await lectureAPI.getByCollection(collectionId!, params);

      if (response.error || !response.success) {
        console.warn("Failed to fetch collection lectures:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    // Extract just the lectures array
    select: (data) => data.data,
  });
}

/**
 * Get lectures by speaker ID (across all collections)
 *
 * @example
 * ```tsx
 * function SpeakerLectures({ speakerId }) {
 *   const { data: lectures } = useLecturesBySpeaker(speakerId);
 *
 *   return <LecturesList lectures={lectures} />;
 * }
 * ```
 */
export function useLecturesBySpeaker(
  speakerId: string | undefined,
  options: UseLecturesBySpeakerOptions = {}
) {
  const { enabled = !!speakerId, params } = options;

  return useQuery({
    queryKey: queryKeys.lectures.bySpeaker(speakerId!),
    queryFn: async () => {
      console.log('[useLecturesBySpeaker] Fetching lectures for speaker:', speakerId);
      console.log('[useLecturesBySpeaker] Params:', params);

      try {
        const response = await lectureAPI.getBySpeaker(speakerId!, params);

        console.log('[useLecturesBySpeaker] Response:', response);

        if (response.error || !response.success) {
          console.error('[useLecturesBySpeaker] Failed to fetch speaker lectures:', response.error);
          console.error('[useLecturesBySpeaker] Full error response:', response);
          return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
        }

        console.log('[useLecturesBySpeaker] Success! Lectures data:', response.data);
        return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      } catch (error) {
        console.error('[useLecturesBySpeaker] Exception caught:', error);
        throw error;
      }
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    // Extract just the lectures array
    select: (data) => data.data,
  });
}

/**
 * Get trending lectures
 *
 * @example
 * ```tsx
 * function DiscoveryScreen() {
 *   const { data: trending } = useTrendingLectures({ limit: 10 });
 *
 *   return <TrendingSection lectures={trending} />;
 * }
 * ```
 */
export function useTrendingLectures(options: UseTrendingLecturesOptions = {}) {
  const { limit = 20, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.lectures.trending(limit),
    queryFn: async () => {
      const response = await lectureAPI.getTrending(limit);

      if (response.error || !response.success) {
        console.warn("Failed to fetch trending lectures:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    // Extract just the lectures array
    select: (data) => data.data,
  });
}

/**
 * Get recent lectures
 *
 * @example
 * ```tsx
 * function DiscoveryScreen() {
 *   const { data: recent } = useRecentLectures({ limit: 10 });
 *
 *   return <RecentSection lectures={recent} />;
 * }
 * ```
 */
export function useRecentLectures(options: UseTrendingLecturesOptions = {}) {
  const { limit = 20, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.lectures.recent(limit),
    queryFn: async () => {
      const response = await lectureAPI.getRecent(limit);

      if (response.error || !response.success) {
        console.warn("Failed to fetch recent lectures:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    // Extract just the lectures array
    select: (data) => data.data,
  });
}

/**
 * Search lectures by title
 *
 * @example
 * ```tsx
 * function SearchScreen() {
 *   const [query, setQuery] = useState('');
 *   const { data: results, isLoading } = useSearchLectures(query, {
 *     enabled: query.length >= 3,
 *   });
 *
 *   return <SearchResults results={results} />;
 * }
 * ```
 */
export function useSearchLectures(
  query: string,
  options: UseSearchLecturesOptions = {}
) {
  const { enabled = query.length >= 2, params } = options;

  return useQuery({
    queryKey: queryKeys.search.query(query, "lectures"),
    queryFn: async () => {
      const response = await lectureAPI.search(query, params);

      if (response.error || !response.success) {
        console.warn("Search failed:", response.error);
        return { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
      }

      return response.data || { data: [], pagination: { currentPage: 0, pageSize: 0, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false } };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
    gcTime: 1000 * 60 * 10,
    // Extract just the lectures array
    select: (data) => data.data,
  });
}

/**
 * Prefetch lecture data
 *
 * @example
 * ```tsx
 * function LectureCard({ lecture }) {
 *   const prefetch = usePrefetchLecture();
 *
 *   return (
 *     <Pressable
 *       onPressIn={() => prefetch(lecture.id)}
 *       onPress={() => navigate('/lecture/' + lecture.id)}
 *     >
 *       <Text>{lecture.title}</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function usePrefetchLecture() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.lectures.detail(id),
      queryFn: async () => {
        const response = await lectureAPI.getById(id);
        return response.data;
      },
      staleTime: CACHE_TIMES.lectures.staleTime,
    });
  };
}

/**
 * Type exports for use in components
 */
export type {
  UseLecturesOptions,
  UseLectureOptions,
  UseLecturesByCollectionOptions,
  UseLecturesBySpeakerOptions,
  UseSearchLecturesOptions,
  UseTrendingLecturesOptions,
};
