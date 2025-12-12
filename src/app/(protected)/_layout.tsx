import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useState, useEffect } from "react";
import FloatingPlayer from "@/components/FloatingPlayer";
import { guestModeManager } from "@/store/guestMode";
import { useAuthManager } from "@/hooks/auth/useAuthManager";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  // Initialize AuthManager with Clerk hooks
  useAuthManager();
  const [isGuest, setIsGuest] = useState(false);
  const [guestInitialized, setGuestInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const guestMode = await guestModeManager.initialize();
        setIsGuest(guestMode);
      } catch (error) {
        console.error("Failed to initialize guest mode:", error);
        // Default to non-guest mode if initialization fails
        setIsGuest(false);
      } finally {
        setGuestInitialized(true);
      }
    };
    init();

    const unsubscribe = guestModeManager.subscribe((newIsGuest) => {
      setIsGuest(newIsGuest);
    });

    return unsubscribe;
  }, []);

  // Wait for both Clerk and guest mode to initialize
  // Clerk's isLoaded handles all auth state rehydration automatically
  if (!isLoaded || !guestInitialized) {
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
