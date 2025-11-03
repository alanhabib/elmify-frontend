/**
 * Stats API Endpoints
 *
 * Handles listening statistics, streaks, and progress tracking
 */

import { apiClient } from "../client";
import type { APIResponse } from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface DailySummaryResponse {
  date: string;
  todayMinutes: number;
  dailyGoalMinutes: number;
  goalMet: boolean;
  remainingMinutes: number;
}

export interface StreakResponse {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
}

export interface DayProgress {
  minutes: number;
  goalMet: boolean;
}

export interface WeeklyProgressResponse {
  days: Record<string, DayProgress>;
}

export interface TrackListeningRequest {
  lectureId: number;
  playTimeSeconds: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get daily summary for the authenticated user
 * Returns today's listening progress and goal status
 */
export async function getDailySummary(): Promise<APIResponse<DailySummaryResponse>> {
  return apiClient.get<DailySummaryResponse>("/api/v1/stats/daily-summary");
}

/**
 * Get user's current and best streaks
 * Streaks are calculated based on consecutive days of meeting daily goals
 */
export async function getStreaks(): Promise<APIResponse<StreakResponse>> {
  return apiClient.get<StreakResponse>("/api/v1/stats/streaks");
}

/**
 * Get weekly progress (last 7 days)
 * Returns day-by-day listening progress
 */
export async function getWeeklyProgress(): Promise<APIResponse<WeeklyProgressResponse>> {
  return apiClient.get<WeeklyProgressResponse>("/api/v1/stats/weekly-progress");
}

/**
 * Track listening activity
 * Should be called periodically by the audio player (e.g., every 30 seconds)
 */
export async function trackListening(
  data: TrackListeningRequest
): Promise<APIResponse<void>> {
  return apiClient.post<void>("/api/v1/stats/track", data);
}
