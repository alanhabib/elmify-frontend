/**
 * User API Endpoints
 *
 * Handles user profile and preferences
 */

import { apiClient } from "../client";
import type { APIResponse } from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface UserResponse {
  id: number;
  clerkId: string;
  email: string;
  displayName: string | null;
  profileImageUrl: string | null;
  isPremium: boolean;
  preferences: UserPreferences | null;
  createdAt: string;
}

export interface UserPreferences {
  // Playback preferences
  autoplay?: boolean;
  playbackSpeed?: number;
  skipForwardSeconds?: number;
  skipBackwardSeconds?: number;

  // Audio preferences
  volume?: number;
  enhancedAudio?: boolean;
  audioQuality?: "LOW" | "MEDIUM" | "HIGH";

  // Content preferences
  preferredLanguage?: string;
  showExplicitContent?: boolean;
  autoDownload?: boolean;
  downloadQuality?: number;

  // Privacy preferences
  shareListeningHistory?: boolean;
  allowAnalytics?: boolean;
  receiveRecommendations?: boolean;

  // Notification preferences
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  newContentNotifications?: boolean;
  subscriptionNotifications?: boolean;

  // Display preferences
  theme?: "LIGHT" | "DARK" | "AUTO" | "midnight" | "charcoal";
  dateFormat?: string;
  timeFormat?: "12h" | "24h";
  timezone?: string;

  // Daily goals
  dailyGoalMinutes?: number;

  // Accessibility preferences
  highContrast?: boolean;
  largeText?: boolean;
  reduceMotion?: boolean;
  screenReader?: boolean;
}

export interface UserSyncRequest {
  clerkId: string;
  email: string;
  fullName?: string;
  profileImageUrl?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Sync user with backend
 * Creates or updates user in backend database based on Clerk data
 * Should be called after successful login/signup
 */
export async function syncUser(userData: UserSyncRequest): Promise<APIResponse<UserResponse>> {
  return apiClient.post<UserResponse>("/users/sync", userData);
}

/**
 * Get current user profile
 * Returns authenticated user's profile including preferences
 */
export async function getCurrentUser(): Promise<APIResponse<UserResponse>> {
  return apiClient.get<UserResponse>("/users/me");
}

/**
 * Update user preferences
 * Updates preferences for the authenticated user
 */
export async function updatePreferences(
  preferences: UserPreferences
): Promise<APIResponse<UserResponse>> {
  return apiClient.put<UserResponse>("/users/me/preferences", preferences);
}

/**
 * Delete user account
 * Permanently deletes the user's account and all associated data
 * Requires email confirmation
 */
export async function deleteAccount(confirmEmail: string): Promise<APIResponse<void>> {
  return apiClient.delete<void>(`/users/me?confirmEmail=${encodeURIComponent(confirmEmail)}`);
}
