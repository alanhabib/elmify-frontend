import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { BlurView } from "@react-native-community/blur";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import PlaybackBar from "@/components/PlaybackBar";
import { SleepTimerModal } from "@/components/SleepTimerModal";
import { DownloadButton } from "@/components/DownloadButton";
import { usePlayer } from "@/providers/PlayerProvider";
import {
  useFavoriteCheck,
  useAddFavorite,
  useRemoveFavorite,
} from "@/queries/hooks/favorites";
import { formatTime } from "@/utils/timeFormat";
import { useGuestMode } from "@/hooks/useGuestMode";
import { ACCOUNT_REQUIRED_FEATURES } from "@/store/guestMode";

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const SWIPE_THRESHOLD = 100;

export default function PlayerScreen() {
  const {
    lecture,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    error,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    sleepTimer,
    setSleepTimer,
    sleepTimerRemaining,
    play,
    pause,
    seekTo,
    setPlaybackRate,
  } = usePlayer();

  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isReady, setIsReady] = useState(false);

  // Guest mode
  const { requireAuth } = useGuestMode();

  // Swipe down gesture
  const translateY = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        runOnJS(router.back)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Favorites
  const { data: isFavorited = false } = useFavoriteCheck(
    lecture?.id?.toString()
  );
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  // Wait for track to be ready
  useEffect(() => {
    if (lecture && !isLoading && duration > 0) {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [lecture?.id, isLoading, duration]);

  const toggleFavorite = () => {
    if (!lecture) return;

    // Check if user is authenticated for favorites
    if (!requireAuth(ACCOUNT_REQUIRED_FEATURES.FAVORITES)) return;

    if (isFavorited) {
      removeFavoriteMutation.mutate(lecture.id.toString());
    } else {
      addFavoriteMutation.mutate(lecture.id.toString());
    }
  };

  const cyclePlaybackSpeed = async () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    await setPlaybackRate(newSpeed);
  };

  const handleSleepTimerSelect = (minutes: number) => {
    setSleepTimer(minutes);
    setShowSleepTimerModal(false);
  };

  const handleCancelTimer = () => {
    setSleepTimer(null);
    setShowSleepTimerModal(false);
  };

  // Loading state
  if (isLoading || !isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-foreground mt-4 text-base">Loading audio...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-foreground text-lg mt-4 text-center">
          {error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-primary-foreground font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (!lecture) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Ionicons name="musical-notes-outline" size={64} color="#9ca3af" />
        <Text className="text-foreground text-lg mt-4">
          No lecture selected
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-primary-foreground font-semibold">
            Browse Lectures
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.fullScreen, animatedStyle]}>
        {/* Full-bleed artwork background */}
        <Image
          key={lecture.id}
          source={{ uri: lecture.thumbnail_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Blur overlay for controls */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="#000"
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Close button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-16 left-4 z-10 bg-black/30 rounded-full p-2"
          >
            <Entypo name="chevron-down" size={28} color="white" />
          </Pressable>

          {/* Artwork - centered, larger */}
          <View style={styles.artworkContainer}>
            <Image
              key={lecture.id}
              source={{ uri: lecture.thumbnail_url }}
              className="w-[85%] aspect-square max-w-[400px] rounded-2xl"
              resizeMode="cover"
            />
          </View>

          {/* Spacer to push controls down */}
          <View style={{ height: 80 }} />

          {/* Controls section with blur */}
          <BlurView
            style={[
              styles.controlsContainer,
              { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
            ]}
            blurType="dark"
            blurAmount={30}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
          >
            {/* Title and author */}
            <View className="items-center px-4 mt-4">
              <Text
                className="text-white text-2xl font-bold text-center"
                numberOfLines={2}
              >
                {lecture.title}
              </Text>
              {lecture.author && (
                <Text
                  className="text-white/70 text-base text-center mt-1"
                  numberOfLines={1}
                >
                  {lecture.author}
                </Text>
              )}
            </View>

            {/* Progress bar */}
            <View className="mt-4 px-6">
              <PlaybackBar
                currentTime={currentTime}
                duration={duration}
                onSeek={(seconds: number) => seekTo(seconds)}
              />
            </View>

            {/* Main playback controls */}
            <View className="flex-row justify-between items-center mt-6 px-6">
              <Pressable
                onPress={playPrevious}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="play-skip-back-outline"
                  size={40}
                  color="white"
                />
              </Pressable>

              {/* 15 seconds backward */}
              <Pressable onPress={() => seekTo(Math.max(0, currentTime - 15))}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="play-forward-outline"
                    size={44}
                    color="white"
                    style={{
                      position: "absolute",
                      transform: [{ scaleX: -1 }],
                    }}
                  />
                </View>
              </Pressable>

              {/* Large play/pause button - 80x80 */}
              <Pressable
                onPress={() => (isPlaying ? pause() : play())}
                style={styles.playButton}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={40}
                  color="white"
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
              </Pressable>

              {/* 15 seconds forward */}
              <Pressable
                onPress={() => seekTo(Math.min(duration, currentTime + 15))}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="play-forward-outline"
                    size={44}
                    color="white"
                    style={{ position: "absolute" }}
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={playNext}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="play-skip-forward-outline"
                  size={40}
                  color="white"
                />
              </Pressable>
            </View>

            {/* Secondary controls */}
            <View className="flex-row justify-center gap-3 mt-4 px-6">
              <Pressable
                onPress={toggleShuffle}
                className={`px-3 py-2 rounded-full relative ${
                  shuffle ? "bg-purple-500/30" : "bg-white/10"
                }`}
              >
                <Ionicons name="shuffle" size={20} color="white" />
              </Pressable>

              <Pressable
                onPress={cyclePlaybackSpeed}
                className="bg-white/10 px-3 py-2 rounded-full"
              >
                <Text className="text-white font-semibold text-sm">
                  {playbackSpeed}x
                </Text>
              </Pressable>

              <Pressable
                onPress={cycleRepeatMode}
                className={`px-3 py-2 rounded-full relative ${
                  repeatMode !== "off" ? "bg-purple-500/30" : "bg-white/10"
                }`}
              >
                <Ionicons
                  name={repeatMode === "one" ? "repeat-outline" : "repeat"}
                  size={20}
                  color="white"
                />
                {repeatMode === "one" && (
                  <Text className="absolute top-0.5 right-0.5 text-white text-[10px] font-bold">
                    1
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setShowSleepTimerModal(true)}
                className={`px-3 py-2 rounded-full ${
                  sleepTimer !== null ? "bg-purple-500/30" : "bg-white/10"
                }`}
              >
                <View className="flex-row items-center gap-1">
                  <Ionicons name="moon" size={20} color="white" />
                  {sleepTimerRemaining !== null && (
                    <Text className="text-white text-xs font-semibold">
                      {formatTime(sleepTimerRemaining)}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Favorite and Download */}
            <View className="flex-row justify-center gap-8 mt-4 mb-6 px-6">
              <Pressable onPress={toggleFavorite}>
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={32}
                  color={isFavorited ? "#a855f7" : "white"}
                />
              </Pressable>

              <DownloadButton lecture={lecture} size={32} showProgress />
            </View>
          </BlurView>
        </SafeAreaView>

        <SleepTimerModal
          visible={showSleepTimerModal}
          onClose={() => setShowSleepTimerModal(false)}
          onSelectTimer={handleSleepTimerSelect}
          onCancelTimer={handleCancelTimer}
          hasActiveTimer={sleepTimer !== null}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  artworkContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 120,
  },
  controlsContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  playButton: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a855f7",
    borderRadius: 40,
  },
});
