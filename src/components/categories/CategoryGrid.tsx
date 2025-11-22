import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { CategoryCard } from "./CategoryCard";
import type { CategoryResponse } from "@/api/types";

interface CategoryGridProps {
  categories: CategoryResponse[];
  onCategoryPress: (category: CategoryResponse) => void;
  isLoading?: boolean;
  title?: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
}

/**
 * Grid layout for displaying categories
 * Used on browse screen and home page
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
  isLoading = false,
  title,
  showSeeAll = false,
  onSeeAllPress,
}) => {
  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-foreground">No categories available</Text>
      </View>
    );
  }

  return (
    <View>
      {title && (
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-foreground text-lg font-semibold">{title}</Text>
          {showSeeAll && onSeeAllPress && (
            <Text
              className="text-primary text-sm"
              onPress={onSeeAllPress}
            >
              See All
            </Text>
          )}
        </View>
      )}

      <View className="flex-row flex-wrap justify-between">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={onCategoryPress}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * Horizontal scrollable list of categories
 * Used for featured categories section
 */
export const CategoryHorizontalList: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
  isLoading = false,
  title,
  showSeeAll = false,
  onSeeAllPress,
}) => {
  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <View>
      {title && (
        <View className="flex-row justify-between items-center mb-4 px-4">
          <Text className="text-foreground text-lg font-semibold">{title}</Text>
          {showSeeAll && onSeeAllPress && (
            <Text
              className="text-primary text-sm"
              onPress={onSeeAllPress}
            >
              See All
            </Text>
          )}
        </View>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={onCategoryPress}
            variant="compact"
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
};
