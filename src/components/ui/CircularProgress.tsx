import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  /** Current progress value (0-1 or 0-max) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size variant following design system */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Custom content to show in center */
  children?: React.ReactNode;
}

const sizeConfig = {
  sm: { size: 80, strokeWidth: 6 },
  md: { size: 120, strokeWidth: 8 },
  lg: { size: 160, strokeWidth: 10 },
};

export const CircularProgress = React.forwardRef<View, CircularProgressProps>(
  ({ value, max = 100, size = 'md', className, children }, ref) => {
    const normalizedValue = Math.min(Math.max(value, 0), max);
    const percentage = (normalizedValue / max) * 100;
    
    const { size: circleSize, strokeWidth } = sizeConfig[size];
    const radius = (circleSize - strokeWidth) / 2;
    
    // Calculate progress angle (0 to 180 degrees for semicircle)
    const progressAngle = (percentage / 100) * 180;
    
    const semicircleHeight = circleSize / 2 + strokeWidth / 2;

    return (
      <View 
        ref={ref}
        className={cn(className)}
        style={{ 
          width: circleSize, 
          height: semicircleHeight + 20,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {/* Semicircle container */}
        <View
          style={{
            width: circleSize,
            height: semicircleHeight,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Background semicircle */}
          <View
            style={{
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
              borderColor: '#374151',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          
          {/* Progress semicircle */}
          {percentage > 0 && (
            <View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                borderWidth: strokeWidth,
                borderColor: 'transparent',
                borderTopColor: '#a855f7',
                borderRightColor: progressAngle > 90 ? '#a855f7' : 'transparent',
                borderLeftColor: '#a855f7',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: [{ rotate: `${progressAngle - 90}deg` }],
              }}
            />
          )}
        </View>
        
        {/* Center content */}
        {children && (
          <View 
            style={{ 
              position: 'absolute',
              top: strokeWidth / 2,
              left: 0,
              right: 0,
              height: semicircleHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {children}
          </View>
        )}
      </View>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';