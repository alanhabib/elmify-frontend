import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { AppState } from "react-native";
import { Event, State, useTrackPlayerEvents } from "react-native-track-player";
import { TrackPlayerService } from "@/services/audio/TrackPlayerService";
import { StreamingService } from "@/services/audio/StreamingService";
import { UILecture } from "@/types/ui";
import * as FileSystem from "expo-file-system";
import {
  usePlaybackPosition,
  useUpdatePosition,
} from "@/queries/hooks/playback";
import { useTrackListening } from "@/queries/hooks/stats";
import { useTrackPlayer } from "@/hooks/useTrackPlayer";

type RepeatMode = "off" | "one" | "all";

type PlayerContextType = {
  lecture: UILecture | null;
  setLecture: (lecture: UILecture | null) => void;
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
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
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export default function PlayerProvider({ children }: PropsWithChildren) {
  const [lecture, setLecture] = useState<UILecture | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<UILecture[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(
    null
  );

  const positionSyncInterval = useRef<NodeJS.Timeout | null>(null);
  const statsTrackingInterval = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPosition = useRef<number>(0);
  const isCleaningUp = useRef(false);
  const currentLectureId = useRef<string | null>(null);

  // Fetch saved playback position
  const { data: savedPosition, isLoading: isPositionLoading } =
    usePlaybackPosition(lecture?.id?.toString());
  const updatePositionMutation = useUpdatePosition();
  const trackListeningMutation = useTrackListening();

  // Use track player hook
  const trackPlayer = useTrackPlayer();

  const loadLecture = useCallback(
    async (startPosition: number = 0) => {
      if (!lecture) return;

      setIsLoading(true);
      setError(null);

      // Clear intervals
      if (positionSyncInterval.current)
        clearInterval(positionSyncInterval.current);
      if (statsTrackingInterval.current)
        clearInterval(statsTrackingInterval.current);

      try {
        // Check for local file first
        const localUri = await getLocalAudioUri();
        const audioUrl = localUri || (await getStreamingUrl());

        if (!audioUrl) {
          throw new Error("No audio source available");
        }

        // Create lecture with proper URL
        const lectureWithUrl: UILecture = {
          ...lecture,
          audio_url: audioUrl,
        };

        // Load and play with start position
        await TrackPlayerService.loadAndPlay(lectureWithUrl, startPosition);

        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load audio";
        console.error("❌ PlayerProvider error:", errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [lecture]
  );

  // Load new lecture when lecture changes
  useEffect(() => {
    if (!lecture) {
      TrackPlayerService.stop();
      currentLectureId.current = null;
      return;
    }

    // Check if this is a new lecture
    if (currentLectureId.current === lecture.id) {
      return;
    }

    currentLectureId.current = lecture.id;

    // Start loading immediately with position 0, then update if savedPosition loads
    loadLecture(0);
  }, [lecture?.id, loadLecture]);

  // Update position when savedPosition loads (if lecture already started playing)
  useEffect(() => {
    if (!lecture || !savedPosition || isPositionLoading) return;

    // Only seek if we have a saved position and player is ready
    const updatePosition = async () => {
      try {
        const startPosition = savedPosition.currentPosition / 1000;
        if (startPosition > 0) {
          await TrackPlayerService.seekTo(startPosition);
        }
      } catch (error) {
        console.error("Position update warning:", error);
      }
    };

    updatePosition();
  }, [savedPosition, isPositionLoading]);

  const getLocalAudioUri = async (): Promise<string | null> => {
    if (!lecture) return null;

    try {
      const file = `${FileSystem.documentDirectory}${lecture.id}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(file, { size: false });
      return fileInfo.exists ? file : null;
    } catch {
      return null;
    }
  };

  const getStreamingUrl = async (): Promise<string | null> => {
    if (!lecture) return null;
    return await StreamingService.getStreamingUrl(lecture);
  };

  // Save position helper
  const savePosition = (positionMs: number) => {
    if (!lecture || positionMs === lastSavedPosition.current) return;

    if (
      positionMs > 0 &&
      Math.abs(positionMs - lastSavedPosition.current) > 1000
    ) {
      lastSavedPosition.current = positionMs;
      updatePositionMutation.mutate({
        lectureId: lecture.id.toString(),
        currentPosition: positionMs,
      });
    }
  };

  // Save position when paused
  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackState && event.state === State.Paused) {
      const position = await TrackPlayerService.getPosition();
      savePosition(Math.floor(position * 1000));
    }
  });

  // Sync position every 5 seconds while playing
  useEffect(() => {
    if (!lecture || !trackPlayer.isPlaying || isCleaningUp.current) {
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
      return;
    }

    positionSyncInterval.current = setInterval(async () => {
      if (!isCleaningUp.current) {
        const position = await TrackPlayerService.getPosition();
        savePosition(Math.floor(position * 1000));
      }
    }, 5000);

    return () => {
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
    };
  }, [lecture?.id, trackPlayer.isPlaying]);

  // Track listening stats every 30 seconds
  useEffect(() => {
    if (!lecture || !trackPlayer.isPlaying || isCleaningUp.current) {
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
      return;
    }

    statsTrackingInterval.current = setInterval(() => {
      if (!isCleaningUp.current) {
        trackListeningMutation.mutate({
          lectureId: lecture.id,
          playTimeSeconds: 30,
        });
      }
    }, 30000);

    return () => {
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
    };
  }, [lecture?.id, trackPlayer.isPlaying]);

  // Sleep timer logic
  useEffect(() => {
    if (sleepTimer === null) {
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
        sleepTimerInterval.current = null;
      }
      setSleepTimerRemaining(null);
      return;
    }

    setSleepTimerRemaining(sleepTimer * 60);

    sleepTimerInterval.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          TrackPlayerService.pause();
          setSleepTimer(null);
          clearInterval(sleepTimerInterval.current!);
          sleepTimerInterval.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
        sleepTimerInterval.current = null;
      }
    };
  }, [sleepTimer]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (lecture && !isCleaningUp.current) {
          try {
            const position = await TrackPlayerService.getPosition();
            if (position > 0) {
              updatePositionMutation.mutate({
                lectureId: lecture.id.toString(),
                currentPosition: Math.floor(position * 1000),
              });
            }
          } catch (error) {
            console.error("Final position save warning:", error);
          }
        }
      };
      cleanup();
    };
  }, [lecture?.id]);

  // Handle app going to background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "background" && lecture && !isCleaningUp.current) {
          try {
            const position = await TrackPlayerService.getPosition();
            if (position > 0) {
              updatePositionMutation.mutate({
                lectureId: lecture.id.toString(),
                currentPosition: Math.floor(position * 1000),
              });
            }
          } catch (error) {
            console.error("Background position save warning:", error);
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [lecture]);

  // Queue management
  const addToQueue = (lectures: UILecture[]) => {
    setQueue(lectures);
    TrackPlayerService.addToQueue(lectures);
  };

  const playNext = async () => {
    if (queue.length === 0) return;

    const currentIndex = queue.findIndex((l) => l.id === lecture?.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      setLecture(queue[nextIndex]);
    } else if (repeatMode === "all") {
      setLecture(queue[0]);
    }
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;

    const currentIndex = queue.findIndex((l) => l.id === lecture?.id);
    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      setLecture(queue[previousIndex]);
    } else if (repeatMode === "all") {
      setLecture(queue[queue.length - 1]);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const cycleRepeatMode = async () => {
    const modes: RepeatMode[] = ["off", "one", "all"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    setRepeatMode(newMode);
    await TrackPlayerService.setRepeatMode(newMode);
  };

  // Auto-play next when current finishes
  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    if (repeatMode === "one") {
      TrackPlayerService.seekTo(0);
      TrackPlayerService.play();
    } else {
      playNext();
    }
  });

  return (
    <PlayerContext.Provider
      value={{
        lecture,
        setLecture,
        isLoading,
        isPlaying: trackPlayer.isPlaying,
        currentTime: trackPlayer.currentTime,
        duration: trackPlayer.duration,
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
        play: trackPlayer.play,
        pause: trackPlayer.pause,
        seekTo: trackPlayer.seekTo,
        setPlaybackRate: trackPlayer.setPlaybackRate,
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
