# Profile Screen Improvement Plan

**Project:** AudibleClone
**Target:** `client/src/app/(protected)/(tabs)/profile.tsx`
**Date:** 2025-10-08
**Status:** Planning Phase

---

## Executive Summary

This document outlines a comprehensive plan to transform the Profile screen from using mock/local data to real backend integration, improve UI/UX, fix theme switching issues, and reorganize features into a dedicated Settings screen.

### Key Issues Identified
1. **Mock Data Usage**: Email, daily goals, streaks, today's progress, offline storage are all hardcoded or stored locally
2. **Theme Not Changing**: Theme provider only applies CSS on web platform, not React Native
3. **Feature Organization**: Profile screen mixes account info with settings - needs separation
4. **Missing Backend Integration**: No user stats API, no listening stats API, no offline content tracking

---

## 🔍 1. Audit of Mock Data and Real Data Sources

### Current Mock Data

#### 1.1 Account Section (`line 128`)
```typescript
<AccountSection email="user@example.com" />
```
- **Status**: Hardcoded mock email
- **Real Source**: Clerk `useUser()` hook provides `user.primaryEmailAddress.emailAddress`
- **Additional Data Available**:
  - Display name: `user.fullName`
  - Profile image: `user.imageUrl`
  - Created date: `user.createdAt`

#### 1.2 Daily Goals Section (`lines 33-41`)
```typescript
const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
  dailyGoalMinutes: 20,    // Mock
  currentStreak: 3,        // Mock
  bestStreak: 7,          // Mock
});

const [todayProgress, setTodayProgress] = useState<TodayProgress>({
  dailyMinutes: 15,       // Mock
});
```
- **Status**: Hardcoded local state, saved to AsyncStorage
- **Real Source Needed**: Backend API endpoints required
  - `GET /api/v1/users/me/stats` - Daily goals and progress
  - `GET /api/v1/users/me/streaks` - Current and best streaks
  - `PUT /api/v1/users/me/goals` - Update daily goal
- **Backend Entity**: Already exists (`ListeningStats` entity) but no API implementation

#### 1.3 Weekly Progress (`WeekDayCircles` component)
```typescript
// Currently shows static circles based on current day
const getCircleStyle = (index: number) => {
  if (index === currentDayIndex) return 'bg-primary';
  if (index < currentDayIndex) return 'bg-muted';
  return 'bg-muted/50';
};
```
- **Status**: Shows current day only, no actual progress data
- **Real Source Needed**: `GET /api/v1/users/me/weekly-progress`
- **Expected Response**:
  ```typescript
  {
    monday: { goalMet: true, minutes: 25 },
    tuesday: { goalMet: false, minutes: 10 },
    // ... rest of week
  }
  ```

#### 1.4 Offline Content Section (`lines 148-153`)
```typescript
<OfflineContentSection
  wifiOnly={wifiOnly}
  onWifiOnlyChange={saveWifiOnlySetting}
  downloadedItemsCount={0}              // Mock
  storageUsed="0.0% of 256.0 GB"       // Mock
/>
```
- **Status**: Hardcoded zeros and mock storage string
- **Real Source**: Calculate from device using `expo-file-system`
- **Implementation**:
  - Scan `FileSystem.documentDirectory` for `.mp3` files
  - Calculate total size
  - Get device storage using `FileSystem.getTotalDiskCapacityAsync()` and `getFreeDiskStorageAsync()`

#### 1.5 Theme (`line 27`)
```typescript
const [theme, setTheme] = useState<"midnight" | "charcoal">("midnight");
```
- **Status**: Saved to AsyncStorage, works partially
- **Issue**: ThemeProvider only updates CSS variables on `Platform.OS === 'web'` (line 25 in ThemeProvider.tsx)
- **Real Source**: Should be part of user preferences in backend
  - `preferences` JSONB column exists in `User` entity
  - Can store `{ theme: "midnight", notifications: true, ... }`

---

## ⚙️ 2. Real Data Integration Plan

### 2.1 Backend API Implementation Required

#### Priority 1: User Profile & Preferences
- [ ] **Endpoint**: `GET /api/v1/users/me`
  - **Status**: ✅ Already exists (UserController.java line 53-67)
  - **Response**: Returns `UserDto` with email, displayName, profileImageUrl
  - **Action**: Add preferences field to response

- [ ] **Endpoint**: `PUT /api/v1/users/me/preferences`
  - **Status**: ❌ Missing
  - **Purpose**: Update user preferences (theme, notifications, etc.)
  - **Request Body**:
    ```json
    {
      "theme": "midnight",
      "dailyGoalMinutes": 30,
      "notifications": {
        "enabled": true,
        "reminderTime": "18:00"
      }
    }
    ```

#### Priority 2: Listening Statistics & Streaks
- [ ] **Endpoint**: `GET /api/v1/stats/daily-summary`
  - **Status**: ❌ Missing
  - **Purpose**: Get today's listening progress
  - **Response**:
    ```json
    {
      "todayMinutes": 15,
      "dailyGoalMinutes": 30,
      "goalMet": false,
      "date": "2025-10-08"
    }
    ```
  - **Backend Work**:
    - Create `StatsController.java`
    - Create `StatsService.java`
    - Query `listening_stats` table with `date = CURRENT_DATE`

- [ ] **Endpoint**: `GET /api/v1/stats/streaks`
  - **Status**: ❌ Missing
  - **Purpose**: Calculate current streak and best streak
  - **Response**:
    ```json
    {
      "currentStreak": 5,
      "bestStreak": 12,
      "lastActiveDate": "2025-10-08"
    }
    ```
  - **Backend Work**:
    - Complex query: Find consecutive days where `total_play_time >= dailyGoalMinutes`
    - Streak breaks if user misses a day
    - Best streak is MAX(consecutive days) across all time

- [ ] **Endpoint**: `GET /api/v1/stats/weekly-progress`
  - **Status**: ❌ Missing
  - **Purpose**: Get last 7 days of progress for WeekDayCircles
  - **Response**:
    ```json
    {
      "2025-10-02": { "goalMet": true, "minutes": 35 },
      "2025-10-03": { "goalMet": false, "minutes": 15 },
      "2025-10-04": { "goalMet": true, "minutes": 40 },
      "2025-10-05": { "goalMet": true, "minutes": 28 },
      "2025-10-06": { "goalMet": false, "minutes": 0 },
      "2025-10-07": { "goalMet": true, "minutes": 45 },
      "2025-10-08": { "goalMet": false, "minutes": 12 }
    }
    ```

#### Priority 3: Listening Stats Tracking
- [ ] **Endpoint**: `POST /api/v1/stats/track`
  - **Status**: ❌ Missing
  - **Purpose**: Track listening activity (called by player)
  - **Request Body**:
    ```json
    {
      "lectureId": 90,
      "playTimeSeconds": 300
    }
    ```
  - **Backend Work**:
    - Upsert `listening_stats` table
    - If record for (user_id, lecture_id, date) exists, add to `total_play_time`
    - Increment `play_count`
    - Update `completion_rate` based on lecture duration

### 2.2 Frontend Hook Implementation

#### Create User Preferences Hook
**File**: `client/src/queries/hooks/user.ts` (new file)

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";

export function useUserPreferences() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["user", "preferences"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/users/me");
      return response.data.preferences;
    },
    enabled: !!user,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences) => {
      return await apiClient.put("/api/v1/users/me/preferences", preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", "preferences"]);
    },
  });
}
```

#### Create Stats Hooks
**File**: `client/src/queries/hooks/stats.ts` (new file)

```typescript
export function useDailySummary() {
  return useQuery({
    queryKey: ["stats", "daily-summary"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/stats/daily-summary");
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useStreaks() {
  return useQuery({
    queryKey: ["stats", "streaks"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/stats/streaks");
      return response.data;
    },
  });
}

export function useWeeklyProgress() {
  return useQuery({
    queryKey: ["stats", "weekly-progress"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/stats/weekly-progress");
      return response.data;
    },
  });
}

export function useTrackListening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lectureId, playTimeSeconds }) => {
      return await apiClient.post("/api/v1/stats/track", {
        lectureId,
        playTimeSeconds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stats"]);
    },
  });
}
```

#### Integrate Stats Tracking in Player
**File**: `client/src/providers/PlayerProvider.tsx`

```typescript
// Add tracking interval
const statsTrackingInterval = useRef<NodeJS.Timeout | null>(null);
const trackListeningMutation = useTrackListening();

// Track listening stats every 30 seconds while playing
useEffect(() => {
  if (!lecture || !player || !playerStatus.playing) {
    if (statsTrackingInterval.current) {
      clearInterval(statsTrackingInterval.current);
      statsTrackingInterval.current = null;
    }
    return;
  }

  // Track stats every 30 seconds
  statsTrackingInterval.current = setInterval(() => {
    if (playerStatus?.playing && playerStatus.currentTime > 0) {
      trackListeningMutation.mutate({
        lectureId: lecture.id,
        playTimeSeconds: 30, // 30 seconds elapsed since last track
      });
    }
  }, 30000);

  return () => {
    if (statsTrackingInterval.current) {
      clearInterval(statsTrackingInterval.current);
      statsTrackingInterval.current = null;
    }
  };
}, [lecture?.id, playerStatus.playing]);
```

### 2.3 Offline Content Calculation

**File**: `client/src/hooks/useOfflineStorage.ts` (new file)

```typescript
import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";

export function useOfflineStorage() {
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState("0.0 MB");
  const [storagePercentage, setStoragePercentage] = useState("0.0%");
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = async () => {
    try {
      setIsCalculating(true);

      // Get all MP3 files in document directory
      const dir = FileSystem.documentDirectory;
      if (!dir) return;

      const files = await FileSystem.readDirectoryAsync(dir);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));
      setDownloadedCount(mp3Files.length);

      // Calculate total size
      let totalBytes = 0;
      for (const file of mp3Files) {
        const info = await FileSystem.getInfoAsync(`${dir}${file}`);
        if (info.exists && 'size' in info) {
          totalBytes += info.size;
        }
      }

      // Get device storage
      const totalDisk = await FileSystem.getTotalDiskCapacityAsync() ?? 0;
      const freeDisk = await FileSystem.getFreeDiskStorageAsync() ?? 0;

      // Format sizes
      const usedGB = (totalBytes / (1024 ** 3)).toFixed(2);
      const totalGB = (totalDisk / (1024 ** 3)).toFixed(1);
      const percentage = ((totalBytes / totalDisk) * 100).toFixed(2);

      setStorageUsed(`${usedGB} GB`);
      setStoragePercentage(`${percentage}% of ${totalGB} GB`);
    } catch (error) {
      console.error("Failed to calculate storage:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    downloadedCount,
    storageUsed,
    storagePercentage,
    isCalculating,
    refreshStorage: calculateStorage,
  };
}
```

---

## 🎨 3. UI/UX and Theme Improvements

### 3.1 Fix Theme Switching on React Native

**Problem**: `ThemeProvider.tsx` only applies theme on web platform (line 25)

**Root Cause**:
```typescript
useEffect(() => {
  if (Platform.OS === 'web') {
    // Only web gets theme updates!
    const root = document.documentElement;
    root.classList.add(theme);
    // ...
  }
}, [theme]);
```

**Solution**: Use NativeWind's `useColorScheme` and class-based theming

**File**: `client/src/providers/ThemeProvider.tsx`

```typescript
import { useColorScheme } from "nativewind";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme,
  onThemeChange,
}) => {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    // Apply theme to NativeWind (works on all platforms)
    setColorScheme(theme);

    // Also apply to web if needed
    if (Platform.OS === 'web') {
      const root = document.documentElement;
      root.classList.remove('midnight', 'charcoal');
      root.classList.add(theme);

      // Update CSS variables...
    }
  }, [theme, setColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: onThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Additional Work**: Update `tailwind.config.js` to define theme variants

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          background: "hsl(222, 84%, 5%)",
          foreground: "hsl(210, 40%, 98%)",
          primary: "hsl(263, 70%, 50%)",
          // ...
        },
        charcoal: {
          background: "hsl(220, 13%, 13%)",
          foreground: "hsl(220, 13%, 91%)",
          primary: "hsl(24, 95%, 53%)",
          // ...
        },
      },
    },
  },
  plugins: [],
};
```

### 3.2 UI/UX Improvements

#### Improve Account Section
- [ ] Add user avatar/profile image from Clerk
- [ ] Display full name if available
- [ ] Show account creation date ("Member since Oct 2025")
- [ ] Add verification badge if email verified

**Updated Component**:
```typescript
export const AccountSection: React.FC<AccountSectionProps> = ({
  email,
  displayName,
  profileImageUrl,
  createdAt
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} className="w-10 h-10 rounded-full" />
          ) : (
            <AntDesign name="user" size={20} color="#a855f7" />
          )}
          <Text className="text-xl font-semibold text-card-foreground">Account</Text>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View className="gap-4">
          {displayName && (
            <View>
              <Text className="text-sm font-medium text-muted-foreground">Name</Text>
              <Text className="text-base text-foreground mt-1">{displayName}</Text>
            </View>
          )}
          <View>
            <Text className="text-sm font-medium text-muted-foreground">Email</Text>
            <Text className="text-base text-foreground mt-1">{email}</Text>
          </View>
          {createdAt && (
            <View>
              <Text className="text-xs text-muted-foreground">
                Member since {new Date(createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );
};
```

#### Improve WeekDayCircles with Real Data
- [ ] Show checkmark icon when goal met
- [ ] Show actual minutes listened on long press
- [ ] Animate transitions between states
- [ ] Different colors for partial progress (e.g., 50% of goal)

**Updated Component**:
```typescript
export const WeekDayCircles: React.FC<{ weeklyData: WeeklyProgress }> = ({ weeklyData }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getCircleStyle = (dayData: DayProgress) => {
    if (dayData.goalMet) {
      return 'bg-primary border-primary';
    } else if (dayData.minutes > 0) {
      const percentage = (dayData.minutes / dailyGoal) * 100;
      if (percentage >= 50) return 'bg-primary/60 border-primary/60';
      return 'bg-primary/30 border-primary/30';
    }
    return 'bg-muted border-muted';
  };

  return (
    <View className="flex-row justify-center gap-3 py-2">
      {days.map((day, index) => {
        const dayData = weeklyData[index];
        return (
          <TouchableOpacity
            key={index}
            onLongPress={() => showMinutesTooltip(dayData.minutes)}
            className={`
              w-12 h-12 rounded-full border-2 flex items-center justify-center
              ${getCircleStyle(dayData)}
            `}
          >
            {dayData.goalMet ? (
              <Feather name="check" size={16} color="#fff" />
            ) : (
              <Text className={`text-xs font-semibold ${getTextStyle(dayData)}`}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
```

#### Loading & Error States
- [ ] Add skeleton loaders for all sections while data loads
- [ ] Show error messages with retry button
- [ ] Handle offline mode gracefully

```typescript
if (isLoading) {
  return (
    <View className="flex-1 bg-background">
      <ProfileSkeleton />
    </View>
  );
}

if (error) {
  return (
    <View className="flex-1 bg-background items-center justify-center p-4">
      <Feather name="alert-circle" size={48} color="#ef4444" />
      <Text className="text-foreground text-lg mt-4">Failed to load profile</Text>
      <Text className="text-muted-foreground text-center mt-2">
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={refetch}
        className="mt-6 bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-primary-foreground font-medium">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🛠️ 4. Feature Reorganization (Settings Screen)

### 4.1 What Should Stay in Profile

**Profile Screen = "Who I Am & My Progress"**
- ✅ Account Information (email, name, avatar)
- ✅ Daily Goals & Progress (circular progress, streaks)
- ✅ Weekly Progress (WeekDayCircles)
- ✅ Quick Stats (total listening time, total lectures completed)

### 4.2 What Should Move to Settings

**Settings Screen = "How the App Works"**
- 🔧 Appearance (theme selection)
- 🔧 Offline Content (wifi-only toggle, download quality)
- 🔧 Download Management (view downloads, clear all)
- 🔧 Notifications (enable/disable, reminder times)
- 🔧 Playback Settings (speed, sleep timer defaults)
- 🔧 Privacy & Data (data usage, analytics)
- 🔧 Account Actions (sign out, delete account)

### 4.3 Add Settings Icon to Profile Header

**File**: `client/src/app/(protected)/(tabs)/profile.tsx`

```typescript
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Profile() {
  return (
    <ScrollView className="flex-1 bg-background">
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
            onPress={() => router.push("/settings")}
            className="w-10 h-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <Feather name="settings" size={20} color="#a855f7" />
          </TouchableOpacity>
        </View>

        {/* Account Section - Enhanced */}
        <AccountSection
          email={user?.primaryEmailAddress?.emailAddress ?? ""}
          displayName={user?.fullName ?? undefined}
          profileImageUrl={user?.imageUrl ?? undefined}
          createdAt={user?.createdAt}
        />

        {/* Daily Goals - Real Data */}
        <DailyGoalsSection
          dailyGoals={dailyStatsData}
          todayProgress={todayProgressData}
          weeklyProgress={weeklyProgressData}
          isGoalMet={() => todayProgressData.goalMet}
          onOpenGoalModal={() => setIsGoalModalOpen(true)}
        />

        {/* Quick Stats Section - NEW */}
        <QuickStatsSection stats={userStats} />
      </View>
    </ScrollView>
  );
}
```

### 4.4 Create Settings Screen

**File**: `client/src/app/(protected)/settings.tsx` (new file)

```typescript
import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";

// Components
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { OfflineContentSection } from "@/components/settings/OfflineContentSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { PlaybackSection } from "@/components/settings/PlaybackSection";
import { AccountActionsSection } from "@/components/settings/AccountActionsSection";

export default function Settings() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerBackTitle: "Profile",
        }}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="pb-6 px-4">
          {/* Appearance */}
          <View className="mb-6 mt-4">
            <AppearanceSection />
          </View>

          {/* Notifications */}
          <View className="mb-6">
            <NotificationsSection />
          </View>

          {/* Playback */}
          <View className="mb-6">
            <PlaybackSection />
          </View>

          {/* Offline Content */}
          <View className="mb-6">
            <OfflineContentSection />
          </View>

          {/* Account Actions */}
          <View className="mb-6">
            <AccountActionsSection onSignOut={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
```

### 4.5 Update Navigation Structure

**File**: `client/src/app/(protected)/_layout.tsx`

```typescript
export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{ headerShown: false, animation: "fade_from_bottom" }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: "Settings",
          animation: "slide_from_right"
        }}
      />
    </Stack>
  );
}
```

---

## 📱 5. Notifications & Engagement Ideas

### 5.1 Daily Goal Reminder Notification

**Trigger**: User hasn't listened for 12+ hours AND daily goal not met

**Implementation**:
- Use `expo-notifications` package
- Schedule daily check at user-configured time (e.g., 6 PM)
- Cancel if goal already met

**File**: `client/src/hooks/useGoalReminders.ts` (new file)

```typescript
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useDailySummary } from "@/queries/hooks/stats";

export function useGoalReminders() {
  const { data: dailySummary } = useDailySummary();

  useEffect(() => {
    if (!dailySummary) return;

    const scheduleReminder = async () => {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Don't remind if goal already met
      if (dailySummary.goalMet) return;

      // Schedule for 6 PM today if not passed, otherwise tomorrow
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(18, 0, 0, 0);

      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 Keep your streak going!",
          body: `You need ${dailySummary.dailyGoalMinutes - dailySummary.todayMinutes} more minutes to reach your daily goal.`,
          sound: true,
        },
        trigger: {
          date: reminderTime,
        },
      });
    };

    scheduleReminder();
  }, [dailySummary]);
}
```

**Integration**: Call `useGoalReminders()` in root `_layout.tsx`

### 5.2 Streak Loss Warning

**Trigger**: User is at risk of losing their streak (midnight approaching, goal not met)

**Implementation**:
- Check if current time is after 8 PM and goal not met
- Only show if current streak > 3 days (meaningful streak)
- Show as in-app banner + push notification

```typescript
export function useStreakWarning() {
  const { data: streaks } = useStreaks();
  const { data: dailySummary } = useDailySummary();

  useEffect(() => {
    if (!streaks || !dailySummary) return;

    const now = new Date();
    const hour = now.getHours();

    // Check at 8 PM and 10 PM
    if ((hour === 20 || hour === 22) && !dailySummary.goalMet && streaks.currentStreak > 3) {
      showStreakWarningNotification(streaks.currentStreak, dailySummary.remainingMinutes);
    }
  }, [streaks, dailySummary]);
}
```

### 5.3 Milestone Celebrations

**Trigger**: User achieves milestone (7-day streak, 30-day streak, 100 hours total)

**Implementation**:
- Show confetti animation
- Award virtual badge
- Share-worthy social card

```typescript
export function useMilestoneCelebrations() {
  const { data: streaks } = useStreaks();

  useEffect(() => {
    if (!streaks) return;

    // Check for milestone
    const milestones = [7, 14, 30, 60, 100, 365];
    if (milestones.includes(streaks.currentStreak)) {
      showCelebrationModal({
        type: "streak",
        value: streaks.currentStreak,
        message: `🎉 ${streaks.currentStreak}-day streak! You're on fire!`,
      });
    }
  }, [streaks?.currentStreak]);
}
```

---

## ✅ 6. Implementation Milestones

### Phase 1: Backend Foundation (Week 1)
- [ ] **Day 1-2**: Create `StatsController` and `StatsService`
  - [ ] Implement `GET /api/v1/stats/daily-summary`
  - [ ] Implement `GET /api/v1/stats/streaks`
  - [ ] Implement `GET /api/v1/stats/weekly-progress`
  - [ ] Write unit tests for streak calculation logic

- [ ] **Day 3-4**: Implement stats tracking
  - [ ] Create `POST /api/v1/stats/track` endpoint
  - [ ] Integrate with existing `ListeningStats` entity
  - [ ] Add database indexes for performance
  - [ ] Test with sample data

- [ ] **Day 5**: User preferences endpoint
  - [ ] Create `PUT /api/v1/users/me/preferences`
  - [ ] Update `UserDto` to include preferences
  - [ ] Test theme persistence

### Phase 2: Frontend Data Integration (Week 2)
- [ ] **Day 1**: Create hooks and API clients
  - [ ] Create `client/src/queries/hooks/stats.ts`
  - [ ] Create `client/src/queries/hooks/user.ts`
  - [ ] Create `client/src/api/endpoints/stats.ts`
  - [ ] Create `client/src/api/endpoints/user.ts`

- [ ] **Day 2**: Integrate real data into Profile
  - [ ] Replace mock email with Clerk `useUser()` data
  - [ ] Connect `DailyGoalsSection` to `useDailySummary()` hook
  - [ ] Connect `AccountSection` to `useUser()` hook
  - [ ] Add loading and error states

- [ ] **Day 3**: Implement offline storage calculation
  - [ ] Create `useOfflineStorage` hook
  - [ ] Scan FileSystem for downloaded files
  - [ ] Calculate storage usage
  - [ ] Update `OfflineContentSection`

- [ ] **Day 4**: Integrate stats tracking in player
  - [ ] Add `useTrackListening` mutation to `PlayerProvider`
  - [ ] Track stats every 30 seconds while playing
  - [ ] Test accuracy of tracking

- [ ] **Day 5**: Fix theme switching
  - [ ] Update `ThemeProvider` to work on React Native
  - [ ] Test theme changes on iOS and Android
  - [ ] Persist theme to backend preferences

### Phase 3: UI/UX Improvements (Week 3)
- [ ] **Day 1-2**: Enhance components
  - [ ] Update `AccountSection` with avatar and member since
  - [ ] Update `WeekDayCircles` with real data and interactions
  - [ ] Add skeleton loaders for all sections
  - [ ] Implement error boundaries

- [ ] **Day 3**: Create Settings screen
  - [ ] Create `settings.tsx` route
  - [ ] Move appearance settings
  - [ ] Move offline content settings
  - [ ] Add settings icon to Profile header

- [ ] **Day 4**: Move remaining settings
  - [ ] Create `NotificationsSection` component
  - [ ] Create `PlaybackSection` component
  - [ ] Update navigation structure
  - [ ] Test navigation flow

- [ ] **Day 5**: Polish and testing
  - [ ] Add animations and transitions
  - [ ] Test on multiple devices
  - [ ] Fix any UI bugs
  - [ ] Conduct UX review

### Phase 4: Notifications & Engagement (Week 4)
- [ ] **Day 1-2**: Setup notifications infrastructure
  - [ ] Configure `expo-notifications`
  - [ ] Request permissions
  - [ ] Create `useGoalReminders` hook
  - [ ] Test notification scheduling

- [ ] **Day 3**: Implement streak warnings
  - [ ] Create `useStreakWarning` hook
  - [ ] Design in-app banner component
  - [ ] Test timing logic

- [ ] **Day 4**: Milestone celebrations
  - [ ] Create celebration modal
  - [ ] Add confetti animation
  - [ ] Implement badge system
  - [ ] Test milestone detection

- [ ] **Day 5**: Final testing and deployment
  - [ ] End-to-end testing
  - [ ] Performance optimization
  - [ ] Documentation
  - [ ] Deploy to staging

---

## 📊 Success Metrics

### User Engagement
- [ ] Track daily active users before/after
- [ ] Monitor goal completion rate
- [ ] Measure average streak length
- [ ] Track notification open rate

### Technical Health
- [ ] API response times < 200ms (p95)
- [ ] Zero data inconsistencies between client/server
- [ ] Theme switches work 100% of time on all platforms
- [ ] Offline storage calculation completes in < 1s

### User Experience
- [ ] Profile load time < 1s
- [ ] No visible layout shifts during load
- [ ] Error rate < 1% on production
- [ ] User satisfaction rating > 4.5/5

---

## 🚨 Risks & Mitigations

### Risk 1: Streak Calculation Complexity
**Risk**: Streak logic might be incorrect (timezones, missed days)
**Mitigation**:
- Use user's local timezone for date boundaries
- Write comprehensive unit tests with edge cases
- Add manual streak adjustment for admins

### Risk 2: Performance with Large Stats Data
**Risk**: Users with years of data might slow down queries
**Mitigation**:
- Add database indexes on `(user_id, date)` columns
- Implement pagination for historical data
- Cache frequently accessed stats (Redis)
- Archive old data after 1 year

### Risk 3: Theme Switch Breaking Existing UI
**Risk**: Changing theme system might break existing screens
**Mitigation**:
- Test on all major screens before deployment
- Keep fallback to default theme if errors occur
- Gradual rollout (10% → 50% → 100% of users)

### Risk 4: Notification Fatigue
**Risk**: Too many notifications could annoy users
**Mitigation**:
- Make notifications opt-in
- Limit to max 1 notification per day
- Allow users to customize reminder times
- Track opt-out rate and adjust

---

## 📝 Notes

### Dependencies to Add
```bash
npm install expo-notifications
npm install expo-file-system  # Already exists
```

### Database Migrations Required
```sql
-- Add index for faster streak queries
CREATE INDEX idx_listening_stats_user_date ON listening_stats(user_id, date DESC);

-- Add index for stats tracking upsert
CREATE UNIQUE INDEX idx_listening_stats_user_lecture_date
  ON listening_stats(user_id, lecture_id, date);
```

### Backend DTO Updates
```java
// UserDto.java - Add preferences field
public record UserDto(
    Long id,
    String clerkId,
    String email,
    String displayName,
    String profileImageUrl,
    boolean isPremium,
    Map<String, Object> preferences,  // NEW
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getClerkId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getProfileImageUrl(),
            user.isPremium(),
            parsePreferences(user.getPreferences()),  // NEW
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
```

---

## 🎯 Acceptance Criteria

### Profile Screen
- [ ] Email, name, and avatar loaded from Clerk
- [ ] Daily goal shows real progress from backend
- [ ] Streaks calculate correctly
- [ ] Weekly circles show actual listening data
- [ ] Offline storage shows real downloaded files
- [ ] Theme changes instantly apply to all screens
- [ ] Settings icon navigates to Settings screen
- [ ] Loading states show skeleton UI
- [ ] Errors display with retry option

### Settings Screen
- [ ] All settings features moved from Profile
- [ ] Theme selection works on iOS, Android, Web
- [ ] Preferences save to backend
- [ ] Navigation back to Profile works
- [ ] Sign out clears session and redirects to login

### Notifications
- [ ] Daily goal reminder sends at configured time
- [ ] Streak warning shows when at risk
- [ ] Milestone celebrations trigger on achievements
- [ ] Users can disable notifications in settings

### Backend
- [ ] All endpoints return data within 200ms
- [ ] Streak calculation handles edge cases
- [ ] Stats tracking handles concurrent requests
- [ ] Database queries optimized with indexes

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize features** based on business value
3. **Assign tasks** to developers
4. **Set up project board** with milestones
5. **Begin Phase 1** implementation

**Estimated Total Time**: 4 weeks (1 developer, full-time)
**Estimated Effort**: ~80-100 hours

---

---

## 🔧 7. Backend Implementation Checklist

### 7.1 Current Backend State Analysis

#### Existing Infrastructure ✅
- [x] **User Entity** - Complete with preferences JSONB column
- [x] **ListeningStats Entity** - Tracks daily listening per user/lecture/date
- [x] **PlaybackPosition Entity** - Tracks current playback position
- [x] **UserController** - Has `/me` endpoint for user profile
- [x] **UserService** - Handles user sync and profile retrieval
- [x] **UserDto** - Basic user data transfer object
- [x] **UserPreferencesDto** - Comprehensive preferences model (NOT YET USED)

#### Missing Components ❌
- [ ] **ListeningStatsRepository** - No repository for ListeningStats entity
- [ ] **StatsController** - No stats API endpoints
- [ ] **StatsService** - No business logic for stats/streaks
- [ ] **Stats DTOs** - No DTOs for daily summary, streaks, weekly progress
- [ ] **User Preferences API** - No endpoint to update preferences
- [ ] **Stats Tracking API** - No endpoint to track listening activity

### 7.2 Database Schema - Already Exists ✅

The database schema is already complete with the following tables:

#### `listening_stats` Table
```sql
CREATE TABLE listening_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    lecture_id BIGINT NOT NULL REFERENCES lectures(id),
    date DATE NOT NULL,
    total_play_time INTEGER DEFAULT 0,        -- in seconds
    play_count INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, lecture_id, date)
);
```

#### `users` Table (Relevant Columns)
```sql
CREATE TABLE users (
    -- ...existing columns
    preferences JSONB,  -- ✅ Already exists for storing user preferences
    -- ...
);
```

**Status**: ✅ Schema complete, just need to add indexes for performance

### 7.3 Backend Implementation Tasks

#### Task 1: Create ListeningStatsRepository
**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/repository/ListeningStatsRepository.java`

```java
package com.audibleclone.backend.repository;

import com.audibleclone.backend.entity.ListeningStats;
import com.audibleclone.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ListeningStatsRepository extends JpaRepository<ListeningStats, Long> {

    /**
     * Find stats for a specific user, lecture, and date
     * Used for upsert operations when tracking listening
     */
    Optional<ListeningStats> findByUserAndLectureIdAndDate(
        User user,
        Long lectureId,
        LocalDate date
    );

    /**
     * Find today's stats for a specific user
     * Used for daily summary
     */
    @Query("SELECT ls FROM ListeningStats ls WHERE ls.user = :user AND ls.date = :date")
    List<ListeningStats> findByUserAndDate(
        @Param("user") User user,
        @Param("date") LocalDate date
    );

    /**
     * Find stats for a date range
     * Used for weekly progress (last 7 days)
     */
    @Query("SELECT ls FROM ListeningStats ls " +
           "WHERE ls.user = :user " +
           "AND ls.date BETWEEN :startDate AND :endDate " +
           "ORDER BY ls.date ASC")
    List<ListeningStats> findByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Find all dates where user met their daily goal
     * Used for streak calculation
     * Assumes daily goal is stored in user preferences
     */
    @Query("SELECT ls.date FROM ListeningStats ls " +
           "WHERE ls.user = :user " +
           "AND ls.totalPlayTime >= :dailyGoalSeconds " +
           "ORDER BY ls.date DESC")
    List<LocalDate> findDatesWhereGoalMet(
        @Param("user") User user,
        @Param("dailyGoalSeconds") Integer dailyGoalSeconds
    );

    /**
     * Get total listening time for a user (all time)
     * Used for profile statistics
     */
    @Query("SELECT COALESCE(SUM(ls.totalPlayTime), 0) FROM ListeningStats ls WHERE ls.user = :user")
    Long getTotalListeningTime(@Param("user") User user);
}
```

**Checklist**:
- [ ] Create `ListeningStatsRepository.java` with above methods
- [ ] Add unit tests for repository queries
- [ ] Verify queries work with sample data

---

#### Task 2: Create Stats DTOs
**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/dto/DailySummaryDto.java`

```java
package com.audibleclone.backend.dto;

import java.time.LocalDate;

/**
 * Daily listening summary for a specific date
 */
public record DailySummaryDto(
    LocalDate date,
    Integer todayMinutes,           // Total minutes listened today
    Integer dailyGoalMinutes,       // User's daily goal
    Boolean goalMet,                // Whether goal was met
    Integer remainingMinutes        // Minutes remaining to meet goal
) {
    public static DailySummaryDto create(
        LocalDate date,
        Integer totalSeconds,
        Integer dailyGoalMinutes
    ) {
        int todayMinutes = totalSeconds / 60;
        boolean goalMet = todayMinutes >= dailyGoalMinutes;
        int remainingMinutes = Math.max(0, dailyGoalMinutes - todayMinutes);

        return new DailySummaryDto(
            date,
            todayMinutes,
            dailyGoalMinutes,
            goalMet,
            remainingMinutes
        );
    }
}
```

**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/dto/StreakDto.java`

```java
package com.audibleclone.backend.dto;

import java.time.LocalDate;

/**
 * User's streak information
 */
public record StreakDto(
    Integer currentStreak,          // Current consecutive days
    Integer bestStreak,             // Longest streak ever
    LocalDate lastActiveDate        // Last date user met goal
) {}
```

**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/dto/WeeklyProgressDto.java`

```java
package com.audibleclone.backend.dto;

import java.time.LocalDate;
import java.util.Map;

/**
 * Weekly progress (last 7 days)
 * Key: date, Value: day progress
 */
public record WeeklyProgressDto(
    Map<LocalDate, DayProgressDto> days
) {}

/**
 * Progress for a single day
 */
public record DayProgressDto(
    Integer minutes,
    Boolean goalMet
) {}
```

**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/dto/TrackListeningDto.java`

```java
package com.audibleclone.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request to track listening activity
 */
public record TrackListeningDto(
    @NotNull Long lectureId,
    @NotNull @Positive Integer playTimeSeconds
) {}
```

**Checklist**:
- [ ] Create `DailySummaryDto.java`
- [ ] Create `StreakDto.java`
- [ ] Create `WeeklyProgressDto.java` and `DayProgressDto.java`
- [ ] Create `TrackListeningDto.java`

---

#### Task 3: Create StatsService
**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/service/StatsService.java`

```java
package com.audibleclone.backend.service;

import com.audibleclone.backend.dto.*;
import com.audibleclone.backend.entity.ListeningStats;
import com.audibleclone.backend.entity.Lecture;
import com.audibleclone.backend.entity.User;
import com.audibleclone.backend.repository.ListeningStatsRepository;
import com.audibleclone.backend.repository.LectureRepository;
import com.audibleclone.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private final ListeningStatsRepository listeningStatsRepository;
    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get daily summary for authenticated user
     */
    @Transactional(readOnly = true)
    public DailySummaryDto getDailySummary(String clerkId) {
        User user = getUserByClerkId(clerkId);
        LocalDate today = LocalDate.now();

        // Get user's daily goal from preferences
        int dailyGoalMinutes = getDailyGoalFromPreferences(user);

        // Sum up all listening stats for today
        List<ListeningStats> todayStats = listeningStatsRepository.findByUserAndDate(user, today);
        int totalSecondsToday = todayStats.stream()
            .mapToInt(ListeningStats::getTotalPlayTime)
            .sum();

        return DailySummaryDto.create(today, totalSecondsToday, dailyGoalMinutes);
    }

    /**
     * Get user's current and best streaks
     */
    @Transactional(readOnly = true)
    public StreakDto getStreaks(String clerkId) {
        User user = getUserByClerkId(clerkId);
        int dailyGoalMinutes = getDailyGoalFromPreferences(user);
        int dailyGoalSeconds = dailyGoalMinutes * 60;

        // Get all dates where user met goal (ordered DESC)
        List<LocalDate> goalMetDates = listeningStatsRepository
            .findDatesWhereGoalMet(user, dailyGoalSeconds);

        if (goalMetDates.isEmpty()) {
            return new StreakDto(0, 0, null);
        }

        // Calculate current streak (working backwards from today)
        int currentStreak = calculateCurrentStreak(goalMetDates);

        // Calculate best streak (longest consecutive sequence)
        int bestStreak = calculateBestStreak(goalMetDates);

        LocalDate lastActive = goalMetDates.get(0); // First element is most recent

        return new StreakDto(currentStreak, bestStreak, lastActive);
    }

    /**
     * Get weekly progress (last 7 days)
     */
    @Transactional(readOnly = true)
    public WeeklyProgressDto getWeeklyProgress(String clerkId) {
        User user = getUserByClerkId(clerkId);
        int dailyGoalMinutes = getDailyGoalFromPreferences(user);

        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6); // Last 7 days including today

        List<ListeningStats> weekStats = listeningStatsRepository
            .findByUserAndDateRange(user, weekAgo, today);

        // Group by date and sum play time
        Map<LocalDate, Integer> dailyTotals = weekStats.stream()
            .collect(Collectors.groupingBy(
                ListeningStats::getDate,
                Collectors.summingInt(ListeningStats::getTotalPlayTime)
            ));

        // Create map for all 7 days (fill missing days with 0)
        Map<LocalDate, DayProgressDto> weekMap = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = weekAgo.plusDays(i);
            int totalSeconds = dailyTotals.getOrDefault(date, 0);
            int minutes = totalSeconds / 60;
            boolean goalMet = minutes >= dailyGoalMinutes;

            weekMap.put(date, new DayProgressDto(minutes, goalMet));
        }

        return new WeeklyProgressDto(weekMap);
    }

    /**
     * Track listening activity (upsert)
     */
    @Transactional
    public void trackListening(String clerkId, TrackListeningDto trackDto) {
        User user = getUserByClerkId(clerkId);
        Lecture lecture = lectureRepository.findById(trackDto.lectureId())
            .orElseThrow(() -> new RuntimeException("Lecture not found: " + trackDto.lectureId()));

        LocalDate today = LocalDate.now();

        // Find existing or create new
        ListeningStats stats = listeningStatsRepository
            .findByUserAndLectureIdAndDate(user, lecture.getId(), today)
            .orElseGet(() -> {
                ListeningStats newStats = new ListeningStats();
                newStats.setUser(user);
                newStats.setLecture(lecture);
                newStats.setDate(today);
                newStats.setTotalPlayTime(0);
                newStats.setPlayCount(0);
                return newStats;
            });

        // Update stats
        stats.setTotalPlayTime(stats.getTotalPlayTime() + trackDto.playTimeSeconds());
        stats.setPlayCount(stats.getPlayCount() + 1);

        // Calculate completion rate
        if (lecture.getDuration() > 0) {
            float completionRate = (float) stats.getTotalPlayTime() / lecture.getDuration() * 100f;
            stats.setCompletionRate(Math.min(completionRate, 100f));
        }

        listeningStatsRepository.save(stats);
        log.debug("Tracked {} seconds for lecture {} on {}",
            trackDto.playTimeSeconds(), lecture.getId(), today);
    }

    // Helper methods

    private User getUserByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
            .orElseThrow(() -> new RuntimeException("User not found: " + clerkId));
    }

    private int getDailyGoalFromPreferences(User user) {
        try {
            if (user.getPreferences() != null) {
                Map<String, Object> prefs = objectMapper.readValue(
                    user.getPreferences(),
                    Map.class
                );
                Object goal = prefs.get("dailyGoalMinutes");
                if (goal != null) {
                    return ((Number) goal).intValue();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse preferences for user {}", user.getClerkId(), e);
        }
        return 30; // Default 30 minutes
    }

    private int calculateCurrentStreak(List<LocalDate> goalMetDates) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // Streak is broken if user didn't meet goal today or yesterday
        if (!goalMetDates.contains(today) && !goalMetDates.contains(yesterday)) {
            return 0;
        }

        int streak = 0;
        LocalDate currentDate = goalMetDates.contains(today) ? today : yesterday;

        for (LocalDate date : goalMetDates) {
            if (date.equals(currentDate)) {
                streak++;
                currentDate = currentDate.minusDays(1);
            } else if (date.isBefore(currentDate)) {
                // Gap found, streak broken
                break;
            }
        }

        return streak;
    }

    private int calculateBestStreak(List<LocalDate> goalMetDates) {
        if (goalMetDates.isEmpty()) return 0;

        Collections.sort(goalMetDates, Collections.reverseOrder());

        int maxStreak = 1;
        int currentStreakCount = 1;
        LocalDate previousDate = goalMetDates.get(0);

        for (int i = 1; i < goalMetDates.size(); i++) {
            LocalDate currentDate = goalMetDates.get(i);

            if (previousDate.minusDays(1).equals(currentDate)) {
                currentStreakCount++;
                maxStreak = Math.max(maxStreak, currentStreakCount);
            } else {
                currentStreakCount = 1;
            }

            previousDate = currentDate;
        }

        return maxStreak;
    }
}
```

**Checklist**:
- [ ] Create `StatsService.java` with all methods
- [ ] Add unit tests for streak calculation logic
- [ ] Test with edge cases (no data, gaps in data, etc.)
- [ ] Verify performance with large datasets

---

#### Task 4: Create StatsController
**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/controller/StatsController.java`

```java
package com.audibleclone.backend.controller;

import com.audibleclone.backend.dto.*;
import com.audibleclone.backend.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user listening statistics and progress tracking
 */
@RestController
@RequestMapping("/api/v1/stats")
@Tag(name = "Statistics", description = "User listening statistics and progress tracking")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class StatsController {

    private final StatsService statsService;

    /**
     * Get daily listening summary for authenticated user
     * GET /api/v1/stats/daily-summary
     */
    @GetMapping("/daily-summary")
    @Operation(summary = "Get Daily Summary",
               description = "Get today's listening progress and goal status")
    public ResponseEntity<DailySummaryDto> getDailySummary(Authentication authentication) {
        String clerkId = authentication.getName();
        DailySummaryDto summary = statsService.getDailySummary(clerkId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get user's current and best streaks
     * GET /api/v1/stats/streaks
     */
    @GetMapping("/streaks")
    @Operation(summary = "Get Streaks",
               description = "Get current streak and best streak for the authenticated user")
    public ResponseEntity<StreakDto> getStreaks(Authentication authentication) {
        String clerkId = authentication.getName();
        StreakDto streaks = statsService.getStreaks(clerkId);
        return ResponseEntity.ok(streaks);
    }

    /**
     * Get weekly progress (last 7 days)
     * GET /api/v1/stats/weekly-progress
     */
    @GetMapping("/weekly-progress")
    @Operation(summary = "Get Weekly Progress",
               description = "Get listening progress for the last 7 days")
    public ResponseEntity<WeeklyProgressDto> getWeeklyProgress(Authentication authentication) {
        String clerkId = authentication.getName();
        WeeklyProgressDto progress = statsService.getWeeklyProgress(clerkId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Track listening activity
     * POST /api/v1/stats/track
     */
    @PostMapping("/track")
    @Operation(summary = "Track Listening",
               description = "Record listening activity for statistics")
    public ResponseEntity<Void> trackListening(
            Authentication authentication,
            @Valid @RequestBody TrackListeningDto trackDto) {
        String clerkId = authentication.getName();
        statsService.trackListening(clerkId, trackDto);
        return ResponseEntity.ok().build();
    }
}
```

**Checklist**:
- [ ] Create `StatsController.java`
- [ ] Add Swagger documentation
- [ ] Test all endpoints with Postman/curl
- [ ] Verify authentication and authorization

---

#### Task 5: Update UserController for Preferences
**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/controller/UserController.java`

Add this method to existing UserController:

```java
/**
 * Update user preferences
 * PUT /api/v1/users/me/preferences
 */
@PutMapping("/me/preferences")
@Operation(summary = "Update User Preferences",
           description = "Update preferences for the authenticated user")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(responseCode = "200", description = "Preferences updated successfully")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserDto> updatePreferences(
        Authentication authentication,
        @Valid @RequestBody UserPreferencesDto preferencesDto) {
    String clerkId = authentication.getName();
    log.debug("Updating preferences for user: {}", clerkId);

    UserDto updatedUser = userService.updatePreferences(clerkId, preferencesDto);
    return ResponseEntity.ok(updatedUser);
}
```

**File**: `audibleclone-backend/src/main/java/com/audibleclone/backend/service/UserService.java`

Add this method to existing UserService:

```java
import com.fasterxml.jackson.databind.ObjectMapper;

@Autowired
private ObjectMapper objectMapper;

/**
 * Update user preferences
 */
public UserDto updatePreferences(String clerkId, UserPreferencesDto preferencesDto) {
    User user = userRepository.findByClerkId(clerkId)
        .orElseThrow(() -> new RuntimeException("User not found: " + clerkId));

    try {
        // Convert preferences DTO to JSON string
        String preferencesJson = objectMapper.writeValueAsString(preferencesDto);
        user.setPreferences(preferencesJson);

        User savedUser = userRepository.save(user);
        log.info("Updated preferences for user [{}]", clerkId);

        return UserDto.fromEntity(savedUser);
    } catch (Exception e) {
        log.error("Failed to update preferences for user {}", clerkId, e);
        throw new RuntimeException("Failed to update preferences", e);
    }
}
```

Update `UserDto.java` to include preferences:

```java
public record UserDto(
    Long id,
    String clerkId,
    String email,
    String displayName,
    String profileImageUrl,
    boolean isPremium,
    UserPreferencesDto preferences,  // NEW
    OffsetDateTime createdAt
) {
    public static UserDto fromEntity(User user) {
        UserPreferencesDto prefs = null;
        if (user.getPreferences() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                prefs = mapper.readValue(user.getPreferences(), UserPreferencesDto.class);
            } catch (Exception e) {
                // Return null if parsing fails
            }
        }

        return new UserDto(
            user.getId(),
            user.getClerkId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getProfileImageUrl(),
            user.isPremium(),
            prefs,  // NEW
            user.getCreatedAt()
        );
    }
}
```

**Checklist**:
- [ ] Add `updatePreferences()` to UserController
- [ ] Add `updatePreferences()` to UserService
- [ ] Update `UserDto` to include preferences
- [ ] Test preferences update endpoint
- [ ] Verify preferences persist correctly

---

#### Task 6: Add Database Indexes for Performance
**File**: `audibleclone-backend/src/main/resources/db/migration/V9__add_stats_indexes.sql`

```sql
-- V9: Add indexes for listening stats queries
-- Performance optimization for stats and streak calculations

-- Index for finding stats by user and date range (weekly progress)
CREATE INDEX IF NOT EXISTS idx_listening_stats_user_date
    ON listening_stats(user_id, date DESC);

-- Index for finding stats by user, lecture, and date (upsert on track)
CREATE INDEX IF NOT EXISTS idx_listening_stats_user_lecture_date
    ON listening_stats(user_id, lecture_id, date);

-- Index for streak calculations (filter by play time)
CREATE INDEX IF NOT EXISTS idx_listening_stats_user_playtime
    ON listening_stats(user_id, total_play_time DESC);

-- Index for faster user lookup by clerk_id (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id
    ON users(clerk_id);

-- Add comment for documentation
COMMENT ON INDEX idx_listening_stats_user_date IS 'Optimizes weekly progress queries';
COMMENT ON INDEX idx_listening_stats_user_lecture_date IS 'Optimizes listening tracking upserts';
COMMENT ON INDEX idx_listening_stats_user_playtime IS 'Optimizes streak calculation queries';
```

**Checklist**:
- [ ] Create `V9__add_stats_indexes.sql` migration
- [ ] Test migration on dev database
- [ ] Verify query performance improvements
- [ ] Run migration on staging/prod

---

#### Task 7: Integration Testing
**File**: `audibleclone-backend/src/test/java/com/audibleclone/backend/controller/StatsControllerTest.java`

```java
package com.audibleclone.backend.controller;

import com.audibleclone.backend.dto.*;
import com.audibleclone.backend.service.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatsController.class)
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatsService statsService;

    @Test
    @WithMockUser(username = "user_123")
    void testGetDailySummary() throws Exception {
        DailySummaryDto summary = DailySummaryDto.create(LocalDate.now(), 900, 30);
        when(statsService.getDailySummary(anyString())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/stats/daily-summary"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.todayMinutes").value(15))
            .andExpect(jsonPath("$.goalMet").value(false));
    }

    @Test
    @WithMockUser(username = "user_123")
    void testGetStreaks() throws Exception {
        StreakDto streaks = new StreakDto(5, 12, LocalDate.now());
        when(statsService.getStreaks(anyString())).thenReturn(streaks);

        mockMvc.perform(get("/api/v1/stats/streaks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentStreak").value(5))
            .andExpect(jsonPath("$.bestStreak").value(12));
    }

    // Add more tests...
}
```

**Checklist**:
- [ ] Create unit tests for StatsController
- [ ] Create unit tests for StatsService
- [ ] Create integration tests for repository queries
- [ ] Test streak calculation edge cases
- [ ] Achieve >80% code coverage

---

### 7.4 Backend Implementation Summary

#### Files to Create (9 new files)
1. ✅ `ListeningStatsRepository.java` - Repository for stats queries
2. ✅ `DailySummaryDto.java` - Daily progress DTO
3. ✅ `StreakDto.java` - Streak information DTO
4. ✅ `WeeklyProgressDto.java` - Weekly progress DTO
5. ✅ `DayProgressDto.java` - Single day progress DTO
6. ✅ `TrackListeningDto.java` - Track listening request DTO
7. ✅ `StatsService.java` - Stats business logic
8. ✅ `StatsController.java` - Stats REST API
9. ✅ `V9__add_stats_indexes.sql` - Performance indexes

#### Files to Modify (3 existing files)
1. ✅ `UserController.java` - Add preferences endpoint
2. ✅ `UserService.java` - Add preferences update method
3. ✅ `UserDto.java` - Add preferences field

#### Testing Files (3 new test files)
1. ✅ `StatsControllerTest.java`
2. ✅ `StatsServiceTest.java`
3. ✅ `ListeningStatsRepositoryTest.java`

---

### 7.5 Backend Task Checklist

#### Phase 1: Repository & DTOs
- [ ] Create `ListeningStatsRepository.java` with all query methods
- [ ] Create `DailySummaryDto.java`
- [ ] Create `StreakDto.java`
- [ ] Create `WeeklyProgressDto.java` and `DayProgressDto.java`
- [ ] Create `TrackListeningDto.java`
- [ ] Write repository unit tests
- [ ] Verify all queries return expected results

#### Phase 2: Service Layer
- [ ] Create `StatsService.java` with all methods
- [ ] Implement `getDailySummary()` method
- [ ] Implement `getStreaks()` method with streak calculation
- [ ] Implement `getWeeklyProgress()` method
- [ ] Implement `trackListening()` upsert logic
- [ ] Write service unit tests
- [ ] Test streak calculation edge cases:
  - [ ] No data
  - [ ] Single day streak
  - [ ] Gaps in data
  - [ ] Streak continuing from yesterday
  - [ ] Today's data not yet complete

#### Phase 3: Controller & API
- [ ] Create `StatsController.java` with all endpoints
- [ ] Add Swagger documentation for all endpoints
- [ ] Update `UserController.java` with preferences endpoint
- [ ] Update `UserService.java` with preferences logic
- [ ] Update `UserDto.java` to include preferences
- [ ] Test all endpoints with Postman/curl
- [ ] Verify JWT authentication works
- [ ] Test error handling (404, 400, 500)

#### Phase 4: Database & Performance
- [ ] Create `V9__add_stats_indexes.sql` migration
- [ ] Run migration on dev database
- [ ] Test query performance before/after indexes
- [ ] Verify indexes are used (EXPLAIN ANALYZE)
- [ ] Test with large dataset (1000+ records per user)
- [ ] Optimize slow queries if needed

#### Phase 5: Integration Testing
- [ ] Create `StatsControllerTest.java`
- [ ] Create `StatsServiceTest.java`
- [ ] Create `ListeningStatsRepositoryTest.java`
- [ ] Test complete flow: track → query → verify
- [ ] Test concurrent tracking requests
- [ ] Test data consistency
- [ ] Achieve >80% code coverage

#### Phase 6: Documentation & Deployment
- [ ] Update API documentation
- [ ] Add JavaDoc comments to all public methods
- [ ] Update `README.md` with new endpoints
- [ ] Create Postman collection for new APIs
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Monitor logs for errors
- [ ] Deploy to production

---

### 7.6 Backend Implementation Estimates

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Repository & DTOs | 3 hours | High |
| Service Layer | 6 hours | High |
| Controller & API | 3 hours | High |
| Preferences Update | 2 hours | Medium |
| Database Indexes | 1 hour | High |
| Unit Tests | 5 hours | High |
| Integration Tests | 3 hours | Medium |
| Documentation | 2 hours | Low |
| **Total** | **25 hours** | |

**Estimated Completion**: 3-4 working days (1 developer)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-08
**Owner**: Development Team
