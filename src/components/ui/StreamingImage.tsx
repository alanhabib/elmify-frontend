/**
 * Streaming Image Component
 *
 * Fetches presigned URLs from MinIO and displays images with loading/error states.
 * Supports speakers, collections, and lecture thumbnails.
 *
 * Features:
 * - Automatic presigned URL fetching
 * - Loading state with spinner
 * - Error state with fallback icon
 * - Graceful fallback to placeholder URLs
 * - Type-safe with proper TypeScript types
 *
 * @module components/ui/StreamingImage
 */

import React from 'react';
import { Image, View, ActivityIndicator, ImageProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useImageStreamUrl } from '@/queries/hooks/streaming';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for StreamingImage component
 */
export interface StreamingImageProps extends Omit<ImageProps, 'source'> {
  /**
   * Type of image (speaker avatar, collection cover, or lecture thumbnail)
   */
  type: 'speaker' | 'collection' | 'lecture';

  /**
   * ID of the resource
   */
  id: string;

  /**
   * Fallback URL to use if streaming URL fails
   * Can be a placeholder URL or cached image URL
   */
  fallbackUrl?: string;

  /**
   * Whether to show loading spinner while fetching URL
   * @default true
   */
  showLoading?: boolean;

  /**
   * Whether to show error icon if streaming fails and no fallback
   * @default true
   */
  showError?: boolean;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StreamingImage - Displays images from MinIO storage
 *
 * @example
 * ```tsx
 * // Speaker avatar
 * <StreamingImage
 *   type="speaker"
 *   id="123"
 *   fallbackUrl="https://placeholder.com/avatar.jpg"
 *   className="w-16 h-16 rounded-full"
 * />
 *
 * // Collection cover
 * <StreamingImage
 *   type="collection"
 *   id="456"
 *   fallbackUrl={collection.coverImageSmallUrl}
 *   className="w-full h-full"
 *   resizeMode="cover"
 * />
 *
 * // With custom loading
 * <StreamingImage
 *   type="lecture"
 *   id="789"
 *   loadingComponent={<CustomSpinner />}
 *   className="w-32 h-32"
 * />
 * ```
 */
export const StreamingImage: React.FC<StreamingImageProps> = ({
  type,
  id,
  fallbackUrl,
  showLoading = true,
  showError = true,
  loadingComponent,
  errorComponent,
  className,
  style,
  ...imageProps
}) => {
  // Fetch streaming URL from MinIO
  // Note: This will return null if backend endpoints aren't implemented yet
  const { data: streamUrl, isLoading, isError } = useImageStreamUrl(type, id, {
    enabled: !!id,
  });

  // Determine which URL to use
  const imageUrl = streamUrl || fallbackUrl;

  // Show loading state
  if (isLoading && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View
        className={className}
        style={[
          style,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
        ]}
      >
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  // Show error state if no URL available
  if (!imageUrl && showError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    // Get appropriate icon based on type
    const getErrorIcon = () => {
      switch (type) {
        case 'speaker':
          return 'person-circle-outline';
        case 'collection':
          return 'library-outline';
        case 'lecture':
          return 'musical-notes-outline';
        default:
          return 'image-outline';
      }
    };

    return (
      <View
        className={className}
        style={[
          style,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
        ]}
      >
        <Ionicons name={getErrorIcon() as any} size={48} color="#6b7280" />
      </View>
    );
  }

  // Render image with streaming URL or fallback
  if (!imageUrl) {
    // No URL and showError is false - render nothing
    return null;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      className={className}
      style={style}
      {...imageProps}
    />
  );
};

/**
 * Type exports for convenience
 */
export type { StreamingImageProps };
