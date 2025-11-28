import "expo-router/entry";
import { registerRootComponent } from "expo";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/services/audio/trackPlayerSetup";
import Index from "./src/app/index";

// Register the playback service for background audio
// IMPORTANT: Pass the function reference, don't call it with ()
// TrackPlayer will call this function in a headless JS context
registerRootComponent(Index);
TrackPlayer.registerPlaybackService(() => PlaybackService);
