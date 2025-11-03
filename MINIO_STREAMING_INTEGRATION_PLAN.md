# 🎵 MinIO Streaming Integration Plan

**Created:** 2025-10-05
**Status:** Planning Phase
**Priority:** High (Core feature for audio playback and media display)

---

## 📋 Overview

This document outlines the plan to integrate MinIO object storage streaming for both **audio playback** and **image display** in the AudibleClone React Native frontend.

### Current State
- ✅ Backend has `StorageService` configured for MinIO/S3
- ✅ Backend has `/api/v1/lectures/{id}/stream-url` endpoint for audio streaming
- ✅ Backend uses presigned URLs with configurable expiration
- ❌ Frontend does not fetch streaming URLs
- ❌ Frontend uses placeholder/static URLs for images
- ❌ Frontend player does not fetch audio from MinIO

### Goals
1. **Audio Streaming**: Enable lecture audio playback from MinIO storage
2. **Image Streaming**: Display speaker avatars, collection covers, and lecture thumbnails from MinIO
3. **Security**: Use presigned URLs for authenticated access
4. **Performance**: Cache URLs appropriately to minimize API calls
5. **UX**: Handle loading states and errors gracefully

---

## 🏗️ Architecture

### Backend (Already Implemented)
```
┌─────────────────────────────────────────────────────┐
│ Backend (Spring Boot)                               │
├─────────────────────────────────────────────────────┤
│ LectureController                                   │
│   GET /api/v1/lectures/{id}/stream-url             │
│   → Returns: { "url": "https://minio.../file.mp3" }│
│                                                     │
│ StorageService                                      │
│   - generatePresignedUrl(objectKey)                │
│   - Configured with MinIO endpoint                 │
│   - Uses AWS S3 SDK with forcePathStyle            │
└─────────────────────────────────────────────────────┘
```

### Frontend (To Be Implemented)
```
┌─────────────────────────────────────────────────────┐
│ Frontend (React Native + TanStack Query)            │
├─────────────────────────────────────────────────────┤
│ New API Endpoints:                                  │
│   - streamingAPI.getAudioUrl(lectureId)            │
│   - streamingAPI.getImageUrl(type, id)             │
│                                                     │
│ New Hooks:                                          │
│   - useAudioStreamUrl(lectureId)                   │
│   - useImageStreamUrl(type, id)                    │
│                                                     │
│ Updated Components:                                 │
│   - Player: Fetch audio URL before playback        │
│   - SpeakerCard: Fetch avatar URL                  │
│   - CollectionCard: Fetch cover image URL          │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Plan

### Phase 1: Audio Streaming Setup (2-3 hours)

#### 1.1 Create Streaming API Endpoint
**File:** `client/src/api/endpoints/streaming.ts`

```typescript
/**
 * Streaming API Endpoints
 * Handles fetching presigned URLs for audio and images from MinIO
 */

import { apiClient } from '@/api/client';
import type { APIResponse } from '@/api/types';

export interface StreamUrlResponse {
  url: string;
}

export const streamingAPI = {
  /**
   * Get presigned URL for lecture audio streaming
   *
   * @param lectureId - ID of the lecture
   * @returns Presigned URL for audio file
   */
  async getAudioStreamUrl(lectureId: string): Promise<APIResponse<StreamUrlResponse>> {
    return apiClient.get<StreamUrlResponse>(
      `/api/v1/lectures/${lectureId}/stream-url`
    );
  },

  /**
   * Get presigned URL for image streaming
   * (To be implemented when backend adds image endpoints)
   *
   * @param type - Type of image (speaker, collection, lecture)
   * @param id - ID of the resource
   * @returns Presigned URL for image file
   */
  async getImageStreamUrl(
    type: 'speaker' | 'collection' | 'lecture',
    id: string
  ): Promise<APIResponse<StreamUrlResponse>> {
    // TODO: Backend needs to add these endpoints
    return apiClient.get<StreamUrlResponse>(
      `/api/v1/${type}s/${id}/image-url`
    );
  },
};
```

#### 1.2 Create Streaming Query Hooks
**File:** `client/src/queries/hooks/streaming.ts`

```typescript
/**
 * Streaming Query Hooks
 * TanStack Query hooks for fetching streaming URLs
 */

import { useQuery } from '@tanstack/react-query';
import { streamingAPI } from '@/api/endpoints/streaming';
import { queryKeys } from '@/queries/keys';

/**
 * Get audio stream URL for a lecture
 *
 * Features:
 * - Short cache time (URLs expire)
 * - Disabled by default (only fetch when needed)
 * - Refetch on mount to get fresh URL
 *
 * @example
 * ```tsx
 * function Player({ lectureId }) {
 *   const { data: streamUrl, isLoading } = useAudioStreamUrl(lectureId, {
 *     enabled: !!lectureId,
 *   });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   return <AudioPlayer url={streamUrl} />;
 * }
 * ```
 */
export function useAudioStreamUrl(
  lectureId: string | undefined,
  options: { enabled?: boolean } = {}
) {
  const { enabled = false } = options;

  return useQuery({
    queryKey: queryKeys.streaming.audio(lectureId!),
    queryFn: async () => {
      const response = await streamingAPI.getAudioStreamUrl(lectureId!);

      if (response.error || !response.success) {
        throw new Error(response.error || 'Failed to get stream URL');
      }

      return response.data?.url;
    },
    enabled: enabled && !!lectureId,
    // Presigned URLs expire, so cache for shorter time
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: true, // Get fresh URL each time
    retry: 2,
  });
}

/**
 * Get image stream URL
 * (To be fully implemented when backend adds endpoints)
 */
export function useImageStreamUrl(
  type: 'speaker' | 'collection' | 'lecture',
  id: string | undefined,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.streaming.image(type, id!),
    queryFn: async () => {
      const response = await streamingAPI.getImageStreamUrl(type, id!);

      if (response.error || !response.success) {
        // Fallback to placeholder if image URL fails
        console.warn(`Failed to get ${type} image URL for ${id}`);
        return null;
      }

      return response.data?.url;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes (images change less frequently)
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
```

#### 1.3 Update Query Keys
**File:** `client/src/queries/keys.ts`

Add to the existing query keys factory:

```typescript
export const queryKeys = {
  // ... existing keys ...

  streaming: {
    all: ['streaming'] as const,
    audio: (lectureId: string) => [...queryKeys.streaming.all, 'audio', lectureId] as const,
    image: (type: string, id: string) => [...queryKeys.streaming.all, 'image', type, id] as const,
  },
};
```

#### 1.4 Update Player Provider
**File:** `client/src/providers/PlayerProvider.tsx`

Update the player to fetch audio URLs before playback:

```typescript
// Add import
import { streamingAPI } from '@/api/endpoints/streaming';

// Inside PlayerProvider component
const setLecture = async (lecture: Lecture) => {
  try {
    // Fetch streaming URL
    const response = await streamingAPI.getAudioStreamUrl(lecture.id.toString());

    if (!response.success || !response.data?.url) {
      throw new Error('Failed to get audio stream URL');
    }

    const streamUrl = response.data.url;

    // Create TrackPlayer track with streaming URL
    await TrackPlayer.add({
      id: lecture.id.toString(),
      url: streamUrl, // Use MinIO presigned URL
      title: lecture.title,
      artist: lecture.speaker || lecture.author,
      artwork: lecture.thumbnail_url,
    });

    await TrackPlayer.play();
    setCurrentLecture(lecture);
  } catch (error) {
    console.error('Failed to load lecture audio:', error);
    // Show error to user
  }
};
```

---

### Phase 2: Image Streaming Setup (2-3 hours)

#### 2.1 Add Image Stream Endpoints to Backend

**Backend Task:** Create endpoints for speaker/collection/lecture images

```java
// SpeakerController.java
@GetMapping("/{id}/image-url")
@Operation(summary = "Get Speaker Image URL")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<Map<String, String>> getSpeakerImageUrl(@PathVariable Long id) {
    Speaker speaker = speakerService.getSpeakerById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Speaker", id));

    String imageKey = speaker.getImageUrl(); // Path in MinIO
    String presignedUrl = storageService.generatePresignedUrl(imageKey);

    return ResponseEntity.ok(Map.of("url", presignedUrl));
}

// Similar endpoints for CollectionController and LectureController
```

#### 2.2 Create Image Component with Streaming
**File:** `client/src/components/ui/StreamingImage.tsx`

```typescript
/**
 * Streaming Image Component
 * Fetches presigned URL from MinIO and displays image
 */

import React from 'react';
import { Image, View, ActivityIndicator, ImageProps } from 'react-native';
import { useImageStreamUrl } from '@/queries/hooks/streaming';

interface StreamingImageProps extends Omit<ImageProps, 'source'> {
  type: 'speaker' | 'collection' | 'lecture';
  id: string;
  fallbackUrl?: string;
}

export const StreamingImage: React.FC<StreamingImageProps> = ({
  type,
  id,
  fallbackUrl,
  className,
  style,
  ...props
}) => {
  const { data: streamUrl, isLoading } = useImageStreamUrl(type, id);

  if (isLoading) {
    return (
      <View className={className} style={style}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  const imageUrl = streamUrl || fallbackUrl;

  return (
    <Image
      source={{ uri: imageUrl }}
      className={className}
      style={style}
      {...props}
    />
  );
};
```

#### 2.3 Update Components to Use Streaming Images

**File:** `client/src/components/speakers/SpeakerCard.tsx`

```typescript
// Replace Image with StreamingImage
import { StreamingImage } from '@/components/ui/StreamingImage';

// Inside SpeakerCard component
<StreamingImage
  type="speaker"
  id={speaker.id.toString()}
  fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(
    speaker.name
  )}&background=6366f1&color=ffffff&size=128`}
  className="w-16 h-16 rounded-full mb-2"
  style={{
    borderWidth: 2,
    borderColor: "#374151",
  }}
/>
```

**File:** `client/src/components/collections/CollectionCard.tsx`

```typescript
// Replace Image with StreamingImage
<StreamingImage
  type="collection"
  id={collection.id.toString()}
  fallbackUrl={collection.coverImageSmallUrl || collection.coverImageUrl}
  className="w-full h-full"
  resizeMode="cover"
/>
```

---

### Phase 3: MinIO Configuration & Testing (1-2 hours)

#### 3.1 Verify MinIO Setup

**Tasks:**
1. Ensure MinIO is running locally (default: `http://localhost:9000`)
2. Verify bucket exists (`audibleclone` or configured bucket name)
3. Upload test audio files and images to MinIO
4. Test presigned URL generation from backend

**Commands:**
```bash
# Check MinIO status
docker ps | grep minio

# Access MinIO console
open http://localhost:9001

# Test presigned URL generation
curl -X GET http://localhost:8080/api/v1/lectures/1/stream-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3.2 Update Environment Configuration

**File:** `client/.env` (if needed)

```env
# MinIO Configuration (usually handled by backend)
API_BASE_URL=http://localhost:8080
```

**Backend File:** `audibleclone-backend/src/main/resources/application-dev.yml`

Verify MinIO configuration:
```yaml
audibleclone:
  r2:
    endpoint: http://localhost:9000
    access-key: minioadmin
    secret-key: minioadmin
    region: us-east-1
    bucket-name: audibleclone
    presigned-url-expiration: 1h
```

#### 3.3 Test Data Upload to MinIO

**Create test script to upload sample files:**

```bash
# Install MinIO client
brew install minio/stable/mc  # macOS
# or
wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Configure MinIO alias
mc alias set local http://localhost:9000 minioadmin minioadmin

# Upload test files
mc cp audio-files/*.mp3 local/audibleclone/lectures/
mc cp images/*.jpg local/audibleclone/speakers/
mc cp images/*.jpg local/audibleclone/collections/

# List files
mc ls local/audibleclone/lectures/
```

---

### Phase 4: Error Handling & UX (1 hour)

#### 4.1 Add Error States

```typescript
// In StreamingImage component
if (error) {
  return (
    <View className={className} style={style}>
      <Ionicons name="image-outline" size={48} color="#6b7280" />
    </View>
  );
}
```

#### 4.2 Add Loading States for Audio

```typescript
// In PlayerProvider
const [isLoadingStream, setIsLoadingStream] = useState(false);

const setLecture = async (lecture: Lecture) => {
  setIsLoadingStream(true);
  try {
    // ... fetch stream URL and play
  } catch (error) {
    // Show error toast
    Alert.alert('Playback Error', 'Unable to load audio. Please try again.');
  } finally {
    setIsLoadingStream(false);
  }
};
```

#### 4.3 Add Retry Logic

```typescript
// In streaming.ts hooks, add retry configuration
retry: (failureCount, error) => {
  // Retry up to 2 times for network errors
  if (failureCount < 2 && error.message.includes('network')) {
    return true;
  }
  return false;
},
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test `streamingAPI.getAudioStreamUrl()` with mock responses
- [ ] Test `useAudioStreamUrl` hook with various states
- [ ] Test `StreamingImage` component rendering

### Integration Tests
- [ ] Verify presigned URL generation from backend
- [ ] Test audio playback with MinIO URLs
- [ ] Test image loading from MinIO
- [ ] Test URL expiration and refresh

### Manual Testing Checklist
- [ ] Play lecture audio from MinIO storage
- [ ] Verify speaker avatars load from MinIO
- [ ] Verify collection covers load from MinIO
- [ ] Test offline/network failure scenarios
- [ ] Test URL expiration (wait 1+ hour)
- [ ] Test with multiple simultaneous streams
- [ ] Test on iOS device
- [ ] Test on Android device

---

## 📊 Files to Create/Modify

### New Files
1. `client/src/api/endpoints/streaming.ts` - Streaming API endpoints
2. `client/src/queries/hooks/streaming.ts` - Streaming hooks
3. `client/src/components/ui/StreamingImage.tsx` - Streaming image component

### Files to Modify
1. `client/src/queries/keys.ts` - Add streaming query keys
2. `client/src/providers/PlayerProvider.tsx` - Fetch audio URLs
3. `client/src/components/speakers/SpeakerCard.tsx` - Use streaming images
4. `client/src/components/collections/CollectionCard.tsx` - Use streaming images
5. `client/src/components/modals/CollectionHeader.tsx` - Use streaming images

### Backend Files to Create (If Image Endpoints Don't Exist)
1. `SpeakerController.java` - Add `/{id}/image-url` endpoint
2. `CollectionController.java` - Add `/{id}/image-url` endpoint
3. `LectureController.java` - Add `/{id}/thumbnail-url` endpoint (if needed)

---

## ⚠️ Important Considerations

### 1. URL Expiration
- Presigned URLs expire after configured duration (default: 1 hour)
- Frontend must refetch URLs when they expire
- Consider caching strategy based on expiration time

### 2. Authentication
- Audio streaming requires JWT authentication
- Image URLs may or may not require auth (TBD)
- Handle 401 errors gracefully

### 3. Performance
- Don't fetch streaming URLs for images not currently visible
- Use lazy loading for off-screen images
- Consider preloading next lecture in queue

### 4. Bandwidth
- MinIO streaming uses standard HTTP
- Consider implementing HLS for adaptive bitrate (future enhancement)
- Monitor data usage on mobile devices

### 5. Error Recovery
- Handle network timeouts
- Retry failed requests
- Provide fallback UI when streaming fails

---

## 🎯 Success Criteria

- ✅ Lectures play audio from MinIO storage
- ✅ Speaker avatars load from MinIO
- ✅ Collection covers load from MinIO
- ✅ Presigned URLs refresh automatically when expired
- ✅ Graceful error handling for network failures
- ✅ Loading states provide good UX
- ✅ No console errors related to streaming
- ✅ Works on both iOS and Android

---

## 📅 Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. Audio Streaming | API endpoints, hooks, player integration | 2-3 hours |
| 2. Image Streaming | Backend endpoints, StreamingImage component | 2-3 hours |
| 3. MinIO Setup | Configuration, test data upload | 1-2 hours |
| 4. Error Handling | Error states, retry logic, UX polish | 1 hour |
| **Total** | | **6-9 hours** |

---

## 🚀 Next Steps

1. **Review this plan** with the development team
2. **Verify backend** has all necessary endpoints (especially image URLs)
3. **Start with Phase 1** (Audio Streaming) as it's the highest priority
4. **Test thoroughly** at each phase before moving forward
5. **Document** any issues or deviations from the plan

---

## 📚 Related Documentation

- [Backend StorageService.java](../audibleclone-backend/src/main/java/com/audibleclone/backend/service/StorageService.java)
- [Backend LectureController.java](../audibleclone-backend/src/main/java/com/audibleclone/backend/controller/LectureController.java)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [TanStack Query Caching](https://tanstack.com/query/latest/docs/react/guides/caching)

---

**Status:** 📝 Plan Complete - Ready for Implementation
**Last Updated:** 2025-10-05
