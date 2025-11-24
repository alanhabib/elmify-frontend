/**
 * Speaker Screen
 * Apple Podcasts-style speaker detail page
 * Shows speaker image, name, bio, and their collections
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

import { useSpeaker } from "@/queries/hooks/speakers";
import { useCollectionsBySpeaker } from "@/queries/hooks/collections";

const SWIPE_THRESHOLD = 100;

export default function SpeakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch speaker and collections data
  const {
    data: speaker,
    isLoading: speakerLoading,
    isError: speakerError,
  } = useSpeaker(id || "");

  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollectionsBySpeaker(id || "");

  const isLoading = speakerLoading || collectionsLoading;
  const hasError = speakerError || collectionsError;

  // Swipe right gesture to go back
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

  // Handle collection card press - navigate to collection detail
  const handleCollectionPress = (collectionId: string) => {
    router.push(`/collection/${collectionId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-primary" />
          <Text className="mt-4 text-muted-foreground">Loading speaker...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (hasError || !speaker) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-destructive text-lg mt-4 text-center">
            Failed to load speaker
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
              {speaker.name}
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Square Speaker Image - Centered - Smaller size */}
            <View className="items-center py-6 px-4">
              {speaker.imageUrl ? (
                <Image
                  source={{ uri: speaker.imageUrl }}
                  className="rounded-2xl bg-muted"
                  style={{ width: 200, height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="rounded-2xl bg-muted items-center justify-center"
                  style={{ width: 200, height: 200 }}
                >
                  <Ionicons name="person" size={80} color="#9ca3af" />
                </View>
              )}
            </View>

            {/* Speaker Info */}
            <View className="px-6 mb-6">
              <Text className="text-3xl font-bold text-foreground text-center mb-3">
                {speaker.name}
              </Text>

              <Text className="text-base text-muted-foreground text-center leading-6">
                {speaker.bio ||
                  "Renowned speaker and thought leader with extensive experience in delivering impactful lectures and presentations."}
              </Text>
            </View>

            {/* Collections List */}
            <View className="px-4 pb-6">
              <Text className="text-xl font-bold text-foreground mb-4">
                Collections ({collections.length})
              </Text>

              {collections.map((collection: any) => (
                <Pressable
                  key={collection.id}
                  onPress={() =>
                    handleCollectionPress(collection.id.toString())
                  }
                  className="mb-4 active:opacity-70"
                >
                  <View className="flex-row bg-card rounded-lg overflow-hidden">
                    {/* Collection Cover */}
                    <Image
                      source={{ uri: collection.coverImageUrl }}
                      className="bg-muted"
                      style={{ width: 100, height: 100 }}
                      resizeMode="cover"
                    />

                    {/* Collection Info */}
                    <View className="flex-1 p-3 justify-center">
                      <Text
                        className="text-base font-semibold text-foreground mb-1"
                        numberOfLines={2}
                      >
                        {collection.title}
                      </Text>
                      {collection.description ? (
                        <Text
                          className="text-sm text-muted-foreground"
                          numberOfLines={2}
                        >
                          {collection.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              ))}

              {collections.length === 0 && (
                <View className="py-12 items-center">
                  <Ionicons name="albums-outline" size={48} color="#9ca3af" />
                  <Text className="text-muted-foreground mt-4">
                    No collections from this speaker
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </GestureDetector>
  );
}
