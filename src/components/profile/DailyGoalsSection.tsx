import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { WeekDayCircles } from '@/components/dashboard/WeekDayCircles';
import { AnimatedFireIcon } from '@/components/ui/AnimatedFireIcon';
import type { DailyGoals, TodayProgress } from '@/app/(protected)/(tabs)/profile';

interface DailyGoalsSectionProps {
  dailyGoals: DailyGoals;
  todayProgress: TodayProgress;
  isGoalMet: () => boolean;
  onOpenGoalModal: () => void;
}

export const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({
  dailyGoals,
  todayProgress,
  isGoalMet,
  onOpenGoalModal,
}) => {
  const progressPercentage = Math.min((todayProgress.dailyMinutes / dailyGoals.dailyGoalMinutes) * 100, 100);
  const remainingMinutes = Math.max(dailyGoals.dailyGoalMinutes - todayProgress.dailyMinutes, 0);

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex-row items-center gap-2">
            <Feather name="target" size={20} color="#a855f7" />
            <Text className="text-xl font-semibold text-card-foreground">Daily Goals</Text>
          </CardTitle>
          <CardDescription>Track your daily listening progress and streaks</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-6">
            {/* Progress Circle */}
            <View className="items-center py-2">
              <CircularProgress 
                value={todayProgress.dailyMinutes}
                max={dailyGoals.dailyGoalMinutes}
                size="lg"
              >
                <View className="items-center">
                  <Text className="text-2xl font-bold text-foreground">
                    {todayProgress.dailyMinutes}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    of {dailyGoals.dailyGoalMinutes} min
                  </Text>
                  {isGoalMet() && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Text className="text-xs text-primary font-semibold">
                        Goal Met!
                      </Text>
                      <Text className="text-xs">🎉</Text>
                    </View>
                  )}
                </View>
              </CircularProgress>
            </View>

            {/* Weekly Progress */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-foreground text-center">
                This Week
              </Text>
              <WeekDayCircles />
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-4" />

            {/* Stats Row */}
            <View className="flex-row">
              <View className="items-center flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <AnimatedFireIcon size={18} color="#ff6b35" />
                  <Text className="text-2xl font-bold text-foreground">
                    {dailyGoals.currentStreak}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground text-center leading-tight">
                  Current Streak
                </Text>
              </View>
              
              <View className="w-px bg-border mx-4" />
              
              <View className="items-center flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="emoji-events" size={18} color="#fbbf24" />
                  <Text className="text-2xl font-bold text-foreground">
                    {dailyGoals.bestStreak}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground text-center leading-tight">
                  Best Streak
                </Text>
              </View>
              
              <View className="w-px bg-border mx-4" />
              
              <View className="items-center flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="clock" size={16} color="#6b7280" />
                  <Text className="text-2xl font-bold text-foreground">
                    {remainingMinutes}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground text-center leading-tight">
                  Minutes Left
                </Text>
              </View>
            </View>

            {/* Adjust Goal Button */}
            <TouchableOpacity
              onPress={onOpenGoalModal}
              className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex-row items-center justify-center gap-2"
              activeOpacity={0.7}
            >
              <Feather name="edit-2" size={14} color="#a855f7" />
              <Text className="text-primary font-medium text-sm">
                Adjust Goal ({dailyGoals.dailyGoalMinutes} min)
              </Text>
            </TouchableOpacity>
          </View>
        </CardContent>
    </Card>
  );
};