import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

// Hooks
import { useCurrentUser, useUpdatePreferences } from "@/queries/hooks/user";
import { useDailySummary, useStreaks } from "@/queries/hooks/stats";

// Components
import { AccountSection } from "@/components/profile/AccountSection";
import { DailyGoalsSection } from "@/components/profile/DailyGoalsSection";
import { GoalAdjustModal } from "@/components/profile/modals/GoalAdjustModal";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { Toast } from "@/components/ui/Toast";

// Types
export interface DailyGoals {
  dailyGoalMinutes: number;
  currentStreak: number;
  bestStreak: number;
}

export interface TodayProgress {
  dailyMinutes: number;
}

export default function Profile() {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Fetch real data from backend
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();
  const {
    data: dailySummary,
    isLoading: isLoadingDaily,
    error: dailyError,
    refetch: refetchDaily,
  } = useDailySummary();
  const {
    data: streaks,
    isLoading: isLoadingStreaks,
    error: streaksError,
    refetch: refetchStreaks,
  } = useStreaks();
  const updatePreferencesMutation = useUpdatePreferences();

  // Build daily goals from real data
  const dailyGoals: DailyGoals = {
    dailyGoalMinutes: user?.preferences?.dailyGoalMinutes ?? 20,
    currentStreak: streaks?.currentStreak ?? 0,
    bestStreak: streaks?.bestStreak ?? 0,
  };

  const todayProgress: TodayProgress = {
    dailyMinutes: dailySummary?.todayMinutes
      ? Math.floor(dailySummary.todayMinutes)
      : 0,
  };

  const updateGoal = async (newGoalMinutes: number) => {
    updatePreferencesMutation.mutate(
      {
        ...user?.preferences,
        dailyGoalMinutes: newGoalMinutes,
      },
      {
        onSuccess: () => {
          setIsGoalModalOpen(false);
          setToast({
            visible: true,
            message: `Daily goal updated to ${newGoalMinutes} minutes`,
            type: 'success',
          });
        },
        onError: (error) => {
          console.error("Failed to update goal:", error);
          setToast({
            visible: true,
            message: 'Failed to update goal. Please try again.',
            type: 'error',
          });
          // Keep modal open on error so user can retry
        },
      }
    );
  };

  const isGoalMet = () =>
    todayProgress.dailyMinutes >= dailyGoals.dailyGoalMinutes;

  const isLoading = isLoadingUser || isLoadingDaily || isLoadingStreaks;
  const hasError = userError || dailyError || streaksError;

  const handleRetry = () => {
    if (userError) refetchUser();
    if (dailyError) refetchDaily();
    if (streaksError) refetchStreaks();
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <ProfileSkeleton />
      </ScrollView>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <Feather name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-foreground text-xl font-semibold mt-6">
          Failed to Load Profile
        </Text>
        <Text className="text-muted-foreground text-center mt-2 mb-6">
          {userError?.message || dailyError?.message || streaksError?.message ||
            "Something went wrong. Please try again."}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="bg-primary px-6 py-3 rounded-lg flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={18} color="#ffffff" />
          <Text className="text-primary-foreground font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />
        <ScrollView
          className="flex-1 bg-background"
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-6 px-4">
          {/* Header with Settings Icon */}
          <View className="mb-6 pt-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Profile</Text>
              <Text className="text-muted-foreground mt-1 text-base">
                Your progress and statistics
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/settings")}
              className="w-10 h-10 items-center justify-center rounded-full bg-card border border-border"
            >
              <Feather name="settings" size={20} color="#a855f7" />
            </TouchableOpacity>
          </View>

          {/* Account Information */}
          <View className="mb-6">
            <AccountSection
              email={user?.email || "user@example.com"}
              displayName={user?.displayName || undefined}
              profileImageUrl={user?.profileImageUrl || undefined}
              createdAt={user?.createdAt || undefined}
            />
          </View>

          {/* Daily Goals */}
          <View className="mb-6">
            <DailyGoalsSection
              dailyGoals={dailyGoals}
              todayProgress={todayProgress}
              isGoalMet={isGoalMet}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
            />
          </View>

          {/* Goal Adjustment Modal */}
          <GoalAdjustModal
            isVisible={isGoalModalOpen}
            currentGoal={dailyGoals.dailyGoalMinutes}
            onClose={() => setIsGoalModalOpen(false)}
            onSave={updateGoal}
          />
          </View>
        </ScrollView>
      </View>
  );
}
