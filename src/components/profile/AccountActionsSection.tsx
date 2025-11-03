import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

interface AccountActionsSectionProps {
  onSignOut: () => void;
}

export const AccountActionsSection: React.FC<AccountActionsSectionProps> = ({
  onSignOut,
}) => {
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: onSignOut,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data, including downloaded books and progress, will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            // TODO: Implement delete account functionality
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@elmify.store").catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://www.elmify.store/privacy").catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const handleTermsOfService = () => {
    Linking.openURL("https://www.elmify.store/terms").catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <MaterialIcons name="settings" size={20} color="#a855f7" />
          <Text className="text-xl font-semibold text-card-foreground">
            Account Actions
          </Text>
        </CardTitle>
        <CardDescription>
          Account management and support options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="space-y-3">
          {/* Support & Help */}
          <View className="space-y-3">
            <Text className="text-sm font-medium text-foreground">
              Support & Help
            </Text>

            <TouchableOpacity
              onPress={handleContactSupport}
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="help-circle" size={18} color="#a855f7" />
                <View>
                  <Text className="text-base text-foreground">
                    Contact Support
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Get help with your account or app issues
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View className="space-y-3 pt-4 border-t border-border">
            <Text className="text-sm font-medium text-foreground">Legal</Text>

            <TouchableOpacity
              onPress={handlePrivacyPolicy}
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="shield" size={18} color="#a855f7" />
                <Text className="text-base text-foreground">
                  Privacy Policy
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTermsOfService}
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="file-text" size={18} color="#a855f7" />
                <Text className="text-base text-foreground">
                  Terms of Service
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <View className="space-y-3 pt-4 border-t border-border">
            <Text className="text-sm font-medium text-foreground">
              Account Management
            </Text>

            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="log-out" size={18} color="#f59e0b" />
                <Text className="text-base text-foreground">Sign Out</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-card border border-red-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="trash-2" size={18} color="#ef4444" />
                <Text className="text-base text-red-500">Delete Account</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="pt-4 border-t border-border">
            <View className="bg-muted rounded-lg p-4">
              <Text className="text-sm text-muted-foreground text-center">
                Islamic Audiobook App v1.0.0
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Built with love for the Islamic community
              </Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
