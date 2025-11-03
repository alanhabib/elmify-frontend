/**
 * Environment Configuration
 * Centralized configuration for all API and media URLs
 */

// Default to local development URLs
const DEFAULT_API_BASE_URL = __DEV__ 
  ? "http://localhost:8081" 
  : "https://your-production-api.com";

const DEFAULT_MEDIA_BASE_URL = __DEV__ 
  ? "http://localhost:8081" 
  : "https://your-production-media.com";

const DEFAULT_STREAM_BASE_URL = __DEV__ 
  ? "http://localhost:8081/api/catalog/lectures" 
  : "https://your-production-stream.com";

/**
 * API Base URL for REST endpoints
 * Can be overridden via environment variables
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

/**
 * Media Base URL for images and static assets
 * Can be overridden via environment variables
 */
export const MEDIA_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL;

/**
 * Stream Base URL for audio streaming
 * Can be overridden via environment variables
 */
export const STREAM_BASE_URL = process.env.EXPO_PUBLIC_STREAM_BASE_URL || DEFAULT_STREAM_BASE_URL;

/**
 * MinIO/S3 Configuration (if needed separately)
 */
export const MINIO_BASE_URL = process.env.EXPO_PUBLIC_MINIO_BASE_URL || "http://localhost:9000";

/**
 * Environment flags
 */
export const IS_DEVELOPMENT = __DEV__;
export const IS_PRODUCTION = !__DEV__;

/**
 * Logging configuration
 */
export const ENABLE_API_LOGGING = IS_DEVELOPMENT;
export const ENABLE_MEDIA_LOGGING = IS_DEVELOPMENT;

export default {
  API_BASE_URL,
  MEDIA_BASE_URL,
  STREAM_BASE_URL,
  MINIO_BASE_URL,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  ENABLE_API_LOGGING,
  ENABLE_MEDIA_LOGGING
};