/**
 * Search Bar Component
 * Reusable search input with icon
 */

import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = "Search lectures, speakers, collections..." 
}: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-card border border-border rounded-lg px-4 py-3 mb-4">
      <Ionicons 
        name="search" 
        size={20} 
        className="text-muted-foreground mr-3" 
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-foreground text-base"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};