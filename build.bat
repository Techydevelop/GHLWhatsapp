@echo off
echo 🚀 Starting build process...

echo 📦 Installing root dependencies...
npm install

echo 🔨 Building backend...
cd backend
npm install
npm run build
cd ..

echo ✅ Build completed successfully!
