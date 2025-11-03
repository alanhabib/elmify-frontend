import { useState } from 'react';
import { AudioPlayer } from 'expo-audio';

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

/**
 * Custom hook to manage playback speed cycling
 */
export function usePlaybackSpeed(player: AudioPlayer) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    player.setPlaybackRate(newSpeed);
  };

  return {
    playbackSpeed,
    cyclePlaybackSpeed,
    speeds: PLAYBACK_SPEEDS,
  };
}
