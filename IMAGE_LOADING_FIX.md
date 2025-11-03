# 🖼️ Image Loading Fix - MinIO Integration

**Date:** 2025-10-05
**Issue:** Speaker images not loading (file:// paths don't work in React Native)
**Status:** Solution Designed

---

## 🐛 Problem Analysis

### Current Situation
```
Database:  "speakers/16/1755409400542-b0z48s-speaker-image.jpg"
           ↓
Backend:   Returns relative path as-is in SpeakerDto
           ↓
Frontend:  Tries to use as file:// URI
           ↓
Error:     "Could not find image file:///.../speakers/16/..."
```

### Why It Fails
React Native `<Image>` component only accepts:
1. **HTTP/HTTPS URLs** - `https://example.com/image.jpg` ✅
2. **require() imports** - `require('./assets/image.jpg')` (build-time only) ✅
3. **File system URIs** - `file:///path/to/downloaded/image.jpg` (with expo-file-system) ✅
4. **NOT relative paths** - `speakers/16/image.jpg` ❌

---

## ✅ Solution: MinIO Presigned URLs

### Approach
Convert relative paths to **presigned MinIO URLs** on the backend, just like we do for audio streaming.

### Why This Works
- ✅ Images are already in MinIO storage
- ✅ Backend already has `StorageService` for presigned URLs
- ✅ Frontend gets HTTP URLs that work with `<Image>`
- ✅ Same pattern as audio streaming
- ✅ Secure (time-limited URLs)
- ✅ Works in development and production

---

## 🏗️ Implementation Plan

### Option 1: On-Demand URL Generation (Recommended)

**Add endpoints to generate presigned URLs when needed:**

```java
// SpeakerController.java
@GetMapping("/{id}/image-url")
public ResponseEntity<Map<String, String>> getSpeakerImageUrl(@PathVariable Long id) {
    Speaker speaker = speakerService.getSpeakerById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Speaker", id));

    String presignedUrl = storageService.generatePresignedUrl(speaker.getImageUrl());
    return ResponseEntity.ok(Map.of("url", presignedUrl));
}
```

**Pros:**
- Simple to implement
- URLs always fresh (no expiration issues)
- Minimal backend changes

**Cons:**
- Extra API calls for images
- Slightly slower initial load

---

### Option 2: Automatic URL Conversion in DTO (Better for UX)

**Modify `SpeakerDto.fromEntity()` to automatically convert paths to URLs:**

```java
public static SpeakerDto fromEntity(Speaker speaker, StorageService storageService) {
    String imageUrl = speaker.getImageUrl() != null
        ? storageService.generatePresignedUrl(speaker.getImageUrl())
        : null;

    String imageSmallUrl = speaker.getImageSmallUrl() != null
        ? storageService.generatePresignedUrl(speaker.getImageSmallUrl())
        : null;

    return new SpeakerDto(
        speaker.getId(),
        speaker.getName(),
        imageUrl,        // Now a presigned URL
        imageSmallUrl,   // Now a presigned URL
        speaker.getIsPremium(),
        speaker.getCreatedAt(),
        speaker.getUpdatedAt()
    );
}
```

**Pros:**
- ✅ No frontend changes needed
- ✅ Works immediately with existing Image components
- ✅ No extra API calls
- ✅ Better UX (faster)

**Cons:**
- URLs embedded in list responses (larger payload)
- URLs expire (but cached by TanStack Query)

---

## 🎯 Recommended Solution

**Use Option 2 (Automatic DTO Conversion)** because:
1. Already have StorageService available
2. Frontend already uses the URLs
3. No breaking changes
4. Better UX (no extra loading)
5. Same pattern can apply to collections and lectures

---

## 📝 Implementation Steps

### Backend Changes

#### Step 1: Update SpeakerDto
```java
// SpeakerDto.java
public static SpeakerDto fromEntity(Speaker speaker, StorageService storageService) {
    return new SpeakerDto(
        speaker.getId(),
        speaker.getName(),
        convertToPresignedUrl(speaker.getImageUrl(), storageService),
        convertToPresignedUrl(speaker.getImageSmallUrl(), storageService),
        speaker.getIsPremium(),
        speaker.getCreatedAt(),
        speaker.getUpdatedAt()
    );
}

private static String convertToPresignedUrl(String path, StorageService storageService) {
    if (path == null || path.isEmpty()) {
        return null;
    }

    // If already a full URL, return as-is
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Convert relative path to presigned URL
    try {
        return storageService.generatePresignedUrl(path);
    } catch (Exception e) {
        logger.warn("Failed to generate presigned URL for: {}", path, e);
        return null;
    }
}
```

#### Step 2: Update SpeakerController
```java
// Inject StorageService
private final StorageService storageService;

// Update mapping calls
@GetMapping
public ResponseEntity<PagedResponse<SpeakerDto>> getAllSpeakers(Pageable pageable) {
    Page<SpeakerDto> speakerDtos = speakerService.getAllSpeakers(pageable)
            .map(speaker -> SpeakerDto.fromEntity(speaker, storageService)); // Add storageService
    PagedResponse<SpeakerDto> response = PagedResponse.from(speakerDtos);
    return ResponseEntity.ok(response);
}

@GetMapping("/{id}")
public ResponseEntity<SpeakerDto> getSpeakerById(@PathVariable Long id) {
    return speakerService.getSpeakerById(id)
            .map(speaker -> ResponseEntity.ok(SpeakerDto.fromEntity(speaker, storageService)))
            .orElseThrow(() -> new ResourceNotFoundException("Speaker", id));
}
```

#### Step 3: Apply Same Pattern to CollectionDto and LectureDto

---

### Frontend Changes (None Required!)

The frontend already works correctly:

```typescript
<Image
  source={{
    uri: speaker.imageSmallUrl || speaker.imageUrl || fallbackUrl
  }}
/>
```

Once the backend returns presigned URLs, images will load automatically!

---

## 🧪 Testing

### Pre-Test Checklist
1. ✅ MinIO running: `docker ps | grep minio`
2. ✅ Images in MinIO bucket:
   ```bash
   mc ls local/audibleclone/speakers/16/
   ```
3. ✅ Backend can access MinIO (check logs)

### Test Steps
1. **Backend Unit Test:**
   ```java
   @Test
   void testSpeakerDtoPresignedUrl() {
       Speaker speaker = new Speaker();
       speaker.setImageUrl("speakers/16/image.jpg");

       SpeakerDto dto = SpeakerDto.fromEntity(speaker, storageService);

       assertThat(dto.imageUrl()).startsWith("http");
       assertThat(dto.imageUrl()).contains("X-Amz-");
   }
   ```

2. **API Test:**
   ```bash
   curl http://localhost:8080/api/v1/speakers/16
   # Should return:
   # {
   #   "id": 16,
   #   "imageUrl": "http://localhost:9000/audibleclone/speakers/16/...?X-Amz-..."
   # }
   ```

3. **Frontend Test:**
   - Launch app
   - Navigate to Browse screen
   - Verify speaker images load
   - Check console for no errors

---

## 🔄 Alternative: Temporary Workaround

If you want images working **immediately** while backend is updated:

### Upload images to public CDN
```bash
# Upload to any static hosting (Vercel, Cloudflare Pages, etc.)
# Then update database:
UPDATE speakers
SET image_url = 'https://cdn.example.com/speakers/16/image.jpg'
WHERE id = 16;
```

### Or use placeholder URLs
```typescript
// In SpeakerCard.tsx
const getImageUrl = () => {
  if (speaker.imageUrl?.startsWith('http')) {
    return speaker.imageUrl;
  }
  // Use placeholder for local paths
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&size=128`;
};

<Image source={{ uri: getImageUrl() }} />
```

---

## 🎯 Success Criteria

- ✅ Speaker images load from MinIO
- ✅ Collection covers load from MinIO
- ✅ Lecture thumbnails load from MinIO
- ✅ No file:// errors in console
- ✅ URLs are presigned with expiration
- ✅ Images cached by TanStack Query
- ✅ Fallback to placeholder if image missing

---

## 📊 Impact

**Backend Changes:**
- Update 3 DTOs (Speaker, Collection, Lecture)
- Update 3 controllers (inject StorageService)
- Add helper method for URL conversion
- ~100 lines of code

**Frontend Changes:**
- None! Already compatible ✅

**Database:**
- No changes needed ✅
- Paths remain relative (good for portability)

---

## 🚀 Next Steps

1. **Implement DTO changes** (30 min)
2. **Update controllers** (15 min)
3. **Test with MinIO** (15 min)
4. **Verify in app** (10 min)

**Total Time:** ~1-2 hours

---

## 📚 Related Files

**Backend:**
- `SpeakerDto.java`
- `CollectionDto.java`
- `LectureDto.java`
- `SpeakerController.java`
- `CollectionController.java`
- `LectureController.java`
- `StorageService.java` (already exists ✅)

**Frontend:**
- `SpeakerCard.tsx` (works as-is ✅)
- `CollectionCard.tsx` (works as-is ✅)
- `CollectionHeader.tsx` (works as-is ✅)

---

**Status:** 📝 Solution Designed - Ready to Implement
**Priority:** 🔴 High (Blocking UI functionality)
