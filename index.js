import "expo-router/entry";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/services/audio/trackPlayerSetup";

// Register the playback service for background audio
TrackPlayer.registerPlaybackService(() => PlaybackService());
