#!/bin/bash

# Install dependencies and build the project
echo "🚀 Installing dependencies and building WhatsApp + LeadConnector integration..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

# Build backend
echo "🔨 Building backend..."
cd ../backend && npm run build

# Build frontend
echo "🔨 Building frontend..."
cd ../frontend && npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables"
echo "2. Deploy backend to Render/Railway/VPS"
echo "3. Deploy frontend to Vercel"
echo "4. Configure your Supabase database"
echo "5. Set up LeadConnector Marketplace app"
