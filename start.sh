#!/bin/bash

# TherapyNotes Quick Start Script

echo "🚀 Starting TherapyNotes..."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start infrastructure
echo "📦 Starting MongoDB and MinIO..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

echo "✅ Infrastructure ready!"
echo "   - MongoDB: mongodb://localhost:27019"
echo "   - MinIO: http://localhost:9000 (console: http://localhost:9001)"
echo ""

# Instructions for backend
echo "🔧 To start the backend:"
echo "   cd backend/TherapyNotes.API"
echo "   dotnet run"
echo ""

# Instructions for frontend
echo "💻 To start the frontend:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""

echo "🎉 Once both are running, visit http://localhost:3060"

