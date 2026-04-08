@echo off
REM NutriSakti - Initialize Full React Native Project from Prototype
REM This script creates a complete React Native project with android/ios folders

echo.
echo 🚀 NutriSakti - React Native Project Initializer
echo ================================================
echo.

REM Check if prototype name is provided
if "%1"=="" (
    echo Usage: init-react-native.bat [prototype-name]
    echo.
    echo Available prototypes:
    echo   - mother-app
    echo   - healthcare-provider-portal
    echo   - social-worker-tool
    echo.
    echo Example: init-react-native.bat mother-app
    exit /b 1
)

set PROTOTYPE=%1
set PROJECT_NAME=

REM Set project name based on prototype
if "%PROTOTYPE%"=="mother-app" set PROJECT_NAME=NutriSaktiMother
if "%PROTOTYPE%"=="healthcare-provider-portal" set PROJECT_NAME=NutriSaktiProvider
if "%PROTOTYPE%"=="social-worker-tool" set PROJECT_NAME=NutriSaktiSocialWorker

if "%PROJECT_NAME%"=="" (
    echo ❌ Error: Unknown prototype '%PROTOTYPE%'
    echo Available: mother-app, healthcare-provider-portal, social-worker-tool
    exit /b 1
)

echo 📦 Initializing: %PROTOTYPE%
echo 📱 Project name: %PROJECT_NAME%
echo.

REM Check if prototype exists
if not exist "%PROTOTYPE%" (
    echo ❌ Error: Prototype folder '%PROTOTYPE%' not found
    exit /b 1
)

REM Check if project already exists
if exist "%PROJECT_NAME%" (
    echo ⚠️  Warning: Project '%PROJECT_NAME%' already exists
    set /p REPLY="Do you want to overwrite it? (y/N): "
    if /i not "%REPLY%"=="y" (
        echo ❌ Cancelled
        exit /b 1
    )
    rmdir /s /q "%PROJECT_NAME%"
)

echo 1️⃣  Creating React Native project...
call npx react-native init %PROJECT_NAME% --version 0.73.11

if errorlevel 1 (
    echo ❌ Error: Failed to create React Native project
    exit /b 1
)

echo.
echo 2️⃣  Copying prototype files...

REM Copy source files
if exist "%PROTOTYPE%\src" (
    xcopy /E /I /Y "%PROTOTYPE%\src" "%PROJECT_NAME%\src"
    echo    ✅ Copied src/
)

REM Copy App.js
if exist "%PROTOTYPE%\App.js" (
    copy /Y "%PROTOTYPE%\App.js" "%PROJECT_NAME%\"
    echo    ✅ Copied App.js
)

echo.
echo 3️⃣  Installing dependencies...
cd %PROJECT_NAME%

REM Install our custom dependencies
call npm install --legacy-peer-deps react-native-nfc-manager @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-timeline-flatlist ethers @react-native-async-storage/async-storage react-redux redux redux-persist react-native-qrcode-scanner react-native-maps react-native-geolocation-service axios

if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    exit /b 1
)

echo.
echo ✅ Success! React Native project initialized
echo.
echo 📱 Project location: %PROJECT_NAME%\
echo.
echo 🚀 To run the app:
echo.
echo    cd %PROJECT_NAME%
echo.
echo    # Start Metro bundler
echo    npm start
echo.
echo    # In another terminal, run:
echo    npm run android    # For Android
echo.
echo 📝 Note: You may need to configure native modules in:
echo    - android\app\build.gradle
echo.
echo 📚 See HOW_TO_RUN.md for more details
echo.
