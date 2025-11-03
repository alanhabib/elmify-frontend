/**
 * Collection Header Component
 * Displays collection cover image, title, and basic info
 */

import { View, Text, Image, Dimensions } from 'react-native';
import type { CollectionDetailResponse } from '@/api/types';

const { width } = Dimensions.get('window');

interface CollectionHeaderProps {
  collection: CollectionDetailResponse;
}

export const CollectionHeader = ({ collection }: CollectionHeaderProps) => {
  return (
    <View className="items-center mb-6">
      {/* Collection Cover */}
      <View className="mb-4">
        {collection.coverImageUrl ? (
          <Image
            source={{ uri: collection.coverImageUrl }}
            style={{
              width: width * 0.6,
              height: width * 0.6,
              borderRadius: 12,
            }}
            className="bg-gray-200"
          />
        ) : (
          <View
            style={{
              width: width * 0.6,
              height: width * 0.6,
              borderRadius: 12,
            }}
            className="bg-gray-200 items-center justify-center"
          >
            <Text className="text-gray-500 text-lg">No Cover</Text>
          </View>
        )}
      </View>

      {/* Collection Info */}
      <View className="px-6">
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          {collection.title}
        </Text>
        
        {collection.speakerName && (
          <Text className="text-lg text-muted-foreground text-center mb-2">
            by {collection.speakerName}
          </Text>
        )}
        
        {collection.year && (
          <Text className="text-sm text-muted-foreground text-center">
            {collection.year}
          </Text>
        )}
      </View>
    </View>
  );
};