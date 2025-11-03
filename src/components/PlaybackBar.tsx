import { useState } from "react";
import { View, Text, Pressable, GestureResponderEvent } from "react-native";

type PlaybackBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
};

export default function PlaybackBar({
  currentTime,
  duration,
  onSeek,
}: PlaybackBarProps) {
  const [width, setWidth] = useState(0);

  // Safely calculate progress, preventing NaN or Infinity
  const progress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const onHandleSeek = (event: GestureResponderEvent) => {
    const pressX = event.nativeEvent.locationX;

    const percentage = pressX / width;
    const seekToSeconds = Math.min(
      Math.max(duration * percentage, 0),
      duration
    );

    onSeek(seekToSeconds);
  };

  return (
    <View className="gap-4">
      <Pressable
        onPress={onHandleSeek}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        className="w-full bg-slate-900 h-2 rounded-full justify-center"
        hitSlop={20}
      >
        <View
          className="bg-orange-400 h-full rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <View
          className="absolute w-3 h-3 -translate-x-1/2 rounded-full bg-orange-400"
          style={{ left: `${progress * 100}%` }}
        />
      </Pressable>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-400">{formatTime(currentTime)}</Text>
        <Text className="text-gray-400">{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
