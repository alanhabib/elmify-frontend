import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export type SegmentOption = {
  value: string;
  label: string;
};

interface SegmentedControlProps {
  options: SegmentOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <View className="flex-row bg-muted rounded-lg p-1">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 py-2 px-4 rounded-md ${
              isSelected ? 'bg-background' : ''
            }`}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
