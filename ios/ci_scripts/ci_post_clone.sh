#!/bin/sh

# Xcode Cloud Build Script
# This script runs after Xcode Cloud clones your repository
# It installs dependencies before the build starts

set -e

echo "📦 Installing Node.js dependencies..."
npm install

echo "📦 Installing CocoaPods dependencies..."
cd ios
pod install

echo "✅ Dependencies installed successfully!"
