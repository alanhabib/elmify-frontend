/**
 * HeroCarousel Component
 *
 * Apple Podcasts-inspired carousel displaying recently played lectures.
 * Vertical rectangular cards with horizontal scrolling.
 *
 * Features:
 * - Fetches recent lectures from playback endpoint
 * - Vertical rectangular card design
 * - Image centered on top with spacing
 * - Title, subtitle, and progress bar
 * - Small play button
 * - Smooth horizontal scrolling
 * - Full design token integration
 *
 * Use Cases:
 * - Continue listening section on home screen
 * - Recently played lectures carousel
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Card } from "@/components/ui/primitives";
import { useRecentLectures } from "@/queries/hooks/playback";
import { usePlayer } from "@/providers/PlayerProvider";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import type { PlaybackPositionWithLectureResponse } from "@/api/types";

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH = 220;
const CARD_CONTENT_HEIGHT = 240;
const IMAGE_SIZE = 120;
const PLAY_BUTTON_SIZE = 16;
const PLAY_ICON_SIZE = 13;
const PROGRESS_BAR_HEIGHT = 3;
const CONTROLS_MAX_WIDTH = "60%";

const CARD_BACKGROUNDS = [
  "rgba(88, 86, 214, 0.15)", // Purple
  "rgba(52, 199, 89, 0.15)", // Green
  "rgba(255, 149, 0, 0.15)", // Orange
  "rgba(255, 59, 48, 0.15)", // Red
  "rgba(62, 187, 245, 0.15)", // Blue
];

// ============================================================================
// TYPES
// ============================================================================

interface HeroCardProps {
  lecture: PlaybackPositionWithLectureResponse;
  onPlay: () => void;
  onPress?: () => void;
}

interface HeroCardInternalProps extends HeroCardProps {
  backgroundColor: string;
}

export interface HeroCarouselProps {
  limit?: number;
  onLecturePress?: (lectureId: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate remaining time for a lecture
 * @param currentPosition - Current position in milliseconds
 * @param duration - Total duration in seconds
 * @returns Formatted remaining time string or null
 */
const calculateRemainingTime = (
  currentPosition: number | undefined,
  duration: number | undefined
): string | null => {
  if (!currentPosition || !duration) {
    return null;
  }

  // currentPosition is in milliseconds, duration is in seconds
  const currentPositionSeconds = currentPosition / 1000;
  const remainingSeconds = Math.max(0, duration - currentPositionSeconds);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "< 1m";
  }
};

/**
 * Get background color for card based on index
 */
const getBackgroundColor = (index: number): string => {
  return CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];
};

// ============================================================================
// HERO CARD COMPONENT
// ============================================================================

const HeroCard: React.FC<HeroCardInternalProps> = React.memo(
  ({ lecture, onPlay, onPress, backgroundColor }) => {
    const { colors, spacing, radius, typography, shadows } = useTheme();
    const {
      lecture: currentLecture,
      currentTime,
      duration,
      isPlaying,
    } = usePlayer();

    // Check if this lecture is currently playing
    const isCurrentlyPlaying =
      currentLecture?.id === lecture.lecture?.id?.toString() && isPlaying;

    // Use live progress if playing, otherwise use saved progress
    const progressPercent = useMemo(() => {
      if (isCurrentlyPlaying && duration > 0) {
        return (currentTime / duration) * 100;
      }

      // Calculate progress from currentPosition and duration
      // currentPosition is in milliseconds, duration is in seconds
      const currentPositionSeconds = (lecture.currentPosition || 0) / 1000;
      const durationSeconds = lecture.lecture?.duration || 0;

      if (durationSeconds > 0) {
        const calculatedProgress =
          (currentPositionSeconds / durationSeconds) * 100;
        return Math.min(calculatedProgress, 100); // Cap at 100%
      }

      return 0;
    }, [
      isCurrentlyPlaying,
      currentTime,
      duration,
      lecture.currentPosition,
      lecture.lecture?.duration,
    ]);

    // Calculate remaining time - use live time if currently playing
    const remainingTime = useMemo(() => {
      if (isCurrentlyPlaying && duration > 0) {
        // Convert current position to milliseconds to match API format
        const currentPositionMs = currentTime * 1000;
        return calculateRemainingTime(currentPositionMs, duration);
      }

      // DEBUG: Log remaining time calculation
      const result = calculateRemainingTime(
        lecture.currentPosition,
        lecture.lecture?.duration
      );

      return result;
    }, [
      isCurrentlyPlaying,
      currentTime,
      duration,
      lecture.currentPosition,
      lecture.lecture?.duration,
    ]);

    // Memoize styles to prevent recreation on every render
    const styles = useMemo(
      () => ({
        card: {
          width: CARD_WIDTH,
          marginRight: spacing.lg,
        } as ViewStyle,

        cardContent: {
          height: CARD_CONTENT_HEIGHT,
          justifyContent: "space-between",
        } as ViewStyle,

        imageContainer: {
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          alignSelf: "center",
          borderRadius: radius.md,
          overflow: "hidden",
          marginBottom: spacing.xs / 2,
          ...shadows.raised,
        } as ViewStyle,

        image: {
          width: "100%",
          height: "100%",
        } as ViewStyle,

        title: {
          fontSize: typography.footnote.fontSize,
          lineHeight: typography.footnote.lineHeight,
          fontWeight: "600",
          color: "#FFFFFF",
          textAlign: "left",
          marginBottom: spacing.xs,
        } as TextStyle,

        subtitle: {
          fontSize: typography.caption1.fontSize,
          lineHeight: typography.caption1.lineHeight,
          color: "rgba(255, 255, 255, 0.7)",
          textAlign: "left",
          marginBottom: spacing.xs,
        } as TextStyle,

        controlsWrapper: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          backgroundColor: "rgba(125, 80, 80, 0.3)",
          borderRadius: radius.lg,
          padding: spacing.sm,
          alignSelf: "flex-start",
          maxWidth: CONTROLS_MAX_WIDTH,
        } as ViewStyle,

        playButton: {
          width: PLAY_BUTTON_SIZE,
          height: PLAY_BUTTON_SIZE,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        } as ViewStyle,

        progressBarContainer: {
          flex: 1,
          height: PROGRESS_BAR_HEIGHT,
          backgroundColor: colors.primary,
          borderRadius: radius.full,
          overflow: "hidden",
        } as ViewStyle,

        progressBarFill: {
          width: `${progressPercent}%`,
          height: "100%",
          backgroundColor: "#FFFFFF",
        } as ViewStyle,

        timeRemaining: {
          fontSize: typography.caption2.fontSize,
          lineHeight: typography.caption2.lineHeight,
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: "500",
          flexShrink: 0,
        } as TextStyle,
      }),
      [spacing, radius, typography, shadows, colors.primary, progressPercent]
    );

    return (
      <Pressable onPress={onPress} style={styles.card}>
        <Card elevation="floating" padding="lg" style={{ backgroundColor }}>
          <View style={styles.cardContent}>
            {/* Square image centered on top */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: lecture.lecture?.thumbnailUrl || undefined }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Text and controls section */}
            <View>
              {/* Text left-aligned */}
              <Text style={styles.title} numberOfLines={2}>
                {lecture.lecture?.title || "Unknown Lecture"}
              </Text>

              <Text style={styles.subtitle} numberOfLines={1}>
                {lecture.lecture?.speakerName || "Unknown Speaker"}
              </Text>

              {/* Unified Play Controls - Play Button + Progress Bar + Time Remaining */}
              <Pressable onPress={onPlay} style={styles.controlsWrapper}>
                <View style={styles.playButton}>
                  <Feather
                    name={isCurrentlyPlaying ? "pause" : "play"}
                    size={PLAY_ICON_SIZE}
                    color={colors.primaryForeground}
                  />
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarFill} />
                </View>
                {remainingTime && (
                  <Text style={styles.timeRemaining}>{remainingTime}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }
);

HeroCard.displayName = "HeroCard";

// ============================================================================
// HERO CAROUSEL COMPONENT
// ============================================================================

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  limit = 10,
  onLecturePress,
}) => {
  const { spacing } = useTheme();
  const { isSignedIn } = useAuth();
  const {
    lecture: currentLecture,
    isPlaying,
    setLecture,
    play,
    pause,
  } = usePlayer();
  const router = useRouter();

  // Fetch recent lectures - only when signed in
  const { data: recentLectures = [], isLoading } = useRecentLectures({
    limit,
    enabled: !!isSignedIn
  });

  // Don't show for guests
  if (!isSignedIn) {
    return null;
  }

  // Memoize the lecture press handler
  const handleLecturePress = useMemo(
    () => (lectureId: string) => {
      if (onLecturePress) {
        onLecturePress(lectureId);
      } else {
        router.push(`/lecture/${lectureId}`);
      }
    },
    [onLecturePress, router]
  );

  if (isLoading || !recentLectures || recentLectures.length === 0) {
    return null;
  }

  return (
    <View style={carouselStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
        }}
        decelerationRate="fast"
      >
        {recentLectures.map((item, index) => (
          <HeroCard
            key={item.lecture?.id || item.lectureId}
            lecture={item}
            backgroundColor={getBackgroundColor(index)}
            onPlay={async () => {
              if (item.lecture) {
                const lectureId = item.lecture.id.toString();

                // If this lecture is currently playing, toggle pause/play
                if (currentLecture?.id === lectureId) {
                  if (isPlaying) {
                    await pause();
                  } else {
                    await play();
                  }
                } else {
                  // Load and play new lecture
                  setLecture({
                    id: lectureId,
                    title: item.lecture.title,
                    speaker: item.lecture.speakerName || "Unknown Speaker",
                    author: item.lecture.speakerName || "Unknown Speaker",
                    thumbnail_url: item.lecture.thumbnailUrl,
                    audio_url: "",
                  });
                }
              }
            }}
            onPress={() => {
              if (item.lecture?.id) {
                handleLecturePress(item.lecture.id.toString());
              }
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// HERO CAROUSEL SKELETON
// ============================================================================

/**
 * HeroCarouselSkeleton
 *
 * Loading state for HeroCarousel
 */
export const HeroCarouselSkeleton: React.FC = () => {
  const { spacing, radius } = useTheme();
  const { Skeleton } = require("@/components/ui/primitives");

  return (
    <View style={carouselStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: 200, marginRight: spacing.md }}>
            <Card elevation="floating" padding="md">
              <Skeleton width="100%" height={267} borderRadius={radius.md} />
              <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                <Skeleton width="80%" height={16} shape="text" />
                <Skeleton width="60%" height={14} shape="text" />
                <Skeleton width="100%" height={3} />
                <View style={{ marginTop: spacing.sm }}>
                  <Skeleton width="100%" height={32} borderRadius={radius.lg} />
                </View>
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const carouselStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

export default HeroCarousel;
