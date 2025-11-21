import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface LinearProgressBarProps {
  /** Progress value from 0 to 100. If not provided, shows indeterminate animation */
  progress?: number;
  /** Color of the progress indicator */
  color?: string;
  /** Background track color */
  trackColor?: string;
  /** Height of the progress bar */
  height?: number;
}

/**
 * Linear progress bar component
 * - Determinate: shows actual progress (0-100%)
 * - Indeterminate: sliding animation when progress is not provided
 */
export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  progress,
  color = '#a855f7', // Primary purple
  trackColor = 'rgba(168, 85, 247, 0.2)',
  height = 3,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Determinate progress animation
  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animatedProgress]);

  // Indeterminate animation
  useEffect(() => {
    if (progress === undefined) {
      const startAnimation = () => {
        indeterminateAnim.setValue(0);
        animationRef.current = Animated.loop(
          Animated.timing(indeterminateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        );
        animationRef.current.start();
      };
      startAnimation();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [progress, indeterminateAnim]);

  // Determinate mode - show actual progress
  if (progress !== undefined) {
    const width = animatedProgress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.container, { height, backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.determinateIndicator,
            {
              backgroundColor: color,
              width: width as any,
            },
          ]}
        />
      </View>
    );
  }

  // Indeterminate mode - sliding animation
  const translateX = indeterminateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%'],
  });

  return (
    <View style={[styles.container, { height, backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.indeterminateIndicator,
          {
            backgroundColor: color,
            transform: [{ translateX: translateX as any }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  determinateIndicator: {
    height: '100%',
  },
  indeterminateIndicator: {
    width: '30%',
    height: '100%',
  },
});

export default LinearProgressBar;
