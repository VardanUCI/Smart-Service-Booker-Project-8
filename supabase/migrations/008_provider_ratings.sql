-- Add rating and review_count columns to public.providers table
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0);
