import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useWeeklyProgress } from '@/queries/hooks/stats';
import { useCurrentUser } from '@/queries/hooks/user';

export const WeekDayCircles = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Fetch real data
  const { data: weeklyProgress, isLoading: isLoadingWeekly } = useWeeklyProgress();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const currentDay = new Date().getDay();
  const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday (0) to index 6, others shift by -1

  const dailyGoalMinutes = user?.preferences?.dailyGoalMinutes || 20;

  // Get minutes listened for a specific day index (0 = Mon, 6 = Sun)
  const getMinutesForDay = (dayIndex: number): number => {
    if (!weeklyProgress?.days) return 0;

    // weeklyProgress.days comes ordered from backend (last 7 days, oldest first)
    // We need to map our day index to the correct day in the array
    const day = weeklyProgress.days[dayIndex];
    return day ? Math.floor(day.minutesListened) : 0;
  };

  const isGoalMetForDay = (dayIndex: number): boolean => {
    return getMinutesForDay(dayIndex) >= dailyGoalMinutes;
  };

  const getCircleStyle = (index: number) => {
    if (index === currentDayIndex) {
      // Current day - check if goal is met
      return isGoalMetForDay(index)
        ? 'bg-primary border-primary'
        : 'bg-primary/50 border-primary/50';
    } else if (index < currentDayIndex) {
      // Previous days - show if goal was met
      return isGoalMetForDay(index)
        ? 'bg-primary border-primary'
        : 'bg-muted border-muted';
    } else {
      // Future days - lighter
      return 'bg-muted/50 border-muted/50';
    }
  };

  const getTextStyle = (index: number) => {
    if (index === currentDayIndex) {
      return 'text-primary-foreground';
    } else if (index < currentDayIndex) {
      return isGoalMetForDay(index) ? 'text-primary-foreground' : 'text-muted-foreground';
    } else {
      return 'text-muted-foreground/70';
    }
  };

  if (isLoadingWeekly || isLoadingUser) {
    return (
      <View className="flex-row justify-center py-2">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <>
      <View className="flex-row justify-center gap-3 py-2">
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDay(index)}
            activeOpacity={0.7}
            className={`
              w-12 h-12 rounded-full border-2 flex items-center justify-center
              ${getCircleStyle(index)}
            `}
          >
            {isGoalMetForDay(index) ? (
              <Feather name="check" size={20} color="#ffffff" />
            ) : (
              <Text className={`text-xs font-semibold ${getTextStyle(index)}`}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
          className="flex-1 items-center justify-center bg-black/50"
        >
          <View className="bg-card rounded-lg p-4 mx-4 border border-border">
            <Text className="text-foreground font-semibold text-lg mb-2">
              {selectedDay !== null ? days[selectedDay] : ''}
            </Text>
            <Text className="text-muted-foreground">
              {selectedDay !== null
                ? `${getMinutesForDay(selectedDay)} minutes listened`
                : ''}
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Goal: {dailyGoalMinutes} minutes
            </Text>
            {selectedDay !== null && isGoalMetForDay(selectedDay) && (
              <View className="flex-row items-center gap-1 mt-2">
                <Feather name="check-circle" size={16} color="#22c55e" />
                <Text className="text-green-500 font-medium">Goal Met!</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};