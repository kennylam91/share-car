-- Change posts.user_id to reference profiles(id) instead of auth.users(id)
-- 
-- Current state:
--   profiles.id → auth.users(id) 
--   posts.user_id → auth.users(id)  [bypasses profiles]
--
-- After this migration:
--   profiles.id → auth.users(id)
--   posts.user_id → profiles(id) → auth.users(id)  [proper chain]
--
-- This is valid and recommended! Posts should reference your app's profiles table,
-- not bypass it to reference auth.users directly. The cascade still works correctly.

-- Drop the old constraint that references auth.users
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Add new constraint that references profiles
ALTER TABLE posts 
  ADD CONSTRAINT posts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

-- Now Supabase can understand the relationship for queries like:
-- .select("*, profile:profiles(*)")
