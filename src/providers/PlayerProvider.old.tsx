import { AudioPlayer } from "expo-audio";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { AppState } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { StreamingService } from "@/services/audio/StreamingService";
import { UILecture } from "@/types/ui";
import * as FileSystem from "expo-file-system";
import { usePlaybackPosition, useUpdatePosition } from "@/queries/hooks/playback";
import { useTrackListening } from "@/queries/hooks/stats";
import { useSleepTimer } from "@/hooks/useSleepTimer";

type RepeatMode = 'off' | 'one' | 'all';

type PlayerContextType = {
  player: AudioPlayer;
  lecture: UILecture | null;
  setLecture: (lecture: UILecture | null) => void;
  isLoading: boolean;
  error: string | null;
  queue: UILecture[];
  addToQueue: (lectures: UILecture[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  cycleRepeatMode: () => void;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  sleepTimerRemaining: number | null;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export default function PlayerProvider({ children }: PropsWithChildren) {
  const [lecture, setLecture] = useState<UILecture | null>(null);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<UILecture[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const positionSyncInterval = useRef<NodeJS.Timeout | null>(null);
  const statsTrackingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPosition = useRef<number>(0);
  const isCleaningUp = useRef(false);

  // Fetch saved playback position
  const { data: savedPosition } = usePlaybackPosition(lecture?.id?.toString());
  const updatePositionMutation = useUpdatePosition();
  const trackListeningMutation = useTrackListening();

  // Create player with the current audioUri
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : undefined);
  const playerStatus = useAudioPlayerStatus(player);

  // Sleep timer hook
  const { sleepTimer, setSleepTimer, sleepTimerRemaining } = useSleepTimer(player);

  // Load new lecture when lecture changes
  useEffect(() => {
    if (!lecture) {
      setAudioUri(undefined);
      return;
    }

    // Stop any playing audio and clear intervals
    if (player) player.pause();
    if (positionSyncInterval.current) clearInterval(positionSyncInterval.current);
    if (statsTrackingInterval.current) clearInterval(statsTrackingInterval.current);

    // Load the new audio
    getAudioUri();
  }, [lecture?.id]);

  const getAudioUri = async () => {
    if (!lecture) {
      setAudioUri(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, check for local cached file
      const localUri = await getLocalAudioUri();
      if (localUri) {
        setAudioUri(localUri);
        return;
      }

      // Get authenticated streaming URL
      const streamingUrl = await StreamingService.getStreamingUrl(lecture);
      if (streamingUrl) {
        setAudioUri(streamingUrl);
      } else {
        throw new Error("No audio source available for this lecture");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load audio";
      console.error("❌ PlayerProvider error:", errorMessage);
      setError(errorMessage);
      setAudioUri(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalAudioUri = async (): Promise<string | null> => {
    if (!lecture) return null;

    try {
      const file = `${FileSystem.documentDirectory}${lecture.id}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(file, { size: false });
      return fileInfo.exists ? file : null;
    } catch (error) {
      // File doesn't exist or error checking
      return null;
    }
  };

  // Helper function to save position
  const savePosition = (positionMs: number) => {
    if (!lecture || positionMs === lastSavedPosition.current) return;

    // Only save if position is valid and has changed significantly (more than 1 second)
    if (positionMs > 0 && Math.abs(positionMs - lastSavedPosition.current) > 1000) {
      lastSavedPosition.current = positionMs;
      updatePositionMutation.mutate({
        lectureId: lecture.id.toString(),
        currentPosition: positionMs,
      });
    }
  };

  // Replace audio and auto-play when audioUri changes
  useEffect(() => {
    if (!audioUri || !player) return;

    player.replace({ uri: audioUri });
    player.play();
  }, [audioUri]);

  // Restore saved playback position when lecture loads
  useEffect(() => {
    if (savedPosition && player && lecture) {
      const positionInSeconds = savedPosition.currentPosition / 1000;
      player.seekTo(positionInSeconds);
    }
  }, [savedPosition, player, lecture?.id]);

  // Save position when playback is paused
  useEffect(() => {
    if (!lecture || !player || !playerStatus || isCleaningUp.current) return;

    // When player transitions from playing to paused, save position
    if (!playerStatus.playing && playerStatus.currentTime > 0) {
      const currentPositionMs = Math.floor(playerStatus.currentTime * 1000);
      savePosition(currentPositionMs);
    }
  }, [playerStatus.playing, lecture?.id]);

  // Sync playback position to backend every 5 seconds while playing
  useEffect(() => {
    if (!lecture || !player || !playerStatus.playing || isCleaningUp.current) {
      // Clear interval if not playing
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
      return;
    }

    // Start syncing position while playing
    positionSyncInterval.current = setInterval(() => {
      if (!isCleaningUp.current && playerStatus?.currentTime) {
        const currentPositionMs = Math.floor(playerStatus.currentTime * 1000);
        savePosition(currentPositionMs);
      }
    }, 5000); // Every 5 seconds

    // Cleanup interval on unmount or when playback stops
    return () => {
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
    };
  }, [lecture?.id, playerStatus.playing, playerStatus.currentTime]);

  // Track listening stats every 30 seconds while playing
  useEffect(() => {
    if (!lecture || !player || !playerStatus.playing || isCleaningUp.current) {
      // Clear interval if not playing
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
      return;
    }

    // Start tracking stats while playing
    statsTrackingInterval.current = setInterval(() => {
      if (!isCleaningUp.current) {
        trackListeningMutation.mutate({
          lectureId: lecture.id,
          playTimeSeconds: 30,
        });
      }
    }, 30000); // Every 30 seconds

    // Cleanup interval on unmount or when playback stops
    return () => {
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
    };
  }, [lecture?.id, playerStatus.playing]);

  // Save position on unmount or lecture change
  useEffect(() => {
    return () => {
      if (player && lecture && !isCleaningUp.current) {
        try {
          if (player.currentTime && player.currentTime > 0) {
            const finalPositionMs = Math.floor(player.currentTime * 1000);
            // Force save without checking lastSavedPosition
            updatePositionMutation.mutate({
              lectureId: lecture.id.toString(),
              currentPosition: finalPositionMs,
            });
          }
        } catch (error) {
          // Player might be disposed, ignore error
          console.log("Final position save warning:", error);
        }
      }
    };
  }, [lecture?.id]);

  // Handle app going to background (save position)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // When app goes to background, save current position
      if (nextAppState === "background" && player && lecture && !isCleaningUp.current) {
        try {
          if (player.currentTime && player.currentTime > 0) {
            const currentPositionMs = Math.floor(player.currentTime * 1000);
            updatePositionMutation.mutate({
              lectureId: lecture.id.toString(),
              currentPosition: currentPositionMs,
            });
          }
        } catch (error) {
          // Player might be disposed, ignore error
          console.log("Background position save warning:", error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, lecture]);

  // Queue management functions
  const addToQueue = (lectures: UILecture[]) => {
    setQueue(lectures);
  };

  const playNext = () => {
    if (queue.length === 0) return;

    const currentIndex = queue.findIndex(l => l.id === lecture?.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      setLecture(queue[nextIndex]);
    } else if (repeatMode === 'all') {
      setLecture(queue[0]);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    const currentIndex = queue.findIndex(l => l.id === lecture?.id);
    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      setLecture(queue[previousIndex]);
    } else if (repeatMode === 'all') {
      setLecture(queue[queue.length - 1]);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  // Auto-play next when current finishes
  useEffect(() => {
    if (!playerStatus.isLoaded || playerStatus.duration === 0) return;

    const hasFinished =
      playerStatus.currentTime >= playerStatus.duration - 1 &&
      !playerStatus.playing;

    if (hasFinished) {
      if (repeatMode === 'one') {
        player.seekTo(0);
        player.play();
      } else {
        playNext();
      }
    }
  }, [playerStatus.currentTime, playerStatus.duration, playerStatus.playing]);

  return (
    <PlayerContext.Provider
      value={{
        player,
        lecture,
        setLecture,
        isLoading,
        error,
        queue,
        addToQueue,
        playNext,
        playPrevious,
        shuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
        sleepTimer,
        setSleepTimer,
        sleepTimerRemaining,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
