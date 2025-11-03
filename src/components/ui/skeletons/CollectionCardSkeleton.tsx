/**
 * Collection Card Skeleton
 * Apple Podcasts-inspired skeleton for collection cards
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export const CollectionCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="bg-card border border-border rounded-lg p-4 mr-4 w-60">
      <View className="flex-row items-start">
        {/* Icon Skeleton */}
        <Animated.View 
          className="w-12 h-12 bg-muted rounded-lg mr-3"
          style={{ opacity: shimmerOpacity }}
        />
        
        <View className="flex-1">
          {/* Title Skeleton */}
          <Animated.View 
            className="h-4 bg-muted rounded mb-2"
            style={{ opacity: shimmerOpacity, width: '85%' }}
          />
          
          {/* Description Skeleton */}
          <Animated.View 
            className="h-3 bg-muted rounded mb-1"
            style={{ opacity: shimmerOpacity, width: '100%' }}
          />
          <Animated.View 
            className="h-3 bg-muted rounded mb-2"
            style={{ opacity: shimmerOpacity, width: '70%' }}
          />
          
          {/* Lecture Count Skeleton */}
          <Animated.View 
            className="h-3 bg-muted rounded"
            style={{ opacity: shimmerOpacity, width: '50%' }}
          />
        </View>
        
        {/* Chevron Skeleton */}
        <Animated.View 
          className="w-4 h-4 bg-muted rounded"
          style={{ opacity: shimmerOpacity }}
        />
      </View>
    </View>
  );
};