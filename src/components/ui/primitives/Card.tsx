/**
 * Card Component
 *
 * Apple Podcasts-inspired card container with 3 elevation levels.
 * Uses design tokens for consistent styling.
 *
 * Elevations:
 * - flat: No shadow, subtle border (for inline content)
 * - raised: Subtle shadow (default, for most cards)
 * - floating: Prominent shadow (for modals, overlays)
 *
 * Features:
 * - Supports press interactions (onPress makes it tappable)
 * - Configurable padding
 * - Border radius from design tokens
 * - Light/dark mode support
 * - Optional custom background color
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export type CardElevation = 'flat' | 'raised' | 'floating';

export interface CardProps {
  // Content
  children: React.ReactNode;

  // Appearance
  elevation?: CardElevation;
  padding?: number | 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string; // Optional override

  // Interaction
  onPress?: () => void;
  disabled?: boolean;

  // Style overrides
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'raised',
  padding = 'md',
  backgroundColor,
  onPress,
  disabled = false,
  style,
}) => {
  const { colors, spacing, radius, shadows } = useTheme();

  // Padding configuration
  const getPadding = (): number => {
    if (typeof padding === 'number') return padding;

    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.lg;
      case 'lg':
        return spacing.xl;
      default:
        return spacing.lg;
    }
  };

  // Elevation styles
  const getElevationStyle = (): ViewStyle => {
    switch (elevation) {
      case 'flat':
        return {
          borderWidth: 1,
          borderColor: colors.border,
        };

      case 'raised':
        return {
          ...shadows.subtle,
          borderWidth: 0,
        };

      case 'floating':
        return {
          ...shadows.medium,
          borderWidth: 0,
        };
    }
  };

  const containerStyle: ViewStyle = [
    styles.container,
    {
      backgroundColor: backgroundColor || colors.card,
      borderRadius: radius.lg,
      padding: getPadding(),
    },
    getElevationStyle(),
    style,
  ] as ViewStyle;

  // If onPress is provided, make it tappable
  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, just a regular view
  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Card;
