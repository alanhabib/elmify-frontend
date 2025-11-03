import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { usePlayer } from "@/providers/PlayerProvider";
import { useTrendingLectures } from "@/queries/hooks/lectures";

type Book = {
  id: string;
  title: string;
  author: string;
  audio_url: string;
  thumbnail_url?: string;
};

type BookCardProps = {
  book: Book;
  onCardClick: () => void;
  index: number;
};

const BookCard = ({ book, onCardClick, index }: BookCardProps) => {
  const isFirst = index === 0;

  return (
    <View className="w-36" style={{ marginRight: 80 }}>
      <Pressable onPress={onCardClick} className="touch-feedback">
        {/* Book Cover with number on left side */}
        <View className="relative mb-3">
          <View
            className="absolute z-0"
            style={{
              left: isFirst ? -60 : -70,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 140,
                fontWeight: '900',
                fontFamily: 'Oswald',
                letterSpacing: -5,
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {index + 1}
            </Text>
          </View>
          <Image
            source={{ uri: book.thumbnail_url }}
            className="w-full h-48 rounded-lg bg-card"
            resizeMode="cover"
            style={{
              position: 'relative',
              zIndex: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 10,
            }}
          />
        </View>

        {/* Book Info */}
        <View className="px-1">
          <Text
            className="text-foreground font-semibold text-sm mb-1"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {book.author}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export const TrendingLectures = () => {
  const router = useRouter();

  // Fetch top 9 trending lectures from backend (ordered by popularity)
  const {
    data: allTrendingLectures = [],
    isLoading,
    error,
  } = useTrendingLectures({ limit: 9 });

  // Transform lectures to Book format
  const trendingBooks = useMemo(() => {
    if (!allTrendingLectures || allTrendingLectures.length === 0) {
      return [];
    }

    return allTrendingLectures.map((lecture) => ({
      id: lecture.id.toString(),
      title: lecture.title || 'Untitled',
      author: lecture.speakerName || 'Unknown Speaker',
      audio_url: lecture.filePath || '',
      thumbnail_url: lecture.thumbnailUrl || 'https://via.placeholder.com/300x400?text=No+Image',
    }));
  }, [allTrendingLectures]);

  const handleCardClick = (book: Book) => {
    // Navigate to lecture screen
    router.push(`/lecture/${book.id}`);
  };

  if (isLoading) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-2xl font-bold text-foreground">Most Popular</Text>
          <Pressable className="touch-feedback">
            <Text className="text-primary text-sm font-medium">See All</Text>
          </Pressable>
        </View>
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  if (error || !trendingBooks || trendingBooks.length === 0) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-2xl font-bold text-foreground">Most Popular</Text>
          <Pressable className="touch-feedback">
            <Text className="text-primary text-sm font-medium">See All</Text>
          </Pressable>
        </View>
        <View className="items-center py-8">
          <Text className="text-muted-foreground text-center">
            {error ? 'Error loading popular lectures' : 'No popular lectures available'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between px-1 mb-2">
        <Text className="text-2xl font-bold text-foreground">Most Popular</Text>
        <Pressable className="touch-feedback">
          <Text className="text-primary text-sm font-medium">See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 90, paddingRight: 20 }}
        className="overflow-visible"
      >
        {trendingBooks.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            index={index}
            onCardClick={() => handleCardClick(book)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
