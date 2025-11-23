/**
 * Onboarding Screen Component
 *
 * Swipeable welcome screens shown on first app launch.
 * Introduces users to Elmify's key features.
 */

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
  Image,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Import onboarding images
const onboarding1 = require("@/../assets/onboarding/onboarding-1.png");
const onboarding2 = require("@/../assets/onboarding/onboarding-2.png");
const onboarding3 = require("@/../assets/onboarding/onboarding-3.png");

interface OnboardingSlide {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    image: onboarding1,
    title: "Welcome to Elmify",
    description:
      "Your gateway to authentic Islamic knowledge. Discover lectures from trusted scholars on Quran, Seerah, Fiqh, and more.",
  },
  {
    id: "2",
    image: onboarding2,
    title: "Browse by Category",
    description:
      "Explore curated collections organized by topic. From Quran recitations to Islamic history - find what speaks to your heart.",
  },
  {
    id: "3",
    image: onboarding3,
    title: "Listen & Learn",
    description:
      "Track your progress, save favorites, and continue where you left off. Your spiritual journey, on your schedule.",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View className="flex-1 items-center justify-center px-6" style={{ width }}>
      {/* Device Mockup Image */}
      <View className="flex-1 items-center justify-center" style={{ maxHeight: height * 0.45 }}>
        <Image
          source={item.image}
          style={{
            width: width * 0.7,
            height: height * 0.4,
          }}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-foreground text-center mb-4">
        {item.title}
      </Text>

      {/* Description */}
      <Text className="text-base text-muted-foreground text-center leading-6 px-2">
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View className="flex-row justify-center items-center mb-8">
      {slides.map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              isActive ? "w-6 bg-primary" : "w-2 bg-muted"
            }`}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Skip Button */}
      <View className="flex-row justify-end px-4 py-2">
        <Pressable onPress={handleSkip} className="px-4 py-2">
          <Text className="text-muted-foreground text-base">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          onScroll={(event) => {
            scrollX.value = event.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
        />
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-4">
        {/* Dots */}
        {renderDots()}

        {/* Action Button */}
        <Pressable
          onPress={handleNext}
          className="bg-primary py-4 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-lg">
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>

        {/* Guest Access */}
        {currentIndex === slides.length - 1 && (
          <Pressable onPress={onComplete} className="mt-4 py-2 items-center">
            <Text className="text-muted-foreground">
              Continue as Guest
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
