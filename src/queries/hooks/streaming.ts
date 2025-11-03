/**
 * Streaming Query Hooks
 *
 * TanStack Query hooks for fetching presigned streaming URLs from MinIO.
 * These hooks handle caching, refetching, and error states for streaming content.
 *
 * Features:
 * - Short cache times (URLs expire after configured duration)
 * - Automatic refetching on mount for fresh URLs
 * - Error handling with graceful fallbacks
 * - Loading states for UX
 *
 * @module queries/hooks/streaming
 */

import { useQuery } from '@tanstack/react-query';
import { streamingAPI } from '@/api/endpoints/streaming';
import { queryKeys } from '@/queries/keys';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for audio stream URL queries
 */
interface UseAudioStreamUrlOptions {
  enabled?: boolean;
}

/**
 * Options for image stream URL queries
 */
interface UseImageStreamUrlOptions {
  enabled?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get audio stream URL for a lecture
 *
 * Fetches a presigned URL from MinIO for streaming lecture audio.
 * URLs are cached for 5 minutes but refetched on mount to ensure freshness.
 *
 * Features:
 * - Presigned URLs expire, so cache time is short (5 minutes)
 * - Refetch on mount to get fresh URL when player is opened
 * - Disabled by default (only fetch when explicitly enabled)
 * - Retry failed requests up to 2 times
 *
 * @param lectureId - ID of the lecture to stream
 * @param options - Query options (enabled by default is false)
 * @returns Query result with audio stream URL
 *
 * @example
 * ```tsx
 * function Player({ lectureId }) {
 *   const { data: streamUrl, isLoading, error } = useAudioStreamUrl(lectureId, {
 *     enabled: !!lectureId,
 *   });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage />;
 *   if (!streamUrl) return null;
 *
 *   return <AudioPlayer url={streamUrl} />;
 * }
 * ```
 */
export function useAudioStreamUrl(
  lectureId: string | undefined,
  options: UseAudioStreamUrlOptions = {}
) {
  const { enabled = false } = options;

  return useQuery({
    queryKey: queryKeys.streaming.audio(lectureId!),
    queryFn: async () => {
      console.log('[useAudioStreamUrl] Fetching stream URL for lecture:', lectureId);

      const response = await streamingAPI.getAudioStreamUrl(lectureId!);

      if (response.error || !response.success) {
        console.error('[useAudioStreamUrl] Failed to get stream URL:', response.error);
        throw new Error(response.error || 'Failed to get audio stream URL');
      }

      if (!response.data?.url) {
        console.error('[useAudioStreamUrl] No URL in response');
        throw new Error('No stream URL returned');
      }

      console.log('[useAudioStreamUrl] Successfully fetched stream URL');
      return response.data.url;
    },
    enabled: enabled && !!lectureId,
    // Presigned URLs expire, so cache for shorter time
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: true, // Always get fresh URL when component mounts
    refetchOnReconnect: true, // Get fresh URL after network reconnection
    refetchOnWindowFocus: false, // Disabled for React Native
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Get image stream URL for speakers, collections, or lectures
 *
 * Fetches presigned URLs from MinIO for displaying images.
 * Images change less frequently than audio URLs, so cache time is longer (30 min).
 *
 * Features:
 * - Longer cache time (30 minutes) as images change less frequently
 * - Returns null on error (allows fallback to placeholder images)
 * - Only retries once (images can use fallbacks)
 * - Enabled by default
 *
 * @param type - Type of image (speaker, collection, lecture)
 * @param id - ID of the resource
 * @param options - Query options
 * @returns Query result with image stream URL (or null on error)
 *
 * @example
 * ```tsx
 * function SpeakerAvatar({ speakerId }) {
 *   const { data: imageUrl } = useImageStreamUrl('speaker', speakerId);
 *
 *   return (
 *     <Image
 *       source={{ uri: imageUrl || 'https://placeholder.com/avatar.jpg' }}
 *     />
 *   );
 * }
 * ```
 *
 * @todo Backend endpoints need to be implemented:
 * - GET /api/v1/speakers/{id}/image-url
 * - GET /api/v1/collections/{id}/image-url
 * - GET /api/v1/lectures/{id}/thumbnail-url
 */
export function useImageStreamUrl(
  type: 'speaker' | 'collection' | 'lecture',
  id: string | undefined,
  options: UseImageStreamUrlOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.streaming.image(type, id!),
    queryFn: async () => {
      console.log(`[useImageStreamUrl] Fetching ${type} image URL for ID:`, id);

      const response = await streamingAPI.getImageStreamUrl(type, id!);

      if (response.error || !response.success) {
        console.warn(`[useImageStreamUrl] Failed to get ${type} image URL:`, response.error);
        // Return null instead of throwing - allows fallback to placeholder
        return null;
      }

      if (!response.data?.url) {
        console.warn(`[useImageStreamUrl] No ${type} image URL in response`);
        return null;
      }

      console.log(`[useImageStreamUrl] Successfully fetched ${type} image URL`);
      return response.data.url;
    },
    enabled: enabled && !!id,
    // Images change less frequently, cache for longer
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnMount: false, // Don't refetch on mount (images don't expire as quickly)
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once (can fallback to placeholder)
    retryDelay: 1000,
  });
}

/**
 * Prefetch audio stream URL
 *
 * Useful for preloading the next lecture in a queue
 * to provide instant playback when user navigates.
 *
 * @example
 * ```tsx
 * function LectureList({ lectures }) {
 *   const queryClient = useQueryClient();
 *
 *   const prefetchNext = (lectureId: string) => {
 *     queryClient.prefetchQuery({
 *       queryKey: queryKeys.streaming.audio(lectureId),
 *       queryFn: async () => {
 *         const response = await streamingAPI.getAudioStreamUrl(lectureId);
 *         return response.data?.url;
 *       },
 *     });
 *   };
 *
 *   return <List lectures={lectures} onHover={prefetchNext} />;
 * }
 * ```
 */
export type { UseAudioStreamUrlOptions, UseImageStreamUrlOptions };
