# Frontend Setup Guide

## Environment Variables Setup

To use this frontend, you need to set up the following environment variables:

### 1. Create `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:10000
```

### 2. Get Supabase Credentials:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. For Vercel Deployment:

Add these environment variables in Vercel Dashboard:
- Go to your project settings
- Navigate to Environment Variables
- Add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` (your backend URL)

### 4. Run the application:

```bash
npm install
npm run dev
```

## Features:

- ✅ **Supabase Authentication** - Login/Signup
- ✅ **Dashboard** - Subaccount management
- ✅ **Responsive Design** - Mobile friendly
- ✅ **Error Handling** - Proper error messages
- ✅ **Toast Notifications** - User feedback

## Troubleshooting:

If you see "Supabase is not configured" error:
1. Check if environment variables are set correctly
2. Restart the development server
3. Clear browser cache
4. Check browser console for detailed errors
