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
import { useAuth } from "@clerk/clerk-expo";

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
  const { isSignedIn } = useAuth();
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
  const [trackLoadedId, setTrackLoadedId] = useState<string | null>(null); // Track which lecture is loaded

  const positionSyncInterval = useRef<NodeJS.Timeout | null>(null);
  const statsTrackingInterval = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPosition = useRef<number>(0);
  const isCleaningUp = useRef<boolean>(false);
  const currentLectureId = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasSeekingToSavedPosition = useRef<string | null>(null); // Track which lecture we've seeked for

  // Clear track loaded state on mount (handles app refresh case)
  // The actual stopping of playback is handled in TrackPlayerService.setup()
  useEffect(() => {
    setTrackLoadedId(null);
    isCleaningUp.current = false; // Reset cleanup flag on mount
  }, []);

  // Fetch saved playback position (only when signed in)
  const { data: savedPosition, isLoading: isPositionLoading } =
    usePlaybackPosition(lecture?.id?.toString(), { enabled: !!lecture?.id && !!isSignedIn });
  const updatePositionMutation = useUpdatePosition();
  const trackListeningMutation = useTrackListening();

  // Use track player hook
  const trackPlayer = useTrackPlayer();

  // Main function to load and play a lecture
  const loadAndPlayLecture = useCallback(
    async (lectureToPlay: UILecture) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Update UI immediately
      setIsLoading(true);
      setError(null);

      // CRITICAL: Stop previous playback IMMEDIATELY to prevent double audio
      // Must await to ensure clean state before loading new track
      try {
        await TrackPlayerService.stop();
        console.log("🛑 Stopped previous playback");
      } catch (e) {
        // Ignore errors during stop
      }
      setTrackLoadedId(null); // Clear track loaded flag

      // Clear intervals
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }

      try {
        console.log("🎵 Starting to load lecture:", lectureToPlay.id);

        // Check if aborted
        if (signal.aborted) return;

        // Check for local file first (fast path)
        let audioUrl: string | null = null;
        try {
          const file = `${FileSystem.documentDirectory}${lectureToPlay.id}.mp3`;
          const fileInfo = await FileSystem.getInfoAsync(file, { size: false });
          if (fileInfo.exists) {
            audioUrl = file;
            console.log("✅ Using local file:", file);
          }
        } catch {
          // No local file, continue to fetch URL
        }

        if (signal.aborted) return;

        // Fetch streaming URL if no local file
        if (!audioUrl) {
          console.log("🌐 Fetching presigned URL from backend...");
          const startTime = Date.now();

          // Race between fetch and timeout
          const fetchPromise = StreamingService.getStreamingUrl(lectureToPlay);
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("URL fetch timeout (10s)")), 10000)
          );

          try {
            audioUrl = await Promise.race([fetchPromise, timeoutPromise]);
          } catch (err) {
            if (signal.aborted) return;
            throw err;
          }

          const fetchTime = Date.now() - startTime;
          console.log(`✅ Presigned URL fetched in ${fetchTime}ms`);
        }

        if (signal.aborted) return;

        if (!audioUrl) {
          throw new Error("No audio source available");
        }

        // Double-check we're still loading this lecture
        if (currentLectureId.current !== lectureToPlay.id) {
          console.log("⏭️ Lecture changed during URL fetch, aborting");
          return;
        }

        // Now we have the URL ready - TrackPlayer can buffer immediately
        const lectureWithUrl: UILecture = {
          ...lectureToPlay,
          audio_url: audioUrl,
        };

        console.log("🎵 Loading into TrackPlayer...");
        // Start at position 0 for immediate playback - we'll seek to saved position after
        await TrackPlayerService.loadAndPlay(lectureWithUrl, 0);
        console.log("✅ Playback started successfully");

        // Mark this track as loaded - now it's safe to seek
        setTrackLoadedId(lectureToPlay.id);
        setIsLoading(false);
      } catch (err) {
        if (signal.aborted) return;

        const errorMessage =
          err instanceof Error ? err.message : "Failed to load audio";
        console.error("❌ PlayerProvider error:", errorMessage);

        // Only set error state if not cleaning up
        if (!isCleaningUp.current) {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Handle lecture changes - the main effect
  useEffect(() => {
    if (!lecture) {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      TrackPlayerService.stop().catch(() => {});
      currentLectureId.current = null;
      return;
    }

    // Skip if same lecture already loaded
    if (currentLectureId.current === lecture.id) {
      return;
    }

    // New lecture confirmed - update the refs immediately
    currentLectureId.current = lecture.id;
    hasSeekingToSavedPosition.current = null; // Reset seek guard for new lecture

    // Start playback immediately - don't wait for position to load
    loadAndPlayLecture(lecture);
  }, [lecture?.id, loadAndPlayLecture]);

  // Seek to saved position when it loads (separate from playback start)
  useEffect(() => {
    if (!savedPosition || !lecture || isPositionLoading) return;

    // Only seek once per lecture to prevent multiple rapid seeks
    if (hasSeekingToSavedPosition.current === lecture.id) return;

    // CRITICAL: Only seek if the track is actually loaded in the player
    // This prevents seeking on the old track after app refresh
    if (trackLoadedId !== lecture.id) return;

    // Only seek if we're playing the correct lecture and have a meaningful position
    if (currentLectureId.current === lecture.id && savedPosition.currentPosition > 1000) {
      hasSeekingToSavedPosition.current = lecture.id;
      const positionSeconds = savedPosition.currentPosition / 1000;
      console.log(`🎯 Seeking to saved position: ${positionSeconds.toFixed(1)}s`);
      TrackPlayerService.seekTo(positionSeconds).catch(console.error);
    }
  }, [savedPosition, lecture?.id, isPositionLoading, trackLoadedId]);

  // Save position helper (only when signed in)
  const savePosition = (positionMs: number) => {
    // Skip saving for guest users
    if (!isSignedIn) return;
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

  // Save position when paused or stopped (best practice: user-initiated actions only)
  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    if (
      event.type === Event.PlaybackState &&
      (event.state === State.Paused || event.state === State.Stopped)
    ) {
      const position = await TrackPlayerService.getPosition();
      if (position > 0) {
        savePosition(Math.floor(position * 1000));
      }
    }
  });

  // Sync position every 30 seconds while playing
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
    }, 30000);

    return () => {
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
    };
  }, [lecture?.id, trackPlayer.isPlaying]);

  // Track listening stats every 30 seconds (only when signed in)
  useEffect(() => {
    if (!lecture || !trackPlayer.isPlaying || isCleaningUp.current || !isSignedIn) {
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
      return;
    }

    statsTrackingInterval.current = setInterval(() => {
      if (!isCleaningUp.current && isSignedIn) {
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
      isCleaningUp.current = true;

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Clear all intervals
      if (positionSyncInterval.current) {
        clearInterval(positionSyncInterval.current);
        positionSyncInterval.current = null;
      }
      if (statsTrackingInterval.current) {
        clearInterval(statsTrackingInterval.current);
        statsTrackingInterval.current = null;
      }
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
        sleepTimerInterval.current = null;
      }

      const cleanup = async () => {
        if (lecture) {
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
  }, [lecture, updatePositionMutation]);

  // Queue management
  const addToQueue = (lectures: UILecture[]) => {
    setQueue(lectures);
    TrackPlayerService.addToQueue(lectures);
  };

  // Use ref to always have access to current queue (avoids stale closure)
  const queueRef = useRef<UILecture[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const playNext = useCallback(async () => {
    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) {
      console.log("⏭️ No queue to play next from");
      return;
    }

    try {
      const currentIndex = currentQueue.findIndex((l) => l.id === lecture?.id);
      const nextIndex = currentIndex + 1;

      console.log("⏭️ playNext - currentIndex:", currentIndex, "nextIndex:", nextIndex, "queueLength:", currentQueue.length);

      if (nextIndex < currentQueue.length) {
        console.log("⏭️ Playing next lecture:", currentQueue[nextIndex].id);
        setLecture(currentQueue[nextIndex]);
      } else if (repeatMode === "all") {
        console.log("🔁 Repeating queue from start");
        setLecture(currentQueue[0]);
      } else {
        console.log("⏭️ End of queue reached");
      }
    } catch (error) {
      console.error("❌ Error in playNext:", error);
    }
  }, [lecture?.id, repeatMode]);

  const playPrevious = useCallback(async () => {
    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) {
      console.log("⏮️ No queue to play previous from");
      return;
    }

    try {
      const currentIndex = currentQueue.findIndex((l) => l.id === lecture?.id);
      const previousIndex = currentIndex - 1;

      console.log("⏮️ playPrevious - currentIndex:", currentIndex, "previousIndex:", previousIndex);

      if (previousIndex >= 0) {
        console.log("⏮️ Playing previous lecture:", currentQueue[previousIndex].id);
        setLecture(currentQueue[previousIndex]);
      } else if (repeatMode === "all") {
        console.log("🔁 Repeating queue from end");
        setLecture(currentQueue[currentQueue.length - 1]);
      } else {
        console.log("⏮️ Beginning of queue reached");
      }
    } catch (error) {
      console.error("❌ Error in playPrevious:", error);
    }
  }, [lecture?.id, repeatMode]);

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

  // Wrap seekTo to save position after seeking (best practice)
  const handleSeekTo = useCallback(
    async (seconds: number) => {
      await trackPlayer.seekTo(seconds);
      // Save position immediately after seek
      if (lecture) {
        savePosition(Math.floor(seconds * 1000));
      }
    },
    [trackPlayer.seekTo, lecture]
  );

  // Track playback errors and state changes for debugging
  useTrackPlayerEvents(
    [Event.PlaybackError, Event.PlaybackState],
    async (event) => {
      if (event.type === Event.PlaybackError) {
        console.error("[TrackPlayer] Playback error:", event);
      }
      if (event.type === Event.PlaybackState) {
        const stateNames: Record<State, string> = {
          [State.None]: "None",
          [State.Stopped]: "Stopped",
          [State.Playing]: "Playing",
          [State.Paused]: "Paused",
          [State.Buffering]: "Buffering",
          [State.Connecting]: "Connecting",
          [State.Ready]: "Ready",
          [State.Loading]: "Loading",
          [State.Error]: "Error",
        };

        const stateName = stateNames[event.state] || event.state;

        // Get buffer info to understand why it's buffering
        try {
          const position = await TrackPlayerService.getPosition();
          const duration = await TrackPlayerService.getDuration();
          console.log(
            `[TrackPlayer] State: ${stateName} | Position: ${position.toFixed(
              1
            )}s / ${duration.toFixed(1)}s`
          );
        } catch (e) {
          console.log(`[TrackPlayer] State changed: ${stateName}`);
        }
      }
    }
  );

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
        seekTo: handleSeekTo,
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
