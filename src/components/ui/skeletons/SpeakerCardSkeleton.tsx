/**
 * Speaker Card Skeleton
 * Apple Podcasts-inspired skeleton loading animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export const SpeakerCardSkeleton: React.FC = () => {
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
    <View className="mr-4 w-32">
      {/* Avatar Skeleton */}
      <Animated.View 
        className="w-32 h-32 rounded-full bg-muted mb-3"
        style={{ opacity: shimmerOpacity }}
      />
      
      {/* Name Skeleton */}
      <Animated.View 
        className="h-4 bg-muted rounded mb-1"
        style={{ opacity: shimmerOpacity, width: '80%' }}
      />
      
      {/* Bio Skeleton */}
      <Animated.View 
        className="h-3 bg-muted rounded"
        style={{ opacity: shimmerOpacity, width: '60%' }}
      />
    </View>
  );
};