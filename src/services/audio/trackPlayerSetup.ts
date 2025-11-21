import { Event } from 'react-native-track-player';
import { TrackPlayerService } from './TrackPlayerService';

/**
 * Setup track player event handlers
 * This is called from the playback service
 */
export async function setupTrackPlayer() {
  await TrackPlayerService.setup();
}

/**
 * Playback service that handles remote events (lock screen controls)
 * This runs in a separate context from the main app
 */
export async function PlaybackService() {
  TrackPlayerService.addEventListener(Event.RemotePlay, async () => {
    try {
      await TrackPlayerService.play();
    } catch (error) {
      console.error('RemotePlay error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemotePause, async () => {
    try {
      await TrackPlayerService.pause();
    } catch (error) {
      console.error('RemotePause error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemoteNext, async () => {
    try {
      await TrackPlayerService.skipToNext();
    } catch (error) {
      console.error('RemoteNext error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemotePrevious, async () => {
    try {
      await TrackPlayerService.skipToPrevious();
    } catch (error) {
      console.error('RemotePrevious error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemoteSeek, async (data: { position: number }) => {
    try {
      await TrackPlayerService.seekTo(data.position);
    } catch (error) {
      console.error('RemoteSeek error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemoteJumpForward, async (data: { interval: number }) => {
    try {
      const position = await TrackPlayerService.getPosition();
      const duration = await TrackPlayerService.getDuration();
      const newPosition = Math.min(position + data.interval, duration);
      await TrackPlayerService.seekTo(newPosition);
    } catch (error) {
      console.error('RemoteJumpForward error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemoteJumpBackward, async (data: { interval: number }) => {
    try {
      const position = await TrackPlayerService.getPosition();
      const newPosition = Math.max(position - data.interval, 0);
      await TrackPlayerService.seekTo(newPosition);
    } catch (error) {
      console.error('RemoteJumpBackward error:', error);
    }
  });

  TrackPlayerService.addEventListener(Event.RemoteStop, async () => {
    try {
      await TrackPlayerService.stop();
    } catch (error) {
      console.error('RemoteStop error:', error);
    }
  });

  // Handle audio interruptions (phone calls, etc.)
  TrackPlayerService.addEventListener(Event.RemoteDuck, async (event: { paused?: boolean; permanent?: boolean }) => {
    try {
      if (event.paused) {
        await TrackPlayerService.pause();
      } else if (event.permanent) {
        await TrackPlayerService.stop();
      } else {
        await TrackPlayerService.play();
      }
    } catch (error) {
      console.error('RemoteDuck error:', error);
    }
  });
}
