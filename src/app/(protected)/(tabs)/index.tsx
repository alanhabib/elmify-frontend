/**
 * Dashboard Screen - Main Home Page
 * Clean, focused component following single responsibility principle
 * Maximum 150 lines following React best practices
 */

import { useCallback, useMemo } from "react";
import { ScrollView, View, Text } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { WeekDayCircles } from "@/components/dashboard/WeekDayCircles";
import { WeeklyReminderCard } from "@/components/dashboard/WeeklyReminderCard";
import { TrendingLectures } from "@/components/dashboard/TrendingLectures";
import { RecentLectures } from "@/components/dashboard/RecentLectures";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { DiscoverSections } from "@/components/dashboard/DiscoverSections";
import { SpeakersSection } from "@/components/speakers/SpeakersSection";
import { DeveloperTestingSection } from "@/components/dashboard/DeveloperTestingSection";
import { HeroCarousel } from "@/components/hero";
import { useSpeakers } from "@/queries/hooks/speakers";
import { useTrendingLectures } from "@/queries/hooks/lectures";
import { useCollections } from "@/queries/hooks/collections";
import { useWeeklyProgress } from "@/queries/hooks/stats";
import { useRecentLectures } from "@/queries/hooks/playback";
import { useCurrentUser } from "@/queries/hooks/user";
import { useRouter } from "expo-router";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Dashboard() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { filterAccessible } = usePremiumAccess();

  // Fetch all data at top level for unified loading
  const {
    data: speakers = [],
    isLoading: isLoadingSpeakers,
    error: speakersError,
  } = useSpeakers();

  const {
    data: trendingLectures = [],
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useTrendingLectures({ limit: 9 });

  const {
    data: collections = [],
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useCollections({ params: { page: 0, size: 50 } });

  // Only fetch user-specific data when signed in
  const { isLoading: isLoadingWeekly } = useWeeklyProgress({
    enabled: !!isSignedIn
  });

  const { isLoading: isLoadingRecent } = useRecentLectures({
    limit: 10,
    enabled: !!isSignedIn
  });

  const { isLoading: isLoadingUser } = useCurrentUser({
    enabled: !!isSignedIn
  });

  // Filter speakers based on premium access
  const accessibleSpeakers = useMemo(
    () => filterAccessible(speakers),
    [speakers, filterAccessible]
  );

  // Memoized callback to prevent unnecessary re-renders
  const handleSpeakerPress = useCallback(
    (speaker: any) => {
      router.push(`/speaker/${speaker.id}`);
    },
    [router]
  );

  // Calculate loading progress
  const loadingStates = [
    !isLoadingSpeakers,
    !isLoadingTrending,
    !isLoadingCollections,
    ...(isSignedIn ? [!isLoadingWeekly, !isLoadingRecent, !isLoadingUser] : []),
  ];
  const completedCount = loadingStates.filter(Boolean).length;
  const totalCount = loadingStates.length;
  const loadingProgress = Math.round((completedCount / totalCount) * 100);

  const isLoading = loadingProgress < 100;
  const hasError = speakersError || trendingError || collectionsError;

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (hasError) {
    const errorMessage = speakersError?.message || trendingError?.message || collectionsError?.message || "Unknown error";
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-xl font-bold text-destructive mb-2">
          Error Loading Content
        </Text>
        <Text className="text-muted-foreground text-center">
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pb-6">
        {/* Header */}
        <View className="mb-6 pt-4 px-4">
          <View className="flex-row items-center justify-between">
            <View>
              {isSignedIn ? (
                <Text className="text-2xl font-bold text-foreground">
                  Welcome!
                </Text>
              ) : (
                <Text className="text-2xl font-bold text-foreground">
                  Explore
                </Text>
              )}
            </View>
            {/* TODO: Add StreakCounter when auth is enabled */}
          </View>
        </View>

        {/* Week Day Circles */}
        <View className="mb-8 px-4">
          <WeekDayCircles />
        </View>

        {/* Continue Listening Hero Carousel */}
        <View className="mb-10">
          <Text className="text-2xl font-bold text-foreground mb-5 px-4">
            Continue Listening
          </Text>
          <HeroCarousel
            limit={10}
            onLecturePress={(id) => {
              router.push(`/lecture/${id}`);
            }}
          />
        </View>

        {/* Weekly Reminder */}
        {/* <View className="mb-10 px-4">
          <WeeklyReminderCard />
        </View> */}

        {/* Recent Lectures */}
        {/* <View className="mb-10 px-4">
          <RecentLectures />
        </View> */}

        {/* Trending Lectures */}
        <View className="mb-10 px-4">
          <TrendingLectures />
        </View>

        {/* Recent Collections */}
        <View className="mb-10 px-4">
          <RecentCollections />
        </View>

        {/* Speakers Section */}
        <View className="mb-10 px-4">
          <SpeakersSection
            speakers={accessibleSpeakers}
            isLoading={isLoadingSpeakers}
            error={speakersError}
            onSpeakerPress={handleSpeakerPress}
          />
        </View>
      </View>
    </ScrollView>
  );
}
