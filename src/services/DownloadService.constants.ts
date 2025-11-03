/**
 * Download service configuration and constants
 */

export const DOWNLOAD_CONFIG = {
  DIRECTORY_NAME: 'downloads',
  FILE_EXTENSION: '.mp3',
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for progress updates
  PROGRESS_UPDATE_THRESHOLD: 0.01, // Update progress every 1%
} as const;

export const DOWNLOAD_ERRORS = {
  ALREADY_DOWNLOADING: 'Download already in progress',
  ALREADY_DOWNLOADED: 'Lecture already downloaded',
  NO_STREAMING_URL: 'Failed to get streaming URL',
  FETCH_FAILED: 'Download failed',
  NO_RESPONSE_BODY: 'Response body is not readable',
  CLEANUP_FAILED: 'Failed to cleanup download',
} as const;
