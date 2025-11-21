import TrackPlayer, { Event } from 'react-native-track-player';
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
 *
 * IMPORTANT: This runs in an isolated headless JavaScript context, separate from the main app.
 * We must use TrackPlayer directly here, not TrackPlayerService, because custom wrapper
 * classes don't share state with the headless context.
 */
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

  TrackPlayer.addEventListener(Event.RemoteSeek, (data) => TrackPlayer.seekTo(data.position));

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (data) => {
    const position = await TrackPlayer.getPosition();
    const duration = await TrackPlayer.getDuration();
    await TrackPlayer.seekTo(Math.min(position + data.interval, duration));
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (data) => {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(position - data.interval, 0));
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());

  // Handle audio interruptions (phone calls, etc.)
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused) {
      await TrackPlayer.pause();
    } else if (event.permanent) {
      await TrackPlayer.reset();
    } else {
      await TrackPlayer.play();
    }
  });
}
