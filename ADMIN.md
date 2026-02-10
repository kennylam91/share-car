# Admin Dashboard

The Share Car application includes an admin dashboard for platform management.

## Features

### 1. Platform Statistics

The admin dashboard displays real-time statistics:

- **Number of Passengers**: Total users with passenger role
- **Number of Drivers**: Total users with driver role
- **Total Posts**: All ride offers and requests in the system

### 2. Anonymous Post Creation

Admins can create posts anonymously by providing:

- Post type (Offer or Request)
- Routes (one or more routes from available options)
- Post details/description

These posts will be attributed to the admin's own user ID but displayed as "Anonymous" to all users viewing the posts.

## Setup Instructions

### 1. Apply Database Migration

Run the migration to add admin role support:

```sql
-- Execute in Supabase SQL Editor
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('passenger', 'driver', 'admin'));

DROP POLICY IF EXISTS "Admins can create posts for anyone" ON posts;
CREATE POLICY "Admins can create posts for anyone" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### 2. Create Admin User

To grant admin access to a user:

```sql
-- Replace 'admin@example.com' with the actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 3. Access Admin Dashboard

1. Log in with an admin account
2. Navigate to `/admin`
3. The dashboard will display platform statistics and the post creation form

## Access Control

- Only users with `role = 'admin'` can access the admin dashboard
- Non-admin users attempting to access `/admin` will be redirected to the onboarding page
- Unauthenticated users will be redirected to the login page

## Creating Anonymous Posts

1. Click "New Post" button on the admin dashboard
2. Select the post type (Offering Ride or Requesting Ride)
3. Choose one or more routes
4. Add post details
5. Click "Create Post"

The post will be created using your admin account ID but will be displayed as "Anonymous" to all users browsing the driver or passenger pages.

## Security Notes

- Admin role is protected at the database level via Row Level Security policies
- Admin API endpoints verify the user's role before processing requests
- All admin actions are performed with proper authentication checks

## File Structure

```
app/
  admin/
    page.tsx              # Server component with role protection
    AdminClient.tsx       # Client component with UI and logic
  api/
    admin/
      stats/
        route.ts          # API endpoint for statistics
      posts/
        route.ts          # API endpoint for creating posts
supabase/
  migrations/
    003_add_admin_role.sql  # Database migration for admin role
types/
  index.ts              # Updated UserRole type definition
```
