import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

type Theme = 'midnight' | 'charcoal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

/**
 * ThemeProvider
 *
 * Provides theme switching functionality across the app.
 *
 * NOTE: Theme switching currently only works on web platform.
 * React Native doesn't support CSS variables, so themes don't
 * change dynamically on iOS/Android.
 *
 * To fix this for React Native, we would need to:
 * 1. Replace CSS variable approach with hardcoded color values in tailwind.config.js
 * 2. Use a runtime theme hook that returns actual color values
 * 3. Rebuild all components to use the theme hook instead of CSS classes
 *
 * For now, React Native uses the default 'midnight' theme.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme,
  onThemeChange,
}) => {
  useEffect(() => {
    if (Platform.OS === 'web' && theme) {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove('midnight', 'charcoal');

      // Add the current theme class
      root.classList.add(theme);

      // Set data-theme attribute for CSS selectors
      root.setAttribute('data-theme', theme);
    }
    // On React Native, theme changes are saved to backend but don't apply visually
    // This is a known limitation of the CSS variable approach
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme: theme || 'midnight',
    setTheme: onThemeChange || (() => {}),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};