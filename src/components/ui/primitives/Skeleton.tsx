/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation.
 * Provides visual feedback during content loading.
 *
 * Features:
 * - Shimmer animation (subtle pulse)
 * - Multiple shape presets (box, circle, text)
 * - Configurable width and height
 * - Custom border radius
 * - Matches design tokens
 *
 * Use Cases:
 * - List loading states
 * - Card loading states
 * - Profile image loading
 * - Text content loading
 * - Avatar loading
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export type SkeletonShape = 'box' | 'circle' | 'text';

export interface SkeletonProps {
  // Dimensions
  width?: number | string;
  height?: number | string;

  // Shape presets
  shape?: SkeletonShape;

  // Appearance
  borderRadius?: number;
  animate?: boolean; // Enable/disable animation

  // Style overrides
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  shape = 'box',
  borderRadius,
  animate = true,
  style,
}) => {
  const { colors, radius } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  // Pulse animation
  useEffect(() => {
    if (!animate) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animate, opacity]);

  // Shape-specific styles
  const getShapeStyles = (): ViewStyle => {
    switch (shape) {
      case 'circle':
        // Ensure width equals height for perfect circle
        const size = typeof width === 'number' ? width : 40;
        return {
          width: size,
          height: size,
          borderRadius: size / 2,
        };

      case 'text':
        return {
          borderRadius: radius.sm,
        };

      case 'box':
      default:
        return {
          borderRadius: borderRadius !== undefined ? borderRadius : radius.md,
        };
    }
  };

  const containerStyle: ViewStyle = [
    styles.container,
    {
      width,
      height,
      backgroundColor: colors.muted,
    },
    getShapeStyles(),
    style,
  ] as ViewStyle;

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: animate ? opacity : 1,
        },
      ]}
    />
  );
};

/**
 * SkeletonGroup
 *
 * Pre-built skeleton layouts for common patterns.
 *
 * Use Cases:
 * - Card skeletons
 * - List item skeletons
 * - Profile skeletons
 */
export const SkeletonGroup = {
  /**
   * Card skeleton with image + text
   */
  Card: () => {
    const { spacing } = useTheme();
    return (
      <View style={{ gap: spacing.md }}>
        <Skeleton width="100%" height={160} shape="box" />
        <Skeleton width="80%" height={18} shape="text" />
        <Skeleton width="60%" height={14} shape="text" />
      </View>
    );
  },

  /**
   * List item skeleton with avatar + text
   */
  ListItem: () => {
    const { spacing } = useTheme();
    return (
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <Skeleton width={40} height={40} shape="circle" />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Skeleton width="70%" height={16} shape="text" />
          <Skeleton width="50%" height={14} shape="text" />
        </View>
      </View>
    );
  },

  /**
   * Text block skeleton
   */
  Text: ({ lines = 3 }: { lines?: number }) => {
    const { spacing } = useTheme();
    return (
      <View style={{ gap: spacing.sm }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '60%' : '100%'}
            height={14}
            shape="text"
          />
        ))}
      </View>
    );
  },

  /**
   * Avatar skeleton
   */
  Avatar: ({ size = 40 }: { size?: number }) => {
    return <Skeleton width={size} height={size} shape="circle" />;
  },
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Skeleton;
