-- 005_add_contact_fields.sql
-- Add Facebook and Zalo to profiles and per-post contact override fields

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS zalo_url TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_zalo_url TEXT;

COMMIT;
