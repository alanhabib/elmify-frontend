/**
 * Category Screen
 * Shows collections in a category
 */

import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCategory, useCategoryCollections } from "@/queries/hooks/categories";
import type { CollectionResponse } from "@/api/types";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategory(slug);

  // Fetch collections with infinite scroll
  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryCollections(slug);

  const collections = collectionsData?.pages.flatMap((page) => page.data) || [];
  const isLoading = categoryLoading || collectionsLoading;

  // Navigation handlers
  const handleCollectionPress = (collection: CollectionResponse) => {
    router.push(`/collection/${collection.id}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Loading state
  if (isLoading && !category) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a855f7" />
          <Text className="mt-4 text-muted-foreground">Loading category...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (categoryError || !category) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-foreground text-lg font-semibold">
            Category not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 bg-primary rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View className="mb-4">
      {/* Back Button and Title */}
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground ml-2">
          {category.name}
        </Text>
      </View>

      {/* Category Description */}
      {category.description && (
        <Text className="text-muted-foreground mb-4">
          {category.description}
        </Text>
      )}

      {/* Collections count */}
      <Text className="text-sm text-muted-foreground">
        {category.collectionCount} {category.collectionCount === 1 ? 'collection' : 'collections'}
      </Text>
    </View>
  );

  const renderCollection = ({ item }: { item: CollectionResponse }) => (
    <Pressable
      onPress={() => handleCollectionPress(item)}
      className="flex-row items-center py-3 border-b border-border"
    >
      {/* Collection Cover */}
      <View className="w-16 h-16 bg-muted rounded-lg mr-3 overflow-hidden">
        {item.coverImageUrl ? (
          <Image
            source={{ uri: item.coverImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="albums-outline" size={28} color="#a855f7" />
          </View>
        )}
      </View>

      {/* Collection Info */}
      <View className="flex-1">
        <Text className="text-foreground font-medium" numberOfLines={2}>
          {item.title}
        </Text>
        {item.speakerName && (
          <Text className="text-muted-foreground text-sm" numberOfLines={1}>
            {item.speakerName}
          </Text>
        )}
        <Text className="text-muted-foreground text-xs">
          {item.lectureCount} {item.lectureCount === 1 ? 'lecture' : 'lectures'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </Pressable>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#a855f7" />
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (collectionsLoading) return null;
    return (
      <View className="py-8 items-center">
        <Ionicons name="albums-outline" size={48} color="#6b7280" />
        <Text className="text-muted-foreground mt-2">
          No collections in this category yet
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCollection}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
