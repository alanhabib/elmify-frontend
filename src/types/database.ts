// Database Types - Matching actual Cloudflare D1 schema

export interface DatabaseSpeaker {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_small_url?: string;
  visibility_type: "public" | "premium" | "restricted";
  allowed_user_ids?: string;
  is_premium: boolean;
}

export interface DatabaseCollection {
  id: number;
  speaker_id: number;
  title: string;
  year?: number;
  cover_image_url?: string;
  cover_image_small_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLecture {
  id: number;
  user_id?: number;
  directory_id?: number;
  title: string;
  speaker?: string;
  collection?: string;
  genre?: string;
  year?: number;
  duration: number; // in seconds
  file_name: string;
  file_path: string;
  file_size: number;
  file_format: string;
  bitrate?: number;
  sample_rate?: number;
  file_hash?: string;
  thumbnail_url?: string;
  waveform_data?: string;
  is_public: boolean;
  play_count: number;
  uploaded_at: string;
  last_played_at?: string;
  created_at: string;
  updated_at: string;
  speaker_id?: number;
  collection_id?: number;
  description?: string;
  lecture_number?: number;
}

export interface DatabaseUserSavedLecture {
  user_id: string; // Clerk user ID
  lecture_id: number;
  created_at: number; // Unix timestamp
}

export interface DatabasePlaybackPosition {
  id: number;
  user_id: number;
  lecture_id: number;
  current_position: number; // in seconds
  last_updated: string;
}

export interface DatabaseLectureStats {
  id?: number;
  lecture_id: number;
  play_count: number;
  total_listening_time: number;
  last_played_at: string;
  created_at?: string;
  updated_at?: string;
}

// Extended types with relationships
export interface DatabaseSpeakerWithCollections extends DatabaseSpeaker {
  collections: DatabaseCollection[];
}

export interface DatabaseCollectionWithLectures extends DatabaseCollection {
  lectures: DatabaseLecture[];
  speaker?: DatabaseSpeaker;
}

export interface DatabaseLectureWithRelations extends DatabaseLecture {
  speaker_info?: DatabaseSpeaker;
  collection_info?: DatabaseCollection;
}

// User-related types
export interface DatabaseUserProfile {
  user_id: string; // Clerk user ID
  created_at: number;
  preferences?: {
    theme?: "midnight" | "charcoal";
    autoplay?: boolean;
    download_quality?: "high" | "medium";
  };
}

export interface DatabaseUserListeningStats {
  user_id: string;
  total_listening_time: number;
  lectures_completed: number;
  favorite_speakers: number[];
  last_active: string;
}
