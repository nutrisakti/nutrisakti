#!/bin/bash
# NutriSakti v4 — Deploy to Google Cloud Run
# Usage: ./deploy.sh YOUR_PROJECT_ID [REGION]

set -e

PROJECT_ID=${1:-"leo-ai-agent-491912"}
REGION=${2:-"asia-southeast2"}
IMAGE="gcr.io/$PROJECT_ID/nutrisakti-v4"
SERVICE="nutrisakti-v4"

# Build metadata
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "🚀 Deploying NutriSakti v4 to Cloud Run"
echo "   Project:    $PROJECT_ID"
echo "   Region:     $REGION"
echo "   Image:      $IMAGE"
echo "   Build time: $BUILD_TIME"
echo "   Git commit: $GIT_COMMIT"
echo ""

# Load GEMINI_API_KEY from .env if not already set
if [ -z "$GEMINI_API_KEY" ] && [ -f "server/.env" ]; then
  export GEMINI_API_KEY=$(grep '^GEMINI_API_KEY=' server/.env | cut -d'=' -f2-)
  echo "   Gemini key: loaded from server/.env (${GEMINI_API_KEY:0:8}...)"
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "⚠️  WARNING: GEMINI_API_KEY not set — Guardian Agent will use fallback responses"
fi

# 1. Build image with metadata
echo ""
echo "1️⃣  Building Docker image..."
docker build \
  --build-arg BUILD_TIME="$BUILD_TIME" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  -t "$IMAGE:latest" \
  -t "$IMAGE:$GIT_COMMIT" \
  .

# 2. Push to GCR
echo ""
echo "2️⃣  Pushing to Container Registry..."
docker push "$IMAGE:latest"
docker push "$IMAGE:$GIT_COMMIT"

# 3. Deploy to Cloud Run with all env vars
echo ""
echo "3️⃣  Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image="$IMAGE:latest" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --set-env-vars="NODE_ENV=production,BUILD_TIME=$BUILD_TIME,GIT_COMMIT=$GIT_COMMIT,GEMINI_API_KEY=$GEMINI_API_KEY" \
  --project="$PROJECT_ID"

echo ""
echo "✅ Deployed successfully!"
echo ""
echo "🌐 Service URL:"
SERVICE_URL=$(gcloud run services describe "$SERVICE" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")
echo "   $SERVICE_URL"
echo ""
echo "🔍 Version check:"
echo "   $SERVICE_URL/api/version"
echo ""
echo "📋 To verify deployment, paste the output of:"
echo "   curl $SERVICE_URL/api/version"
