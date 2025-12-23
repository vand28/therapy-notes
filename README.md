# TherapyNotes - Modern Session Management for Therapists

A full-stack therapy session documentation platform built for OT and Speech therapists. Features include smart templates, goal tracking, parent portals, and cloud-agnostic storage.

## 🚀 Tech Stack

**Backend:**
- .NET Core 10 Web API
- MongoDB (with indexes)
- S3-compatible storage (Cloudflare R2/AWS S3/MinIO)
- JWT Authentication
- BCrypt password hashing

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

**Infrastructure:**
- Docker & Docker Compose
- Cloud-agnostic architecture

## ✨ Features

- ✅ **Smart Templates** - Pre-built templates for common session types (fine motor, sensory, communication, etc.)
- ✅ **Client Management** - Track clients, diagnosis, and goals
- ✅ **Session Documentation** - Quick session notes with activity tracking
- ✅ **Goal Progress** - Visual progress tracking with percentage completion
- ✅ **Parent Portal** - Read-only access for parents to view shared sessions
- ✅ **Media Uploads** - Attach photos/videos to sessions
- ✅ **Role-based Access** - Separate therapist and parent accounts
- ✅ **Subscription Tiers** - Free, Professional, and Premium tiers

## 📋 Prerequisites

- Node.js 20+ and npm
- .NET SDK 10.0
- Docker & Docker Compose
- MongoDB (local or Atlas)
- S3-compatible storage (MinIO for local dev)

## 🛠️ Quick Start

### Option 1: Docker (Recommended - Everything in containers)

```bash
# Clone the repository
git clone <repository-url>
cd therapy-notes-saas

# Start everything with one command
./docker-start.sh        # Linux/Mac
docker-start.bat         # Windows

# Or manually
docker-compose up -d
```

That's it! Everything runs in containers:
- Frontend: `http://localhost:3060`
- Backend: `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`
- MinIO: `http://localhost:9001`
- MongoDB: `mongodb://localhost:27019`
- MongoDB: `mongodb://localhost:27019`

### Option 2: Local Development (Run services individually)

#### 1. Start Infrastructure Only

```bash
# Start only MongoDB and MinIO
docker-compose up -d mongodb minio minio-init
```

#### 2. Backend Setup

```bash
cd backend/TherapyNotes.API

# Update appsettings.Development.json with your settings (already configured for local dev)

# Run the API
dotnet run
```

API will be available at `http://localhost:5000`
Swagger docs at `http://localhost:5000/swagger`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run the frontend
npm run dev
```

Frontend will be available at `http://localhost:3060`

#### 4. Access the Application

- Open `http://localhost:3060`
- Sign up for a new therapist account
- Start creating clients and sessions!

MinIO Console: `http://localhost:9001` (minioadmin / minioadmin123)
MongoDB: `mongodb://localhost:27019`

## 📁 Project Structure

```
therapy-notes-saas/
├── backend/
│   ├── Dockerfile                     # Production Docker image
│   ├── TherapyNotes.API/              # Web API controllers
│   ├── TherapyNotes.Core/             # Domain models & interfaces
│   └── TherapyNotes.Infrastructure/   # MongoDB, S3, JWT services
├── frontend/
│   ├── Dockerfile                     # Production Docker image
│   ├── Dockerfile.dev                 # Development with hot reload
│   ├── app/                           # Next.js pages
│   ├── lib/                           # API client & utilities
│   └── components/                    # Reusable components
├── docker-compose.yml                 # Development setup
├── docker-compose.prod.yml            # Production setup
└── README.md
```

## 🐳 Docker Commands

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Remove volumes (fresh start)
docker-compose down -v
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔑 Environment Variables

### Backend (.NET)

Create `appsettings.Development.json` or use environment variables:

```json
{
  "JWT": {
    "Secret": "your-secret-key-min-32-characters",
    "ExpiryHours": "24"
  },
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "therapynotes"
  },
  "Storage": {
    "Endpoint": "http://localhost:9000",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin123",
    "BucketName": "therapy-notes",
    "Region": "us-east-1"
  }
}
```

### Frontend (Next.js)

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🗄️ Database Schema

The application uses MongoDB with the following collections:

- **users** - Therapist and parent accounts
- **clients** - Client profiles with goals
- **sessions** - Session notes and activities
- **templates** - System and custom templates

6 system templates are auto-seeded on first run.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/invite-parent` - Invite parent to client

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `POST /api/clients/{id}/goals` - Add goal

### Sessions
- `GET /api/sessions?clientId={id}` - Get sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/{id}` - Get session details
- `PUT /api/sessions/{id}` - Update session
- `DELETE /api/sessions/{id}` - Delete session

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates?category={category}` - Filter by category
- `POST /api/templates` - Create custom template

### Media
- `POST /api/media/upload` - Upload file
- `GET /api/media/{fileKey}` - Get file URL
- `DELETE /api/media/{fileKey}` - Delete file

## 🚢 Deployment

### Docker Deployment (Any Platform)

1. **Build production images:**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Configure environment variables:**
   - Copy `.env.production.example` to `.env`
   - Fill in your production values (MongoDB, S3, JWT secret)

3. **Deploy to any platform supporting Docker:**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform
   - Railway
   - Any VPS with Docker

### Platform-Specific Deployments

#### Deploy Backend to Railway

1. **Backend** - Deploy to Railway, Azure App Service, or any .NET host
2. **Frontend** - Deploy to Vercel (zero config)
3. **MongoDB** - Use MongoDB Atlas (free tier available)
4. **Storage** - Use Cloudflare R2 (zero egress fees) or AWS S3

### Environment Variables for Production

Update connection strings to point to production services. Never commit secrets!

## 🎯 Subscription Tiers

- **Free** - 3 clients, 15 sessions/month, 250MB storage
- **Professional ($24/month)** - Unlimited clients & sessions, 5GB storage
- **Premium ($49/month)** - Everything + 20GB storage, voice-to-text, custom branding

## 🧪 Testing

Backend:
```bash
cd backend/TherapyNotes.API
dotnet test
```

Frontend:
```bash
cd frontend
npm test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines first.

## 📧 Support

For support, email support@therapynotes.app or open an issue.

---

**Built with ❤️ for therapy professionals**

