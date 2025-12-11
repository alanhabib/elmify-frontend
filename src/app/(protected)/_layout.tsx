import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View, AppState, AppStateStatus } from "react-native";
import { useState, useEffect, useRef } from "react";
import FloatingPlayer from "@/components/FloatingPlayer";
import { guestModeManager } from "@/store/guestMode";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [guestInitialized, setGuestInitialized] = useState(false);
  const [isRehydrating, setIsRehydrating] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const wasAuthenticated = useRef<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const guestMode = await guestModeManager.initialize();
      setIsGuest(guestMode);
      setGuestInitialized(true);
    };
    init();

    const unsubscribe = guestModeManager.subscribe((newIsGuest) => {
      setIsGuest(newIsGuest);
    });

    return unsubscribe;
  }, []);

  // Track authentication status to prevent logout on app resume
  useEffect(() => {
    if (isLoaded && (isSignedIn || isGuest)) {
      wasAuthenticated.current = true;
    }
  }, [isLoaded, isSignedIn, isGuest]);

  // Handle app state changes to prevent logout during transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App is coming to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Set rehydrating state to prevent redirect while Clerk reloads session
        if (wasAuthenticated.current) {
          setIsRehydrating(true);
          // Give Clerk time to restore session from SecureStore
          setTimeout(() => {
            setIsRehydrating(false);
          }, 1000);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Wait for both Clerk and guest mode to initialize
  if (!isLoaded || !guestInitialized || isRehydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Allow access if signed in OR in guest mode
  if (!isSignedIn && !isGuest) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
      </Stack>
      <FloatingPlayer />
    </View>
  );
}
