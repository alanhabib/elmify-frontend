/**
 * Design System - Shadow/Elevation Tokens
 * Apple-Inspired Shadow System
 *
 * Creates depth and hierarchy through subtle shadows
 * Optimized for both light and dark modes
 */

import { ViewStyle } from 'react-native';
import { ColorMode } from './colors';

export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android shadow
}

export interface ShadowScale {
  none: ShadowToken;
  subtle: ShadowToken;
  small: ShadowToken;
  medium: ShadowToken;
  large: ShadowToken;
  floating: ShadowToken;
}

/**
 * Light Mode Shadows
 * More pronounced shadows for light backgrounds
 */
export const lightShadows: ShadowScale = {
  // No shadow
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle shadow - For cards slightly elevated
  // Use case: Default cards, list items
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Small shadow - For interactive elements
  // Use case: Buttons, inputs, small cards
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadow - For raised elements
  // Use case: Modals, popovers, floating buttons
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Large shadow - For prominent elements
  // Use case: Sheets, dialogs, major UI elements
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  // Floating shadow - For elements that float above everything
  // Use case: FABs, floating player, tooltips
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

/**
 * Dark Mode Shadows
 * More subtle shadows for dark backgrounds
 * Dark mode uses lighter shadows with less opacity
 */
export const darkShadows: ShadowScale = {
  // No shadow
  none: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle shadow
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },

  // Small shadow
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadow
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // Large shadow
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },

  // Floating shadow
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
};

/**
 * Get shadows for specific color mode
 */
export const getShadows = (mode: ColorMode): ShadowScale => {
  return mode === 'light' ? lightShadows : darkShadows;
};

/**
 * Get shadow style as ViewStyle
 * Can be spread directly into style prop
 *
 * Usage:
 * ```tsx
 * <View style={[styles.card, getShadowStyle('medium', 'light')]}>
 * ```
 */
export const getShadowStyle = (
  level: keyof ShadowScale,
  mode: ColorMode
): ViewStyle => {
  const shadows = getShadows(mode);
  const shadow = shadows[level];

  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: shadow.elevation,
  };
};

/**
 * Semantic Shadow Mappings
 * Pre-defined shadow levels for common UI elements
 */
export const semanticShadows = {
  // Cards
  card: 'subtle' as keyof ShadowScale,
  cardHover: 'small' as keyof ShadowScale,
  cardElevated: 'medium' as keyof ShadowScale,

  // Buttons
  button: 'small' as keyof ShadowScale,
  buttonPressed: 'subtle' as keyof ShadowScale,

  // Modals
  modal: 'large' as keyof ShadowScale,
  sheet: 'large' as keyof ShadowScale,
  popover: 'medium' as keyof ShadowScale,

  // Player
  floatingPlayer: 'floating' as keyof ShadowScale,
  playerArtwork: 'medium' as keyof ShadowScale,

  // Navigation
  tabBar: 'small' as keyof ShadowScale,
  header: 'subtle' as keyof ShadowScale,

  // Interactive
  fab: 'floating' as keyof ShadowScale,
  tooltip: 'medium' as keyof ShadowScale,
};

/**
 * Helper to get semantic shadow style
 *
 * Usage:
 * ```tsx
 * <View style={[styles.card, getSemanticShadow('card', 'light')]}>
 * ```
 */
export const getSemanticShadow = (
  semantic: keyof typeof semanticShadows,
  mode: ColorMode
): ViewStyle => {
  const level = semanticShadows[semantic];
  return getShadowStyle(level, mode);
};

/**
 * Border styles that can be used instead of shadows
 * Useful for flat design or when shadows don't work well
 */
export const borders = {
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  subtle: {
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  light: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  medium: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  strong: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
};

/**
 * Dark mode borders
 */
export const darkBorders = {
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  subtle: {
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  medium: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  strong: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
};

/**
 * Get border style for color mode
 */
export const getBorderStyle = (
  level: keyof typeof borders,
  mode: ColorMode
): ViewStyle => {
  return mode === 'light' ? borders[level] : darkBorders[level];
};

/**
 * Export default (light mode shadows)
 */
export default lightShadows;
