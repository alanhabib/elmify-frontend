import { useState, useEffect, useCallback } from 'react';
import { Event, State, useTrackPlayerEvents, useProgress } from 'react-native-track-player';
import { TrackPlayerService } from '@/services/audio/TrackPlayerService';

/**
 * Hook to manage track player state following best practices
 * Separates track player logic from UI components
 */
export function useTrackPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const progress = useProgress();

  // DON'T setup on mount - let it initialize lazily when first used
  // This prevents TurboModule crashes during app startup
  // TrackPlayer.setupPlayer() will be called in TrackPlayerService when needed

  // Listen to playback state changes
  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackState) {
      const playing = event.state === State.Playing;
      setIsPlaying(playing);
      setIsLoading(event.state === State.Buffering);
    }
  });

  const play = useCallback(async () => {
    await TrackPlayerService.play();
  }, []);

  const pause = useCallback(async () => {
    await TrackPlayerService.pause();
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    await TrackPlayerService.seekTo(seconds);
  }, []);

  const skipForward = useCallback(async (seconds: number = 15) => {
    const position = await TrackPlayerService.getPosition();
    const duration = await TrackPlayerService.getDuration();
    const newPosition = Math.min(position + seconds, duration);
    await TrackPlayerService.seekTo(newPosition);
  }, []);

  const skipBackward = useCallback(async (seconds: number = 15) => {
    const position = await TrackPlayerService.getPosition();
    const newPosition = Math.max(position - seconds, 0);
    await TrackPlayerService.seekTo(newPosition);
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    await TrackPlayerService.setRate(rate);
  }, []);

  return {
    isPlaying,
    isLoading,
    currentTime: progress.position,
    duration: progress.duration,
    play,
    pause,
    seekTo,
    skipForward,
    skipBackward,
    setPlaybackRate,
  };
}
