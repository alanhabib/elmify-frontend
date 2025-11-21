import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useState, useEffect } from "react";
import FloatingPlayer from "@/components/FloatingPlayer";
import { guestModeManager } from "@/store/guestMode";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [guestInitialized, setGuestInitialized] = useState(false);

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

  // Wait for both Clerk and guest mode to initialize
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
