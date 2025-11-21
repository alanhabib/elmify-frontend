import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Hooks
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import { useCurrentUser, useUpdatePreferences, useDeleteAccount } from "@/queries/hooks/user";
import { useOfflineContent } from "@/hooks/useOfflineContent";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useDownloads } from "@/hooks/useDownload";

// Components
import { AppearanceSection } from "@/components/profile/AppearanceSection";
import { OfflineContentSection } from "@/components/profile/OfflineContentSection";
import { AccountActionsSection } from "@/components/profile/AccountActionsSection";
import { DeleteAccountModal } from "@/components/profile/modals/DeleteAccountModal";

export default function Settings() {
  const { isSignedIn } = useAuth();
  const { disableGuestMode } = useGuestMode();
  const { signOut } = useAuthManager();
  const { data: user, isLoading } = useCurrentUser();
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAccountMutation = useDeleteAccount();
  const offlineContent = useOfflineContent();
  const { clearAllDownloads } = useDownloads();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Guest mode - show sign in prompt
  if (!isSignedIn) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Settings",
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  className="ml-2"
                  name="chevron-back-outline"
                  size={28}
                  color="#a855f7"
                />
              </TouchableOpacity>
            ),
          }}
        />
        <View className="flex-1 bg-background items-center justify-center px-6">
          <View className="bg-card rounded-2xl p-8 items-center border border-border w-full max-w-sm">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
              <Feather name="settings" size={40} color="#a855f7" />
            </View>
            <Text className="text-foreground text-2xl font-bold text-center mb-3">
              Sign In Required
            </Text>
            <Text className="text-muted-foreground text-center mb-8 leading-6">
              Sign in to access your settings and preferences.
            </Text>
            <TouchableOpacity
              onPress={() => {
                disableGuestMode();
                router.push('/sign-in');
              }}
              className="bg-primary w-full py-4 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-primary-foreground font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

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

  const handleDeleteAccount = async (confirmEmail: string) => {
    try {
      // Delete from backend (this also deletes from Clerk)
      await deleteAccountMutation.mutateAsync(confirmEmail);

      // IMPORTANT: Sign out IMMEDIATELY after successful delete
      // This clears the local Clerk session before any token refresh attempts
      await signOut();

      // Clear local downloads
      await clearAllDownloads();

      // Close modal
      setIsDeleteModalVisible(false);

      // Navigate to sign-in and show confirmation
      router.replace('/sign-in');

      // Small delay to ensure navigation completes before alert
      setTimeout(() => {
        Alert.alert(
          "Account Deleted",
          "Your account has been permanently deleted.",
          [{ text: "OK" }]
        );
      }, 100);
    } catch (error) {
      // Error will be shown inline in the modal via the error prop
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                className="ml-2"
                name="chevron-back-outline"
                size={28}
                color="#a855f7"
              />
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
            <AccountActionsSection
              onSignOut={handleSignOut}
              onDeleteAccount={() => setIsDeleteModalVisible(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isVisible={isDeleteModalVisible}
        userEmail={user?.email || ""}
        onClose={() => {
          setIsDeleteModalVisible(false);
          deleteAccountMutation.reset();
        }}
        onDelete={handleDeleteAccount}
        isDeleting={deleteAccountMutation.isPending}
        error={deleteAccountMutation.error?.message || null}
      />
    </>
  );
}
