-- Migration: Remove shareable_link column from campaigns (use shareable_token for public dashboard)
ALTER TABLE public.campaigns
  DROP COLUMN IF EXISTS shareable_link;
