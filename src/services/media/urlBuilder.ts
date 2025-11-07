/**
 * Media URL Builder Utilities
 * Centralized URL building for audio, images, and other media assets
 */

import { API_BASE_URL, MEDIA_BASE_URL, STREAM_BASE_URL, MINIO_BASE_URL, ENABLE_MEDIA_LOGGING } from '@/config/env';

/**
 * Check if a URL is already absolute (has protocol)
 */
function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a URL is absolute by prefixing with base URL if needed
 */
export function ensureAbsoluteUrl(path: string, baseUrl: string = MEDIA_BASE_URL): string {
  if (!path) {
    return '';
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  // Remove leading slash to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const absoluteUrl = `${baseUrl}/${cleanPath}`;

  return absoluteUrl;
}

/**
 * Build image URL with fallback support
 * Backend returns presigned URLs - use them as-is (best practice)
 */
export function buildImageUrl(imagePath: string, fallbackUrl?: string): string {
  if (!imagePath) {
    if (fallbackUrl) {
      return fallbackUrl;
    }
    // Return default fallback image
    return getDefaultImageFallback();
  }

  // If backend returned a presigned URL (starts with http/https), use it as-is
  // This is the recommended pattern: backend owns storage logic, frontend just displays
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Fallback: only build URL if it's a relative path (shouldn't happen with presigned URLs)
  return ensureAbsoluteUrl(imagePath, MINIO_BASE_URL);
}

/**
 * Build audio streaming URL
 */
export function buildAudioUrl(lectureId: string): string {
  if (!lectureId) {
    return '';
  }

  const audioUrl = `${STREAM_BASE_URL}/stream/${lectureId}`;

  return audioUrl;
}

/**
 * Build speaker avatar URL with automatic fallback
 */
export function buildSpeakerAvatarUrl(speakerImagePath: string, speakerName: string): string {
  if (speakerImagePath) {
    return buildImageUrl(speakerImagePath);
  }

  // Generate avatar using UI Avatars service as fallback
  return getDefaultAvatarUrl(speakerName);
}

/**
 * Build collection cover image URL with automatic fallback
 */
export function buildCollectionCoverUrl(coverImagePath: string, collectionTitle?: string): string {
  if (coverImagePath) {
    return buildImageUrl(coverImagePath);
  }

  // Use Unsplash for collection covers as fallback
  return getDefaultCollectionCover(collectionTitle);
}

/**
 * Build lecture thumbnail URL with automatic fallback
 */
export function buildLectureThumbnailUrl(thumbnailPath: string, lectureTitle?: string): string {
  if (thumbnailPath) {
    return buildImageUrl(thumbnailPath);
  }

  // Generate thumbnail using UI Avatars service as fallback
  return getDefaultThumbnailUrl(lectureTitle);
}

/**
 * Default fallback generators
 */
export function getDefaultAvatarUrl(name: string): string {
  const encodedName = encodeURIComponent(name || 'Unknown');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=ffffff&size=128`;
}

export function getDefaultCollectionCover(title?: string): string {
  // Use a consistent Unsplash image for collections
  return "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=400&fit=crop";
}

export function getDefaultThumbnailUrl(title?: string): string {
  const encodedTitle = encodeURIComponent(title || 'Lecture');
  return `https://ui-avatars.com/api/?name=${encodedTitle}&background=8b5cf6&color=ffffff&size=128`;
}

export function getDefaultImageFallback(): string {
  return "https://via.placeholder.com/400x400/374151/ffffff?text=No+Image";
}

/**
 * URL validation helper
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Debug helper to log all URLs being generated
 */
export function logUrlGeneration(type: string, input: string, output: string): void {
}

export default {
  ensureAbsoluteUrl,
  buildImageUrl,
  buildAudioUrl,
  buildSpeakerAvatarUrl,
  buildCollectionCoverUrl,
  buildLectureThumbnailUrl,
  getDefaultAvatarUrl,
  getDefaultCollectionCover,
  getDefaultThumbnailUrl,
  getDefaultImageFallback,
  isValidUrl,
  logUrlGeneration
};