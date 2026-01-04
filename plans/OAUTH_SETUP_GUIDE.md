# Google OAuth Setup Guide

This guide will help you configure Google OAuth for the Regulie application.

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Regulie"
4. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: Regulie
   - User support email: your email
   - Developer contact email: your email
   - Click "Save and Continue"
   - Scopes: Add `email` and `profile`
   - Click "Save and Continue"
   - Test users: Add yourself
   - Click "Save and Continue"

4. Back to creating OAuth client ID:
   - Application type: **Web application**
   - Name: Regulie Web Client
   
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/login
   http://localhost:3000/signup
   https://yourdomain.com/login
   https://yourdomain.com/signup
   ```

7. Click "Create"
8. Copy the **Client ID** (you'll need this)

### 4. Add to Environment Variables

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Backend (`backend/Regulie.API/.env`):**
```env
Google__ClientId=your-client-id-here.apps.googleusercontent.com
```

---

## Testing

1. Start your application
2. Go to the login page
3. Click "Sign in with Google"
4. You should see the Google OAuth consent screen
5. Sign in with your test Google account
6. You should be redirected back and logged in

---

## Security Checklist

- [ ] OAuth Client ID is stored in environment variables, not committed to git
- [ ] Production domains use HTTPS
- [ ] OAuth redirect URLs match exactly what's configured in Google Cloud Console
- [ ] Test users are added to Google OAuth consent screen during development
- [ ] Rate limiting is configured for OAuth endpoints
- [ ] MFA is available as an option for users

---

## Troubleshooting

### Google OAuth Issues

- **"redirect_uri_mismatch"**: Check that your redirect URI exactly matches what's configured in Google Cloud Console
- **"invalid_client"**: Verify your Client ID is correct
- **"access_denied"**: Make sure you've added yourself as a test user

---

## Next Steps

1. Complete the Google OAuth setup
2. Test the OAuth flow thoroughly
3. Document the configuration in your team's internal docs
4. Set up monitoring for OAuth login failures
5. Consider implementing additional OAuth providers (Microsoft, GitHub) if needed

