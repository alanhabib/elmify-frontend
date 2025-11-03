/**
 * Button Component
 *
 * Apple Podcasts-inspired button with 4 variants.
 * Uses design tokens for consistent styling.
 *
 * Variants:
 * - primary: Main CTA button (filled with primary color)
 * - secondary: Secondary actions (filled with muted color)
 * - tertiary: Tertiary actions (outlined style)
 * - ghost: Minimal style (text only with highlight on press)
 *
 * Features:
 * - Haptic feedback on press
 * - Loading state with spinner
 * - Disabled state
 * - Icon support (left/right)
 * - Full width option
 * - Three sizes (sm, md, lg)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  // Content
  children: React.ReactNode;

  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // State
  disabled?: boolean;
  loading?: boolean;

  // Interaction
  onPress?: () => void;

  // Style overrides
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
}) => {
  const { colors, spacing, radius, typography } = useTheme();

  // Size configuration
  const sizeConfig = {
    sm: {
      height: 36,
      paddingHorizontal: spacing.md,
      fontSize: typography.footnote.fontSize,
      iconSize: 16,
      gap: spacing.xs,
    },
    md: {
      height: 44,
      paddingHorizontal: spacing.lg,
      fontSize: typography.body.fontSize,
      iconSize: 18,
      gap: spacing.sm,
    },
    lg: {
      height: 52,
      paddingHorizontal: spacing.xl,
      fontSize: typography.callout.fontSize,
      iconSize: 20,
      gap: spacing.sm,
    },
  };

  const config = sizeConfig[size];

  // Variant styles
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? colors.muted : colors.primary,
            borderWidth: 0,
          },
          text: {
            color: colors.primaryForeground,
            fontWeight: '600',
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? colors.muted : colors.secondary,
            borderWidth: 0,
          },
          text: {
            color: colors.secondaryForeground,
            fontWeight: '600',
          },
        };

      case 'tertiary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? colors.border : colors.primary,
          },
          text: {
            color: isDisabled ? colors.mutedForeground : colors.primary,
            fontWeight: '600',
          },
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: isDisabled ? colors.mutedForeground : colors.foreground,
            fontWeight: '500',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = [
    styles.container,
    {
      height: config.height,
      paddingHorizontal: config.paddingHorizontal,
      borderRadius: radius.lg,
      gap: config.gap,
    },
    fullWidth && styles.fullWidth,
    variantStyles.container,
    style,
  ] as ViewStyle;

  const textStyles: TextStyle = [
    styles.text,
    {
      fontSize: config.fontSize,
      lineHeight: config.fontSize * 1.3,
    },
    variantStyles.text,
    textStyle,
  ] as TextStyle;

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      // TODO: Add haptic feedback when react-native-haptic-feedback is installed
      // Haptics.trigger('impactMedium');
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'secondary'
              ? colors.primaryForeground
              : colors.primary
          }
        />
      ) : (
        <>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={textStyles}>{children}</Text>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
