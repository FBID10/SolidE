#!/bin/bash
set -e

# Build the frontend app
cd /workspaces/SolidE/my-fashion-app
npm install
npm run build

# Inject VITE_API_URL into dist/index.html
if [ ! -z "$VITE_API_URL" ]; then
  sed -i "s|%VITE_API_URL%|$VITE_API_URL|g" dist/index.html
else
  sed -i "s|%VITE_API_URL%|http://localhost:9090/api|g" dist/index.html
fi

# Build admin panel
cd /workspaces/SolidE/my-fashion-admin/admin-panel
npm install
npm run build

# Inject VITE_API_URL into dist/index.html
if [ ! -z "$VITE_API_URL" ]; then
  sed -i "s|%VITE_API_URL%|$VITE_API_URL|g" dist/index.html
else
  sed -i "s|%VITE_API_URL%|http://localhost:9090/api|g" dist/index.html
fi

echo "Build complete with API_URL: ${VITE_API_URL:-http://localhost:9090/api}"
