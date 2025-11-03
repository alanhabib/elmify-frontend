/**
 * Avatar Component
 *
 * Circular image component with fallback support.
 *
 * Features:
 * - Circular image display
 * - Fallback to initials when image fails to load
 * - Configurable sizes (xs, sm, md, lg, xl)
 * - Border support for emphasis
 * - Status indicator badge (online, offline, etc.)
 * - Loading state
 *
 * Use Cases:
 * - User profile pictures
 * - Speaker avatars
 * - Collection author images
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away' | null;

export interface AvatarProps {
  // Image
  imageUrl?: string;

  // Fallback
  name?: string; // Used to generate initials
  fallbackIcon?: React.ReactNode; // Custom fallback icon

  // Appearance
  size?: AvatarSize;
  borderWidth?: number;
  borderColor?: string;

  // Status
  status?: AvatarStatus;

  // Style overrides
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  fallbackIcon,
  size = 'md',
  borderWidth = 0,
  borderColor,
  status = null,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Size configuration
  const sizeConfig = {
    xs: { dimension: 24, fontSize: 10, statusSize: 8 },
    sm: { dimension: 32, fontSize: 12, statusSize: 10 },
    md: { dimension: 40, fontSize: 14, statusSize: 12 },
    lg: { dimension: 56, fontSize: 18, statusSize: 14 },
    xl: { dimension: 80, fontSize: 24, statusSize: 18 },
    '2xl': { dimension: 120, fontSize: 36, statusSize: 22 },
  };

  const config = sizeConfig[size];

  // Generate initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Status indicator colors
  const getStatusColor = (): string => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'offline':
        return colors.mutedForeground;
      case 'busy':
        return colors.destructive;
      case 'away':
        return colors.warning;
      default:
        return 'transparent';
    }
  };

  const containerStyle: ViewStyle = [
    styles.container,
    {
      width: config.dimension,
      height: config.dimension,
      borderRadius: config.dimension / 2,
      borderWidth,
      borderColor: borderColor || colors.border,
      backgroundColor: colors.muted,
    },
    style,
  ] as ViewStyle;

  const fallbackTextStyle: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: '600',
    color: colors.mutedForeground,
  };

  const statusIndicatorStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: config.statusSize,
    height: config.statusSize,
    borderRadius: config.statusSize / 2,
    backgroundColor: getStatusColor(),
    borderWidth: 2,
    borderColor: colors.background,
  };

  return (
    <View style={containerStyle}>
      {imageUrl && !imageError ? (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => setImageError(true)}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </>
      ) : (
        <View style={styles.fallbackContainer}>
          {fallbackIcon ? (
            fallbackIcon
          ) : (
            <Text style={fallbackTextStyle}>{getInitials(name)}</Text>
          )}
        </View>
      )}

      {/* Status indicator */}
      {status && <View style={statusIndicatorStyle} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default Avatar;
