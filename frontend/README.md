# TherapyNotes Frontend

Next.js 16 frontend application for TherapyNotes - Mobile-first therapy session management platform.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** React Context API
- **API Client:** Custom type-safe wrapper

## ✨ Key Features

- **Mobile-First Quick Entry** - 30-second session documentation
- **Voice Input** - Browser Speech API (free voice-to-text)
- **Camera Capture** - HTML5 Camera API with compression
- **PWA Support** - Installable on mobile/desktop
- **Responsive Design** - Works on all devices
- **Dark Mode** - System preference support

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Therapist dashboard
│   ├── parent/            # Parent portal
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable React components
│   ├── VoiceInput.tsx     # Browser Speech API integration
│   ├── CameraCapture.tsx  # HTML5 Camera API
│   ├── QuickEntryModal.tsx # Mobile quick entry form
│   └── ...
├── lib/                   # Utilities and helpers
│   ├── api-client.ts      # Type-safe API client
│   ├── auth-context.tsx   # Authentication context
│   └── types.ts           # TypeScript type definitions
└── types/                 # TypeScript declarations
    └── speech-recognition.d.ts
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3060`

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## 🎨 Components

### VoiceInput
Browser Speech API integration for free voice-to-text transcription.

**Features:**
- Real-time transcription
- Works on Chrome, Edge, Safari
- No API costs
- Inserts transcript into text fields

### CameraCapture
HTML5 Camera API for photo capture.

**Features:**
- Direct camera access (back camera on mobile)
- Image compression (reduces file size)
- File picker fallback
- Preview before upload

### QuickEntryModal
Mobile-optimized quick entry form for fast session documentation.

**Features:**
- Bottom sheet on mobile, modal on desktop
- Template quick select
- Activity chips
- Voice input integration
- Camera integration
- Remembers last template used

## 📱 Mobile Features

- **PWA Support** - Install as app on mobile
- **Touch-Optimized** - Large touch targets (44px minimum)
- **Bottom Sheet UI** - Native mobile feel
- **Camera Integration** - Direct camera access
- **Voice Input** - Hands-free documentation

## 🔧 Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📦 Key Dependencies

- `next` - Next.js framework
- `react` - React library
- `typescript` - TypeScript support
- `tailwindcss` - Utility-first CSS

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -f Dockerfile -t therapynotes-frontend .
docker run -p 3060:3000 therapynotes-frontend
```

## 📝 Notes

- Uses App Router (Next.js 13+)
- Server Components by default
- Client Components marked with `'use client'`
- Type-safe API client with auto token handling
