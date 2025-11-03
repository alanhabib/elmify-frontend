/**
 * Design System - Animation Tokens
 * Apple-Inspired Animation System
 *
 * Based on iOS spring animations and timing curves
 * Uses react-native-reanimated for smooth 60fps animations
 */

/**
 * Animation Durations (in milliseconds)
 */
export const durations = {
  instant: 0,
  fastest: 100,
  faster: 150,
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 500,
  slowest: 600,
} as const;

/**
 * Semantic Animation Durations
 * Common animation types with appropriate timing
 */
export const semanticDurations = {
  // UI feedback
  buttonPress: durations.fastest,        // 100ms
  ripple: durations.fast,                // 200ms
  toast: durations.normal,               // 300ms

  // Transitions
  screenTransition: durations.normal,    // 300ms
  modalPresent: durations.normal,        // 300ms
  modalDismiss: durations.fast,          // 200ms

  // Components
  cardHover: durations.faster,           // 150ms
  listItemPress: durations.fastest,      // 100ms
  tabSwitch: durations.fast,             // 200ms

  // Player
  playerExpand: durations.normal,        // 300ms
  playerCollapse: durations.fast,        // 200ms
  progressUpdate: durations.instant,     // 0ms (smooth)

  // Loading states
  skeletonPulse: 1500,                   // 1.5s
  spinnerRotate: 1000,                   // 1s
} as const;

/**
 * Easing Functions
 * CSS-style easing for React Native Animated API
 */
export const easings = {
  // Standard easings
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic bezier curves (iOS-inspired)
  // Format: cubic-bezier(x1, y1, x2, y2)
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',       // Material standard
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',    // Slow out
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',      // Speed up
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',         // Quick & sharp

  // iOS-specific curves
  iosStandard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // iOS default
  iosEnter: 'cubic-bezier(0.42, 0, 1, 1)',         // Entering screen
  iosExit: 'cubic-bezier(0, 0, 0.58, 1)',          // Exiting screen
} as const;

/**
 * Spring Animation Configs
 * For react-native-reanimated's spring animations
 * Based on iOS UIKit spring parameters
 */
export interface SpringConfig {
  damping: number;
  mass: number;
  stiffness: number;
  overshootClamping?: boolean;
  restSpeedThreshold?: number;
  restDisplacementThreshold?: number;
}

export const springs: Record<string, SpringConfig> = {
  // Gentle spring - Smooth, no bounce
  // Use case: Modals, sheets, gentle transitions
  gentle: {
    damping: 30,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },

  // Bouncy spring - Light bounce
  // Use case: Button presses, interactive elements
  bouncy: {
    damping: 15,
    mass: 1,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },

  // Snappy spring - Quick, responsive
  // Use case: Quick UI feedback, tab switches
  snappy: {
    damping: 20,
    mass: 0.8,
    stiffness: 400,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },

  // Wobbly spring - Playful bounce
  // Use case: Celebratory animations, playful interactions
  wobbly: {
    damping: 10,
    mass: 1,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },

  // Stiff spring - Rigid, fast
  // Use case: Precise movements, no overshoot needed
  stiff: {
    damping: 25,
    mass: 0.5,
    stiffness: 500,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },

  // Slow spring - Deliberate, smooth
  // Use case: Large movements, dramatic transitions
  slow: {
    damping: 40,
    mass: 1.2,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
};

/**
 * Semantic Spring Configs
 * Pre-defined spring configs for common use cases
 */
export const semanticSprings = {
  // UI Elements
  button: springs.snappy,
  card: springs.gentle,
  modal: springs.gentle,
  sheet: springs.gentle,

  // Navigation
  screenTransition: springs.gentle,
  tabSwitch: springs.snappy,

  // Player
  playerExpand: springs.gentle,
  playerCollapse: springs.snappy,
  playPauseToggle: springs.bouncy,

  // Gestures
  swipe: springs.stiff,
  drag: springs.gentle,

  // Feedback
  success: springs.bouncy,
  error: springs.wobbly,
} as const;

/**
 * Transition Types
 * For screen transitions (react-navigation)
 */
export const transitions = {
  // iOS-style slide from right
  slideFromRight: {
    animation: 'spring',
    config: springs.gentle,
  },

  // iOS-style modal presentation
  modalFromBottom: {
    animation: 'spring',
    config: springs.gentle,
  },

  // Fade transition
  fade: {
    animation: 'timing',
    duration: durations.normal,
  },

  // No transition
  none: {
    animation: 'timing',
    duration: 0,
  },
} as const;

/**
 * Gesture Configs
 * For react-native-gesture-handler
 */
export const gestures = {
  // Swipe thresholds
  swipeVelocityThreshold: 500,       // px/s
  swipeDistanceThreshold: 50,        // px

  // Pan thresholds
  panActivationDistance: 10,         // px
  panMinPointers: 1,
  panMaxPointers: 1,

  // Long press
  longPressDuration: 500,            // ms

  // Double tap
  doubleTapInterval: 300,            // ms
} as const;

/**
 * Animation Presets
 * Complete animation configurations for common patterns
 */
export const presets = {
  // Fade in animation
  fadeIn: {
    duration: durations.normal,
    from: { opacity: 0 },
    to: { opacity: 1 },
    easing: easings.easeOut,
  },

  // Fade out animation
  fadeOut: {
    duration: durations.fast,
    from: { opacity: 1 },
    to: { opacity: 0 },
    easing: easings.easeIn,
  },

  // Scale up animation (e.g., button press)
  scaleUp: {
    duration: durations.fastest,
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 0.95 }] },
    easing: easings.easeOut,
  },

  // Scale down animation (e.g., button release)
  scaleDown: {
    duration: durations.faster,
    from: { transform: [{ scale: 0.95 }] },
    to: { transform: [{ scale: 1 }] },
    easing: easings.easeOut,
  },

  // Slide in from right
  slideInRight: {
    duration: durations.normal,
    from: { transform: [{ translateX: 300 }] },
    to: { transform: [{ translateX: 0 }] },
    easing: easings.iosEnter,
  },

  // Slide out to right
  slideOutRight: {
    duration: durations.fast,
    from: { transform: [{ translateX: 0 }] },
    to: { transform: [{ translateX: 300 }] },
    easing: easings.iosExit,
  },

  // Slide in from bottom
  slideInBottom: {
    duration: durations.normal,
    from: { transform: [{ translateY: 600 }] },
    to: { transform: [{ translateY: 0 }] },
    easing: easings.iosEnter,
  },

  // Slide out to bottom
  slideOutBottom: {
    duration: durations.fast,
    from: { transform: [{ translateY: 0 }] },
    to: { transform: [{ translateY: 600 }] },
    easing: easings.iosExit,
  },
} as const;

/**
 * Stagger Delay Calculator
 * For staggered list animations
 *
 * @param index - Item index in list
 * @param baseDelay - Base delay in ms (default: 50ms)
 * @returns Delay in ms
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Export default durations
 */
export default durations;
