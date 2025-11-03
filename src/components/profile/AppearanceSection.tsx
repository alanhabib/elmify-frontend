import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

interface AppearanceSectionProps {
  currentTheme: "midnight" | "charcoal";
  onThemeChange: (theme: "midnight" | "charcoal") => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const themeOptions = [
    {
      id: "midnight" as const,
      name: "Midnight",
      description: "Deep blues and purples",
      preview: "#1e293b", // slate-800
      accent: "#a855f7", // purple-500
    },
    {
      id: "charcoal" as const,
      name: "Charcoal",
      description: "Dark grays with coral highlights",
      preview: "#374151", // gray-700
      accent: "#f97316", // orange-500
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <Feather name="code" size={20} color="#a855f7" />
          <Text className="text-xl font-semibold text-card-foreground">
            Appearance
          </Text>
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="space-y-4">
          <Text className="text-sm font-medium text-foreground">Theme</Text>
          <View className="space-y-3">
            {themeOptions.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                onPress={() => onThemeChange(theme.id)}
                className={`
                    border-2 rounded-lg p-4 flex-row items-center gap-3
                    ${
                      currentTheme === theme.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }
                  `}
                activeOpacity={0.7}
              >
                {/* Theme Preview */}
                <View className="flex-row gap-1">
                  <View
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: theme.preview }}
                  />
                  <View
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: theme.accent }}
                  />
                </View>

                {/* Theme Info */}
                <View className="flex-1">
                  <Text
                    className={`
                      text-base font-medium
                      ${
                        currentTheme === theme.id
                          ? "text-primary"
                          : "text-foreground"
                      }
                    `}
                  >
                    {theme.name}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {theme.description}
                  </Text>
                </View>

                {/* Selection Indicator */}
                {currentTheme === theme.id && (
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Feather name="check" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Options */}
          <View className="pt-4 border-t border-border">
            <Text className="text-sm text-muted-foreground">
              Theme changes apply immediately and are saved automatically.
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
