import React from "react";
import { Text, View, FlatList } from "react-native";
import { CollectionCard } from "./CollectionCard";

interface Collection {
  id: number;
  title: string;
  speakerName?: string;
  coverImageUrl?: string;
  coverImageSmallUrl?: string;
  lectureCount?: number;
}

interface CollectionsSectionProps {
  title?: string;
  collections: Collection[];
  isLoading?: boolean;
  error?: any;
  onCollectionPress: (collection: Collection) => void;
  searchQuery?: string;
  showTitle?: boolean;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  title = "Collections",
  collections,
  isLoading = false,
  error,
  onCollectionPress,
  searchQuery = "",
  showTitle = true,
}) => {
  // Filter collections based on search query
  const filteredCollections = React.useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (collection) =>
        collection.title?.toLowerCase().includes(query) ||
        collection.speakerName?.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  // Empty state
  if (!filteredCollections || filteredCollections.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {showTitle && (
        <Text className="text-2xl font-bold text-foreground mb-4 px-4">
          {title}
        </Text>
      )}
      <FlatList
        data={filteredCollections}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <CollectionCard collection={item} onPress={onCollectionPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
