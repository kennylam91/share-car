-- 006_allow_anonymous_posts.sql
-- Allow unauthenticated users to create posts with NULL user_id
-- Update posts.user_id to be nullable and adjust FK constraint

BEGIN;

-- Add new RLS policy to allow anonymous post creation
CREATE POLICY "Anyone can create anonymous posts" ON posts
  FOR INSERT WITH CHECK (user_id = <passenger_user_id>);

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that includes 'admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('passenger', 'driver', 'admin', 'anonymous'));

COMMIT;
