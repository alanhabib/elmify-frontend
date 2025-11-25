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
import TrackPlayer, { Event, State, useTrackPlayerEvents } from "react-native-track-player";
import { TrackPlayerService } from "@/services/audio/TrackPlayerService";
import { playlistService } from "@/services/audio/PlaylistService";
import { UILecture } from "@/types/ui";
import * as FileSystem from "expo-file-system";
import {
  usePlaybackPosition,
  useUpdatePosition,
} from "@/queries/hooks/playback";
import { useTrackListening } from "@/queries/hooks/stats";
import { useTrackPlayer } from "@/hooks/useTrackPlayer";
import { useAuth } from "@clerk/clerk-expo";

// Constants
const PREFETCH_AHEAD_COUNT = 3;
const PREFETCH_BEHIND_COUNT = 2;
const PREFETCH_DELAY_MS = 500;  // Increased to avoid rate limiting
const LAZY_FETCH_DELAY_MS = 500; // Increased to avoid rate limiting
const TRACKS_AHEAD_THRESHOLD = 2; // Reduced to minimize API calls
const POSITION_SYNC_INTERVAL_MS = 30000;
const POSITION_SAVE_THRESHOLD_MS = 1000;

type RepeatMode = "off" | "one" | "all";

type PlayerContextType = {
  lecture: UILecture | null;
  setLecture: (lecture: UILecture | null) => void;
  isLoading: boolean;
  loadingProgress: { current: number; total: number } | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  queue: UILecture[];
  addToQueue: (collectionId: string, lectures: UILecture[], startIndex?: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
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
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);
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
  const savePosition = useCallback((positionMs: number) => {
    // Skip saving for guest users
    if (!isSignedIn) return;
    if (!lecture || positionMs === lastSavedPosition.current) return;

    if (
      positionMs > 0 &&
      Math.abs(positionMs - lastSavedPosition.current) > POSITION_SAVE_THRESHOLD_MS
    ) {
      lastSavedPosition.current = positionMs;
      updatePositionMutation.mutate({
        lectureId: lecture.id.toString(),
        currentPosition: positionMs,
      });
    }
  }, [isSignedIn, lecture, updatePositionMutation]);

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
    }, POSITION_SYNC_INTERVAL_MS);

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
          playTimeSeconds: POSITION_SYNC_INTERVAL_MS / 1000,
        });
      }
    }, POSITION_SYNC_INTERVAL_MS);

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

  // Queue management - uses PlaylistService for batch URL fetching
  const queueRef = useRef<UILecture[]>([]);
  const collectionIdRef = useRef<string | null>(null);

  // Helper to get URL for a single lecture (checks local file first)
  const getUrlForLecture = useCallback(async (lecture: UILecture): Promise<string> => {
    // Check for local file first
    try {
      const file = `${FileSystem.documentDirectory}${lecture.id}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(file, { size: false });
      if (fileInfo.exists) {
        return file;
      }
    } catch {
      // No local file
    }

    // Use PlaylistService for cached URL or fresh fetch
    return playlistService.getUrl(lecture);
  }, []);

  const addToQueue = useCallback(async (
    collectionId: string,
    lectures: UILecture[],
    startIndex: number = 0
  ) => {
    console.log(`📋 addToQueue: ${lectures.length} tracks, collection ${collectionId}, starting at ${startIndex}`);

    setIsLoading(true);
    setError(null);

    try {
      // Store collection ID and lectures
      collectionIdRef.current = collectionId;
      setQueue(lectures);
      queueRef.current = lectures;

      // Fetch ALL URLs using PlaylistService (with progress callback)
      console.log("🌐 Fetching all track URLs...");
      const startTime = Date.now();

      const urlMap = await playlistService.getPlaylistUrls(
        collectionId,
        lectures,
        (current, total) => {
          setLoadingProgress({ current, total });
        }
      );

      const fetchTime = Date.now() - startTime;
      console.log(`✅ Fetched ${urlMap.size}/${lectures.length} URLs in ${fetchTime}ms`);

      // Convert to native TrackPlayer format
      const nativeTracks = lectures
        .filter(lecture => urlMap.has(lecture.id)) // Only include lectures with valid URLs
        .map(lecture => ({
          id: lecture.id,
          url: urlMap.get(lecture.id)!,
          title: lecture.title,
          artist: lecture.author || lecture.speaker,
          artwork: lecture.thumbnail_url,
          duration: 0,
        }));

      if (nativeTracks.length === 0) {
        throw new Error("No valid track URLs available");
      }

      // Load ENTIRE queue into TrackPlayer
      console.log("📋 Loading native queue...");
      await TrackPlayer.reset();
      await TrackPlayer.add(nativeTracks);

      // Skip to selected track and play
      if (startIndex > 0 && startIndex < nativeTracks.length) {
        await TrackPlayer.skip(startIndex);
      }
      await TrackPlayer.play();

      // Update state
      const selectedLecture = lectures[startIndex];
      setLecture(selectedLecture);
      currentLectureId.current = selectedLecture.id;
      setTrackLoadedId(selectedLecture.id);
      hasSeekingToSavedPosition.current = null;

      setIsLoading(false);
      setLoadingProgress(null);

      console.log(`✅ Queue loaded: ${nativeTracks.length} tracks, playing index ${startIndex}`);
    } catch (error) {
      console.error("❌ Failed to load queue:", error);
      setError(error instanceof Error ? error.message : "Failed to load playlist");
      setIsLoading(false);
      setLoadingProgress(null);
    }
  }, []);

  // Use native TrackPlayer skip functions
  const playNext = useCallback(async () => {
    try {
      const nativeQueue = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getActiveTrackIndex();

      console.log("⏭️ playNext - currentIndex:", currentIndex, "queueLength:", nativeQueue.length);

      if (currentIndex === undefined || currentIndex === null) {
        console.log("⏭️ No active track");
        return;
      }

      if (currentIndex < nativeQueue.length - 1) {
        console.log("⏭️ Skipping to next track");
        await TrackPlayer.skipToNext();
      } else if (repeatMode === "all") {
        console.log("🔁 Repeating queue from start");
        await TrackPlayer.skip(0);
      } else {
        console.log("⏭️ End of queue reached");
      }
    } catch (error) {
      console.error("❌ Error in playNext:", error);
    }
  }, [repeatMode]);

  const playPrevious = useCallback(async () => {
    try {
      const nativeQueue = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getActiveTrackIndex();

      console.log("⏮️ playPrevious - currentIndex:", currentIndex);

      if (currentIndex === undefined || currentIndex === null) {
        console.log("⏮️ No active track");
        return;
      }

      if (currentIndex > 0) {
        console.log("⏮️ Skipping to previous track");
        await TrackPlayer.skipToPrevious();
      } else if (repeatMode === "all") {
        console.log("🔁 Repeating queue from end");
        await TrackPlayer.skip(nativeQueue.length - 1);
      } else {
        console.log("⏮️ Beginning of queue reached");
      }
    } catch (error) {
      console.error("❌ Error in playPrevious:", error);
    }
  }, [repeatMode]);

  // Sync React state when native track changes
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type !== Event.PlaybackActiveTrackChanged || !event.track) return;

    const trackId = event.track.id;
    console.log("🎵 Track changed to:", trackId, event.track.title);

    // Find lecture in queue and update state
    const lecture = queueRef.current.find(l => l.id === trackId);
    if (lecture) {
      setLecture(lecture);
      currentLectureId.current = lecture.id;
      setTrackLoadedId(lecture.id);
      hasSeekingToSavedPosition.current = null;
    }
  });

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
        loadingProgress,
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
