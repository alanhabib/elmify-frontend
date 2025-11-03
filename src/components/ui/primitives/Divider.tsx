/**
 * Divider Component
 *
 * Visual separator for sections and content.
 *
 * Orientations:
 * - horizontal: Default, separates vertical content
 * - vertical: Separates horizontal content
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Optional label/text in the middle
 * - Configurable thickness
 * - Custom color support
 * - Spacing control (margin)
 *
 * Use Cases:
 * - Section separators
 * - List dividers
 * - Content blocks separation
 * - "OR" separators in forms
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

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  // Content
  label?: string;

  // Appearance
  orientation?: DividerOrientation;
  thickness?: number; // Custom thickness (default: hairline)
  color?: string; // Custom color
  spacing?: number; // Vertical margin for horizontal, horizontal margin for vertical

  // Style overrides
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  orientation = 'horizontal',
  thickness,
  color,
  spacing,
  style,
  labelStyle,
}) => {
  const { colors, typography } = useTheme();

  const defaultThickness = thickness || StyleSheet.hairlineWidth;
  const dividerColor = color || colors.border;

  // Horizontal divider (default)
  if (orientation === 'horizontal') {
    // With label (e.g., "OR" separator)
    if (label) {
      const containerStyle: ViewStyle = [
        styles.horizontalWithLabel,
        {
          marginVertical: spacing !== undefined ? spacing : 16,
        },
        style,
      ] as ViewStyle;

      const lineStyle: ViewStyle = {
        flex: 1,
        height: defaultThickness,
        backgroundColor: dividerColor,
      };

      const textStyle: TextStyle = [
        styles.label,
        {
          fontSize: typography.caption1.fontSize,
          color: colors.mutedForeground,
          paddingHorizontal: 12,
        },
        labelStyle,
      ] as TextStyle;

      return (
        <View style={containerStyle}>
          <View style={lineStyle} />
          <Text style={textStyle}>{label}</Text>
          <View style={lineStyle} />
        </View>
      );
    }

    // Simple horizontal line
    const simpleStyle: ViewStyle = [
      styles.horizontal,
      {
        height: defaultThickness,
        backgroundColor: dividerColor,
        marginVertical: spacing !== undefined ? spacing : 0,
      },
      style,
    ] as ViewStyle;

    return <View style={simpleStyle} />;
  }

  // Vertical divider
  const verticalStyle: ViewStyle = [
    styles.vertical,
    {
      width: defaultThickness,
      backgroundColor: dividerColor,
      marginHorizontal: spacing !== undefined ? spacing : 0,
    },
    style,
  ] as ViewStyle;

  return <View style={verticalStyle} />;
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    alignSelf: 'stretch',
  },
  horizontalWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default Divider;
