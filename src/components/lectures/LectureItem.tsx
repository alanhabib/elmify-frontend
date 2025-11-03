/**
 * LectureItem Component
 * Beautiful, reusable lecture item inspired by Apple Podcasts
 *
 * Features:
 * - Smooth press animations with scale and opacity
 * - Variant-based styling (speaker vs collection)
 * - Accessible with proper ARIA labels
 * - Graceful image loading with fallbacks
 * - Clean typography hierarchy
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATION_TIMING, TRANSFORM_VALUES } from '@/utils/animations';

// TypeScript interfaces for type safety
export interface Lecture {
  id: string;
  title: string;
  duration?: string;
  thumbnail_url?: string;
  speaker?: string;
  collectionTitle?: string;
}

export type LectureVariant = 'speaker' | 'collection';

interface LectureItemProps {
  lecture: Lecture;
  variant: LectureVariant;
  onPress: () => void;
  index?: number; // For staggered animations
}

// Animated Pressable for smooth interactions
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LectureItem: React.FC<LectureItemProps> = ({
  lecture,
  variant,
  onPress,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Shared values for animations
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated styles for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Press handlers with smooth animations
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(TRANSFORM_VALUES.pressScale, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(0.8, {
      duration: ANIMATION_TIMING.fast,
    });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, {
      duration: ANIMATION_TIMING.fast,
    });
  }, []);

  // Get variant-specific icon and color
  const getVariantIcon = (): keyof typeof Ionicons.glyphMap => {
    return variant === 'speaker' ? 'person' : 'library';
  };

  const getVariantColor = (): string => {
    return variant === 'speaker' ? '#a855f7' : '#3b82f6';
  };

  // Accessibility label
  const accessibilityLabel = `${lecture.title} by ${lecture.speaker || 'Unknown'}${
    lecture.duration ? `, duration ${lecture.duration}` : ''
  }`;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to play this lecture"
      className="mb-3"
    >
      {/* Card Container with shadow and rounded corners */}
      <View className="flex-row items-center gap-4 p-4 rounded-2xl bg-card shadow-sm border border-border">
        {/* Thumbnail with loading and error states */}
        <View className="relative">
          {lecture.thumbnail_url && !imageError ? (
            <>
              <Image
                source={{ uri: lecture.thumbnail_url }}
                className="w-16 h-16 rounded-xl"
                style={styles.thumbnail}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                accessibilityIgnoresInvertColors
              />
              {/* Loading overlay */}
              {imageLoading && (
                <View className="absolute inset-0 bg-muted rounded-xl items-center justify-center">
                  <Ionicons name="image-outline" size={24} color="#9ca3af" />
                </View>
              )}
            </>
          ) : (
            /* Fallback placeholder */
            <View className="w-16 h-16 rounded-xl bg-muted items-center justify-center">
              <Ionicons name="musical-note" size={28} color="#9ca3af" />
            </View>
          )}

          {/* Variant indicator badge */}
          <View
            className="absolute -bottom-1 -right-1 rounded-full p-1.5"
            style={[styles.badge, { backgroundColor: getVariantColor() }]}
          >
            <Ionicons name={getVariantIcon()} size={10} color="white" />
          </View>
        </View>

        {/* Content: Title, Speaker, Duration */}
        <View className="flex-1 gap-1">
          {/* Title - bold, prominent */}
          <Text
            className="text-foreground font-semibold text-base leading-snug"
            numberOfLines={2}
            style={styles.title}
          >
            {lecture.title}
          </Text>

          {/* Speaker/Collection - subtle, secondary */}
          {!!(lecture.speaker?.trim() || lecture.collectionTitle?.trim()) && (
            <Text
              className="text-muted-foreground text-sm"
              numberOfLines={1}
              style={styles.subtitle}
            >
              {(lecture.speaker?.trim() || lecture.collectionTitle?.trim() || 'Unknown')}
            </Text>
          )}

          {/* Duration - tertiary info */}
          {lecture.duration && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons name="time-outline" size={12} color="#9ca3af" />
              <Text className="text-muted-foreground text-xs">
                {lecture.duration}
              </Text>
            </View>
          )}
        </View>

        {/* Play icon - visual affordance */}
        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
          <Ionicons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
        </View>
      </View>
    </AnimatedPressable>
  );
};

// Styles that can't be expressed with Tailwind
const styles = StyleSheet.create({
  thumbnail: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badge: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    // Ensures consistent line height across platforms
    lineHeight: Platform.select({ ios: 20, android: 22, default: 20 }),
  },
  subtitle: {
    // Subtle text rendering
    lineHeight: Platform.select({ ios: 18, android: 20, default: 18 }),
  },
});
