-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  campaign_id uuid,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT activity_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.campaign_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  date date NOT NULL,
  visitors integer DEFAULT 0,
  sessions integer DEFAULT 0,
  page_views integer DEFAULT 0,
  bounce_rate numeric,
  avg_session_duration integer,
  new_users integer DEFAULT 0,
  returning_users integer DEFAULT 0,
  conversion_rate numeric,
  top_sources jsonb,
  top_countries jsonb,
  top_devices jsonb,
  hourly_data jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_metrics_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  shareable_token text NOT NULL UNIQUE,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'archived'::text])),
  is_public boolean DEFAULT true,
  quality_score numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  integration_id uuid,
  description text,
  property_id text,
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT campaigns_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.integrations(id)
);
CREATE TABLE public.freelancer_access (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  freelancer_email text NOT NULL,
  access_token text NOT NULL UNIQUE,
  can_view_details boolean DEFAULT true,
  can_export_data boolean DEFAULT false,
  expires_at timestamp with time zone,
  last_accessed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT freelancer_access_pkey PRIMARY KEY (id),
  CONSTRAINT freelancer_access_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id)
);
CREATE TABLE public.google_analytics_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  account_id text NOT NULL,
  property_id text NOT NULL,
  property_name text,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_analytics_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT google_analytics_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.integrations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  platform_type text NOT NULL CHECK (platform_type = ANY (ARRAY['google_analytics'::text, 'shopify'::text, 'woocommerce'::text, 'javascript_pixel'::text, 'plausible'::text, 'fathom'::text, 'custom_api'::text])),
  platform_name text NOT NULL,
  credentials jsonb,
  config jsonb,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'error'::text])),
  last_sync_at timestamp with time zone,
  sync_error text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT integrations_pkey PRIMARY KEY (id),
  CONSTRAINT integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.oauth_temp_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_data jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT oauth_temp_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_temp_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar_url text,
  subscription_tier text DEFAULT 'free'::text CHECK (subscription_tier = ANY (ARRAY['free'::text, 'pro'::text, 'business'::text, 'enterprise'::text])),
  subscription_status text DEFAULT 'active'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])),
  subscription_ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);