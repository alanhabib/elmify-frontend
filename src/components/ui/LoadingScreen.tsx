import React from 'react';
import { View, Image, Text } from 'react-native';
import { LinearProgressBar } from './LinearProgressBar';

interface LoadingScreenProps {
  /** Progress value from 0 to 100 */
  progress?: number;
  /** Optional message to show below progress bar */
  message?: string;
}

/**
 * Full-screen loading component with centered logo and progress bar
 * Used across all screens for consistent loading UX
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message,
}) => {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      {/* Logo */}
      <Image
        source={require('../../../assets/icon.png')}
        className="w-24 h-24 mb-8"
        resizeMode="contain"
      />

      {/* Progress Bar */}
      <View className="w-full max-w-xs">
        <LinearProgressBar progress={progress} height={4} />
      </View>

      {/* Optional Message */}
      {message && (
        <Text className="text-muted-foreground mt-4 text-sm">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingScreen;
