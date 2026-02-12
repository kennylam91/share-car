-- 008_add_facebook_post_fields.sql
-- Adds facebook_url and facebook_id fields to posts table, with unique index for duplicate prevention

ALTER TABLE posts
  ADD COLUMN facebook_url TEXT NULL,
  ADD COLUMN facebook_id TEXT NULL;

-- Unique index on facebook_id (only for non-null values)
CREATE UNIQUE INDEX idx_posts_facebook_id ON posts(facebook_id) WHERE facebook_id IS NOT NULL;