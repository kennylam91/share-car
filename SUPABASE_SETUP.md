# Supabase Setup Guide

This guide will help you set up your Supabase backend for the Share Car application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Enter project details:
   - Name: share-car
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Wait for the project to be created

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
3. Add these to your `.env.local` file:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the SQL

Alternatively, you can copy this SQL directly:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('passenger', 'driver')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('offer', 'request')),
  routes TEXT[] NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

## 4. Configure Facebook OAuth

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Consumer" as the app type
4. Fill in app details and create the app
5. In the app dashboard, add "Facebook Login" product

### Step 2: Get Facebook Credentials

1. Go to **Settings > Basic** in your Facebook App
2. Copy your **App ID** and **App Secret**

### Step 3: Configure Supabase

1. In Supabase dashboard, go to **Authentication > Providers**
2. Find and enable **Facebook**
3. Enter your Facebook App ID and App Secret
4. Copy the **Callback URL** shown (it will look like: `https://xxxxx.supabase.co/auth/v1/callback`)

### Step 4: Configure Facebook App

1. Go back to your Facebook App
2. Go to **Facebook Login > Settings**
3. Add the Supabase callback URL to **Valid OAuth Redirect URIs**
4. For development, also add: `http://localhost:3000/auth/callback`
5. Save changes

### Step 5: Add App Domains (for production)

1. In Facebook App, go to **Settings > Basic**
2. Add your domains:
   - For Vercel: `your-app.vercel.app`
   - For Supabase: `your-project.supabase.co`
3. Add privacy policy and terms of service URLs (required for production)

## 5. Test Your Setup

1. Run your Next.js app locally:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Continue with Facebook"

4. You should be redirected to Facebook login

5. After login, you should be redirected to the onboarding page

## Troubleshooting

### "supabaseUrl is required" error

- Make sure `.env.local` exists with correct values
- Restart your dev server after creating `.env.local`

### Facebook login not working

- Check that callback URL in Facebook app matches Supabase
- Ensure Facebook app is not in "Development Mode" for production
- Verify App ID and Secret are correct in Supabase

### Database errors

- Check SQL was executed successfully
- Verify RLS policies are enabled
- Check table structure in Supabase Table Editor

## Database Schema Overview

### profiles table

- `id`: UUID (Primary Key, references auth.users)
- `email`: TEXT
- `name`: TEXT
- `avatar_url`: TEXT (nullable)
- `role`: TEXT ('passenger', 'driver', or 'admin')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### posts table

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `post_type`: TEXT ('offer' or 'request')
- `routes`: TEXT[] (array of routes: 'HN-HP', 'HN-QN', 'QN-HP')
- `details`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Setting Up Admin Users

The admin role provides access to the admin dashboard with platform statistics and the ability to create anonymous posts.

### Apply Admin Role Migration

1. Run the admin role migration in your Supabase SQL Editor:

   ```sql
   -- Execute the contents of supabase/migrations/003_add_admin_role.sql
   ```

2. Or copy and paste this SQL directly:

   ```sql
   -- Drop the existing constraint
   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
   
   -- Add new constraint that includes 'admin'
   ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
     CHECK (role IN ('passenger', 'driver', 'admin'));
   
   -- Create a policy for admin to create posts on behalf of others
   DROP POLICY IF EXISTS "Admins can create posts for anyone" ON posts;
   CREATE POLICY "Admins can create posts for anyone" ON posts
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
       )
     );
   ```

### Make a User Admin

To grant admin access to a user:

1. Go to **SQL Editor** in Supabase
2. Run the following SQL (replace `USER_EMAIL` with the actual email):

   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'USER_EMAIL';
   ```

3. The user will need to log out and log back in to access the admin dashboard at `/admin`

### Admin Dashboard Features

- **Platform Statistics**: View counts of passengers, drivers, and total posts
- **Anonymous Post Creation**: Create posts that will be displayed as "Anonymous" to all users
- **Role-Based Access Control**: Only users with admin role can access the dashboard
