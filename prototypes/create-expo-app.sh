#!/bin/bash

# NutriSakti - Create Expo-Compatible App from Prototype
# This script creates an Expo app compatible with Expo Go

echo "🚀 NutriSakti - Expo App Creator"
echo "================================"
echo ""

# Check if prototype name is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-expo-app.sh [prototype-name]"
    echo ""
    echo "Available prototypes:"
    echo "  - mother-app"
    echo "  - healthcare-provider-portal"
    echo "  - social-worker-tool"
    echo ""
    echo "Example: ./create-expo-app.sh mother-app"
    exit 1
fi

PROTOTYPE=$1
EXPO_PROJECT="${PROTOTYPE}-expo"

echo "📦 Creating Expo app from: $PROTOTYPE"
echo "📱 Expo project name: $EXPO_PROJECT"
echo ""

# Check if prototype exists
if [ ! -d "$PROTOTYPE" ]; then
    echo "❌ Error: Prototype folder '$PROTOTYPE' not found"
    exit 1
fi

# Check if expo project already exists
if [ -d "$EXPO_PROJECT" ]; then
    echo "⚠️  Warning: Expo project '$EXPO_PROJECT' already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
    rm -rf "$EXPO_PROJECT"
fi

echo "1️⃣  Creating Expo project..."
npx create-expo-app@latest "$EXPO_PROJECT" --template blank

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to create Expo project"
    exit 1
fi

echo ""
echo "2️⃣  Copying prototype files..."

# Copy source files
if [ -d "$PROTOTYPE/src" ]; then
    cp -r "$PROTOTYPE/src" "$EXPO_PROJECT/"
    echo "   ✅ Copied src/"
fi

# Copy App.js
if [ -f "$PROTOTYPE/App.js" ]; then
    cp "$PROTOTYPE/App.js" "$EXPO_PROJECT/"
    echo "   ✅ Copied App.js"
fi

echo ""
echo "3️⃣  Installing dependencies..."
cd "$EXPO_PROJECT"

# Install Expo-compatible dependencies
npx expo install \
    @react-navigation/native \
    @react-navigation/bottom-tabs \
    @react-navigation/stack \
    react-native-screens \
    react-native-safe-area-context \
    @react-native-async-storage/async-storage \
    react-redux \
    redux \
    redux-persist

# Install other dependencies
npm install \
    ethers \
    axios

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Success! Expo app created"
echo ""
echo "📱 Project location: $EXPO_PROJECT/"
echo ""
echo "🚀 To run the app:"
echo ""
echo "   cd $EXPO_PROJECT"
echo "   npx expo start"
echo ""
echo "   Then:"
echo "   - Press 'a' for Android emulator"
echo "   - Press 'i' for iOS simulator (macOS only)"
echo "   - Scan QR code with Expo Go app on your phone"
echo ""
echo "📝 Note: Some features are simulated (camera, NFC, maps)"
echo "   These will work in the full React Native version"
echo ""
