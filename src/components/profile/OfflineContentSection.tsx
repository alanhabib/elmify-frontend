import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

interface OfflineContentSectionProps {
  wifiOnly: boolean;
  onWifiOnlyChange: (value: boolean) => void;
  downloadedItemsCount: number;
  storageUsed: string;
}

export const OfflineContentSection: React.FC<OfflineContentSectionProps> = ({
  wifiOnly,
  onWifiOnlyChange,
  downloadedItemsCount,
  storageUsed,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <MaterialIcons name="offline-pin" size={20} color="#a855f7" />
          <Text className="text-xl font-semibold text-card-foreground">
            Offline Content
          </Text>
        </CardTitle>
        <CardDescription>
          Manage your downloaded audiobooks and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="space-y-6">
          {/* Storage Usage */}
          <View className="space-y-3">
            <Text className="text-sm font-medium text-foreground">
              Storage Usage
            </Text>
            <View className="bg-muted rounded-lg p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-muted-foreground">
                  Downloaded Items
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {downloadedItemsCount} books
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  Space Used
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {storageUsed}
                </Text>
              </View>
            </View>
          </View>

          {/* Download Settings */}
          <View className="space-y-4">
            <Text className="text-sm font-medium text-foreground">
              Download Settings
            </Text>

            {/* WiFi Only Toggle */}
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-base text-foreground">
                  Download on WiFi only
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Prevent downloads when using cellular data
                </Text>
              </View>
              <Switch
                value={wifiOnly}
                onValueChange={onWifiOnlyChange}
                trackColor={{ false: "#374151", true: "#a855f7" }}
                thumbColor={wifiOnly ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#374151"
              />
            </View>
          </View>

          {/* Management Actions */}
          <View className="space-y-3 pt-4 border-t border-border">
            <Text className="text-sm font-medium text-foreground">
              Manage Downloads
            </Text>

            <TouchableOpacity
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
              onPress={() => router.push("/(protected)/(tabs)/downloads")}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="download" size={18} color="#a855f7" />
                <View>
                  <Text className="text-base text-foreground">
                    View Downloaded Books
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Manage your offline library
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-card border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Feather name="trash-2" size={18} color="#ef4444" />
                <View>
                  <Text className="text-base text-foreground">
                    Clear All Downloads
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Free up storage space
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Download Quality */}
          <View className="space-y-3 pt-4 border-t border-border">
            <Text className="text-sm font-medium text-foreground">
              Download Quality
            </Text>
            <View className="bg-muted rounded-lg p-4">
              <Text className="text-sm text-muted-foreground">
                Downloads are optimized for quality and storage efficiency.
                High-quality audio with smart compression.
              </Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
