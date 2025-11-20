import { useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";

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
  const [isDragging, setIsDragging] = useState(false);
  const dragProgress = useSharedValue(0);

  // Safely calculate progress, preventing NaN or Infinity
  const progress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (percentage: number) => {
    const seekToSeconds = Math.min(Math.max(duration * percentage, 0), duration);
    onSeek(seekToSeconds);
  };

  const setDragging = (value: boolean) => {
    setIsDragging(value);
  };

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      runOnJS(setDragging)(true);
      const percentage = Math.min(Math.max(event.x / width, 0), 1);
      dragProgress.value = percentage;
    })
    .onUpdate((event) => {
      const percentage = Math.min(Math.max(event.x / width, 0), 1);
      dragProgress.value = percentage;
    })
    .onEnd((event) => {
      const percentage = Math.min(Math.max(event.x / width, 0), 1);
      runOnJS(handleSeek)(percentage);
      runOnJS(setDragging)(false);
    })
    .onFinalize(() => {
      runOnJS(setDragging)(false);
    });

  // Tap gesture for quick seeks
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const percentage = Math.min(Math.max(event.x / width, 0), 1);
      runOnJS(handleSeek)(percentage);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  // Calculate display progress - use drag value while dragging
  const displayProgress = isDragging ? dragProgress.value : progress;
  const displayTime = duration * displayProgress;

  return (
    <View className="gap-3">
      <GestureDetector gesture={composedGesture}>
        <View
          onLayout={onLayout}
          className="w-full h-10 justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* Track background */}
          <View className="w-full bg-muted h-1.5 rounded-full">
            {/* Filled progress */}
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${(isDragging ? dragProgress.value : progress) * 100}%` }}
            />
          </View>
          {/* Handle */}
          <View
            className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary"
            style={{
              left: `${(isDragging ? dragProgress.value : progress) * 100}%`,
              shadowColor: '#a855f7',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        </View>
      </GestureDetector>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm">
          {isDragging ? formatTime(displayTime) : formatTime(currentTime)}
        </Text>
        <Text className="text-muted-foreground text-sm">{formatTime(duration)}</Text>
      </View>
    </View>
  );
}
