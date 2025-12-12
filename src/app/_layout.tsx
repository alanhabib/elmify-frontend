import "../../global.css";
import React from "react";
import { Stack } from "expo-router";
import { DarkTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ClerkProvider } from "@clerk/clerk-expo";
import PlayerProvider from "@/providers/PlayerProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { QueryProvider } from "@/providers/QueryProvider";
import { tokenCache } from "cache";

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "hsl(230, 32%, 12%)", // Using the new midnight theme background
    card: "hsl(230, 32%, 15%)", // Card color from new theme
    primary: "hsl(265, 90%, 65%)", // Electric purple primary
    text: "hsl(220, 20%, 98%)", // Foreground color
  },
};

export default function RootLayout() {

  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider defaultMode="dark">
        <NavigationThemeProvider value={theme}>
          <QueryProvider>
            <ClerkProvider
              publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
              tokenCache={tokenCache}
            >
              <PlayerProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(protected)" />
                </Stack>
              </PlayerProvider>
            </ClerkProvider>
          </QueryProvider>
        </NavigationThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
