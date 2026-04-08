@echo off
echo Installing NutriSakti Prototypes...
echo ======================================

echo.
echo Installing Mother App...
cd mother-app
call npm install --legacy-peer-deps
cd ..

echo.
echo Installing Healthcare Provider Portal...
cd healthcare-provider-portal
call npm install --legacy-peer-deps
cd ..

echo.
echo Installing Social Worker Tool...
cd social-worker-tool
call npm install --legacy-peer-deps
cd ..

echo.
echo Installing Government Dashboard...
cd government-dashboard
call npm install
cd ..

echo.
echo Installing Hospital System...
cd hospital-system
call npm install
cd ..

echo.
echo All prototypes installed successfully!
echo.
echo Next steps:
echo 1. Read SETUP_GUIDE.md for usage instructions
echo 2. Each prototype has mock data with Indonesian language
echo 3. No blockchain connection required for testing
echo.
pause
