-- 009_add_details_length_constraint.sql
-- Adds a constraint to ensure posts.details has at least 10 characters

ALTER TABLE posts
  ADD CONSTRAINT posts_details_min_length CHECK (char_length(details) >= 10);
