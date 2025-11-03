# 🐛 Infinite Re-render Bug - Root Cause & Fix

## Problem
SpeakerCard components were re-rendering **1000+ times** causing visible blinking/flickering on screen.

## Root Cause

**File:** `client/src/components/speakers/SpeakerCard.tsx`

The Image component had `onError` and `onLoad` event handlers that were causing an infinite loop:

```typescript
// ❌ BEFORE (BROKEN)
const [imageError, setImageError] = useState(false);

<Image
  source={{ uri: imageError ? fallbackUrl : speaker.avatar_url }}
  onError={() => setImageError(true)}   // 🔥 Infinite loop trigger!
  onLoad={() => setImageError(false)}   // 🔥 Infinite loop trigger!
/>
```

### Why This Caused Infinite Re-renders

1. **Image loads/fails** → triggers `onError`/`onLoad` handler
2. **Handler calls `setState`** → triggers component re-render
3. **Re-render creates new inline function** → React thinks props changed
4. **FlatList re-renders item** → Image component re-mounts
5. **Image loads again** → **LOOP REPEATS** ♾️

Additionally, if the fallback URL also failed to load, it would create a cycle between the two URLs.

## Solution

**Removed the error state handlers entirely** and use a simple fallback in the source:

```typescript
// ✅ AFTER (FIXED)
<Image
  source={{
    uri: speaker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(
      speaker.name
    )}&background=6366f1&color=ffffff&size=128`,
  }}
  // No onError or onLoad handlers - prevents infinite loop
/>
```

## Results

**Before Fix:**
- 🔴 SpeakerCard renders: **1000+** times per card
- 🔴 Visible blinking/flickering on screen
- 🔴 App performance degraded
- 🔴 Battery drain

**After Fix:**
- ✅ SpeakerCard renders: **2** times per card (normal React behavior)
- ✅ No blinking - stable UI
- ✅ Normal performance
- ✅ No excessive re-renders

## Debugging Process

### Step 1: Isolated the problem
- Removed speakers from Dashboard and Library screens
- Kept only Browse screen with speakers
- Simplified all code (removed useCallback, useMemo, React.memo)

### Step 2: Added granular logging
```typescript
// Added logs at each level:
📱 Browse RENDER #X
🔄 useSpeakers hook call #X
🎨 SpeakersSection RENDER #X
🃏 SpeakerCard[id] RENDER #X  // <-- This revealed 1000+ renders!
```

### Step 3: Identified the culprit
- Console showed SpeakerCard render counts skyrocketing
- Isolated to Image component event handlers
- Removed handlers → **problem solved**

## Lessons Learned

1. **Avoid inline setState in event handlers on frequently re-rendering components**
2. **Be careful with Image onError/onLoad in FlatList items** - they can cause infinite loops
3. **Use simple fallbacks instead of complex error handling** when possible
4. **Debug with granular logging** to pinpoint exact source of re-renders
5. **Simplify first** - remove optimizations to isolate the problem

## Files Modified

1. `client/src/components/speakers/SpeakerCard.tsx` - Removed onError/onLoad handlers
2. `client/src/app/(protected)/(tabs)/index.tsx` - Simplified (removed speakers temporarily)
3. `client/src/app/(protected)/(tabs)/library.tsx` - Simplified (removed speakers temporarily)
4. `client/src/app/(protected)/(tabs)/browse.tsx` - Simplified for debugging
5. `client/src/components/speakers/SpeakersSection.tsx` - Removed memoization for debugging

## Next Steps

- [ ] Restore speakers to Dashboard and Library screens
- [ ] Re-add performance optimizations (useCallback, React.memo) if needed
- [ ] Consider alternative image error handling if needed (e.g., placeholder images)
- [ ] Monitor for any other re-render issues

---

**Date:** 2025-10-05
**Status:** ✅ RESOLVED
