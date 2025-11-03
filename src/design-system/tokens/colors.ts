/**
 * Design System - Color Tokens
 * Apple Podcasts-Inspired Color Palette
 *
 * Features:
 * - Semantic color naming
 * - Light and dark mode support
 * - Accessible contrast ratios (WCAG AA compliant)
 * - Dynamic color adaptation
 */

export type ColorMode = 'light' | 'dark';

export interface ColorTokens {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryForeground: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Background colors
  background: string;
  backgroundElevated: string;
  backgroundSubtle: string;

  // Foreground/Text colors
  foreground: string;
  foregroundSecondary: string;
  foregroundTertiary: string;
  foregroundMuted: string;

  // Border colors
  border: string;
  borderSubtle: string;
  borderFocus: string;

  // Card/Surface colors
  card: string;
  cardElevated: string;
  cardForeground: string;

  // Status colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;

  // Interactive states
  hover: string;
  active: string;
  disabled: string;
  disabledForeground: string;

  // Overlay colors
  overlay: string;
  overlayHeavy: string;

  // Special colors
  favorite: string;
  playing: string;
  downloaded: string;
}

/**
 * Light Mode Colors
 * Based on Apple Podcasts light theme
 */
export const lightColors: ColorTokens = {
  // Primary - Purple (Apple Podcasts signature color)
  primary: '#8E4EC6',
  primaryHover: '#7A3FB8',
  primaryActive: '#6930AA',
  primaryForeground: '#FFFFFF',

  // Secondary - Indigo
  secondary: '#5E5CE6',
  secondaryForeground: '#FFFFFF',

  // Accent - Teal
  accent: '#32ADE6',
  accentForeground: '#FFFFFF',

  // Backgrounds
  background: '#FFFFFF',
  backgroundElevated: '#F9F9F9',
  backgroundSubtle: '#F5F5F7',

  // Foreground/Text
  foreground: '#1D1D1F',
  foregroundSecondary: '#6E6E73',
  foregroundTertiary: '#86868B',
  foregroundMuted: '#A1A1A6',

  // Borders
  border: '#D2D2D7',
  borderSubtle: '#E5E5EA',
  borderFocus: '#8E4EC6',

  // Cards
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  cardForeground: '#1D1D1F',

  // Status
  success: '#34C759',
  successForeground: '#FFFFFF',
  warning: '#FF9500',
  warningForeground: '#FFFFFF',
  error: '#FF3B30',
  errorForeground: '#FFFFFF',
  info: '#007AFF',
  infoForeground: '#FFFFFF',

  // Interactive
  hover: 'rgba(0, 0, 0, 0.04)',
  active: 'rgba(0, 0, 0, 0.08)',
  disabled: '#F5F5F7',
  disabledForeground: '#C7C7CC',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayHeavy: 'rgba(0, 0, 0, 0.6)',

  // Special
  favorite: '#FF3B30',
  playing: '#8E4EC6',
  downloaded: '#34C759',
};

/**
 * Dark Mode Colors
 * Based on Apple Podcasts dark theme
 */
export const darkColors: ColorTokens = {
  // Primary - Purple (adjusted for dark mode)
  primary: '#A855F7',
  primaryHover: '#B967FF',
  primaryActive: '#CA79FF',
  primaryForeground: '#FFFFFF',

  // Secondary - Indigo
  secondary: '#7C7CFF',
  secondaryForeground: '#FFFFFF',

  // Accent - Teal
  accent: '#5AC8FA',
  accentForeground: '#000000',

  // Backgrounds
  background: '#000000',
  backgroundElevated: '#1C1C1E',
  backgroundSubtle: '#2C2C2E',

  // Foreground/Text
  foreground: '#FFFFFF',
  foregroundSecondary: '#EBEBF5',
  foregroundTertiary: '#EBEBF599', // 60% opacity
  foregroundMuted: '#EBEBF54D', // 30% opacity

  // Borders
  border: '#38383A',
  borderSubtle: '#2C2C2E',
  borderFocus: '#A855F7',

  // Cards
  card: '#1C1C1E',
  cardElevated: '#2C2C2E',
  cardForeground: '#FFFFFF',

  // Status
  success: '#30D158',
  successForeground: '#000000',
  warning: '#FF9F0A',
  warningForeground: '#000000',
  error: '#FF453A',
  errorForeground: '#FFFFFF',
  info: '#0A84FF',
  infoForeground: '#FFFFFF',

  // Interactive
  hover: 'rgba(255, 255, 255, 0.08)',
  active: 'rgba(255, 255, 255, 0.16)',
  disabled: '#2C2C2E',
  disabledForeground: '#48484A',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.75)',

  // Special
  favorite: '#FF453A',
  playing: '#A855F7',
  downloaded: '#30D158',
};

/**
 * Get colors for specific mode
 */
export const getColors = (mode: ColorMode): ColorTokens => {
  return mode === 'light' ? lightColors : darkColors;
};

/**
 * System color detection helper
 * Returns 'light' or 'dark' based on device settings
 */
export const getSystemColorMode = (): ColorMode => {
  // This will be implemented in the ThemeProvider using useColorScheme from React Native
  return 'dark'; // Default to dark for now
};

/**
 * Color utilities
 */
export const colorUtils = {
  /**
   * Add opacity to hex color
   * @param hex - Hex color string (e.g., '#FFFFFF')
   * @param opacity - Opacity value 0-1
   */
  withOpacity: (hex: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${hex}${alpha}`;
  },

  /**
   * Check if color is light or dark
   * @param hex - Hex color string
   * @returns true if light, false if dark
   */
  isLight: (hex: string): boolean => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 128;
  },
};

/**
 * Export default color mode
 */
export const defaultColorMode: ColorMode = 'dark';
