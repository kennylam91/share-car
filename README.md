# Share Car - Ride Sharing Platform

A mobile-first ride-sharing web application built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Facebook OAuth Authentication** - Secure login with Facebook
- 👤 **User Onboarding** - Mandatory role selection (Passenger/Driver) on first sign-in
- 🛣️ **Predefined Routes** - HN-HP, HN-QN, and QN-HP
- 🧑‍🦱 **Passenger Dashboard** - View driver offers and create ride requests
- 🚗 **Driver Dashboard** - View passenger requests and offer rides
- 📝 **Multi-Route Posting** - Select multiple routes and provide ride details
- 📱 **Mobile-First Design** - Responsive UI optimized for mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Deployment**: Vercel
- **Authentication**: Facebook OAuth via Supabase

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- A Supabase account
- A Facebook Developer account

### 1. Clone the Repository

```bash
git clone https://github.com/kennylam91/share-car.git
cd share-car
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key

#### Create Database Tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('passenger', 'driver')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
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
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### 4. Set Up Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. In Supabase Dashboard, go to Authentication > Providers > Facebook
5. Enable Facebook provider and add your Facebook App ID and App Secret
6. Copy the callback URL from Supabase and add it to your Facebook App settings

### 5. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Usage

1. **Login**: Click "Continue with Facebook" on the login page
2. **Onboarding**: Select your role (Passenger or Driver)
3. **Passenger Flow**:
   - View driver offers filtered by route
   - Create ride requests with multiple routes
4. **Driver Flow**:
   - View passenger requests filtered by route
   - Post ride offers with multiple routes

## Project Structure

```
share-car/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── callback/
│   ├── onboarding/
│   ├── passenger/
│   ├── driver/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase-client.ts
│   ├── supabase-server.ts
│   └── constants.ts
├── types/
│   └── index.ts
├── public/
│   └── manifest.json
└── README.md
```

## License

MIT
