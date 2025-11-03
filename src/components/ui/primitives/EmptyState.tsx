/**
 * EmptyState Component
 *
 * Beautiful empty state views for when there's no content.
 * Provides helpful messaging and calls-to-action.
 *
 * Features:
 * - Icon/illustration slot
 * - Title and description
 * - Optional CTA button
 * - Optional secondary action
 * - Customizable spacing
 *
 * Use Cases:
 * - Empty library
 * - No search results
 * - No favorites
 * - No downloads
 * - No history
 * - Network error states
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
import Button from './Button';

export interface EmptyStateProps {
  // Content
  icon?: React.ReactNode;
  title: string;
  description?: string;

  // Actions
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };

  // Appearance
  compact?: boolean; // Smaller version for inline use

  // Style overrides
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  const { colors, spacing, typography } = useTheme();

  const containerStyle: ViewStyle = [
    styles.container,
    {
      paddingHorizontal: spacing.lg,
      paddingVertical: compact ? spacing['2xl'] : spacing['4xl'],
    },
    style,
  ] as ViewStyle;

  const titleTextStyle: TextStyle = [
    styles.title,
    {
      fontSize: compact ? typography.title3.fontSize : typography.title2.fontSize,
      lineHeight: compact ? typography.title3.lineHeight : typography.title2.lineHeight,
      fontWeight: typography.title2.fontWeight,
      color: colors.foreground,
      marginTop: icon ? spacing.lg : 0,
    },
    titleStyle,
  ] as TextStyle;

  const descriptionTextStyle: TextStyle = [
    styles.description,
    {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight * 1.4, // Increased line height for readability
      color: colors.mutedForeground,
      marginTop: spacing.sm,
    },
    descriptionStyle,
  ] as TextStyle;

  return (
    <View style={containerStyle}>
      {/* Icon/Illustration */}
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      {/* Title */}
      <Text style={titleTextStyle}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={descriptionTextStyle}>{description}</Text>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <View
          style={[
            styles.actionsContainer,
            { gap: spacing.md, marginTop: spacing.xl },
          ]}
        >
          {primaryAction && (
            <Button
              variant="primary"
              onPress={primaryAction.onPress}
              size={compact ? 'md' : 'lg'}
              fullWidth={!secondaryAction}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="tertiary"
              onPress={secondaryAction.onPress}
              size={compact ? 'md' : 'lg'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Pre-built empty states for common scenarios
 */
export const EmptyStates = {
  /**
   * No search results
   */
  NoSearchResults: ({ onClear }: { onClear?: () => void }) => (
    <EmptyState
      title="No Results Found"
      description="Try adjusting your search or filters to find what you're looking for."
      primaryAction={
        onClear
          ? {
              label: 'Clear Search',
              onPress: onClear,
            }
          : undefined
      }
    />
  ),

  /**
   * Empty library
   */
  EmptyLibrary: ({ onBrowse }: { onBrowse: () => void }) => (
    <EmptyState
      title="Your Library is Empty"
      description="Start building your collection by browsing lectures and adding favorites."
      primaryAction={{
        label: 'Browse Lectures',
        onPress: onBrowse,
      }}
    />
  ),

  /**
   * No favorites
   */
  NoFavorites: ({ onDiscover }: { onDiscover: () => void }) => (
    <EmptyState
      title="No Favorites Yet"
      description="Mark lectures as favorites to easily access them here later."
      primaryAction={{
        label: 'Discover Lectures',
        onPress: onDiscover,
      }}
    />
  ),

  /**
   * No downloads
   */
  NoDownloads: ({ onBrowse }: { onBrowse: () => void }) => (
    <EmptyState
      title="No Downloads"
      description="Download lectures to listen offline anytime, anywhere."
      primaryAction={{
        label: 'Browse Lectures',
        onPress: onBrowse,
      }}
    />
  ),

  /**
   * No history
   */
  NoHistory: ({ onExplore }: { onExplore: () => void }) => (
    <EmptyState
      title="No Listening History"
      description="Your recently played lectures will appear here."
      primaryAction={{
        label: 'Start Exploring',
        onPress: onExplore,
      }}
    />
  ),

  /**
   * Network error
   */
  NetworkError: ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      primaryAction={{
        label: 'Retry',
        onPress: onRetry,
      }}
    />
  ),

  /**
   * Generic error
   */
  Error: ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
    <EmptyState
      title="Something Went Wrong"
      description={message || "We're having trouble loading this content. Please try again."}
      primaryAction={
        onRetry
          ? {
              label: 'Try Again',
              onPress: onRetry,
            }
          : undefined
      }
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});

export default EmptyState;
