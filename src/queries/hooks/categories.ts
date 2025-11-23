/**
 * Category Query Hooks
 *
 * TanStack Query hooks for category data
 * Following Apple Podcasts patterns with React Native optimizations
 *
 * Hooks provided:
 * - useCategories() - All top-level categories
 * - useFeaturedCategories() - Featured categories for homepage
 * - useCategory() - Single category detail with subcategories
 * - useCategoryLectures() - Paginated lectures in a category
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/queries
 */

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { categoryAPI } from "@/api/endpoints/categories";
import { queryKeys } from "@/queries/keys";
import { CACHE_TIMES } from "@/queries/client";
import type {
  CategoryResponse,
  CategoryDetailResponse,
  CollectionResponse,
  LectureResponse,
  PaginationParams,
  PaginatedResponse,
} from "@/api/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for category queries
 */
interface UseCategoryOptions {
  enabled?: boolean;
}

/**
 * Options for category collections query
 */
interface UseCategoryCollectionsOptions {
  enabled?: boolean;
  pageSize?: number;
}

/**
 * Options for category lectures query
 */
interface UseCategoryLecturesOptions {
  enabled?: boolean;
  pageSize?: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all top-level categories
 *
 * Features:
 * - Aggressive caching (2 hours) - categories rarely change
 * - Automatic refetch on reconnect
 * - Deduplication across components
 *
 * @example
 * ```tsx
 * function BrowseScreen() {
 *   const { data: categories, isLoading } = useCategories();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <CategoryGrid categories={categories} />;
 * }
 * ```
 */
export function useCategories(options: UseCategoryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await categoryAPI.getAll();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch categories");
      }

      return response.data || [];
    },
    enabled,
    staleTime: CACHE_TIMES.categories.staleTime,
    gcTime: CACHE_TIMES.categories.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get featured categories for homepage
 *
 * @example
 * ```tsx
 * function HomeScreen() {
 *   const { data: featured } = useFeaturedCategories();
 *
 *   return <FeaturedCategorySection categories={featured} />;
 * }
 * ```
 */
export function useFeaturedCategories(options: UseCategoryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.categories.featured(),
    queryFn: async () => {
      const response = await categoryAPI.getFeatured();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch featured categories");
      }

      return response.data || [];
    },
    enabled,
    staleTime: CACHE_TIMES.categories.staleTime,
    gcTime: CACHE_TIMES.categories.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get single category by slug with subcategories and featured collections
 *
 * @example
 * ```tsx
 * function CategoryScreen({ slug }) {
 *   const { data: category, isLoading } = useCategory(slug);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <View>
 *       <CategoryHeader category={category} />
 *       <SubcategoryList subcategories={category.subcategories} />
 *       <FeaturedCollections collections={category.featuredCollections} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useCategory(
  slug: string | undefined,
  options: UseCategoryOptions = {}
) {
  const { enabled = !!slug } = options;

  return useQuery({
    queryKey: queryKeys.categories.detail(slug!),
    queryFn: async () => {
      const response = await categoryAPI.getBySlug(slug!);

      if (response.error || !response.success) {
        throw new Error(response.error || "Category not found");
      }

      if (!response.data) {
        throw new Error("Category not found");
      }

      return response.data;
    },
    enabled,
    staleTime: CACHE_TIMES.categories.staleTime,
    gcTime: CACHE_TIMES.categories.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get paginated collections for a category
 *
 * Uses infinite query for scroll-to-load pagination
 *
 * @example
 * ```tsx
 * function CategoryScreen({ slug }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *   } = useCategoryCollections(slug);
 *
 *   const collections = data?.pages.flatMap(p => p.data) || [];
 *
 *   return (
 *     <FlatList
 *       data={collections}
 *       onEndReached={() => hasNextPage && fetchNextPage()}
 *     />
 *   );
 * }
 * ```
 */
export function useCategoryCollections(
  slug: string | undefined,
  options: UseCategoryCollectionsOptions = {}
) {
  const { enabled = !!slug, pageSize = 20 } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.categories.collections(slug!, { pageSize }),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await categoryAPI.getCollections(slug!, {
        page: pageParam,
        pageSize,
      });

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch collections");
      }

      return (
        response.data || {
          data: [],
          pagination: {
            currentPage: 0,
            pageSize,
            totalItems: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        }
      );
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPrevious
        ? firstPage.pagination.currentPage - 1
        : undefined,
    staleTime: CACHE_TIMES.collections.staleTime,
    gcTime: CACHE_TIMES.collections.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Get paginated lectures for a category
 *
 * Uses infinite query for scroll-to-load pagination
 *
 * @example
 * ```tsx
 * function CategoryLecturesScreen({ slug }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *   } = useCategoryLectures(slug);
 *
 *   const lectures = data?.pages.flatMap(p => p.data) || [];
 *
 *   return (
 *     <FlatList
 *       data={lectures}
 *       onEndReached={() => hasNextPage && fetchNextPage()}
 *       ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
 *     />
 *   );
 * }
 * ```
 */
export function useCategoryLectures(
  slug: string | undefined,
  options: UseCategoryLecturesOptions = {}
) {
  const { enabled = !!slug, pageSize = 20 } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.categories.lectures(slug!, { pageSize }),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await categoryAPI.getLectures(slug!, {
        page: pageParam,
        pageSize,
      });

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch lectures");
      }

      return (
        response.data || {
          data: [],
          pagination: {
            currentPage: 0,
            pageSize,
            totalItems: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        }
      );
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPrevious
        ? firstPage.pagination.currentPage - 1
        : undefined,
    staleTime: CACHE_TIMES.lectures.staleTime,
    gcTime: CACHE_TIMES.lectures.gcTime,
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Prefetch category data
 *
 * Use this to prefetch category before user navigates
 * Improves perceived performance
 *
 * @example
 * ```tsx
 * function CategoryCard({ category }) {
 *   const prefetch = usePrefetchCategory();
 *
 *   return (
 *     <Pressable
 *       onPressIn={() => prefetch(category.slug)}
 *       onPress={() => navigate('/category/' + category.slug)}
 *     >
 *       <Text>{category.name}</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function usePrefetchCategory() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.detail(slug),
      queryFn: async () => {
        const response = await categoryAPI.getBySlug(slug);
        if (response.error || !response.success || !response.data) {
          throw new Error(response.error || "Failed to prefetch category");
        }
        return response.data;
      },
      staleTime: CACHE_TIMES.categories.staleTime,
    });
  };
}

/**
 * Type exports for use in components
 */
export type { UseCategoryOptions, UseCategoryLecturesOptions };
