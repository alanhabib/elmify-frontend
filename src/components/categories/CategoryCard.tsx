import React from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CategoryResponse } from "@/api/types";

interface CategoryCardProps {
  category: CategoryResponse;
  onPress: (category: CategoryResponse) => void;
  variant?: "default" | "compact";
}

/**
 * Category card component for displaying a single category
 * Used in category grids and lists
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  variant = "default",
}) => {
  // Map iconName to Ionicons name (with fallback)
  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    // Common mappings for category icons
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      "book-outline": "book-outline",
      "mic-outline": "mic-outline",
      "heart-outline": "heart-outline",
      "people-outline": "people-outline",
      "school-outline": "school-outline",
      "calendar-outline": "calendar-outline",
      "globe-outline": "globe-outline",
      "star-outline": "star-outline",
      "folder-outline": "folder-outline",
    };
    return iconMap[iconName] || "folder-outline";
  };

  if (variant === "compact") {
    return (
      <Pressable
        onPress={() => onPress(category)}
        className="flex-row items-center p-3 bg-card rounded-lg mb-2"
        style={{ borderWidth: 1, borderColor: "#374151" }}
      >
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: category.color + "20" }}
        >
          <Ionicons
            name={getIconName(category.iconName)}
            size={20}
            color={category.color}
          />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold text-sm">
            {category.name}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {category.lectureCount} lectures
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(category)}
      className="w-[48%] mb-3"
    >
      <View
        className="p-4 rounded-xl"
        style={{
          backgroundColor: category.color + "15",
          borderWidth: 1,
          borderColor: category.color + "30",
        }}
      >
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-lg items-center justify-center mb-3"
          style={{ backgroundColor: category.color + "25" }}
        >
          <Ionicons
            name={getIconName(category.iconName)}
            size={24}
            color={category.color}
          />
        </View>

        {/* Category Name */}
        <Text
          className="text-foreground font-semibold text-sm mb-1"
          numberOfLines={2}
        >
          {category.name}
        </Text>

        {/* Lecture Count */}
        <Text className="text-muted-foreground text-xs">
          {category.lectureCount} lecture{category.lectureCount !== 1 ? "s" : ""}
        </Text>
      </View>
    </Pressable>
  );
};
