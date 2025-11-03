/**
 * Design System - Spacing Tokens
 * 8-Point Grid System
 *
 * Based on Apple's spacing conventions
 * All spacing values are multiples of 4 or 8
 *
 * Benefits:
 * - Consistent spacing throughout the app
 * - Easy to maintain and scale
 * - Better visual rhythm
 * - Aligns with iOS design principles
 */

export interface SpacingScale {
  // Base unit: 4px
  xs: number;      // 4px  - Tiny gaps
  sm: number;      // 8px  - Small gaps
  md: number;      // 12px - Medium gaps
  lg: number;      // 16px - Standard gaps
  xl: number;      // 20px - Large gaps
  '2xl': number;   // 24px - Extra large gaps
  '3xl': number;   // 32px - Section spacing
  '4xl': number;   // 40px - Large section spacing
  '5xl': number;   // 48px - Extra large section spacing
  '6xl': number;   // 64px - Hero spacing
}

/**
 * Spacing Scale
 * All values in pixels
 */
export const spacing: SpacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

/**
 * Semantic Spacing
 * Common spacing patterns with semantic names
 */
export const semanticSpacing = {
  // Screen padding (horizontal edges)
  screenHorizontal: spacing.lg,        // 16px
  screenVertical: spacing['2xl'],      // 24px

  // Card padding
  cardPadding: spacing.lg,             // 16px
  cardPaddingSmall: spacing.md,        // 12px
  cardPaddingLarge: spacing.xl,        // 20px

  // List item spacing
  listItemVertical: spacing.md,        // 12px (top/bottom)
  listItemHorizontal: spacing.lg,      // 16px (left/right)
  listItemGap: spacing.sm,             // 8px (between elements)

  // Section spacing
  sectionSpacing: spacing['2xl'],      // 24px (between major sections)
  sectionSpacingSmall: spacing.lg,     // 16px (between minor sections)
  sectionSpacingLarge: spacing['3xl'], // 32px (between major page sections)

  // Component spacing
  buttonPaddingVertical: spacing.md,   // 12px
  buttonPaddingHorizontal: spacing.xl, // 20px
  inputPaddingVertical: spacing.md,    // 12px
  inputPaddingHorizontal: spacing.lg,  // 16px

  // Gap spacing (between elements)
  gapTiny: spacing.xs,                 // 4px
  gapSmall: spacing.sm,                // 8px
  gapMedium: spacing.md,               // 12px
  gapLarge: spacing.lg,                // 16px
  gapXLarge: spacing.xl,               // 20px

  // Modal/Sheet spacing
  modalPadding: spacing['2xl'],        // 24px
  sheetHandleMargin: spacing.md,       // 12px

  // Safe area insets (additional padding on top of system insets)
  safeAreaTopExtra: spacing.sm,        // 8px
  safeAreaBottomExtra: spacing.lg,     // 16px

  // Tab bar
  tabBarHeight: 49,                    // iOS standard
  tabBarIconSize: 28,                  // Standard icon size
  tabBarIconMargin: spacing.xs,        // 4px (above label)

  // Player
  playerControlGap: spacing['2xl'],    // 24px (between control groups)
  playerProgressMargin: spacing.lg,    // 16px (progress bar sides)
  playerArtworkMargin: spacing['3xl'], // 32px (artwork top/bottom)
};

/**
 * Border Radius Scale
 * Consistent rounding for UI elements
 */
export interface RadiusScale {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

export const radius: RadiusScale = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // Fully rounded (pill shape)
};

/**
 * Semantic Border Radius
 */
export const semanticRadius = {
  // Buttons
  button: radius.lg,            // 12px
  buttonSmall: radius.md,       // 8px
  buttonLarge: radius.xl,       // 16px
  buttonPill: radius.full,      // Fully rounded

  // Cards
  card: radius.lg,              // 12px
  cardSmall: radius.md,         // 8px
  cardLarge: radius.xl,         // 16px

  // Inputs
  input: radius.lg,             // 12px

  // Images
  thumbnail: radius.md,         // 8px
  thumbnailSmall: radius.sm,    // 4px
  thumbnailLarge: radius.lg,    // 12px
  avatar: radius.full,          // Fully rounded

  // Modals
  modal: radius.xl,             // 16px
  modalLarge: radius['2xl'],    // 20px
  sheet: radius.xl,             // 16px (top corners only)

  // Player
  playerArtwork: radius['3xl'], // 24px
  playerControl: radius.full,   // Fully rounded
};

/**
 * Icon Sizes
 * Standard icon sizes throughout the app
 */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

/**
 * Semantic Icon Sizes
 */
export const semanticIconSizes = {
  tabBar: iconSizes.lg,         // 28px
  button: iconSizes.md,         // 24px
  listItem: iconSizes.md,       // 24px
  playerControl: iconSizes['2xl'], // 40px
  playerControlLarge: iconSizes['4xl'], // 64px (play/pause)
};

/**
 * Touch Target Sizes
 * Minimum sizes for interactive elements (iOS HIG: 44x44pt)
 */
export const touchTargets = {
  minimum: 44,      // iOS minimum
  small: 40,        // Compact but still accessible
  medium: 44,       // Standard
  large: 56,        // Prominent actions
  hero: 80,         // Large play button, etc.
};

/**
 * Elevation/Shadow Offsets
 * Used with shadow system
 */
export const elevationOffsets = {
  none: { x: 0, y: 0 },
  sm: { x: 0, y: 1 },
  md: { x: 0, y: 2 },
  lg: { x: 0, y: 4 },
  xl: { x: 0, y: 8 },
  '2xl': { x: 0, y: 16 },
};

/**
 * Helper function to get spacing value
 */
export const getSpacing = (size: keyof SpacingScale): number => {
  return spacing[size];
};

/**
 * Helper function to get multiple spacing values
 * Usage: getSpacings('sm', 'md', 'lg') returns [8, 12, 16]
 */
export const getSpacings = (...sizes: Array<keyof SpacingScale>): number[] => {
  return sizes.map(size => spacing[size]);
};

/**
 * Export default spacing scale
 */
export default spacing;
