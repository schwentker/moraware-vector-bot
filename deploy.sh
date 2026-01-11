#!/bin/bash

# 1. Build the React app
echo "📦 Building React app..."
npm run build

# 2. Define the path to your Hugo static folder
# ADJUST THIS PATH to point to your local sandboxlabsai repo folder
HUGO_STATIC_PATH="/Users/schwentker/dev/sblai/sandboxlabsai/static/moraware-vector"

# 3. Clean and Copy
echo "🚚 Syncing files to Hugo..."
rm -rf "$HUGO_STATIC_PATH"/*
cp -r dist/* "$HUGO_STATIC_PATH/"

echo "✅ Sync Complete! Now push your Hugo repo to deploy."