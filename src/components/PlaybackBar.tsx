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
    <View className="gap-3">
      <Pressable
        onPress={onHandleSeek}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        className="w-full bg-muted h-1.5 rounded-full justify-center"
        hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
      >
        <View
          className="bg-primary h-full rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Larger, more tactile seek handle */}
        <View
          className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary shadow-lg"
          style={{
            left: `${progress * 100}%`,
            shadowColor: '#a855f7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </Pressable>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm">{formatTime(currentTime)}</Text>
        <Text className="text-muted-foreground text-sm">{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
