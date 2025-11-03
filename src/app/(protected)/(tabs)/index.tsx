/**
 * Dashboard Screen - Main Home Page
 * Clean, focused component following single responsibility principle
 * Maximum 150 lines following React best practices
 */

import { useCallback } from "react";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";
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
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();

  // Fetch speakers using centralized hook
  const {
    data: speakers = [],
    isLoading: isLoadingSpeakers,
    error: speakersError,
  } = useSpeakers();

  // Memoized callback to prevent unnecessary re-renders
  const handleSpeakerPress = useCallback(
    (speaker: any) => {
      router.push(`/speaker/${speaker.id}`);
    },
    [router]
  );

  // TODO: Replace with actual auth when ready
  const isSignedIn = true;

  const isLoading = isLoadingSpeakers;
  const hasError = !!speakersError;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-4 text-muted-foreground">Loading dashboard...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-xl font-bold text-destructive mb-2">
          Error Loading Speakers
        </Text>
        <Text className="text-muted-foreground text-center">
          {speakersError?.message || "Unknown error"}
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
            speakers={speakers}
            isLoading={isLoadingSpeakers}
            error={speakersError}
            onSpeakerPress={handleSpeakerPress}
          />
        </View>
      </View>
    </ScrollView>
  );
}
