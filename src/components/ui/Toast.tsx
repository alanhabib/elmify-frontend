import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = 3000,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Fade in and slide down
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Feather name="check-circle" size={20} color="#ffffff" />;
      case 'error':
        return <Feather name="x-circle" size={20} color="#ffffff" />;
      case 'info':
        return <Feather name="info" size={20} color="#ffffff" />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className="absolute top-16 left-4 right-4 z-50"
    >
      <View
        className={`${getBackgroundColor()} rounded-lg px-4 py-3 flex-row items-center gap-3 shadow-lg`}
      >
        {getIcon()}
        <Text className="text-white font-medium flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
};
