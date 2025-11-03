/**
 * API Types - Centralized Type Definitions
 *
 * All types match the backend DTOs exactly (camelCase)
 * Single source of truth for API contracts
 *
 * Organization:
 * 1. Generic types (APIResponse, Pagination)
 * 2. Speaker types
 * 3. Collection types
 * 4. Lecture types
 * 5. User feature types (favorites, playback)
 * 6. Utility types
 */

// ============================================================================
// GENERIC TYPES
// ============================================================================

/**
 * Standard API response wrapper
 * All API endpoints return this format
 */
export interface APIResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  status?: number;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response format (matches backend PagedResponse)
 * Mobile-optimized pagination wrapper from Spring Boot
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;    // 0-indexed page number
    pageSize: number;       // Items per page
    totalItems: number;     // Total items across all pages
    totalPages: number;     // Total number of pages
    hasNext: boolean;       // True if there's a next page
    hasPrevious: boolean;   // True if there's a previous page
  };
}

// ============================================================================
// SPEAKER TYPES
// ============================================================================

/**
 * Speaker response (list view)
 * Lightweight representation for browse pages
 */
export interface SpeakerResponse {
  id: number;
  name: string;
  imageUrl?: string;
  imageSmallUrl?: string;
  visibilityType?: 'PUBLIC' | 'PRIVATE';
  isPremium: boolean;
  lectureCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Speaker detail response (detail view)
 * Includes nested collections for speaker page
 */
export interface SpeakerDetailResponse extends SpeakerResponse {
  collections?: CollectionResponse[];
}

// ============================================================================
// COLLECTION TYPES
// ============================================================================

/**
 * Collection response (list view)
 * Lightweight representation for collection lists
 */
export interface CollectionResponse {
  id: number;
  speakerId: number;
  speakerName?: string;
  title: string;
  year?: number;
  coverImageUrl?: string;
  coverImageSmallUrl?: string;
  lectureCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection detail response (detail view)
 * Includes nested lectures for collection page
 */
export interface CollectionDetailResponse extends CollectionResponse {
  lectures?: LectureResponse[];
  speaker?: SpeakerResponse;
}

// ============================================================================
// LECTURE TYPES
// ============================================================================

/**
 * Lecture response
 * Complete lecture information including metadata
 */
export interface LectureResponse {
  id: number;
  directoryId?: number;
  title: string;
  speaker?: string;
  collection?: string;
  genre?: string;
  year?: number;
  duration: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileFormat: string;
  bitrate?: number;
  sampleRate?: number;
  fileHash?: string;
  thumbnailUrl?: string;
  waveformData?: string;
  isPublic: boolean;
  playCount: number;
  description?: string;
  lectureNumber?: number;
  speakerId?: number;
  speakerName?: string;
  collectionId?: number;
  collectionTitle?: string;
  uploadedAt?: string;
  lastPlayedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lecture detail response (detail view)
 * Includes additional context like collection info and user progress
 */
export interface LectureDetailResponse extends LectureResponse {
  collectionInfo?: CollectionResponse;
  speakerInfo?: SpeakerResponse;
  progress?: PlaybackPositionResponse;
}

// ============================================================================
// USER FEATURES - FAVORITES
// ============================================================================

/**
 * Favorite response
 * Includes the full lecture details
 */
export interface FavoriteResponse {
  id: number;
  userId: string;
  lecture: LectureResponse;
  createdAt: string;
}

/**
 * Check favorite status response
 */
export interface FavoriteCheckResponse {
  isFavorited: boolean;
}

/**
 * Favorite count response
 */
export interface FavoriteCountResponse {
  count: number;
}

// ============================================================================
// USER FEATURES - PLAYBACK
// ============================================================================

/**
 * Playback position response
 * Tracks where user left off in a lecture
 */
export interface PlaybackPositionResponse {
  userId: string;
  lectureId: number;
  currentPosition: number;
  lastUpdated: string;
}

/**
 * Enhanced playback position response with full lecture details
 * Used for "Recent Lectures" and similar features that need complete lecture info
 */
export interface PlaybackPositionWithLectureResponse {
  userId: string;
  lectureId: number;
  currentPosition: number;
  lastUpdated: string;
  lecture: LectureResponse;
  progress: number; // Progress percentage (0-100)
}

/**
 * Request to create/update playback position
 */
export interface UpdatePlaybackPositionRequest {
  lectureId: number;
  currentPosition: number;
  duration?: number;
  ended?: boolean;
}

/**
 * Lecture play credit response
 * Tracks daily listening credits
 */
export interface LecturePlayCreditResponse {
  id: number;
  userId: string;
  lectureId: number;
  day: number; // YYYYMMDD format
  playedAt: string;
  createdAt: string;
}

// ============================================================================
// USER FEATURES - FAVORITES
// ============================================================================

/**
 * User favorite response
 * Can favorite speakers, collections, or lectures
 */
export interface UserFavoriteResponse {
  id: string;
  userId: string;
  speakerId?: number;
  collectionId?: number;
  lectureId?: number;
  createdAt: string;
}

/**
 * Request to create a favorite
 */
export interface CreateFavoriteRequest {
  speakerId?: number;
  collectionId?: number;
  lectureId?: number;
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search query parameters
 */
export interface SearchQuery {
  q: string;
  type?: 'speakers' | 'collections' | 'lectures' | 'all';
  limit?: number;
}

/**
 * Search results response
 */
export interface SearchResponse {
  speakers: SpeakerResponse[];
  collections: CollectionResponse[];
  lectures: LectureResponse[];
  totalResults: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * API error response
 * Standard error format from backend
 */
export interface APIErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

/**
 * Custom error class for API errors
 * Use this for throwing API-related errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// LEGACY COMPATIBILITY (Remove after full migration)
// ============================================================================

/**
 * @deprecated Use SpeakerResponse instead
 */
export type SpeakerAPIResponse = SpeakerResponse;

/**
 * @deprecated Use CollectionResponse instead
 */
export type CollectionAPIResponse = CollectionResponse;

/**
 * @deprecated Use LectureResponse instead
 */
export type LectureAPIResponse = LectureResponse;

/**
 * @deprecated Use PlaybackPositionResponse instead
 */
export type PlaybackPositionAPIResponse = PlaybackPositionResponse;

/**
 * @deprecated Use UserFavoriteResponse instead
 */
export type UserFavoriteAPIResponse = UserFavoriteResponse;
