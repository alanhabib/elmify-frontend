import React from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRecentLectures } from '@/queries/hooks/playback';
import { useLecturePlayer } from '@/hooks/useLecturePlayer';
import type { PlaybackPositionWithLectureResponse } from '@/api/types';

type LectureCardProps = {
  position: PlaybackPositionWithLectureResponse;
  onCardClick: () => void;
};

const LectureCard = ({ position, onCardClick }: LectureCardProps) => {
  const { lecture, progress, lastUpdated } = position;

  // Calculate time since last played
  const getTimeSinceLastPlayed = (timestamp: string) => {
    const now = new Date();
    const lastPlayed = new Date(timestamp);
    const diffMs = now.getTime() - lastPlayed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <View className="w-36 mr-4">
      <Pressable onPress={onCardClick} className="touch-feedback">
        {/* Lecture Cover */}
        <View className="relative mb-3">
          <Image
            source={{ uri: lecture.thumbnailUrl || undefined }}
            className="w-full h-48 rounded-lg bg-card"
            resizeMode="cover"
          />

          {/* Progress Bar */}
          {progress > 0 && (
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <View
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </View>
          )}
        </View>

        {/* Lecture Info */}
        <View className="px-1">
          <Text
            className="text-foreground font-semibold text-sm mb-1"
            numberOfLines={2}
          >
            {lecture.title}
          </Text>
          <Text
            className="text-muted-foreground text-xs mb-1"
            numberOfLines={1}
          >
            {lecture.speakerName || 'Unknown Speaker'}
          </Text>
          <Text
            className="text-muted-foreground text-xs"
            numberOfLines={1}
          >
            {getTimeSinceLastPlayed(lastUpdated)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export const RecentLectures = () => {
  const playLecture = useLecturePlayer();
  const { data: recentLectures = [], isLoading, error } = useRecentLectures({ limit: 4 });

  const handleCardClick = (position: PlaybackPositionWithLectureResponse) => {
    playLecture({
      id: position.lecture.id.toString(),
      title: position.lecture.title,
      speaker: position.lecture.speakerName || 'Unknown Speaker',
      author: position.lecture.speakerName || 'Unknown Speaker',
      thumbnail_url: position.lecture.thumbnailUrl,
    });
  };

  if (isLoading) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-xl font-semibold text-foreground">Latest Lectures</Text>
          <Pressable className="touch-feedback">
            <Text className="text-primary text-sm font-medium">See All</Text>
          </Pressable>
        </View>
        <View className="items-center py-8">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-xl font-semibold text-foreground">Latest Lectures</Text>
        </View>
        <View className="items-center py-8">
          <Text className="text-destructive text-center">
            Error loading latest lectures
          </Text>
        </View>
      </View>
    );
  }

  // Empty state - no recent lectures
  if (recentLectures.length === 0) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-xl font-semibold text-foreground">Latest Lectures</Text>
        </View>
        <View className="items-center py-8">
          <Text className="text-muted-foreground text-center">
            No recent lectures yet. Start listening to build your history!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xl font-semibold text-foreground">Latest Lectures</Text>
        <Pressable className="touch-feedback">
          <Text className="text-primary text-sm font-medium">See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 20 }}
        className="overflow-visible"
      >
        {recentLectures.map((position) => (
          <LectureCard
            key={position.lectureId}
            position={position}
            onCardClick={() => handleCardClick(position)}
          />
        ))}
      </ScrollView>
    </View>
  );
};