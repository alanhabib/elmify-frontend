import React, { useState } from "react";
import { Text, View, Image, Pressable } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useLecturePlayer } from "@/hooks/useLecturePlayer";
import { HighlightedText } from "@/components/ui/HighlightedText";

type Book = {
  id: string;
  title: string;
  author: string;
  audio_url: string;
  thumbnail_url?: string;
};

type DiscoveryBookListItemProps = {
  book: Book;
  onPress: () => void;
  searchQuery?: string;
  showPlayButton?: boolean;
};

export default function DiscoveryBookListItem({
  book,
  onPress,
  searchQuery = "",
  showPlayButton = false,
}: DiscoveryBookListItemProps) {
  const playLecture = useLecturePlayer();
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    playLecture({
      id: book.id,
      title: book.title,
      speaker: book.author,
      author: book.author,
      thumbnail_url: book.thumbnail_url,
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress} className="flex-row gap-4 items-center">
      <View className="relative w-16 aspect-square">
        {book.thumbnail_url && !imageError ? (
          <Image
            source={{ uri: book.thumbnail_url }}
            className="w-16 aspect-square rounded-md"
            onLoad={() => {
              setImageError(false);
            }}
            onError={(error) => {
              setImageError(true);
            }}
          />
        ) : (
          <View className="w-16 aspect-square bg-muted rounded-md items-center justify-center">
            <AntDesign name="book" size={24} color="#6b7280" />
          </View>
        )}
      </View>

      <View className="gap-1 flex-1">
        <HighlightedText
          text={book.title}
          searchQuery={searchQuery}
          className="text-2xl text-foreground font-bold"
          numberOfLines={2}
        />
        <HighlightedText
          text={book.author}
          searchQuery={searchQuery}
          className="text-muted-foreground"
          numberOfLines={1}
        />
      </View>

      {showPlayButton ? (
        <AntDesign
          onPress={handlePress}
          name="playcircleo"
          size={24}
          color="gainsboro"
        />
      ) : (
        <AntDesign
          onPress={() => {}} // TODO: Implement when favorites are enabled
          name="plus"
          size={24}
          color="gainsboro"
        />
      )}
    </Pressable>
  );
}
