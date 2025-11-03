// Frontend UI Types - What React Native components expect

export interface UISpeaker {
  id: string;
  name: string;
  bio?: string;
  avatar_url: string;
  collections: UICollection[];
  // Computed fields
  lecture_count?: number;
  is_premium?: boolean;
}

export interface UICollection {
  id: string;
  title: string;
  description?: string;
  year?: number;
  cover_image_url?: string;
  lectures: UILecture[];
  // Computed fields
  speakerName?: string;
  speaker_id?: string;
}

export interface UILecture {
  id: string;
  title: string;
  author: string; // Speaker name
  audio_url: string;
  thumbnail_url?: string;
  duration?: number; // in seconds
  // Additional metadata
  description?: string;
  collection_title?: string;
  file_size?: number;
  bitrate?: number;
  is_downloaded?: boolean;
  play_count?: number;
}

// Legacy Book type - for backward compatibility during migration
export interface UIBook extends UILecture {
  // UIBook is essentially the same as UILecture with 'author' field
}

// Player-specific types
export interface UIPlayerState {
  currentLecture: UILecture | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  playbackRate: number;
  volume: number;
}

// Search and Discovery types
export interface UISearchResults {
  speakers: UISpeaker[];
  collections: UICollection[];
  lectures: UILecture[];
}

export interface UIRecentLecture extends UILecture {
  last_played_at: string;
  progress: number; // 0-1 percentage
}

export interface UIUserLibrary {
  saved_lectures: UILecture[];
  recently_played: UIRecentLecture[];
  favorites: UILecture[];
  downloaded: UILecture[];
}

// Dashboard/Home screen types
export interface UITrendingContent {
  trending_lectures: UILecture[];
  trending_speakers: UISpeaker[];
  new_releases: UILecture[];
}

export interface UIDiscoverSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  content_type: "speakers" | "collections" | "lectures";
}

// User preferences
export interface UIUserPreferences {
  theme: "midnight" | "charcoal";
  autoplay: boolean;
  download_quality: "high" | "medium";
  notifications_enabled: boolean;
}

// Playback related
export interface UIPlaybackPosition {
  lecture_id: string;
  position: number; // seconds
  duration: number; // seconds
  progress: number; // 0-1 percentage
  last_updated: string;
}
