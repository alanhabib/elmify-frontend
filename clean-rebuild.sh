#!/bin/bash

echo "🧹 Starting clean rebuild process..."
echo "======================================"

# Step 1: Clean iOS
echo "📱 Cleaning iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/.xcode.env.local

# Step 2: Clean Android
echo "🤖 Cleaning Android build artifacts..."
cd android && ./gradlew clean && cd ..
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# Step 3: Clean Node modules
echo "📦 Cleaning Node modules..."
rm -rf node_modules
rm -rf package-lock.json

# Step 4: Clean Expo/Metro cache
echo "🗑️  Cleaning Expo and Metro cache..."
rm -rf .expo
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Step 5: Clean npm cache
echo "🧼 Cleaning npm cache..."
npm cache clean --force

# Step 6: Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm install

# Step 7: Install iOS pods
echo "🍎 Installing iOS CocoaPods..."
cd ios
pod deintegrate 2>/dev/null
pod install
cd ..

# Step 8: Prebuild native projects
echo "🔨 Prebuilding native projects..."
npx expo prebuild --clean

echo ""
echo "✅ Clean rebuild complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  iOS Simulator:    npx expo run:ios"
echo "  Android Emulator: npx expo run:android"
echo "  iOS Build (EAS):  eas build --platform ios --profile preview"
echo "  Android Build:    eas build --platform android --profile preview"
echo ""
