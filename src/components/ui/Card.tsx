import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
}

interface CardDescriptionProps extends TextProps {
  children: React.ReactNode;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        'bg-card border border-border rounded-lg shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
);

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('p-6 pb-4', className)}
      {...props}
    >
      {children}
    </View>
  )
);

export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('px-6 pb-6', className)}
      {...props}
    >
      {children}
    </View>
  )
);

export const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        'text-xl font-semibold text-card-foreground leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
);

export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('text-sm text-muted-foreground mt-1.5', className)}
      {...props}
    >
      {children}
    </Text>
  )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';