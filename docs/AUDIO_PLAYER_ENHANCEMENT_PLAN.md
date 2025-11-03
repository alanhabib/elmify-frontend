# 🎵 Audio Player Enhancement & Lecture Modal Implementation Plan

**Date:** 2025-10-14
**Status:** Planning Phase
**Goal:** Transform the Elmify app into a polished, Spotify-like audio experience

---

## 📊 Current State Analysis

### ✅ **What's Working**
- `PlayerProvider` context with audio playback state management
- Full-screen player modal (`player.tsx`) with basic controls
- Automatic playback position saving (every 5s while playing)
- Resume functionality (restores saved position)
- Favorites integration
- Stats tracking (listening time)
- MinIO streaming with presigned URLs
- Local caching support (`FileSystem.documentDirectory`)

### ❌ **Current Problems**

1. **No Click-to-Play Functionality**
   - Clicking lectures in `BookListItem` only sets `setLecture(lecture)` but doesn't navigate to player
   - No automatic playback starts
   - User must manually navigate to player screen

2. **Non-Reusable Player Modal**
   - Player modal is a full screen route, not a reusable modal component
   - Can't be opened from multiple entry points

3. **Missing Mini-Player**
   - No persistent mini-player at bottom of screen
   - When navigating away from full-screen player, playback context is lost visually
   - No "now playing" bar like Spotify/Apple Podcasts

4. **Limited Player Features**
   - No queue management (next/previous)
   - No playback speed control
   - No repeat/shuffle
   - Skip forward/backward buttons are non-functional
   - No waveform visualization
   - No chapter markers

5. **No Lecture Detail/Info Modal**
   - Clicking on lecture only starts playback
   - No way to view lecture description, speaker bio, or metadata
   - No episode notes or show notes

---

## 🎯 Implementation Plan Overview

### **Phase 1: Foundation - Click-to-Play & Navigation (Priority: HIGH)**
1. Add navigation to player screen when lecture is clicked
2. Auto-start playback when lecture loads
3. Implement smooth transitions

### **Phase 2: Mini-Player Component (Priority: HIGH)**
4. Create persistent mini-player component
5. Integrate with navigation stack
6. Sync state between mini-player and full-screen player

### **Phase 3: Lecture Info Modal (Priority: MEDIUM)**
7. Create reusable lecture detail modal
8. Add lecture metadata display
9. Add action buttons (play, favorite, download, share)

### **Phase 4: Enhanced Player Features (Priority: MEDIUM)**
10. Queue management system
11. Playback speed control
12. Skip forward/backward (15s/30s)
13. Repeat & shuffle modes

### **Phase 5: Advanced Features (Priority: LOW)**
14. Background playback & lock screen controls
15. Offline downloads with progress
16. Waveform visualization
17. Chapter markers
18. Bookmarks & highlights
19. Cross-device sync
20. Sleep timer

---

## 📋 Phase 1: Click-to-Play & Navigation

### **1.1 Update BookListItem Component**

**File:** `client/src/components/BookListItem.tsx`

**Changes:**
```tsx
import { router } from 'expo-router';

export default function BookListItem({ book }: BookListItemProps) {
  const { setLecture, player } = usePlayer();

  const handlePlay = () => {
    // Set the lecture in player context
    const lecture = {
      id: book.id,
      title: book.title,
      speaker: book.author,
      author: book.author,
      audio_url: book.audio_url,
      thumbnail_url: book.thumbnail_url,
    };

    setLecture(lecture);

    // Navigate to player screen
    router.push('/player');
  };

  return (
    <Pressable onPress={handlePlay} className="flex-row gap-4 items-center">
      {/* ... existing UI ... */}
    </Pressable>
  );
}
```

**Result:** Clicking a lecture now navigates to player and loads audio.

---

### **1.2 Auto-Start Playback in PlayerProvider**

**File:** `client/src/providers/PlayerProvider.tsx`

**Add auto-play logic after audio URI is loaded:**

```tsx
// In PlayerProvider, add state for auto-play
const [shouldAutoPlay, setShouldAutoPlay] = useState(true);

// Modify getAudioUri to trigger auto-play
const getAudioUri = async () => {
  if (!lecture) {
    setAudioUri(undefined);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // ... existing logic ...

    if (streamingUrl) {
      setAudioUri(streamingUrl);
      setShouldAutoPlay(true); // Enable auto-play for new lecture
    }
  } catch (err) {
    // ... error handling ...
  } finally {
    setIsLoading(false);
  }
};

// Add effect to auto-play when audio is ready
useEffect(() => {
  if (player && audioUri && shouldAutoPlay && !isLoading && !playerStatus.playing) {
    player.play();
    setShouldAutoPlay(false); // Only auto-play once
  }
}, [player, audioUri, shouldAutoPlay, isLoading, playerStatus.playing]);
```

**Result:** Audio automatically starts playing when lecture loads.

---

## 📋 Phase 2: Mini-Player Component

### **2.1 Create MiniPlayer Component**

**File:** `client/src/components/player/MiniPlayer.tsx`

```tsx
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePlayer } from '@/providers/PlayerProvider';
import { useAudioPlayerStatus } from 'expo-audio';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export default function MiniPlayer() {
  const { player, lecture } = usePlayer();
  const playerStatus = useAudioPlayerStatus(player);

  // Don't show mini-player if no lecture is loaded
  if (!lecture) return null;

  const progress = playerStatus.duration > 0
    ? (playerStatus.currentTime / playerStatus.duration) * 100
    : 0;

  return (
    <Pressable
      onPress={() => router.push('/player')}
      className="absolute bottom-[60px] left-0 right-0 bg-gray-900 border-t border-gray-800"
      style={{ elevation: 10, shadowOpacity: 0.3, shadowRadius: 8 }}
    >
      {/* Progress bar */}
      <View className="h-0.5 bg-gray-800">
        <View
          className="h-full bg-blue-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Mini player content */}
      <View className="flex-row items-center px-4 py-3">
        {/* Thumbnail */}
        <Image
          source={{ uri: lecture.thumbnail_url }}
          className="w-12 h-12 rounded-md mr-3"
        />

        {/* Lecture info */}
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold" numberOfLines={1}>
            {lecture.title}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {lecture.speaker}
          </Text>
        </View>

        {/* Play/Pause button */}
        <Pressable
          onPress={() => playerStatus.playing ? player.pause() : player.play()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons
            name={playerStatus.playing ? 'pause' : 'play'}
            size={28}
            color="white"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
```

---

### **2.2 Integrate MiniPlayer into Root Layout**

**File:** `client/src/app/(protected)/_layout.tsx`

```tsx
import MiniPlayer from '@/components/player/MiniPlayer';
import { usePathname } from 'expo-router';

export default function ProtectedLayout() {
  const pathname = usePathname();
  const isPlayerScreen = pathname === '/player';

  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>

      {/* Show mini-player on all screens except full player */}
      {!isPlayerScreen && <MiniPlayer />}
    </View>
  );
}
```

**Result:** Mini-player appears at bottom of all screens, hides on full-screen player.

---

### **2.3 Add Swipe-to-Dismiss Gesture to Full Player**

**File:** `client/src/app/(protected)/player.tsx`

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

export default function PlayerScreen() {
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow downward swipe
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 200) {
        // Dismiss modal if swiped more than 200px
        runOnJS(router.back)();
      } else {
        // Spring back to original position
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]} className="bg-black">
        <SafeAreaView className='flex-1 p-4 py-10 gap-4'>
          {/* Swipe indicator */}
          <View className="items-center mb-2">
            <View className="w-10 h-1 bg-gray-600 rounded-full" />
          </View>

          {/* ... rest of player UI ... */}
        </SafeAreaView>
      </Animated.View>
    </GestureDetector>
  );
}
```

**Dependencies:** Add `react-native-gesture-handler` and `react-native-reanimated`.

**Result:** Swipe down on player to dismiss and return to mini-player.

---

## 📋 Phase 3: Lecture Info Modal

### **3.1 Create LectureInfoModal Component**

**File:** `client/src/components/modals/LectureInfoModal.tsx`

```tsx
import { Modal, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UILecture } from '@/types/ui';
import { usePlayer } from '@/providers/PlayerProvider';
import { router } from 'expo-router';
import { useFavoriteCheck, useAddFavorite, useRemoveFavorite } from '@/queries/hooks/favorites';

type LectureInfoModalProps = {
  visible: boolean;
  lecture: UILecture | null;
  onClose: () => void;
};

export default function LectureInfoModal({ visible, lecture, onClose }: LectureInfoModalProps) {
  const { setLecture: playLecture } = usePlayer();
  const { data: isFavorited } = useFavoriteCheck(lecture?.id?.toString());
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  if (!lecture) return null;

  const handlePlay = () => {
    playLecture(lecture);
    onClose();
    router.push('/player');
  };

  const toggleFavorite = () => {
    if (isFavorited) {
      removeFavoriteMutation.mutate(lecture.id.toString());
    } else {
      addFavoriteMutation.mutate(lecture.id.toString());
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-950">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
          <Text className="text-white text-lg font-bold">Lecture Details</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* Lecture Cover */}
          <Image
            source={{ uri: lecture.thumbnail_url }}
            className="w-full aspect-square"
          />

          {/* Lecture Info */}
          <View className="p-6 gap-4">
            <Text className="text-white text-3xl font-bold">{lecture.title}</Text>
            <Text className="text-gray-400 text-lg">{lecture.speaker}</Text>

            {/* Description */}
            {lecture.description && (
              <View className="mt-4">
                <Text className="text-white text-lg font-semibold mb-2">About</Text>
                <Text className="text-gray-300 leading-6">{lecture.description}</Text>
              </View>
            )}

            {/* Metadata */}
            <View className="flex-row flex-wrap gap-2 mt-4">
              {lecture.duration && (
                <View className="bg-gray-800 px-3 py-2 rounded-lg">
                  <Text className="text-gray-300">
                    <Ionicons name="time-outline" size={14} /> {formatDuration(lecture.duration)}
                  </Text>
                </View>
              )}
              {lecture.collectionTitle && (
                <View className="bg-gray-800 px-3 py-2 rounded-lg">
                  <Text className="text-gray-300">
                    <Ionicons name="albums-outline" size={14} /> {lecture.collectionTitle}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-4 border-t border-gray-800 gap-3">
          {/* Play Button */}
          <Pressable
            onPress={handlePlay}
            className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white font-bold text-lg">Play Lecture</Text>
          </Pressable>

          {/* Secondary Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={toggleFavorite}
              className="flex-1 bg-gray-800 p-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={20}
                color={isFavorited ? "#ef4444" : "white"}
              />
              <Text className="text-white font-semibold">
                {isFavorited ? "Favorited" : "Favorite"}
              </Text>
            </Pressable>

            <Pressable className="flex-1 bg-gray-800 p-3 rounded-xl flex-row items-center justify-center gap-2">
              <Ionicons name="download-outline" size={20} color="white" />
              <Text className="text-white font-semibold">Download</Text>
            </Pressable>

            <Pressable className="bg-gray-800 p-3 rounded-xl items-center justify-center">
              <Ionicons name="share-outline" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
```

---

### **3.2 Add Long-Press to Open Info Modal**

**File:** `client/src/components/BookListItem.tsx`

```tsx
import { useState } from 'react';
import LectureInfoModal from '@/components/modals/LectureInfoModal';

export default function BookListItem({ book }: BookListItemProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { setLecture, player } = usePlayer();

  const handlePlay = () => {
    const lecture = { /* ... */ };
    setLecture(lecture);
    router.push('/player');
  };

  return (
    <>
      <Pressable
        onPress={handlePlay}
        onLongPress={() => setShowInfo(true)}
        className="flex-row gap-4 items-center"
      >
        {/* ... existing UI ... */}
      </Pressable>

      <LectureInfoModal
        visible={showInfo}
        lecture={book}
        onClose={() => setShowInfo(false)}
      />
    </>
  );
}
```

**Result:**
- **Tap** → Play lecture
- **Long press** → Show lecture info modal

---

## 📋 Phase 4: Enhanced Player Features

### **4.1 Queue Management System**

**File:** `client/src/providers/PlayerProvider.tsx`

**Add queue state:**

```tsx
type PlayerContextType = {
  player: AudioPlayer;
  lecture: UILecture | null;
  setLecture: (lecture: UILecture | null) => void;
  isLoading: boolean;
  error: string | null;

  // Queue management
  queue: UILecture[];
  currentIndex: number;
  addToQueue: (lectures: UILecture[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;
  shuffleQueue: () => void;
};

export default function PlayerProvider({ children }: PropsWithChildren) {
  // ... existing state ...
  const [queue, setQueue] = useState<UILecture[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);

  const addToQueue = (lectures: UILecture[]) => {
    setQueue(lectures);
    setCurrentIndex(0);
    setLecture(lectures[0]);
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setLecture(queue[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setLecture(queue[prevIndex]);
    }
  };

  const shuffleQueue = () => {
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIsShuffled(!isShuffled);
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        lecture,
        setLecture,
        isLoading,
        error,
        queue,
        currentIndex,
        addToQueue,
        playNext,
        playPrevious,
        clearQueue,
        shuffleQueue
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
```

---

### **4.2 Update Player Screen with Queue Controls**

**File:** `client/src/app/(protected)/player.tsx`

```tsx
export default function PlayerScreen() {
  const { player, lecture, playNext, playPrevious, queue, currentIndex } = usePlayer();
  const playerStatus = useAudioPlayerStatus(player);

  const canGoNext = currentIndex < queue.length - 1;
  const canGoPrevious = currentIndex > 0;

  return (
    <SafeAreaView className='flex-1 p-4 py-10 gap-4'>
      {/* ... existing UI ... */}

      <View className='flex-row items-center justify-between px-4'>
        {/* Previous */}
        <Pressable
          onPress={playPrevious}
          disabled={!canGoPrevious}
          className={!canGoPrevious ? 'opacity-30' : ''}
        >
          <Ionicons name='play-skip-back' size={32} color='white' />
        </Pressable>

        {/* Skip back 15s */}
        <Pressable onPress={() => player.seekTo(Math.max(0, playerStatus.currentTime - 15))}>
          <Ionicons name='play-back' size={28} color='white' />
        </Pressable>

        {/* Play/Pause */}
        <Pressable
          onPress={() => playerStatus.playing ? player.pause() : player.play()}
          className="bg-white rounded-full p-4"
        >
          <Ionicons
            name={playerStatus.playing ? 'pause' : 'play'}
            size={40}
            color='black'
          />
        </Pressable>

        {/* Skip forward 15s */}
        <Pressable onPress={() => player.seekTo(Math.min(playerStatus.duration, playerStatus.currentTime + 15))}>
          <Ionicons name='play-forward' size={28} color='white' />
        </Pressable>

        {/* Next */}
        <Pressable
          onPress={playNext}
          disabled={!canGoNext}
          className={!canGoNext ? 'opacity-30' : ''}
        >
          <Ionicons name='play-skip-forward' size={32} color='white' />
        </Pressable>
      </View>

      {/* Queue info */}
      {queue.length > 0 && (
        <Text className="text-gray-400 text-center text-sm">
          {currentIndex + 1} of {queue.length} in queue
        </Text>
      )}
    </SafeAreaView>
  );
}
```

---

### **4.3 Playback Speed Control**

**File:** `client/src/app/(protected)/player.tsx`

```tsx
import { Menu } from 'react-native-paper'; // Or custom dropdown

export default function PlayerScreen() {
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    player.setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  return (
    <SafeAreaView className='flex-1 p-4 py-10 gap-4'>
      {/* ... existing UI ... */}

      {/* Playback speed button */}
      <Pressable
        onPress={() => setShowSpeedMenu(true)}
        className="absolute top-16 right-4 bg-gray-800 rounded-full px-4 py-2"
      >
        <Text className="text-white font-semibold">{playbackSpeed}x</Text>
      </Pressable>

      {/* Speed menu */}
      {showSpeedMenu && (
        <Modal transparent visible={showSpeedMenu} onRequestClose={() => setShowSpeedMenu(false)}>
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowSpeedMenu(false)}
          >
            <View className="bg-gray-900 rounded-t-3xl p-6">
              <Text className="text-white text-xl font-bold mb-4">Playback Speed</Text>
              {speeds.map((speed) => (
                <Pressable
                  key={speed}
                  onPress={() => changeSpeed(speed)}
                  className={`p-4 rounded-xl mb-2 ${
                    speed === playbackSpeed ? 'bg-blue-600' : 'bg-gray-800'
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {speed}x {speed === 1.0 && '(Normal)'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}
```

---

## 📋 Phase 5: Advanced Features

### **5.1 Sleep Timer**

**File:** `client/src/components/player/SleepTimer.tsx`

```tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { usePlayer } from '@/providers/PlayerProvider';

export default function SleepTimer() {
  const { player } = usePlayer();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const durations = [5, 10, 15, 30, 45, 60]; // minutes

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          player.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const setSleepTimer = (minutes: number) => {
    setTimeRemaining(minutes);
    setShowPicker(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="bg-gray-800 px-4 py-2 rounded-full"
      >
        <Text className="text-white">
          {timeRemaining > 0
            ? `Sleep in ${timeRemaining}m`
            : 'Sleep Timer'}
        </Text>
      </Pressable>

      <Modal transparent visible={showPicker} onRequestClose={() => setShowPicker(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowPicker(false)}>
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Sleep Timer</Text>
            {durations.map((duration) => (
              <Pressable
                key={duration}
                onPress={() => setSleepTimer(duration)}
                className="bg-gray-800 p-4 rounded-xl mb-2"
              >
                <Text className="text-white text-center">{duration} minutes</Text>
              </Pressable>
            ))}
            {timeRemaining > 0 && (
              <Pressable
                onPress={() => {
                  setTimeRemaining(0);
                  setShowPicker(false);
                }}
                className="bg-red-600 p-4 rounded-xl mt-2"
              >
                <Text className="text-white text-center font-semibold">Cancel Timer</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
```

---

### **5.2 Background Playback & Lock Screen Controls**

**Install expo-av or use expo-audio with background mode:**

```bash
npx expo install expo-av
```

**File:** `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "audioModeConfig": {
            "playAndRecord": true,
            "allowAirPlay": true
          }
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

**Update PlayerProvider:**

```tsx
import { Audio } from 'expo-av';

useEffect(() => {
  // Configure audio session for background playback
  Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}, []);
```

---

### **5.3 Download Management with Progress**

**File:** `client/src/hooks/useDownload.ts`

```tsx
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { StreamingService } from '@/services/audio/StreamingService';
import { UILecture } from '@/types/ui';

export function useDownload() {
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  const downloadLecture = async (lecture: UILecture) => {
    const lectureId = lecture.id.toString();

    try {
      setIsDownloading(prev => ({ ...prev, [lectureId]: true }));

      const streamingUrl = await StreamingService.getStreamingUrl(lecture);
      if (!streamingUrl) throw new Error('No streaming URL available');

      const fetchOptions = await StreamingService.createAudioFetchOptions();
      const fileUri = `${FileSystem.documentDirectory}${lectureId}.mp3`;

      const downloadResumable = FileSystem.createDownloadResumable(
        streamingUrl,
        fileUri,
        fetchOptions as any,
        (progress) => {
          const progressPercent = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
          setDownloadProgress(prev => ({ ...prev, [lectureId]: progressPercent }));
        }
      );

      await downloadResumable.downloadAsync();

      setDownloadProgress(prev => ({ ...prev, [lectureId]: 100 }));
      return fileUri;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    } finally {
      setIsDownloading(prev => ({ ...prev, [lectureId]: false }));
    }
  };

  const deleteDownload = async (lectureId: string) => {
    const fileUri = `${FileSystem.documentDirectory}${lectureId}.mp3`;
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    setDownloadProgress(prev => {
      const updated = { ...prev };
      delete updated[lectureId];
      return updated;
    });
  };

  return {
    downloadLecture,
    deleteDownload,
    downloadProgress,
    isDownloading,
  };
}
```

---

## 📊 Implementation Checklist

### **Phase 1: Foundation** ✅
- [ ] Update `BookListItem` to navigate to player on click
- [ ] Add auto-play logic in `PlayerProvider`
- [ ] Test click-to-play flow

### **Phase 2: Mini-Player** ✅
- [ ] Create `MiniPlayer` component
- [ ] Integrate into root layout
- [ ] Add swipe-to-dismiss gesture to full player
- [ ] Test state sync between mini and full player

### **Phase 3: Lecture Info Modal** ✅
- [ ] Create `LectureInfoModal` component
- [ ] Add long-press handler to `BookListItem`
- [ ] Test modal presentation and actions

### **Phase 4: Enhanced Features** ✅
- [ ] Implement queue management in `PlayerProvider`
- [ ] Update player with skip forward/backward (15s)
- [ ] Add playback speed control
- [ ] Add repeat and shuffle modes

### **Phase 5: Advanced Features** 🚀
- [ ] Implement sleep timer
- [ ] Configure background playback
- [ ] Add lock screen controls
- [ ] Implement download management
- [ ] Add waveform visualization (optional)
- [ ] Add bookmarks/highlights (optional)

---

## 🎯 Success Criteria

- ✅ Clicking any lecture starts playback and navigates to player
- ✅ Mini-player visible on all screens (except full player)
- ✅ Play/pause state synced between mini and full player
- ✅ Swipe down to dismiss full player
- ✅ Queue management with next/previous
- ✅ Skip forward/backward 15 seconds
- ✅ Playback speed control (0.5x - 2x)
- ✅ Long-press to view lecture details
- ✅ Smooth animations and transitions
- ✅ Background playback works
- ✅ Download lectures for offline playback

---

## 📚 Dependencies

```bash
# Required
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler
npx expo install expo-av

# Optional (for advanced UI)
npm install react-native-paper
npm install react-native-track-player # Alternative to expo-audio for advanced features
```

---

## 🎨 UI/UX Design Principles

1. **Consistency:** Match Spotify/Apple Podcasts interaction patterns
2. **Feedback:** Immediate visual feedback for all user actions
3. **Accessibility:** Large touch targets, good contrast, screen reader support
4. **Performance:** Smooth 60fps animations, optimized re-renders
5. **Error Handling:** Graceful degradation, helpful error messages

---

**Status:** 📝 Ready for Implementation
**Estimated Time:** 3-5 days for core features (Phases 1-3)
**Last Updated:** 2025-10-14
