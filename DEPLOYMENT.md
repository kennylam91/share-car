# Deployment Guide

## Deploy to Vercel

### Prerequisites
- A Vercel account
- A GitHub account
- Supabase project set up with database tables
- Facebook OAuth configured in Supabase

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   Add the following environment variables in Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a production URL (e.g., `your-app.vercel.app`)

5. **Update Facebook OAuth Redirect URL**
   - Go to your Facebook App settings
   - Add your Vercel URL to the valid OAuth redirect URIs
   - The format should be: `https://your-supabase-project.supabase.co/auth/v1/callback`

6. **Test Your Deployment**
   - Visit your Vercel URL
   - Test the Facebook login flow
   - Create test posts as both passenger and driver

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |

## Vercel Configuration

The project uses the following Vercel defaults:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created in Supabase
- [ ] Facebook OAuth provider enabled
- [ ] Facebook App redirect URLs updated
- [ ] Test login flow
- [ ] Test passenger dashboard
- [ ] Test driver dashboard
- [ ] Test creating posts
- [ ] Test route filtering

## Troubleshooting

### Build Errors
- Check that all environment variables are set correctly
- Ensure package.json dependencies are up to date
- Review Vercel build logs

### Authentication Issues
- Verify Facebook OAuth is configured in Supabase
- Check that redirect URLs match in Facebook App settings
- Ensure environment variables are correctly set

### Database Errors
- Verify database tables are created
- Check Row Level Security policies are in place
- Ensure Supabase credentials are correct
