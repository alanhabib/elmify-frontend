import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface GoalAdjustModalProps {
  isVisible: boolean;
  currentGoal: number;
  onClose: () => void;
  onSave: (newGoal: number) => void;
}

export const GoalAdjustModal: React.FC<GoalAdjustModalProps> = ({
  isVisible,
  currentGoal,
  onClose,
  onSave,
}) => {
  const [goalValue, setGoalValue] = useState(currentGoal.toString());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (isVisible) {
      setGoalValue(currentGoal.toString());
      setIsValid(true);
    }
  }, [isVisible, currentGoal]);

  const validateGoal = (value: string) => {
    const numValue = parseInt(value);
    return !isNaN(numValue) && numValue >= 5 && numValue <= 180;
  };

  const handleGoalChange = (text: string) => {
    setGoalValue(text);
    setIsValid(validateGoal(text));
  };

  const handleSave = () => {
    const numValue = parseInt(goalValue);
    if (validateGoal(goalValue)) {
      onSave(numValue);
      onClose();
    } else {
      Alert.alert(
        'Invalid Goal',
        'Please enter a goal between 5 and 180 minutes.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    setGoalValue(currentGoal.toString());
    setIsValid(true);
    onClose();
  };

  const presetGoals = [10, 15, 20, 30, 45, 60];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-card rounded-xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-semibold text-card-foreground">
                Adjust Daily Goal
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Set your daily listening target
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-muted items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Current Goal Display */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              Current Goal
            </Text>
            <View className="bg-muted rounded-lg p-3">
              <Text className="text-base text-muted-foreground">
                {currentGoal} minutes per day
              </Text>
            </View>
          </View>

          {/* Manual Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              New Goal (minutes)
            </Text>
            <TextInput
              value={goalValue}
              onChangeText={handleGoalChange}
              keyboardType="numeric"
              placeholder="Enter minutes (5-180)"
              className={`
                border-2 rounded-lg px-3 py-2 text-base text-foreground bg-background
                ${isValid ? 'border-border' : 'border-red-500'}
              `}
              placeholderTextColor="#6b7280"
            />
            {!isValid && (
              <Text className="text-red-500 text-xs mt-1">
                Goal must be between 5 and 180 minutes
              </Text>
            )}
          </View>

          {/* Preset Goals */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              Quick Select
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {presetGoals.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleGoalChange(preset.toString())}
                  className={`
                    px-3 py-2 rounded-lg border
                    ${parseInt(goalValue) === preset
                      ? 'bg-primary border-primary'
                      : 'bg-muted border-border'
                    }
                  `}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`
                      text-sm font-medium
                      ${parseInt(goalValue) === preset
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    {preset}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-muted rounded-lg py-3 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-muted-foreground font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSave}
              className={`
                flex-1 rounded-lg py-3 items-center
                ${isValid ? 'bg-primary' : 'bg-muted'}
              `}
              activeOpacity={0.7}
              disabled={!isValid}
            >
              <Text
                className={`
                  font-medium
                  ${isValid ? 'text-primary-foreground' : 'text-muted-foreground'}
                `}
              >
                Save Goal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View className="mt-4 pt-4 border-t border-border">
            <Text className="text-xs text-muted-foreground text-center">
              Recommended: Start with 15-30 minutes daily and adjust based on your schedule
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};