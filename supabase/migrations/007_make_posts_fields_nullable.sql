-- 006_make_posts_fields_nullable.sql
-- Make selected posts columns nullable: routes, post_type, user_id

BEGIN;

-- Drop NOT NULL constraints so these fields can be optional
ALTER TABLE public.posts
  ALTER COLUMN routes DROP NOT NULL,
  ALTER COLUMN post_type DROP NOT NULL;

COMMIT;
