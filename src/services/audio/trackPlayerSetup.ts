import TrackPlayer, { Event } from "react-native-track-player";

export async function PlaybackService() {
  try {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteNext, () =>
      TrackPlayer.skipToNext()
    );
    TrackPlayer.addEventListener(Event.RemotePrevious, () =>
      TrackPlayer.skipToPrevious()
    );
    TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
      await TrackPlayer.seekTo(position);
    });

    TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
      if (event.paused) {
        await TrackPlayer.pause();
      } else if (event.permanent) {
        await TrackPlayer.reset();
      } else {
        await TrackPlayer.play();
      }
    });
  } catch (error) {
    console.error("[PlaybackService] Error setting up event handlers:", error);
  }
}
