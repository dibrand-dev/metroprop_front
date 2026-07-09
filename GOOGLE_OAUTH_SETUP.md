# Google OAuth Setup for MetroProp

Google OAuth login has been implemented on the login page. Follow these steps to set it up:

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy your **Client ID** and **Client Secret**

## Step 2: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
 
2. Update `.env.local` with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=http://localhost:3000
   ```

3. To generate a secure NEXTAUTH_SECRET:

   **On Windows (PowerShell):**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   **On Mac/Linux:**
   ```bash
   openssl rand -base64 32
   ```

## Step 3: Install Dependencies

The `next-auth` package has already been installed via npm. If needed, reinstall:

```bash
npm install
```

## Step 4: Test the Implementation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login
3. Click the **Google** button
4. Sign in with your Google account
5. You'll be redirected to `/dashboard` on successful login

## How It Works

- **Auth Handler**: `src/lib/auth.ts` - NextAuth configuration with Google provider
- **API Route**: `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API endpoints
- **Login Component**: `src/components/Login/UserSignin.tsx` - Updated with `signIn` function
- **Callback URL**: `/dashboard` (you may need to create this page or adjust as needed)

## Features Implemented

✅ Google OAuth login button with custom design  
✅ Loading state during authentication  
✅ Error handling with user feedback  
✅ Secure session management  
✅ JWT token storage  
✅ Automatic redirect on successful login  

## Files Created/Modified

- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `src/components/Login/UserSignin.tsx` - Updated login component
- `.env.local.example` - Environment variables template

## Troubleshooting

### Redirect URI Mismatch
Make sure the redirect URIs in Google Cloud Console match exactly with your NEXTAUTH_URL and your domain.

### Session Not Persisting
Ensure NEXTAUTH_SECRET is set correctly and NEXTAUTH_URL matches your deployment domain.

### Google Button Not Working
Check that:
- Environment variables are set in `.env.local`
- The Google OAuth credentials are valid
- The browser allows third-party cookies (required for OAuth)

## Production Deployment

When deploying to production:

1. Update `.env.local` values (or set them in your hosting platform's environment variables)
2. Update `NEXTAUTH_URL` to your production domain
3. Add production OAuth redirect URI in Google Cloud Console
4. Ensure `NEXTAUTH_SECRET` is set in production environment
