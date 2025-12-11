/**
 * Collection Screen
 * Apple Podcasts-style collection detail page
 * Shows square cover image, title, description, and lecture list
 */

import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import { useCollection } from "@/queries/hooks/collections";
import { useLecturesByCollection } from "@/queries/hooks/lectures";
import { LectureListWithProgress } from "@/components/lectures/LectureListWithProgress";

const SWIPE_THRESHOLD = 100;

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch collection and lectures data
  const {
    data: collection,
    isLoading: collectionLoading,
    isError: collectionError,
  } = useCollection(id || "");

  const {
    data: lectures = [],
    isLoading: lecturesLoading,
    isError: lecturesError,
  } = useLecturesByCollection(id || "", {
    params: { limit: 1000 } // Large limit to show all lectures in a collection
  });

  const isLoading = collectionLoading || lecturesLoading;
  const hasError = collectionError || lecturesError;

  // Swipe left gesture to go back
  const translateX = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow rightward swiping from edge (first 50px)
      if (event.translationX > 0 && event.absoluteX < 50) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD && event.velocityX > 0) {
        // Swipe right to go back - quickly navigate
        runOnJS(router.back)();
      } else {
        // Spring back to original position
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-primary" />
          <Text className="mt-4 text-muted-foreground">
            Loading collection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (hasError || !collection) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-destructive text-lg mt-4 text-center">
            Failed to load collection
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <SafeAreaView className="flex-1 bg-background">
          {/* Header with back button */}
          <View className="flex-row items-center px-4 py-3">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="chevron-back" size={28} color="white" />
            </Pressable>
            <Text
              className="flex-1 text-lg font-semibold text-foreground ml-2"
              numberOfLines={1}
            >
              {collection.title}
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Square Cover Image - Centered - Smaller size */}
            <View className="items-center py-6 px-4">
              <Image
                source={{ uri: collection.coverImageUrl }}
                className="rounded-2xl bg-muted"
                style={{ width: 200, height: 200 }}
                resizeMode="cover"
              />
            </View>

            {/* Collection Info */}
            <View className="px-6 mb-6">
              <Text className="text-3xl font-bold text-foreground text-center mb-3">
                {collection.title}
              </Text>

              {collection.speakerName && (
                <Text className="text-lg text-muted-foreground text-center mb-3">
                  by {collection.speakerName}
                </Text>
              )}

              <Text className="text-base text-muted-foreground text-center leading-6">
                {collection.description ||
                  "A curated collection of insightful lectures covering essential topics and perspectives that will expand your understanding and inspire new ways of thinking."}
              </Text>
            </View>

            {/* Lectures List */}
            <View className="px-4 pb-6">
              <LectureListWithProgress
                lectures={lectures}
                collectionId={id || ''}
                emptyMessage="No lectures in this collection"
                emptyIcon="musical-notes-outline"
                showHeader={true}
                collectionSpeakerName={collection.speakerName}
                collectionCoverUrl={collection.coverImageUrl}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </GestureDetector>
  );
}
