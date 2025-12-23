# Docker Deployment Guide

This guide covers deploying TherapyNotes using Docker containers.

## 📦 What's Included

### Docker Images

1. **Backend** (`backend/Dockerfile`)
   - Multi-stage build for optimal size
   - .NET 10 Runtime (ASP.NET)
   - Exposes port 8080

2. **Frontend** (`frontend/Dockerfile`)
   - Production-optimized Next.js build
   - Node.js 20 Alpine
   - Standalone output for minimal size
   - Exposes port 3000

3. **Frontend Dev** (`frontend/Dockerfile.dev`)
   - Hot reload for development
   - Volume-mounted for live changes

## 🚀 Quick Start

### Development (Everything in Docker)

```bash
# Start all services
./docker-start.sh        # Linux/Mac
docker-start.bat         # Windows

# Or manually
docker-compose up -d
```

This starts:
- MongoDB (port 27019)
- MinIO (port 9000, console 9001)
- Backend API (port 5000)
- Frontend (port 3060)

### Production

```bash
# 1. Copy and configure environment
cp .env.production.example .env
# Edit .env with your production values

# 2. Build and start
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Development (docker-compose.yml)

Backend connects to:
- MongoDB: `mongodb://mongodb:27017`
- MinIO: `http://minio:9000`

Frontend connects to:
- Backend: `http://localhost:5000` (accessible from host)

**Note:** Frontend runs on port 3060 (mapped from internal port 3000 to avoid conflicts)

**Note:** Frontend runs on port 3060 (mapped from internal port 3000 to avoid conflicts)

### Production (docker-compose.prod.yml)

Uses environment variables from `.env`:
- `JWT_SECRET` - Secure random string
- `MONGODB_URI` - MongoDB connection string
- `STORAGE_ENDPOINT` - S3/R2 endpoint
- `STORAGE_ACCESS_KEY` - S3 access key
- `STORAGE_SECRET_KEY` - S3 secret key
- `API_URL` - Public API URL

## 🐳 Docker Commands

### Build

```bash
# Build development images
docker-compose build

# Build production images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Run

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start and follow logs
docker-compose up

# Start with rebuild
docker-compose up -d --build
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stop/Remove

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes (⚠️ deletes data)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Inspect

```bash
# List running containers
docker-compose ps

# Container details
docker-compose ps backend

# Execute command in container
docker-compose exec backend dotnet --version
docker-compose exec frontend npm --version

# Open shell in container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🌐 Deploying to Cloud Platforms

### AWS ECS/Fargate

1. Push images to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag therapynotes-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/therapynotes-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/therapynotes-backend:latest
```

2. Create ECS Task Definition with environment variables
3. Create ECS Service

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT-ID/therapynotes-backend backend/
gcloud builds submit --tag gcr.io/PROJECT-ID/therapynotes-frontend frontend/

# Deploy
gcloud run deploy therapynotes-backend \
  --image gcr.io/PROJECT-ID/therapynotes-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy therapynotes-frontend \
  --image gcr.io/PROJECT-ID/therapynotes-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Railway

1. Connect GitHub repository
2. Railway auto-detects Dockerfiles
3. Set environment variables in dashboard
4. Deploy automatically on push

### DigitalOcean App Platform

1. Create new app from GitHub
2. Select "Dockerfile" as source
3. Configure environment variables
4. Deploy

### Any VPS (Docker Compose)

```bash
# 1. SSH to server
ssh user@your-server.com

# 2. Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone repository
git clone <your-repo> /opt/therapynotes
cd /opt/therapynotes

# 4. Configure environment
cp .env.production.example .env
nano .env  # Edit with production values

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Setup reverse proxy (Nginx/Caddy)
# Point domain to server, configure SSL
```

## 🔒 Security Best Practices

### 1. Use Secrets Management

Instead of `.env` files, use:
- AWS Secrets Manager
- Google Secret Manager
- Azure Key Vault
- Kubernetes Secrets

### 2. Non-root User

Both Dockerfiles run as non-root users:
- Backend: Uses aspnet user
- Frontend: Uses nextjs user (UID 1001)

### 3. Read-only Filesystem

Add to docker-compose.prod.yml:
```yaml
services:
  backend:
    read_only: true
    tmpfs:
      - /tmp
```

### 4. Network Isolation

```yaml
services:
  backend:
    networks:
      - frontend-network
      - backend-network
  
  mongodb:
    networks:
      - backend-network  # Not exposed to frontend
```

### 5. Health Checks

Add to docker-compose.prod.yml:
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 📊 Monitoring

### View Resource Usage

```bash
# All containers
docker stats

# Specific container
docker stats therapynotes-backend
```

### Container Logs with External Tools

```bash
# Send logs to Datadog
docker-compose logs -f | datadog-agent

# Send to CloudWatch
awslogs get /docker/therapynotes-backend ALL
```

## 🔄 Updates and Rollbacks

### Rolling Update

```bash
# 1. Pull latest code
git pull

# 2. Build new images
docker-compose -f docker-compose.prod.yml build

# 3. Recreate containers with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

### Rollback

```bash
# 1. Check previous images
docker images | grep therapynotes

# 2. Tag previous image as latest
docker tag therapynotes-backend:old therapynotes-backend:latest

# 3. Restart container
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
netstat -tulpn | grep 5000

# Inspect container
docker inspect therapynotes-backend
```

### Can't connect to MongoDB

```bash
# Test MongoDB connection from backend container
docker-compose exec backend bash
apt-get update && apt-get install -y iputils-ping
ping mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Frontend can't reach backend

```bash
# Check network
docker network inspect therapynotes-network

# Verify API URL
docker-compose exec frontend env | grep API_URL
```

### Out of disk space

```bash
# Clean up unused images
docker image prune -a

# Clean up all unused resources
docker system prune -a --volumes

# Check disk usage
docker system df
```

## 📈 Performance Optimization

### Multi-stage Builds

Already implemented in both Dockerfiles to minimize image size.

### Build Cache

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker-compose build

# Cache from registry
docker-compose build --cache-from therapynotes-backend:latest
```

### Limit Resources

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

Need help? Check the main [README.md](../README.md) or open an issue.

