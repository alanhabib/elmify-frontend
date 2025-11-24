import TrackPlayer, { Event } from "react-native-track-player";
import { TrackPlayerService } from "./TrackPlayerService";

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
 *
 * This function is called by TrackPlayer when it needs to handle remote events.
 * It sets up event listeners that respond to lock screen controls.
 */
export async function PlaybackService() {
  console.log("[PlaybackService] Registering remote event handlers");

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log("[PlaybackService] RemotePlay event");
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log("[PlaybackService] RemotePause event");
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log("[PlaybackService] RemoteNext event");
    await TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log("[PlaybackService] RemotePrevious event");
    await TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => {
    console.log("[PlaybackService] RemoteSeek event:", data.position);
    await TrackPlayer.seekTo(data.position);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (data) => {
    console.log("[PlaybackService] RemoteJumpForward event");
    const position = await TrackPlayer.getPosition();
    const duration = await TrackPlayer.getDuration();
    await TrackPlayer.seekTo(Math.min(position + data.interval, duration));
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (data) => {
    console.log("[PlaybackService] RemoteJumpBackward event");
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(position - data.interval, 0));
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log("[PlaybackService] RemoteStop event");
    await TrackPlayer.reset();
  });

  // Handle audio interruptions (phone calls, etc.)
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    console.log("[PlaybackService] RemoteDuck event:", event);
    if (event.paused) {
      await TrackPlayer.pause();
    } else if (event.permanent) {
      await TrackPlayer.reset();
    } else {
      await TrackPlayer.play();
    }
  });

  console.log("[PlaybackService] All event handlers registered");
}
