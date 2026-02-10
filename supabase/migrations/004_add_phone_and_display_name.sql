-- Add phone and display_name fields to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to use name as display_name if not set
UPDATE profiles SET display_name = name WHERE display_name IS NULL;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

