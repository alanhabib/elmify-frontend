import React from 'react';
import { View, Text, Image, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { LectureWithProgress } from '@/components/lectures/LectureListWithProgress';
import { DownloadButton } from '@/components/ui/DownloadButton';

interface LectureGridViewProps {
  lectures: LectureWithProgress[];
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
}

export const LectureGridView: React.FC<LectureGridViewProps> = ({
  lectures,
  emptyMessage = 'No lectures available',
  ListHeaderComponent,
}) => {
  const router = useRouter();

  const handleLecturePress = (id: number | string) => {
    router.push(`/lecture/${id}`);
  };

  const renderEmptyState = () => (
    <View className="py-12 items-center">
      <Ionicons name="musical-notes-outline" size={48} color="#9ca3af" />
      <Text className="text-muted-foreground mt-4">{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={lectures}
      numColumns={lectures.length === 0 ? 1 : 2}
      key={lectures.length === 0 ? 'empty' : 'grid'}
      columnWrapperStyle={lectures.length > 0 ? { gap: 12, paddingHorizontal: 16 } : undefined}
      contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyState}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handleLecturePress(item.id)}
          className="flex-1 active:opacity-70"
        >
          <View className="bg-card rounded-lg overflow-hidden">
            {/* Lecture Artwork */}
            <Image
              source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/300x300?text=No+Image' }}
              className="w-full aspect-square"
              resizeMode="cover"
            />

            {/* Lecture Info */}
            <View className="p-3">
              <Text
                className="text-foreground font-semibold text-sm mb-1"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center justify-between">
                {item.speakerName && (
                  <Text
                    className="text-muted-foreground text-xs flex-1"
                    numberOfLines={1}
                  >
                    {item.speakerName}
                  </Text>
                )}
                {/* Download Button */}
                <DownloadButton
                  lecture={{
                    id: item.id.toString(),
                    title: item.title,
                    author: item.speakerName || '',
                    audio_url: item.audio_url || '', // DownloadService will fetch presigned URL
                    thumbnail_url: item.thumbnailUrl,
                    duration: item.duration,
                  }}
                  size="small"
                  variant="icon"
                />
              </View>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
};
