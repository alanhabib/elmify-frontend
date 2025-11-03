import React, { useState } from "react";
import { Text, View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HighlightedText } from "@/components/ui/HighlightedText";

interface Collection {
  id: string;
  title: string;
  description: string;
  lectures: any[];
  speakerName?: string;
  cover_image_url?: string;
}

interface CollectionCardProps {
  collection: Collection;
  onPress: (collection: Collection) => void;
  searchQuery?: string;
  showSpeaker?: boolean;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
  searchQuery = "",
  showSpeaker = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable
      onPress={() => onPress(collection)}
      className="bg-card border border-border rounded-lg p-4 mb-3"
    >
      <View className="flex-row items-start">
        {collection.cover_image_url && !imageError ? (
          <Image
            source={{ uri: collection.cover_image_url }}
            className="w-12 h-12 rounded-lg mr-3"
            onError={() => setImageError(true)}
            onLoad={() => {
              setImageError(false);
            }}
          />
        ) : (
          <View className="w-12 h-12 bg-muted rounded-lg mr-3 items-center justify-center">
            <Ionicons name="library" size={20} color="#6b7280" />
          </View>
        )}

        <View className="flex-1">
          {showSpeaker && collection.speakerName && (
            <Text className="text-xs text-primary font-medium mb-1">
              by {collection.speakerName}
            </Text>
          )}

          <HighlightedText
            text={collection.title}
            searchQuery={searchQuery}
            className="text-foreground font-semibold text-base mb-1"
            numberOfLines={2}
          />

          <HighlightedText
            text={collection.description}
            searchQuery={searchQuery}
            className="text-muted-foreground text-sm leading-relaxed mb-2"
            numberOfLines={2}
          />

          <View className="flex-row items-center">
            <Ionicons name="play-circle-outline" size={14} color="#6b7280" />
            <Text className="text-muted-foreground text-xs ml-1">
              {collection.lectures.length} lecture
              {collection.lectures.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#6b7280" />
      </View>
    </Pressable>
  );
};
