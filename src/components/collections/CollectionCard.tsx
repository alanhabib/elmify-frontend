import React from "react";
import { Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Collection {
  id: number;
  title: string;
  speakerName?: string;
  coverImageUrl?: string;
  coverImageSmallUrl?: string;
  lectureCount?: number;
}

interface CollectionCardProps {
  collection: Collection;
  onPress: (collection: Collection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
}) => {
  const imageUrl = collection.coverImageSmallUrl || collection.coverImageUrl;

  return (
    <Pressable
      onPress={() => onPress(collection)}
      className="mr-4 w-40"
    >
      {/* Collection Cover Image */}
      <View className="w-40 h-40 bg-muted rounded-lg mb-3 overflow-hidden">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="library" size={48} color="#6b7280" />
          </View>
        )}
      </View>

      {/* Collection Info */}
      <Text
        className="text-foreground font-semibold text-sm mb-1"
        numberOfLines={2}
      >
        {collection.title}
      </Text>

      {collection.speakerName && (
        <Text className="text-muted-foreground text-xs mb-1" numberOfLines={1}>
          {collection.speakerName}
        </Text>
      )}

      {collection.lectureCount !== undefined && (
        <Text className="text-muted-foreground text-xs">
          {collection.lectureCount} lecture{collection.lectureCount !== 1 ? "s" : ""}
        </Text>
      )}
    </Pressable>
  );
};
