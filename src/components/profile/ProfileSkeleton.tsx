import React from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const ProfileSkeleton: React.FC = () => {
  return (
    <View className="pb-6 px-4">
      {/* Header Skeleton */}
      <View className="mb-6 pt-4 flex-row items-center justify-between">
        <View className="flex-1">
          <View className="h-8 w-32 bg-muted rounded mb-2 animate-pulse" />
          <View className="h-4 w-56 bg-muted rounded animate-pulse" />
        </View>
        <View className="w-10 h-10 rounded-full bg-muted animate-pulse" />
      </View>

      {/* Account Section Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <View className="h-6 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <View className="gap-4">
            <View>
              <View className="h-3 w-16 bg-muted rounded mb-2 animate-pulse" />
              <View className="h-4 w-48 bg-muted rounded animate-pulse" />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Daily Goals Section Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <View className="h-6 w-32 bg-muted rounded animate-pulse" />
          <View className="h-3 w-56 bg-muted rounded mt-1 animate-pulse" />
        </CardHeader>
        <CardContent>
          <View className="gap-6">
            {/* Progress Circle Skeleton */}
            <View className="items-center py-2">
              <View className="w-40 h-40 rounded-full bg-muted animate-pulse" />
            </View>

            {/* Weekly Progress Skeleton */}
            <View className="gap-3">
              <View className="h-4 w-24 bg-muted rounded mx-auto animate-pulse" />
              <View className="flex-row justify-center gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <View
                    key={i}
                    className="w-12 h-12 rounded-full bg-muted animate-pulse"
                  />
                ))}
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border mx-4" />

            {/* Stats Row Skeleton */}
            <View className="flex-row">
              <View className="items-center flex-1">
                <View className="h-8 w-12 bg-muted rounded mb-2 animate-pulse" />
                <View className="h-3 w-20 bg-muted rounded animate-pulse" />
              </View>

              <View className="w-px bg-border mx-4" />

              <View className="items-center flex-1">
                <View className="h-8 w-12 bg-muted rounded mb-2 animate-pulse" />
                <View className="h-3 w-20 bg-muted rounded animate-pulse" />
              </View>

              <View className="w-px bg-border mx-4" />

              <View className="items-center flex-1">
                <View className="h-8 w-12 bg-muted rounded mb-2 animate-pulse" />
                <View className="h-3 w-20 bg-muted rounded animate-pulse" />
              </View>
            </View>

            {/* Button Skeleton */}
            <View className="h-10 bg-muted rounded-lg animate-pulse" />
          </View>
        </CardContent>
      </Card>
    </View>
  );
};
