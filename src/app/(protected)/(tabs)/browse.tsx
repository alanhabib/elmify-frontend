/**
 * Browse Screen - Search and Discovery
 * Clean, focused component following single responsibility principle
 * Maximum 150 lines following React best practices
 */

import { useState, useMemo, useCallback } from "react";
import { Text, View, ScrollView } from "react-native";
import { SearchBar } from "@/components/search/SearchBar";
import { useRouter } from "expo-router";
import { useSpeakers } from "@/queries/hooks/speakers";
import { useCollections } from "@/queries/hooks/collections";
import { SpeakersSection } from "@/components/speakers/SpeakersSection";
import { CollectionsSection } from "@/components/collections/CollectionsSection";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Browse() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { filterAccessible } = usePremiumAccess();

  // Fetch speakers
  const {
    data: speakers = [],
    isLoading: isLoadingSpeakers,
    error: speakersError,
  } = useSpeakers();

  // Fetch collections
  const {
    data: collections = [],
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useCollections();

  // Filter speakers based on premium access
  const accessibleSpeakers = useMemo(
    () => filterAccessible(speakers),
    [speakers, filterAccessible]
  );

  // Memoized navigation handlers to prevent re-renders
  const handleSpeakerPress = useCallback((speaker: any) => {
    router.push(`/speaker/${speaker.id}`);
  }, [router]);

  const handleCollectionPress = useCallback((collection: any) => {
    router.push(`/collection/${collection.id}`);
  }, [router]);

  // Calculate loading progress
  const loadingStates = [!isLoadingSpeakers, !isLoadingCollections];
  const completedCount = loadingStates.filter(Boolean).length;
  const loadingProgress = Math.round((completedCount / loadingStates.length) * 100);

  const isLoading = loadingProgress < 100;
  const hasError = speakersError || collectionsError;

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <Text className="text-red-500 text-center text-lg">
          Error loading content. Please try again.
        </Text>
        <Text className="text-red-400 text-center text-sm mt-2">
          {speakersError instanceof Error
            ? speakersError.message
            : collectionsError instanceof Error
            ? collectionsError.message
            : "Unknown error"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6 pt-4 px-4">
        <Text className="text-2xl font-bold text-foreground mb-4">Browse</Text>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search speakers and collections..."
        />
      </View>

      {/* Speakers Section */}
      <SpeakersSection
        title="Speakers"
        speakers={accessibleSpeakers}
        isLoading={isLoadingSpeakers}
        error={speakersError}
        onSpeakerPress={handleSpeakerPress}
        searchQuery={searchQuery}
      />

      {/* Collections Section */}
      <CollectionsSection
        title="Collections"
        collections={collections}
        isLoading={isLoadingCollections}
        error={collectionsError}
        onCollectionPress={handleCollectionPress}
        searchQuery={searchQuery}
      />
    </ScrollView>
  );
}
