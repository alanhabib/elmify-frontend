/**
 * Custom hook for dashboard data fetching
 * Centralizes all data queries for the dashboard screen using React Query hooks
 */

// TODO: Migrate to new hooks in Phase 3 & 4
import { useSpeakers } from "@/queries/hooks/speakers";
import { useMemo } from "react";

// Temporary placeholders
const useFeaturedCollections = () => ({ data: [], isLoading: false, error: null });
const useTrendingLectures = () => ({ data: [], isLoading: false, error: null });
const useRecentLectures = () => ({ data: [], isLoading: false, error: null });

export const useDashboardData = () => {
  // Use our new React Query-based hooks
  const {
    data: speakers = [],
    isLoading: isLoadingSpeakers,
    error: speakersError,
  } = useSpeakers();

  const {
    data: collections = [],
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useFeaturedCollections();

  const {
    data: trendingLectures = [],
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useTrendingLectures();

  const {
    data: recentLectures = [],
    isLoading: isLoadingRecent,
    error: recentError,
  } = useRecentLectures();

  // Aggregate lectures data to prevent infinite loops
  const lectures = useMemo(() => {
    return [...trendingLectures, ...recentLectures];
  }, [trendingLectures, recentLectures]);

  const isLoadingLectures = isLoadingTrending || isLoadingRecent;
  const lecturesError = trendingError || recentError;

  return {
    speakers,
    isLoadingSpeakers,
    speakersError,
    collections,
    isLoadingCollections,
    collectionsError,
    lectures,
    isLoadingLectures,
    lecturesError,
    trendingLectures,
    isLoadingTrending,
    trendingError,
    recentLectures,
    isLoadingRecent,
    recentError,
  };
};
