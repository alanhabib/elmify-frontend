import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

import PlaybackBar from '@/components/PlaybackBar';
import { SleepTimerModal } from '@/components/SleepTimerModal';
import { DownloadButton } from '@/components/DownloadButton';

import { usePlayer } from '@/providers/PlayerProvider';
import { useFavoriteCheck, useAddFavorite, useRemoveFavorite } from '@/queries/hooks/favorites';
import { formatTime } from '@/utils/timeFormat';

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function PlayerScreen() {
  const {
    lecture,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    error,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    sleepTimer,
    setSleepTimer,
    sleepTimerRemaining,
    play,
    pause,
    seekTo,
    setPlaybackRate,
  } = usePlayer();

  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isReady, setIsReady] = useState(false);

  // Favorites
  const { data: isFavorited = false } = useFavoriteCheck(lecture?.id?.toString());
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  // Wait for track to be ready before showing UI (prevents progress bar jump)
  useEffect(() => {
    if (lecture && !isLoading && duration > 0) {
      // Small delay to ensure track is fully loaded at correct position
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [lecture?.id, isLoading, duration]);

  const toggleFavorite = () => {
    if (!lecture) return;

    if (isFavorited) {
      removeFavoriteMutation.mutate(lecture.id.toString());
    } else {
      addFavoriteMutation.mutate(lecture.id.toString());
    }
  };

  const cyclePlaybackSpeed = async () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    await setPlaybackRate(newSpeed);
  };

  const handleSleepTimerSelect = (minutes: number) => {
    setSleepTimer(minutes);
    setShowSleepTimerModal(false);
  };

  const handleCancelTimer = () => {
    setSleepTimer(null);
    setShowSleepTimerModal(false);
  };

  // Show loading state (including when track is loading or not ready)
  if (isLoading || !isReady) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="white" />
        <Text className='text-white mt-4'>Loading audio...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center p-4'>
        <Ionicons name="alert-circle-outline" size={64} color="white" />
        <Text className='text-white text-lg mt-4 text-center'>{error}</Text>
        <Pressable
          onPress={() => router.back()}
          className='bg-blue-600 px-6 py-3 rounded-lg mt-4'
        >
          <Text className='text-white font-semibold'>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Show empty state
  if (!lecture) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center p-4'>
        <Ionicons name="musical-notes-outline" size={64} color="white" />
        <Text className='text-white text-lg mt-4'>No lecture selected</Text>
        <Pressable
          onPress={() => router.back()}
          className='bg-blue-600 px-6 py-3 rounded-lg mt-4'
        >
          <Text className='text-white font-semibold'>Browse Lectures</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1  p-4 py-10 gap-4'>
      <Pressable
        onPress={() => router.back()}
        className='absolute top-16 left-4 bg-gray-800 rounded-full p-2'
      >
        <Entypo name='chevron-down' size={24} color='white' />
      </Pressable>

      <Image
        key={lecture.id}
        source={{ uri: lecture.thumbnail_url }}
        className='w-[95%] aspect-square rounded-[30px] self-center'
      />

      <View className='gap-8 flex-1 justify-end'>
        <View>
          <Text className='text-white text-2xl font-bold text-center'>
            {lecture.title}
          </Text>
          {lecture.author && (
            <Text className='text-gray-300 text-lg text-center mt-2'>
              {lecture.author}
            </Text>
          )}
        </View>

        <PlaybackBar
          currentTime={currentTime}
          duration={duration}
          onSeek={(seconds: number) => seekTo(seconds)}
        />

        {/* Playback Controls Row */}
        <View className='flex-row justify-center gap-4 mb-2'>
          <Pressable
            onPress={toggleShuffle}
            className={`px-4 py-2 rounded-full ${shuffle ? 'bg-purple-600' : 'bg-gray-800'}`}
          >
            <Ionicons name="shuffle" size={20} color="white" />
          </Pressable>

          <Pressable
            onPress={cyclePlaybackSpeed}
            className='bg-gray-800 px-4 py-2 rounded-full'
          >
            <Text className='text-white font-semibold'>{playbackSpeed}x</Text>
          </Pressable>

          <Pressable
            onPress={cycleRepeatMode}
            className={`px-4 py-2 rounded-full ${repeatMode !== 'off' ? 'bg-purple-600' : 'bg-gray-800'}`}
          >
            <Ionicons
              name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
              size={20}
              color="white"
            />
            {repeatMode === 'one' && (
              <Text className='absolute top-1 right-1 text-white text-xs'>1</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setShowSleepTimerModal(true)}
            className={`px-4 py-2 rounded-full ${sleepTimer !== null ? 'bg-purple-600' : 'bg-gray-800'}`}
          >
            <View className='flex-row items-center gap-1'>
              <Ionicons name="moon" size={20} color="white" />
              {sleepTimerRemaining !== null && (
                <Text className='text-white text-xs font-semibold'>
                  {formatTime(sleepTimerRemaining)}
                </Text>
              )}
            </View>
          </Pressable>
        </View>

        <View className='flex-row items-center justify-between px-4'>
          <Pressable onPress={playPrevious}>
            <Ionicons name='play-skip-back' size={32} color='white' />
          </Pressable>

          <Pressable onPress={() => seekTo(Math.max(0, currentTime - 15))}>
            <Ionicons name='play-back' size={32} color='white' />
          </Pressable>

          <Pressable
            onPress={() => isPlaying ? pause() : play()}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={64}
              color='white'
            />
          </Pressable>

          <Pressable onPress={() => seekTo(Math.min(duration, currentTime + 15))}>
            <Ionicons name='play-forward' size={32} color='white' />
          </Pressable>

          <Pressable onPress={playNext}>
            <Ionicons name='play-skip-forward' size={32} color='white' />
          </Pressable>
        </View>

        {/* Favorite and Download buttons row */}
        <View className='flex-row justify-center gap-8'>
          <Pressable onPress={toggleFavorite}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={32}
              color={isFavorited ? '#ef4444' : 'white'}
            />
          </Pressable>

          <DownloadButton lecture={lecture} size={32} showProgress />
        </View>
      </View>

      <SleepTimerModal
        visible={showSleepTimerModal}
        onClose={() => setShowSleepTimerModal(false)}
        onSelectTimer={handleSleepTimerSelect}
        onCancelTimer={handleCancelTimer}
        hasActiveTimer={sleepTimer !== null}
      />
    </SafeAreaView>
  );
}
