# Quick Start: Enable Google OAuth

## Current Status

✅ **Backend API** - Fully implemented (`/api/auth/google` endpoint ready)
✅ **Frontend UI** - Fully implemented (Google Sign-In button ready)
❌ **Configuration** - Missing Google Client ID

## Why You Don't See the Google Button

The Google Sign-In button is **conditionally rendered** and only shows when the environment variable `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set. This is a security best practice.

## Setup Instructions

### Option 1: Quick Test (Without Real Google OAuth)

If you just want to test the app without Google OAuth for now:

1. The Google button simply won't appear
2. Users can still login with email/password
3. You can add Google OAuth later when needed

### Option 2: Enable Google OAuth (Full Setup)

Follow these steps to enable the Google Sign-In button:

#### Step 1: Get Google Client ID

1. Follow the complete guide in `OAUTH_SETUP_GUIDE.md` 
2. Or quick steps:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Copy your Client ID (looks like: `xxxx.apps.googleusercontent.com`)

#### Step 2: Configure Frontend

Edit `frontend/.env.local` (file already created):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Step 3: Configure Backend

Edit `backend/TherapyNotes.API/.env` (file already created with placeholder):

```env
Google__ClientId=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

#### Step 4: Restart Docker Containers

```bash
docker compose down
docker compose up --build -d
```

#### Step 5: Verify

1. Go to http://localhost:3000/login
2. You should now see the **"Sign in with Google"** button
3. Below the email/password form, there's a divider that says "Or continue with"
4. The Google button appears with the Google logo

## What's Already Implemented

### Backend (`/api/auth/google`)
- ✅ Validates Google ID tokens
- ✅ Creates or finds user by email
- ✅ Supports MFA (if enabled)
- ✅ Returns JWT token
- ✅ Supports both "therapist" and "parent" roles

### Frontend
- ✅ Google OAuth button on login page
- ✅ Google OAuth button on signup page
- ✅ Handles successful authentication
- ✅ Handles MFA flow if enabled
- ✅ Redirects to correct dashboard based on role
- ✅ Error handling

### Security Features
- ✅ Server-side token validation
- ✅ No client-side trust
- ✅ OAuth provider tracking in database
- ✅ Can be linked with existing accounts

## Testing Without Google OAuth

You can test the entire application without Google OAuth:

1. **Register** with email/password: http://localhost:3000/signup
2. **Login**: http://localhost:3000/login
3. **Enable MFA**: Go to Settings after logging in
4. **Test all features**: Create clients, sessions, goals, etc.

The Google OAuth is an **optional enhancement** - the core app works perfectly without it!

## Where to Find Implementation

- **Backend**: `backend/TherapyNotes.API/Controllers/AuthController.cs` (line 189)
- **Frontend Login**: `frontend/app/login/page.tsx` (line 136-149)
- **Frontend Signup**: `frontend/app/signup/page.tsx` (similar)
- **API Client**: `frontend/lib/api-client.ts` (`googleLogin` method)
- **Full Setup Guide**: `OAUTH_SETUP_GUIDE.md`

## Quick Check

Run this to see if Google button should appear:

```bash
# Check if env variable is set
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

If it shows your Client ID, the button will appear. If empty, it won't show.

