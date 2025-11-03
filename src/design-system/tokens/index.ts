/**
 * Design System - Tokens Index
 * Central export point for all design tokens
 *
 * Import this file to access any design token:
 * ```ts
 * import { colors, typography, spacing, shadows, animations } from '@/design-system/tokens';
 * ```
 */

// Colors
export * from './colors';
export { lightColors, darkColors, getColors, defaultColorMode } from './colors';

// Typography
export * from './typography';
export { typography, getTextStyle, textStyles, fontWeights } from './typography';

// Spacing & Layout
export * from './spacing';
export {
  spacing,
  semanticSpacing,
  radius,
  semanticRadius,
  iconSizes,
  semanticIconSizes,
  touchTargets,
} from './spacing';

// Shadows & Elevation
export * from './shadows';
export {
  lightShadows,
  darkShadows,
  getShadows,
  getShadowStyle,
  getSemanticShadow,
  semanticShadows,
} from './shadows';

// Animations
export * from './animations';
export {
  durations,
  semanticDurations,
  easings,
  springs,
  semanticSprings,
  transitions,
  gestures,
  presets,
} from './animations';

/**
 * Theme type definitions
 * Combine all tokens into a single theme object
 */
import { ColorTokens } from './colors';
import { TypographyScale } from './typography';
import { SpacingScale, RadiusScale } from './spacing';
import { ShadowScale } from './shadows';

export interface Theme {
  colors: ColorTokens;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadows: ShadowScale;
  mode: 'light' | 'dark';
}

/**
 * Default exports for convenience
 */
export { default as typographyTokens } from './typography';
export { default as spacingTokens } from './spacing';
export { default as shadowTokens } from './shadows';
export { default as animationTokens } from './animations';
