/**
 * LectureList Component
 * Animated list of lectures with entrance effects
 *
 * Features:
 * - Staggered fade-in animations for items
 * - Optimized FlatList performance (keyExtractor, memo)
 * - Empty state with helpful message
 * - Pull-to-refresh support
 * - Smooth scrolling with proper spacing
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { LectureItem, Lecture, LectureVariant } from './LectureItem';
import { getStaggerDelay, ANIMATION_TIMING } from '@/utils/animations';

interface LectureListProps {
  lectures: Lecture[];
  variant: LectureVariant;
  onPressLecture: (lecture: Lecture) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
}

// Animated wrapper for list items
const AnimatedView = Animated.createAnimatedComponent(View);

export const LectureList: React.FC<LectureListProps> = ({
  lectures,
  variant,
  onPressLecture,
  onRefresh,
  isRefreshing = false,
  headerComponent,
  footerComponent,
}) => {
  // Memoized render function for performance
  const renderItem: ListRenderItem<Lecture> = useCallback(
    ({ item, index }) => (
      <AnimatedView
        entering={FadeInDown.delay(getStaggerDelay(index)).duration(
          ANIMATION_TIMING.standard
        )}
        layout={Layout.springify()}
      >
        <LectureItem
          lecture={item}
          variant={variant}
          onPress={() => onPressLecture(item)}
          index={index}
        />
      </AnimatedView>
    ),
    [variant, onPressLecture]
  );

  // Optimized key extractor
  const keyExtractor = useCallback((item: Lecture) => item.id, []);

  // Empty state component
  const renderEmptyState = useCallback(
    () => (
      <AnimatedView
        entering={FadeInUp.duration(ANIMATION_TIMING.standard)}
        className="py-16 px-6 items-center"
      >
        <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
          <Ionicons
            name={variant === 'speaker' ? 'person-outline' : 'library-outline'}
            size={48}
            color="#9ca3af"
          />
        </View>

        <Text className="text-foreground text-xl font-semibold text-center mb-2">
          No Lectures Available
        </Text>

        <Text className="text-muted-foreground text-base text-center leading-relaxed">
          {variant === 'speaker'
            ? 'This speaker hasn\'t published any lectures yet.'
            : 'This collection doesn\'t have any lectures yet.'}
        </Text>
      </AnimatedView>
    ),
    [variant]
  );

  // Pull-to-refresh control
  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#a855f7"
          colors={['#a855f7']}
          progressBackgroundColor="#1f2937"
        />
      ) : undefined,
    [onRefresh, isRefreshing]
  );

  // List header with padding
  const ListHeaderComponentMemo = useMemo(
    () =>
      headerComponent ? (
        <View className="pb-4">{headerComponent}</View>
      ) : null,
    [headerComponent]
  );

  // List footer with padding
  const ListFooterComponentMemo = useMemo(
    () =>
      footerComponent ? (
        <View className="pt-4">{footerComponent}</View>
      ) : null,
    [footerComponent]
  );

  return (
    <FlatList
      data={lectures}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmptyState}
      ListHeaderComponent={ListHeaderComponentMemo}
      ListFooterComponent={ListFooterComponentMemo}
      refreshControl={refreshControl}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={Platform.OS === 'android'}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      // Accessibility
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={`List of ${lectures.length} lectures`}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(LectureList);
