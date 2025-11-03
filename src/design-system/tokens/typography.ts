/**
 * Design System - Typography Tokens
 * Apple SF Pro-Inspired Typography Scale
 *
 * Based on iOS Human Interface Guidelines
 * Font: SF Pro Display (large sizes) / SF Pro Text (small sizes)
 *
 * Note: React Native doesn't have SF Pro by default
 * We'll use system fonts that closely match:
 * - iOS: Native SF Pro
 * - Android: Roboto (fallback)
 */

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  fontFamily?: string;
}

export interface TypographyScale {
  // Display sizes (Large titles)
  largeTitle: TypographyToken;
  title1: TypographyToken;
  title2: TypographyToken;
  title3: TypographyToken;

  // Content sizes
  headline: TypographyToken;
  body: TypographyToken;
  callout: TypographyToken;
  subheadline: TypographyToken;
  footnote: TypographyToken;
  caption1: TypographyToken;
  caption2: TypographyToken;
}

/**
 * Font Families
 * iOS will use SF Pro automatically
 * Android will use Roboto
 */
export const fontFamilies = {
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium', // Android doesn't have semibold, use medium
    bold: 'Roboto-Bold',
  },
  default: 'System',
};

/**
 * Typography Scale
 * Based on iOS Human Interface Guidelines
 *
 * Points are converted to React Native units (approximately pixels)
 * iOS uses pt (points), which are device-independent
 */
export const typography: TypographyScale = {
  // Large Title - 34pt
  // Used for: Main screen titles, hero content
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700', // Bold
    letterSpacing: 0.37,
  },

  // Title 1 - 28pt
  // Used for: Section titles, prominent headings
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700', // Bold
    letterSpacing: 0.36,
  },

  // Title 2 - 22pt
  // Used for: Secondary headings, card titles
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700', // Bold
    letterSpacing: 0.35,
  },

  // Title 3 - 20pt
  // Used for: Tertiary headings, list section headers
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600', // Semibold
    letterSpacing: 0.38,
  },

  // Headline - 17pt Semibold
  // Used for: Emphasized content, button labels, tab bar items
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600', // Semibold
    letterSpacing: -0.41,
  },

  // Body - 17pt Regular
  // Used for: Primary body text, list items
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400', // Regular
    letterSpacing: -0.41,
  },

  // Callout - 16pt Regular
  // Used for: Secondary body text, descriptions
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400', // Regular
    letterSpacing: -0.32,
  },

  // Subheadline - 15pt Regular
  // Used for: Secondary labels, supporting text
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400', // Regular
    letterSpacing: -0.24,
  },

  // Footnote - 13pt Regular
  // Used for: Meta information, timestamps, captions
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400', // Regular
    letterSpacing: -0.08,
  },

  // Caption 1 - 12pt Regular
  // Used for: Small labels, badge text
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400', // Regular
    letterSpacing: 0,
  },

  // Caption 2 - 11pt Regular
  // Used for: Smallest text, legal text
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400', // Regular
    letterSpacing: 0.07,
  },
};

/**
 * Font Weight Mapping
 * Maps semantic names to numeric values
 */
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

/**
 * Get font style for React Native Text component
 *
 * Usage:
 * ```tsx
 * <Text style={getTextStyle('headline')}>Hello</Text>
 * ```
 */
export const getTextStyle = (variant: keyof TypographyScale) => {
  const token = typography[variant];
  return {
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
    letterSpacing: token.letterSpacing || 0,
  };
};

/**
 * Responsive typography helper
 * Scales font sizes based on device size
 *
 * @param variant - Typography variant
 * @param scale - Scale factor (default: 1)
 */
export const getResponsiveTextStyle = (
  variant: keyof TypographyScale,
  scale: number = 1
) => {
  const token = typography[variant];
  return {
    fontSize: token.fontSize * scale,
    lineHeight: token.lineHeight * scale,
    fontWeight: token.fontWeight,
    letterSpacing: (token.letterSpacing || 0) * scale,
  };
};

/**
 * Common text style combinations
 * Pre-defined styles for common use cases
 */
export const textStyles = {
  // Screen titles
  screenTitle: getTextStyle('largeTitle'),

  // Section headers
  sectionTitle: getTextStyle('title2'),

  // Card titles
  cardTitle: getTextStyle('headline'),

  // List item primary text
  listItemTitle: getTextStyle('body'),

  // List item secondary text
  listItemSubtitle: {
    ...getTextStyle('subheadline'),
    opacity: 0.7,
  },

  // Button text
  button: getTextStyle('headline'),

  // Tab bar text
  tabBar: getTextStyle('caption1'),

  // Time stamps
  timestamp: {
    ...getTextStyle('footnote'),
    opacity: 0.6,
  },

  // Placeholder text
  placeholder: {
    ...getTextStyle('body'),
    opacity: 0.3,
  },
};

/**
 * Export default typography scale
 */
export default typography;
