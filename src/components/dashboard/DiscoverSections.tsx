import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const discoverSections = [
  {
    id: "islamic-knowledge",
    title: "Start Your Journey",
    subtitle: "Discover Islamic Knowledge",
    description:
      "Begin your path to understanding Islam with foundational lectures and teachings.",
    icon: "book",
    gradient: "from-blue-600 to-purple-600",
    image:
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: "quran-study",
    title: "Quran Study",
    subtitle: "Deepen Your Understanding",
    description:
      "Explore Quranic verses with detailed explanations and context.",
    icon: "heart",
    gradient: "from-green-600 to-teal-600",
    image:
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: "scholars",
    title: "Renowned Scholars",
    subtitle: "Learn from the Best",
    description:
      "Access lectures from respected Islamic scholars and teachers.",
    icon: "user",
    gradient: "from-orange-600 to-red-600",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center",
  },
];

export const DiscoverSections = () => {
  const handleSectionPress = (sectionId: string) => {
    // TODO: Navigate to section page
  };

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xl font-semibold text-foreground">Discover</Text>
      </View>

      <View className="space-y-3">
        {discoverSections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => handleSectionPress(section.id)}
            className="touch-feedback"
          >
            <View className="bg-card rounded-xl overflow-hidden border border-border/50">
              {/* Image Header */}
              <View className="relative h-32">
                <Image
                  source={{ uri: section.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Gradient Overlay */}
                <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Icon */}
                <View className="absolute top-3 left-3">
                  <View className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <AntDesign
                      name={section.icon as any}
                      size={20}
                      color="white"
                    />
                  </View>
                </View>

                {/* Arrow */}
                <View className="absolute top-3 right-3">
                  <View className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <AntDesign name="arrowright" size={16} color="white" />
                  </View>
                </View>
              </View>

              {/* Content */}
              <View className="p-4">
                <Text className="text-primary text-sm font-medium mb-1">
                  {section.subtitle}
                </Text>
                <Text className="text-foreground text-lg font-semibold mb-2">
                  {section.title}
                </Text>
                <Text className="text-muted-foreground text-sm leading-relaxed">
                  {section.description}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
