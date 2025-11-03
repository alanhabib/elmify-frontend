/**
 * ListItem Component
 *
 * Apple Podcasts-inspired list row component.
 * Reusable for various list patterns throughout the app.
 *
 * Features:
 * - Left content slot (thumbnail, avatar, icon)
 * - Title and subtitle
 * - Right content slot (chevron, badge, button)
 * - Tap interaction with highlight
 * - Optional divider
 * - Swipeable actions support (future enhancement)
 *
 * Use Cases:
 * - Lecture lists
 * - Settings rows
 * - Collection items
 * - Speaker items
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export interface ListItemProps {
  // Content
  title: string;
  subtitle?: string;
  description?: string; // Third line (optional)

  // Slots
  left?: React.ReactNode; // Thumbnail, avatar, icon
  right?: React.ReactNode; // Chevron, badge, button

  // Appearance
  showDivider?: boolean;
  dividerInset?: number; // Left padding for divider (to align with text)

  // Interaction
  onPress?: () => void;
  disabled?: boolean;

  // Style overrides
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  left,
  right,
  showDivider = true,
  dividerInset,
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { colors, spacing, typography } = useTheme();

  const containerStyle: ViewStyle = [
    styles.container,
    {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.background,
    },
    style,
  ] as ViewStyle;

  const titleTextStyle: TextStyle = [
    styles.title,
    {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      color: colors.foreground,
    },
    titleStyle,
  ] as TextStyle;

  const subtitleTextStyle: TextStyle = [
    styles.subtitle,
    {
      fontSize: typography.footnote.fontSize,
      lineHeight: typography.footnote.lineHeight,
      color: colors.mutedForeground,
      marginTop: spacing.xs / 2,
    },
    subtitleStyle,
  ] as TextStyle;

  const descriptionTextStyle: TextStyle = [
    styles.description,
    {
      fontSize: typography.caption1.fontSize,
      lineHeight: typography.caption1.lineHeight,
      color: colors.mutedForeground,
      marginTop: spacing.xs / 2,
    },
  ] as TextStyle;

  const dividerStyle: ViewStyle = {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: dividerInset !== undefined ? dividerInset : left ? 56 : spacing.lg,
  };

  const content = (
    <>
      <View style={styles.innerContainer}>
        {/* Left content */}
        {left && <View style={styles.leftSlot}>{left}</View>}

        {/* Main content */}
        <View style={styles.contentContainer}>
          <Text style={titleTextStyle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={subtitleTextStyle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text style={descriptionTextStyle} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        {/* Right content */}
        {right && <View style={styles.rightSlot}>{right}</View>}
      </View>

      {/* Divider */}
      {showDivider && <View style={dividerStyle} />}
    </>
  );

  // If onPress is provided, make it tappable
  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  // Otherwise, just a regular view
  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSlot: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    // Dynamic styles applied
  },
  subtitle: {
    // Dynamic styles applied
  },
  description: {
    // Dynamic styles applied
  },
});

export default ListItem;
