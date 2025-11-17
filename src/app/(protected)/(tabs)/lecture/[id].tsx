/**
 * Lecture Screen
 * Apple Podcasts-style lecture detail page
 * Shows square cover image, title, and description (same layout as Collection but without lecture list)
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

import { useLecture } from '@/queries/hooks/lectures';
import { usePlayer } from '@/providers/PlayerProvider';

const SWIPE_THRESHOLD = 100;

export default function LectureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lecture: currentLecture, setLecture, play, pause, isPlaying } = usePlayer();

  // Fetch lecture data
  const {
    data: lecture,
    isLoading,
    isError,
    error,
  } = useLecture(id || '');

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

  // Handle play/pause button - mirrors FloatingPlayer behavior
  const handlePlayPause = async () => {
    if (!lecture) return;

    const lectureFormat = {
      id: lecture.id.toString(),
      title: lecture.title,
      speaker: lecture.speakerName || '',
      author: lecture.speakerName || '',
      audio_url: '', // Will be fetched dynamically by PlayerProvider
      thumbnail_url: lecture.thumbnailUrl,
    };

    // If it's a different lecture, set it (which auto-plays)
    if (currentLecture?.id !== lectureFormat.id) {
      setLecture(lectureFormat);
    } else {
      // Same lecture, toggle play/pause
      if (isPlaying) {
        await pause();
      } else {
        await play();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-primary" />
          <Text className="mt-4 text-muted-foreground">Loading lecture...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !lecture) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-destructive text-lg mt-4 text-center">
            Failed to load lecture
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">Go Back</Text>
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
              <Ionicons name="chevron-down" size={28} color="white" />
            </Pressable>
            <Text className="flex-1 text-lg font-semibold text-foreground ml-2" numberOfLines={1}>
              {lecture.title || 'Lecture'}
            </Text>
          </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Square Cover Image - Centered */}
        <View className="items-center py-6 px-4">
          {lecture.thumbnailUrl ? (
            <Image
              source={{ uri: lecture.thumbnailUrl }}
              className="rounded-2xl bg-muted"
              style={{ width: 280, height: 280 }}
              resizeMode="cover"
            />
          ) : (
            <View className="rounded-2xl bg-muted" style={{ width: 280, height: 280 }} />
          )}
        </View>

        {/* Lecture Info */}
        <View className="px-6 mb-6">
          {lecture.title ? (
            <Text className="text-3xl font-bold text-foreground text-center mb-3">
              {lecture.title}
            </Text>
          ) : null}

          {lecture.speakerName ? (
            <Text className="text-lg text-muted-foreground text-center mb-3">
              by {lecture.speakerName}
            </Text>
          ) : null}

          {lecture.description ? (
            <Text className="text-base text-muted-foreground text-center leading-6 mb-6">
              {lecture.description}
            </Text>
          ) : null}

          {/* Play/Pause Button - Larger and centered, mirrors FloatingPlayer */}
          <View className="items-center mt-4">
            <Pressable
              onPress={handlePlayPause}
              className="flex-row items-center bg-primary px-8 py-4 rounded-full active:opacity-80"
            >
              {currentLecture?.id === lecture.id?.toString() && isPlaying ? (
                <>
                  <Ionicons name="pause" size={24} color="black" />
                  <Text className="text-primary-foreground text-lg font-semibold ml-2">Pause</Text>
                </>
              ) : (
                <>
                  <Ionicons name="play" size={24} color="black" style={{ marginLeft: 2 }} />
                  <Text className="text-primary-foreground text-lg font-semibold ml-2">Play Lecture</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Additional Info */}
          {lecture.duration ? (
            <View className="mt-6 items-center">
              <Text className="text-sm text-muted-foreground">
                Duration: {Math.floor(lecture.duration / 60)} minutes
              </Text>
            </View>
          ) : null}

          {lecture.collectionTitle ? (
            <View className="mt-2 items-center">
              <Text className="text-sm text-muted-foreground">
                From: {lecture.collectionTitle}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </GestureDetector>
  );
}
