# TestFlight Crash Analysis

## Timeline of Changes (Last 2 Weeks)

### Last Known Working Version
- **Date**: Nov 30, 2025 (commit `5871212`)
- **Status**: App was working on TestFlight

### Changes Since Last Working Version

#### 1. **Dec 11 - Authentication Layout Changes** (commit `f4a3273`)
**File**: `src/app/(protected)/_layout.tsx`

**Changes Made**:
- Added AppState monitoring to track when app goes to background/foreground
- Added `isRehydrating` state with 1-second timeout
- Added `wasAuthenticated` ref to track auth status
- Modified loading condition to include `isRehydrating`

**Potential Issue**:
The `setTimeout` with 1-second delay could cause race conditions or crashes if:
- The component unmounts before timeout completes
- AppState changes rapidly during the timeout period
- There's an error in the AppState event listener cleanup

**Code Added**:
```typescript
const [isRehydrating, setIsRehydrating] = useState(false);
const appState = useRef<AppStateStatus>(AppState.currentState);
const wasAuthenticated = useRef<boolean>(false);

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (wasAuthenticated.current) {
        setIsRehydrating(true);
        setTimeout(() => {
          setIsRehydrating(false);
        }, 1000);  // ⚠️ POTENTIAL CRASH POINT
      }
    }
    appState.current = nextAppState;
  });

  return () => {
    subscription.remove();
  };
}, []);
```

#### 2. **Dec 12 - Environment Detection Changes** (commit `e2f32f1`)
**Files**:
- `src/api/client.ts`
- `src/config/env.ts`

**Changes Made**:
- Changed from using `__DEV__` to `process.env.EXPO_PUBLIC_ENVIRONMENT`
- Added `getEnvironment()` and `getIsProduction()` helper functions

**Potential Issue**:
If `EXPO_PUBLIC_ENVIRONMENT` is not set correctly in the production build, the app might:
- Use wrong API URLs
- Fail to load resources
- Have missing environment variables

#### 3. **Dec 12 - Package Updates** (commit `dff6642`)
**Files**:
- `package.json`
- `package-lock.json`
- `app.json`

**Changes Made**:
- Updated multiple packages including Expo SDK
- Updated `expo-audio` from ~1.0.13 to ~1.1.0
- Updated `react-native` from 0.81.4 to 0.81.5
- Added `expo-asset` as dependency

**Potential Issue**:
Package version mismatches or breaking changes in:
- `expo-audio` (used for track player)
- `react-native` minor version bump
- New `expo-asset` dependency

## Most Likely Crash Causes (Ranked)

### 1. **AppState setTimeout Race Condition** (HIGH PROBABILITY)
**Location**: `src/app/(protected)/_layout.tsx:45-50`

**Why**:
- The setTimeout is not cleaned up if component unmounts
- State updates after unmount will crash React Native
- AppState can trigger rapidly on iOS causing multiple simultaneous timeouts

**Symptoms**:
- App crashes immediately on launch
- Crashes when coming back from background
- Inconsistent crashes (timing-dependent)

### 2. **Environment Variable Not Set** (MEDIUM PROBABILITY)
**Location**: `src/config/env.ts` and `src/api/client.ts`

**Why**:
- If `EXPO_PUBLIC_ENVIRONMENT` is undefined, it might fall back to `__DEV__`
- In production builds, `__DEV__` might not be defined correctly
- Wrong environment = wrong API URLs = network errors = crash

**Symptoms**:
- App crashes after splash screen
- Network-related errors
- Can't load initial data

### 3. **Package Version Conflicts** (LOW PROBABILITY)
**Location**: Various packages updated

**Why**:
- We already fixed the CocoaPods conflicts
- Build succeeded, so native modules linked correctly
- Less likely to cause immediate crashes

**Symptoms**:
- Feature-specific crashes
- Audio playback issues
- Specific screen crashes

## Recommended Fix Priority

### Priority 1: Fix AppState setTimeout
The setTimeout needs proper cleanup:

```typescript
useEffect(() => {
  let timeoutId: NodeJS.Timeout | null = null;

  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (wasAuthenticated.current) {
        setIsRehydrating(true);
        timeoutId = setTimeout(() => {
          setIsRehydrating(false);
        }, 1000);
      }
    }
    appState.current = nextAppState;
  });

  return () => {
    subscription.remove();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, []);
```

### Priority 2: Verify Environment Variables
Check that the production build has correct environment variables set.

### Priority 3: Test Package Rollback (if needed)
If the above don't work, consider rolling back to the working version from Nov 30.

## Quick Rollback Command

To revert to last known working version:
```bash
git revert e2f32f1  # Revert environment detection changes
git revert f4a3273  # Revert auth layout changes
```

Or full rollback:
```bash
git reset --hard 5871212  # WARNING: Loses all changes since Nov 30
```
