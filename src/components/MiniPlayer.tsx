import { View, Text, Image, Pressable, ActivityIndicator } from "react-native";
import { usePlayer } from "@/providers/PlayerProvider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MiniPlayer() {
  const { lecture, isPlaying, isLoading, currentTime, duration, play, pause } = usePlayer();
  const router = useRouter();

  // Don't render if no lecture is loaded
  if (!lecture) {
    return null;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const openFullPlayer = () => {
    router.push("/player");
  };

  return (
    <Pressable
      onPress={openFullPlayer}
      className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700"
      style={{ paddingBottom: 80 }} // Account for tab bar height
    >
      {/* Progress bar */}
      <View className="h-1 bg-gray-800">
        <View
          className="h-full bg-purple-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Player content */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        {/* Thumbnail */}
        <Image
          source={{ uri: lecture.thumbnail_url }}
          className="w-12 h-12 rounded-md"
        />

        {/* Lecture info */}
        <View className="flex-1">
          <Text className="text-white font-semibold" numberOfLines={1}>
            {lecture.title}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {lecture.speaker}
          </Text>
        </View>

        {/* Play/Pause button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={16}
              color="white"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}
