-- Migration: Remove target_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, goal_visitors, goal_duration, goal_bounce_rate from campaigns
ALTER TABLE public.campaigns
  DROP COLUMN IF EXISTS target_url,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS utm_term,
  DROP COLUMN IF EXISTS utm_content,
  DROP COLUMN IF EXISTS goal_visitors,
  DROP COLUMN IF EXISTS goal_duration,
  DROP COLUMN IF EXISTS goal_bounce_rate;

-- Add description column (optional, if not already present)
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS description TEXT;
