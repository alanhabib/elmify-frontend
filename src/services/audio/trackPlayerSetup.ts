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
  TrackPlayerService.addEventListener(Event.RemotePlay, () => {
    TrackPlayerService.play();
  });

  TrackPlayerService.addEventListener(Event.RemotePause, () => {
    TrackPlayerService.pause();
  });

  TrackPlayerService.addEventListener(Event.RemoteNext, () => {
    TrackPlayerService.skipToNext();
  });

  TrackPlayerService.addEventListener(Event.RemotePrevious, () => {
    TrackPlayerService.skipToPrevious();
  });

  TrackPlayerService.addEventListener(Event.RemoteSeek, (data: { position: number }) => {
    TrackPlayerService.seekTo(data.position);
  });

  TrackPlayerService.addEventListener(Event.RemoteStop, () => {
    TrackPlayerService.stop();
  });
}
