#!/bin/bash

# NutriSakti - Initialize Full React Native Project from Prototype
# This script creates a complete React Native project with android/ios folders

echo "🚀 NutriSakti - React Native Project Initializer"
echo "================================================"
echo ""

# Check if prototype name is provided
if [ -z "$1" ]; then
    echo "Usage: ./init-react-native.sh [prototype-name]"
    echo ""
    echo "Available prototypes:"
    echo "  - mother-app"
    echo "  - healthcare-provider-portal"
    echo "  - social-worker-tool"
    echo ""
    echo "Example: ./init-react-native.sh mother-app"
    exit 1
fi

PROTOTYPE=$1
PROJECT_NAME=""

# Set project name based on prototype
case $PROTOTYPE in
    "mother-app")
        PROJECT_NAME="NutriSaktiMother"
        ;;
    "healthcare-provider-portal")
        PROJECT_NAME="NutriSaktiProvider"
        ;;
    "social-worker-tool")
        PROJECT_NAME="NutriSaktiSocialWorker"
        ;;
    *)
        echo "❌ Error: Unknown prototype '$PROTOTYPE'"
        echo "Available: mother-app, healthcare-provider-portal, social-worker-tool"
        exit 1
        ;;
esac

echo "📦 Initializing: $PROTOTYPE"
echo "📱 Project name: $PROJECT_NAME"
echo ""

# Check if prototype exists
if [ ! -d "$PROTOTYPE" ]; then
    echo "❌ Error: Prototype folder '$PROTOTYPE' not found"
    exit 1
fi

# Check if project already exists
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Warning: Project '$PROJECT_NAME' already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
    rm -rf "$PROJECT_NAME"
fi

echo "1️⃣  Creating React Native project..."
npx react-native init "$PROJECT_NAME" --version 0.73.11

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to create React Native project"
    exit 1
fi

echo ""
echo "2️⃣  Copying prototype files..."

# Copy source files
if [ -d "$PROTOTYPE/src" ]; then
    cp -r "$PROTOTYPE/src" "$PROJECT_NAME/"
    echo "   ✅ Copied src/"
fi

# Copy App.js
if [ -f "$PROTOTYPE/App.js" ]; then
    cp "$PROTOTYPE/App.js" "$PROJECT_NAME/"
    echo "   ✅ Copied App.js"
fi

# Copy package.json dependencies (merge)
echo ""
echo "3️⃣  Installing dependencies..."
cd "$PROJECT_NAME"

# Install our custom dependencies
npm install --legacy-peer-deps \
    react-native-nfc-manager \
    @react-navigation/native \
    @react-navigation/bottom-tabs \
    @react-navigation/stack \
    react-native-timeline-flatlist \
    ethers \
    @react-native-async-storage/async-storage \
    react-redux \
    redux \
    redux-persist \
    react-native-qrcode-scanner \
    react-native-maps \
    react-native-geolocation-service \
    axios

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Success! React Native project initialized"
echo ""
echo "📱 Project location: $PROJECT_NAME/"
echo ""
echo "🚀 To run the app:"
echo ""
echo "   cd $PROJECT_NAME"
echo ""
echo "   # Start Metro bundler"
echo "   npm start"
echo ""
echo "   # In another terminal, run:"
echo "   npm run android    # For Android"
echo "   npm run ios        # For iOS (macOS only)"
echo ""
echo "📝 Note: You may need to configure native modules in:"
echo "   - android/app/build.gradle"
echo "   - ios/Podfile"
echo ""
echo "📚 See HOW_TO_RUN.md for more details"
echo ""
