#!/bin/bash
# NutriSakti v3 — Deploy to Google Cloud Run
# Usage: ./deploy.sh YOUR_PROJECT_ID [REGION]

set -e

PROJECT_ID=${1:-"leo-ai-agent-491912"}
REGION=${2:-"asia-southeast2"}
IMAGE="gcr.io/$PROJECT_ID/nutrisakti-v3"
SERVICE="nutrisakti-v3"

echo "🚀 Deploying NutriSakti v3 to Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Image:   $IMAGE"
echo ""

# 1. Build image
echo "1️⃣  Building Docker image..."
docker build -t "$IMAGE:latest" .

# 2. Push to GCR
echo "2️⃣  Pushing to Container Registry..."
docker push "$IMAGE:latest"

# 3. Deploy to Cloud Run
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
  --set-env-vars="NODE_ENV=production" \
  --project="$PROJECT_ID"

echo ""
echo "✅ Deployed! URL:"
gcloud run services describe "$SERVICE" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)"
