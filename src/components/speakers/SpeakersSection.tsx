import React from "react";
import { Text, View, FlatList } from "react-native";
import { SpeakerCard } from "./SpeakerCard";
import { SpeakerCardSkeleton } from "@/components/ui/skeletons/SpeakerCardSkeleton";
import type { SpeakerResponse } from "@/api/types";

interface SpeakersSectionProps {
  title?: string;
  speakers: SpeakerResponse[];
  isLoading?: boolean;
  error?: any;
  onSpeakerPress: (speaker: SpeakerResponse) => void;
  searchQuery?: string;
  showTitle?: boolean;
}

export const SpeakersSection: React.FC<SpeakersSectionProps> = ({
  title = "Speakers",
  speakers,
  isLoading = false,
  error,
  onSpeakerPress,
  searchQuery = "",
  showTitle = true,
}) => {
  // Apple Podcasts UX: Show skeleton loading during initial load
  if (isLoading && !speakers.length) {
    return (
      <View className="mb-6">
        {showTitle && (
          <Text className="text-2xl font-bold text-foreground mb-5 px-4">
            {title}
          </Text>
        )}
        <FlatList
          data={Array(4).fill(null)} // Show 4 skeleton cards
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={() => <SpeakerCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </View>
    );
  }

  // Empty state
  if (!speakers || speakers.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {showTitle && (
        <Text className="text-2xl font-bold text-foreground mb-5 px-4">
          {title}
        </Text>
      )}
      <FlatList
        data={speakers}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <SpeakerCard
            speaker={item}
            onPress={onSpeakerPress}
            searchQuery={searchQuery}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
