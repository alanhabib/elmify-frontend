/**
 * HeroCard Component
 *
 * Apple Podcasts-inspired hero card for dashboard/home screen.
 * Premium visual design with large cover image, gradient overlay,
 * and prominent CTA button.
 *
 * Features:
 * - Large cover image with gradient overlay
 * - Title and subtitle/tagline
 * - Play button CTA
 * - Smooth entrance animation
 * - Floating elevation for premium feel
 * - Full design token integration
 * - Light/dark mode support
 *
 * Use Cases:
 * - Featured lectures on home screen
 * - Hero carousel items
 * - Promotional content cards
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { Card, Button } from '@/components/ui/primitives';
import { Feather } from '@expo/vector-icons';

export interface HeroCardProps {
  // Content
  imageUrl: string | ImageSourcePropType;
  title: string;
  subtitle?: string;
  tagline?: string; // Alternative to subtitle

  // Actions
  onPlay?: () => void;
  onPress?: () => void; // Tap on card to view details

  // Appearance
  aspectRatio?: number; // Default 16:9
  showPlayButton?: boolean; // Default true
  animate?: boolean; // Entrance animation, default true

  // Style overrides
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  imageUrl,
  title,
  subtitle,
  tagline,
  onPlay,
  onPress,
  aspectRatio = 16 / 9,
  showPlayButton = true,
  animate = true,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Entrance animation
  useEffect(() => {
    if (!animate) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animate, fadeAnim, scaleAnim]);

  const containerStyle: ViewStyle = [
    {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    },
    style,
  ] as ViewStyle;

  const imageContainerStyle: ViewStyle = {
    width: '100%',
    aspectRatio,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
  };

  const gradientColors = [
    'rgba(0, 0, 0, 0)',
    'rgba(0, 0, 0, 0.3)',
    'rgba(0, 0, 0, 0.7)',
  ];

  const titleTextStyle: TextStyle = [
    styles.title,
    {
      fontSize: typography.title1.fontSize,
      lineHeight: typography.title1.lineHeight,
      fontWeight: typography.title1.fontWeight,
      color: colors.foreground,
      marginTop: spacing.md,
    },
    titleStyle,
  ] as TextStyle;

  const subtitleTextStyle: TextStyle = [
    styles.subtitle,
    {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      color: colors.mutedForeground,
      marginTop: spacing.xs,
    },
    subtitleStyle,
  ] as TextStyle;

  const imageSource =
    typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;

  return (
    <Animated.View style={containerStyle}>
      <Card
        elevation="floating"
        padding="lg"
        onPress={onPress}
        style={styles.card}
      >
        {/* Cover Image with Gradient Overlay */}
        <View style={imageContainerStyle}>
          <Image
            source={imageSource}
            style={imageStyle}
            resizeMode="cover"
          />
          {/* Gradient overlay for better text readability on image if needed */}
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={titleTextStyle} numberOfLines={2}>
            {title}
          </Text>

          {/* Subtitle/Tagline */}
          {(subtitle || tagline) && (
            <Text style={subtitleTextStyle} numberOfLines={2}>
              {subtitle || tagline}
            </Text>
          )}

          {/* Play Button */}
          {showPlayButton && onPlay && (
            <View style={{ marginTop: spacing.lg }}>
              <Button
                variant="primary"
                size="md"
                onPress={onPlay}
                leftIcon={<Feather name="play" size={18} color={colors.primaryForeground} />}
              >
                Play Now
              </Button>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
};

/**
 * HeroCardSkeleton
 *
 * Loading state for HeroCard
 */
export const HeroCardSkeleton: React.FC<{ aspectRatio?: number }> = ({
  aspectRatio = 16 / 9,
}) => {
  const { spacing, radius } = useTheme();
  const { Skeleton } = require('@/components/ui/primitives');

  return (
    <Card elevation="floating" padding="lg">
      <Skeleton
        width="100%"
        height={200}
        borderRadius={radius.lg}
        shape="box"
      />
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <Skeleton width="80%" height={24} shape="text" />
        <Skeleton width="60%" height={16} shape="text" />
        <View style={{ marginTop: spacing.md }}>
          <Skeleton width={120} height={44} borderRadius={radius.lg} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4, // Subtle overlay
  },
  contentContainer: {
    // Spacing handled by design tokens in component
  },
  title: {
    // Dynamic styles applied from design tokens
  },
  subtitle: {
    // Dynamic styles applied from design tokens
  },
});

export default HeroCard;
