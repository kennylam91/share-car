-- Add FCM token column to profiles for driver push notifications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
