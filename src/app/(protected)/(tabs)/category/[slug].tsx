/**
 * Category Screen
 * Shows category details with subcategories and lectures
 */

import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCategory, useCategoryLectures } from "@/queries/hooks/categories";
import { CategoryCard } from "@/components/categories";
import type { LectureResponse, CategoryResponse } from "@/api/types";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategory(slug);

  // Fetch lectures with infinite scroll
  const {
    data: lecturesData,
    isLoading: lecturesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryLectures(slug);

  const lectures = lecturesData?.pages.flatMap((page) => page.data) || [];
  const isLoading = categoryLoading || lecturesLoading;

  // Navigation handlers
  const handleLecturePress = (lecture: LectureResponse) => {
    router.push(`/lecture/${lecture.id}`);
  };

  const handleSubcategoryPress = (subcategory: CategoryResponse) => {
    router.push(`/category/${subcategory.slug}`);
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
    <View className="mb-6">
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

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Subcategories
          </Text>
          {category.subcategories.map((subcategory) => (
            <CategoryCard
              key={subcategory.id}
              category={subcategory}
              onPress={handleSubcategoryPress}
              variant="compact"
            />
          ))}
        </View>
      )}

      {/* Lectures Header */}
      <Text className="text-lg font-semibold text-foreground mb-2">
        Lectures ({category.lectureCount})
      </Text>
    </View>
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
    if (lecturesLoading) return null;
    return (
      <View className="py-8 items-center">
        <Ionicons name="musical-notes-outline" size={48} color="#6b7280" />
        <Text className="text-muted-foreground mt-2">
          No lectures in this category yet
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={lectures}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleLecturePress(item)}
            className="flex-row items-center py-3 border-b border-border"
          >
            <View className="w-12 h-12 bg-muted rounded-lg items-center justify-center mr-3">
              <Ionicons name="musical-note" size={24} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-medium" numberOfLines={2}>
                {item.title}
              </Text>
              {item.speakerName && (
                <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                  {item.speakerName}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
        )}
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
