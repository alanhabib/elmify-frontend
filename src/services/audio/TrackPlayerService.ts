import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode as TPRepeatMode,
  State,
  Track,
} from "react-native-track-player";
import { UILecture } from "@/types/ui";

export type RepeatMode = "off" | "one" | "all";

/**
 * Service to abstract react-native-track-player
 * Follows separation of concerns by isolating track player logic
 */
export class TrackPlayerService {
  private static isSetup = false;
  private static setupPromise: Promise<void> | null = null;

  /**
   * Ensure TrackPlayer is initialized before use
   * Call this before any TrackPlayer operations
   */
  private static async ensureInitialized(): Promise<void> {
    if (this.isSetup) {
      return;
    }
    await this.setup();
  }

  /**
   * Setup track player with capabilities
   */
  static async setup(): Promise<void> {
    // If already setup, return immediately
    if (this.isSetup) {
      return;
    }

    // If setup is in progress, wait for it to complete
    if (this.setupPromise) {
      return this.setupPromise;
    }

    // Create setup promise to prevent concurrent setup calls
    this.setupPromise = (async () => {
      try {
        // Use default iOS AVPlayer settings - let iOS handle buffering automatically
        // This matches Safari's behavior which plays smoothly
        const bufferConfig = {
        autoUpdateMetadata: true,
        autoHandleInterruptions: true,
        // Optimized buffer configuration for fast start + smooth streaming
        minBuffer: 10, // Reduced from 15 - faster start
        maxBuffer: 50, // Maximum buffer (prevents excessive memory usage)
        playBuffer: 1.0, // Reduced from 2.5 - much faster initial playback
        backBuffer: 0, // No back buffer (reduces memory usage)
        maxCacheSize: 50000, // 50MB cache (balanced for streaming)
      };

      await TrackPlayer.setupPlayer(bufferConfig);
      try {
        // This is needed for iOS to recognize the app as an active audio app
        await TrackPlayer.setVolume(1.0);
      } catch (error) {
        console.error(
          "🎵 [TrackPlayerService] ⚠️ Could not activate audio session:",
          error
        );
      }

      await TrackPlayer.reset();
      const options = {
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          // Pause playback when audio focus is lost (phone calls, other audio)
          alwaysPauseOnInterruption: true,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
          Capability.JumpForward,
          Capability.JumpBackward,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        // Jump intervals in seconds
        forwardJumpInterval: 15,
        backwardJumpInterval: 15,
        // Update progress every 2 seconds to reduce overhead
        progressUpdateEventInterval: 2,
      };

        await TrackPlayer.updateOptions(options);
        this.isSetup = true;
      } catch (error) {
        console.error(
          "🎵 [TrackPlayerService] ❌❌❌ CRITICAL ERROR during setup:"
        );
        console.error("🎵 [TrackPlayerService] Error:", error);
        this.setupPromise = null; // Reset on error so retry is possible
        throw error;
      } finally {
        this.setupPromise = null; // Clear promise when done
      }
    })();

    return this.setupPromise;
  }

  /**
   * Convert UILecture to Track format
   */
  static lectureToTrack(lecture: UILecture): Track {
    return {
      id: lecture.id,
      url: lecture.audio_url,
      title: lecture.title,
      artist: lecture.author || lecture.speaker,
      artwork: lecture.thumbnail_url,
      duration: 0, // Will be set when loaded
      // Use low-quality pitch algorithm for better performance
      // Prevents CPU-intensive processing that can cause audio dropouts
      pitchAlgorithm: "lowQuality",
      isLiveStream: false,
      // Additional headers for better R2 compatibility
      headers: {
        "User-Agent": "Elmify/1.0",
      },
    };
  }

  /**
   * Load and play a lecture
   */
  static async loadAndPlay(
    lecture: UILecture,
    startPosition?: number
  ): Promise<void> {
    await this.ensureInitialized();
    const track = this.lectureToTrack(lecture);

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(track);

      // Seek to saved position BEFORE playing to avoid hearing the beginning
      if (startPosition && startPosition > 0) {
        await TrackPlayer.seekTo(startPosition);
      }

      await TrackPlayer.play();
    } catch (error) {
      console.error("[TrackPlayer] Error in loadAndPlay:", error);
      throw error; // Re-throw so caller can handle
    }
  }

  /**
   * Play current track
   */
  static async play(): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.play();
  }

  /**
   * Pause current track
   */
  static async pause(): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.pause();
  }

  /**
   * Stop and reset player
   */
  static async stop(): Promise<void> {
    await this.ensureInitialized();
    try {
      await TrackPlayer.reset();
    } catch (error) {
      console.error("[TrackPlayer] Error in stop:", error);
      // Don't throw - stop should be safe to call anytime
    }
  }

  /**
   * Seek to position in seconds
   */
  static async seekTo(seconds: number): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.seekTo(seconds);
  }

  /**
   * Set playback speed
   */
  static async setRate(rate: number): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.setRate(rate);
  }

  /**
   * Add tracks to queue
   */
  static async addToQueue(lectures: UILecture[]): Promise<void> {
    await this.ensureInitialized();
    const tracks = lectures.map(this.lectureToTrack);
    await TrackPlayer.add(tracks);
  }

  /**
   * Skip to next track
   */
  static async skipToNext(): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.skipToNext();
  }

  /**
   * Skip to previous track
   */
  static async skipToPrevious(): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.skipToPrevious();
  }

  /**
   * Set repeat mode
   */
  static async setRepeatMode(mode: RepeatMode): Promise<void> {
    await this.ensureInitialized();
    const tpMode = {
      off: TPRepeatMode.Off,
      one: TPRepeatMode.Track,
      all: TPRepeatMode.Queue,
    }[mode];

    await TrackPlayer.setRepeatMode(tpMode);
  }

  /**
   * Get current position in seconds
   */
  static async getPosition(): Promise<number> {
    await this.ensureInitialized();
    return await TrackPlayer.getPosition();
  }

  /**
   * Get duration in seconds
   */
  static async getDuration(): Promise<number> {
    await this.ensureInitialized();
    return await TrackPlayer.getDuration();
  }

  /**
   * Get current state
   */
  static async getState(): Promise<State> {
    await this.ensureInitialized();
    return await TrackPlayer.getState();
  }

  /**
   * Check if playing
   */
  static async isPlaying(): Promise<boolean> {
    await this.ensureInitialized();
    const state = await this.getState();
    return state === State.Playing || state === State.Buffering;
  }

  /**
   * Update now playing metadata
   */
  static async updateNowPlaying(lecture: UILecture): Promise<void> {
    await this.ensureInitialized();
    const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
    if (activeTrackIndex === undefined) return;

    await TrackPlayer.updateMetadataForTrack(activeTrackIndex, {
      title: lecture.title,
      artist: lecture.author || lecture.speaker,
      artwork: lecture.thumbnail_url,
    });
  }

  /**
   * Get events enum for event listeners
   */
  static get Events() {
    return Event;
  }

  /**
   * Add event listener
   */
  static addEventListener(event: Event, handler: (data: any) => void) {
    return TrackPlayer.addEventListener(event, handler);
  }

  /**
   * Setup diagnostic listeners for buffering issues
   * Call this during app initialization to monitor playback health
   */
  static setupDiagnosticListeners(): void {
    // Monitor when playback is waiting (buffering)
    TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error("[TrackPlayer] Playback error:", error);
    });
  }

  /**
   * Destroy player
   */
  static async destroy(): Promise<void> {
    await this.ensureInitialized();
    await TrackPlayer.stop();
    this.isSetup = false;
  }
}
