# Playback Delay & Sticky Player Fix - Elmify

## Root Cause Analysis

After reviewing the codebase, I identified **3 primary causes** for the playback delay and sticky player issues:

### 1. **Race Condition in Lecture Switching (CRITICAL)**
- `setLecture()` triggers useEffect which depends on `isPositionLoading`
- When switching lectures quickly, the position query for the NEW lecture hasn't loaded
- Effect waits on `isPositionLoading`, causing delay before playback starts
- Previous lecture continues playing while waiting

### 2. **No Request Cancellation**
- When tapping a new lecture, the previous `getStreamingUrl()` fetch continues
- Multiple concurrent requests can cause race conditions
- No AbortController to cancel pending API calls

### 3. **Blocking Position Load**
- Every lecture switch waits for `usePlaybackPosition()` to load
- This adds network latency before playback can begin
- Should start playing immediately and seek later if position is available

---

## Fix Checklist

### Phase 1: Critical Fixes (Stop Double Playback)

- [ ] **1.1 Add request locking to prevent concurrent play requests**
  - File: `src/providers/PlayerProvider.tsx`
  - Add `isPlayRequestInProgress` ref to block concurrent requests

- [ ] **1.2 Cancel previous playback immediately when new lecture selected**
  - File: `src/providers/PlayerProvider.tsx`
  - Call `TrackPlayer.reset()` immediately in `setLecture` before any async operations

- [ ] **1.3 Add AbortController for streaming URL fetch**
  - File: `src/providers/PlayerProvider.tsx`
  - Cancel pending URL fetches when new lecture is selected

- [ ] **1.4 Remove position loading dependency for initial playback**
  - File: `src/providers/PlayerProvider.tsx`
  - Start playback immediately, seek to saved position when it loads

### Phase 2: Reduce Time-to-First-Audio

- [ ] **2.1 Parallel fetch: Get URL while resetting player**
  - Don't await `TrackPlayer.reset()` before fetching URL

- [ ] **2.2 Pre-validate URL with HEAD request**
  - Catch bad URLs before sending to TrackPlayer

- [ ] **2.3 Reduce buffer config for faster start**
  - File: `src/services/audio/TrackPlayerService.ts`
  - Reduce `playBuffer` from 2.5 to 1.0 seconds

### Phase 3: UX Improvements

- [ ] **3.1 Add loading state to UI immediately on tap**
  - Show buffering indicator before URL fetch completes

- [ ] **3.2 Disable lecture taps while request in progress**
  - Prevent rapid-fire taps causing race conditions

- [ ] **3.3 Add timeout for URL fetch**
  - Fail fast if backend is slow (10 second timeout)

---

## Code Patches

### Patch 1: PlayerProvider.tsx - Complete Rewrite of Playback Logic

Replace the current lecture loading logic with this improved version:

```typescript
// Add these refs at the top of PlayerProvider component
const playRequestController = useRef<AbortController | null>(null);
const isPlayRequestInProgress = useRef(false);
const pendingLectureId = useRef<string | null>(null);

// Replace the setLecture function with this wrapped version
const handleSetLecture = useCallback(async (newLecture: UILecture | null) => {
  // Cancel any pending request
  if (playRequestController.current) {
    playRequestController.current.abort();
    playRequestController.current = null;
  }

  // If clearing lecture, just stop
  if (!newLecture) {
    setLecture(null);
    await TrackPlayerService.stop();
    currentLectureId.current = null;
    pendingLectureId.current = null;
    return;
  }

  // Skip if same lecture
  if (currentLectureId.current === newLecture.id) {
    return;
  }

  // Mark this lecture as pending
  pendingLectureId.current = newLecture.id;

  // Update UI immediately
  setLecture(newLecture);
  setIsLoading(true);
  setError(null);

  // CRITICAL: Stop previous playback IMMEDIATELY
  // Don't wait - this prevents double playback
  TrackPlayerService.stop().catch(console.error);

  // Clear intervals
  if (positionSyncInterval.current) clearInterval(positionSyncInterval.current);
  if (statsTrackingInterval.current) clearInterval(statsTrackingInterval.current);

  // Create new abort controller for this request
  playRequestController.current = new AbortController();
  const signal = playRequestController.current.signal;

  try {
    // Check if request was cancelled
    if (signal.aborted) return;

    // Check for local file first (fast path)
    const file = `${FileSystem.documentDirectory}${newLecture.id}.mp3`;
    const fileInfo = await FileSystem.getInfoAsync(file, { size: false });
    let audioUrl: string;

    if (fileInfo.exists) {
      audioUrl = file;
      console.log("✅ Using local file:", file);
    } else {
      // Fetch streaming URL with timeout
      console.log("🌐 Fetching presigned URL...");
      const startTime = Date.now();

      const fetchPromise = StreamingService.getStreamingUrl(newLecture);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('URL fetch timeout')), 10000)
      );

      const url = await Promise.race([fetchPromise, timeoutPromise]);

      if (signal.aborted) return;
      if (!url) throw new Error("No audio URL returned");

      audioUrl = url;
      console.log(`✅ URL fetched in ${Date.now() - startTime}ms`);
    }

    // Double-check we're still loading this lecture
    if (pendingLectureId.current !== newLecture.id || signal.aborted) {
      console.log("⏭️ Lecture changed, skipping playback");
      return;
    }

    // Update current lecture ref
    currentLectureId.current = newLecture.id;

    // Load and play
    const lectureWithUrl: UILecture = { ...newLecture, audio_url: audioUrl };

    // Start playback immediately at position 0
    // We'll seek to saved position once it loads
    await TrackPlayerService.loadAndPlay(lectureWithUrl, 0);

    setIsLoading(false);
    console.log("✅ Playback started for:", newLecture.title);

  } catch (err) {
    if (signal.aborted) return; // Ignore cancelled requests

    const errorMessage = err instanceof Error ? err.message : "Failed to load audio";
    console.error("❌ Playback error:", errorMessage);
    setError(errorMessage);
    setIsLoading(false);
    pendingLectureId.current = null;
  }
}, []);

// Seek to saved position when it loads (separate from playback start)
useEffect(() => {
  if (!savedPosition || !lecture || isPositionLoading) return;

  // Only seek if we're playing the correct lecture and have a meaningful position
  if (currentLectureId.current === lecture.id && savedPosition.currentPosition > 1000) {
    const positionSeconds = savedPosition.currentPosition / 1000;
    console.log(`🎯 Seeking to saved position: ${positionSeconds}s`);
    TrackPlayerService.seekTo(positionSeconds).catch(console.error);
  }
}, [savedPosition, lecture?.id, isPositionLoading]);
```

### Patch 2: TrackPlayerService.ts - Faster Buffer Config

```typescript
// In setup() method, reduce playBuffer for faster start
const bufferConfig = {
  autoUpdateMetadata: true,
  autoHandleInterruptions: true,
  minBuffer: 10,        // Reduced from 15
  maxBuffer: 50,
  playBuffer: 1.0,      // Reduced from 2.5 - faster start
  backBuffer: 0,
  maxCacheSize: 50000,
};
```

### Patch 3: StreamingService.ts - Add Request Timeout

Add timeout to the streaming service:

```typescript
// In StreamingService.getStreamingUrl()
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, {
    method: 'GET',
    headers: await AuthManager.getAuthHeaders(),
    signal: controller.signal
  });
  clearTimeout(timeoutId);
  // ... rest of method
} catch (error) {
  clearTimeout(timeoutId);
  throw error;
}
```

---

## Backend Checklist

### Presigned URL Latency

- [ ] **Cache S3/R2 signing credentials in memory**
  - Don't fetch from database on every request

- [ ] **Avoid synchronous DB calls in getStreamUrl endpoint**
  - Use `@Async` or reactive patterns

- [ ] **Add response timing headers for debugging**
  ```java
  response.setHeader("X-Sign-Time-Ms", String.valueOf(signTime));
  ```

### Response Headers

- [ ] **Ensure these headers on presigned URLs:**
  ```
  Content-Type: audio/mpeg
  Accept-Ranges: bytes
  Cache-Control: public, max-age=3600
  ```

- [ ] **Test Range request support:**
  ```bash
  curl -I -H "Range: bytes=0-1024" "YOUR_PRESIGNED_URL"
  ```

---

## R2/CDN Recommendations

- [ ] **Enable Cloudflare CDN caching for R2**
  - Set cache TTL on audio files (e.g., 1 week)

- [ ] **Use custom domain for CDN** (e.g., cdn.elmify.store)
  - Reduces DNS lookup time

- [ ] **Verify Range requests work**
  - Critical for seeking and fast playback start

- [ ] **Consider using CDN URLs instead of presigned URLs**
  - If content is not private, direct CDN URLs are faster
  - No signature computation overhead

---

## Test Plan

### Test 1: No Double Playback
1. Play lecture A
2. While A is playing, tap lecture B
3. **Expected**: A stops immediately, B starts within 2 seconds
4. **Verify**: No audio overlap, B shows in player

### Test 2: Rapid Switching
1. Tap lecture A
2. Before A starts, tap lecture B
3. Before B starts, tap lecture C
4. **Expected**: Only C plays, no queued playbacks

### Test 3: Time-to-First-Audio
1. Cold start app
2. Tap a lecture
3. Measure time from tap to first audio
4. **Target**: < 3 seconds on WiFi, < 5 seconds on cellular

### Test 4: Position Resume
1. Play lecture A to 5:00
2. Pause and close app
3. Reopen and tap lecture A
4. **Expected**: Playback starts immediately at 0:00, then seeks to ~5:00

### Test 5: Error Handling
1. Enable airplane mode
2. Tap a lecture
3. **Expected**: Error message within 10 seconds, no stuck loading state

---

## Estimated Effort

| Fix | Effort | Impact |
|-----|--------|--------|
| 1.1-1.4 Critical fixes | 2-3 hours | HIGH - Stops double playback |
| 2.1-2.3 TTFA improvements | 1-2 hours | MEDIUM - Faster start |
| 3.1-3.3 UX improvements | 1 hour | LOW - Polish |
| Backend checklist | 1-2 hours | MEDIUM - Reduces latency |
| R2/CDN config | 30 mins | LOW - Already good |

**Total: ~6-8 hours**

---

## Quick Implementation Order

1. **First**: Implement Patch 1 (PlayerProvider rewrite) - stops double playback
2. **Second**: Implement Patch 2 (buffer config) - faster start
3. **Third**: Test thoroughly with the test plan
4. **Fourth**: Backend optimizations if TTFA still > 3s
5. **Fifth**: UX polish (loading indicators, disabled states)

---

## Monitoring

Add these metrics to track improvement:

```typescript
// In PlayerProvider, track timing
const metrics = {
  urlFetchMs: 0,
  playerLoadMs: 0,
  firstAudioMs: 0, // from tap to State.Playing
};

// Log on each playback
console.log('[Metrics] TTFA:', {
  urlFetch: metrics.urlFetchMs,
  playerLoad: metrics.playerLoadMs,
  total: metrics.firstAudioMs,
});
```

---

## Notes

- The current implementation waits for `isPositionLoading` before starting playback - this is the main cause of delay
- `TrackPlayer.reset()` is async but we don't need to await it before fetching the URL
- The `loadAndPlay` method already handles seeking before play correctly
- Consider prefetching URLs for lectures visible on screen for instant playback
