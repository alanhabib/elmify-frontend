import React, { useState } from "react";
import { Text, View, Image, Pressable } from "react-native";
import { HighlightedText } from "@/components/ui/HighlightedText";
import type { SpeakerResponse } from "@/api/types";

interface SpeakerCardProps {
  speaker: SpeakerResponse;
  onPress: (speaker: SpeakerResponse) => void;
  searchQuery?: string;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({
  speaker,
  onPress,
  searchQuery = "",
}) => {

  return (
    <Pressable
      onPress={() => onPress(speaker)}
      className="items-center mr-4"
      style={{ width: 100 }}
    >
      <View className="relative">
        <Image
          source={{
            uri: speaker.imageSmallUrl || speaker.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
              speaker.name
            )}&background=6366f1&color=ffffff&size=180`,
          }}
          className="w-24 h-24 rounded-full mb-2"
          style={{
            borderWidth: 2,
            borderColor: "#374151",
          }}
        />
      </View>
      {/* <HighlightedText
        text={speaker.name}
        searchQuery={searchQuery}
        className="text-foreground text-xs text-center font-medium"
        numberOfLines={2}
      /> */}
    </Pressable>
  );
};
