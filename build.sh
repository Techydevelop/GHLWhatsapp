#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
cd backend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
