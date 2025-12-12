# iOS Build Troubleshooting Guide

## Problem Summary

The iOS build was failing with the following errors:

1. **Missing Framework Errors:**
   - `ld: Could not find or use auto-linked framework 'CoreAudioTypes'`
   - `ld: Could not find or use auto-linked framework 'UIUtilities'`
   - `ld: Could not parse or use implicit file 'SwiftUICore.framework'`

2. **Undefined Symbol Error:**
   - `Undefined symbols for architecture arm64: _OBJC_CLASS_$_RCTPackagerConnection`

3. **Codegen File Missing:**
   - `Build input file cannot be found: 'RCTAppDependencyProvider.mm'`

4. **Disk Space Issue:**
   - Disk was 99% full (only 200MB free out of 460GB)
   - npm commands were failing with `ENOSPC: no space left on device`

## Solution Steps

### Step 1: Clean and Reinstall CocoaPods

Navigate to the iOS directory and completely remove all CocoaPods artifacts:

```bash
cd ios
pod deintegrate
pod install
```

**What this does:**
- `pod deintegrate` removes all traces of CocoaPods from the Xcode project
- Deletes build phases, frameworks, and configuration files
- `pod install` freshly installs all dependencies with correct linking

**Output you should see:**
```
Deintegrating `Elmify.xcodeproj`
Deleted 1 'Copy Pods Resources' build phases.
Deleted 1 'Check Pods Manifest.lock' build phases.
Deleted 1 'Embed Pods Frameworks' build phases.
...
Pod installation complete! There are 101 dependencies from the Podfile and 101 total pods installed.
```

### Step 2: Run Full Clean Build with xcodebuild

From the iOS directory, run a complete clean build:

```bash
cd ios
xcodebuild -workspace Elmify.xcworkspace \
  -scheme Elmify \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build \
  clean build \
  CODE_SIGNING_ALLOWED=NO
```

**What this does:**
- `clean` removes all previous build artifacts
- `build` performs a fresh build
- This triggers all build scripts including React Native codegen
- Generates the missing `RCTAppDependencyProvider.mm` file

**Success indicator:**
The command completes without errors and you'll see warnings (which are normal) but no error messages.

### Step 3: Free Up Disk Space

**Check current disk usage:**
```bash
df -h / | tail -1
```

**Before cleanup:**
```
/dev/disk3s1s1   460Gi    10Gi   200Mi    99%    426k  2,0M   17%   /
```
- Total: 460GB
- Used: 10GB
- Available: **200MB** (critically low!)
- Usage: **99%**

**Clean npm npx cache:**
```bash
rm -rf ~/.npm/_npx
```

**Clean npm cache:**
```bash
npm cache clean --force
```

**Clean CocoaPods cache:**
```bash
# Check size first
du -sh ~/Library/Caches/CocoaPods

# Output: 734M
# Then remove
rm -rf ~/Library/Caches/CocoaPods
```

**Clean Xcode DerivedData (optional but helpful):**
```bash
# Check size first
du -sh ~/Library/Developer/Xcode/DerivedData

# Output: 5.2G
# Then remove
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

**After cleanup:**
```bash
df -h / | tail -1
```

```
/dev/disk3s1s1   460Gi    10Gi   2,0Gi    85%    426k   21M    2%   /
```
- Total: 460GB
- Used: 10GB
- Available: **2.0GB** (healthy!)
- Usage: **85%**

**Space freed calculation:**
- Before: 200MB available
- After: 2.0GB available
- **Freed: ~1.8GB visible** (plus ~734MB CocoaPods + ~5.2GB DerivedData cleaned = **~7.7GB total**)

## How to Start and Run the App

### Option 1: Using Expo CLI (Recommended)

1. **Start the Metro bundler:**
   ```bash
   npx expo start --port=8085
   ```

2. **In a separate terminal, run on iOS:**
   ```bash
   npx expo run:ios
   ```

   This will:
   - Build the iOS app
   - Launch the iOS Simulator
   - Install and run the app

### Option 2: Using Xcode Directly

1. **Open the workspace in Xcode:**
   ```bash
   open ios/Elmify.xcworkspace
   ```

2. **Select a simulator or device:**
   - Click on the scheme selector (top left, near "Elmify")
   - Choose an iOS Simulator (e.g., iPhone 15)

3. **Build and Run:**
   - Press `⌘ + R` or click the Play button
   - Xcode will build and launch the app

### Option 3: Using xcodebuild with Specific Simulator

1. **List available simulators:**
   ```bash
   xcrun simctl list devices available
   ```

2. **Build for specific simulator:**
   ```bash
   cd ios
   xcodebuild -workspace Elmify.xcworkspace \
     -scheme Elmify \
     -configuration Debug \
     -sdk iphonesimulator \
     -derivedDataPath build \
     -destination 'platform=iOS Simulator,id=080245B6-D80A-4D0C-A427-3FBB792C4BA4,OS=17.0,name=iPhone 15'
   ```

   Replace the `id` with your actual simulator ID from the list command.

## Common Issues and Solutions

### Issue: "Build input file cannot be found"

**Solution:** The codegen hasn't run yet. Use Option 2 (xcodebuild clean build) to generate the files.

### Issue: "No space left on device"

**Solution:** Follow Step 3 to free up disk space before running any builds.

### Issue: Framework linking errors

**Solution:** Run `cd ios && pod deintegrate && pod install` to reset CocoaPods.

### Issue: Simulator not found

**Solution:**
1. List available simulators: `xcrun simctl list devices available`
2. Use the exact name and OS version shown in the list

## For TestFlight Builds

Once local builds work, create a production build for TestFlight:

```bash
eas build -p ios --profile production
```

After the build completes, submit to TestFlight:

```bash
eas submit -p ios
```

## Files Modified to Fix TestFlight Crash

The following files were updated to fix production environment detection:

1. **src/api/client.ts** - Added `getEnvironment()` function using `EXPO_PUBLIC_ENVIRONMENT`
2. **src/config/env.ts** - Updated `IS_PRODUCTION` to use `EXPO_PUBLIC_ENVIRONMENT`

These changes ensure the app correctly detects production mode when running on TestFlight/App Store, rather than relying on `__DEV__` which can be unreliable in production builds.
