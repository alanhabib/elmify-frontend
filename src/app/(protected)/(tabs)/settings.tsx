import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

// Hooks
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useCurrentUser, useUpdatePreferences } from "@/queries/hooks/user";
import { useOfflineContent } from "@/hooks/useOfflineContent";

// Components
import { AppearanceSection } from "@/components/profile/AppearanceSection";
import { OfflineContentSection } from "@/components/profile/OfflineContentSection";
import { AccountActionsSection } from "@/components/profile/AccountActionsSection";

export default function Settings() {
  const { signOut } = useAuthManager();
  const { data: user, isLoading } = useCurrentUser();
  const updatePreferencesMutation = useUpdatePreferences();
  const offlineContent = useOfflineContent();

  const theme =
    (user?.preferences?.theme as "midnight" | "charcoal") || "midnight";
  const wifiOnly = !(user?.preferences?.autoDownload ?? false);

  const saveTheme = async (newTheme: "midnight" | "charcoal") => {
    updatePreferencesMutation.mutate({
      ...user?.preferences,
      theme: newTheme,
    });
  };

  const saveWifiOnlySetting = async (value: boolean) => {
    updatePreferencesMutation.mutate({
      ...user?.preferences,
      autoDownload: !value,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#a855f7" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="pb-6 px-4">
          {/* Header */}
          <View className="mb-6 pt-4">
            <Text className="text-2xl font-bold text-foreground">Settings</Text>
            <Text className="text-muted-foreground mt-1 text-base">
              Manage your preferences and account
            </Text>
          </View>

          {/* Appearance */}
          {/* <View className="mb-6">
            <AppearanceSection currentTheme={theme} onThemeChange={saveTheme} />
          </View> */}

          {/* Offline Content */}
          <View className="mb-6">
            <OfflineContentSection
              wifiOnly={wifiOnly}
              onWifiOnlyChange={saveWifiOnlySetting}
              downloadedItemsCount={offlineContent.downloadedItemsCount}
              storageUsed={offlineContent.storageUsed}
            />
          </View>

          {/* Account Actions */}
          <View className="mb-6">
            <AccountActionsSection onSignOut={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
