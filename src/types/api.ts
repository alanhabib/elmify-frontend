// API Response Types for Backend Integration
// All types use camelCase to match backend DTOs exactly

// Generic API Response Wrapper
export interface APIResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
}

// Speaker API Types (matching backend DTOs)
export interface SpeakerAPIResponse {
  id: number;
  name: string;
  imageUrl?: string;
  imageSmallUrl?: string;
  visibilityType: "PUBLIC" | "PRIVATE";
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  lectureCount?: number;
}

export interface SpeakerDetailAPIResponse extends SpeakerAPIResponse {
  collections: CollectionAPIResponse[];
}

// Collection API Types (matching backend DTOs)
export interface CollectionAPIResponse {
  id: number;
  speakerId: number;
  speakerName?: string;
  title: string;
  year?: number;
  coverImageUrl?: string;
  coverImageSmallUrl?: string;
  lectureCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDetailAPIResponse extends CollectionAPIResponse {
  lectures: LectureAPIResponse[];
  speaker?: SpeakerAPIResponse;
}

// Lecture API Types (matching backend DTOs)
export interface LectureAPIResponse {
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

export interface LectureDetailAPIResponse extends LectureAPIResponse {
  collectionInfo?: CollectionAPIResponse;
  speakerInfo?: SpeakerAPIResponse;
  progress?: PlaybackPositionAPIResponse;
}

// User Progress API Types (using camelCase)
export interface PlaybackPositionAPIResponse {
  userId: string;
  lectureId: number;
  currentPosition: number;
  lastUpdated: string;
}

export interface LecturePlayCreditAPIResponse {
  id: number;
  userId: string;
  lectureId: number;
  day: number; // YYYYMMDD format
  playedAt: string;
  createdAt: string;
}

export interface CreateProgressRequest {
  lectureId: number;
  position?: number;
  duration?: number;
  ended?: boolean;
}

export interface UpdateProgressRequest {
  currentPosition?: number;
}

export interface UserProgressAPIResponse {
  id: string;
  userId: string;
  lectureId: number;
  currentPosition: number;
  lastUpdated: string;
  completed?: boolean;
  progressPercentage?: number;
}

// User Favorites API Types
export interface UserFavoriteAPIResponse {
  id: string;
  userId: string;
  speakerId?: string;
  collectionId?: string;
  lectureId?: string;
  createdAt: string;
}

export interface CreateFavoriteRequest {
  speakerId?: string;
  collectionId?: string;
  lectureId?: string;
}

// Search API Types
export interface SearchQuery {
  q: string;
  type?: "speakers" | "collections" | "lectures" | "all";
  limit?: number;
}

export interface SearchAPIResponse {
  speakers: SpeakerAPIResponse[];
  collections: CollectionAPIResponse[];
  lectures: LectureAPIResponse[];
  totalResults: number;
}

// Error Response Types
export interface APIErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Webhook Types (for Clerk integration)
export interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    emailAddresses: Array<{
      emailAddress: string;
      verification: {
        status: string;
      };
    }>;
    firstName?: string;
    lastName?: string;
    createdAt: number;
    updatedAt: number;
  };
}

export interface UserAPIResponse {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Service Error - for consistent error handling
export class ServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Re-export backend DTO aliases for service layer compatibility
export type SpeakerDto = SpeakerAPIResponse;
export type CollectionDto = CollectionAPIResponse;
export type LectureDto = LectureAPIResponse;
