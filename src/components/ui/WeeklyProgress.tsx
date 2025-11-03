import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface WeeklyProgressProps {
  completedDays: boolean[];
  currentDay: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { size: 28, text: 'text-xs' },
  md: { size: 36, text: 'text-sm' },
  lg: { size: 44, text: 'text-base' },
};

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const WeeklyProgress = React.forwardRef<View, WeeklyProgressProps>(
  ({ completedDays, currentDay, size = 'md', className }, ref) => {
    const { size: circleSize, text: textSize } = sizeConfig[size];

    const getCircleStyle = (dayIndex: number) => {
      const isCompleted = completedDays[dayIndex];
      const isCurrent = dayIndex === currentDay;
      const isPast = dayIndex < currentDay;

      if (isCompleted) {
        return 'bg-primary border-primary'; // Completed
      } else if (isCurrent) {
        return 'bg-primary/20 border-primary'; // Current day
      } else if (isPast) {
        return 'bg-muted border-muted'; // Past but not completed
      } else {
        return 'bg-muted/30 border-muted/30'; // Future days
      }
    };

    const getTextStyle = (dayIndex: number) => {
      const isCompleted = completedDays[dayIndex];
      const isCurrent = dayIndex === currentDay;

      if (isCompleted) {
        return 'text-primary-foreground';
      } else if (isCurrent) {
        return 'text-primary';
      } else {
        return 'text-muted-foreground';
      }
    };

    return (
      <View 
        ref={ref}
        className={cn('flex-row justify-center gap-2', className)}
      >
        {dayLabels.map((day, index) => (
          <View
            key={index}
            className={cn(
              'rounded-full border-2 flex items-center justify-center',
              getCircleStyle(index)
            )}
            style={{ width: circleSize, height: circleSize }}
          >
            <Text 
              className={cn(
                'font-semibold',
                textSize,
                getTextStyle(index)
              )}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  }
);

WeeklyProgress.displayName = 'WeeklyProgress';