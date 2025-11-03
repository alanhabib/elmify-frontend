import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCollections } from '@/queries/hooks/collections';
import { CollectionCard } from '@/components/collections/CollectionCard';

type Collection = {
  id: string | number;
  title: string;
  speakerName?: string;
  coverImageUrl?: string;
  coverImageSmallUrl?: string;
  lectureCount?: number;
  year?: number;
};

export const RecentCollections = () => {
  const router = useRouter();

  // Fetch all collections
  const {
    data: allCollections = [],
    isLoading,
    error
  } = useCollections({ params: { page: 0, size: 50 } });

  // Get 10 random collections using useMemo to avoid re-shuffling on re-renders
  const collections = useMemo(() => {
    if (!allCollections || allCollections.length === 0) return [];

    // Shuffle array and take first 10
    const shuffled = [...allCollections].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [allCollections]);

  const handleCollectionPress = (collection: any) => {
    // Navigate to collection detail page
    router.push({
      pathname: '/collection/[id]',
      params: {
        id: collection.id.toString(),
      }
    });
  };

  if (isLoading) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-2xl font-bold text-foreground">Recent Collections</Text>
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

  if (error || !collections || collections.length === 0) {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text className="text-2xl font-bold text-foreground">Recent Collections</Text>
          <Pressable className="touch-feedback">
            <Text className="text-primary text-sm font-medium">See All</Text>
          </Pressable>
        </View>
        <View className="items-center py-8">
          <Text className="text-muted-foreground text-center">
            {error ? 'Error loading collections' : 'No collections available'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between px-1 mb-2">
        <Text className="text-2xl font-bold text-foreground">Recent Collections</Text>
        <Pressable className="touch-feedback">
          <Text className="text-primary text-sm font-medium">See All</Text>
        </Pressable>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="overflow-visible"
      >
        {collections.map((collection: any) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onPress={handleCollectionPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};