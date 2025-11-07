import React from "react";
import { Pressable, ActivityIndicator, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDownload } from "@/hooks/useDownload";
import { UILecture } from "@/types/ui";

interface DownloadButtonProps {
  lecture: UILecture;
  size?: "small" | "medium" | "large";
  variant?: "icon" | "icon-with-progress";
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  lecture,
  size = "medium",
  variant = "icon",
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const {
    isDownloaded,
    isDownloading,
    progress,
    error,
    startDownload,
    cancelDownload,
    deleteDownload,
  } = useDownload(lecture.id);

  // Size mappings
  const sizeMap = {
    small: { icon: 16, container: 32 },
    medium: { icon: 20, container: 40 },
    large: { icon: 24, container: 48 },
  };

  const { icon: iconSize, container: containerSize } = sizeMap[size];

  const handlePress = async (e: any) => {
    e?.stopPropagation?.();

    if (isDownloading) {
      await cancelDownload();
      return;
    }

    if (isDownloaded) {
      await deleteDownload();
      return;
    }

    // Start download
    onDownloadStart?.();
    const lectureData: UILecture = {
      id: lecture.id,
      title: lecture.title,
      author: lecture.author || lecture.speaker || "",
      audio_url: lecture.audio_url || lecture.filePath || "",
      thumbnail_url: lecture.thumbnail_url,
      duration: lecture.duration,
    };

    try {
      await startDownload(lectureData);
      onDownloadComplete?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Download failed";
      console.error("[DownloadButton] Download failed:", errorMsg, err);
      onDownloadError?.(errorMsg);
    }
  };

  // Render download progress with circular progress indicator
  if (isDownloading && variant === "icon-with-progress") {
    return (
      <Pressable onPress={handlePress}>
        <View
          style={{ width: containerSize, height: containerSize }}
          className="items-center justify-center relative"
        >
          {/* Background circle */}
          <View className="absolute inset-0 rounded-full border-2 border-muted" />

          {/* Progress circle - simplified as a visual indicator */}
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="small" color="#a855f7" />
          </View>

          {/* Progress percentage */}
          <Text
            className="text-xs text-foreground font-semibold"
            style={{ fontSize: 10 }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      </Pressable>
    );
  }

  // Simple icon variant
  return (
    <Pressable
      onPress={handlePress}
      style={{ width: containerSize, height: containerSize }}
      className="items-center justify-center active:opacity-70"
    >
      {isDownloading ? (
        <ActivityIndicator size="small" color="#a855f7" />
      ) : isDownloaded ? (
        <Ionicons name="checkmark-circle" size={iconSize} color="#10b981" />
      ) : (
        <Ionicons name="download-outline" size={iconSize} color="#a855f7" />
      )}
    </Pressable>
  );
};
