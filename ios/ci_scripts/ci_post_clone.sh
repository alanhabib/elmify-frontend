#!/bin/sh

# Xcode Cloud Build Script
# This script runs after Xcode Cloud clones your repository
# It installs dependencies before the build starts

set -e

echo "🔧 Setting up Node.js environment..."

# Install Node.js using Homebrew (if not present)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js via Homebrew..."
    brew install node@20
    export PATH="/usr/local/opt/node@20/bin:$PATH"
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Verify npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found in PATH"
    exit 1
fi

echo "📦 Installing Node.js dependencies..."
cd $CI_WORKSPACE
npm ci --legacy-peer-deps

echo "📦 Installing CocoaPods dependencies..."
cd ios
pod install

echo "✅ Dependencies installed successfully!"
