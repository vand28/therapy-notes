@echo off
REM Regulie Quick Start Script for Windows

echo Starting Regulie...

REM Check if docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start infrastructure
echo Starting MongoDB and MinIO...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo Infrastructure ready!
echo    - MongoDB: mongodb://localhost:27019
echo    - MinIO: http://localhost:9000 (console: http://localhost:9001)
echo.

REM Instructions for backend
echo To start the backend:
echo    cd backend\Regulie.API
echo    dotnet run
echo.

REM Instructions for frontend
echo To start the frontend:
echo    cd frontend
echo    npm install
echo    npm run dev
echo.

echo Once both are running, visit http://localhost:3060

