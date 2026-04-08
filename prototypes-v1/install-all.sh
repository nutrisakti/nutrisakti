#!/bin/bash

echo "🚀 Installing NutriSakti Prototypes..."
echo "======================================"

# Mother App
echo ""
echo "📱 Installing Mother App..."
cd mother-app
npm install --legacy-peer-deps
cd ..

# Healthcare Provider Portal
echo ""
echo "🏥 Installing Healthcare Provider Portal..."
cd healthcare-provider-portal
npm install --legacy-peer-deps
cd ..

# Social Worker Tool
echo ""
echo "👷 Installing Social Worker Tool..."
cd social-worker-tool
npm install --legacy-peer-deps
cd ..

# Government Dashboard
echo ""
echo "🏛️ Installing Government Dashboard..."
cd government-dashboard
npm install
cd ..

# Hospital System
echo ""
echo "🏥 Installing Hospital System..."
cd hospital-system
npm install
cd ..

echo ""
echo "✅ All prototypes installed successfully!"
echo ""
echo "Next steps:"
echo "1. Read SETUP_GUIDE.md for usage instructions"
echo "2. Each prototype has mock data with Indonesian language"
echo "3. No blockchain connection required for testing"
echo ""
echo "To run a prototype:"
echo "  cd [prototype-name]"
echo "  npm start"
