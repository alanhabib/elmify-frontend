import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode as TPRepeatMode,
  State,
  Track,
} from 'react-native-track-player';
import { UILecture } from '@/types/ui';

export type RepeatMode = 'off' | 'one' | 'all';

/**
 * Service to abstract react-native-track-player
 * Follows separation of concerns by isolating track player logic
 */
export class TrackPlayerService {
  private static isSetup = false;

  /**
   * Setup track player with capabilities
   */
  static async setup(): Promise<void> {
    if (this.isSetup) return;

    try {
      await TrackPlayer.setupPlayer({
        autoUpdateMetadata: true,
        autoHandleInterruptions: true,
      });

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1,
      });

      this.isSetup = true;
    } catch (error) {
      console.error('Failed to setup track player:', error);
      throw error;
    }
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
    };
  }

  /**
   * Load and play a lecture
   */
  static async loadAndPlay(lecture: UILecture, startPosition?: number): Promise<void> {
    const track = this.lectureToTrack(lecture);

    await TrackPlayer.reset();
    await TrackPlayer.add(track);

    if (startPosition && startPosition > 0) {
      await TrackPlayer.seekTo(startPosition);
    }

    await TrackPlayer.play();
  }

  /**
   * Play current track
   */
  static async play(): Promise<void> {
    await TrackPlayer.play();
  }

  /**
   * Pause current track
   */
  static async pause(): Promise<void> {
    await TrackPlayer.pause();
  }

  /**
   * Stop and reset player
   */
  static async stop(): Promise<void> {
    await TrackPlayer.reset();
  }

  /**
   * Seek to position in seconds
   */
  static async seekTo(seconds: number): Promise<void> {
    await TrackPlayer.seekTo(seconds);
  }

  /**
   * Set playback speed
   */
  static async setRate(rate: number): Promise<void> {
    await TrackPlayer.setRate(rate);
  }

  /**
   * Add tracks to queue
   */
  static async addToQueue(lectures: UILecture[]): Promise<void> {
    const tracks = lectures.map(this.lectureToTrack);
    await TrackPlayer.add(tracks);
  }

  /**
   * Skip to next track
   */
  static async skipToNext(): Promise<void> {
    await TrackPlayer.skipToNext();
  }

  /**
   * Skip to previous track
   */
  static async skipToPrevious(): Promise<void> {
    await TrackPlayer.skipToPrevious();
  }

  /**
   * Set repeat mode
   */
  static async setRepeatMode(mode: RepeatMode): Promise<void> {
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
    return await TrackPlayer.getPosition();
  }

  /**
   * Get duration in seconds
   */
  static async getDuration(): Promise<number> {
    return await TrackPlayer.getDuration();
  }

  /**
   * Get current state
   */
  static async getState(): Promise<State> {
    return await TrackPlayer.getState();
  }

  /**
   * Check if playing
   */
  static async isPlaying(): Promise<boolean> {
    const state = await this.getState();
    return state === State.Playing || state === State.Buffering;
  }

  /**
   * Update now playing metadata
   */
  static async updateNowPlaying(lecture: UILecture): Promise<void> {
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
   * Destroy player
   */
  static async destroy(): Promise<void> {
    await TrackPlayer.destroy();
    this.isSetup = false;
  }
}
