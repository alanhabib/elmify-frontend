import { Text, View, Image, Pressable } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useLecturePlayer } from "@/hooks/useLecturePlayer";
import React from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  audio_url: string;
  thumbnail_url?: string;
};

type BookListItemProps = {
  book: Book;
};

export default function BookListItem({ book }: BookListItemProps) {
  const playLecture = useLecturePlayer();
  const [imageError, setImageError] = React.useState(false);

  const handlePress = () => {
    playLecture({
      id: book.id,
      title: book.title,
      speaker: book.author,
      author: book.author,
      thumbnail_url: book.thumbnail_url,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row gap-4 items-center"
    >
      <View className="relative w-16 aspect-square">
        <Image
          source={{ uri: book.thumbnail_url }}
          className="w-16 aspect-square rounded-md"
        />
        {imageError && (
          <View className="absolute inset-0 bg-red-100 rounded-md items-center justify-center">
            <Text className="text-xs text-red-600">❌</Text>
          </View>
        )}
      </View>
      <View className="gap-1 flex-1">
        <Text className="text-2xl text-gray-100 font-bold">{book.title}</Text>
        <Text className="text-gray-400">{book.author}</Text>
      </View>

      <AntDesign name="playcircleo" size={24} color="gainsboro" />
    </Pressable>
  );
}
