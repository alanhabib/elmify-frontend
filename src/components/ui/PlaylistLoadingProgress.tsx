import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface PlaylistLoadingProgressProps {
  current: number;
  total: number;
  message?: string;
}

/**
 * Loading progress indicator for playlist URL fetching
 * Shows clean progress with percentage
 */
export const PlaylistLoadingProgress: React.FC<PlaylistLoadingProgressProps> = ({
  current,
  total,
  message = 'Loading playlist...',
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <View className="flex-1 justify-center items-center bg-background px-6">
      <ActivityIndicator size="large" className="text-primary mb-4" />

      <Text className="text-foreground text-lg font-semibold mb-2">
        {message}
      </Text>

      <View className="w-full max-w-xs">
        {/* Progress bar */}
        <View className="h-2 bg-muted rounded-full overflow-hidden mb-2">
          <View
            className="h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </View>

        {/* Progress text */}
        <Text className="text-muted-foreground text-sm text-center">
          {current} / {total} tracks ({percentage}%)
        </Text>
      </View>
    </View>
  );
};
