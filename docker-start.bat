@echo off
REM Build and start all containers

echo Building Docker containers...

REM Build images
docker-compose build

REM Start all services
echo Starting all services...
docker-compose up -d

REM Wait for services to be healthy
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Show status
echo.
echo Container Status:
docker-compose ps

echo.
echo All services started!
echo.
echo Access the application:
echo   - Frontend: http://localhost:3060
echo   - Backend API: http://localhost:5000
echo   - Swagger: http://localhost:5000/swagger
echo   - MinIO Console: http://localhost:9001
echo   - MongoDB: mongodb://localhost:27019
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop:
echo   docker-compose down

