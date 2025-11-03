/**
 * Animation Utilities
 * Reusable animation helpers for consistent, smooth UI transitions
 * Inspired by Apple Podcasts design system
 */

import { Platform } from 'react-native';

/**
 * Timing configurations for consistent animations across the app
 */
export const ANIMATION_TIMING = {
  /** Quick feedback animations (buttons, toggles) */
  fast: Platform.select({ ios: 200, android: 150, default: 200 }),

  /** Standard UI transitions (modals, navigation) */
  standard: Platform.select({ ios: 300, android: 250, default: 300 }),

  /** Slower, more dramatic animations (page transitions) */
  slow: Platform.select({ ios: 400, android: 350, default: 400 }),

  /** Stagger delay between list items */
  stagger: 50,
} as const;

/**
 * Easing curves for natural motion
 */
export const ANIMATION_EASING = {
  /** Smooth ease in and out (default for most animations) */
  easeInOut: [0.42, 0, 0.58, 1],

  /** Ease out (elements entering view) */
  easeOut: [0, 0, 0.58, 1],

  /** Ease in (elements leaving view) */
  easeIn: [0.42, 0, 1, 1],

  /** Spring-like bounce effect */
  spring: [0.68, -0.55, 0.27, 1.55],
} as const;

/**
 * Common transform values
 */
export const TRANSFORM_VALUES = {
  /** Scale down slightly on press */
  pressScale: 0.96,

  /** Subtle opacity for inactive items */
  inactiveOpacity: 0.6,

  /** Full opacity for active items */
  activeOpacity: 1,

  /** Translate distance for slide animations */
  slideDistance: 20,
} as const;

/**
 * Accessible animation duration multiplier
 * Respects user's accessibility settings
 */
export const getAccessibleDuration = (duration: number): number => {
  // In a real app, this would check system accessibility settings
  // For now, return the standard duration
  return duration;
};

/**
 * Calculate staggered delay for list items
 * Creates a cascading entrance effect
 */
export const getStaggerDelay = (index: number, maxDelay: number = 500): number => {
  return Math.min(index * ANIMATION_TIMING.stagger, maxDelay);
};
