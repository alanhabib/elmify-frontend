import { StreamingService } from './StreamingService';
import { UILecture } from '@/types/ui';
import { apiClient } from '@/api/client';

/**
 * Cached URL with expiry
 */
interface CachedUrl {
  url: string;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Backend playlist manifest response
 */
interface PlaylistManifestResponse {
  collectionId: string;
  tracks: Array<{
    lectureId: string;
    audioUrl: string;
    expiresAt: string;
    duration: number;
  }>;
  metadata: {
    totalTracks: number;
    totalDuration: number;
    generatedAt: string;
    expiresAt: string;
    cached: boolean;
  };
}

/**
 * Playlist with all URLs pre-fetched
 */
interface PlaylistCache {
  collectionId: string;
  lectures: UILecture[];
  urls: Map<string, CachedUrl>;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Progress callback for UI updates during batch fetching
 */
export type ProgressCallback = (current: number, total: number) => void;

/**
 * PlaylistService - Handles batch URL fetching and caching
 *
 * This is a transitional solution until backend provides playlist manifest endpoint.
 * Fetches all track URLs in batches with proper rate limiting and caching.
 */
class PlaylistService {
  private cache: Map<string, PlaylistCache> = new Map();
  private readonly URL_TTL_MS = 14400000; // 4 hours - matches backend URL expiry
  private readonly BATCH_DELAY_MS = 300; // Delay between fetches to avoid rate limiting
  private readonly REFRESH_THRESHOLD = 0.75; // Refresh when 75% of TTL has passed (3 hours)

  /**
   * Get all URLs for a playlist, with caching
   * Returns cached URLs if still valid, otherwise fetches fresh
   *
   * Primary: Uses backend playlist manifest endpoint (fast, cached)
   * Fallback: Client-side sequential fetching if backend fails
   */
  async getPlaylistUrls(
    collectionId: string,
    lectures: UILecture[],
    onProgress?: ProgressCallback
  ): Promise<Map<string, string>> {
    const cached = this.cache.get(collectionId);
    const now = Date.now();

    // Return cached if valid
    if (cached && now < cached.expiresAt) {
      console.log(`✅ Using cached playlist URLs for ${collectionId}`);

      // Check if we should refresh in background
      if (now > cached.cachedAt + (this.URL_TTL_MS * this.REFRESH_THRESHOLD)) {
        console.log('🔄 Refreshing URLs in background...');
        this.refreshInBackground(collectionId, lectures);
      }

      return new Map(Array.from(cached.urls.entries()).map(([id, cached]) => [id, cached.url]));
    }

    // Try backend manifest endpoint first
    try {
      return await this.fetchFromBackend(collectionId, lectures, onProgress);
    } catch (error) {
      console.error('❌ Backend manifest failed, falling back to client-side sequential fetch');
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      console.error('❌ This will be SLOW and may hit rate limits!');
      // Fallback to client-side sequential fetching
      return this.fetchAndCache(collectionId, lectures, onProgress);
    }
  }

  /**
   * Fetch playlist manifest from backend (primary method)
   */
  private async fetchFromBackend(
    collectionId: string,
    lectures: UILecture[],
    onProgress?: ProgressCallback
  ): Promise<Map<string, string>> {
    console.log(`🌐 Fetching playlist manifest from backend for ${collectionId} (${lectures.length} tracks)...`);

    const startTime = Date.now();

    const requestPayload = {
      collectionId,
      lectureIds: lectures.map(l => l.id.toString()),
    };

    console.log(`📤 Manifest request payload:`, {
      collectionId: requestPayload.collectionId,
      lectureCount: requestPayload.lectureIds.length,
      firstLectureId: requestPayload.lectureIds[0],
      lastLectureId: requestPayload.lectureIds[requestPayload.lectureIds.length - 1],
    });

    // Call backend playlist manifest endpoint
    const response = await apiClient.post<PlaylistManifestResponse>('/playlists/manifest', requestPayload);

    console.log(`📥 Manifest response:`, {
      success: response.success,
      status: response.status,
      hasData: !!response.data,
      error: response.error,
    });

    if (!response.success || !response.data) {
      throw new Error(`Backend manifest failed: ${response.error || 'Unknown error'}`);
    }

    const manifest = response.data;
    const now = Date.now();
    const expiresAt = new Date(manifest.metadata.expiresAt).getTime();

    // Convert to URL map and cache
    const urls = new Map<string, CachedUrl>();

    manifest.tracks.forEach((track, index) => {
      urls.set(track.lectureId, {
        url: track.audioUrl,
        cachedAt: now,
        expiresAt,
      });

      // Report progress
      if (onProgress) {
        onProgress(index + 1, manifest.tracks.length);
      }
    });

    // Cache the result
    this.cache.set(collectionId, {
      collectionId,
      lectures,
      urls,
      cachedAt: now,
      expiresAt,
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`✅ Backend manifest received: ${urls.size} URLs in ${elapsedMs}ms (cached: ${manifest.metadata.cached})`);

    return new Map(Array.from(urls.entries()).map(([id, cached]) => [id, cached.url]));
  }

  /**
   * Fetch all URLs and cache them (fallback method - client-side)
   */
  private async fetchAndCache(
    collectionId: string,
    lectures: UILecture[],
    onProgress?: ProgressCallback
  ): Promise<Map<string, string>> {
    console.log(`🌐 Fetching ${lectures.length} URLs for collection ${collectionId}...`);

    const urls = new Map<string, CachedUrl>();
    const now = Date.now();
    const expiresAt = now + this.URL_TTL_MS;

    let completed = 0;

    // Fetch URLs sequentially with rate limiting
    for (const lecture of lectures) {
      try {
        const url = await StreamingService.getStreamingUrl(lecture);

        if (!url) {
          throw new Error(`Failed to get URL for lecture ${lecture.id}`);
        }

        urls.set(lecture.id, {
          url,
          cachedAt: now,
          expiresAt,
        });

        completed++;
        onProgress?.(completed, lectures.length);

        // Rate limiting delay (except for last item)
        if (completed < lectures.length) {
          await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY_MS));
        }

      } catch (error) {
        console.error(`❌ Failed to fetch URL for lecture ${lecture.id}:`, error);
        // Continue with other tracks even if one fails
      }
    }

    // Cache the result
    this.cache.set(collectionId, {
      collectionId,
      lectures,
      urls,
      cachedAt: now,
      expiresAt,
    });

    console.log(`✅ Cached ${urls.size}/${lectures.length} URLs for collection ${collectionId}`);

    return new Map(Array.from(urls.entries()).map(([id, cached]) => [id, cached.url]));
  }

  /**
   * Refresh URLs in background without blocking
   */
  private async refreshInBackground(collectionId: string, lectures: UILecture[]): Promise<void> {
    try {
      await this.fetchAndCache(collectionId, lectures);
      console.log(`✅ Refreshed URLs for collection ${collectionId}`);
    } catch (error) {
      console.error(`❌ Background refresh failed for ${collectionId}:`, error);
    }
  }

  /**
   * Get a single URL with caching
   */
  async getUrl(lecture: UILecture): Promise<string> {
    // Check if we have this URL cached in any playlist
    for (const playlist of this.cache.values()) {
      const cached = playlist.urls.get(lecture.id);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.url;
      }
    }

    // Not cached, fetch fresh
    const url = await StreamingService.getStreamingUrl(lecture);
    if (!url) {
      throw new Error(`Failed to get URL for lecture ${lecture.id}`);
    }

    return url;
  }

  /**
   * Clear cache for a specific collection or all
   */
  clearCache(collectionId?: string): void {
    if (collectionId) {
      this.cache.delete(collectionId);
      console.log(`🗑️ Cleared cache for collection ${collectionId}`);
    } else {
      this.cache.clear();
      console.log('🗑️ Cleared all playlist cache');
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { collections: number; totalUrls: number } {
    let totalUrls = 0;
    this.cache.forEach(playlist => {
      totalUrls += playlist.urls.size;
    });

    return {
      collections: this.cache.size,
      totalUrls,
    };
  }
}

export const playlistService = new PlaylistService();
