#!/usr/bin/env bash
# deploy.sh — Deploy SafeCycle PWA to Hostinger VPS
# Usage: ./deploy.sh
# Requires: SSH access to root@72.62.17.184, scp
# The server runs Express on port 3000, serving /var/www/inferencevision/

set -euo pipefail

SERVER="root@72.62.17.184"
REMOTE_PATH="/var/www/inferencevision/safecycle"
LOCAL_DIST="./dist"

echo "🔨 Building SafeCycle PWA..."
npm run build

echo "📦 Syncing to server..."
ssh "$SERVER" "mkdir -p $REMOTE_PATH"
rsync -avz --delete "$LOCAL_DIST/" "$SERVER:$REMOTE_PATH/"

echo "⚙️  Configuring server routes..."
ssh "$SERVER" bash << 'ENDSSH'
# Ensure nginx or the Express server serves /safecycle from the built dist
# The server at /var/www/inferencevision/server/index.ts needs a static route

# If using nginx:
if command -v nginx &>/dev/null; then
  # Add location block for safecycle if not present
  NGINX_CONF="/etc/nginx/sites-available/inferencevision"
  if ! grep -q "safecycle" "$NGINX_CONF" 2>/dev/null; then
    echo "⚠️  Add this to your nginx config manually:"
    echo "  location /safecycle { root /var/www/inferencevision; try_files \$uri \$uri/ /safecycle/index.html; }"
  fi
fi

# If using PM2 / Node express:
if command -v pm2 &>/dev/null; then
  pm2 restart all --silent 2>/dev/null || true
fi

echo "✅ Server updated"
ENDSSH

echo ""
echo "✅ SafeCycle PWA deployed!"
echo "   → https://inferencevision.store/safecycle"
echo "   → Update EXPO_PUBLIC_WEB_APP_URL in mobile/.env.local"
