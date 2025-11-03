/**
 * Badge Component
 *
 * Small status indicator for labels, counts, and states.
 *
 * Variants:
 * - default: Neutral gray badge
 * - primary: Primary color badge
 * - success: Green badge (completed, online, etc.)
 * - warning: Yellow/orange badge (pending, caution)
 * - destructive: Red badge (error, offline, delete)
 * - outline: Outlined badge with no fill
 *
 * Features:
 * - Multiple variants for different states
 * - Configurable sizes
 * - Optional dot indicator
 * - Icon support
 *
 * Use Cases:
 * - Status indicators (new, featured, etc.)
 * - Count badges (notification count, etc.)
 * - Category tags
 * - Download status
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  // Content
  children?: React.ReactNode;
  label?: string;

  // Appearance
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean; // Shows just a dot without text
  icon?: React.ReactNode;

  // Style overrides
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors, spacing, radius, typography } = useTheme();

  // Size configuration
  const sizeConfig = {
    sm: {
      height: 18,
      paddingHorizontal: spacing.xs,
      fontSize: typography.caption2.fontSize,
      dotSize: 6,
    },
    md: {
      height: 22,
      paddingHorizontal: spacing.sm,
      fontSize: typography.caption1.fontSize,
      dotSize: 8,
    },
    lg: {
      height: 26,
      paddingHorizontal: spacing.md,
      fontSize: typography.footnote.fontSize,
      dotSize: 10,
    },
  };

  const config = sizeConfig[size];

  // Variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (variant) {
      case 'default':
        return {
          container: {
            backgroundColor: colors.muted,
            borderWidth: 0,
          },
          text: {
            color: colors.mutedForeground,
          },
        };

      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            borderWidth: 0,
          },
          text: {
            color: colors.primaryForeground,
          },
        };

      case 'success':
        return {
          container: {
            backgroundColor: colors.success,
            borderWidth: 0,
          },
          text: {
            color: colors.successForeground,
          },
        };

      case 'warning':
        return {
          container: {
            backgroundColor: colors.warning,
            borderWidth: 0,
          },
          text: {
            color: colors.warningForeground,
          },
        };

      case 'destructive':
        return {
          container: {
            backgroundColor: colors.destructive,
            borderWidth: 0,
          },
          text: {
            color: colors.destructiveForeground,
          },
        };

      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: {
            color: colors.foreground,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Dot-only badge (no text)
  if (dot) {
    const dotStyle: ViewStyle = {
      width: config.dotSize,
      height: config.dotSize,
      borderRadius: config.dotSize / 2,
      backgroundColor: variantStyles.container.backgroundColor || colors.primary,
    };

    return <View style={[dotStyle, style]} />;
  }

  // Regular badge with text
  const containerStyle: ViewStyle = [
    styles.container,
    {
      height: config.height,
      paddingHorizontal: config.paddingHorizontal,
      borderRadius: radius.full,
      gap: spacing.xs,
    },
    variantStyles.container,
    style,
  ] as ViewStyle;

  const badgeTextStyle: TextStyle = [
    styles.text,
    {
      fontSize: config.fontSize,
      lineHeight: config.fontSize * 1.2,
      fontWeight: '600',
    },
    variantStyles.text,
    textStyle,
  ] as TextStyle;

  const content = label || children;

  return (
    <View style={containerStyle}>
      {icon && <View style={styles.icon}>{icon}</View>}
      {typeof content === 'string' ? (
        <Text style={badgeTextStyle} numberOfLines={1}>
          {content}
        </Text>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Badge;
