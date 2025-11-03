/**
 * Developer Testing Section
 * Simplified version for development testing
 * Note: Advanced testing hooks were removed during architecture cleanup
 */

import { View, Text } from "react-native";

interface DeveloperTestingSectionProps {
  isVisible?: boolean;
}

export const DeveloperTestingSection = ({
  isVisible = __DEV__,
}: DeveloperTestingSectionProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View className="p-4 m-4 bg-gray-100 rounded-lg">
      <Text className="text-lg font-bold text-gray-800 mb-2">
        🔧 Developer Section
      </Text>
      <Text className="text-sm text-gray-600">
        Testing hooks were removed during architecture cleanup. React Query
        DevTools can be used for API debugging.
      </Text>
    </View>
  );
};
