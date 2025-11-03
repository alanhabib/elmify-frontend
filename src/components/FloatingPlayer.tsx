import { Text, View, Image, Pressable, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { usePlayer } from "@/providers/PlayerProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

export default function FloatingPlayer() {
  const { lecture, isLoading, isPlaying, currentTime, duration, play, pause } = usePlayer();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(true);

  // Default tab bar height (standard across platforms)
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56;

  // Handle player screen visibility with delay for animation
  useEffect(() => {
    if (pathname === '/player') {
      // Immediately hide when navigating to player
      setShouldShow(false);
    } else {
      // Delay showing when leaving player screen to wait for dismissal animation
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 300); // Match the fade_from_bottom animation duration
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Don't show if no lecture is loaded
  if (!lecture) return null;

  // Don't show if we shouldn't show (player screen or during animation)
  if (!shouldShow) return null;

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: tabBarHeight, // Safe positioning above tab bar
        left: insets.left + 10, // Safe area + smaller margin
        right: insets.right + 10, // Safe area + smaller margin
        zIndex: 1000,
      }}
    >
      <View
        className="bg-card border border-border shadow-lg"
        style={{
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8, // Android shadow
        }}
      >
        {/* Progress Bar at the top */}
        <View className="h-1 bg-muted rounded-t-xl overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Player Content */}
        <View className="flex-row gap-3 items-center p-3">
          <Link href="/player" asChild>
            <Pressable className="flex-row gap-3 items-center flex-1">
              <Image
                source={{ uri: lecture.thumbnail_url }}
                className="w-12 aspect-square rounded-lg"
              />
              <View className="gap-1 flex-1">
                <Text
                  className="text-foreground font-semibold text-sm"
                  numberOfLines={1}
                >
                  {lecture.title}
                </Text>
                <Text
                  className="text-muted-foreground text-xs"
                  numberOfLines={1}
                >
                  {lecture.author || lecture.speaker || 'Unknown Speaker'}
                </Text>
              </View>
            </Pressable>
          </Link>

          <Pressable
            onPress={() => isPlaying ? pause() : play()}
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
      </View>
    </View>
  );
}
