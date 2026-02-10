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
