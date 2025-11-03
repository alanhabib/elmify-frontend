/**
 * ThemeProvider V2
 * Modern theme system using design tokens
 *
 * Features:
 * - Works on React Native (iOS/Android) and web
 * - Automatic system theme detection
 * - Full design token integration
 * - TypeScript support
 * - Persistent theme preference
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorMode, getColors, ColorTokens } from '@/design-system/tokens/colors';
import { typography, TypographyScale } from '@/design-system/tokens/typography';
import { spacing, SpacingScale, radius, RadiusScale } from '@/design-system/tokens/spacing';
import { getShadows, ShadowScale } from '@/design-system/tokens/shadows';
import { Theme } from '@/design-system/tokens';

/**
 * Theme Mode
 * - 'light': Light mode
 * - 'dark': Dark mode
 * - 'system': Follow system preference
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme Context Type
 * Provides all design tokens and theme controls
 */
interface ThemeContextType {
  // Theme mode
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;

  // Actual color mode being used (resolved from 'system')
  colorMode: ColorMode;

  // Design tokens
  colors: ColorTokens;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadows: ShadowScale;

  // Complete theme object
  theme: Theme;

  // Helpers
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  persistKey?: string; // For AsyncStorage persistence (future enhancement)
}

/**
 * ThemeProvider
 *
 * Provides theme context to the entire app.
 * Automatically detects system theme and allows manual override.
 *
 * Usage:
 * ```tsx
 * <ThemeProvider defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark', // Default to dark for now (as per current app)
  persistKey = '@theme_mode',
}) => {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  // Resolve the actual color mode
  // If mode is 'system', use system preference
  // Otherwise use the explicitly set mode
  const colorMode: ColorMode = useMemo(() => {
    if (mode === 'system') {
      return (systemColorScheme as ColorMode) || 'dark';
    }
    return mode as ColorMode;
  }, [mode, systemColorScheme]);

  // Get design tokens based on color mode
  const colors = useMemo(() => getColors(colorMode), [colorMode]);
  const shadows = useMemo(() => getShadows(colorMode), [colorMode]);

  // Create complete theme object
  const theme: Theme = useMemo(
    () => ({
      colors,
      typography,
      spacing,
      radius,
      shadows,
      mode: colorMode,
    }),
    [colors, shadows, colorMode]
  );

  // Helper booleans
  const isDark = colorMode === 'dark';
  const isLight = colorMode === 'light';

  // Update mode handler with optional persistence
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);

    // TODO: Persist to AsyncStorage
    // AsyncStorage.setItem(persistKey, newMode);
  };

  // Load persisted theme on mount
  useEffect(() => {
    // TODO: Load from AsyncStorage
    // AsyncStorage.getItem(persistKey).then((value) => {
    //   if (value) setModeState(value as ThemeMode);
    // });
  }, [persistKey]);

  const contextValue: ThemeContextType = {
    mode,
    setMode,
    colorMode,
    colors,
    typography,
    spacing,
    radius,
    shadows,
    theme,
    isDark,
    isLight,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 *
 * Access theme context from any component.
 *
 * Usage:
 * ```tsx
 * const { colors, isDark, setMode } = useTheme();
 *
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.foreground }}>Hello</Text>
 * </View>
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * useColors Hook
 *
 * Shorthand to get just the colors object.
 *
 * Usage:
 * ```tsx
 * const colors = useColors();
 * ```
 */
export const useColors = (): ColorTokens => {
  const { colors } = useTheme();
  return colors;
};

/**
 * useColorMode Hook
 *
 * Get just the color mode and setter.
 *
 * Usage:
 * ```tsx
 * const { colorMode, setMode } = useColorMode();
 * ```
 */
export const useColorMode = () => {
  const { colorMode, mode, setMode } = useTheme();
  return { colorMode, mode, setMode };
};

/**
 * Export default
 */
export default ThemeProvider;
